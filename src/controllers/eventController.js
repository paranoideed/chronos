import { ZodError } from "zod";
import {
    createEventSchema,
    updateEventSchema,
    getOneSchema,
    listEventsSchema,
    removeSchema,
} from "../dtos/eventDto.js";
import * as eventService from "../services/eventService.js";

export const list = async (req, res) => {
    try {
        const { params, query } = listEventsSchema.parse({
            params: req.params,
            query: req.query,
        });
        const data = await eventService.list(
            req.user.id,
            params.calendarId,
            query
        );
        res.status(200).json(data);
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
        const code = err.message === "FORBIDDEN" ? 403 : 500;
        res.status(code).json({ message: err.message });
    }
};

export const getOne = async (req, res) => {
    try {
        const { params } = getOneSchema.parse({ params: req.params });
        const item = await eventService.getOne(
            req.user.id,
            params.calendarId,
            params.id
        );
        res.status(200).json({ event: item });
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

export const create = async (req, res) => {
    try {
        const { params, body } = createEventSchema.parse({
            params: req.params,
            body: req.body,
        });
        const created = await eventService.create(
            req.user.id,
            params.calendarId,
            body
        );
        res.status(201).json({ event: created });
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
        const code = err.message === "FORBIDDEN" ? 403 : 500;
        res.status(code).json({ message: err.message });
    }
};

export const update = async (req, res) => {
    try {
        const { params, body } = updateEventSchema.parse({
            params: req.params,
            body: req.body,
        });
        const updated = await eventService.update(
            req.user.id,
            params.calendarId,
            params.id,
            body
        );
        res.status(200).json({ event: updated });
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
        const { params } = removeSchema.parse({ params: req.params });
        await eventService.remove(req.user.id, params.calendarId, params.id);
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
