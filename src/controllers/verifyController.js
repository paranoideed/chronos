import { TokenService } from "../services/tokenService.js";
import { User } from "../models/User.js";

export const verifyEmail = async (req, res) => {
    try {
        const raw = String(req.query.token || "");
        if (!raw) return res.status(400).json({ message: "Token is required" });

        const rec = await TokenService.consume(raw, "email_verify");
        const user = await User.findById(rec.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.secret) user.secret = {};
        user.secret.emailVerified = true;
        user.secret.emailVerifiedAt = new Date();
        await user.save();

        return res.json({ message: "Email verified successfully" });
    } catch (err) {
        if (err.message === "TOKEN_INVALID_OR_EXPIRED") {
            return res
                .status(400)
                .json({ message: "Token invalid or expired" });
        }
        if (err.message === "TOKEN_TYPE_MISMATCH") {
            return res.status(400).json({ message: "Token type mismatch" });
        }
        return res
            .status(500)
            .json({ message: `Server error: ${err.message}` });
    }
};

export const resendVerification = async (req, res) => {
    try {
        const userId = req.user?.id;
        const email = req.body?.email;

        const user = userId
            ? await User.findById(userId)
            : await User.findOne({
                  "secret.email": String(email).trim().toLowerCase(),
              });

        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.secret?.emailVerified) {
            return res.status(200).json({ message: "Email already verified" });
        }

        const cooldownSec = Number(
            process.env.VERIFY_RESEND_COOLDOWN_SEC || 60
        );
        const last = await TokenService.lastByUserAndType(
            user.id,
            "email_verify"
        );
        if (
            last &&
            Date.now() - new Date(last.createdAt).getTime() < cooldownSec * 1000
        ) {
            const wait = Math.ceil(
                (cooldownSec * 1000 -
                    (Date.now() - new Date(last.createdAt).getTime())) /
                    1000
            );
            return res.status(429).json({
                message: `Please wait ${wait} seconds before requesting again`,
            });
        }

        const ttl = Number(process.env.EMAIL_VERIFY_TTL_MIN || 60);
        const raw = await TokenService.mintSingleUseToken({
            userId: user.id,
            type: "email_verify",
            ttlMinutes: ttl,
        });

        const { default: MailService } = await import(
            "../services/mailService.js"
        );
        await MailService.sendEmailVerification(user.secret.email, raw);

        return res.json({ message: "Verification email sent" });
    } catch (err) {
        return res
            .status(500)
            .json({ message: `Server error: ${err.message}` });
    }
};
