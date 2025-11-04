import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Calendar } from "../models/Calendar.js";
import { CalendarMember } from "../models/CalendarMember.js";
import { generateToken } from "../utils/jwt.js";

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

    const token = generateToken(user.id);
    return { token, user: user.toJSON() };
};
