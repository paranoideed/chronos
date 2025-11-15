import { Router } from "express";

export default function createAuthRouter(authController) {
    const router = Router();

    router.post("/register", (req, res, next) =>
        authController.registerUser(req, res, next)
    );

    router.post("/login", (req, res, next) =>
        authController.loginUser(req, res, next)
    );

    router.get("/verify-email", (req, res, next) =>
        authController.verifyEmail(req, res, next)
    );

    // router.post("/resend-verification", (req, res, next) =>
    //     authController.resendVerification(req, res, next)
    // );

    return router;
}
