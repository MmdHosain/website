interface Searchable { name: string; description: string; variants?: { label: string; color?: string; sku: string }[] }
const aliases: Record<string, string[]> = {
  rolex: ['رولکس'], citizen: ['سیتی زن', 'سیتیزن', 'سیتی‌زن'],
  seiko: ['سیکو', 'سایکو'], casio: ['کاسیو'], orient: ['اورینت'], omega: ['امگا', 'اومگا'],
  cartier: ['کارتیه', 'کارتیر'], patek: ['پاتک', 'پتک'], audemars: ['اودمار', 'ادمـار'],
  tissot: ['تیسوت'], rado: ['رادو'], hublot: ['هابلوت'], swatch: ['سواچ'], fossil: ['فسیل'],
};
const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک')
  .replace(/[\u064B-\u065F\u0670]/g, '').replace(/[\u200c\u200d]/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
function canonical(value: string) {
  let result = normalize(value);
  for (const [brand, words] of Object.entries(aliases)) for (const word of words) result = result.split(normalize(word)).join(brand);
  return result;
}
function distance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
  }
  return rows[a.length][b.length];
}
export function searchCatalog<T extends Searchable>(items: T[], query: string): T[] {
  const q = canonical(query).slice(0, 100);
  if (!q) return items;
  const tokens = q.split(/\s+/);
  return items.map(item => {
    const name = canonical(item.name);
    const brandWords = Object.entries(aliases).filter(([brand]) => name.includes(brand)).flatMap(([, words]) => words);
    const words = normalize(`${name} ${item.description} ${brandWords.join(' ')} ${(item.variants || []).map(v => `${v.label} ${v.color || ''} ${v.sku}`).join(' ')}`).split(/\s+/);
    let score = name.includes(q) ? 100 : 0;
    for (const token of tokens) {
      let best = 0;
      for (const word of words) {
        if (word === token) best = Math.max(best, 20);
        else if (word.includes(token)) best = Math.max(best, 12);
        else if (token.length >= 3 && Math.abs(word.length - token.length) <= 2) {
          const diff = distance(token, word);
          if (diff <= (token.length >= 5 ? 2 : 1)) best = Math.max(best, 8 - diff);
        }
      }
      if (!best) return { item, score: 0 };
      score += best;
    }
    return { item, score };
  }).filter(row => row.score > 0).sort((a, b) => b.score - a.score).map(row => row.item);
}
