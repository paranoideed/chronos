import z, { ZodError } from "zod";

import calendarService from "../../domain/callendar.js";
import {
    createCalendarSchema,
    getCalendarSchema,
    listMyCalendarsSchema, removeCalendarSchema,
    updateCalendarSchema
} from "../requests/calendar.js";

class CalendarController {
    service

    constructor(calendarService) {
        this.service = calendarService;
    }

    async create(req, res, next) {
        const candidate = {
            type: req.body.type,
            name: req.body.name,
            description: req.body.description,
            color: req.body.color,
        }

        const parsed = createCalendarSchema.safeParse({ body: candidate });
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const cal = await this.service.createCalendar(req.user.id, parsed.data.body);
            res.status(201).json({ calendar: cal });
        } catch (err) {
            console.error("Calendar creation error:", err);
            next(err);
        }
    }

    async listMine(req, res, next) {
        const candidate = {
            userId: req.user.id,

            // u need add pagination it will be good I think u know how to do it and what it is
            // page: req.query.page ? parseInt(req.query.page, 10) : undefined,
            // limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
        }

        const parsed = listMyCalendarsSchema.safeParse(candidate);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const data = await this.service.listMyCalendars(candidate);
            res.status(200).json({ items: data });
        } catch (err) {
            console.error("Listing calendars error:", err);
            next(err);
        }
    }

    async get(req, res, next) {
        const candidate = {
            userId: req.user.id,
            calendarId: req.params.calendarId,
        }

        const parsed = getCalendarSchema.safeParse(candidate);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const cal = await this.service.getCalendar(
                req.user.id,
                req.params.id
            );
            res.status(200).json({calendar: cal});
        } catch (err) {
            console.error("Getting calendar error:", err);
            next(err);
        }
    }

    async update(req, res, next) {
        const candidate = {
            userId: req.user.id,
            calendarId: req.params.calendarId,
            name: req.body.name,
            description: req.body.description,
            color: req.body.color,
        }

        const parsed = updateCalendarSchema.safeParse({ body: candidate.updates });
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const cal = await this.service.updateCalendar(
                req.user.id,
                req.params.id,
                candidate.updates
            );
            res.status(200).json({ calendar: cal });
        } catch (err) {
            console.error("Updating calendar error:", err);
            next(err);
        }
    }

    async remove(req, res, next) {
        const candidate = {
            userId: req.user.id,
            calendarId: req.params.calendarId,
        }

        const parsed = removeCalendarSchema.safeParse(candidate);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.service.deleteCalendar(req.user.id, req.params.id);
            res.status(204).send();
        } catch (err) {
            console.error("Deleting calendar error:", err);
            next(err);
        }
    }
}

const calendarController = new CalendarController(calendarService);
export default calendarController;