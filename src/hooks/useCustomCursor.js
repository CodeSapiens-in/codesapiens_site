import { useEffect, useRef, useCallback } from 'react';

/**
 * useCustomCursor
 * Manages the custom cursor system:
 *  - cursorDot: 6px solid circle, instantaneous
 *  - cursorRing: 36px outlined circle, lerp lag
 *  - trail: 10 trailing dots with staggered delay
 *  - color state: reacts to hovered element type
 *  - mix-blend-mode: difference on ring
 */
export function useCustomCursor(containerRef) {
  const mousePos = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });
  const trailPositions = useRef(Array(10).fill({ x: -200, y: -200 }));
  const rafId = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRefs = useRef([]);
  const cursorState = useRef('default'); // default | button | code | card | light

  const COLORS = {
    dark: '#06b6d4',
    light: '#7c3aed',
    button: '#f59e0b',
    code: '#22c55e',
    card: '#06b6d4',
  };

  const lerp = (a, b, t) => a + (b - a) * t;

  const getColorForState = (state) => {
    if (state === 'button') return COLORS.button;
    if (state === 'code') return COLORS.code;
    if (state === 'card') return COLORS.card;
    if (state === 'light') return COLORS.light;
    return COLORS.dark;
  };

  const detectElementType = useCallback((el) => {
    if (!el) return 'default';
    if (el.closest('a, button, [role="button"], input[type="submit"]')) return 'button';
    if (el.closest('pre, code, .code-block, .syntax-panel')) return 'code';
    if (el.closest('.glass-card, .sponsor-card, .social-card, .hof-card, .community-card')) return 'card';
    // Check bg color for light vs dark
    const bg = el.closest('section, nav, footer, div[class*="bg-"]');
    if (bg) {
      const cls = bg.className || '';
      if (cls.includes('bg-white') || cls.includes('bg-[#F7F5F2]') || cls.includes('bg-[#FAF9F6]') || cls.includes('bg-[#FFFFF0]') || cls.includes('bg-[#FFF8DC]')) {
        return 'light';
      }
    }
    return 'default';
  }, []);

  const animate = useCallback(() => {
    const LERP_FACTOR = 0.12;

    // Update ring position
    ringPos.current.x = lerp(ringPos.current.x, mousePos.current.x, LERP_FACTOR);
    ringPos.current.y = lerp(ringPos.current.y, mousePos.current.y, LERP_FACTOR);

    // Shift trail positions
    const trail = trailPositions.current;
    for (let i = trail.length - 1; i > 0; i--) {
      trail[i] = { ...trail[i - 1] };
    }
    trail[0] = { ...ringPos.current };

    const color = getColorForState(cursorState.current);
    const isCard = cursorState.current === 'card';
    const isButton = cursorState.current === 'button';

    // Apply dot position
    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${mousePos.current.x - 3}px, ${mousePos.current.y - 3}px)`;
      dotRef.current.style.background = color;
    }

    // Apply ring position
    if (ringRef.current) {
      const ringSize = isCard ? 60 : 36;
      const halfRing = ringSize / 2;
      ringRef.current.style.transform = `translate(${ringPos.current.x - halfRing}px, ${ringPos.current.y - halfRing}px) scale(${isButton ? 1.8 : 1})`;
      ringRef.current.style.width = `${ringSize}px`;
      ringRef.current.style.height = `${ringSize}px`;
      ringRef.current.style.borderColor = color;
    }

    // Apply trail
    trailRefs.current.forEach((el, i) => {
      if (!el) return;
      const t = trail[i] || { x: -200, y: -200 };
      const size = Math.max(2, 8 - i * 0.7);
      const opacity = Math.max(0, 0.5 - i * 0.05);
      el.style.transform = `translate(${t.x - size / 2}px, ${t.y - size / 2}px)`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.opacity = opacity;
      el.style.background = color;
    });

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Check if mobile/touch
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (isTouchDevice) return;

    const container = containerRef?.current || document;

    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      cursorState.current = detectElementType(e.target);
    };

    container.addEventListener('mousemove', onMouseMove);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener('mousemove', onMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [animate, detectElementType, containerRef]);

  return { dotRef, ringRef, trailRefs };
}
