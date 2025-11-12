import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import calendarController from "../controllers/calendar.js";
const router = Router();

router.use(authRequired);

router.get("/", calendarController.listMine); // GET /api/calendars
router.post("/", calendarController.create); // POST /api/calendars
router.get("/:id", calendarController.get); // GET /api/calendars/:id
router.patch("/:id", calendarController.update); // PATCH /api/calendars/:id
router.delete("/:id", calendarController.remove); // DELETE /api/calendars/:id

export default router;
