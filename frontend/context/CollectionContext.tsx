"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { authService } from '../services/auth.service';
import { apiRequest } from '../services/api';
import { savedIds, toggleId } from '../services/catalog/collections';
const GUEST = 'ariwatch_wishlist_guest', COMPARE = 'ariwatch_compare_v1';
interface Collections {
  wishlistIds: string[]; compareIds: string[]; hydrated: boolean; error: string;
  toggleWishlist: (id: string) => void; toggleCompare: (id: string) => void; clearCompare: () => void;
}
const Context = createContext<Collections | null>(null);
const read = (key: string, limit = 100) => { try { return savedIds(localStorage.getItem(key), limit); } catch { return []; } };
const save = (key: string, ids: string[]) => { try { localStorage.setItem(key, JSON.stringify(ids)); } catch { /* In-memory collections stay usable. */ } };
export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]), [compareIds, setCompareIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false), [error, setError] = useState('');
  const identity = useRef({ token: '', key: GUEST }), wishes = useRef<string[]>([]);
  const generation = useRef(0), writes = useRef(Promise.resolve());
  const persist = useCallback((ids: string[]) => {
    const target = { ...identity.current }, version = generation.current;
    save(target.key, ids);
    if (!target.token) return;
    writes.current = writes.current.catch(() => {}).then(async () => {
      try {
        const response = await apiRequest<{ watchIds: string[] }>('/api/wishlist', { method: 'PUT', headers: { Authorization: `Bearer ${target.token}` }, body: { watchIds: ids } });
        if (version === generation.current && wishes.current.join(',') === ids.join(',')) {
          wishes.current = response.watchIds; setWishlistIds(response.watchIds); save(target.key, response.watchIds);
        }
      } catch (cause) {
        if (version === generation.current) setError(cause instanceof Error ? cause.message : 'Could not sync saved watches.');
      }
    });
  }, []);
  useEffect(() => {
    setCompareIds(read(COMPARE, 4));
    const sync = async () => {
      const version = ++generation.current, token = authService.getToken() || '';
      setHydrated(false); setError('');
      try {
        let ids = read(GUEST), key = GUEST;
        if (token) {
          const user = await authService.me();
          const headers = { Authorization: `Bearer ${token}` };
          const response = await apiRequest<{ watchIds: string[] }>('/api/wishlist', { headers });
          key = `ariwatch_wishlist_${user.id}`;
          ids = Array.from(new Set([...response.watchIds, ...ids])).slice(0, 100);
          if (version !== generation.current || token !== authService.getToken()) return;
          if (read(GUEST).length) {
            const merged = await apiRequest<{ watchIds: string[] }>('/api/wishlist', { method: 'PUT', headers, body: { watchIds: ids } });
            if (version !== generation.current || token !== authService.getToken()) return;
            ids = merged.watchIds;
            save(GUEST, []);
          }
        }
        if (version !== generation.current) return;
        identity.current = { token, key }; wishes.current = ids;
        save(key, ids); setWishlistIds(ids);
      } catch (cause) {
        if (version === generation.current) {
          const user = authService.getUser();
          identity.current = { token: authService.getToken() || '', key: user ? `ariwatch_wishlist_${user.id}` : GUEST };
          const ids = read(identity.current.key); wishes.current = ids; setWishlistIds(ids);
          setError(cause instanceof Error ? cause.message : 'Could not load saved watches.');
        }
      } finally { if (version === generation.current) setHydrated(true); }
    };
    const recheck = () => { void sync(); };
    const storage = (event: StorageEvent) => {
      if (event.key === 'ariwatch_token' || event.key === null) recheck();
      if (event.key === COMPARE) setCompareIds(read(COMPARE, 4));
      if (event.key === identity.current.key) { const ids = read(identity.current.key); wishes.current = ids; setWishlistIds(ids); }
    };
    void sync();
    window.addEventListener('ariwatch:auth', recheck); window.addEventListener('storage', storage);
    return () => { generation.current++; window.removeEventListener('ariwatch:auth', recheck); window.removeEventListener('storage', storage); };
  }, []);
  const toggleWishlist = useCallback((id: string) => {
    if (!hydrated) return;
    const ids = toggleId(wishes.current, id);
    wishes.current = ids; setWishlistIds(ids); setError(''); persist(ids);
  }, [persist, hydrated]);
  const toggleCompare = useCallback((id: string) => setCompareIds(previous => {
    if (!previous.includes(id) && previous.length >= 4) {
      setError(document.documentElement.lang === 'fa' ? 'حداکثر چهار ساعت را مقایسه کنید.' : 'Compare up to four watches.');
      return previous;
    }
    const ids = toggleId(previous, id, 4); save(COMPARE, ids); return ids;
  }), []);
  const clearCompare = useCallback(() => { setCompareIds([]); save(COMPARE, []); }, []);
  return <Context.Provider value={{ wishlistIds, compareIds, hydrated, error, toggleWishlist, toggleCompare, clearCompare }}>{children}</Context.Provider>;
}
export function useCollections() {
  const context = useContext(Context);
  if (!context) throw new Error('Use collections within CollectionProvider');
  return context;
}
