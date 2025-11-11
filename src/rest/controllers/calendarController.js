import { ZodError } from "zod";
import {
    createCalendarSchema,
    updateCalendarSchema,
} from "../requests/calendarDto.js";
import * as calendarService from "../../domain/calendarService.js";

export const create = async (req, res) => {
    try {
        const { body } = createCalendarSchema.parse({ body: req.body });
        const cal = await calendarService.createCalendar(req.user.id, body);
        res.status(201).json({ calendar: cal });
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json({
                message: "Validation error",
                errors: err.issues.map((i) => ({
                    field: i.path.join("."),
                    message: i.message,
                })),
            });
        }
        if (err.message === "PRIMARY_EXISTS") {
            return res
                .status(409)
                .json({ message: "Primary calendar already exists" });
        }
        return res
            .status(
                err.message === "FORBIDDEN"
                    ? 403
                    : err.message === "NOT_FOUND"
                    ? 404
                    : 500
            )
            .json({ message: err.message });
    }
};

export const listMine = async (req, res) => {
    try {
        const data = await calendarService.listMyCalendars(req.user.id);
        res.json({ items: data });
    } catch (err) {
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
};

export const getOne = async (req, res) => {
    try {
        const cal = await calendarService.getCalendar(
            req.user.id,
            req.params.id
        );
        res.json({ calendar: cal });
    } catch (err) {
        return res
            .status(
                err.message === "FORBIDDEN"
                    ? 403
                    : err.message === "NOT_FOUND"
                    ? 404
                    : 500
            )
            .json({ message: err.message });
    }
};

export const update = async (req, res) => {
    try {
        const { body } = updateCalendarSchema.parse({ body: req.body });
        const cal = await calendarService.updateCalendar(
            req.user.id,
            req.params.id,
            body
        );
        res.json({ calendar: cal });
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json({
                message: "Validation error",
                errors: err.issues.map((i) => ({
                    field: i.path.join("."),
                    message: i.message,
                })),
            });
        }
        return res
            .status(
                err.message === "FORBIDDEN"
                    ? 403
                    : err.message === "NOT_FOUND"
                    ? 404
                    : 500
            )
            .json({ message: err.message });
    }
};

export const remove = async (req, res) => {
    try {
        await calendarService.deleteCalendar(req.user.id, req.params.id);
        res.status(204).send();
    } catch (err) {
        return res
            .status(
                err.message === "FORBIDDEN"
                    ? 403
                    : err.message === "NOT_FOUND"
                    ? 404
                    : 500
            )
            .json({ message: err.message });
    }
};
