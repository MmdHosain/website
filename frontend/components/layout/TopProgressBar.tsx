"use client";

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // Stop the progress bar when the route actually changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Listen to all clicks globally to intercept internal link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't intercept if user is opening in a new tab
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Only show progress for internal links that are not opening in a new tab
      if (href && href.startsWith('/') && targetAttr !== '_blank') {
        // If it's just a hash link on the same page, don't show loading
        if (href === pathname || href.startsWith(pathname + '#')) return;
        setIsNavigating(true);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-transparent">
      <div className="h-full bg-ariwatch-red animate-progress origin-left shadow-[0_0_10px_rgba(200,16,46,0.8)]"></div>
    </div>
  );
}
