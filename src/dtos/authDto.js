import { z } from "zod";

const passwordRegex = /^[a-zA-Z0-9\-.&?+@$%^:_!]+$/;
const passwordError =
    "Password can only contain letters, numbers, and -.&?+@$%^:_!";

const registerBodySchema = z.object({
    email: z.string().email({ message: "Invalid email format" }).max(256),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(64)
        .regex(passwordRegex, { message: passwordError }),
});

const loginBodySchema = z.object({
    email: z.string().email({ message: "Invalid email format" }).max(256),
    password: z.string({ required_error: "Password is required" }),
});

export const registerSchema = z.object({
    body: registerBodySchema,
});

export const loginSchema = z.object({
    body: loginBodySchema,
});
