import { Router } from "express";

export default function makeCalendarRoutes({ controller, mw }) {
    const r = Router();
    r.use(mw.auth);

    // GET /api/calendars
    r.get("/", (req, res, next) => controller.listMine(req, res, next));

    // POST /api/calendars
    r.post("/", (req, res, next) => controller.create(req, res, next));

    // GET /api/calendars/:id
    r.get("/:id", (req, res, next) => controller.get(req, res, next));

    // PATCH /api/calendars/:id
    r.patch("/:id", (req, res, next) => controller.update(req, res, next));

    // DELETE /api/calendars/:id
    r.delete("/:id", (req, res, next) => controller.remove(req, res, next));

    return r;
}
