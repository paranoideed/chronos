import mongoose from "mongoose";
import {
    EventNotFoundError,
    ForbiddenError,
    CalendarNotFoundError,
    UserNotFoundError,
} from "./errors/errors.js";
import {
    ReminderEvent,
    TaskEvent,
    ArrangementEvent,
} from "../repo/models/eventModel.js";
import { mintSingleUseToken } from "../approvaler/tokenUtils.js";

const asObjId = (id) => new mongoose.Types.ObjectId(id);

export default class EventCore {
    repo;
    approver;

    constructor(repo, approver) {
        this.repo = repo;
        this.approver = approver;
    }

    ensureRole(member, allowed) {
        if (!allowed.includes(member.role)) throw new ForbiddenError();
    }

    pickTypeModel(type) {
        if (type === "arrangement") return ArrangementEvent;
        if (type === "reminder") return ReminderEvent;
        if (type === "task") return TaskEvent;
        return this.repo.events();
    }

    async ensureMember(calendarId, userId) {
        const member = await this.repo
            .calendarMembers()
            .findOne({
                calendarId: asObjId(calendarId),
                userId: asObjId(userId),
                status: "accepted",
            })
            .lean();
        if (!member) throw new ForbiddenError();

        return member;
    }

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

        const docs = await this.repo
            .events()
            .find(filter)
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
    }

    async getEvent(userId, calendarId, eventId) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor", "viewer"]);

        const doc = await this.repo
            .events()
            .findOne({
                _id: asObjId(eventId),
                calendarId: asObjId(calendarId),
            })
            .lean();

        if (!doc) throw new EventNotFoundError("NOT_FOUND");
        return { ...doc, id: doc._id };
    }

    async getEvent(userId, calendarId, eventId) {
        const doc = await this.repo
            .events()
            .findOne({
                _id: asObjId(eventId),
                calendarId: asObjId(calendarId),
            })
            .lean();

        if (!doc) throw new EventNotFoundError("NOT_FOUND");

        let member = null;
        try {
            member = await this.ensureMember(calendarId, userId);
        } catch (err) {
            if (!(err instanceof ForbiddenError)) {
                throw err;
            }
        }

        if (member) {
            this.ensureRole(member, ["owner", "editor", "viewer"]);
            return { ...doc, id: doc._id };
        }

        const eventMember = await this.repo
            .eventMembers()
            .findOne({
                eventId: doc._id,
                userId: asObjId(userId),
                status: "accepted",
            })
            .lean();

        if (!eventMember) {
            throw new ForbiddenError();
        }

        return { ...doc, id: doc._id };
    }

    async createEvent(
        userId,
        calendarId,
        {
            title,
            description,
            type,
            allDay,
            startAt,
            endAt,
            remindAt,
            dueAt,
            isDone,
        }
    ) {
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
            });
        } else if (type === "reminder") {
            Object.assign(payload, { remindAt: remindAt });
        } else if (type === "task") {
            Object.assign(payload, { dueAt: dueAt, isDone: !!isDone });
        }

        const doc = await Model.create(payload);
        const lean = doc.toJSON ? doc.toJSON() : doc;
        return { ...lean, id: lean.id ?? String(doc._id) };
    }

    async updateEvent(userId, calendarId, eventId, body) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor"]);

        const existing = await this.repo
            .events()
            .findOne({
                _id: asObjId(eventId),
                calendarId: asObjId(calendarId),
            })
            .lean();

        if (!existing) {
            throw new EventNotFoundError();
        }

        const Model = this.pickTypeModel(existing.type);

        const {
            title,
            description,
            color,
            allDay,
            startAt,
            endAt,
            remindAt,
            dueAt,
            isDone,
        } = body;

        const update = {};

        if (title !== undefined) update.title = title;
        if (description !== undefined) update.description = description;
        if (color !== undefined) update.color = color;

        if (allDay !== undefined) update.allDay = allDay;
        if (startAt !== undefined) update.startAt = startAt;
        if (endAt !== undefined) update.endAt = endAt;
        if (remindAt !== undefined) update.remindAt = remindAt;
        if (dueAt !== undefined) update.dueAt = dueAt;
        if (isDone !== undefined) update.isDone = isDone;

        const opts = { new: true, lean: true };

        const doc = await Model.findOneAndUpdate(
            { _id: asObjId(eventId), calendarId: asObjId(calendarId) },
            { $set: update },
            opts
        );

        if (!doc) throw new EventNotFoundError();
        return { ...doc, id: doc._id ?? String(doc._id) };
    }

    async deleteEvent(userId, calendarId, eventId) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor"]);

        const res = await this.repo
            .events()
            .findOneAndDelete({
                _id: asObjId(eventId),
                calendarId: asObjId(calendarId),
            })
            .lean();

        if (!res) throw new EventNotFoundError();
        return true;
    }

    // --- event sharing ---
    async inviteMemberByEmail(currentUserId, calendarId, eventId, { email }) {
        const member = await this.ensureMember(calendarId, currentUserId);
        this.ensureRole(member, ["owner"]);

        const normEmail = String(email).trim().toLowerCase();

        const user = await this.repo
            .users()
            .findOne({ email: normEmail })
            .collation({ locale: "en", strength: 2 });

        if (!user) {
            throw new UserNotFoundError("User with this email does not exist");
        }

        const calendar = await this.repo
            .calendars()
            .findById(calendarId)
            .lean();

        if (!calendar) {
            throw new CalendarNotFoundError();
        }

        const event = await this.repo
            .events()
            .findOne({
                _id: asObjId(eventId),
                calendarId: asObjId(calendarId),
            })
            .lean();

        if (!event) {
            throw new EventNotFoundError();
        }

        const existingMember = await this.repo.eventMembers().findOne({
            eventId: event._id,
            userId: user._id,
        });

        if (existingMember) {
            if (existingMember.status === "accepted") {
                throw new ForbiddenError(
                    "User is already a member of this event"
                );
            }

            if (existingMember.status === "pending") {
                throw new ForbiddenError(
                    "User already has a pending invite to this event"
                );
            }

            if (existingMember.status === "declined") {
                // re-invite after decline
                await this.repo
                    .eventMembers()
                    .updateOne(
                        { _id: existingMember._id },
                        { $set: { status: "pending" } }
                    );
            }
        } else {
            // invite new user
            await this.repo.eventMembers().create({
                eventId: event._id,
                userId: user._id,
                status: "pending",
            });
        }

        const ttl = Number(
            process.env.EVENT_INVITE_TTL_MIN ||
                process.env.CALENDAR_INVITE_TTL_MIN ||
                process.env.EMAIL_VERIFY_TTL_MIN ||
                1440
        );

        const rawToken = await mintSingleUseToken({
            repo: this.repo,
            userId: user._id,
            type: "event_invite",
            ttlMinutes: ttl,
            meta: {
                eventId: event._id,
                calendarId: calendar._id,
            },
        });
        
        const inviter = await this.repo
            .users()
            .findById(asObjId(currentUserId))
            .lean();

        await this.approver.sendEventInvite(user.email, rawToken, {
            eventTitle: event.title,
            invitedBy: inviter.email,
        });

        return {
            email: user.email,
            eventId: String(event._id),
        };
    }

    async acceptEventInviteByToken(currentUserId, rawToken) {
        const tokenRec = await this.approver.approveEventInvite(rawToken);
        // tokenRec: { userId, type: 'event_invite', meta: { eventId, calendarId? }, ... }

        if (String(tokenRec.userId) !== String(currentUserId)) {
            throw new ForbiddenError("Token does not belong to this user");
        }

        const { eventId } = tokenRec.meta || {};

        if (!eventId) {
            throw new ForbiddenError("Invalid event invite token");
        }

        const event = await this.repo.events().findById(eventId).lean();

        if (!event) {
            throw new EventNotFoundError();
        }

        const member = await this.repo.eventMembers().findOne({
            eventId: event._id,
            userId: tokenRec.userId,
        });

        if (!member) {
            throw new ForbiddenError("No pending invite found for this user");
        }

        await this.repo.eventMembers().updateOne(
            { _id: member._id },
            {
                $set: {
                    status: "accepted",
                },
            }
        );

        return {
            event: {
                id: String(event._id),
                calendarId: String(event.calendarId),
                title: event.title,
                color: event.color,
            },
        };
    }

    async declineEventInviteByToken(currentUserId, rawToken) {
        const tokenRec = await this.approver.approveEventInvite(rawToken);

        if (String(tokenRec.userId) !== String(currentUserId)) {
            throw new ForbiddenError("Token does not belong to this user");
        }

        const { eventId } = tokenRec.meta || {};

        if (!eventId) {
            throw new ForbiddenError("Invalid event invite token");
        }

        const event = await this.repo.events().findById(eventId).lean();

        if (!event) {
            throw new EventNotFoundError();
        }

        const member = await this.repo.eventMembers().findOne({
            eventId: event._id,
            userId: tokenRec.userId,
        });

        if (!member) {
            throw new ForbiddenError("No pending invite found for this user");
        }

        if (member.status === "accepted") {
            throw new ForbiddenError("Invite has already been accepted");
        }

        await this.repo.eventMembers().updateOne(
            { _id: member._id },
            {
                $set: {
                    status: "declined",
                },
            }
        );

        return {
            success: true,
        };
    }

    async listSharedEvents(userId, query = {}) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit =
            Number(query.limit) > 0 && Number(query.limit) <= 100
                ? Number(query.limit)
                : 20;

        const { from, to, types } = query;

        const memberships = await this.repo
            .eventMembers()
            .find({
                userId: asObjId(userId),
                status: "accepted",
            })
            .select("eventId")
            .lean();

        if (!memberships.length) {
            return {
                items: [],
                page,
                limit,
                total: 0,
            };
        }

        const eventIds = memberships.map((m) => m.eventId);

        const filter = {
            _id: { $in: eventIds },
        };

        // filter startAt / endAt / remindAt / dueAt
        const dateRange = {};
        if (from) {
            const fromDate = new Date(from);
            if (!Number.isNaN(fromDate.getTime())) {
                dateRange.$gte = fromDate;
            }
        }
        if (to) {
            const toDate = new Date(to);
            if (!Number.isNaN(toDate.getTime())) {
                dateRange.$lte = toDate;
            }
        }

        if (Object.keys(dateRange).length > 0) {
            filter.$or = [
                { startAt: dateRange },
                { endAt: dateRange },
                { remindAt: dateRange },
                { dueAt: dateRange },
            ];
        }

        // filter TaskEvent / ReminderEvent / ArrangementEvent
        if (types) {
            const list = String(types)
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            if (list.length) {
                filter.$expr = { $in: ["$__t", list] };
            }
        }

        const cursor = this.repo
            .events()
            .find(filter)
            .sort({
                startAt: 1,
                remindAt: 1,
                dueAt: 1,
                createdAt: -1,
            })
            .skip((page - 1) * limit)
            .limit(limit);

        const docs = await cursor.lean();
        const total = await this.repo.events().countDocuments(filter);

        const items = docs.map((doc) => {
            return {
                ...doc,
                id: String(doc._id),
            };
        });

        return {
            items,
            page,
            limit,
            total,
        };
    }

    async listEventMembers(currentUserId, calendarId, eventId) {
        const currentMember = await this.ensureMember(
            calendarId,
            currentUserId
        );

        const event = await this.repo
            .events()
            .findOne({
                _id: asObjId(eventId),
                calendarId: asObjId(calendarId),
            })
            .lean();

        if (!event) {
            throw new EventNotFoundError();
        }

        if (currentMember.role === "owner") {
            const members = await this.repo
                .eventMembers()
                .find({ eventId: event._id })
                .populate("userId")
                .lean();

            return members.map((m) => ({
                status: m.status,
                joinedAt: m.createdAt,
                user: m.userId
                    ? {
                          id: String(m.userId._id),
                          email: m.userId.email,
                          name: m.userId.name,
                          avatar: m.userId.avatar,
                      }
                    : null,
            }));
        }

        const selfMember = await this.repo
            .eventMembers()
            .findOne({
                eventId: event._id,
                userId: asObjId(currentUserId),
                status: { $in: ["pending", "accepted"] },
            })
            .lean();

        if (!selfMember) {
            throw new ForbiddenError("You are not a member of this event");
        }

        const members = await this.repo
            .eventMembers()
            .find({
                eventId: event._id,
                status: { $in: ["pending", "accepted"] },
            })
            .populate("userId")
            .lean();

        return members.map((m) => ({
            status: m.status,
            joinedAt: m.createdAt,
            user: m.userId
                ? {
                      id: String(m.userId._id),
                      email: m.userId.email,
                      name: m.userId.name,
                      avatar: m.userId.avatar,
                  }
                : null,
        }));
    }

    async removeEventMember(currentUserId, calendarId, eventId, targetUserId) {
        const member = await this.ensureMember(calendarId, currentUserId);
        this.ensureRole(member, ["owner"]);

        const event = await this.repo
            .events()
            .findOne({
                _id: asObjId(eventId),
                calendarId: asObjId(calendarId),
            })
            .lean();

        if (!event) {
            throw new EventNotFoundError();
        }

        const targetUser = await this.repo
            .users()
            .findById(asObjId(targetUserId))
            .lean();

        if (!targetUser) {
            throw new UserNotFoundError("User not found");
        }

        const result = await this.repo.eventMembers().deleteOne({
            eventId: event._id,
            userId: targetUser._id,
            status: { $in: ["pending", "accepted"] },
        });

        if (!result.deletedCount) {
            throw new ForbiddenError(
                "Event member not found or cannot be removed"
            );
        }

        return {
            success: true,
        };
    }
}
