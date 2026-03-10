import { useEffect, useRef } from 'react';

/**
 * useAurora
 * Draws an animated aurora effect with blobs + dot grid ripple on a canvas.
 * Blobs attract toward cursor position on mousemove.
 */
export function useAurora(canvasRef) {
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef?.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let frame = 0;

    // Code tokens that drift upward
    const CODE_TOKENS = ['const', '=>', '{}', '</>', 'async', 'await', 'fn()', '[]', '===', '//'];
    const tokens = CODE_TOKENS.map((t, i) => ({
      text: t,
      x: Math.random() * 100,   // percent
      y: Math.random() * 100,
      speed: 0.02 + Math.random() * 0.03,
      opacity: 0.15 + Math.random() * 0.15,
      size: 11 + Math.random() * 7,
    }));

    // Aurora blobs
    const blobs = [
      { baseX: 0.25, baseY: 0.3,  r: 320, color: 'rgba(124,58,237,0.22)',  phase: 0 },
      { baseX: 0.7,  baseY: 0.5,  r: 280, color: 'rgba(6,182,212,0.18)',   phase: 2.1 },
      { baseX: 0.5,  baseY: 0.75, r: 260, color: 'rgba(30,27,75,0.35)',    phase: 4.2 },
      { baseX: 0.1,  baseY: 0.7,  r: 220, color: 'rgba(6,182,212,0.12)',   phase: 1.0 },
      { baseX: 0.85, baseY: 0.2,  r: 200, color: 'rgba(124,58,237,0.14)',  phase: 3.5 },
    ];

    const resize = () => {
      width  = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width  = width;
      canvas.height = height;
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top)  / rect.height,
      };
    };
    canvas.parentElement?.addEventListener('mousemove', onMouseMove);

    const draw = () => {
      if (!ctx || !width || !height) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      frame += prefersReduced ? 0 : 1;
      const t = frame * 0.008;

      ctx.clearRect(0, 0, width, height);

      // ── Aurora blobs ─────────────────────────────────────────
      blobs.forEach(blob => {
        const attract = 0.08;
        const bx = (blob.baseX + Math.sin(t + blob.phase) * 0.12 + (mouseRef.current.x - 0.5) * attract) * width;
        const by = (blob.baseY + Math.cos(t + blob.phase * 0.7) * 0.08 + (mouseRef.current.y - 0.5) * attract) * height;

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, blob.r);
        grad.addColorStop(0, blob.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, blob.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Dot grid ripple ──────────────────────────────────────
      const GRID = 38;
      const cols = Math.ceil(width  / GRID) + 1;
      const rows = Math.ceil(height / GRID) + 1;
      const mx = mouseRef.current.x * width;
      const my = mouseRef.current.y * height;

      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const gx = c * GRID;
          const gy = r * GRID;
          const dist = Math.hypot(gx - mx, gy - my);
          const ripple = Math.sin(dist * 0.04 - t * 4) * 0.5 + 0.5;
          const dotR = 1 + ripple * 2.2;
          const alpha = 0.08 + ripple * 0.2;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(gx, gy, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // ── Code tokens ──────────────────────────────────────────
      ctx.font = '13px "JetBrains Mono", monospace';
      tokens.forEach(tok => {
        tok.y -= tok.speed;
        if (tok.y < -5) { tok.y = 105; tok.x = Math.random() * 100; }
        const px = tok.x / 100 * width;
        const py = tok.y / 100 * height;
        ctx.globalAlpha = tok.opacity;
        ctx.fillStyle = '#22c55e';
        ctx.fillText(tok.text, px, py);
      });
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      canvas.parentElement?.removeEventListener('mousemove', onMouseMove);
    };
  }, [canvasRef]);
}
