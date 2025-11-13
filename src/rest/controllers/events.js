import { ZodError } from "zod";
import {
    createEventSchema,
    updateEventSchema,
    getOneSchema,
    listEventsSchema,
    removeSchema,
} from "../requests/event.js";

export default class EventController {
    #eventService;

    constructor(eventService) {
        this.#eventService = eventService;
        if (!eventService) {
            throw new Error("EventsController requires an eventService");
        }
    }
    list = async (req, res, next) => {
        try {
            const { params, query } = listEventsSchema.parse({
                params: req.params,
                query: req.query,
            });
            const data = await this.#eventService.list(
                req.user.id,
                params.calendarId,
                query
            );
            res.status(200).json(data);
        } catch (err) {

            next(err); 
        }
    };

    getOne = async (req, res, next) => {
        try {
            const { params } = getOneSchema.parse({ params: req.params });
            const item = await this.#eventService.getOne(
                req.user.id,
                params.calendarId,
                params.id
            );
            res.status(200).json({ event: item });
        } catch (err) {
            next(err);
        }
    };

    create = async (req, res, next) => {
        try {
            const { params, body } = createEventSchema.parse({
                params: req.params,
                body: req.body,
            });
            const created = await this.#eventService.create(
                req.user.id,
                params.calendarId,
                body
            );
            res.status(201).json({ event: created });
        } catch (err) {
            next(err);
        }
    };

    update = async (req, res, next) => {
        try {
            const { params, body } = updateEventSchema.parse({
                params: req.params,
                body: req.body,
            });
            const updated = await this.#eventService.update(
                req.user.id,
                params.calendarId,
                params.id,
                body
            );
            res.status(200).json({ event: updated });
        } catch (err) {
            next(err);
        }
    };

    remove = async (req, res, next) => {
        try {
            const { params } = removeSchema.parse({ params: req.params });
            await this.#eventService.remove(req.user.id, params.calendarId, params.id);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    };
}


