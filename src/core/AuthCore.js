import bcrypt from "bcryptjs";
import generateToken from "../pkg/jwt.js";
import {
    InvalidCredentialsError,
    TokenInvalidOrExpiredError,
    TokenTypeMismatchError,
    UserAlreadyExistsError
} from "./errors/errors.js";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import crypto from "crypto";

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

const toHash = (raw) =>
    crypto.createHash("sha256").update(raw).digest("hex");

export default class AuthCore {
    repo;
    transporter;
    from;

    constructor(repo) {
        this.repo = repo;
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT || 587),
            secure: String(process.env.MAIL_SECURE).toLowerCase() === "true",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
        this.from = process.env.MAIL_FROM || process.env.MAIL_USER;
    }

    async registerUser( email, password ) {
        const normEmail = String(email).trim().toLowerCase();

        const existingUser = await this.repo.users().findOne({
            "secret.email": normEmail,
        }).collation({ locale: "en", strength: 2 });

        if (existingUser) {
            throw new UserAlreadyExistsError();
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await this.repo.users().create({
            secret: { email: normEmail, passwordHash, emailVerified: false },
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

        // раньшы ты от сюда вызывала другой сервис или core как сейчас я его назвал
        // нельзя вызвать из одного домейн сущности другую такую сущность равную по значению
        // поэтому этот метод должен быть в этом сервисе
        // читай ниже в этом файле я там расписал подробнее
        const rawToken = await this.mintSingleUseToken({
            userId: user._id,
            type: "email_verify",
            ttlMinutes: ttl,
        });

        await this.sendEmailVerification(user.secret.email, rawToken);

        return {
            message: "Users registered successfully",
            user: user.toJSON(),
        };
    }

    async loginUser( email, password ) {
        const normEmail = String(email).trim().toLowerCase();
        console.log("repo keys:", Object.keys(this.repo));
        console.log("typeof this.repo.users:", typeof this.repo.users);
        const user = await this.repo.users().findOne({ "secret.email": normEmail })
            .collation({ locale: "en", strength: 2 })
            .select("+secret.passwordHash");

        if (!user) {
            throw new InvalidCredentialsError();
        }

        const isMatch = await bcrypt.compare(password, user.secret.passwordHash);
        if (!isMatch) {
            throw new InvalidCredentialsError();
        }

        // --- uncomment for emailVefified checking ---
        // if (!user.secret.emailVerified) {
        //     throw new Error("EMAIL_NOT_VERIFIED");
        // }

        return {
            token: generateToken(user.id),
            user: user.toJSON(),
        };
    }

    // эти два метода по сути про вторизацию так что пускай будут в этом сервисе как я писал ранее
    // нельзя вызывать из одного домейн сущности другую такую сущность равную по значению
    // например тут нужно юзать сервис апрувал токенов для создания токена
    // и в теории мы могли так сдлать объявив каждый сервис в онтаксе в кажом файле и вызывать их в друг друге
    // но это макимальный редфлаг архитектурный и рассуж ты решили делать правиьльно через инициализацию все
    // в одном файле, то тогда нужно правильно организовать код, так что эти методы должны быть в этом сервисе
    // они должны быть приватными в теории но это блядский джс так что так надеюсь нормально объяснил
    async sendEmailVerification(to, rawToken) {
        const ttl = Number(process.env.EMAIL_VERIFY_TTL_MIN || 60);
        const base =
            process.env.FRONTEND_BASE_URL ||
            process.env.PUBLIC_BASE_URL ||
            process.env.APP_BASE_URL;
        const url = `${base?.replace(/\/+$/, "")}/verify-email?token=${rawToken}`;

        const html = `
            <h2>Email Verification</h2>
            <p>Hello! Please confirm your email by clicking the link below:</p>
            <p><a href="${url}">${url}</a></p>
            <p>The link is valid for ${ttl} minutes.</p>
        `;
        await this.transporter.sendMail({
            to,
            from: this.from,
            subject: "Email Verification",
            html,
        });
    }

    // это второй метод связанный с токенами, который должен быть тут по тем же причинам что и выше
    async mintSingleUseToken({
        userId,
        type,
        ttlMinutes = 60,
        meta = null,
    }) {
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
            //userId: new mongoose.Types.ObjectId(userId),
            userId,
            type,
            meta,
            used: false,
            expiresAt,
        });

        return raw;
    }

    // похуй пусть тут будут эти методы связанные с токенами
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
