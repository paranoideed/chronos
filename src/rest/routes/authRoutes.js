import { Router } from "express";

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

    return router;
}
