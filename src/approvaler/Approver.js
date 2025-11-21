import mongoose from "mongoose";
import crypto from "crypto";

import {TokenInvalidOrExpiredError, TokenTypeMismatchError, UserNotFoundError} from "../core/errors/errors.js";

export const toHash = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

export default class Approver {
    repo;
    mailer;

    constructor(repo, mailer) {
        this.repo = repo;
        this.mailer = mailer;
    }

    async useApprovalToken(rawToken, expectedType) {
        const rec = await this.repo.approvalTokens().findOne({
            tokenHash: toHash(rawToken),
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

    async getApprovalToken(rawToken, expectedType) {
        const rec = await this.repo.approvalTokens().findOne({
            tokenHash: toHash(rawToken),
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
                type:   type,
            })
            .sort({ createdAt: -1 })
            .lean();
    }

    async verifyEmail(rawToken) {
        const rec = await this.useApprovalToken(rawToken, "email_verify");
        const user = await this.repo.users().findById(rec.userId);
        if (!user) throw new UserNotFoundError();

        user.secret.emailVerified = true;
        user.secret.emailVerifiedAt = new Date();
        await user.save();

        return user;
    }

    async sendEmailVerification(to, rawToken) {
        return await this.mailer.sendEmailVerification(to, rawToken);
    }
}