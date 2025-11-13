import { Router } from "express";
import { createEventSchema, updateEventSchema } from "../requests/event.js";

export default function makeEventRoutes({ controller, mw }) {
    const r = Router({ mergeParams: true });
    r.use(mw.auth);

    // GET /api/calendars/:calendarId/events
    r.get("/", (req, res, next) => controller.list(req, res, next));

    // POST /api/calendars/:calendarId/events
    r.post("/", mw.validate(createEventSchema), (req, res, next) =>
        controller.create(req, res, next)
    );

    // GET /api/calendars/:calendarId/events/:id
    r.get("/:id", (req, res, next) => controller.getOne(req, res, next));

    // PATCH /api/calendars/:calendarId/events/:id
    r.patch("/:id", mw.validate(updateEventSchema), (req, res, next) =>
        controller.update(req, res, next)
    );

    // DELETE /api/calendars/:calendarId/events/:id
    r.delete("/:id", (req, res, next) => controller.remove(req, res, next));

    return r;
}
