import mongoose from "mongoose";
import { Events, ReminderEvent, TaskEvent } from "../repo/models/EventModel.js";
import { CalendarMembers } from "../repo/models/CalendarMemberModel.js";
import {ForbiddenError} from "./errors/error.js";
import repo from "../repo/repo.js";

const asObjId = (id) => new mongoose.Types.ObjectId(id);

export class EventService {
    repo;

    constructor(repo) {
        this.repo = repo;
    }

    async ensureMember(calendarId, userId) {
        const member = await CalendarMembers.findOne({
            calendarId: asObjId(calendarId),
            userId: asObjId(userId),
            status: "accepted",
        }).lean();
        if (!member) throw new ForbiddenError();

        return member;
    };

    ensureRole (member, allowed) {
        if (!allowed.includes(member.role)) throw new ForbiddenError();
    };

    pickTypeModel(type) {
        if (type === "reminder") return ReminderEvent;
        if (type === "task") return TaskEvent;
        return Events;
    };

    async list(
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

        const docs = await Events.find(filter)
            .sort({ startAt: 1, remindAt: 1, dueAt: 1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const total = await Events.countDocuments(filter);

        return {
            items: docs.map((d) => ({ ...d, id: d._id })),
            page,
            limit,
            total,
        };
    };

    async get(userId, calendarId, eventId) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor", "viewer"]);

        const doc = await Events.findOne({
            _id: asObjId(eventId),
            calendarId: asObjId(calendarId),
        }).lean();

        if (!doc) throw new Error("NOT_FOUND");
        return { ...doc, id: doc._id };
    };

    async create(userId, calendarId, data) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor"]);

        const Model = this.pickTypeModel(data.type);

        const payload = {
            calendarId: asObjId(calendarId),
            createdBy: asObjId(userId),
            title: data.title,
            description: data.description,
        };

        if (data.type === "meeting") {
            Object.assign(payload, {
                allDay: !!data.allDay,
                startAt: data.startAt,
                endAt: data.endAt,
                location: data.location,
            });
        } else if (data.type === "reminder") {
            Object.assign(payload, { remindAt: data.remindAt });
        } else if (data.type === "task") {
            Object.assign(payload, { dueAt: data.dueAt, isDone: !!data.isDone });
        }

        const doc = await Model.create(payload);
        const lean = doc.toJSON ? doc.toJSON() : doc;
        return { ...lean, id: lean.id ?? String(doc._id) };
    };

    async update(userId, calendarId, eventId, patch) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor"]);

        const update = { ...patch };
        delete update.calendarId;
        delete update.createdBy;
        delete update.type;

        const opts = { new: true, lean: true };
        const doc = await Events.findOneAndUpdate(
            { _id: asObjId(eventId), calendarId: asObjId(calendarId) },
            { $set: update },
            opts
        );
        if (!doc) throw new Error("NOT_FOUND");
        return { ...doc, id: doc._id };
    };

    async delete(userId, calendarId, eventId) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor"]);

        const res = await Events.findOneAndDelete({
            _id: asObjId(eventId),
            calendarId: asObjId(calendarId),
        }).lean();

        if (!res) throw new Error("NOT_FOUND");
        return true;
    };
}

const eventService = new EventService(repo);
export default eventService;