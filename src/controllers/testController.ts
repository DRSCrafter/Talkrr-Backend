import {RequestHandler} from "express";

export const test: RequestHandler = async (req, res) => res.send("Success!");

