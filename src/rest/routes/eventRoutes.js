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

    router.delete("/:calendarId/events/:id",
        authMiddleware,
        async (req, res, next) => {
            await eventController.deleteEvent(req, res, next)
        }
    );

    return router;
}
