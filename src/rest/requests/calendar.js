import z from "zod";

const CALENDAR_TYPES = ["primary", "holidays", "ordinary"];

export const createCalendarSchema = z.object({
    user: z.object({
        id: z.string(),
    }),
    body: z.object({
        type: z.enum(CALENDAR_TYPES),
        name: z.string().trim().min(1).max(100),
        description: z.string().trim().max(2000).optional(),
        color: z.string().trim().max(32).optional(),
    }),
});

export const getCalendarSchema = z.object({
    user: z.object({
        id: z.string(),
    }),
    params: z.object({
        calendarId: z.string(),
    }),
});

export const listMyCalendarsSchema = z.object({
    user: z.object({
        id: z.string(),
    }),
    query: z.object({
        page: z.number().min(1).optional(),
        limit: z.number().min(1).max(100).optional(),
    }).optional()
});

export const updateCalendarSchema = z.object({
    user: z.object({
        id: z.string(),
    }),
    params: z.object({
        calendarId: z.string(),
    }),
    body: z.object({
        name: z.string().trim().min(1).max(100).optional(),
        description: z.string().trim().max(2000).optional(),
        color: z.string().trim().max(32).optional(),
    }),
});

export const removeCalendarSchema = z.object({
    user: z.object({
        id: z.string(),
    }),
    params: z.object({
        calendarId: z.string(),
    }),
});