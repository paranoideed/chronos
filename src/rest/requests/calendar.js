import z from "zod";

const CALENDAR_TYPES = ["primary", "holidays", "ordinary"];

export const createCalendarSchema = z.object({
    userId: z.string(),
    type: z.enum(CALENDAR_TYPES),
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(2000).optional(),
    color: z.string().trim().max(32).optional(),
});

export const getCalendarSchema = z.object({
    userId: z.string(),
    calendarId: z.string(),
});

export const listMyCalendarsSchema = z.object({
    userId: z.string(),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(100).optional(),
});

export const updateCalendarSchema = z.object({
    userId: z.string(),
    calendarId: z.string(),
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(2000).optional(),
    color: z.string().trim().max(32).optional(),
});

export const removeCalendarSchema = z.object({
    userId: z.string(),
    calendarId: z.string(),
});