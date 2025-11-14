import { z } from 'zod';
import {
    loginSchema,
    registerSchema,
    approveRequestSchema,
    resendVerificationSchema,
} from "../requests/auth.js";

export default class AuthController {
    authCore;
    userCore;

    constructor(service, userService) {
        this.authCore = service;
        this.userCore = userService;
    }

    async registerUser(req, res, next) {
        console.log("Registration request received:", req.body);

        const parsed = registerSchema.safeParse({req});
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const user = await this.authCore.registerUser(req.body.email, req.body.password);
            console.log("User registered:", user.userId);
            res.status(201).json(user);
        } catch (err) {
            console.error("Registration error:", err);
            next(err);
        }
    }

    async loginUser(req, res, next) {
        console.log("Login request received:", req.body);

        const parsed = loginSchema.safeParse(req);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const user = await this.authCore.loginUser(req.body.email, req.body.password);
            console.log("User logged in:", user.userId);
            res.status(200).json(user);
        } catch (error) {
            console.error("Login error:", error);
            next(error);
        }
    }

    async verifyEmail(req, res, next) {
        const parsed = approveRequestSchema.safeParse(req);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const rec = await this.authCore.consume(req.body.token, "email_verify");
            if (!rec) {
                console.log("Approval record not found for token");
                return res.status(403).json({ message: "Invalid or expired token" });
            }

            const user = await this.userCore.get(rec.userId);
            if (!user) {
                console.log("User not found for ID:", rec.userId);
                return res.status(404).json({ message: "Users not found" });
            }

            if (!user.secret) user.secret = {};
            user.secret.emailVerified = true;
            user.secret.emailVerifiedAt = new Date();
            await user.save();
            //вот тут тоже не понимаю .save что это за метод и для чего он нужен тут может я что-то убрал хз

            console.log("Email verified for user ID:", user.id);
            return res.status(200).json({ message: "Email verified successfully" });
        } catch (err) {
            console.error("Email verification error:", err);
            next(err);
        }
    }

    async resendVerification(req, res, next) {
        const parsed = resendVerificationSchema.safeParse(req);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const user = req.user.id
                ? await this.userCore.getUserById(req.user.id)
                : await this.userCore.getUserByEmail(String(req.body.email).trim().toLowerCase());

            if (!user) {
                console.log("User not found for resend verification");
                return res.status(404).json({ message: "User not found" });
            }

            // короче тут еще чето наверное должно быть я хуй знает что я запутался чуть но вот
            // ну мне так кажется или я чето не понял
        } catch (err) {
            console.error("Resend verification error:", err);
            next(err);
        }
    }
}