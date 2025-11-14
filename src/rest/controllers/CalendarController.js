import { z } from "zod";
import {
    createCalendarSchema,
    getCalendarSchema,
    listMyCalendarsSchema,
    removeCalendarSchema,
    updateCalendarSchema
} from "../requests/calendar.js";

export default class CalendarController {
    core

    constructor(calendarService) {
        this.core = calendarService;
    }

    async createCalendar(req, res, next) {
        const parsed = createCalendarSchema.safeParse(req);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const cal = await this.core.createCalendar(req.user.id, parsed.data.body);
            console.log("Created calendar:", cal);
            res.status(201).json({ calendar: cal });
        } catch (err) {
            console.error("Calendar creation error:", err);
            next(err);
        }
    }

    async listMineCalendars(req, res, next) {
        const parsed = listMyCalendarsSchema.safeParse(req);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            //вот тут добавь пагинацию потом
            const data = await this.core.listMyCalendars(req.user.id);
            res.status(200).json({ items: data });
        } catch (err) {
            console.error("Listing calendars error:", err);
            next(err);
        }
    }

    async getCalendar(req, res, next) {
        const parsed = getCalendarSchema.safeParse(req);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const cal = await this.core.getCalendar(
                req.user.id,
                req.params.id
            );
            res.status(200).json({calendar: cal});
        } catch (err) {
            console.error("Getting calendar error:", err);
            next(err);
        }
    }

    async updateCalendar(req, res, next) {
        const parsed = updateCalendarSchema.safeParse(req);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const cal = await this.core.updateCalendar(
                req.user.id,
                req.params.id,
                req.body,
            );
            console.log("Updated calendar:", cal);
            res.status(200).json({ calendar: cal });
        } catch (err) {
            console.error("Updating calendar error:", err);
            next(err);
        }
    }

    async deleteCalendar(req, res, next) {
        const parsed = removeCalendarSchema.safeParse(req);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.core.deleteCalendar(req.user.id, req.params.id);
            res.status(204).send();
        } catch (err) {
            console.error("Deleting calendar error:", err);
            next(err);
        }
    }
}
