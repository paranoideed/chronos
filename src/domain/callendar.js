import mongoose from "mongoose";
import type { Repo } from "../repo/Repo.js";
import {CalendarNotFoundError, ForbiddenError, PrimaryCalendarExistsError} from "./errors/error.js";
import repo from "../repo/repo.js";

const asObjId = (id: string): mongoose.Types.ObjectId =>
    new mongoose.Types.ObjectId(id);

class CalendarsService {
    private repo: Repo;

    constructor(repo: Repo) {
        this.repo = repo;
    }

    private async ensureMember(calendarId: string, userId: string) {
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

    private ensureRole(member: any, roles: string[]) {
        if (!roles.includes(member.role)) {
            throw new ForbiddenError(
                "You don't have enough permissions to perform this action"
            );
        }
    }

    public async createCalendar(
        userId: string,
        {
            type,
            name,
            description,
            color,
        }: {
            type: string;
            name: string;
            description?: string;
            color?: string;
        }
    ): Promise<any> {
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

    public async listMyCalendars(userId: string): Promise<any[]> {
        const memberships = await this.repo
            .calendarMembers()
            .find({
                userId: asObjId(userId),
                status: "accepted",
            })
            .populate("calendarId")
            .lean();

        return memberships.map((m: any) => ({
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

    public async getCalendar(
        userId: string,
        calendarId: string
    ): Promise<any> {
        await this.ensureMember(calendarId, userId);

        const cal = await this.repo.calendars().findById(calendarId).lean();
        if (!cal) {
            throw new CalendarNotFoundError();
        }

        return { ...cal, id: cal._id };
    }

    public async updateCalendar(
        userId: string,
        calendarId: string,
        patch: Record<string, any>
    ): Promise<any> {
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

    public async deleteCalendar(
        userId: string,
        calendarId: string
    ): Promise<boolean> {
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

const calendarsService = new CalendarsService(repo);
export default calendarsService;
