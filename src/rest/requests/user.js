import { z } from "zod";

const getUserByIDParamsSchema = z.object({
    id: z.string(),
});

export const getUserByIDSchema = z.object({
    params: getUserByIDParamsSchema,
});

const getUserByEmailParamsSchema = z.object({
    email: z.email(),
});

export const getUserByEmailSchema = z.object({
    params: getUserByEmailParamsSchema,
});

const updateUserBodySchema = z.object({
    name: z.string(),
    country: z.string(),
})

export const updateUserSchema = z.object({
    body: updateUserBodySchema,
})

export const updateUserAvatarSchema = z.object({
    avatar: z.custom(),
})

