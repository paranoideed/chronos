import { z } from "zod";

const EVENT_TYPES = ["arrangement", "reminder", "task"];

const isoDate = z.preprocess(
    (v) => (typeof v === "string" || v instanceof Date ? new Date(v) : v),
    z.date({ invalid_type_error: "Invalid date" })
);

const base = {
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional(),
};

export const createEventSchema = z.object({
    params: z.object({
        calendarId: z.string().trim().min(1),
    }),
    body: z
        .object({
            type: z.enum(EVENT_TYPES),
            color: z.string().trim().max(50).optional(),
            allDay: z.boolean().optional(),
            startAt: isoDate.optional(),
            endAt: isoDate.optional(),
            remindAt: isoDate.optional(),
            dueAt: isoDate.optional(),
            isDone: z.boolean().optional(),

            ...base,
        })
        .superRefine((data, ctx) => {
            if (data.type === "meeting") {
                const allDay = !!data.allDay;
                if (!allDay && !data.startAt) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["startAt"],
                        message: "startAt is required for non all-day meeting",
                    });
                }
                if (!allDay && !data.endAt) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["endAt"],
                        message: "endAt is required for non all-day meeting",
                    });
                }
                if (data.startAt && data.endAt && data.startAt > data.endAt) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["endAt"],
                        message: "endAt must be after startAt",
                    });
                }
            } else if (data.type === "reminder") {
                if (!data.remindAt) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["remindAt"],
                        message: "remindAt is required",
                    });
                }
            } else if (data.type === "task") {
                if (!data.dueAt) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["dueAt"],
                        message: "dueAt is required",
                    });
                }
            }
        }),
});

export const updateEventSchema = z.object({
    params: z.object({
        calendarId: z.string().trim().min(1),
        id: z.string().trim().min(1),
    }),
    body: z
        .object({
            title: z.string().trim().min(1).max(200).optional(),
            description: z.string().trim().max(5000).optional(),
            color: z.string().trim().max(50).optional(),
            allDay: z.boolean().optional(),
            startAt: isoDate.optional(),
            endAt: isoDate.optional(),
            remindAt: isoDate.optional(),
            dueAt: isoDate.optional(),
            isDone: z.boolean().optional(),
        })
        .superRefine((data, ctx) => {
            if (data.startAt && data.endAt && data.startAt > data.endAt) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["endAt"],
                    message: "endAt must be after startAt",
                });
            }
        }),
});

export const getOneSchema = z.object({
    params: z.object({
        calendarId: z.string().trim().min(1),
        id: z.string().trim().min(1),
    }),
});

export const removeSchema = getOneSchema;

export const listEventsSchema = z.object({
    params: z.object({
        calendarId: z.string().trim().min(1),
    }),
    query: z.object({
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        types: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    }),
});

export const inviteEventMemberBodySchema = z.object({
    email: z.string().email().max(255),
});

export const acceptEventInviteQuerySchema = z.object({
    token: z.string().min(1, "Token is required"),
});

export const inviteEventMemberSchema = z.object({
    params: z.object({
        calendarId: z.string().trim().min(1),
        id: z.string().trim().min(1),
    }),
    body: inviteEventMemberBodySchema,
});

export const acceptEventInviteSchema = z.object({
    query: acceptEventInviteQuerySchema,
});

export const listSharedEventsSchema = z.object({
    query: z.object({
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        types: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    }),
});

export const eventMemberParamsSchema = z.object({
    calendarId: z.string().trim().min(1),
    id: z.string().trim().min(1),
    userId: z.string().trim().min(1),
});

export const removeEventMemberSchema = z.object({
    params: eventMemberParamsSchema,
});