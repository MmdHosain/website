"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { authService, AuthUser } from '../../services/auth.service';
import { ApiError } from '../../services/api';

export function useCustomerSession() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const refreshVersion = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++refreshVersion.current;
    if (!authService.getToken()) { setUser(null); setLoading(false); setSessionError(false); return; }
    setLoading(true);
    try {
      const verifiedUser = await authService.me();
      if (refreshVersion.current !== version) return;
      setUser(verifiedUser); setSessionError(false);
    }
    catch (error) {
      if (refreshVersion.current !== version) return;
      setUser(error instanceof ApiError && error.status === 401 ? null : authService.getUser());
      setSessionError(!(error instanceof ApiError && error.status === 401));
    } finally { if (refreshVersion.current === version) setLoading(false); }
  }, []);
  useEffect(() => {
    void refresh();
    const update = () => { void refresh(); };
    const updateStorage = (event: StorageEvent) => { if (!event.key || ['ariwatch_token', 'ariwatch_user'].includes(event.key)) void refresh(); };
    window.addEventListener('ariwatch:auth', update);
    window.addEventListener('storage', updateStorage);
    return () => { window.removeEventListener('ariwatch:auth', update); window.removeEventListener('storage', updateStorage); };
  }, [refresh]);
  return { user, loading, sessionError, refresh };
}
