import { z } from "zod";
import {
    loginSchema,
    registerSchema,
    approveRequestSchema,
    resendVerificationSchema,
} from "../requests/auth.js";

export default class AuthController {
    authCore;
    userCore;

    constructor(authService, userService) {
        this.authCore = authService;
        this.userCore = userService;
    }

    async registerUser(req, res, next) {
        console.log("Registration request received:", req.body);

        const parsed = registerSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });
        
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const user = await this.authCore.registerUser(
                req.body.email,
                req.body.password,
            );

            console.log("User registered:", user.userId);
            res.status(201).json(user);
        } catch (err) {
            console.error("Registration error:", err);
            next(err);
        }
    }

    async loginUser(req, res, next) {
        console.log("Login request received:", req.body);

        const parsed = loginSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { body } = parsed.data;

        try {
            const user = await this.authCore.loginUser(
                body.email,
                body.password
            );

            console.log("User logged in:", user.userId);
            res.status(200).json(user);
        } catch (error) {
            console.error("Login error:", error);
            next(error);
        }
    }

    async verifyEmail(req, res, next) {
        const parsed = approveRequestSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { query } = parsed.data;
        const { token } = query;

        try {
            const user = await this.authCore.verifyEmailByToken(token);
            console.log("Email verified for user ID:", user.id);
            return res
                .status(200)
                .json({ message: "Email verified successfully" });
        } catch (err) {
            console.error("Email verification error:", err);
            next(err);
        }
    }

    // потом доделаю если время будет
    // async resendVerification(req, res, next) {
    //     const parsed = resendVerificationSchema.safeParse(req.body);
    //     if (!parsed.success) {
    //         console.log("Validation error:", parsed.error.issues);
    //         return res.status(400).json(z.treeifyError(parsed.error));
    //     }

    //     try {
    //         const user = req.user.id
    //             ? await this.userCore.getUserById(req.user.id)
    //             : await this.userCore.getUserByEmail(String(req.body.email).trim().toLowerCase());

    //         if (!user) {
    //             console.log("User not found for resend verification");
    //             return res.status(404).json({ message: "User not found" });
    //         }

    //         // короче тут еще чето наверное должно быть я хуй знает что я запутался чуть но вот
    //         // ну мне так кажется или я чето не понял
    //     } catch (err) {
    //         console.error("Resend verification error:", err);
    //         next(err);
    //     }
    // }


    async deleteUser(req, res, next) {
        if (!req.user?.id) {
            return res.status(401).send("User not found");
        }

        try {
            await this.authCore.deleteUser(req.user.id);

            return res.status(200).json({
                message: "User deleted successfully",
            });
        } catch (err) {
            console.error("Delete user:", err);
            next(err);
        }
    }
}
