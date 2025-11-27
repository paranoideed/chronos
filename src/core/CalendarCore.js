import mongoose from "mongoose";
import {
    CalendarNotFoundError,
    ForbiddenError,
    PrimaryCalendarExistsError,
    UserNotFoundError
} from "./errors/errors.js";
import { mintSingleUseToken } from "../approvaler/tokenUtils.js";

const asObjId = (id) => new mongoose.Types.ObjectId(id);

export default class CalendarCore {
    repo;

    constructor(repo, approver) {
        this.repo = repo;
        this.approver = approver;
    }

    ensureRole(member, roles) {
        if (!roles.includes(member.role)) {
            throw new ForbiddenError(
                "You don't have enough permissions to perform this action"
            );
        }
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

    async createCalendar(userId, { type, name, description, color }) {
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

    async getCalendar(userId, calendarId) {
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
        { type, name, description, color } // я короче не понимаб что тут за патч
    ) {
        const member = await this.ensureMember(calendarId, userId);
        this.ensureRole(member, ["owner", "editor"]);

        const updated = await this.repo
            .calendars()
            .findByIdAndUpdate(
                calendarId,
                { $set: { type, name, description, color } },
                { new: true }
            )
            .lean();

        if (!updated) {
            throw new CalendarNotFoundError();
        }

        return { ...updated, id: updated._id };
    }

    async deleteCalendar(userId, calendarId) {
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

    // --- calendar sharing ---
    async inviteMemberByEmail(currentUserId, calendarId, { email, role }) {
        // только владелец может приглашать
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

        const existingMember = await this.repo.calendarMembers().findOne({
            calendarId: calendar._id,
            userId: user._id,
        });

        if (existingMember && existingMember.status === "accepted") {
            throw new ForbiddenError(
                "User is already a member of this calendar"
            );
        }

        const ttl = Number(
            process.env.CALENDAR_INVITE_TTL_MIN ||
                process.env.EMAIL_VERIFY_TTL_MIN ||
                1440
        );

        const rawToken = await mintSingleUseToken({
            repo: this.repo,
            userId: user._id,
            type: "calendar_invite",
            ttlMinutes: ttl,
            meta: {
                calendarId: calendar._id,
                role, // 'viewer' | 'editor'
            },
        });

        await this.approver.sendCalendarInvite(user.email, rawToken, {
            calendarName: calendar.name,
            role,
        });

        return {
            email: user.email,
            role,
        };
    }

    async acceptInviteByToken(currentUserId, rawToken) {
        const tokenRec = await this.approver.approveCalendarInvite(rawToken);
        // tokenRec: { userId, type: 'calendar_invite', meta: { calendarId, role }, ... }

        if (String(tokenRec.userId) !== String(currentUserId)) {
            throw new ForbiddenError("Token does not belong to this user");
        }

        const { calendarId, role } = tokenRec.meta || {};

        if (!calendarId || !role) {
            throw new ForbiddenError("Invalid calendar invite token");
        }

        const calendar = await this.repo
            .calendars()
            .findById(calendarId)
            .lean();

        if (!calendar) {
            throw new CalendarNotFoundError();
        }

        await this.repo.calendarMembers().updateOne(
            {
                calendarId: calendar._id,
                userId: tokenRec.userId,
            },
            {
                $set: {
                    role,
                    status: "accepted",
                },
            },
            { upsert: true }
        );

        return {
            calendar: {
                id: String(calendar._id),
                name: calendar.name,
                color: calendar.color,
            },
            role,
        };
    }
}
