import { z } from "zod";
import {
    createEventSchema,
    updateEventSchema,
    getOneSchema,
    listEventsSchema,
    removeSchema,
} from "../requests/event.js";

export default class EventController {
    core;

    constructor(eventService) {
        this.core = eventService;
        if (!eventService) {
            throw new Error("EventsController requires an eventService");
        }
    }

    async listEvents(req, res, next) {
        const parsed = listEventsSchema.safeParse({
            params: req.params,
            query: req.query,
        });
        if (!parsed.success) {
            console.error("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const { calendarId } = parsed.data.params;
            const { from, to, types, page, limit } = parsed.data.query;

            const data = await this.core.listEvents(
                req.user.id,
                calendarId,
                { from, to, types, page, limit }
            );
            res.status(200).json(data);
        } catch (err) {
            console.error("Error in listEvents:", err);
            next(err);
        }
    }

    async getEvent(req, res, next) {
        const parsed = getOneSchema.safeParse(req);
        if (!parsed.success) {
            console.error("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const data = await this.core.getEvent(
                req.user.id,
                req.params.calendarId,
                req.params.id
            );
            res.status(200).json({ event: data });
        } catch (err) {
            console.error("Error in getOne:", err);
            next(err);
        }
    }

    async createEvent(req, res, next) {
        const parsed = createEventSchema.safeParse({
            params: req.params,
            body: req.body,
        });
        if (!parsed.success) {
            console.log("Validation error (createEvent):", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { params, body } = parsed.data;

        try {
            const event = await this.core.createEvent(
                req.user.id,
                params.calendarId,
                body
            );
            return res.status(201).json(event);
        } catch (err) {
            console.error("Error in createEvent:", err);
            next(err);
        }
    }

    async updateEvent(req, res, next) {
        const parsed = updateEventSchema.safeParse({
            params: req.params,
            body: req.body,
        });
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { params, body } = parsed.data;

        try {
            const updated = await this.core.updateEvent(
                req.user.id,
                params.calendarId,
                params.id,
                body
            );
            return res.status(200).json(updated);
        } catch (err) {
            console.log("Error in update:", err);
            next(err);
        }
    }

    async deleteEvent(req, res, next) {
        const parsed = removeSchema.safeParse({
            params: req.params,
        });
        if (!parsed.success) {
            console.error("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { params } = parsed.data;

        try {
            await this.core.deleteEvent(
                req.user.id,
                params.calendarId,
                params.id
            );
            res.status(204).send();
        } catch (err) {
            console.error("Error in deleteEvent:", err);
            next(err);
        }
    }
}
