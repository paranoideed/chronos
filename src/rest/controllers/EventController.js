import { z } from "zod";
import {
    createEventSchema,
    updateEventSchema,
    getOneSchema,
    listEventsSchema,
    removeSchema,
    inviteEventMemberSchema,
    acceptEventInviteSchema,
    listSharedEventsSchema,
    removeEventMemberSchema,
    listEventMembersSchema,
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
            body: req.body,
        });

        if (!parsed.success) {
            console.error("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { params, query } = parsed.data;
        const { calendarId } = params;
        const { from, to, types, page, limit } = query;

        try {
            const data = await this.core.listEvents(req.user.id, calendarId, {
                from,
                to,
                types,
                page,
                limit,
            });
            res.status(200).json(data);
        } catch (err) {
            console.error("Error in listEvents:", err);
            next(err);
        }
    }

    async getEvent(req, res, next) {
        const parsed = getOneSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!parsed.success) {
            console.error("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { params } = parsed.data;

        try {
            const data = await this.core.getEvent(
                req.user.id,
                params.calendarId,
                params.id
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
            query: req.query,
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
            query: req.query,
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
            query: req.query,
            body: req.body,
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

    async inviteToEvent(req, res, next) {
        const parsed = inviteEventMemberSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!parsed.success) {
            console.log("Invite to event validation error:", parsed.error);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { params, body } = parsed.data;

        try {
            const result = await this.core.inviteMemberByEmail(
                req.user.id,
                params.calendarId,
                params.id,
                { email: body.email }
            );

            return res.status(201).json({
                email: result.email,
                eventId: result.eventId,
            });
        } catch (err) {
            console.error("Invite to event error:", err);
            next(err);
        }
    }

    async acceptEventInvite(req, res, next) {
        const parsed = acceptEventInviteSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!parsed.success) {
            console.log("Accept event invite validation error:", parsed.error);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { query } = parsed.data;

        try {
            const data = await this.core.acceptEventInviteByToken(
                req.user.id,
                query.token
            );

            return res.status(200).json(data);
        } catch (err) {
            console.error("Accept event invite error:", err);
            next(err);
        }
    }

    async declineEventInvite(req, res, next) {
        const parsed = acceptEventInviteSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!parsed.success) {
            console.log("Decline event invite validation error:", parsed.error);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { query } = parsed.data;

        try {
            const data = await this.core.declineEventInviteByToken(
                req.user.id,
                query.token
            );

            return res.status(200).json(data);
        } catch (err) {
            console.error("Decline event invite error:", err);
            next(err);
        }
    }

    async listSharedEvents(req, res, next) {
        const parsed = listSharedEventsSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!parsed.success) {
            console.error(
                "Validation error (listSharedEvents):",
                parsed.error.issues
            );
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { query } = parsed.data;
        const { from, to, types, page, limit } = query;

        try {
            const data = await this.core.listSharedEvents(req.user.id, {
                from,
                to,
                types,
                page,
                limit,
            });

            return res.status(200).json(data);
        } catch (err) {
            console.error("Error in listSharedEvents:", err);
            next(err);
        }
    }

    async listEventMembers(req, res, next) {
        const parsed = listEventMembersSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!parsed.success) {
            console.error(
                "Validation error (listEventMembers):",
                parsed.error.issues
            );
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { params } = parsed.data;

        try {
            const members = await this.core.listEventMembers(
                req.user.id,
                params.calendarId,
                params.id
            );

            return res.status(200).json({ members });
        } catch (err) {
            console.error("List event members error:", err);
            next(err);
        }
    }

    async removeEventMember(req, res, next) {
        const parsed = removeEventMemberSchema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!parsed.success) {
            console.error(
                "Validation error (removeEventMember):",
                parsed.error.issues
            );
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        const { params } = parsed.data;

        try {
            await this.core.removeEventMember(
                req.user.id,
                params.calendarId,
                params.id,
                params.userId
            );

            return res.status(204).send();
        } catch (err) {
            console.error("Remove event member error:", err);
            next(err);
        }
    }
}
