import { Router } from "express";

export default function createEventRouter(eventController, authMiddleware) {
    const router = Router();

    router.use(authMiddleware);

    router.get("/:calendarId/events", (req, res, next) =>
        eventController.listEvents(req, res, next)
    );

    router.post("/:calendarId/events", (req, res, next) =>
        eventController.createEvent(req, res, next)
    );

    router.get("/:calendarId/events/:id", (req, res, next) =>
        eventController.getEvent(req, res, next)
    );

    router.patch("/:calendarId/events/:id", (req, res, next) =>
        eventController.updateEvent(req, res, next)
    );

    router.delete("/:calendarId/events/:id", (req, res, next) =>
        eventController.deleteEvent(req, res, next)
    );

    return router;
}
