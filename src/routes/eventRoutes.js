import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import * as eventController from "../controllers/eventController.js";

const router = Router({ mergeParams: true });

router.use(authRequired);

// GET /api/calendars/:calendarId/events?from=&to=&types=&page=&limit=
router.get("/", eventController.list);

// POST /api/calendars/:calendarId/events
router.post("/", eventController.create);

// GET /api/calendars/:calendarId/events/:id
router.get("/:id", eventController.getOne);

// PATCH /api/calendars/:calendarId/events/:id
router.patch("/:id", eventController.update);

// DELETE /api/calendars/:calendarId/events/:id
router.delete("/:id", eventController.remove);

export default router;
