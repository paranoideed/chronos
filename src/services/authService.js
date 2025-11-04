import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Calendar } from "../models/Calendar.js";
import { CalendarMember } from "../models/CalendarMember.js";
import { generateToken } from "../utils/jwt.js";
import { TokenService } from "./tokenService.js";
import MailService from "./mailService.js";

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

export const registerUser = async (email, password) => {
    const normEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({
        "secret.email": normEmail,
    }).collation({ locale: "en", strength: 2 });

    if (existingUser) {
        throw new Error("USER_EXISTS");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
        secret: { email: normEmail, passwordHash, emailVerified: false },
        name: deriveNameFromEmail(normEmail),
    });

    const primaryCal = await Calendar.create({
        type: "primary",
        name: "My Calendar",
    });
    await CalendarMember.create({
        calendarId: primaryCal.id,
        userId: user.id,
        role: "owner",
        status: "accepted",
    });

    const ttl = Number(process.env.EMAIL_VERIFY_TTL_MIN || 60);
    const rawToken = await TokenService.mintSingleUseToken({
        userId: user.id,
        type: "email_verify",
        ttlMinutes: ttl,
    });
    await MailService.sendEmailVerification(user.secret.email, rawToken);

    return {
        message: "User registered successfully",
        user: user.toJSON(),
    };
};

export const loginUser = async ({ email, password }) => {
    const normEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ "secret.email": normEmail })
        .collation({ locale: "en", strength: 2 })
        .select("+secret.passwordHash");
    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(password, user.secret.passwordHash);
    if (!isMatch) {
        throw new Error("INVALID_CREDENTIALS");
    }

    // --- uncomment for emailVefified checking ---
    // if (!user.secret.emailVerified) {
    //     throw new Error("EMAIL_NOT_VERIFIED");
    // }

    const token = generateToken(user.id);
    return { token, user: user.toJSON() };
};
