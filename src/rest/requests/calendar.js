import { z } from "zod";

const CALENDAR_TYPES = ["primary", "holidays", "ordinary"];

export const createCalendarBodySchema = z.object({
    type: z.enum(CALENDAR_TYPES),
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(2000).optional(),
    color: z.string().trim().max(32).optional(),
});

export const calendarIdParamSchema = z.object({
    calendarId: z.string(),
});

export const listMyCalendarsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const updateCalendarBodySchema = z.object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(2000).optional(),
    color: z.string().trim().max(32).optional(),
});

export const inviteCalendarMemberBodySchema = z.object({
    email: z.string().email().max(255),
    role: z.enum(["viewer", "editor"]).default("viewer"),
});

export const acceptCalendarInviteQuerySchema = z.object({
    token: z.string().min(1, "Token is required"),
});

export const createCalendarSchema = z.object({
    body: createCalendarBodySchema,
});

export const listMyCalendarsSchema = z.object({
    query: listMyCalendarsQuerySchema,
});

export const getCalendarSchema = z.object({
    params: calendarIdParamSchema,
});

export const updateCalendarSchema = z.object({
    params: calendarIdParamSchema,
    body: updateCalendarBodySchema,
});

export const deleteCalendarSchema = z.object({
    params: calendarIdParamSchema,
});

export const inviteCalendarMemberSchema = z.object({
    params: calendarIdParamSchema,
    body: inviteCalendarMemberBodySchema,
});

export const acceptCalendarInviteSchema = z.object({
    query: acceptCalendarInviteQuerySchema,
});