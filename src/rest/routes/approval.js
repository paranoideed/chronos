import { Router } from 'express';

export default function makeApprovalRoutes({ controller, mw }) {
  const r = Router();

  r.get('/verify-email', controller.verifyEmail);
  r.post('/resend-verification', mw.auth, controller.resendVerification);

  return r;
}