export type AdminPermission = 'catalog' | 'orders' | 'blog' | 'settings' | 'roles';
export function canManage(role: string, permission: AdminPermission) { return role === 'admin' || role === `staff_${permission}`; }
export function sectionPermission(path: string): AdminPermission {
  if (/\/admin\/(orders|requests|sales)(\/|$)/.test(path)) return 'orders';
  if (/\/admin\/blog(\/|$)/.test(path)) return 'blog';
  if (/\/admin\/roles(\/|$)/.test(path)) return 'roles';
  if (/\/admin\/(settings|discounts|integrations)(\/|$)/.test(path)) return 'settings';
  return 'catalog';
}
