import crypto from "crypto";
import mongoose from "mongoose";
import type { Repo } from "../repo/Repo.js";
import {TokenInvalidOrExpiredError, TokenTypeMismatchError} from "./errors/error.js";
import repo from "../repo/Repo.js";

const toHash = (raw: string): string =>
    crypto.createHash("sha256").update(raw).digest("hex");

type MintSingleUseTokenArgs = {
    userId: string;
    type: string;
    ttlMinutes?: number;
    meta?: any;
};

class ApprovalService {
    private repo: Repo;

    constructor(repo: Repo) {
        this.repo = repo;
    }

    public async mintSingleUseToken({
        userId,
        type,
        ttlMinutes = 60,
        meta = null,
    }: MintSingleUseTokenArgs): Promise<string> {
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

    public async consume(rawToken: string, expectedType: string): Promise<any> {
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

    public async peek(rawToken: string, expectedType: string): Promise<any> {
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

    public async lastByUserAndType(userId: string, type: string): Promise<any> {
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