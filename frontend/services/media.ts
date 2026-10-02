const demoPhotos: Record<string, string> = {
  'photo-1508656937041-edbe9e178f8f': 'lifestyle-watch-1.jpg',
  'photo-1522312346375-d1a52e2b99b3': 'photo-1522312346375-d1a52e2b99b3.jpg',
  'photo-1523170335258-f5ed11844a49': 'photo-1523170335258-f5ed11844a49.jpg',
  'photo-1524592094714-0f0654e20314': 'photo-1524592094714-0f0654e20314.jpg',
  'photo-1547996160-81dfa63595aa': 'photo-1547996160-81dfa63595aa.jpg',
  'photo-1548036328-c9fa89d128fa': 'lifestyle-watch-3.jpg',
  'photo-1585123334904-845d60e97b29': 'photo-1585123334904-845d60e97b29.jpg',
  'photo-1587836374828-cb4387df3eb7': 'lifestyle-watch-2.jpg',
  'photo-1612817159949-195b6eb9e31a': 'photo-1612817159949-195b6eb9e31a.jpg',
  'photo-1614164185128-e4ec99c436d7': 'photo-1614164185128-e4ec99c436d7.jpg',
};

/** Localize original demo images, including saved carts and order snapshots. */
export function localMediaUrl(source: string): string {
  try {
    const url = new URL(source);
    if (url.hostname !== 'images.unsplash.com' || !['http:', 'https:'].includes(url.protocol)) return source;
    const filename = demoPhotos[url.pathname.slice(1)];
    return filename ? `/resourses/${filename}` : source;
  } catch { return source; }
}
