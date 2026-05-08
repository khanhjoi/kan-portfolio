"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

type Options = {
  rootMargin?: string;
  threshold?: number;
};

/**
 * Mount heavy WebGL only after the section enters the viewport (or the user explicitly unlocks).
 */
export function useLazyMountScene(sectionRef: RefObject<HTMLElement | null>, opts: Options = {}) {
  const { rootMargin = "100px", threshold = 0.06 } = opts;
  const [inView, setInView] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { rootMargin, threshold }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [sectionRef, rootMargin, threshold]);

  const unlock = useCallback(() => setManual(true), []);

  return {
    /** True when the scene should mount */
    active: manual || inView,
    /** User clicked “Load 3D…” before scroll */
    unlockedManually: manual,
    unlock,
  };
}
