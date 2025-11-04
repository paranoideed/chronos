import * as authService from '../services/authService.js';
import { ZodError } from 'zod';
import { registerSchema, loginSchema } from '../dtos/authDto.js';

export const register = async (req, res) => {
    try {
        const { body: validatedData } = registerSchema.parse({
            body: req.body,
        });

        const { token, user } = await authService.registerUser(
            validatedData.email,
            validatedData.password
        );

        res.status(201).json({ token, user });

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: "Validation error",
                errors: error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        if (error.message === "USER_EXISTS") {
            return res
                .status(409)
                .json({ message: "User with this email already exists" });
        }

        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

export const login = async (req, res) => {
    try {
        const { body: validatedData } = loginSchema.parse({
            body: req.body,
        });

        const { token, user } = await authService.loginUser(validatedData);

        res.status(200).json({ token, user });

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: "Validation error",
                errors: error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        if (error.message === "INVALID_CREDENTIALS") {
            return res
                .status(401)
                .json({ message: "Invalid credentials" });
        }
        
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

