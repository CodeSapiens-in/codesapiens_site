import { useEffect, useRef } from 'react';

/**
 * useAurora — Canvas aurora background for hero section
 * Updated: 20 tokens (more density), 2x faster speeds, mist/fog layer
 */
export function useAurora(canvasRef) {
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Blobs ─────────────────────────────────────────────────────────────────
    const BLOBS = [
      { color: '#6366f1', size: 600, ox: 0.18, oy: 0.22, speed: 0.00028, phase: 0    },
      { color: '#a855f7', size: 400, ox: 0.78, oy: 0.20, speed: 0.00035, phase: 1.5  },
      { color: '#22d3ee', size: 300, ox: 0.50, oy: 0.80, speed: 0.00022, phase: 3.0  },
    ];

    // ── Floating code tokens — 20 tokens, faster ──────────────────────────────
    const TOKEN_STRINGS = [
      'async', 'await', 'const', '=>', '{}', '</>',
      'null', '[]', 'fn()', '.map()', 'fetch()',
      'try {', '} catch', 'return', 'import',
      'export', 'class', 'void', '...spread', 'useState()',
    ];

    const tokens = TOKEN_STRINGS.map((str, i) => ({
      str,
      x:     0.04 + (i / TOKEN_STRINGS.length) * 0.93,
      y:     Math.random(),
      speed: 0.00065 + Math.random() * 0.00110,  // 2x faster than before
      drift: (Math.random() - 0.5) * 0.00020,
      alpha: 0.07 + Math.random() * 0.07,
      size:  11 + Math.floor(Math.random() * 4),
    }));

    // ── Dot grid ──────────────────────────────────────────────────────────────
    const DOT_SPACING = 32;

    const t0 = performance.now();

    const draw = (now) => {
      rafRef.current = requestAnimationFrame(draw);
      const t  = now - t0;
      const W  = canvas.width;
      const H  = canvas.height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, W, H);

      // ── Dot grid ───────────────────────────────────────────────────────────
      const mxPx = mx * W;
      const myPx = my * H;
      const cols = Math.ceil(W / DOT_SPACING) + 1;
      const rows = Math.ceil(H / DOT_SPACING) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dx = c * DOT_SPACING - mxPx;
          const dy = r * DOT_SPACING - myPx;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          ctx.beginPath();
          ctx.arc(c * DOT_SPACING, r * DOT_SPACING, 1.5, 0, Math.PI * 2);
          
          if (dist < 150) {
            const intensity = Math.max(0, 1 - dist / 150);
            // Reduced brightness from full cyan glowing to a softer glowing cyan 
            ctx.fillStyle = `rgba(0, 204, 255, ${0.15 + intensity * 0.35})`;
            ctx.shadowBlur = intensity * 10;
            ctx.shadowColor = '#00ccff';
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, 0.04)`;
            ctx.shadowBlur = 0;
          }
          
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0; // reset for next passes

      // ── Aurora blobs ──────────────────────────────────────────────────────
      BLOBS.forEach(blob => {
        const driftX = Math.sin(t * blob.speed + blob.phase) * 80;
        const driftY = Math.cos(t * blob.speed * 0.7 + blob.phase) * 60;
        const attractX = (mx - blob.ox) * 15;
        const attractY = (my - blob.oy) * 15;
        const bx = blob.ox * W + driftX + attractX;
        const by = blob.oy * H + driftY + attractY;
        const r  = blob.size / 2;

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        grad.addColorStop(0, blob.color + '1f');
        grad.addColorStop(1, blob.color + '00');
        ctx.filter = 'blur(50px)';
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';
      });

      // ── Mist / fog veil (static bottom gradient) ──────────────────────────
      const mist = ctx.createLinearGradient(0, H * 0.55, 0, H);
      mist.addColorStop(0, 'transparent');
      mist.addColorStop(1, 'rgba(2,8,23,0.35)');
      ctx.fillStyle = mist;
      ctx.fillRect(0, 0, W, H);

      // ── Floating code tokens ───────────────────────────────────────────────
      tokens.forEach(tok => {
        tok.y -= tok.speed;
        tok.x += tok.drift;
        if (tok.y < -0.08) {
          tok.y = 1.05 + Math.random() * 0.1;
          tok.x = 0.04 + Math.random() * 0.92;
          tok.speed = 0.00065 + Math.random() * 0.00110;
          tok.drift = (Math.random() - 0.5) * 0.00020;
        }
        if (tok.x < -0.02 || tok.x > 1.02) tok.drift *= -1;

        ctx.font = `${tok.size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `rgba(255,255,255,${tok.alpha})`;
        ctx.fillText(tok.str, tok.x * W, tok.y * H);
      });
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [canvasRef]);
}
