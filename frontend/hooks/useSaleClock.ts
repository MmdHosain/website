"use client";
import { useEffect, useState } from 'react';
import { Watch } from '../types';
export function useSaleClock(watch: Pick<Watch, 'saleStartsAt' | 'saleEndsAt'>) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      const current = Date.now(); setNow(current);
      const boundaries = [watch.saleStartsAt, watch.saleEndsAt].filter(Boolean).map(value => new Date(value!).getTime()).filter(value => value > current);
      if (boundaries.length) timer = setTimeout(update, Math.min(2_147_483_647, Math.min(...boundaries) - current + 5));
    };
    update();
    return () => clearTimeout(timer);
  }, [watch.saleStartsAt, watch.saleEndsAt]);
  return now;
}
