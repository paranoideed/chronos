import { Router } from "express";

export default function createCalendarRouter(calendarController, authMiddleware) {
    const router = Router();

    router.use(authMiddleware);

    router.get("/", (req, res, next) =>
        calendarController.listMineCalendars(req, res, next)
    );

    router.post("/", (req, res, next) =>
        calendarController.createCalendar(req, res, next)
    );

    router.get("/:calendarId", (req, res, next) =>
        calendarController.getCalendar(req, res, next)
    );

    router.patch("/:calendarId", (req, res, next) =>
        calendarController.updateCalendar(req, res, next)
    );

    router.delete("/:calendarId", (req, res, next) =>
        calendarController.deleteCalendar(req, res, next)
    );

    return router;
}
