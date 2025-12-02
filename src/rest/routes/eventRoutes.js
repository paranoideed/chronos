import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

export default function eventRouter(eventController) {
    const router = Router();

    router.get(
        "/:calendarId/events",
        authMiddleware,
        async (req, res, next) => {
            await eventController.listEvents(req, res, next)
        }
    );

    router.post("/:calendarId/events",
        authMiddleware,
        async (req, res, next) => {
            await eventController.createEvent(req, res, next)
        }
    );

    router.get("/:calendarId/events/:id",
        authMiddleware,
        async (req, res, next) => {
            await eventController.getEvent(req, res, next)
        }
    );

    router.patch("/:calendarId/events/:id",
        authMiddleware,
        async (req, res, next) => {
            await eventController.updateEvent(req, res, next)
        }
    );

    router.post(
        "/:calendarId/events/:id/invite",
        authMiddleware,
        async (req, res, next) => {
            await eventController.inviteToEvent(req, res, next);
        }
    );

    router.delete("/:calendarId/events/:id",
        authMiddleware,
        async (req, res, next) => {
            await eventController.deleteEvent(req, res, next)
        }
    );

    router.get(
        "/events/accept-invite",
        authMiddleware,
        async (req, res, next) => {
            await eventController.acceptEventInvite(req, res, next);
        }
    );

    router.get(
        "/events/decline-invite",
        authMiddleware,
        async (req, res, next) => {
            await eventController.declineEventInvite(req, res, next);
        }
    );

    router.get(
        "/events/shared",
        authMiddleware,
        async (req, res, next) => {
            await eventController.listSharedEvents(req, res, next);
        }
    );

    router.delete(
        "/:calendarId/events/:id/members/:userId",
        authMiddleware,
        async (req, res, next) => {
            await eventController.removeEventMember(req, res, next);
        }
    );

    return router;
}
