import { useState, useEffect, useRef } from 'react';

/**
 * useTypewriter
 * Cycles through an array of strings with typing + deleting animation.
 * @param {string[]} strings     - Array of strings to cycle through
 * @param {object}  options
 * @param {number}  options.typeSpeed   - ms per character typed (default 80)
 * @param {number}  options.deleteSpeed - ms per character deleted (default 40)
 * @param {number}  options.pauseTime   - ms to pause before deleting (default 2000)
 */
export function useTypewriter(strings, {
  typeSpeed = 80,
  deleteSpeed = 40,
  pauseTime = 2000,
} = {}) {
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [stringIndex, setStringIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Respect reduced motion — show full final string instantly
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplayed(strings[strings.length - 1]);
      return;
    }

    const current = strings[stringIndex];

    const tick = () => {
      if (isPaused) {
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      if (isDeleting) {
        // Delete one character
        setDisplayed(prev => prev.slice(0, -1));
        if (displayed.length <= 1) {
          setIsDeleting(false);
          setStringIndex(prev => (prev + 1) % strings.length);
        }
      } else {
        // Type one character
        setDisplayed(current.slice(0, displayed.length + 1));
        if (displayed.length + 1 === current.length) {
          // Fully typed — pause before deleting
          setIsPaused(true);
        }
      }
    };

    const delay = isPaused ? pauseTime : isDeleting ? deleteSpeed : typeSpeed;
    timerRef.current = setTimeout(tick, delay);
    return () => clearTimeout(timerRef.current);
  }, [displayed, isDeleting, isPaused, stringIndex, strings, typeSpeed, deleteSpeed, pauseTime]);

  return displayed;
}
