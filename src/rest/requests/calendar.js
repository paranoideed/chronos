import z from "zod";

const CALENDAR_TYPES = ["primary", "holidays", "ordinary"];

export const createCalendarSchema = z.object({
    body: z.object({
        type: z.enum(CALENDAR_TYPES),
        name: z.string().trim().min(1).max(100),
        description: z.string().trim().max(2000).optional(),
        color: z.string().trim().max(32).optional(),
    }),
});

export const updateCalendarSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1).max(100).optional(),
        description: z.string().trim().max(2000).optional(),
        color: z.string().trim().max(32).optional(),
    }),
});

export const calendarIdParamRequest = z.infer<typeof createCalendarSchema>;
export type updateCalendarRequest = z.infer<typeof createCalendarSchema>;