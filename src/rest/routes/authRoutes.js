import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

export default function createAuthRouter(authController) {
    const router = Router();

    router.post(
        "/register",
        async (req, res, next) => {
            await authController.registerUser(req, res, next)
        }
    );

    router.post(
        "/login",
        async (req, res, next) => {
            await authController.loginUser(req, res, next)
        }
    );

    router.get(
        "/verify-email",
        async (req, res, next) => {
            await authController.verifyEmail(req, res, next)
        }
    );

    router.delete(
        "/",
        authMiddleware,
        async (req, res, next) => {
            await authController.deleteUser(req, res, next)
        }
    )

    return router;
}
