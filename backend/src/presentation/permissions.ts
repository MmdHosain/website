import { RequestHandler } from 'express';
import { HttpError } from '../application/errors';
import { USER_ROLES } from '../domain/entities/User';

export type Permission = 'orders' | 'catalog' | 'blog' | 'settings' | 'roles';
export const roles = USER_ROLES;
export function hasPermission(role: string | undefined, permission: Permission): boolean {
  return role === 'admin' || role === `staff_${permission}`;
}
export function requirePermission(permission: Permission): RequestHandler {
  return (req, _res, next) => {
    if (!hasPermission(req.user?.role, permission)) return next(new HttpError(403, 'Your account does not have permission for this section'));
    next();
  };
}
