import { useScroll, useTransform } from 'framer-motion';

/**
 * useParallax
 * Returns a MotionValue for y-offset based on page scroll speed multiplier.
 * @param {number} speed - 0 = static, 1 = moves at normal scroll, 0.5 = half speed
 * @param {number} outputRange - total pixel range of parallax movement (default 200)
 */
export function useParallax(speed = 0.5, outputRange = 200) {
  const { scrollY } = useScroll();
  // Map from [0, viewportHeight] scroll to [0, outputRange * speed] translateY
  const range = outputRange * speed;
  const y = useTransform(scrollY, [0, 800], [0, range]);
  return y;
}

/**
 * useMouseParallax
 * Returns { x, y } offsets driven by mouse position within an element.
 * Call onMouseMove on the container element.
 * @param {number} factor - strength of shift in px (default 20)
 * @param {boolean} invert - if true, moves OPPOSITE to cursor
 */
import { useMotionValue, useSpring } from 'framer-motion';
import { useCallback } from 'react';

export function useMouseParallax(factor = 20, invert = false) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 80, damping: 20 });
  const y = useSpring(rawY, { stiffness: 80, damping: 20 });

  const onMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;   // -0.5 to 0.5
    const dy = (e.clientY - cy) / rect.height;
    const sign = invert ? -1 : 1;
    rawX.set(dx * factor * sign);
    rawY.set(dy * factor * sign);
  }, [rawX, rawY, factor, invert]);

  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { x, y, onMouseMove, onMouseLeave };
}
