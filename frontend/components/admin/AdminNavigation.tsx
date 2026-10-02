"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminRole } from './AdminAccess';
import { AdminPermission, canManage, sectionPermission } from './permissions';

export function AdminNavigation({ lang }: { lang: string }) {
  const role = useAdminRole();
  const fa = lang === 'fa';
  const links: { path: string; permission: AdminPermission; label: string }[] = [
    { path: '', permission: 'catalog', label: fa ? 'محصولات' : 'Products' },
    { path: '/watches/new', permission: 'catalog', label: fa ? 'محصول جدید' : 'New product' },
    { path: '/import', permission: 'catalog', label: fa ? 'ورود گروهی' : 'Bulk import' },
    { path: '/prices', permission: 'catalog', label: fa ? 'پیگیری قیمت' : 'Price tracking' },
    { path: '/orders', permission: 'orders', label: fa ? 'سفارش‌ها' : 'Orders' },
    { path: '/sales', permission: 'orders', label: fa ? 'گزارش فروش' : 'Sales' },
    { path: '/requests', permission: 'orders', label: fa ? 'درخواست‌ها' : 'Inquiries' },
    { path: '/blog', permission: 'blog', label: fa ? 'مجله' : 'Blog' },
    { path: '/discounts', permission: 'settings', label: fa ? 'کدهای تخفیف' : 'Coupons' },
    { path: '/settings', permission: 'settings', label: fa ? 'تنظیمات' : 'Settings' },
    { path: '/roles', permission: 'roles', label: fa ? 'نقش‌های کارکنان' : 'Staff roles' },
    { path: '/integrations', permission: 'settings', label: fa ? 'اتصال‌ها' : 'Integrations' },
    { path: '/integrations/basalam', permission: 'settings', label: fa ? 'باسلام' : 'Basalam' },
  ];
  return <nav aria-label={fa ? 'منوی مدیریت' : 'Admin navigation'} className="flex flex-col gap-2">
    {links.filter(link => canManage(role, link.permission)).map(link => <Link key={link.path} href={`/${lang}/admin${link.path}`} className="text-sm text-gray-300 hover:text-white hover:bg-white/5 p-3 rounded">{link.label}</Link>)}
    <Link href={`/${lang}`} className="text-sm text-gray-300 hover:text-white p-3 mt-4">{fa ? 'بازگشت به فروشگاه' : 'Back to the store'}</Link>
  </nav>;
}
export function AdminSection({ children, lang }: { children: React.ReactNode; lang: string }) {
  const role = useAdminRole();
  const path = usePathname();
  return canManage(role, sectionPermission(path)) ? children : <p role="alert" className="border bg-white p-6">{lang === 'fa' ? 'نقش شما به این بخش دسترسی ندارد. یک بخش مجاز از منو انتخاب کنید.' : 'Your role cannot access this section. Choose an available section from the menu.'}</p>;
}
