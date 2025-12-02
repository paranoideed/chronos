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
        const url = `${base?.replace(
            /\/+$/,
            ""
        )}/verify-email?token=${rawToken}`;

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

    async sendCalendarInvite(to, rawToken, { calendarName, role }) {
        const ttl = Number(
            process.env.CALENDAR_INVITE_TTL_MIN || 10080 // 7 days
        );

        const baseUrl =
            process.env.FRONTEND_BASE_URL ||
            process.env.PUBLIC_BASE_URL ||
            process.env.APP_BASE_URL;

        const normalizedBase = (baseUrl || "").replace(/\/+$/, "");
        const acceptUrl = `${normalizedBase}/calendar-invite/accept?token=${rawToken}`;
        const declineUrl = `${normalizedBase}/calendar-invite/decline?token=${rawToken}`;

        const html = `
            <h2>Calendar invitation</h2>
            <p>You have been invited to join the calendar <b>${calendarName}</b> as <b>${role}</b>.</p>
            
            <p>Please choose one option:</p>

            <p>
                <a href="${acceptUrl}" 
                style="
                    display:inline-block;
                    padding:10px 18px;
                    background:#4caf50;
                    color:#fff;
                    text-decoration:none;
                    border-radius:6px;
                    font-weight:bold;
                ">
                Accept invitation
                </a>
            </p>

            <p>
                <a href="${declineUrl}" 
                style="
                    display:inline-block;
                    padding:10px 18px;
                    background:#d9534f;
                    color:#fff;
                    text-decoration:none;
                    border-radius:6px;
                    font-weight:bold;
                ">
                Decline invitation
                </a>
            </p>

            <p>The links are valid for ${ttl} minutes.</p>
        `;

        await this.transporter.sendMail({
            to,
            from: this.from,
            subject: "Calendar invitation",
            html,
        });
    }

    async sendEventInvite(to, rawToken, { eventTitle, invitedBy }) {
        const ttl = Number(
            process.env.EVENT_INVITE_TTL_MIN ||
                process.env.CALENDAR_INVITE_TTL_MIN ||
                10080 // 7 days
        );

        const baseUrl =
            process.env.FRONTEND_BASE_URL ||
            process.env.PUBLIC_BASE_URL ||
            process.env.APP_BASE_URL;

        const normalizedBase = (baseUrl || "").replace(/\/+$/, "");
        const acceptUrl = `${normalizedBase}/event-invite/accept?token=${rawToken}`;
        const declineUrl = `${normalizedBase}/event-invite/decline?token=${rawToken}`;

        const html = `
            <h2>Event invitation</h2>
            <p>You have been invited to view the event <b>${eventTitle}</b>.</p>
            <p>Invitation sent by <b>${invitedBy}</b>.</p>
            
            <p>Please choose one option:</p>

            <p>
                <a href="${acceptUrl}" 
                style="
                    display:inline-block;
                    padding:10px 18px;
                    background:#4caf50;
                    color:#fff;
                    text-decoration:none;
                    border-radius:6px;
                    font-weight:bold;
                ">
                Accept invitation
                </a>
            </p>

            <p>
                <a href="${declineUrl}" 
                style="
                    display:inline-block;
                    padding:10px 18px;
                    background:#d9534f;
                    color:#fff;
                    text-decoration:none;
                    border-radius:6px;
                    font-weight:bold;
                ">
                Decline invitation
                </a>
            </p>

            <p>The links are valid for ${ttl} minutes.</p>
        `;

        await this.transporter.sendMail({
            to,
            from: this.from,
            subject: "Event invitation",
            html,
        });
    }
}
