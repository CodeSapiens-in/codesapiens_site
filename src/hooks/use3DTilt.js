import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

/**
 * use3DTilt
 * Returns rotateX / rotateY motion values for a 3D card tilt effect.
 * Apply via: <motion.div ref={ref} style={{ rotateX, rotateY, transformPerspective: 1000 }} onMouseMove={onMove} onMouseLeave={onLeave} />
 */
export function use3DTilt(maxTilt = 12) {
  const ref = useRef(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(rawX, { stiffness: 100, damping: 15, mass: 0.1 });
  const rotateY = useSpring(rawY, { stiffness: 100, damping: 15, mass: 0.1 });

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width  - 0.5;   // -0.5 to 0.5
    const relY = (e.clientY - rect.top)  / rect.height - 0.5;
    rawX.set(-relY * maxTilt);   // tilt around X axis moves with Y
    rawY.set( relX * maxTilt);
  }, [rawX, rawY, maxTilt]);

  const onLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { ref, rotateX, rotateY, onMove, onLeave };
}
