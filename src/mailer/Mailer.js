import nodemailer from "nodemailer";

export default class Mailer {
    transporter;
    from;

    constructor() {
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
}