import { z } from "zod";
import {
    createCalendarSchema,
    listMyCalendarsSchema,
    getCalendarSchema,
    updateCalendarSchema,
    deleteCalendarSchema,
    inviteCalendarMemberSchema,
    acceptCalendarInviteSchema,
} from "../requests/calendar.js";

export default class CalendarController {
    core;

    constructor(calendarCore) {
        this.core = calendarCore;
    }

    async createCalendar(req, res, next) {
        const parsed = createCalendarSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { body } = parsed.data;

        try {
            const cal = await this.core.createCalendar(req.user.id, body);
            console.log("Created calendar:", cal);
            res.status(201).json({ calendar: cal });
        } catch (err) {
            console.error("Calendar creation error:", err);
            next(err);
        }
    }

    async listMineCalendars(req, res, next) {
        const parsed = listMyCalendarsSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { query } = parsed.data;

        try {
            // add pagination
            const calendars = await this.core.listMyCalendars(
                req.user.id,
                query
            );
            console.log("listMineCalendars req.user:", req.user);
            res.status(200).json({ calendars });
        } catch (err) {
            console.error("Listing calendars error:", err);
            next(err);
        }
    }

    async getCalendar(req, res, next) {
        const parsed = getCalendarSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { params } = parsed.data;

        try {
            const cal = await this.core.getCalendar(
                req.user.id,
                params.calendarId
            );
            res.status(200).json({ calendar: cal });
        } catch (err) {
            console.error("Getting calendar error:", err);
            next(err);
        }
    }

    async updateCalendar(req, res, next) {
        const parsed = updateCalendarSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { params, body } = parsed.data;

        try {
            const cal = await this.core.updateCalendar(
                req.user.id,
                params.calendarId,
                body
            );
            console.log("Updated calendar:", cal);
            res.status(200).json({ calendar: cal });
        } catch (err) {
            console.error("Updating calendar error:", err);
            next(err);
        }
    }

    async deleteCalendar(req, res, next) {
        console.log("DELETE /api/calendars params:", req.params);
        const parsed = deleteCalendarSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { params } = parsed.data;

        try {
            await this.core.deleteCalendar(req.user.id, params.calendarId);
            res.status(204).send();
        } catch (err) {
            console.error("Deleting calendar error:", err);
            next(err);
        }
    }

    async inviteToCalendar(req, res, next) {
        const parsed = inviteCalendarMemberSchema.safeParse({
            params: req.params,
            body: req.body,
        });

        if (!parsed.success) {
            console.log("Invite to calendar validation error:", parsed.error);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { params, body } = parsed.data;

        try {
            const result = await this.core.inviteMemberByEmail(
                req.user.id,
                params.calendarId,
                {
                    email: body.email,
                    role: body.role,
                }
            );

            return res.status(201).json({
                email: result.email,
                role: result.role,
            });
        } catch (err) {
            console.error("Invite to calendar error:", err);
            next(err);
        }
    }

    async acceptCalendarInvite(req, res, next) {
        const parsed = acceptCalendarInviteSchema.safeParse({
            query: req.query,
        });

        if (!parsed.success) {
            console.log(
                "Accept calendar invite validation error:",
                parsed.error
            );
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { query } = parsed.data;

        try {
            const data = await this.core.acceptInviteByToken(
                req.user.id,
                query.token
            );

            return res.status(200).json(data);
        } catch (err) {
            console.error("Accept calendar invite error:", err);
            next(err);
        }
    }
}
