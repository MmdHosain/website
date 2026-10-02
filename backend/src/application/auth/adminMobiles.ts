import { mobileNumber } from '../validation';
export function configuredAdminMobiles(): string[] {
  return (process.env.ADMIN_MOBILES ?? (process.env.NODE_ENV === 'production' ? '' : '09123456789'))
    .split(',').map(mobile => mobile.trim()).filter(Boolean).map(mobileNumber);
}
