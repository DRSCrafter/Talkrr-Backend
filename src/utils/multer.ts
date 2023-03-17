import multer, {FileFilterCallback} from "multer";
import express from "express";

const storage = multer.diskStorage({});

const fileFilter = (req: express.Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/webp"
    )
        callback(null, true);
    else callback(null, false);
};

export default multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: fileFilter,
});
