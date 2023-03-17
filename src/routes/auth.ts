import express from 'express';
import Joi from "joi";
import User from "../types/models/user";
import * as authController from '../controllers/authController';

const router = express.Router();

router.post("/", authController.signup);

export function validate(req: User) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(100).required(),
  });

  return schema.validate(req);
}

export default router;