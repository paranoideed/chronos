import { z } from "zod";
import {
    createCalendarBodySchema,
    listMyCalendarsQuerySchema,
    calendarIdParamSchema,
    updateCalendarBodySchema,
} from "../requests/calendar.js";

export default class CalendarController {
    core

    constructor(calendarCore) {
        this.core = calendarCore;
    }

    async createCalendar(req, res, next) {
        const parsed = createCalendarBodySchema.safeParse(req.body);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const cal = await this.core.createCalendar(req.user.id, parsed.data);
            console.log("Created calendar:", cal);
            res.status(201).json({ calendar: cal });
        } catch (err) {
            console.error("Calendar creation error:", err);
            next(err);
        }
    }

    async listMineCalendars(req, res, next) {
        const parsedQuery = listMyCalendarsQuerySchema.safeParse(req.query);
        if (!parsedQuery.success) {
            console.log("Validation error:", parsedQuery.error.issues);
            return res.status(400).json(z.treeifyError(parsedQuery.error));
        }

         try {
            // add pagination
            const calendars = await this.core.listMyCalendars(
                req.user.id,
                parsedQuery.data,
            );
            console.log("listMineCalendars req.user:", req.user);
            res.status(200).json({ calendars });
        } catch (err) {
            console.error("Listing calendars error:", err);
            next(err);
        }
    }

    async getCalendar(req, res, next) {
        const parsedParams = calendarIdParamSchema.safeParse(req.params);

        if (!parsedParams.success) {
        console.log("Validation error:", parsedParams.error.issues);
        return res.status(400).json(z.treeifyError(parsedParams.error));
    }


        try {
            const cal = await this.core.getCalendar(
                req.user.id,
                parsedParams.data.calendarId
            );
            res.status(200).json({calendar: cal});
        } catch (err) {
            console.error("Getting calendar error:", err);
            next(err);
        }
    }

    async updateCalendar(req, res, next) {
        const parsedParams = calendarIdParamSchema.safeParse(req.params);
        const parsedBody = updateCalendarBodySchema.safeParse(req.body);
        
        if (!parsedParams.success || !parsedBody.success) {
            const issues = [
                ...(parsedParams.error?.issues ?? []),
                ...(parsedBody.error?.issues ?? []),
            ];
            console.log("Validation error:", issues);
            return res.status(400).json({ errors: issues });
        }

        try {
            const cal = await this.core.updateCalendar(
                req.user.id,
                parsedParams.data.calendarId,
                parsedBody.data,
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
        const parsed = calendarIdParamSchema.safeParse(req.params);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.core.deleteCalendar(req.user.id, parsed.data.calendarId);
            res.status(204).send();
        } catch (err) {
            console.error("Deleting calendar error:", err);
            next(err);
        }
    }
}
