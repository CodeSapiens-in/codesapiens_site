import { useEffect, useRef, useState } from 'react';

/**
 * useCountUp
 * Animates a number from 0 → target when inView becomes true.
 * Returns the current animated value as a string with optional suffix.
 * @param {number|string} target  - e.g. 2000 or "2000+"
 * @param {boolean}       inView  - trigger from IntersectionObserver / framer whileInView
 * @param {number}        duration - ms, default 1800
 */
export function useCountUp(target, inView, duration = 1800) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  // Parse numeric portion + optional suffix
  const targetStr = String(target);
  const numericPart = parseFloat(targetStr.replace(/[^0-9.]/g, '')) || 0;
  const suffix = targetStr.replace(/[0-9.]/g, '');

  useEffect(() => {
    if (!inView) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setValue(numericPart);
      return;
    }

    startRef.current = null;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(eased * numericPart));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, numericPart, duration]);

  return `${value}${suffix}`;
}
