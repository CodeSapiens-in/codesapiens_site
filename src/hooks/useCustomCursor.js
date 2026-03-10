import { useEffect } from 'react';

/**
 * useCustomCursor — Recharge-style glowing orb cursor
 *
 * Two elements expected in DOM:
 *   #cursor-orb  (400px radial glow, lerps behind mouse)
 *   #cursor-dot  (5px snap dot)
 *
 * CSS is injected by CustomCursor.jsx.
 */
export function useCustomCursor() {
  useEffect(() => {
    // ── Disable on touch/coarse pointer devices ──────────────────────────────
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const orb = document.getElementById('cursor-orb');
    const dot = document.getElementById('cursor-dot');
    if (!orb || !dot) return;

    // ── State ─────────────────────────────────────────────────────────────────
    let mouse   = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let orbPos  = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let rafId;
    let paused = false;

    // ORB config per state
    const STATES = {
      default: {
        scale: 1,
        gradient: 'radial-gradient(circle at center, #6366f118 0%, #6366f10c 30%, #6366f106 60%, transparent 70%)',
        lerp: 0.06,
        dotOpacity: 1,
      },
      link: {
        scale: 0.45,
        gradient: 'radial-gradient(circle at center, #a855f738 0%, #a855f720 30%, #a855f710 60%, transparent 70%)',
        lerp: 0.10,
        dotOpacity: 0,
      },
      button: {
        scale: 0.45,
        gradient: 'radial-gradient(circle at center, #a855f740 0%, #a855f728 30%, #a855f714 60%, transparent 70%)',
        lerp: 0.10,
        dotOpacity: 0,
      },
      card: {
        scale: 0.80,
        gradient: 'radial-gradient(circle at center, #22d3ee14 0%, #22d3ee0a 30%, #22d3ee05 60%, transparent 70%)',
        lerp: 0.07,
        dotOpacity: 1,
      },
      image: {
        scale: 1.25,
        gradient: 'radial-gradient(circle at center, #6366f112 0%, #6366f108 30%, #6366f103 60%, transparent 70%)',
        lerp: 0.04,
        dotOpacity: 1,
      },
    };

    // Section-based orb color (IntersectionObserver)
    const SECTION_COLORS = {
      hero:      'radial-gradient(circle at center, #6366f118 0%, #6366f10c 30%, #6366f106 60%, transparent 70%)',
      vision:    'radial-gradient(circle at center, #22d3ee12 0%, #22d3ee0a 30%, #22d3ee04 60%, transparent 70%)',
      events:    'radial-gradient(circle at center, #10b98112 0%, #10b9810a 30%, #10b98104 60%, transparent 70%)',
      community: 'radial-gradient(circle at center, #a855f715 0%, #a855f70c 30%, #a855f705 60%, transparent 70%)',
    };

    let currentState = STATES.default;
    let currentLerp  = 0.06;
    let sectionGradient = SECTION_COLORS.hero;

    // Apply state to orb
    const applyState = (state) => {
      currentState = state;
      currentLerp  = state.lerp;
      orb.style.transform  = `translate(-50%, -50%) scale(${state.scale})`;
      orb.style.background = state === STATES.default ? sectionGradient : state.gradient;
      dot.style.opacity    = String(state.dotOpacity);
    };

    // ── Event delegation — detect hovered element ────────────────────────────
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      const el = e.target;
      if (el.closest('a, [role="link"]'))             applyState(STATES.link);
      else if (el.closest('button, [role="button"]')) applyState(STATES.button);
      else if (el.closest('img'))                     applyState(STATES.image);
      else if (el.closest('.cs-card, [data-cursor="card"]')) applyState(STATES.card);
      else                                            applyState(STATES.default);
    };

    const onMouseLeave = () => {
      orb.style.opacity = '0';
      dot.style.opacity = '0';
    };
    const onMouseEnter = () => {
      orb.style.opacity = '1';
      dot.style.opacity = '1';
    };

    // ── Section IntersectionObserver for color drift ──────────────────────────
    const sectionMap = { vision: 'vision', events: 'events', community: 'community' };
    const observers = [];
    Object.entries(sectionMap).forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          sectionGradient = SECTION_COLORS[key] || SECTION_COLORS.hero;
          if (currentState === STATES.default) {
            orb.style.background = sectionGradient;
          }
        }
      }, { threshold: 0.5 });
      obs.observe(el);
      observers.push(obs);
    });

    // ── rAF lerp loop ─────────────────────────────────────────────────────────
    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      if (!paused) {
        orbPos.x = lerp(orbPos.x, mouse.x, currentLerp);
        orbPos.y = lerp(orbPos.y, mouse.y, currentLerp);
        orb.style.left = orbPos.x + 'px';
        orb.style.top  = orbPos.y + 'px';
        dot.style.left = mouse.x + 'px';
        dot.style.top  = mouse.y + 'px';
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // ── Visibility pause ──────────────────────────────────────────────────────
    const onVisibilityChange = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      observers.forEach(o => o.disconnect());
    };
  }, []);
}
