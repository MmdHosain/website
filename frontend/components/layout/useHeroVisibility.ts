import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useHeroVisibility() {
  const pathname = usePathname();
  const isHome = /^\/(en|fa)\/?$/.test(pathname ?? "");
  const [visibility, setVisibility] = useState({ pathname, visible: isHome });

  useEffect(() => {
    if (!isHome) {
      setVisibility({ pathname, visible: false });
      return;
    }

    let active = true;
    let hero: HTMLElement | null = null;
    const update = (visible: boolean) => {
      if (active) setVisibility({ pathname, visible });
    };
    const observer = new IntersectionObserver(entries => {
      const entry = entries.find(item => item.target === hero);
      if (entry) update(entry.isIntersecting && entry.intersectionRatio > 0);
    });

    const bindHero = () => {
      if (!active) return;
      const nextHero = document.getElementById("featured-watches");
      if (nextHero === hero) return;
      observer.disconnect();
      hero = nextHero;
      if (!hero) {
        update(false);
        return;
      }
      const bounds = hero.getBoundingClientRect();
      update(bounds.bottom > 0 && bounds.top < window.innerHeight);
      observer.observe(hero);
    };

    // The home page can stream in after this persistent layout mounts.
    const mutations = new MutationObserver(bindHero);
    mutations.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });
    bindHero();
    return () => {
      active = false;
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname, isHome]);

  return visibility.pathname === pathname ? visibility.visible : isHome;
}
