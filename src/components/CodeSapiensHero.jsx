import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ChevronDown, Menu, X, Github, Linkedin, Youtube, Users,
  Crown, Globe, ArrowUpRight, Instagram, Twitter,
} from 'lucide-react';
import { BACKEND_URL } from '../config';
import monkeyLogo from '../assets/monkey-logo.png';
import { authFetch } from '../lib/authFetch';
import LandingPopup from './LandingPopup';
import FluidCursor from './FluidCursor';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useAurora } from '../hooks/useAurora';
import { useCountUp } from '../hooks/useCountUp';
import { useTypewriter } from '../hooks/useTypewriter';
import { useSpotlightCard } from '../hooks/useSpotlightCard';

// ─── Design tokens injected as CSS vars + keyframes ──────────────────────────
const LANDING_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700;800&display=swap');

  :root {
    --bg-base:      #020817;
    --bg-surface:   #0f1729;
    --bg-elevated:  #1e293b;
    --border:       #1e293b;
    --border-glow:  #6366f120;
    --primary:      #6366f1;
    --primary-glow: #6366f140;
    --secondary:    #22d3ee;
    --accent:       #a855f7;
    --success:      #10b981;
    --text-primary: #f1f5f9;
    --text-body:    #94a3b8;
    --text-muted:   #475569;
    --text-code:    #10b981;
  }

  /* ── Cursor ── */
  .lp-wrap { cursor: none; }
  .lp-wrap a, .lp-wrap button, .lp-wrap [role="button"] { cursor: none; }


  /* ── Card base ── */
  .cs-card {
    background: #0f1729;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    transition: border-color 300ms ease, box-shadow 300ms ease, transform 300ms cubic-bezier(.03,.98,.52,.99);
  }
  .cs-card:hover {
    border-color: #6366f160;
    box-shadow: 0 20px 40px #00000040;
    transform: translateY(-4px) scale(1.01);
  }

  /* ── Terminal / IDE labels ── */
  .ide-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    user-select: none;
  }
  .ide-label .ide-prompt { color: var(--text-code); }

  /* ── Gradient text ── */
  .grad-text {
    background: linear-gradient(90deg, #6366f1, #a855f7, #22d3ee);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* ── Code inline style ── */
  .code-token {
    background: #0f1729;
    border: 1px solid #1e293b;
    border-radius: 4px;
    padding: 1px 6px;
    font-family: 'JetBrains Mono', monospace;
    color: #10b981;
    font-size: 0.8em;
  }

  /* ── Neon button ── */
  .neon-btn {
    background: linear-gradient(135deg, #6366f120, #a855f710);
    border: 1px solid #6366f160;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
  }
  .neon-btn:hover {
    border-color: #6366f1;
    box-shadow: 0 0 20px #6366f130, 0 0 40px #6366f110;
  }

  /* ── Blinking footer cursor ── */
  @keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .blink-cur { animation: cursor-blink 1s step-end infinite; }

  /* ── Founder cards (compact 160×210 with subtle glow border) ── */
  .founder-card {
    position: relative;
    width: 160px;
    height: 210px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: none;
    border: 1px solid rgba(99, 102, 241, 0.35);
    border-radius: 14px;
    overflow: hidden;
    background: #0f1729;
    transition: all 0.4s ease;
  }
  .founder-card:hover {
    border-color: rgba(99, 102, 241, 0.8);
    box-shadow: 0 0 12px rgba(99, 102, 241, 0.2),
                0 0 1px rgba(34, 211, 238, 0.3);
  }
  .founder-card b {
    position: absolute;
    inset: 0;
    background: #0f1729;
    z-index: 2;
    border-radius: 10px;
  }
  .founder-card img {
    position: absolute;
    z-index: 3;
    width: 80%;
    height: 80%;
    object-fit: cover;
    border-radius: 10px;
    overflow: hidden;
    opacity: 0.3;
    scale: 0.9;
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .founder-card:hover img {
    scale: 0.55;
    opacity: 1;
    transform: translateY(-55px);
  }
  .founder-card .content {
    position: absolute;
    z-index: 3;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: scale(0) translateY(20px);
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .founder-card:hover .content {
    transform: scale(1) translateY(0);
    opacity: 1;
    bottom: 18px;
  }
  .founder-card .content .title {
    color: #f1f5f9;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
    line-height: 1.3;
  }
  .founder-card .content .title span {
    font-weight: 400;
    font-size: 0.85em;
    color: #22d3ee;
    letter-spacing: 0.04em;
    text-transform: none;
  }
  .founder-card .sci {
    list-style: none;
    padding: 0;
    margin: 0.4rem 0 0 0;
    display: flex;
    gap: 0.35rem;
  }
  .founder-card .sci li a {
    color: rgba(255,255,255,0.5);
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    transition: all 0.3s ease;
    text-decoration: none;
  }
  .founder-card .sci li a:hover {
    color: white;
    background: #6366f130;
    border-color: #6366f1;
    box-shadow: 0 0 8px #6366f140;
  }

  /* ── Sponsor cyber cards (aligned with hero theme) ── */
  .sponsor-parent {
    width: 100%;
    padding: 0.75rem;
    perspective: 1000px;
  }
  .sponsor-card-3d {
    position: relative;
    padding-top: 0;
    border: 1px solid rgba(99,102,241,0.25);
    transform-style: preserve-3d;
    background: transparent;
    width: 100%;
    box-shadow: none;
    transition: all 0.5s ease-in-out;
    border-radius: 0.75rem;
    overflow: hidden;
  }
  .sponsor-card-3d:hover {
    transform: rotate3d(0.4, 0.8, 0, 16deg);
    border-color: rgba(99,102,241,0.6);
    box-shadow: 0 0 24px rgba(99,102,241,0.2);
  }
  .sponsor-content-box {
    background: transparent;
    border-radius: 0.75rem;
    transition: all 0.5s ease-in-out;
    padding: 1.5rem 1rem;
    transform-style: preserve-3d;
    border: none;
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
  }
  .sponsor-logo-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 72px;
    transform: translate3d(0, 0, 40px);
  }
  .sponsor-logo {
    width: 64px;
    height: 64px;
    object-fit: contain;
    display: block;
    margin: 0 auto;
    filter: grayscale(0) brightness(1);
    transition: transform 0.5s ease, filter 0.5s ease;
  }
  .sponsor-card-3d:hover .sponsor-logo {
    filter: grayscale(1) brightness(0.7);
    transform: translate3d(0, 0, 60px) scale(1.08);
  }
  .sponsor-name {
    margin-top: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #e2e8f0;
    transform: translate3d(0, 0, 30px);
    display: block;
  }
  .sponsor-pill {
    display: none;
  }
  .sponsor-pill span {
    display: block;
    text-align: center;
  }
  .sponsor-pill-label {
    color: var(--secondary);
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.14em;
  }
  .sponsor-pill-index {
    font-size: 0.9rem;
    font-weight: 900;
    color: var(--secondary);
  }
  .sponsor-glare {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      125deg,
      rgba(255,255,255,0) 0%,
      rgba(148, 163, 184, 0.04) 45%,
      rgba(148, 163, 184, 0.1) 50%,
      rgba(148, 163, 184, 0.04) 55%,
      rgba(255,255,255,0) 100%
    );
    opacity: 0;
    transition: opacity 300ms;
    z-index: 1;
  }
  .sponsor-card-3d:hover .sponsor-glare {
    opacity: 1;
  }
  .sponsor-lines span {
    position: absolute;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(99, 102, 241, 0.25),
      transparent
    );
  }
  .sponsor-lines span:nth-child(1),
  .sponsor-lines span:nth-child(2),
  .sponsor-lines span:nth-child(3),
  .sponsor-lines span:nth-child(4) {
    width: 100%;
    height: 1px;
    transform: scaleX(0);
    opacity: 0;
    animation: sponsorLineGrow 3s linear infinite;
  }
  .sponsor-lines span:nth-child(1) {
    top: 25%;
    left: 0;
    transform-origin: left;
  }
  .sponsor-lines span:nth-child(2) {
    top: 45%;
    right: 0;
    transform-origin: right;
    animation-delay: 0.7s;
  }
  .sponsor-lines span:nth-child(3) {
    top: 65%;
    left: 0;
    transform-origin: left;
    animation-delay: 1.4s;
  }
  .sponsor-lines span:nth-child(4) {
    top: 82%;
    right: 0;
    transform-origin: right;
    animation-delay: 2.1s;
  }
  .sponsor-corners span {
    position: absolute;
    width: 12px;
    height: 12px;
    border: 1px solid rgba(99, 102, 241, 0.35);
    transition: all 0.3s ease;
  }
  .sponsor-corners span:nth-child(1) {
    top: 10px;
    left: 10px;
    border-right: 0;
    border-bottom: 0;
  }
  .sponsor-corners span:nth-child(2) {
    top: 10px;
    right: 10px;
    border-left: 0;
    border-bottom: 0;
  }
  .sponsor-corners span:nth-child(3) {
    bottom: 10px;
    left: 10px;
    border-right: 0;
    border-top: 0;
  }
  .sponsor-corners span:nth-child(4) {
    bottom: 10px;
    right: 10px;
    border-left: 0;
    border-top: 0;
  }
  .sponsor-scan {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(99, 102, 241, 0.1),
      transparent
    );
    transform: translateY(-100%);
    animation: sponsorScanMove 2.4s linear infinite;
    opacity: 0.75;
    z-index: 1;
  }
  .sponsor-card-3d:hover .sponsor-corners span {
    border-color: rgba(129, 140, 248, 0.9);
    box-shadow: 0 0 10px rgba(129, 140, 248, 0.55);
  }
  @keyframes sponsorLineGrow {
    0% {
      transform: scaleX(0);
      opacity: 0;
    }
    50% {
      transform: scaleX(1);
      opacity: 1;
    }
    100% {
      transform: scaleX(0);
      opacity: 0;
    }
  }
  @keyframes sponsorScanMove {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(100%);
    }
  }

  /* ── Impact stat cards (Code Fragment Redesign) ── */
  .impact-stat-card {
    background: #0f1729;
    border: 1px solid #1e293b;
    border-radius: 12px;
    font-family: 'JetBrains Mono', monospace;
    position: relative;
    overflow: hidden;
    height: 100%;
    display: flex;
    box-shadow: inset 0 0 30px rgba(99, 102, 241, 0.05);
    transition: all 0.3s ease;
  }
  .impact-stat-card:hover {
    border-color: rgba(99, 102, 241, 0.4);
    box-shadow: inset 0 0 40px rgba(99, 102, 241, 0.08), 0 10px 30px rgba(0,0,0,0.3);
  }
  .impact-stat-content {
    flex: 1;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .code-line {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
    line-height: 1.4;
  }
  .code-line .const { color: #10b981; font-weight: 700; }
  .code-line .var { color: var(--text-primary); }
  .code-line .op { color: var(--text-muted); font-weight: 500; }
  .code-line .val { 
    color: var(--secondary); 
    font-size: 2.2rem; 
    font-weight: 800; 
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.02em;
    text-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
  }
  .code-comment {
    margin-top: 1rem;
    font-size: 0.8rem;
    color: #10b981;
    opacity: 0.7;
    font-style: italic;
  }
  .stat-glow {
    position: absolute;
    top: 50%;
    left: 20px;
    width: 60%;
    height: 40%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%);
    pointer-events: none;
    transform: translateY(-50%);
  }

  /* ── Mascot (hero) — spotlight reveal ── */
  .mascot-wrapper {
    position: relative;
    width: 420px;
    height: 420px;
    animation: mascot-float 4s ease-in-out infinite;
  }
  @keyframes mascot-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  .mascot-dark {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: grayscale(1) brightness(0.12);
    transition: none;
  }
  .mascot-color {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: grayscale(0) brightness(1.1);
    opacity: 1;
    -webkit-mask-image: radial-gradient(
      circle 0px at var(--mx, 50%) var(--my, 50%),
      black 0%, transparent 100%
    );
    mask-image: radial-gradient(
      circle 0px at var(--mx, 50%) var(--my, 50%),
      black 0%, transparent 100%
    );
    transition: -webkit-mask-image 0.05s linear, mask-image 0.05s linear;
  }
  @media (max-width: 1023px) {
    .mascot-dark {
      filter: grayscale(0) brightness(1) !important;
      position: relative !important;
    }
    .mascot-color { display: none !important; }
  }

  /* ── Monkey gradient reveal ── */
  .monkey-reveal-wrapper {
    position: relative;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    overflow: hidden;
    border: 1.5px solid rgba(99,102,241,0.25);
    box-shadow: 0 0 30px rgba(99,102,241,0.08);
  }
  .monkey-ghost {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(10) grayscale(1) opacity(0.07);
    z-index: 1;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
  }
  .monkey-color {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    z-index: 2;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
    -webkit-mask-image: radial-gradient(circle 0px at 50% 50%, black 0%, transparent 0%);
    mask-image: radial-gradient(circle 0px at 50% 50%, black 0%, transparent 0%);
  }
  .monkey-tint {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .monkey-ring {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 2px solid rgba(99,102,241,0.55);
    box-shadow:
      0 0 16px rgba(99,102,241,0.4),
      inset 0 0 16px rgba(99,102,241,0.08);
    pointer-events: none;
    z-index: 4;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.2s;
  }

  /* ── Navbar restyle ── */
  .nav-lp {
    padding: 1.2rem 2rem;
    background: transparent;
    backdrop-filter: none;
    border-bottom: none;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .nav-lp.scrolled {
    padding: 0.8rem 2rem;
    background: rgba(2, 8, 23, 0.85) !important;
    backdrop-filter: blur(24px) saturate(180%);
    border-bottom: 1px solid #1e293b;
  }
  .nav-link-lp {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 0.9rem;
    color: #94a3b8;
    letter-spacing: 0.02em;
    position: relative;
    transition: color 0.3s ease;
  }
  .nav-link-lp:hover { color: #f1f5f9; }
  .nav-link-lp::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0%;
    height: 2px;
    background: linear-gradient(to right, #6366f1, #22d3ee);
    transition: width 0.3s ease;
  }
  .nav-link-lp:hover::after { width: 100%; }
  .nav-cta-btn {
    background: transparent;
    border: 1px solid #6366f1;
    color: #f1f5f9;
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    animation: borderPulse 2.5s ease-in-out infinite;
    transition: all 0.3s ease;
  }
  @keyframes borderPulse {
    0%, 100% { box-shadow: 0 0 0px #6366f140; }
    50% { box-shadow: 0 0 16px #6366f160, 0 0 32px #6366f130; }
  }
  .nav-cta-btn:hover {
    background: #6366f115;
    border-color: #22d3ee;
    box-shadow: 0 0 20px #6366f150;
    transform: translateY(-1px);
  }
  .nav-scroll-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: linear-gradient(to right, #6366f1, #22d3ee);
    transform-origin: left;
    z-index: 10;
  }
  .hamburger-line {
    width: 24px;
    height: 2px;
    background: #f1f5f9;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  .hamburger-open .hamburger-line:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
  .hamburger-open .hamburger-line:nth-child(2) { opacity: 0; }
  .hamburger-open .hamburger-line:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
  .mobile-menu-lp {
    background: rgba(2, 8, 23, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid #1e293b;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }

  /* ── 3D Community Carousel ── */
  .community-3d-scene {
    perspective: 1200px;
    width: 100%;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 4rem 0;
    overflow: visible;
  }
  .community-3d-carousel {
    position: relative;
    width: 300px;
    height: 200px;
    transform-style: preserve-3d;
    animation: rotate-carousel 25s linear infinite;
  }
  .community-3d-carousel:hover {
    animation-play-state: paused;
  }
  .carousel-photo-wrap {
    position: absolute;
    width: 280px;
    height: 180px;
    left: 10px;
    top: 10px;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid var(--border);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    background: var(--bg-surface);
    transition: transform 0.3s ease, border-color 0.3s ease;
  }
  .carousel-photo-wrap:hover {
    border-color: var(--primary-color);
  }
  .carousel-photo-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.8) saturate(1.1);
    transition: filter 0.3s ease;
  }
  .carousel-photo-wrap:hover img {
    filter: brightness(1) saturate(1.3);
  }
  .carousel-photo-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
  }

  @keyframes rotate-carousel {
    from { transform: rotateY(0deg); }
    to { transform: rotateY(360deg); }
  }

  /* Note: The JS will calculate the rotation for each photo:
     transform: rotateY(i * (360/total)) translateZ(450px)
  */

  /* Impact stat mild tilt */
  .impact-tilt-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    transform-origin: top right;
    transform: skewY(-2deg);
  }
  .impact-tilt-card-wrap {
    transform-origin: top left;
    transform: skewY(2deg) rotateZ(6deg);
    position: relative;
    z-index: 1;
    transition: z-index 0.3s;
    cursor: none;
  }
  .impact-tilt-card-wrap:hover { z-index: 10; }
  .impact-tilt-card-inner {
    transform: rotate(0deg) translate(0,0);
    transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94),
                box-shadow 0.4s ease;
  }
  .impact-tilt-card-wrap:hover .impact-tilt-card-inner {
    transform: rotate(-6deg) translate(3%, 8%) scale(1.3);
    box-shadow: 0 20px 60px rgba(99,102,241,0.3), 0 0 40px rgba(34,211,238,0.1);
  }

  /* ── Terminal / Notice section ── */
  @keyframes termScan {
    0%   { background-position: 0 0; }
    100% { background-position: 0 100%; }
  }
  @keyframes termBlink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes termStream {
    from { opacity:0; transform: translateY(6px); }
    to   { opacity:1; transform: translateY(0); }
  }
  .term-card {
    background: #0f1729;
    border: 1px solid #1e293b;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 0 0 1px #6366f110, 0 4px 24px rgba(0,0,0,0.4);
    transition: box-shadow 0.4s ease, border-color 0.4s ease;
    position: relative;
  }
  .term-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(99,102,241,0.012) 3px,
      rgba(99,102,241,0.012) 4px
    );
    pointer-events: none;
    z-index: 0;
  }
  .term-card:hover {
    border-color: #6366f160;
    box-shadow: 0 0 0 1px #6366f130, 0 8px 40px rgba(99,102,241,0.15);
  }
  .term-chrome {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1rem;
    background: #020817;
    border-bottom: 1px solid #1e293b;
    position: relative;
    z-index: 1;
  }
  .term-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
  }
  .term-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    color: var(--text-muted);
    opacity: 0.9;
    margin-left: 0.5rem;
    letter-spacing: 0.08em;
  }
  .term-body {
    padding: 1rem 1.2rem;
    position: relative;
    z-index: 1;
  }
  .term-line {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    color: var(--text-body);
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
    animation: termStream 0.3s ease forwards;
  }
  .term-line.dim  { color: var(--text-muted); font-size: 0.72rem; }
  .term-line.warn { color: #f59e0b; }
  .term-line.cmd  { color: var(--secondary); }
  .term-cursor {
    display: inline-block;
    width: 8px; height: 1em;
    background: var(--primary);
    vertical-align: text-bottom;
    margin-left: 2px;
    animation: termBlink 1s step-end infinite;
  }
  .term-img-wrap {
    margin-top: 0.75rem;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #1e293b;
    height: 220px;
  }
  .term-img-wrap img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    filter: saturate(0.9) brightness(0.85);
    transition: filter 0.4s ease;
  }
  .term-card:hover .term-img-wrap img {
    filter: saturate(1.1) brightness(1);
  }

  /* ── Podium / Award Steps ── */
  .podium-container {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
    min-height: 200px;
  }
  .podium-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 33%;
    position: relative;
  }
  .podium-step {
    width: 100%;
    border-radius: 8px 8px 0 0;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 1rem;
    background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%);
    border: 1px solid var(--border);
    border-bottom: none;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .podium-item:hover .podium-step {
    border-color: #6366f160;
    box-shadow: 0 0 20px #6366f120;
  }
  .podium-rank-badge {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    border: 3px solid rgba(255,255,255,0.3);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(12px);
    z-index: 2;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    flex-shrink: 0;
    aspect-ratio: 1/1;
  }
  .podium-item:hover .podium-rank-badge {
    transform: scale(1.15) translateY(-5px);
    border-color: rgba(255,255,255,0.6);
  }
  .podium-rank-badge::after {
    content: '';
    position: absolute;
    top: -100%;
    left: -100%;
    width: 300%;
    height: 300%;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.6), transparent);
    transform: rotate(45deg);
    animation: badge-shine 2.5s infinite;
  }
  @keyframes badge-shine {
    0% { transform: translate(-100%, -100%) rotate(45deg); }
    100% { transform: translate(100%, 100%) rotate(45deg); }
  }

  .rank-1 .podium-rank-badge { 
    background: radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b); 
    color: #451a03; 
    box-shadow: 0 0 30px rgba(245, 158, 11, 0.7), inset 0 0 15px rgba(255,255,255,0.6); 
  }
  .rank-2 .podium-rank-badge { 
    background: radial-gradient(circle at 30% 30%, #f1f5f9, #94a3b8); 
    color: #0f172a; 
    box-shadow: 0 0 25px rgba(148, 163, 184, 0.5), inset 0 0 12px rgba(255,255,255,0.5); 
  }
  .rank-3 .podium-rank-badge { 
    background: radial-gradient(circle at 30% 30%, #fb923c, #b45309); 
    color: #451a03; 
    box-shadow: 0 0 20px rgba(180, 83, 9, 0.5), inset 0 0 10px rgba(255,255,255,0.4); 
  }

  .podium-name {
    font-size: 0.7rem;
    font-weight: 700;
    text-align: center;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    padding: 0 0.5rem;
    max-width: 100%;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .podium-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: var(--text-code);
  }
  
  .rank-1 .podium-step { height: 160px; border-top: 2px solid #f59e0b; padding-bottom: 1rem; }
  .rank-2 .podium-step { height: 130px; border-top: 2px solid #94a3b8; padding-bottom: 0.75rem; }
  .rank-3 .podium-step { height: 110px; border-top: 2px solid #b45309; padding-bottom: 0.5rem; }

  @media (max-width: 640px) {
    .podium-container { gap: 0.5rem; }
    .podium-name { font-size: 0.6rem; }
    .podium-count { font-size: 0.65rem; }
  }
`;

// ─── Reusable card entrance variants ─────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.94 },
  visible: (i = 0) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.10, type: 'spring', stiffness: 70, damping: 20, mass: 1 },
  }),
};

// ─── SpotlightCard wrapper ────────────────────────────────────────────────────
const SpotlightCard = ({ children, className = '', index = 0, tilt = false, style = {} }) => {
  const { ref, spotlightStyle, tiltStyle, innerParallax, onMouseMove, onMouseLeave } = useSpotlightCard(tilt ? 8 : 0);
  const inviewRef = useRef(null);
  const inView = useInView(inviewRef, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={(el) => { inviewRef.current = el; ref.current = el; }}
      className={`cs-card ${className}`}
      data-cursor="card"
      style={{ ...style, ...(tilt ? tiltStyle : {}), transformStyle: tilt ? 'preserve-3d' : undefined }}
      variants={cardVariants}
      custom={index}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div style={spotlightStyle} />
      {typeof children === 'function' ? children({ innerParallax }) : children}
    </motion.div>
  );
};


// ─── StatsSection (Impact — IDE variable style) ───────────────────────────────
const StatsSection = () => {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [stats, setStats]   = useState({ 
    topColleges: [
      { name: "Rajalakshmi Engineering College", count: 52 },
      { name: "Sri Sairam Engineering College", count: 49 },
      { name: "Panimalar Engineering College", count: 45 },
      { name: "Mazharul Uloom College, Ambur", count: 11 }
    ], 
    totalUsers: 2000, 
    totalColleges: 100 
  });
  const [loading, setLoading] = useState(true);

  const count1 = useCountUp(stats.totalUsers   || 2000, inView);
  const count2 = useCountUp(stats.totalColleges || 100,  inView);

  useEffect(() => {
    authFetch(`${BACKEND_URL}/api/public-stats`)
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.stats); })
      .catch(e => console.error('Stats fetch error:', e))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { varName: 'members', val: count1, suffix: '+', desc: 'Active community' },
    { varName: 'colleges', val: count2, suffix: '+', desc: 'Colleges reached' },
  ];

  return (
    <section className="py-20 relative" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #6366f1 0%, transparent 60%)' }} />
      <div className="container mx-auto px-6 relative z-10" ref={ref}>

        <div className="ide-label mb-10">
          <span className="ide-prompt">$</span>
          <span>ls --impact --numbers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
            {statCards.map((item, i) => (
              <motion.div
                key={i}
                className="impact-stat-card"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: i * 0.1 }}
              >
                <div className="impact-stat-content">
                  <div className="code-line">
                    <span className="const">const</span>
                    <span className="var">{item.varName}</span>
                    <span className="op">=</span>
                    <span className="val">{item.val}{item.suffix};</span>
                  </div>
                  <div className="code-comment">
                    // {item.desc}
                  </div>
                </div>
                <div className="stat-glow" />
              </motion.div>
            ))}
          </div>

          <SpotlightCard index={2} className="h-full" style={{ borderLeft: '4px solid var(--accent)' }}>
            <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-2">
                 <span className="text-accent h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: '#a855f7' }} />
                 <h4 className="text-base font-bold grad-text m-0" style={{ letterSpacing: '-0.02em' }}>Top Active Colleges</h4>
               </div>
               <div className="text-[10px] font-mono text-muted opacity-50 px-2 py-1 border border-border rounded">LEADERBOARD_V1.0.4</div>
            </div>
            <div className="relative">
              {loading && stats.topColleges.length === 0 ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <p className="text-sm font-mono animate-pulse" style={{ color: 'var(--text-muted)' }}>// loading leaderboard...</p>
                </div>
              ) : (
                <div className="podium-container">
                  {/* Reorder: 2nd, 1st, 3rd for visual steps */}
                  {[
                    { ...(stats.topColleges[1] || {}), rank: 2 },
                    { ...(stats.topColleges[0] || {}), rank: 1 },
                    { ...(stats.topColleges[2] || {}), rank: 3 }
                  ].filter(c => c.name).map((c, i) => (
                    <motion.div
                      key={c.rank}
                      className={`podium-item rank-${c.rank}`}
                      initial={{ opacity: 0, y: 32 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.4 + (c.rank === 1 ? 0 : 0.2), duration: 0.6 }}
                    >
                      <div className="podium-name mb-2">{c.name}</div>
                      <div className="podium-step">
                        <div className="podium-rank-badge">{c.rank}</div>
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5 podium-count">
                            <Users size={12} className="opacity-70" />
                            <span>{c.count}</span>
                          </div>
                          <div className="text-[10px] opacity-40 font-mono">students</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
};

// ─── SponsorSection ──────────────────────────────────────────────────────────
const SponsorSection = () => {
  const sponsors = [
    { name:'Mako IT Lab',    link:'https://www.makoitlab.com/',         image:'https://res.cloudinary.com/dqudvximt/image/upload/v1767816977/users_cme79i2lk00qls401ar5qxqnc_VGly5cMkz1ZxkXas-1_76R8XDxGiLgjc8BaeXApow_yzzhyw.webp' },
    { name:'Yuniq',          link:'https://yuniq.co/',                  image:'https://res.cloudinary.com/dqudvximt/image/upload/v1767817525/users_cme79i2lk00qls401ar5qxqnc_hBofB72xXBV4C0cL-users_clylc5w1v070to301jatq0e85_FVqmiMesQBlCZ0ZM-yuniq_njsnoy.jpg' },
    { name:'Contentstack',   link:'https://www.contentstack.com/',      image:'https://res.cloudinary.com/dqudvximt/image/upload/v1767817529/users_cme79i2lk00qls401ar5qxqnc_DaxnHl7f0QdeQwgx-square-image_pvgube.jpg' },
    { name:'Navan AI',       link:'https://navan.ai/',                  image:'https://res.cloudinary.com/dqudvximt/image/upload/v1771507803/WhatsApp_Image_2026-02-19_at_4.28.11_PM_bxnzfc.jpg' },
    { name:'Notion',         link:'https://www.notion.com/',            image:'https://res.cloudinary.com/dqudvximt/image/upload/v1767817532/users_cme79i2lk00qls401ar5qxqnc_891aQQNEpsjHP7Ef-notion-logo-png_seeklogo-425508_k0njb3.webp' },
    { name:'Interview Buddy',link:'https://interviewbuddy.net/',        image:'https://res.cloudinary.com/dqudvximt/image/upload/v1771508422/WhatsApp_Image_2026-02-19_at_4.28.12_PM_xxalgw.jpg' },
  ];

  const handleSponsorMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.background = `radial-gradient(circle 200px at ${x}px ${y}px, #6366f120, #0f1729 60%)`;
  };
  const handleSponsorMouseLeave = (e) => {
    e.currentTarget.style.background = '#0f1729';
  };

  return (
    <section className="py-20 relative" style={{ background: 'var(--bg-base)' }}>
      <div className="container mx-auto px-6">
        <div className="ide-label mb-10">
          <span className="ide-prompt">$</span>
          <span>ls --sponsors --backing-the-future</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sponsors.map((s, i) => (
            <div key={i} className="sponsor-parent">
              <a
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <div className="sponsor-card-3d">
                  <div className="sponsor-glare" />
                  <div className="sponsor-scan" />
                  <div className="sponsor-content-box">
                    <div className="sponsor-lines">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <img src={s.image} alt={s.name} className="sponsor-logo" />
                    <span className="sponsor-name">{s.name}</span>
                  </div>
                  <div className="sponsor-corners">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CommunityPartners ────────────────────────────────────────────────────────
const CommunityPartnerCard = ({ image }) => {
  const cardRef = useRef(null);

  const handleMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = -(y / (rect.height / 2)) * 18;
    const rotY =  (x / (rect.width  / 2)) * 18;
    card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.08)`;
    card.style.boxShadow = `${-rotY * 1.2}px ${rotX * 1.2}px 40px rgba(99,102,241,0.35)`;
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    card.style.boxShadow = '0 0 0 rgba(99,102,241,0)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        width: 180, height: 180,
        borderRadius: '50%',
        border: '1.5px solid rgba(99,102,241,0.3)',
        background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        cursor: 'none',
        flexShrink: 0,
      }}
    >
      <img
        src={image}
        alt="Community Partner"
        style={{
          width: '70%', height: '70%',
          objectFit: 'contain',
          borderRadius: '50%',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  );
};

const CommunityPartners = () => {
  const partners = [
    { image:'https://res.cloudinary.com/dqudvximt/image/upload/v1767817843/users_cme79i2lk00qls401ar5qxqnc_OGGz5HgXCzS9rI8H-users_clylc5w1v070to301jatq0e85_bNj4z9CoW02cMzqm-circle_rs5ttj.png' },
    { image:'https://res.cloudinary.com/dqudvximt/image/upload/v1767817844/users_cme79i2lk00qls401ar5qxqnc_EMRqmDnatuO4Rk38-users_cm9cf3ngn02erro015wogiktk_8CHW9Warth4BkBG9-Blue_2520Minimalist_2520Simple_2520Technology_2520Logo_2520_2520_1_mqig9s.png' },
    { image:'https://res.cloudinary.com/dqudvximt/image/upload/v1767817846/users_cme79i2lk00qls401ar5qxqnc_1KwVf1Iz3NmGXUQP-176333249_mhbrlj.webp' },
  ];
  return (
    <section className="py-16 relative" style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
      <div className="container mx-auto px-6">
        <div className="ide-label mb-10">
          <span className="ide-prompt">$</span>
          <span>ls --community-partners</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {partners.map((p, i) => (
            <CommunityPartnerCard key={i} image={p.image} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── SocialMediaSection ───────────────────────────────────────────────────────
const SocialMediaSection = () => {
  const socials = [
    { name:'LinkedIn',  href:'https://www.linkedin.com/company/codesapiens-community/posts/', bg:'#0f1729', img:'https://res.cloudinary.com/dqudvximt/image/upload/v1767874220/users_cme79i2lk00qls401ar5qxqnc_n74cMGsKIBuvEzzj-users_cme5bsukl01binm014j8ioh2j_2SNEHA31eEqsxFRS-original-33f53dcd2f48e068523d32df0e5cc92f_xkirvh.gif', badge:'@codesapiens-community' },
    { name:'GitHub',    href:'https://github.com/Codesapiens-in',                              bg:'#0f1729', img:'https://res.cloudinary.com/dqudvximt/image/upload/v1767874482/users_cme79i2lk00qls401ar5qxqnc_MOSc1bv3RXu0WL5z-users_cme5bsukl01binm014j8ioh2j_7dOv2cTCX8B86u82-users_clylc5w1v070to301jatq0e85_AdzvY5ioFqaF37x5-github_dsjpx6.gif', badge:'@Codesapiens-in' },
    { name:'YouTube',   href:'https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi',      bg:'#0f1729', img:'https://res.cloudinary.com/dqudvximt/image/upload/v1767874488/users_cme79i2lk00qls401ar5qxqnc_Ov9Ygh4NAQfPGktu-users_cme5bsukl01binm014j8ioh2j_5JQAosdeiVappI2y-users_clylc5w1v070to301jatq0e85_CCuEsN5SSMlu4LAN-youtube_aky1f3.gif', badge:'@Codesapiens' },
    { name:'Instagram', href:'https://www.instagram.com/codesapiens/',                         bg:'#0f1729', img:'https://res.cloudinary.com/dqudvximt/image/upload/v1767874489/users_cme79i2lk00qls401ar5qxqnc_3o1XM7ID2mXVDk6e-XeFzd3iFtoytJqTv-1497553304-104_84834_allkph.png', badge:'@Codesapiens.in' },
    { name:'Twitter',   href:'https://twitter.com/codesapiens',                                bg:'#0f1729', img:'https://res.cloudinary.com/dqudvximt/image/upload/v1767874490/users_cme79i2lk00qls401ar5qxqnc_XgLMxxPTSSuuRKu5-users_cme5bsukl01binm014j8ioh2j_XQ7ryCBwyUFzFg6v-CLIPLY_372109260_TWITTER_LOGO_400_ptqbvv.gif', badge:'@codesapiens_in' },
    { name:'Luma',      href:'https://lu.ma/codesapiens',                                      bg:'#0f1729', img:'https://res.cloudinary.com/dqudvximt/image/upload/v1767875075/users_cme79i2lk00qls401ar5qxqnc_WI6Z0HVxNMCrvfgn-ETzJoQJr1aCFL2r7-rrDC9gCyIJ77RqVW-luma_cqxcny.jpg', badge:'lu.ma/codesapiens' },
    { name:'WhatsApp',  href:'https://chat.whatsapp.com/LLtoddmQx5rIRNb8WE6rqC',              bg:'#0f1729', img:'https://res.cloudinary.com/dqudvximt/image/upload/v1767875047/410201-PD391H-802_h7tcfj.jpg', badge:'Join Community' },
    { name:'Volunteer', href:'https://forms.gle/volunteer',                                    bg:'#0f1729', img:'https://res.cloudinary.com/dqudvximt/image/upload/v1767876038/users_cme79i2lk00qls401ar5qxqnc_Hg7Si3j52FVfpQRN-image_x8wghd.png', badge:'Apply Now' },
  ];
  return (
    <section className="py-20 relative" style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
      <div className="container mx-auto px-6">
        <div className="ide-label mb-10">
          <span className="ide-prompt">$</span>
          <span>ls --socials --connect</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {socials.map((s, i) => (
            <SpotlightCard key={i} index={i} className="p-0 overflow-hidden group" style={{ padding: 0 }}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="flex flex-col h-48 relative">
                <div className="absolute inset-0 overflow-hidden">
                  <img src={s.img} alt={s.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0f1729 30%, transparent)' }} />
                </div>
                <div className="absolute bottom-0 left-0 p-4 z-10">
                  <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                  <p className="font-mono text-xs" style={{ color: 'var(--text-code)' }}>{s.badge}</p>
                </div>
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={16} style={{ color: 'var(--secondary)' }} />
                </div>
              </a>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── FoundersSection (Daniel1227k card style) ──────────────────────────────────
const FoundersSection = ({ founders }) => {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <motion.section id="community" ref={sectionRef} className="py-24 relative"
      style={{ background: 'var(--bg-base)', borderTop:'1px solid var(--border)', position: 'relative', zIndex: 1 }}
      initial={{ opacity:0, y:32 }} whileInView={{ opacity:1, y:0 }}
      transition={{ type:'spring', stiffness:60, damping:20 }} viewport={{ once:true, amount:0.1 }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="ide-label mb-10"><span className="ide-prompt">$</span><span>ls --team --mafia-gang</span></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
          {founders.map((founder, i) => (
            <motion.div
              key={i}
              className="founder-card"
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 70, damping: 18, delay: i * 0.15 }}
            >
              <b />
              <img src={founder.photo} alt={founder.name} />
              <div className="content">
                <p className="title">
                  {founder.name}<br />
                  <span>{founder.role}</span>
                </p>
                <ul className="sci">
                  <li><a href={founder.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={16} /></a></li>
                  <li><a href={founder.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={16} /></a></li>
                  <li><a href={founder.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={16} /></a></li>
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

// ─── NoticeSection ────────────────────────────────────────────────────────────
const TerminalCard = ({ filename, lines, imgSrc, imgAlt, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [shown, setShown] = useState([]);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const interval = setInterval(() => {
      setShown(prev => [...prev, i]);
      i++;
      if (i >= lines.length) clearInterval(interval);
    }, 220);
    return () => clearInterval(interval);
  }, [inView, lines.length]);

  return (
    <motion.div
      ref={ref}
      className="term-card"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 70, damping: 18, delay }}
    >
      {/* Terminal chrome */}
      <div className="term-chrome">
        <span className="term-dot" style={{ background: '#ff5f57' }} />
        <span className="term-dot" style={{ background: '#febc2e' }} />
        <span className="term-dot" style={{ background: '#28c840' }} />
        <span className="term-title">~/codesapiens/{filename}</span>
      </div>

      {/* Streaming lines */}
      <div className="term-body">
        {lines.map((l, i) =>
          shown.includes(i) ? (
            <div key={i} className={`term-line${l.type ? ' ' + l.type : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}>
              {l.prefix && <span style={{ color: '#22d3ee', marginRight: '0.5rem' }}>{l.prefix}</span>}
              {l.text}
            </div>
          ) : null
        )}

        {/* blinking cursor appears after last shown line */}
        {shown.length > 0 && shown.length < lines.length && (
          <div className="term-line"><span className="term-cursor" /></div>
        )}
        {shown.length === lines.length && (
          <div className="term-line dim">{'// EOF'}<span className="term-cursor" /></div>
        )}

        {/* Image rendered as 'file output' */}
        {imgSrc && shown.length >= lines.length && (
          <motion.div
            className="term-img-wrap"
            initial={{ opacity: 0, scaleY: 0.8 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.3 }}
          >
            <img src={imgSrc} alt={imgAlt} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const NoticeSection = () => (
  <section className="py-16 relative" style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
    <div className="container mx-auto px-6">

      {/* IDE Label */}
      <div className="ide-label mb-10">
        <span className="ide-prompt">$</span>
        <span>cat --latest-updates</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <TerminalCard
          filename="call-for-speakers.txt"
          delay={0}
          lines={[
            { prefix: '>>',  text: 'Reading file: call-for-speakers.txt' },
            { type: 'dim',   text: '# CodeSapiens Community Event' },
            { prefix: '[1]', text: 'Event Type   : Open Speaker Call' },
            { prefix: '[2]', text: 'Audience     : Students & Devs' },
            { prefix: '[3]', text: 'Topics       : Tech / Web / AI / Open Source' },
            { type: 'warn',  text: '⚡ Applications closing soon!' },
            { type: 'cmd',   text: '→  Apply now at lu.ma/codesapiens' },
          ]}
          imgSrc="https://res.cloudinary.com/dqudvximt/image/upload/v1767877162/users_cme79i2lk00qls401ar5qxqnc_N0bIjmMP0Ybxoznz-1753684368888_jda3us.jpg"
          imgAlt="Call for Speakers"
        />
        <TerminalCard
          filename="call-for-sponsors.txt"
          delay={0.15}
          lines={[
            { prefix: '>>',  text: 'Reading file: call-for-sponsors.txt' },
            { type: 'dim',   text: '# Sponsorship Opportunities' },
            { prefix: '[1]', text: 'Tier         : Gold / Silver / Bronze' },
            { prefix: '[2]', text: 'Reach        : 2000+ student devs' },
            { prefix: '[3]', text: 'Benefits     : Branding + Talks + Booth' },
            { type: 'warn',  text: '⚡ Limited sponsorship slots left!' },
            { type: 'cmd',   text: '→  Contact: codesapiens.in@gmail.com' },
          ]}
          imgSrc="https://res.cloudinary.com/dqudvximt/image/upload/v1767877178/users_cme79i2lk00qls401ar5qxqnc_KB4hFvAzhyqJF0xf-3a61cb74-01c9-4880-be04-a4036f32c4f9_t64kt9.jpg"
          imgAlt="Call for Sponsors"
        />
      </div>
    </div>
  </section>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CodeSapiensHero = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const [hallOfFame, setHallOfFame]         = useState([]);
  const [communityPhotos, setCommunity]     = useState([]);
  const [communityLoading, setCommunityLoading] = useState(true);
  const wrapRef   = useRef(null);
  const canvasRef = useRef(null);
  const heroRef   = useRef(null);
  const monkeyContainerRef = useRef(null);
  const monkeyColorRef = useRef(null);
  const monkeyTintRef = useRef(null);
  const monkeyRingRef = useRef(null);

  const scrollProgress = useScrollProgress();
  useAurora(canvasRef);
  const { text: typedText } = useTypewriter(
    ['Code. Connect. Conquer.', 'Build. Break. Repeat.', 'Ship Real Projects.', 'Think in Systems.'],
    { typeSpeed: 75, deleteSpeed: 35, pauseAfter: 2200, pauseBefore: 400 }
  );

  const { scrollY } = useScroll();
  const [navScrolled, setNavScrolled] = useState(false);
  useMotionValueEvent(scrollY, 'change', (v) => setNavScrolled(v > 60));
  const canvasY   = useTransform(scrollY, [0,800], [0, 120]);
  const subtextY  = useTransform(scrollY, [0,800], [0, 200]);
  const headlineY = useTransform(scrollY, [0,800], [0,  80]);
  const heroOpacity = useTransform(scrollY, [0,400], [1, 0]);
  const mascotParallaxY = useTransform(scrollY, [0,300], [0, -60]);
  const scaleX = useSpring(scrollProgress, { stiffness: 120, damping: 30 });
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches);
  }, []);

  const MONKEY_SPOTLIGHT_RADIUS = 160;

  const handleMonkeyMove = (e) => {
    const container = monkeyContainerRef.current;
    const colorImg = monkeyColorRef.current;
    const tint = monkeyTintRef.current;
    const ring = monkeyRingRef.current;
    if (!container || !colorImg || !tint || !ring) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const r = MONKEY_SPOTLIGHT_RADIUS;
    const mask = `radial-gradient(circle ${r}px at ${x}px ${y}px, black 0%, black 55%, transparent 100%)`;
    colorImg.style.webkitMaskImage = mask;
    colorImg.style.maskImage = mask;

    tint.style.background = `radial-gradient(circle ${r}px at ${x}px ${y}px,
      #6366f1cc 0%, #a855f7aa 40%, #22d3ee55 75%, transparent 100%)`;
    tint.style.opacity = '1';

    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    ring.style.opacity = '1';
  };

  const handleMonkeyLeave = () => {
    const colorImg = monkeyColorRef.current;
    const tint = monkeyTintRef.current;
    const ring = monkeyRingRef.current;
    if (!colorImg || !tint || !ring) return;

    const hideMask = 'radial-gradient(circle 0px at 50% 50%, black 0%, transparent 0%)';
    colorImg.style.webkitMaskImage = hideMask;
    colorImg.style.maskImage = hideMask;
    tint.style.opacity = '0';
    ring.style.opacity = '0';
  };

  useEffect(() => {
    const load = async () => {
      const { data: hof } = await supabase.from('hall_of_fame').select('*').eq('is_active',true).order('created_at',{ascending:false});
      if (hof) setHallOfFame(hof);
      const { data: ph } = await supabase.from('community_photos').select('*').eq('is_active',true).order('order_number',{ascending:true});
      if (ph && ph.length > 0) {
        setCommunity(ph);
      } else {
        // Fallback with real images from the live site
        setCommunity([
          { id: 1, image_url: 'https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767537704/community-photos/halloffame-1767537703902-874266878.jpg', title: 'CodeSapiens Hall of Fame' },
          { id: 2, image_url: 'https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767537734/community-photos/halloffame-1767537734721-286693940.jpg', title: 'Community Awards 2025' },
          { id: 3, image_url: 'https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767537671/community-photos/halloffame-1767537671015-511535149.jpg', title: 'Core Member Spotlight' },
          { id: 4, image_url: 'https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767537766/community-photos/halloffame-1767537766115-282602891.jpg', title: 'August Tech Meetup' },
          { id: 5, image_url: 'https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767538223/community-photos/halloffame-1767538223035-53933069.jpg', title: 'UI/UX Design Session' },
          { id: 6, image_url: 'https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767538197/community-photos/halloffame-1767538197379-764134620.jpg', title: 'Full Stack Workshop' },
        ]);
      }
      setCommunityLoading(false);
    };
    load().catch(() => setCommunityLoading(false));
  }, []);

  const volunteers = [
    { photo:'https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/2ABMHfqOsrpoL3OV-WhatsApp202025-08-312010.33.52_a8a27bbd_vzcgzq_1_bm8zch.jpg', name:'Keerthana M G', link:'https://in.linkedin.com/in/keerthana-m-g-12ba59256' },
    { photo:'https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/iAckgTxMcALuPbEx-IMG-20250112-WA0012_1_fwyhoa_oxegdx.jpg', name:'Mahaveer A', link:'https://www.linkedin.com/in/mahaveer1013' },
    { photo:'https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/4SrLYdwh0tpuLlkt-team_2.a2a0c6917be79e15dc29_wjosq7_ftgm6j.jpg', name:'Justin Benito', link:'https://www.linkedin.com/in/justinbenito' },
    { photo:'https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/nLDGxnsr6bZkCx0A-team_3.d2fd9099126beb0b86a1_vxhpxo_z3eods.jpg', name:'Koushik ram', link:'https://www.linkedin.com/in/koushik-ram-118495239' },
    { photo:'https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/Tlgueu6loMYMKJMs-team_1.150894ea4376f6423091_vrf0fr_weljyi.jpg', name:'Athiram R S', link:'https://www.linkedin.com/in/athi-ram-rs' },
    { photo:'https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/5NmVUZRZI8sRCrZA-1735300455766_h8dhm2_dnully.jpg', name:'Pranav Vikraman', link:'https://www.linkedin.com/in/pranav-vikraman-322020242' },
    { photo:'https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/JWz1OvtKurqSRsC7-WhatsApp202025-08-312011.22.52_bff7c8bd_mrok7q_b6meyd.jpg', name:'Vignesh R', link:'https://www.linkedin.com/in/vignesh-r-7727582b7' },
    { photo:'https://res.cloudinary.com/druvxcll9/image/upload/v1761122532/3S8YnOu77Rt2wDJD-WhatsApp202025-08-312010.32.42_9b5cee10_puasao_zekkfa.jpg', name:'Anand S', link:'https://codesapiens-management-website.vercel.app' },
    { photo:'https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/q5tsA3KUOwgSOpIa-team_5.efc764325a5ffbaf1b6e_1_sidv9r_fhxmqv.jpg', name:'Subhaharini P', link:'https://www.linkedin.com/in/subhaharini-p-938568254' },
    { photo:'https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/1732031130575_b834gr_1_slc9fw.jpg', name:'Jayasurya R', link:'https://www.linkedin.com/in/jayasurya-r-b37997279/' },
  ];

  return (
    <div ref={wrapRef} className="lp-wrap min-h-screen font-sans overflow-x-hidden"
      style={{ background:'var(--bg-base)', color:'var(--text-primary)', fontFamily:"'Inter',sans-serif" }}>
      <style>{LANDING_STYLES}</style>

      <FluidCursor />
      
      {/* ── Global Aurora & Neon Dot Grid Background ── */}
      <motion.canvas 
        ref={canvasRef} 
        className="fixed inset-0 w-full h-full pointer-events-none" 
        style={{zIndex: 0, opacity: 0.8}} 
      />

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 nav-lp ${navScrolled ? 'scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg"
              alt="CodeSapiens" className="w-8 h-8 rounded-full object-cover" style={{ border:'1px solid #6366f140' }} />
            <span className="font-bold text-sm tracking-tight" style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--text-primary)' }}>
              CodeSapiens
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[['#vision','Vision'],['#events','Events'],['#community','Community'],['/programs','Programs'],['/meetups','Meetups']].map(([h,l]) => (
              <a key={l} href={h} className="nav-link-lp">{l}</a>
            ))}
            <a href="/auth" className="nav-link-lp" style={{ textDecoration:'none' }}>Log in</a>
            <button onClick={()=>navigate('/auth')} className="nav-cta-btn">
              Join Now
            </button>
          </div>
          <button className={`md:hidden p-2 flex flex-col gap-1.5 justify-center hamburger-btn ${isMenuOpen ? 'hamburger-open' : ''}`} onClick={()=>setIsMenuOpen(o=>!o)}
            style={{ color:'var(--text-primary)' }} aria-label="Menu">
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
        <motion.div className="nav-scroll-progress" style={{ scaleX, transformOrigin:'left', width:'100%' }} />
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed top-[4.5rem] left-0 right-0 z-40 mobile-menu-lp overflow-hidden"
        >
          <div className="px-6 py-4 flex flex-col">
            {[['#vision','Vision'],['#events','Events'],['#community','Community'],['/programs','Programs'],['/meetups','Meetups']].map(([h,l], i) => (
              <motion.a
                key={l}
                href={h}
                onClick={()=>setIsMenuOpen(false)}
                className="text-xl font-semibold py-4 border-b border-[#1e293b]/50 last:border-0"
                style={{color:'var(--text-primary)'}}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >{l}</motion.a>
            ))}
            <motion.button
              onClick={()=>{ setIsMenuOpen(false); navigate('/auth'); }}
              className="text-left text-lg font-semibold py-4 mt-2"
              style={{color:'var(--primary)'}}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >Log in</motion.button>
            <motion.button
              onClick={()=>{ setIsMenuOpen(false); navigate('/auth'); }}
              className="nav-cta-btn mt-4 w-fit"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >Join Now</motion.button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden" style={{ zIndex: 1, borderBottom: '1px solid var(--border)' }}>

        <div className="max-w-7xl mx-auto px-6 w-full relative pt-24" style={{zIndex:2}}>
          <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-12 items-center">
            {/* Left */}
            <motion.div style={{y:headlineY, opacity:heroOpacity}}>
              <motion.div className="ide-label mb-6"
                initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{background:'var(--success)'}} />
                <span className="ide-prompt">~/codesapiens</span>
                <span style={{color:'var(--text-muted)'}}>—</span>
                <span style={{color:'var(--text-muted)'}}>Tamil Nadu's largest student dev community</span>
              </motion.div>

              <motion.h1 className="font-extrabold mb-4" style={{fontSize:'clamp(3rem,8vw,7rem)',letterSpacing:'-0.04em',lineHeight:1.05,color:'var(--text-primary)'}}
                initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{delay:0.2,type:'spring',stiffness:80,damping:20}}>
                We are{' '}
                <span className="grad-text">CodeSapiens</span>
                <span style={{color:'var(--primary)',opacity:0.6}}>.</span>
              </motion.h1>

              <motion.div className="flex items-baseline mb-8 h-9" style={{y:subtextY}}
                initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.35}}>
                <span className="font-mono font-medium" style={{fontSize:'clamp(1rem,2.2vw,1.35rem)',color:'var(--text-body)',letterSpacing:'-0.01em'}}>
                  {typedText}
                </span>
              </motion.div>

              <motion.p className="mb-10 max-w-xl" style={{color:'var(--text-body)',fontSize:'1rem',lineHeight:1.7,letterSpacing:'-0.01em'}}
                initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.45}}>
                The only inter-college student community in Tamil Nadu — built by students, for students.
                We help you navigate your tech career when you don't know where to start.
              </motion.p>

              <motion.div className="flex items-center gap-4 flex-wrap"
                initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.55}}>
                <motion.button whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.97}}
                  onClick={()=>navigate('/auth')}
                  className="neon-btn flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm" style={{color:'var(--text-primary)'}}>
                  <span className="font-mono" style={{color:'var(--text-code)'}}>$</span>
                  join_community
                  <ArrowRight size={16}/>
                </motion.button>
                <a href="#vision" className="text-sm font-medium" style={{color:'var(--text-muted)'}}>Learn more ↓</a>
              </motion.div>
            </motion.div>

            {/* Right: Monkey spotlight reveal */}
            <motion.div
              className="flex justify-center items-center py-8 lg:py-0 w-full min-h-[256px] lg:min-h-[420px]"
              style={{ y: mascotParallaxY, position: 'relative' }}
              initial={{opacity:0,x:32}} animate={{opacity:1,x:0}}
              transition={{delay:0.3,type:'spring',stiffness:60,damping:20}}
            >
              <div
                ref={monkeyContainerRef}
                className="monkey-reveal-wrapper shadow-2xl"
                onMouseMove={handleMonkeyMove}
                onMouseLeave={handleMonkeyLeave}
              >
                {/* Layer 1 — always-visible ghost silhouette */}
                <img
                  src={monkeyLogo}
                  alt="CodeSapiens mascot"
                  className="monkey-ghost"
                />
                {/* Layer 2 — colour image revealed under spotlight */}
                <img
                  ref={monkeyColorRef}
                  src={monkeyLogo}
                  alt=""
                  className="monkey-color"
                />
                {/* Gradient tint layer that follows cursor */}
                <div ref={monkeyTintRef} className="monkey-tint" />
                {/* Visible spotlight ring that follows cursor */}
                <div ref={monkeyRingRef} className="monkey-ring" />
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div animate={{y:[0,8,0]}} transition={{repeat:Infinity,duration:2,ease:'easeInOut'}}
          className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{color:'var(--text-muted)',zIndex:2}}>
          <ChevronDown size={24}/>
        </motion.div>
      </section>

      {/* ── Vision ── */}
      <motion.section id="vision" className="py-24 relative"
        style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}
        initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}}
        transition={{type:'spring',stiffness:60,damping:20}} viewport={{once:true,amount:0.2}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="ide-label mb-10"><span className="ide-prompt">$</span><span>cat --vision --about</span></div>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="font-extrabold mb-6" style={{fontSize:'clamp(2rem,4vw,3.5rem)',letterSpacing:'-0.04em',lineHeight:1.1}}>
                <span className="grad-text">Non-profit</span>{' '}
                <span style={{color:'var(--text-primary)'}}>community built by students, for students.</span>
              </h2>
              <p className="mb-8" style={{color:'var(--text-body)',lineHeight:1.7,maxWidth:'42ch'}}>
                Our vision is to bring students together to collaborate, share, and grow.
                A platform managed by students, for students — where you build your career based on your interests.
              </p>
              <div className="flex gap-12 pt-8" style={{borderTop:'1px solid var(--border)'}}>
                {[{val:'2000+',lbl:'Active members'},{val:'15+',lbl:'Events hosted'}].map((s,i)=>(
                  <div key={i}>
                    <p className="font-extrabold mb-0.5 grad-text" style={{fontSize:'2.5rem',letterSpacing:'-0.04em',lineHeight:1}}>{s.val}</p>
                    <p className="text-xs uppercase tracking-widest font-semibold" style={{color:'var(--text-muted)',letterSpacing:'0.08em'}}>{s.lbl}</p>
                  </div>
                ))}
              </div>
            </div>
            <SpotlightCard className="p-0 overflow-hidden" style={{padding:0,aspectRatio:'4/3'}}>
              <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1767535873/1760365837828_vyrmco.jpg"
                className="w-full h-full object-cover" alt="CodeSapiens community"/>
            </SpotlightCard>
          </div>
        </div>
      </motion.section>

      {/* ── Events / Community Moments ── */}
      <motion.section id="events" className="py-24 relative"
        style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}
        initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}}
        transition={{type:'spring',stiffness:60,damping:20}} viewport={{once:true,amount:0.1}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="ide-label mb-10"><span className="ide-prompt">$</span><span>ls --events --community-moments</span></div>

          {communityLoading ? (
            <div className="tilted-grid">
              {Array.from({length: 6}).map((_, i) => (
                <div key={i} className="tilted-card">
                  <div className="tilted-card-inner" style={{
                    background: 'linear-gradient(135deg,#0f1729,#1e293b)',
                    animation: 'pulse 1.8s ease-in-out infinite',
                  }} />
                </div>
              ))}
            </div>
          ) : communityPhotos.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '1rem', padding: '4rem 2rem',
              border: '1px dashed #1e293b', borderRadius: '16px',
              background: '#0f172940',
            }}>
              <p className="font-mono text-sm" style={{color:'var(--text-code)'}}>
                {'// community_moments.length === 0'}
              </p>
              <p className="font-mono text-xs" style={{color:'var(--text-muted)'}}>
                No moments uploaded yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="community-3d-scene">
              <div className="community-3d-carousel">
                {communityPhotos.map((photo, i) => {
                  const angle = (i * 360) / communityPhotos.length;
                  return (
                    <div 
                      key={photo.id} 
                      className="carousel-photo-wrap"
                      style={{ transform: `rotateY(${angle}deg) translateZ(450px)` }}
                    >
                      <img src={photo.image_url} alt={photo.title} />
                      <div className="carousel-photo-label">{photo.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.section>

      <StatsSection/>
      <SponsorSection/>
      <CommunityPartners/>
      <SocialMediaSection/>
      <NoticeSection/>

      {/* ── Hall of Fame ── */}
      <motion.section className="py-24 relative"
        style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}
        initial={{ opacity:0, y:32 }} whileInView={{ opacity:1, y:0 }}
        transition={{ type:'spring', stiffness:60, damping:20 }} viewport={{ once:true, amount:0.1 }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="ide-label mb-10"><span className="ide-prompt">$</span><span>ls --hall-of-fame</span></div>
          <div className="overflow-hidden w-full relative group">
            <motion.div 
              className="flex gap-8 w-max py-4"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
              style={{ paddingLeft: '1rem' }}
            >
              {[...hallOfFame, ...hallOfFame].map((entry, i) => (
                <div key={`${entry.id || 'hof'}-${i}`} className="tilted-card hof shrink-0" style={{ width: '260px' }}>
                  <div className="tilted-card-inner">
                    <img
                      src={entry.image_url}
                      alt={entry.student_name}
                      className={`tilted-card-img ${i % 2 === 0 ? 'img-odd' : 'img-even'}`}
                      style={i % 2 === 0
                        ? { transform: 'translateX(-70%) translateY(-105%) rotateZ(-45deg)' }
                        : { transform: 'translateX(-30%) translateY(5%) rotateZ(135deg)' }
                      }
                    />
                    <h2 className="tilted-card-label whitespace-normal">{entry.student_name}</h2>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>
      {/* ── Team (Founder cards) ── */}
      <FoundersSection founders={[
        { photo:'https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/1679197646322_n1svjq_s5w42a.jpg', name:'Thiyaga B', role:'Founder', linkedin:'https://www.linkedin.com/company/codesapiens-community/', github:'https://github.com/Codesapiens-in', instagram:'https://www.instagram.com/codesapiens/' },
        ...volunteers.map(v => ({ ...v, role:'Volunteer', linkedin:v.link, github:'https://github.com/Codesapiens-in', instagram:'https://www.instagram.com/codesapiens/' })),
      ]} />

      {/* ── Tagline ── */}
      <section className="py-32 relative overflow-hidden" style={{ borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse at center, #6366f108 0%, transparent 70%)'}}/>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.p className="font-mono text-xs uppercase mb-4" style={{color:'var(--text-muted)',letterSpacing:'0.08em'}}
            initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}>// est. 2023</motion.p>
          <motion.h2 className="font-extrabold grad-text" style={{fontSize:'clamp(2.5rem,7vw,6rem)',letterSpacing:'-0.04em',lineHeight:1.05}}
            initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}}
            transition={{type:'spring',stiffness:60,damping:20}} viewport={{once:true}}>
            Building Community.
          </motion.h2>
          <motion.h2 className="font-extrabold" style={{fontSize:'clamp(2.5rem,7vw,6rem)',letterSpacing:'-0.04em',lineHeight:1.05,color:'var(--text-primary)'}}
            initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}}
            transition={{delay:0.1,type:'spring',stiffness:60,damping:20}} viewport={{once:true}}>
            One Developer at a Time.
          </motion.h2>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-16" style={{ borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-[1fr_auto] gap-12 items-start mb-12">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <img src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg"
                  alt="CodeSapiens" className="w-7 h-7 rounded-full object-cover" style={{border:'1px solid #6366f140'}}/>
                <span className="font-bold text-sm" style={{color:'var(--text-primary)'}}>CodeSapiens</span>
              </div>
              <p className="font-mono text-xs mb-6 max-w-sm" style={{color:'var(--text-muted)',lineHeight:1.7}}>
                {'// Empowering students to build, learn, and grow. — Tamil Nadu\'s largest student tech community.'}
              </p>
              <div className="flex gap-5">
                {[
                  {href:'https://github.com/Codesapiens-in',icon:<Github size={16}/>},
                  {href:'https://www.linkedin.com/company/codesapiens-community/posts/',icon:<Linkedin size={16}/>},
                  {href:'https://youtube.com/@codesapiens-in',icon:<Youtube size={16}/>},
                ].map((s,i)=>(
                  <a key={i} href={s.href} target="_blank" rel="noreferrer" style={{color:'var(--text-muted)'}}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--primary)'}
                    onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>{s.icon}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-xs font-semibold mb-4 uppercase tracking-widest" style={{color:'var(--text-muted)',letterSpacing:'0.08em'}}>// Links</p>
              <ul className="space-y-3 text-sm font-mono">
                {[['#vision','About Us'],['#events','Events'],['#community','Team']].map(([h,l])=>(
                  <li key={l}><a href={h} style={{color:'var(--text-body)'}}
                    onMouseEnter={e=>e.target.style.color='var(--text-primary)'}
                    onMouseLeave={e=>e.target.style.color='var(--text-body)'}>{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-8" style={{borderTop:'1px solid var(--border)'}}>
            <p className="font-mono text-xs" style={{color:'var(--text-muted)'}}>© 2025 CodeSapiens Community.</p>
            <p className="font-mono text-xs" style={{color:'var(--text-muted)'}}>
              Built by students.<span className="blink-cur" style={{color:'var(--secondary)'}}>_</span>
            </p>
          </div>
        </div>
      </footer>

      <LandingPopup />
    </div>
  );
};

export default CodeSapiensHero;


