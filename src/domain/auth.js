import bcrypt from "bcryptjs";
import { generateToken } from "../pkg/jwt.js";
import { TokenService } from "./tokenService.js";
import MailService from "./mailService.js";
import { InvalidCredentialsError, UserExistsError } from "./errors/error.js";
import repo from "../repo/repo.js";

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

class AuthService {
    repo;

    constructor(repo) {
        this.repo = repo;
    }

    async registerUser( email, password ) {
        const normEmail = String(email).trim().toLowerCase();

        const existingUser = await this.repo.users().findOne({
            "secret.email": normEmail,
        }).collation({ locale: "en", strength: 2 });

        if (existingUser) {
            throw new UserExistsError();
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
        const rawToken = await TokenService.mintSingleUseToken({
            userId: user.id,
            type: "email_verify",
            ttlMinutes: ttl,
        });

        await MailService.sendEmailVerification(user.secret.email, rawToken);

        return {
            message: "Users registered successfully",
            user: user.toJSON(),
        };
    }

    async loginUser( email, password ) {
        const normEmail = String(email).trim().toLowerCase();

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
}

const authService = new AuthService(repo)
export default authService;