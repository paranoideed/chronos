import bcrypt from "bcryptjs";
import generateToken from "../pkg/jwt.js";
import {
    InvalidCredentialsError,
    UserAlreadyExistsError,
} from "./errors/errors.js";
import mongoose from "mongoose";
import crypto from "crypto";
import {toHash} from "../approvaler/Approver.js";

const deriveNameFromEmail = (email) => {
    const local = email.split("@")[0] || "";
    return (
        local
            .replace(/[._+-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim() ||
        local ||
        ""
    );
};

export default class AuthCore {
    repo;
    approver

    constructor(repo, approver) {
        this.repo = repo;
        this.approver = approver;
    }

    async registerUser(email, password) {
        const normEmail = String(email).trim().toLowerCase();

        const existingUser = await this.repo.users().findOne({
            "email": normEmail,
        }).collation({ locale: "en", strength: 2 });

        if (existingUser) {
            throw new UserAlreadyExistsError();
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await this.repo.users().create({
            email: normEmail,
            secret: { emailVerified: false, passwordHash },
            name: deriveNameFromEmail(normEmail),
        });

        const primaryCal = await this.repo.calendars().create({
            type: "primary",
            name: "My Calendar",
        });

        await this.repo.calendarMembers().create({
            calendarId: primaryCal.id,
            userId: user.id,
            role: "owner",
            status: "accepted",
        });

        const ttl = Number(process.env.EMAIL_VERIFY_TTL_MIN || 60);

        const rawToken = await this.mintSingleUseToken({
            userId: user._id,
            type: "email_verify",
            ttlMinutes: ttl,
        });

        await this.approver.sendEmailVerification(user.email, rawToken);

        return user.toJSON()
    }

    async loginUser(email, password) {
        const normEmail = String(email).trim().toLowerCase();

        const user = await this.repo
            .users()
            .findOne({ "email": normEmail })
            .collation({ locale: "en", strength: 2 })
            .select("+secret.passwordHash");

        if (!user) {
            throw new InvalidCredentialsError();
        }

        const isMatch = await bcrypt.compare(password, user.secret.passwordHash);
        if (!isMatch) {
            throw new InvalidCredentialsError();
        }

        return {
            token: generateToken(user.id),
            user: user.toJSON(),
        };
    }

    async mintSingleUseToken({ userId, type, ttlMinutes = 60, meta = null }) {
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
            userId: userId,
            type: type,
            meta: meta,
            used: false,
            expiresAt: expiresAt,
        });

        return raw;
    }

    async verifyEmailByToken(rawToken) {
        return await this.approver.verifyEmail(rawToken);
    }
}
