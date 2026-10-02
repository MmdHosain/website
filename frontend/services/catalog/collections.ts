export function savedIds(raw: string | null, limit = 100): string[] {
  try {
    const value: unknown = JSON.parse(raw || '[]');
    if (!Array.isArray(value)) return [];
    return Array.from(new Set(value.filter((id): id is string => typeof id === 'string' && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)))).slice(0, limit);
  } catch { return []; }
}
export function toggleId(ids: string[], id: string, limit = 100): string[] {
  return ids.includes(id) ? ids.filter(value => value !== id) : ids.length < limit ? [...ids, id] : ids;
}
