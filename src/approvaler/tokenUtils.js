import mongoose from "mongoose";
import crypto from "crypto";
import { toHash } from "./Approver.js";

export async function mintSingleUseToken({
    repo,
    userId,
    type,
    ttlMinutes = 60,
    meta = null,
}) {
    const baseFilter = {
        userId: new mongoose.Types.ObjectId(userId),
        type,
        used: false,
        expiresAt: { $gt: new Date() },
    };

    if (type === "calendar_invite" && meta?.calendarId) {
        baseFilter["meta.calendarId"] = meta.calendarId;
    }

    await repo.approvalTokens().updateMany(baseFilter, {
        $set: { used: true },
    });

    const raw = crypto.randomBytes(32).toString("hex");
    const hash = toHash(raw);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await repo.approvalTokens().create({
        tokenHash: hash,
        userId,
        type,
        meta,
        used: false,
        expiresAt,
    });

    return raw;
}
