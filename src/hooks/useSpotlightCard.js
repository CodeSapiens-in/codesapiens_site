import { useRef, useState, useCallback } from 'react';

/**
 * useSpotlightCard
 *
 * Enhanced 3D parallax + spotlight glow.
 * The card TILTS (up to maxTilt degrees).
 * Inner elements can accept a `data-depth` attr (0–1) for parallax offset.
 *
 * Returns:
 *   ref          — attach to the outer card element
 *   spotlightStyle — absolute overlay <div> inside card
 *   tiltStyle    — spread onto motion.div `style` prop
 *   innerStyle   — pass to each inner layer element (with depth multiplied externally)
 *   isHovered
 *   onMouseMove, onMouseLeave
 */
export function useSpotlightCard(maxTilt = 8) {
  const ref = useRef(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, visible: false });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, tx: 0, ty: 0 });
  const [hovered, setHovered] = useState(false);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const relX = x / rect.width  - 0.5;
    const relY = y / rect.height - 0.5;

    setSpot({ x, y, visible: true });
    setTilt({
      rx: -(relY * maxTilt * 2),
      ry:  (relX * maxTilt * 2),
      // Translate values for inner-layer parallax (in px)
      tx:   relX * 12,
      ty:   relY * 12,
    });
    setHovered(true);
  }, [maxTilt]);

  const onMouseLeave = useCallback(() => {
    setSpot(s => ({ ...s, visible: false }));
    setTilt({ rx: 0, ry: 0, tx: 0, ty: 0 });
    setHovered(false);
  }, []);

  const spotlightStyle = {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    background: spot.visible
      ? `radial-gradient(circle 220px at ${spot.x}px ${spot.y}px, #6366f114, transparent)`
      : 'none',
    pointerEvents: 'none',
    zIndex: 1,
    transition: 'opacity 200ms ease',
    opacity: spot.visible ? 1 : 0,
  };

  const tiltStyle = {
    rotateX: tilt.rx,
    rotateY: tilt.ry,
    transformPerspective: 1000,
    transition: hovered
      ? 'none'
      : 'rotateX 500ms cubic-bezier(.03,.98,.52,.99), rotateY 500ms cubic-bezier(.03,.98,.52,.99)',
  };

  // Inner layer parallax — apply to child elements at different depths
  // depth 0 = no movement, depth 1 = full 12px movement
  const innerParallax = (depth = 0.5) => ({
    transform: hovered
      ? `translate3d(${tilt.tx * depth}px, ${tilt.ty * depth}px, ${depth * 20}px)`
      : 'translate3d(0,0,0)',
    transition: hovered ? 'none' : 'transform 500ms cubic-bezier(.03,.98,.52,.99)',
    willChange: 'transform',
  });

  return {
    ref,
    spotlightStyle,
    tiltStyle,
    innerParallax,
    isHovered: hovered,
    onMouseMove,
    onMouseLeave,
  };
}
