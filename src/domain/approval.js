import crypto from "crypto";
import mongoose from "mongoose";
import {
    TokenInvalidOrExpiredError,
    TokenTypeMismatchError,
} from "./errors/error.js";
import repo from "../repo/repo.js";

const toHash = (raw) =>
    crypto.createHash("sha256").update(raw).digest("hex");

class ApprovalService {
    repo;

    constructor(repo) {
        this.repo = repo;
    }

    async mintSingleUseToken(
        userId,
        type,
        ttlMinutes = 60,
        meta = null,
    ) {
        await this.repo.approvalTokens().updateMany(
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

        await this.repo.approvalTokens().create({
            tokenHash: hash,
            userId,
            type,
            meta,
            expiresAt,
        });

        return raw;
    }

    async consume(rawToken, expectedType) {
        const hash = toHash(rawToken);
        const rec = await this.repo.approvalTokens().findOne({
            tokenHash: hash,
            used: false,
            expiresAt: { $gt: new Date() },
        });

        if (!rec) {
            throw new TokenInvalidOrExpiredError();
        }
        if (rec.type !== expectedType) {
            throw new TokenTypeMismatchError();
        }

        rec.used = true;
        await rec.save();

        return rec;
    }

    async peek(rawToken, expectedType) {
        const hash = toHash(rawToken);
        const rec = await this.repo.approvalTokens().findOne({
            tokenHash: hash,
            used: false,
            expiresAt: { $gt: new Date() },
        });

        if (!rec) {
            throw new TokenInvalidOrExpiredError();
        }
        if (rec.type !== expectedType) {
            throw new TokenTypeMismatchError();
        }

        return rec;
    }

    async lastByUserAndType(userId, type) {
        return this.repo
            .approvalTokens()
            .findOne({
                userId: new mongoose.Types.ObjectId(userId),
                type,
            })
            .sort({ createdAt: -1 })
            .lean();
    }
}

const approvalService = new ApprovalService(repo);
export default approvalService;