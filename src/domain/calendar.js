import mongoose from "mongoose";
import {
    CalendarNotFoundError,
    ForbiddenError,
    PrimaryCalendarExistsError,
} from "./errors/error.js";

const asObjId = (id) => new mongoose.Types.ObjectId(id);

export default class CalendarsService {
    repo;

    constructor(repo) {
        this.repo = repo;
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

        if (!member) {
            throw new ForbiddenError("You are not a member of this calendar");
        }

        return member;
    }

    ensureRole(member, roles) {
        if (!roles.includes(member.role)) {
            throw new ForbiddenError(
                "You don't have enough permissions to perform this action"
            );
        }
    }

    async createCalendar(
        userId,
        {
            type,
            name,
            description,
            color,
        }
    ) {
        if (type === "primary") {
            const existingPrimary = await this.repo
                .calendarMembers()
                .findOne({
                    userId: asObjId(userId),
                    role: "owner",
                })
                .populate({
                    path: "calendarId",
                    match: { type: "primary" },
                    select: "_id",
                })
                .lean();

            if (existingPrimary?.calendarId?._id) {
                throw new PrimaryCalendarExistsError();
            }
        }

        const cal = await this.repo
            .calendars()
            .create({ type, name, description, color });

        await this.repo.calendarMembers().create({
            calendarId: cal._id,
            userId: asObjId(userId),
            role: "owner",
            status: "accepted",
        });

        return cal.toJSON();
    }

    async listMyCalendars(userId) {
        const memberships = await this.repo
            .calendarMembers()
            .find({
                userId: asObjId(userId),
                status: "accepted",
            })
            .populate("calendarId")
            .lean();

        return memberships.map((m) => ({
            role: m.role,
            joinedAt: m.createdAt,
            calendar: m.calendarId
                ? {
                    id: String(m.calendarId._id),
                    type: m.calendarId.type,
                    name: m.calendarId.name,
                    description: m.calendarId.description,
                    color: m.calendarId.color,
                    createdAt: m.calendarId.createdAt,
                    updatedAt: m.calendarId.updatedAt,
                }
                : null,
        }));
    }

    async getCalendar(
        userId,
        calendarId
    ) {
        await this.ensureMember(calendarId, userId);

        const cal = await this.repo.calendars().findById(calendarId).lean();
        if (!cal) {
            throw new CalendarNotFoundError();
        }

        return { ...cal, id: cal._id };
    }

    async updateCalendar(
        userId,
        calendarId,
        patch
    ) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor"]);

        const updated = await this.repo
            .calendars()
            .findByIdAndUpdate(calendarId, { $set: patch }, { new: true })
            .lean();

        if (!updated) {
            throw new CalendarNotFoundError();
        }

        return { ...updated, id: updated._id };
    }

    async deleteCalendar(
        userId,
        calendarId
    ) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner"]);

        await this.repo
            .events()
            .deleteMany({ calendarId: asObjId(calendarId) });
        await this.repo
            .calendarMembers()
            .deleteMany({ calendarId: asObjId(calendarId) });

        const res = await this.repo
            .calendars()
            .findByIdAndDelete(calendarId)
            .lean();

        if (!res) {
            throw new CalendarNotFoundError();
        }

        return true;
    }
}
