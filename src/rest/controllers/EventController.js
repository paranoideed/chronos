import { z } from 'zod';
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
        const parsed = listEventsSchema.safeParse(req);
        if (!parsed.success) {
            console.error("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const data = await this.core.listEvents(
                req.user.id,
                req.params.calendarId,
                req.query
            );
            res.status(200).json(data);
        } catch (err) {
            console.error("Error in list:", err);
            next(err); 
        }
    };

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
    };

    async createEvent(req, res, next) {
        const parsed = createEventSchema.safeParse(req);
        if (!parsed.success) {
            console.error("Validation error:", parsed.error);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const created = await this.core.createEvent(
                req.user.id,
                req.params.calendarId,
                req.body
            );
            res.status(201).json({ event: created });
        } catch (err) {
            console.error("Error in create:", err);
            next(err);
        }
    };

    async updateEvent(req, res, next) {
        const parsed = updateEventSchema.parse(req);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error)
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const updated = await this.core.updateEvent(
                req.user.id,
                req.params.calendarId,
                req.params.id,
                req.body
            );
            res.status(200).json({ event: updated });
        } catch (err) {
            console.log("Error in update:", err);
            next(err);
        }
    };

    async deleteEvent(req, res, next) {
        const parsed = removeSchema.safeParse(req);
        if (!parsed.success) {
            console.error("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.core.deleteEvent(req.user.id, req.params.calendarId, req.params.id);
            res.status(204).send();
        } catch (err) {
            console.error("Error in remove:", err);
            next(err);
        }
    };
}


