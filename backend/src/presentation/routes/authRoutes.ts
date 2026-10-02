import { Router } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { asyncRoute, authMiddleware, rateLimit } from '../middleware';
import { object } from '../../application/validation';

export function createAuthRoutes(auth: AuthService) {
  const router = Router();
  router.post('/request-otp', rateLimit(10, 10 * 60_000), asyncRoute(async (req, res) => {
    const body = object(req.body);
    res.json(await auth.requestOtp(body.mobile));
  }));
  router.post('/verify-otp', rateLimit(30, 10 * 60_000), asyncRoute(async (req, res) => {
    const body = object(req.body);
    res.json(await auth.verifyOtp(body.mobile, body.code));
  }));
  router.get('/me', authMiddleware(auth), (req, res) => { res.json({ user: req.user }); });
  router.post('/logout', authMiddleware(auth), asyncRoute(async (req, res) => {
    await auth.logout(req.authToken!);
    res.status(204).end();
  }));
  return router;
}
