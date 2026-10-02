"use client";
import { useState } from 'react';
import { AuthModal } from '../auth/AuthModal';
import { authService } from '../../services/auth.service';
import { apiRequest, ApiError } from '../../services/api';
export function StockAlertButton({ watchId, variantId, lang, dict }: { watchId: string; variantId?: string; lang: string; dict: any }) {
  const fa = lang === 'fa';
  const [authOpen, setAuthOpen] = useState(false), [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false), [error, setError] = useState('');
  const register = async () => {
    if (!authService.getToken()) { setAuthOpen(true); return; }
    setLoading(true); setError('');
    try {
      await apiRequest('/api/stock-alerts', { method: 'POST', authenticated: true, body: { watchId, ...(variantId ? { variantId } : {}) } });
      setSuccess(true);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) setAuthOpen(true);
      else setError(cause instanceof Error ? cause.message : (fa ? 'ثبت درخواست انجام نشد.' : 'Could not save the alert.'));
    } finally { setLoading(false); }
  };
  return <div className="mt-4">
    {success ? <p role="status" className="text-sm text-green-800">{fa ? 'هنگام موجود شدن این انتخاب، به شماره تأییدشده شما پیامک ارسال می‌شود.' : 'We will text your verified mobile when this selection is back in stock.'}</p> :
      <button type="button" disabled={loading} onClick={() => void register()} className="border border-gray-300 py-3 px-4 text-sm w-full disabled:opacity-50">{loading ? '…' : fa ? 'موجود شد خبرم کن' : 'Text me when available'}</button>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} dict={dict} isFa={fa} onSuccess={() => void register()} />
  </div>;
}
