"use client";
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

export function useAdminData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await apiRequest<T>(path, { authenticated: true })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load data'); }
    finally { setLoading(false); }
  }, [path]);
  useEffect(() => { void reload(); }, [reload]);
  return { data, error, loading, reload };
}
