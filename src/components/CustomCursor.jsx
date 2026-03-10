import React from 'react';
import { useCustomCursor } from '../hooks/useCustomCursor';

const CURSOR_CSS = `
  .lp-wrap, .lp-wrap * { cursor: none !important; }

  #cursor-dot {
    position: fixed;
    top: 0; left: 0;
    width: 5px; height: 5px;
    background: #ffffff;
    border-radius: 50%;
    pointer-events: none;
    z-index: 99999;
    transform: translate(-50%, -50%);
    transition: opacity 0.2s ease;
    mix-blend-mode: difference;
    will-change: left, top;
  }

  #cursor-orb {
    position: fixed;
    top: 0; left: 0;
    width: 400px; height: 400px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 99998;
    transform: translate(-50%, -50%) scale(1);
    background: radial-gradient(
      circle at center,
      #6366f118 0%,
      #6366f10c 30%,
      #6366f106 60%,
      transparent 70%
    );
    filter: blur(8px);
    will-change: left, top, transform;
    transition:
      transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
      background 600ms ease,
      opacity 0.2s ease;
  }
`;

/**
 * CustomCursor — Recharge-style glowing orb cursor.
 * Drop as FIRST child of the landing page wrapper ONLY.
 * No-ops automatically on touch devices.
 */
const CustomCursor = () => {
  useCustomCursor();
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;
  return (
    <>
      <style>{CURSOR_CSS}</style>
      <div id="cursor-orb" aria-hidden="true" />
      <div id="cursor-dot" aria-hidden="true" />
    </>
  );
};

export default CustomCursor;
