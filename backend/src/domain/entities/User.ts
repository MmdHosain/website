export const USER_ROLES = ['user', 'admin', 'staff_orders', 'staff_catalog', 'staff_blog'] as const;
export type UserRole = typeof USER_ROLES[number];
export class User {
  constructor(
    public readonly id: string,
    public readonly mobile: string,
    public readonly role: UserRole
  ) {}
}
