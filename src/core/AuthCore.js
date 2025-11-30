import bcrypt from "bcryptjs";
import generateToken from "../pkg/jwt.js";
import {
    InvalidCredentialsError,
    UserAlreadyExistsError,
} from "./errors/errors.js";
// import mongoose from "mongoose";
// import crypto from "crypto";
// import {toHash} from "../approvaler/Approver.js";
import { mintSingleUseToken } from "../approvaler/tokenUtils.js";
import {email} from "zod";
import {asObjId} from "./UserCore.js";

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

        const rawToken = await mintSingleUseToken({
            repo: this.repo,
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

    async deleteUser(id) {
        const userObjectId = asObjId(id);

        await this.repo.approvalTokens().deleteMany({ userId: userObjectId });

        const ownerMembers = await this.repo
            .calendarMembers()
            .find({ userId: userObjectId, role: "owner" })
            .lean();

        const calendars = ownerMembers.map(m => m.calendarId);

        let eventIds = [];

        if (calendars.length > 0) {
            const eventDocs = await this.repo
                .events()
                .find({ calendarId: { $in: calendars } }, { _id: 1 })
                .lean();

            eventIds = eventDocs.map(e => e._id);

            await Promise.all([
                eventIds.length > 0
                    ? this.repo.eventMembers().deleteMany({ eventId: { $in: eventIds } })
                    : Promise.resolve(),
                this.repo.calendars().deleteMany({ _id: { $in: calendars } }),
                this.repo.calendarMembers().deleteMany({ calendarId: { $in: calendars } }),
                this.repo.events().deleteMany({ calendarId: { $in: calendars } }),
                eventIds.length > 0
                    ? this.repo.notifications().deleteMany({ eventId: { $in: eventIds } })
                    : Promise.resolve(),
            ]);
        }

        await Promise.all([
            this.repo.calendarMembers().deleteMany({ userId: userObjectId }),
            this.repo.eventMembers().deleteMany({ userId: userObjectId }),
            this.repo.notifications().deleteMany({ userId: userObjectId }),
        ]);

        await this.repo.users().deleteOne({ _id: userObjectId });

        return true;
    }


    async verifyEmailByToken(rawToken) {
        return await this.approver.verifyEmail(rawToken);
    }
}
