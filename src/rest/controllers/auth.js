import { z } from 'zod';

import {loginSchema, registerSchema} from "../requests/auth.js";

export class AuthController {
    auth;

    constructor(authService) {
        this.auth = authService;
    }

    public async register(req, res, next) {
        const candidate = {
            email: req.body.email,
            password: req.body.password,
        };

        const parsed = registerSchema.safeParse(candidate);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const payload = await this.auth.registerUser(parsed.data);
            res.status(201).json(payload);
        } catch (err) {
            console.error("Registration error:", err);
            next(err);
        }
    }

    public async login(req, res, next) {
        const candidate = {
            email: req.body.email,
            password: req.body.password,
        };

        const parsed = loginSchema.safeParse(candidate);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const payload = await this.auth.loginUser(parsed.data);
            res.status(200).json(payload);
        } catch (error) {
            console.error("Login error:", error);
            next(error);
        }
    }
}