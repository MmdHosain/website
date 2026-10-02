import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthService } from '../application/services/AuthService';
import { HttpError } from '../application/errors';
import { User } from '../domain/entities/User';
export { requirePermission } from './permissions';

declare global { namespace Express { interface Request { user?: User; authToken?: string; } } }
export function asyncRoute(handler: (req: Request, res: Response) => Promise<unknown>): RequestHandler {
  return (req, res, next) => { Promise.resolve(handler(req, res)).catch(next); };
}
export function authMiddleware(auth: Pick<AuthService, 'authenticate'>): RequestHandler {
  return (req, _res, next) => {
    const authorization = req.header('Authorization') ?? '';
    if (!authorization.startsWith('Bearer ')) return next(new HttpError(401, 'Sign in to continue'));
    req.authToken = authorization.slice(7);
    auth.authenticate(req.authToken).then(user => { req.user = user; next(); }).catch(next);
  };
}
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(new HttpError(403, 'Administrator access is required'));
  next();
};
export function rateLimit(max: number, windowMs: number): RequestHandler {
  const requests = new Map<string, { start: number; count: number }>();
  return (req, res, next) => {
    const now = Date.now();
    if (requests.size > 10000) for (const [key, value] of requests) if (now - value.start > windowMs) requests.delete(key);
    const key = req.ip || 'unknown';
    let entry = requests.get(key);
    if (!entry || now - entry.start >= windowMs) { entry = { start: now, count: 0 }; requests.set(key, entry); }
    entry.count++;
    if (entry.count > max) { res.setHeader('Retry-After', Math.ceil((windowMs - (now - entry.start)) / 1000)); return next(new HttpError(429, 'Too many requests; please try again later')); }
    next();
  };
}
export function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction): void {
  if (res.headersSent) return;
  if (error?.type === 'entity.parse.failed') { res.status(400).json({ error: 'Invalid JSON body' }); return; }
  if (error?.type === 'entity.too.large') { res.status(413).json({ error: 'Request body is too large' }); return; }
  if (['55P03', '57014'].includes(error?.code)) { res.status(503).json({ error: 'The store is busy; please try again shortly' }); return; }
  const status = Number.isInteger(error?.status) && error.status >= 400 && error.status < 600 ? error.status : 500;
  if (status === 500) console.error('API request failed:', error?.message);
  res.status(status).json({ error: status === 500 ? 'Internal server error' : error.message || 'Request failed' });
}
