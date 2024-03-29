import {ObjectId} from "mongodb";
import {Chat} from "../models/chat";
import {User} from "../models/user";
import {Message} from "../models/message";
import {Server} from "socket.io";
import * as http from "http";
import {ChatDocument} from "../types/models/chat";
import {UserDocument} from "../types/models/user";

export default (server: http.Server) => {
    const io = new Server(server, {cors: {origin: true, credentials: true}});

    const clients: { userID: string, socketID: string }[] = [];
    const findClientSet = (id: string) =>
        clients
            .filter((client) => client.userID == id)
            .map((client) => client.socketID);

    io.on("connection", (socket) => {
        socket.on("login", async (data) => {
            const client = {
                socketID: socket.id,
                userID: data,
            };

            clients.push(client);
            socket.emit("log", `${data} is now online...`);
        });

        socket.on("createRoom", async (data) => {
            const chat: ChatDocument | null = await Chat.findById(data.chatID);
            if (!chat) return socket.emit("log", `Chat doesn't exist`);

            const filterClients = clients.filter((client) =>
                data.userIDs.includes(client.userID)
            );
            const clientIDs = filterClients.map((client) => client.socketID);
            for (let clientID of clientIDs)
                io.to(clientID).emit("getRoom", chat._id.toString());
        });

        socket.on("watchRooms", async (data) =>
            socket.join(data)
        );

        socket.on("joinRoom", async (data) =>
            socket.join(`${data}room`)
        );

        socket.on("leaveRoom", async (data) =>
            socket.leave(`${data}room`)
        );

        socket.on("sendMessage", async (data) => {
            const chat: ChatDocument | null = await Chat.findById(data.chatID);
            if (!chat) return socket.emit("log", `Chat doesn't exist`);

            const message = new Message({
                sender: data.sender,
                content: data.content,
            });

            chat.messages.push(message);
            await chat.save();

            socket.broadcast
                .to(`${data.chatID}room`)
                .emit("message", {...message, chatID: data.chatID});

            socket.broadcast
                .to(data.chatID)
                .emit("notify", {chatID: data.chatID});
        });

        socket.on("deleteMessage", async (data) => {
            const chat: ChatDocument | null = await Chat.findById(data.chatID);
            if (!chat) return socket.emit("log", `Chat doesn't exist`);

            const messageId = new ObjectId(data.messageID);

            const index = chat.messages.findIndex((message) =>
                messageId.equals(message._id)
            );
            chat.messages.splice(index, 1);

            await chat.save();

            socket.broadcast.to(`${data.chatID}room`).emit("removeMessage", data);
        });

        socket.on("deleteChat", async (data) => {
            const chat: ChatDocument | null = await Chat.findByIdAndDelete(data.chatID);
            if (!chat) return socket.emit("log", `Chat doesn't exist`);

            for (let member of chat.members) {
                const user: UserDocument = (await User.findById(member))!;
                user.chats = user.chats.filter((chat) => chat.id != data.chatID);
                await user.save();

                const socketIDSet = findClientSet(member);
                for (let socketID of socketIDSet)
                    io.to(socketID).emit("removeChat", {chatID: data.chatID});
            }
        });
    });
};
