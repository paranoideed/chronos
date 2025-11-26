import mongoose from "mongoose";
import {EventNotFoundError, ForbiddenError} from "./errors/errors.js";
import {ReminderEvent, TaskEvent, ArrangementEvent} from "../repo/models/eventModel.js";

const asObjId = (id) => new mongoose.Types.ObjectId(id);

export default class EventCore {
    repo;

    constructor(repo) {
        this.repo = repo;
    }

    ensureRole (member, allowed) {
        if (!allowed.includes(member.role)) throw new ForbiddenError();
    };

    pickTypeModel(type) {
        if (type === "arrangement")  return ArrangementEvent;
        if (type === "reminder") return ReminderEvent;
        if (type === "task") return TaskEvent;
        return this.repo.events();
    };

    async ensureMember(calendarId, userId) {
        const member = await this.repo.calendarMembers().findOne({
            calendarId: asObjId(calendarId),
            userId: asObjId(userId),
            status: "accepted",
        }).lean();
        if (!member) throw new ForbiddenError();

        return member;
    };

    async listEvents(
        userId,
        calendarId,
        { from, to, types, page = 1, limit = 20 }
    ) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor", "viewer"]);

        const filter = { calendarId: asObjId(calendarId) };

        if (from || to) {
            const range = {};
            if (from) range.$gte = new Date(from);
            if (to) range.$lte = new Date(to);
            filter.$or = [
                { startAt: range },
                { endAt: range },
                { remindAt: range },
                { dueAt: range },
            ];
        }

        if (types) {
            const list = types
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
            filter.$expr = { $in: ["$__t", list] };
        }

        const docs = await this.repo.events().find(filter)
            .sort({ startAt: 1, remindAt: 1, dueAt: 1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const total = await this.repo.events().countDocuments(filter);

        return {
            items: docs.map((d) => ({ ...d, id: d._id })),
            page,
            limit,
            total,
        };
    };

    async getEvent(userId, calendarId, eventId) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor", "viewer"]);

        const doc = await this.repo.events().findOne({
            _id: asObjId(eventId),
            calendarId: asObjId(calendarId),
        }).lean();

        if (!doc) throw new Error("NOT_FOUND");
        return { ...doc, id: doc._id };
    };

    async createEvent(userId, calendarId, {
        title,
        description,
        type,
        allDay,
        startAt,
        endAt,
        location,
        remindAt,
        dueAt,
        isDone,
    }) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor"]);

        const Model = this.pickTypeModel(type);

        const payload = {
            calendarId: asObjId(calendarId),
            createdBy: asObjId(userId),
            title: title,
            description: description,
        };

        if (type === "arrangement") {
            Object.assign(payload, {
                allDay: !!allDay,
                startAt: startAt,
                endAt: endAt,
                location: location,
            });
        } else if (type === "reminder") {
            Object.assign(payload, { remindAt: remindAt });
        } else if (type === "task") {
            Object.assign(payload, { dueAt: dueAt, isDone: !!isDone });
        }

        const doc = await Model.create(payload);
        const lean = doc.toJSON ? doc.toJSON() : doc;
        return { ...lean, id: lean.id ?? String(doc._id) };
    };

    async updateEvent(userId, calendarId, eventId, {
        title,
        description,
        color,
    }) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor"]);

        const opts = { new: true, lean: true };
        const doc = await this.repo.events().findOneAndUpdate(
            { _id: asObjId(eventId), calendarId: asObjId(calendarId) },
            { $set: { title, description, color } },
            opts
        );
        if (!doc) throw new EventNotFoundError();
        return { ...doc, id: doc._id };
    };

    async deleteEvent(userId, calendarId, eventId) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor"]);

        const res = await this.repo.events().findOneAndDelete({
            _id: asObjId(eventId),
            calendarId: asObjId(calendarId),
        }).lean();

        if (!res) throw new EventNotFoundError();
        return true;
    };
}
