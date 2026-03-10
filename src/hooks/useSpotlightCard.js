import { useRef, useState, useCallback } from 'react';

/**
 * useSpotlightCard
 * Tracks mouse position inside a card to produce:
 *  1. A spotlight radial-gradient glow following the cursor
 *  2. brightened border on hover
 *  3. 3D tilt (rotateX/Y) from cursor position
 *
 * Returns { ref, spotlightStyle, tiltStyle, onMouseMove, onMouseLeave }
 * Apply ref + onMouseMove + onMouseLeave to card element.
 * Apply spotlightStyle as an absolute overlay <div> inside the card.
 * Apply tiltStyle to the card's motion.div `style` prop.
 */
export function useSpotlightCard(maxTilt = 12) {
  const ref = useRef(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const relX = x / rect.width;
    const relY = y / rect.height;

    setSpotlight({ x, y, opacity: 1 });
    setTilt({
      rotateX: -(relY - 0.5) * maxTilt * 2,
      rotateY:  (relX - 0.5) * maxTilt * 2,
    });
  }, [maxTilt]);

  const onMouseLeave = useCallback(() => {
    setSpotlight(prev => ({ ...prev, opacity: 0 }));
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  const spotlightStyle = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
    borderRadius: 'inherit',
    background: `radial-gradient(circle at ${spotlight.x}px ${spotlight.y}px, rgba(124,58,237,0.18), transparent 60%)`,
    opacity: spotlight.opacity,
    transition: 'opacity 0.3s ease',
  };

  const tiltStyle = {
    rotateX: tilt.rotateX,
    rotateY: tilt.rotateY,
    transformPerspective: 800,
    transition: 'transform 0.4s cubic-bezier(.03,.98,.52,.99)',
  };

  return { ref, spotlightStyle, tiltStyle, onMouseMove, onMouseLeave };
}
