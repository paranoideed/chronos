import { z } from "zod";

export const approveRequestSchema = z.object({
    token: z.string().min(1, "Token is required"),
});

export const resendVerificationSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    email: z.email({ message: "Invalid email format" }).max(256),
});