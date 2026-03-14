import { useState, useEffect, useRef } from 'react';

/**
 * useTypewriter
 * Cycles through strings with human-paced typing animation.
 * Returns { text } — render: <span>{text}</span><span className="tw-cursor">|</span>
 *
 * @param {string[]} strings
 * @param {object}  opts
 */
export function useTypewriter(strings = [], {
  typeSpeed   = 75,
  deleteSpeed = 35,
  pauseAfter  = 2200,   // pause after fully typed
  pauseBefore = 400,    // pause before starting delete
} = {}) {
  const [text, setText] = useState('');
  const stateRef = useRef({
    stringIdx: 0,
    charIdx:   0,
    phase:     'typing',   // 'typing' | 'pausing' | 'pre-delete' | 'deleting'
  });
  const timerRef = useRef(null);

  useEffect(() => {
    if (!strings.length) return;

    // Respect prefers-reduced-motion — show first string instantly
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(strings[0]);
      return;
    }

    const tick = () => {
      const s = stateRef.current;
      const current = strings[s.stringIdx];

      if (s.phase === 'typing') {
        s.charIdx++;
        setText(current.slice(0, s.charIdx));
        if (s.charIdx >= current.length) {
          s.phase = 'pausing';
          timerRef.current = setTimeout(tick, pauseAfter);
          return;
        }
        timerRef.current = setTimeout(tick, typeSpeed);

      } else if (s.phase === 'pausing') {
        s.phase = 'pre-delete';
        timerRef.current = setTimeout(tick, pauseBefore);

      } else if (s.phase === 'pre-delete') {
        s.phase = 'deleting';
        timerRef.current = setTimeout(tick, deleteSpeed);

      } else if (s.phase === 'deleting') {
        s.charIdx--;
        setText(current.slice(0, s.charIdx));
        if (s.charIdx <= 0) {
          s.stringIdx = (s.stringIdx + 1) % strings.length;
          s.charIdx   = 0;
          s.phase     = 'typing';
          timerRef.current = setTimeout(tick, typeSpeed * 2);
          return;
        }
        timerRef.current = setTimeout(tick, deleteSpeed);
      }
    };

    timerRef.current = setTimeout(tick, typeSpeed);
    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { text };
}
