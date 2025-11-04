import crypto from "crypto";
import { UserToken } from "../models/UserToken.js";
import mongoose from "mongoose";

const toHash = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

export const TokenService = {
    async mintSingleUseToken({ userId, type, ttlMinutes = 60, meta = null }) {
        await UserToken.updateMany(
            {
                userId: new mongoose.Types.ObjectId(userId),
                type,
                used: false,
                expiresAt: { $gt: new Date() },
            },
            { $set: { used: true } }
        );

        const raw = crypto.randomBytes(32).toString("hex");
        const hash = toHash(raw);
        const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

        await UserToken.create({
            tokenHash: hash,
            userId,
            type,
            meta,
            expiresAt,
        });
        return raw;
    },

    async consume(rawToken, expectedType) {
        const hash = toHash(rawToken);
        const rec = await UserToken.findOne({
            tokenHash: hash,
            used: false,
            expiresAt: { $gt: new Date() },
        });

        if (!rec) throw new Error("TOKEN_INVALID_OR_EXPIRED");
        if (rec.type !== expectedType) throw new Error("TOKEN_TYPE_MISMATCH");

        rec.used = true;
        await rec.save();
        return rec;
    },

    async peek(rawToken, expectedType) {
        const hash = toHash(rawToken);
        const rec = await UserToken.findOne({
            tokenHash: hash,
            used: false,
            expiresAt: { $gt: new Date() },
        });
        if (!rec) throw new Error("TOKEN_INVALID_OR_EXPIRED");
        if (rec.type !== expectedType) throw new Error("TOKEN_TYPE_MISMATCH");
        return rec;
    },

    async lastByUserAndType(userId, type) {
        return UserToken.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            type,
        })
            .sort({ createdAt: -1 })
            .lean();
    },
};
