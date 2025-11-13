import approvalService from "../../domain/approval.js";
import {approveRequestSchema, resendVerificationSchema} from "../requests/approval.js";
import z from "zod";

export default class ApprovalController {
    approvalService;
    userService;
    mailService;

    constructor(service, userService, mailService) {
        this.approvalService = service;
        this.userService = userService;
        this.mailService = mailService;
    }

    async verifyEmail(req, res, next) {
        const candidate = {
            token: req.query.token,
        };

        const parsed = approveRequestSchema.safeParse(candidate);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const rec = await this.approvalService.consume(candidate.token, "email_verify");

            const user = await this.userService.get(rec.userId);
            if (!user) {
                console.log("User not found for ID:", rec.userId);
                return res.status(404).json({ message: "Users not found" });
            }

            if (!user.secret) user.secret = {};
            user.secret.emailVerified = true;
            user.secret.emailVerifiedAt = new Date();
            await user.save();

            return res.status(200).json({ message: "Email verified successfully" });
        } catch (err) {
            console.error("Email verification error:", err);
            next(err);
        }
    }
    
    async resendVerification(req, res, next) {
        const candidate = {
            userId: req.user?.id,
            email: req.body?.email,
        };
        
        const parsed = resendVerificationSchema.safeParse(candidate);
        if (!parsed.success) {
            console.log("Validation error:", parsed.error.issues);
            return res.status(400).json(z.treeifyError(parsed.error));
        }
        
        try {
            const user = candidate.userId
                ? await this.userService.get(candidate.userId)
                : await this.userService.getByEmail(String(candidate.email).trim().toLowerCase());
        } catch (err) {
            console.error("Resend verification error:", err);
            next(err);
        }
    }
}
