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
        "/:calendarId/members",
        authMiddleware,
        async (req, res, next) => {
            await calendarController.listCalendarMembers(req, res, next);
        }
    );

    router.patch(
        "/:calendarId/members/:userId",
        authMiddleware,
        async (req, res, next) => {
            await calendarController.updateCalendarMemberRole(req, res, next);
        }
    );

    router.delete(
        "/:calendarId/members/:userId",
        authMiddleware,
        async (req, res, next) => {
            await calendarController.removeCalendarMember(req, res, next);
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
