import mongoose from "mongoose";
import { Calendar } from "../models/Calendar.js";
import { CalendarMember } from "../models/CalendarMember.js";
import { Event } from "../models/Event.js";

const asObjId = (id) => new mongoose.Types.ObjectId(id);

const ensureMember = async (calendarId, userId) => {
    const member = await CalendarMember.findOne({
        calendarId: asObjId(calendarId),
        userId: asObjId(userId),
        status: "accepted",
    }).lean();
    if (!member) {
        throw new Error("FORBIDDEN");
    }
    return member;
};

const ensureRole = (member, roles) => {
    if (!roles.includes(member.role)) {
        throw new Error("FORBIDDEN");
    }
};

export const createCalendar = async (
    userId,
    { type, name, description, color }
) => {
    if (type === "primary") {
        const existingPrimary = await CalendarMember.findOne({
            userId: asObjId(userId),
            role: "owner",
        })
            .populate({
                path: "calendarId",
                match: { type: "primary" },
                select: "_id",
            })
            .lean();

        if (existingPrimary?.calendarId._id) {
            throw new Error("PRIMARY_EXISTS");
        }
    }

    const cal = await Calendar.create({ type, name, description, color });
    await CalendarMember.create({
        calendarId: cal._id,
        userId: asObjId(userId),
        role: "owner",
        status: "accepted",
    });
    return cal.toJSON();
};

export const listMyCalendars = async (userId) => {
    const memberships = await CalendarMember.find({
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
};

export const getCalendar = async (userId, calendarId) => {
    await ensureMember(calendarId, userId);
    const cal = await Calendar.findById(calendarId).lean();
    if (!cal) {
        throw new Error("NOT_FOUND");
    }
    return { ...cal, id: cal._id };
};

export const updateCalendar = async (userId, calendarId, patch) => {
    const member = await ensureMember(calendarId, userId);
    ensureRole(member, ["owner", "editor"]);
    const updated = await Calendar.findByIdAndUpdate(
        calendarId,
        { $set: patch },
        { new: true }
    ).lean();
    if (!updated) throw new Error("NOT_FOUND");
    return { ...updated, id: updated._id };
};

export const deleteCalendar = async (userId, calendarId) => {
    const member = await ensureMember(calendarId, userId);
    ensureRole(member, ["owner"]);

    await Event.deleteMany({ calendarId: asObjId(calendarId) });
    await CalendarMember.deleteMany({ calendarId: asObjId(calendarId) });
    const res = await Calendar.findByIdAndDelete(calendarId).lean();
    if (!res) throw new Error("NOT_FOUND");
    return true;
};
