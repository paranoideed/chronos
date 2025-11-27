import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

export default function createCalendarRouter(calendarController) {
    const router = Router();

    router.get(
        "/",
        authMiddleware,
        async (req, res, next) => {
            await calendarController.listMineCalendars(req, res, next);
        }
    );

    router.post(
        "/",
        authMiddleware,
        async (req, res, next) => {
            await calendarController.createCalendar(req, res, next);
        }
    );

    router.get(
        "/accept-invite",
        authMiddleware,
        async (req, res, next) => {
            await calendarController.acceptCalendarInvite(req, res, next);
        }
    );

    router.post(
        "/:calendarId/invite",
        authMiddleware,
        async (req, res, next) => {
            await calendarController.inviteToCalendar(req, res, next);
        }
    );

    router.get(
        "/:calendarId",
        authMiddleware,
        async(req, res, next) => {
            await calendarController.getCalendar(req, res, next);
        }
    );

    router.patch(
        "/:calendarId",
        authMiddleware,
        async (req, res, next) => {
            await calendarController.updateCalendar(req, res, next);
        }
    );

    router.delete(
        "/:calendarId",
        authMiddleware,
        async (req, res, next) => {
            await calendarController.deleteCalendar(req, res, next);
        }
    );

    return router;
}
