export function formatPrice(amount: number, lang: string) {
  const number = new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: 0 }).format(Number(amount));
  return `${number} ${lang === 'fa' ? 'تومان' : 'toman'}`;
}
