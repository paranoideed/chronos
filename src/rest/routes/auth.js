import { Router } from 'express';
import { loginSchema, registerSchema } from '../requests/auth.js';

export default function makeAuthRoutes({ controller, mw }) {
  const r = Router();

  r.post(
    '/register',
    mw.validate({ body: registerSchema }),
    (req, res, next) => controller.register(req, res, next)
  );

  r.post(
    '/login',
    mw.validate({ body: loginSchema }),
    (req, res, next) => controller.login(req, res, next)
  );

  r.post('/logout', mw.auth, (req, res, next) => controller.logout(req, res, next));

  return r;
}