import { useScroll, useTransform } from 'framer-motion';

/**
 * useScrollProgress
 * Returns scroll progress as a MotionValue (0 to 1)
 */
export function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  return scrollYProgress;
}
