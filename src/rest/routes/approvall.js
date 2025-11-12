import authRouter from "./auth.js";

authRouter.get('/verify-email', verifyEmail);
authRouter.post('/resend-verification', resendVerification);