import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ChevronDown, Menu, X, Github, Linkedin, Youtube, Users,
  Crown, Globe, ArrowUpRight, Instagram, Twitter,
} from 'lucide-react';
import { BACKEND_URL } from '../config';
import { authFetch } from '../lib/authFetch';
import LandingPopup from './LandingPopup';
import CustomCursor from './CustomCursor';
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

  #cs-cursor-dot {
    position: fixed; top: 0; left: 0;
    width: 5px; height: 5px;
    background: #f1f5f9;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    will-change: transform;
    transition: background 0.2s ease, opacity 0.15s ease;
  }
  #cs-cursor-ring {
    position: fixed; top: 0; left: 0;
    width: 32px; height: 32px;
    border: 1.5px solid #6366f1;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    will-change: transform;
    transition: width 0.2s ease, height 0.2s ease,
                border-color 0.2s ease, background-color 0.2s ease;
  }
  .cs-trail {
    position: fixed; top: 0; left: 0;
    border-radius: 50%;
    background: #6366f1;
    pointer-events: none;
    z-index: 9997;
    will-change: transform;
    transition: opacity 0.12s ease;
  }

  /* ── Scroll progress ── */
  #cs-scroll-bar {
    position: fixed; top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(to right, #6366f1, #22d3ee);
    transform-origin: left;
    z-index: 9999;
  }

  /* ── Typewriter cursor blink ── */
  @keyframes tw-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  .tw-cursor {
    color: #22d3ee;
    animation: tw-blink 500ms step-end infinite;
    font-weight: 400;
    margin-left: 1px;
  }

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

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
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


// ─── StatsSection ─────────────────────────────────────────────────────────────
const StatsSection = () => {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [stats, setStats]   = useState({ topColleges: [], totalUsers: 0, collegesCount: 0 });
  const [loading, setLoading] = useState(true);

  const count1 = useCountUp(stats.totalUsers   || 2000, inView);
  const count2 = useCountUp(stats.collegesCount || 50,  inView);

  useEffect(() => {
    authFetch(`${BACKEND_URL}/api/public-stats`)
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.stats); })
      .catch(e => console.error('Stats fetch error:', e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 relative" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #6366f1 0%, transparent 60%)' }} />
      <div className="container mx-auto px-6 relative z-10" ref={ref}>

        {/* IDE header */}
        <div className="ide-label mb-10">
          <span className="ide-prompt">$</span>
          <span>ls --impact --numbers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">

          {/* Stat counters — IDE variable style */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { varName: 'members',  val: count1, suffix: '+' },
              { varName: 'colleges', val: count2, suffix: '+' },
            ].map((item, i) => (
              <SpotlightCard key={i} index={i} tilt>
                {({ innerParallax }) => (
                  <>
                    <div style={innerParallax(0.3)}>
                      <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: '#a855f7' }}>const</span>{' '}
                        <span style={{ color: '#22d3ee' }}>{item.varName}</span>{' '}
                        <span style={{ color: 'var(--text-muted)' }}>=</span>
                      </p>
                    </div>
                    <div style={innerParallax(0.8)}>
                      <h3 className="text-4xl md:text-5xl font-extrabold mb-1 grad-text"
                        style={{ letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                        {item.val}{item.suffix}
                      </h3>
                    </div>
                    <div style={innerParallax(0.2)}>
                      <p className="text-xs uppercase tracking-widest font-semibold"
                        style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                        {item.varName === 'members' ? 'Active Members' : 'Colleges Reached'}
                      </p>
                    </div>
                  </>
                )}
              </SpotlightCard>
            ))}
          </div>

          {/* Top colleges leaderboard */}
          <SpotlightCard index={2} className="h-full">
            <h4 className="text-base font-bold mb-5 grad-text" style={{ letterSpacing: '-0.02em' }}>Top Active Colleges</h4>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm font-mono animate-pulse" style={{ color: 'var(--text-muted)' }}>// loading leaderboard...</p>
              ) : stats.topColleges.filter(c => c.name && c.name !== 'Not specified').slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 text-right text-xs font-mono shrink-0" style={{ color: i === 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: i === 0 ? 'linear-gradient(90deg,#6366f1,#22d3ee)' : 'var(--border-glow)' }}
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${Math.max(20, (c.count / (stats.topColleges[0]?.count || 1)) * 100)}%` } : { width: 0 }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs font-mono shrink-0 w-16 truncate text-right" style={{ color: 'var(--text-body)' }}>
                    {c.count}
                  </span>
                </div>
              ))}
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
  return (
    <section className="py-20 relative" style={{ background: 'var(--bg-base)' }}>
      <div className="container mx-auto px-6">
        <div className="ide-label mb-10">
          <span className="ide-prompt">$</span>
          <span>ls --sponsors --backing-the-future</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sponsors.map((s, i) => (
            <SpotlightCard key={i} index={i} className="p-4 flex flex-col items-center gap-3 hover:no-underline group">
              <a href={s.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 w-full">
                <div className="w-full aspect-square flex items-center justify-center p-3">
                  <img src={s.image} alt={s.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span className="font-mono text-xs truncate w-full text-center" style={{ color: 'var(--text-muted)' }}>{s.name}</span>
              </a>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CommunityPartners ────────────────────────────────────────────────────────
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partners.map((p, i) => (
            <SpotlightCard key={i} index={i} className="p-6 flex items-center justify-center aspect-video group">
              <img src={p.image} alt="Community Partner" className="max-w-[70%] max-h-[70%] object-contain group-hover:scale-105 transition-transform duration-500" />
            </SpotlightCard>
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

// ─── NoticeSection ────────────────────────────────────────────────────────────
const NoticeSection = () => (
  <section className="py-12 relative" style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
    <div className="container mx-auto px-6">
      <div className="ide-label mb-6">
        <span className="ide-prompt">$</span>
        <span>cat --latest-updates</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {[
          { src:'https://res.cloudinary.com/dqudvximt/image/upload/v1767877162/users_cme79i2lk00qls401ar5qxqnc_N0bIjmMP0Ybxoznz-1753684368888_jda3us.jpg', alt:'Call for Speakers' },
          { src:'https://res.cloudinary.com/dqudvximt/image/upload/v1767877178/users_cme79i2lk00qls401ar5qxqnc_KB4hFvAzhyqJF0xf-3a61cb74-01c9-4880-be04-a4036f32c4f9_t64kt9.jpg', alt:'Call for Sponsors' },
        ].map((item, i) => (
          <SpotlightCard key={i} index={i} style={{ padding: 0 }}>
            <div className="overflow-hidden rounded-xl group">
              <img src={item.src} alt={item.alt} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </SpotlightCard>
        ))}
      </div>
    </div>
  </section>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CodeSapiensHero = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const [hallOfFame, setHallOfFame]     = useState([]);
  const [communityPhotos, setCommunity] = useState([]);
  const wrapRef   = useRef(null);
  const canvasRef = useRef(null);
  const heroRef   = useRef(null);

  const scrollProgress = useScrollProgress();
  useAurora(canvasRef);
  const { text: typedText } = useTypewriter(
    ['Code. Connect. Conquer.', 'Build. Break. Repeat.', 'Ship Real Projects.', 'Think in Systems.'],
    { typeSpeed: 75, deleteSpeed: 35, pauseAfter: 2200, pauseBefore: 400 }
  );

  const { scrollY } = useScroll();
  const navBg  = useTransform(scrollY, [0,80], ['rgba(2,8,23,0)', 'rgba(2,8,23,0.97)']);
  const canvasY   = useTransform(scrollY, [0,800], [0, 120]);
  const subtextY  = useTransform(scrollY, [0,800], [0, 200]);
  const headlineY = useTransform(scrollY, [0,800], [0,  80]);
  const heroOpacity = useTransform(scrollY, [0,400], [1, 0]);
  const borderOpacity = useTransform(scrollY, [0,80], [0, 1]);
  const scaleX = useSpring(scrollProgress, { stiffness: 120, damping: 30 });
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  useEffect(() => {
    const load = async () => {
      const { data: hof } = await supabase.from('hall_of_fame').select('*').eq('is_active',true).order('created_at',{ascending:false});
      if (hof) setHallOfFame(hof);
      const { data: ph } = await supabase.from('community_photos').select('*').eq('is_active',true).order('order_number',{ascending:true});
      if (ph) setCommunity(ph);
    };
    load();
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

      <CustomCursor />

      {/* Scroll progress */}
      <motion.div id="cs-scroll-bar" style={{ scaleX, transformOrigin:'left' }} />

      {/* Navbar */}
      <motion.nav className="fixed top-0 inset-x-0 z-50 px-6 py-5" style={{ backgroundColor: navBg, backdropFilter:'blur(20px)' }}>
        <motion.div className="absolute inset-x-0 bottom-0 h-px" style={{ background:'var(--border)', opacity: borderOpacity }} />
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg"
              alt="CodeSapiens" className="w-8 h-8 rounded-full object-cover" style={{ border:'1px solid #6366f140' }} />
            <span className="font-bold text-sm tracking-tight" style={{ color:'var(--text-primary)' }}>CodeSapiens</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[['#vision','Vision'],['#events','Events'],['#community','Community'],['/programs','Programs'],['/meetups','Meetups']].map(([h,l]) => (
              <a key={l} href={h} className="text-sm font-medium transition-colors" style={{ color:'var(--text-body)' }}
                onMouseEnter={e=>e.target.style.color='var(--text-primary)'}
                onMouseLeave={e=>e.target.style.color='var(--text-body)'}>{l}</a>
            ))}
            <button onClick={()=>navigate('/auth')} className="text-sm font-medium" style={{ color:'var(--text-body)' }}>Log in</button>
            <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.97}} onClick={()=>navigate('/auth')}
              className="neon-btn text-sm font-semibold px-4 py-2 rounded-lg" style={{ color:'var(--text-primary)' }}>
              Get Started →
            </motion.button>
          </div>
          <button className="md:hidden" onClick={()=>setIsMenuOpen(o=>!o)} style={{ color:'var(--text-primary)' }}>
            {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}}
          transition={{type:'spring',stiffness:100,damping:20}}
          className="fixed inset-0 z-40 pt-20 px-6 flex flex-col gap-6"
          style={{background:'rgba(2,8,23,0.98)',backdropFilter:'blur(20px)'}}>
          {[['#vision','Vision'],['#events','Events'],['#community','Community']].map(([h,l]) => (
            <a key={l} href={h} onClick={()=>setIsMenuOpen(false)} className="text-2xl font-bold" style={{color:'var(--text-primary)'}}>{l}</a>
          ))}
          <button onClick={()=>navigate('/auth')} className="text-left text-lg font-medium" style={{color:'var(--primary)'}}>Log in</button>
        </motion.div>
      )}

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden" style={{background:'var(--bg-base)'}}>
        <motion.canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex:0, y:canvasY}} />

        <div className="max-w-7xl mx-auto px-6 w-full relative pt-24" style={{zIndex:2}}>
          <div className="grid lg:grid-cols-[1fr_480px] gap-16 items-center">
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
                <span className="tw-cursor font-mono" style={{fontSize:'clamp(1rem,2.2vw,1.35rem)'}}>|</span>
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

            {/* Right: Dashboard image */}
            <motion.div className="hidden lg:block"
              initial={{opacity:0,x:32}} animate={{opacity:1,x:0}}
              transition={{delay:0.3,type:'spring',stiffness:60,damping:20}}>
              <SpotlightCard tilt className="p-0" style={{padding:0}}>
                <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1771005975/Gemini_Generated_Image_il0qzjil0qzjil0q_1_cfh7ix.png"
                  alt="CodeSapiens platform" className="w-full h-auto object-cover rounded-xl" />
              </SpotlightCard>
              <p className="mt-3 text-right font-mono text-xs" style={{color:'var(--text-muted)'}}>// built by students, for students</p>
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
        style={{background:'var(--bg-base)',borderTop:'1px solid var(--border)'}}
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
                    <p className="font-extrabold mb-0.5" style={{fontSize:'2.5rem',letterSpacing:'-0.04em',lineHeight:1,color:'var(--secondary)'}}>{s.val}</p>
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

      {/* ── Events ── */}
      <motion.section id="events" className="py-24 relative"
        style={{background:'var(--bg-base)',borderTop:'1px solid var(--border)'}}
        initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}}
        transition={{type:'spring',stiffness:60,damping:20}} viewport={{once:true,amount:0.1}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="ide-label mb-10"><span className="ide-prompt">$</span><span>ls --events --community-moments</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {communityPhotos.slice(0,6).map((photo, i) => (
              <SpotlightCard key={photo.id} index={i} className="p-0 overflow-hidden group" style={{padding:0}}>
                <div className="relative overflow-hidden" style={{aspectRatio:'4/3'}}>
                  <img src={photo.image_url} alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                  <div className="absolute inset-0" style={{background:'linear-gradient(to top, #0f1729 0%, transparent 60%)'}}/>
                  <div className="absolute bottom-0 left-0 p-5">
                    <h4 className="font-bold text-base mb-0.5" style={{color:'var(--text-primary)'}}>{photo.title}</h4>
                    <p className="font-mono text-xs" style={{color:'var(--text-muted)'}}>{photo.description||photo.date}</p>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </motion.section>

      <StatsSection/>
      <SponsorSection/>
      <CommunityPartners/>
      <SocialMediaSection/>
      <NoticeSection/>

      {/* ── Hall of Fame ── */}
      <motion.section className="py-24 relative"
        style={{ background:'var(--bg-base)', borderTop:'1px solid var(--border)' }}
        initial={{ opacity:0, y:32 }} whileInView={{ opacity:1, y:0 }}
        transition={{ type:'spring', stiffness:60, damping:20 }} viewport={{ once:true, amount:0.1 }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="ide-label mb-10"><span className="ide-prompt">$</span><span>ls --hall-of-fame</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {hallOfFame.map((entry, i) => (
              <SpotlightCard key={entry.id} index={i} tilt className="p-0 overflow-hidden group" style={{padding:0}}>
                <div className="h-52 overflow-hidden">
                  <img src={entry.image_url} alt={entry.student_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-base mb-2" style={{color:'var(--text-primary)'}}>{entry.student_name}</h3>
                  <div className="h-px mb-3" style={{background:'var(--border)'}}/>
                  <p className="text-xs leading-relaxed" style={{color:'var(--text-body)'}}>"{entry.description}"</p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Team ── */}
      <motion.section id="community" className="py-24 relative"
        style={{ background:'var(--bg-base)', borderTop:'1px solid var(--border)' }}
        initial={{ opacity:0, y:32 }} whileInView={{ opacity:1, y:0 }}
        transition={{ type:'spring', stiffness:60, damping:20 }} viewport={{ once:true, amount:0.1 }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="ide-label mb-10"><span className="ide-prompt">$</span><span>ls --team --mafia-gang</span></div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-8">
            <motion.div initial={{opacity:0,scale:0.85}} whileInView={{opacity:1,scale:1}}
              transition={{type:'spring',stiffness:70,damping:20}} className="flex flex-col items-center gap-2 group">
              <div className="relative">
                <img src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/1679197646322_n1svjq_s5w42a.jpg"
                  alt="Thiyaga B" className="w-14 h-14 rounded-full object-cover"
                  style={{border:'2px solid var(--primary)',boxShadow:'0 0 16px #6366f140'}}/>
              </div>
              <p className="text-xs font-semibold text-center" style={{color:'var(--text-primary)'}}>Thiyaga B</p>
              <p className="text-xs uppercase tracking-widest font-semibold" style={{color:'var(--primary)',fontSize:'0.6rem',letterSpacing:'0.08em'}}>Founder</p>
            </motion.div>
            {volunteers.map((vol, i) => (
              <motion.div key={i} initial={{opacity:0,scale:0.85}} whileInView={{opacity:1,scale:1}}
                transition={{delay:i*0.05,type:'spring',stiffness:70,damping:20}} className="flex flex-col items-center gap-2 group">
                <img src={vol.photo} alt={vol.name}
                  className="w-12 h-12 rounded-full object-cover transition-all duration-500"
                  style={{border:'1px solid var(--border)',filter:'grayscale(80%)'}}
                  onMouseEnter={e=>e.target.style.filter='none'}
                  onMouseLeave={e=>e.target.style.filter='grayscale(80%)'}/>
                <p className="text-xs font-medium text-center leading-tight" style={{color:'var(--text-body)'}}>{vol.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Tagline ── */}
      <section className="py-32 relative overflow-hidden" style={{background:'var(--bg-base)',borderTop:'1px solid var(--border)'}}>
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
      <footer className="py-16" style={{background:'var(--bg-base)',borderTop:'1px solid var(--border)'}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-[1fr_auto] gap-12 items-start mb-12">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <img src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg"
                  alt="CodeSapiens" className="w-7 h-7 rounded-full object-cover" style={{border:'1px solid #6366f140'}}/>
                <span className="font-bold text-sm" style={{color:'var(--text-primary)'}}>CodeSapiens</span>
              </div>
              <p className="font-mono text-xs mb-6 max-w-xs" style={{color:'var(--text-muted)',lineHeight:1.7}}>
                {'// Empowering students to build, learn, and grow.'}<br/>
                {"// Tamil Nadu's largest student tech community."}
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


