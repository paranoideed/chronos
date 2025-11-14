import { z } from "zod";

const passwordRegex = /^[a-zA-Z0-9\-.&?+@$%^:_!]+$/;
const passwordError =
    "Password can only contain letters, numbers, and -.&?+@$%^:_!";

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email format" }).max(256),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(64)
            .regex(passwordRegex, { message: passwordError }),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email format" }).max(256),
        password: z.string({ required_error: "Password is required" }),
    }),
});

export const approveRequestSchema = z.object({
    query: z.object({
        token: z.string().min(1, "Token is required"),
    }),
});

export const resendVerificationSchema = z.object({
    user: z.object({
        userId: z.string().min(1, "User ID is required"),
    }),
    body: z.object({
        email: z.string().email({ message: "Invalid email format" }).max(256),
    }),
});