import { Router } from 'express';
import { AuthController } from "../controllers/auth.js";
import authService from "../../domain/auth.js";

const authRouter = Router();
const authController = new AuthController(authService);

authRouter.post('/register',
    (req, res, next) => authController.register(req, res, next)
);

authRouter.post('/login',
    (req, res, next) => authController.login(req, res, next)
);

export default authRouter;