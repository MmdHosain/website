"use client";
import { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
interface StaffUser { id: string; mobile: string; role: string; }
export function AdminRoles({ lang }: { lang: string }) {
  const fa = lang === 'fa';
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');
  const [loading, setLoading] = useState(true);
  const names: Record<string, string> = fa ? { user: 'مشتری', admin: 'مدیر کامل', staff_orders: 'کارمند سفارش‌ها', staff_catalog: 'کارمند محصولات', staff_blog: 'کارمند مجله' } : { user: 'Customer', admin: 'Full administrator', staff_orders: 'Orders staff', staff_catalog: 'Catalog staff', staff_blog: 'Blog staff' };
  useEffect(() => { apiRequest<StaffUser[]>('/api/admin/users', { authenticated: true }).then(setUsers).catch(cause => setError(cause.message)).finally(() => setLoading(false)); }, []);
  const update = async (user: StaffUser, role: string) => {
    if (role === 'admin' && !window.confirm(fa ? 'دسترسی کامل مدیریت داده شود؟' : 'Grant full administrator access?')) return;
    setSaving(user.id); setError('');
    try { const updated = await apiRequest<StaffUser>(`/api/admin/users/${user.id}/role`, { method: 'PATCH', authenticated: true, body: { role } }); setUsers(current => current.map(item => item.id === user.id ? updated : item)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not update role'); }
    finally { setSaving(''); }
  };
  return <div><h1 className="font-serif text-3xl mb-6">{fa ? 'نقش‌های کارکنان' : 'Staff roles'}</h1><p className="text-sm mb-6">{fa ? 'کارکنان تنها به بخش مربوط به نقش خود دسترسی دارند. فقط مدیر کامل می‌تواند نقش‌ها را تغییر دهد.' : 'Staff can access only their assigned section. Only full administrators can manage roles.'}</p>{error && <p role="alert" className="bg-red-50 p-4 mb-4">{error}</p>}
    {loading ? <p>{fa ? 'در حال بارگذاری…' : 'Loading…'}</p> : <div className="overflow-x-auto bg-white border"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-start p-4">{fa ? 'شماره همراه' : 'Mobile'}</th><th className="text-start p-4">{fa ? 'نقش' : 'Role'}</th></tr></thead><tbody>{users.map(user => <tr key={user.id} className="border-b"><td className="p-4" dir="ltr">{user.mobile}</td><td className="p-4"><select aria-label={`${fa ? 'نقش' : 'Role'} ${user.mobile}`} value={user.role} disabled={Boolean(saving)} onChange={event => void update(user, event.target.value)} className="border p-2">{Object.entries(names).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td></tr>)}</tbody></table></div>}</div>;
}
