import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config';
import { authFetch } from '../lib/authFetch';
import LandingPopup from './LandingPopup';
import {
  ArrowRight, Menu, X, Github, Linkedin, Youtube,
  Users, Calendar, Rocket, Zap, Handshake, Globe,
  ArrowUpRight, Instagram, Twitter, Trophy, Crown,
  MapPin, Code, Award, ChevronDown
} from 'lucide-react';

// ─── Utility: stagger children ──────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Archivo SemiExpanded style helper ──────────────────────────────────────
const wide = {
  fontFamily: "'Archivo', sans-serif",
  fontVariationSettings: "'wdth' 112.5",
  fontWeight: 900,
};

// ─── NAVBAR ─────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Vision', href: '#vision' },
    { label: 'Programs', href: '/programs' },
    { label: 'Meetups', href: '/meetups' },
    { label: 'Events', href: '#events' },
    { label: 'Community', href: '#community' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl
          rounded-2xl px-5 py-3 flex items-center justify-between
          transition-all duration-300 ${scrolled
            ? 'bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)]'
            : 'bg-white/5 backdrop-blur-md border border-white/8'
          }`}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
            <img src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span style={{ ...wide, fontVariationSettings: "'wdth' 112.5", fontWeight: 800, fontSize: '1rem' }}
            className="text-white tracking-tight hidden sm:block">
            CodeSapiens
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <button
              key={link.label}
              onClick={() => {
                if (link.href.startsWith('/')) {
                  navigate(link.href);
                } else {
                  const el = document.querySelector(link.href);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className="px-3 py-1.5 text-sm text-white/60 hover:text-white rounded-lg
                hover:bg-white/8 transition-all duration-200 font-medium tracking-tight"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button onClick={() => navigate('/auth')}
            className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5">
            Log in
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth')}
            className="relative px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold text-white overflow-hidden
              bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            Get Started
          </motion.button>
          <button onClick={() => setMobileOpen(true)} className="md:hidden text-white/70 hover:text-white p-1 ml-1">
            <Menu size={22} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-[100] w-72 bg-[#0a0a0a] border-l border-white/10 p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <span style={wide} className="text-white text-lg">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white">
                <X size={22} />
              </button>
            </div>
            {links.map(link => (
              <button
                key={link.label}
                onClick={() => {
                  setMobileOpen(false);
                  if (link.href.startsWith('/')) {
                    navigate(link.href);
                  } else {
                    const el = document.querySelector(link.href);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="text-left text-white/70 hover:text-white text-xl font-bold transition-colors"
                style={wide}
              >
                {link.label}
              </button>
            ))}
            <button onClick={() => navigate('/auth')}
              className="mt-auto w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold">
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── HERO ────────────────────────────────────────────────────────────────────
const HeroSection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const words = ['STUDENTS.', 'CREATORS.', 'BUILDERS.'];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2200);
    return () => clearInterval(iv);
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen bg-[#030303] flex flex-col justify-center overflow-hidden">

      {/* Orbs */}
      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
        <div className="animate-orb-1 absolute top-[-10%] left-[-5%] w-[600px] h-[600px]
          rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="animate-orb-2 absolute top-[10%] right-[-10%] w-[500px] h-[500px]
          rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="animate-orb-3 absolute bottom-[-15%] left-[30%] w-[400px] h-[400px]
          rounded-full bg-cyan-500/10 blur-[100px]" />
      </motion.div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-28 pb-16">
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-5xl">

          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            border border-blue-500/30 bg-blue-500/8 backdrop-blur-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase">
              Tamil Nadu's #1 Student Community
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.div variants={fadeUp}>
            <h1 className="text-[clamp(2rem,5vw,4.5rem)] leading-[0.95] tracking-tight text-white mb-2"
              style={{ fontFamily: "'Archivo', sans-serif", fontVariationSettings: "'wdth' 112.5", fontWeight: 900 }}>
              BUILT FOR
            </h1>
            <div className="flex items-baseline gap-4 mb-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={wordIdx}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -60, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[clamp(2rem,5vw,4.5rem)] leading-[0.95] tracking-tight"
                  style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontVariationSettings: "'wdth' 112.5",
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 50%, #8B5CF6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                  {words[wordIdx]}
                </motion.h1>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Community description */}
          <motion.div variants={fadeUp} className="max-w-2xl mb-10 space-y-3">
            <p className="text-white text-xl md:text-2xl font-black tracking-tight leading-snug"
              style={{ fontFamily: "'Archivo', sans-serif", fontVariationSettings: "'wdth' 112.5" }}>
              The Biggest Student-Run Tech Community in TN.
            </p>
            <p className="text-white/55 text-sm md:text-base leading-relaxed">
              The only <span className="text-cyan-400 font-semibold">'Inter-college students community'</span> by the students for the students.
            </p>
            <p className="text-white/55 text-sm md:text-base leading-relaxed">
              We are here to help students build a career in Tech who say,
            </p>
            <div className="pl-4 border-l-2 border-blue-500/50 mt-2">
              <p className="text-white/85 text-base md:text-lg font-semibold italic leading-snug">
                "Perusa Pannanum, but enna Pannanum Therla"
              </p>
              <p className="text-white/35 text-xs md:text-sm mt-1">
                ("Want to do something big, but don't know what to do")
              </p>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(37,99,235,0.5)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/auth')}
              className="group flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-bold text-white
                bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_30px_rgba(37,99,235,0.35)]">
              Join Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { const el = document.getElementById('vision'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              className="flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-bold text-white/70
                border border-white/10 hover:border-white/25 hover:text-white hover:bg-white/5 transition-all">
              Explore
              <ChevronDown size={18} />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Floating hero image */}
        <motion.div
          initial={{ opacity: 0, x: 120, y: 30 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-1/2 -translate-y-1/2 right-0 md:right-16 lg:right-32 hidden md:block"
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-blue-500/20 via-cyan-400/10 to-purple-500/20 blur-2xl" />

          {/* Card container */}
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            className="relative"
            style={{ filter: 'drop-shadow(0 40px 80px rgba(37,99,235,0.35)) drop-shadow(0 0 40px rgba(6,182,212,0.15))' }}
          >
            {/* Glossy border frame */}
            <div className="absolute inset-0 rounded-3xl border border-white/15 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />

            <img
              src="https://res.cloudinary.com/dqudvximt/image/upload/v1771005975/Gemini_Generated_Image_il0qzjil0qzjil0q_1_cfh7ix.png"
              alt="CodeSapiens Community"
              className="relative z-0 w-[340px] lg:w-[420px] xl:w-[500px] rounded-3xl object-cover"
              style={{ transform: 'rotate(-2deg)' }}
            />

            {/* Bottom fade mask */}
            <div className="absolute bottom-0 left-0 right-0 h-16 rounded-b-3xl z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(3,3,3,0.5), transparent)' }} />
          </motion.div>
        </motion.div>

      </div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 z-10">
        <ChevronDown size={24} />
      </motion.div>

      {/* Ticker Bar at Hero bottom */}
      <div className="absolute left-0 right-0 bottom-0 z-20">
        <Ticker />
      </div>
    </section>
  );
};

// ─── TICKER ──────────────────────────────────────────────────────────────────
const Ticker = () => {
  const items = [
    '2000+ Members', '·', '50+ Colleges', '·', '15+ Events', '·',
    'Mako IT Lab', '·', 'Notion', '·', 'Contentstack', '·',
    'Build Together', '·', 'Learn Together', '·', 'Grow Together', '·',
    '2000+ Members', '·', '50+ Colleges', '·', '15+ Events', '·',
    'Mako IT Lab', '·', 'Notion', '·', 'Contentstack', '·',
    'Build Together', '·', 'Learn Together', '·', 'Grow Together', '·',
  ];

  return (
    <div className="relative overflow-hidden bg-[#030303] border-y border-white/5 py-4">
      <div className="flex animate-marquee whitespace-nowrap gap-8">
        {items.map((item, i) => (
          <span key={i} className={`text-sm font-bold tracking-wider flex-shrink-0 ${item === '·' ? 'text-blue-500' : 'text-white'}`}
            style={item !== '·' ? { fontFamily: "'Archivo', sans-serif", fontVariationSettings: "'wdth' 112.5" } : {}}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── STATS ───────────────────────────────────────────────────────────────────
const CounterNumber = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target]);

  return <span ref={ref}>{count}{suffix}</span>;
};


// ─── VISION / FEATURES ───────────────────────────────────────────────────────
const OurVisionSection = () => {
  return (
    <section id="vision" className="relative bg-[#030303] py-24 md:py-32 overflow-hidden border-t border-white/5">
      {/* Background Orbs */}
      <div className="absolute top-1/2 right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-orange-600/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Text Content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em]">Our Vision</span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl lg:text-6xl text-white tracking-tight leading-[1.05] mb-8" style={wide}>
              <span className="text-[#FF4D00]">Non-profit</span> community built by <span className="text-[#2563EB]">students</span>, for <span className="text-[#2563EB]">students</span>.
            </motion.h2>

            <motion.p variants={fadeUp} className="text-white/50 text-base md:text-xl leading-relaxed mb-12 max-w-xl font-medium">
              Our vision is to bring students together to collaborate, share, and grow. We envision a platform managed by students, for students, where you can build your career based on your interests.
            </motion.p>

            {/* Stats Row */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:flex md:flex-row gap-10 md:gap-24">
              <div className="relative">
                <div className="absolute -inset-2 bg-red-600/10 blur-xl rounded-full opacity-50" />
                <div className="text-4xl md:text-6xl font-black text-[#E11D48] mb-2 relative z-10" style={wide}>
                  <CounterNumber target={2000} suffix="+" />
                </div>
                <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest relative z-10">
                  Active Members
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-2 bg-red-600/10 blur-xl rounded-full opacity-50" />
                <div className="text-4xl md:text-6xl font-black text-[#E11D48] mb-2 relative z-10" style={wide}>
                  <CounterNumber target={15} suffix="+" />
                </div>
                <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest relative z-10">
                  Events Hosted
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Image with Premium Styling */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative">
              {/* Glow backing */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/30 via-cyan-400/10 to-transparent blur-3xl opacity-40 rounded-[2.5rem]" />

              {/* Main Image Card */}
              <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(37,99,235,0.2)]">
                {/* Glass overlay */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-white/5 pointer-events-none" />

                <img
                  src="https://res.cloudinary.com/dqudvximt/image/upload/v1767535873/1760365837828_vyrmco.jpg"
                  alt="Our Vision Community"
                  className="w-full h-auto aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Inner border */}
                <div className="absolute inset-0 z-20 border border-white/5 rounded-[2.5rem] pointer-events-none" />
              </div>

              {/* Accent decorations */}
              <div className="absolute -top-4 -right-4 w-16 h-16 border-t border-r border-blue-500/40 rounded-tr-2xl pointer-events-none z-30" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 border-b border-l border-orange-500/40 rounded-bl-2xl pointer-events-none z-30" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

// ─── COMMUNITY MOMENTS ───────────────────────────────────────────────────────
const CommunityMomentsSection = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const moments = [
    {
      title: "November 2025 Meetup",
      location: "Chennai, TN",
      image: "https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767537704/community-photos/halloffame-1767537703902-874266878.jpg",
      tag: "Major Event"
    },
    {
      title: "October 2025 Meetup",
      location: "Coimbatore, TN",
      image: "https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767537734/community-photos/halloffame-1767537734721-286693940.jpg",
      tag: "Workshop"
    },
    {
      title: "September 2025 Meetup",
      location: "Madurai, TN",
      image: "https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767537671/community-photos/halloffame-1767537671015-511535149.jpg",
      tag: "Networking"
    },
    {
      title: "August 2025 Meetup",
      location: "Trichy, TN",
      image: "https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767537766/community-photos/halloffame-1767537766115-282602891.jpg",
      tag: "Hackathon"
    },
    {
      title: "May 2025 Meetup",
      location: "Vellore, TN",
      image: "https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767538223/community-photos/halloffame-1767538223035-53933069.jpg",
      tag: "Deep Dive"
    },
    {
      title: "June 2024 Meetup",
      location: "Salem, TN",
      image: "https://res.cloudinary.com/dhtyd2r5f/image/upload/community-photos/halloffame-1767538197379-764134620.jpg",
      tag: "Tech Talk"
    }
  ];

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Map vertical scroll progress (0 to 1) to horizontal translation
  const x = useTransform(scrollYProgress, [0, 1], ["0%", isMobile ? "-85%" : "-65%"]);

  return (
    <section id="events" ref={targetRef} className="relative h-[190vh] bg-[#030303]">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">

        {/* Background radial glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-12 mb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em]">Community Timeline</span>
            </div>
            <h2 className="text-4xl md:text-6xl text-white tracking-tight leading-tight" style={wide}>
              Community Moments
            </h2>
            <p className="text-white/40 mt-4 text-sm font-medium">Scroll down to explore our journey →</p>
          </motion.div>
        </div>

        {/* Horizontal Track */}
        <div className="flex items-center">
          <motion.div
            style={{ x }}
            className="flex gap-8 px-6 lg:px-12"
          >
            {moments.map((moment, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[320px] md:w-[500px] group cursor-default"
              >
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl transition-all duration-500 group-hover:border-blue-500/30">
                  {/* CRT Scanline & Flicker Effect on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_80%)]" />
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.05)_3px,transparent_3px)] bg-[length:100%_4px] animate-scanline pointer-events-none" />
                    <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay animate-pulse-slow" />
                  </div>

                  {/* Image */}
                  <img
                    src={moment.image}
                    alt={moment.title}
                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />

                  {/* Glass Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity z-10" />

                  {/* Card Info */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-between">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                        {moment.tag}
                      </span>
                    </div>

                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-white text-2xl md:text-3xl font-black mb-2" style={wide}>
                        {moment.title}
                      </h3>
                      <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-[0.2em]">
                        <MapPin size={14} className="text-blue-500" />
                        {moment.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* End of Section Marker removed */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── IMPACT / STATS ──────────────────────────────────────────────────────────
// ─── IMPACT / STATS ──────────────────────────────────────────────────────────
const ImpactSection = () => {
  // Use user-provided mock data as fallback if API has no results
  const MOCK_DATA = [
    { name: "Rajalakshmi Engineering College", count: 52 },
    { name: "Sri Sairam Engineering College", count: 49 },
    { name: "Panimalar Engineering College", count: 45 },
    { name: "Mazharul Uloom College,Ambur -635 802", count: 11 }
  ];

  const [stats, setStats] = useState({
    totalUsers: 2000,
    totalColleges: 50,
    topColleges: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const url = `${BACKEND_URL}/api/public-stats`;
        const res = await authFetch(url);
        const data = await res.json();
        if (isMounted && data) {
          const s = data.stats || data.data || data;
          if (data.success || s.topColleges) {
            setStats({
              totalUsers: s.totalUsers || s.totalMembers || s.count || 2000,
              totalColleges: s.totalColleges || s.collegesCount || 50,
              topColleges: s.topColleges || []
            });
          }
        }
      } catch (err) {
        console.error("Impact stats fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  // Filter out any invalid or placeholder names
  const validCollegesFromApi = (stats.topColleges || [])
    .filter(c => c && c.name && !["Not specified", "null", "Analyzing..."].includes(c.name));

  // Decide whether to use API data or our specific Mock data
  const displayColleges = validCollegesFromApi.length > 0 ? validCollegesFromApi : MOCK_DATA;

  const podium = displayColleges.slice(0, 3);
  const runnersUp = displayColleges.slice(3, 10); // Show up to rank 10 in the list

  const statCards = [
    { label: "Total Members", value: stats.totalUsers || 2000, color: "text-blue-500", glow: "bg-blue-500/10" },
    { label: "Colleges Reached", value: stats.totalColleges || 50, color: "text-orange-500", glow: "bg-orange-500/10" }
  ];

  return (
    <section className="relative bg-[#030303] py-28 overflow-hidden border-t border-white/5">
      {/* Background Mesh Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full opacity-50" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full opacity-30" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

          {/* Left Side: Text & Compact Stats */}
          <div className="lg:w-5/12 space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Impact Report</span>
              </div>

              <h2 className="text-[clamp(2.5rem,8vw,5rem)] text-white tracking-tightest leading-[1] mb-8" style={wide}>
                BY THE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">NUMBERS</span>
              </h2>
              <p className="text-white/40 text-base md:text-lg font-medium max-w-sm border-l-2 border-blue-500/30 pl-5 py-1">
                We are growing fast. <br />
                <span className="text-white/60">Join the movement.</span>
              </p>
            </motion.div>

            <div className="flex flex-row gap-4 items-center flex-wrap">
              {statCards.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative p-4 px-6 rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-3xl overflow-hidden group shadow-xl flex-1 min-w-[140px]"
                >
                  {/* Internal Glow */}
                  <div className={`absolute -inset-2 w-12 h-12 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity ${s.glow}`} />

                  <div className="flex flex-col relative z-10">
                    <div className="text-white/30 text-[7px] font-black uppercase tracking-[0.3em] mb-1">{s.label}</div>
                    <div className={`${s.color} text-3xl md:text-4xl font-black tracking-tightest leading-none`} style={wide}>
                      <CounterNumber target={s.value} suffix="+" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side: Perspective Slabs Leaderboard */}
          <div className="lg:w-3/5 w-full perspective-2000">
            <div className="flex items-center justify-between mb-10 px-4">
              <h3 className="text-white text-xl font-black flex items-center gap-3 tracking-[0.1em]" style={wide}>
                Top Active Colleges <Trophy size={20} className="text-yellow-500" />
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              {displayColleges.slice(0, 5).map((college, i) => {
                const colorConfigs = {
                  0: { theme: "yellow", bg: "from-yellow-500/10", border: "border-yellow-500/20", iconBg: "bg-yellow-500/20", iconBorder: "border-yellow-500/30", accent: "bg-yellow-500", text: "text-yellow-500" },
                  1: { theme: "blue", bg: "from-blue-500/10", border: "border-blue-500/20", iconBg: "bg-blue-500/20", iconBorder: "border-blue-500/30", accent: "bg-blue-500", text: "text-blue-500" },
                  2: { theme: "purple", bg: "from-purple-500/10", border: "border-purple-500/20", iconBg: "bg-purple-500/20", iconBorder: "border-purple-500/30", accent: "bg-purple-500", text: "text-purple-500" },
                  3: { theme: "orange", bg: "from-orange-500/10", border: "border-orange-500/20", iconBg: "bg-orange-500/20", iconBorder: "border-orange-500/30", accent: "bg-orange-500", text: "text-orange-500" },
                };
                const config = colorConfigs[i] || { theme: "default", bg: "from-white/0", border: "border-white/10", iconBg: "bg-white/5", iconBorder: "border-white/10", accent: "bg-white/20", text: "text-white/20" };

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 50, rotateY: 15 }}
                    whileInView={{ opacity: 1, x: 0, rotateY: -10 }}
                    whileHover={{ rotateY: 0, x: 12, backgroundColor: 'rgba(255,255,255,0.08)' }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      ease: [0.22, 1, 0.36, 1],
                      // Specific transition for hover to override the slow entry
                      x: { type: "spring", stiffness: 400, damping: 25 },
                      rotateY: { type: "spring", stiffness: 400, damping: 25 }
                    }}
                    className={`
                      relative p-6 rounded-[2.5rem] border ${config.border} backdrop-blur-md
                      flex items-center justify-between overflow-hidden shadow-2xl group
                      bg-gradient-to-r ${config.bg} to-transparent
                    `}
                  >
                    {/* Glass highlight */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />

                    <div className="flex items-center gap-6 relative z-10">
                      <div className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border
                        ${config.iconBg} ${config.iconBorder}
                      `}>
                        <span className={`text-lg font-black ${config.text}`}>
                          {i === 0 ? <Crown size={20} className="fill-current" /> : `0${i + 1}`}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className={`text-sm md:text-base font-black tracking-tight ${i < 4 ? 'text-white' : 'text-white/80'}`}>{college.name}</p>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${config.accent} opacity-50`} />
                          <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{college.count} Members</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side accent */}
                    <div className="relative z-10 flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full ${config.accent}`} />
                      <ArrowRight className="text-white/10 group-hover:text-white/50 group-hover:translate-x-1 transition-all" size={20} />
                    </div>

                    {/* Rank background number */}
                    <span className="absolute -right-4 -bottom-8 text-9xl font-black text-white/[0.03] select-none pointer-events-none">
                      0{i + 1}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Accent */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mt-12"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

// ─── MAFIA GANG (TEAM) ────────────────────────────────────────────────────────
const MafiaGangSection = () => {
  const volunteers = [
    { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/2ABMHfqOsrpoL3OV-WhatsApp202025-08-312010.33.52_a8a27bbd_vzcgzq_1_bm8zch.jpg", name: "Keerthana M G", link: "https://in.linkedin.com/in/keerthana-m-g-12ba59256", role: "Specialist" },
    { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/iAckgTxMcALuPbEx-IMG-20250112-WA0012_1_fwyhoa_oxegdx.jpg", name: "Mahaveer A", link: "https://www.linkedin.com/in/mahaveer1013", role: "Contributor" },
    { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/4SrLYdwh0tpuLlkt-team_2.a2a0c6917be79e15dc29_wjosq7_ftgm6j.jpg", name: "Justin Benito", link: "https://www.linkedin.com/in/justinbenito", role: "Lead" },
    { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/nLDGxnsr6bZkCx0A-team_3.d2fd9099126beb0b86a1_vxhpxo_z3eods.jpg", name: "Koushik ram", link: "https://www.linkedin.com/in/koushik-ram-118495239", role: "Specialist" },
    { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/Tlgueu6loMYMKJMs-team_1.150894ea4376f6423091_vrf0fr_weljyi.jpg", name: "Athiram R S", link: "https://www.linkedin.com/in/athi-ram-rs", role: "Director" },
    { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/5NmVUZRZI8sRCrZA-1735300455766_h8dhm2_dnully.jpg", name: "Pranav Vikraman", link: "https://www.linkedin.com/in/pranav-vikraman-322020242", role: "Specialist" },
    { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/JWz1OvtKurqSRsC7-WhatsApp202025-08-312011.22.52_bff7c8bd_mrok7q_b6meyd.jpg", name: "Vignesh R", link: "https://www.linkedin.com/in/vignesh-r-7727582b7", role: "Contributor" },
    { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122532/3S8YnOu77Rt2wDJD-WhatsApp202025-08-312010.32.42_9b5cee10_puasao_zekkfa.jpg", name: "Anand S", link: "https://codesapiens-management-website.vercel.app", role: "Lead" },
    { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/q5tsA3KUOwgSOpIa-team_5.efc764325a5ffbaf1b6e_1_sidv9r_fhxmqv.jpg", name: "Subhaharini P", link: "https://www.linkedin.com/in/subhaharini-p-938568254", role: "Contributor" },
    { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/1732031130575_b834gr_1_slc9fw.jpg", name: "Jayasurya R", link: "https://www.linkedin.com/in/jayasurya-r-b37997279/", role: "Contributor" }
  ];

  const founder = {
    photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/1679197646322_n1svjq_s5w42a.jpg",
    name: "Thiyaga B",
    link: "https://www.linkedin.com/in/thiyagab/",
    role: "Founder"
  };

  const TeamCard = ({ member, accentColor = "blue", delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateY: 15 }}
      whileInView={{ opacity: 1, y: 0, rotateY: -10 }}
      whileHover={{ y: -12, rotateY: 0, backgroundColor: "rgba(255,255,255,0.06)" }}
      viewport={{ once: true }}
      transition={{
        delay,
        duration: 0.8,
        y: { type: "spring", stiffness: 400, damping: 25 },
        rotateY: { type: "spring", stiffness: 400, damping: 25 }
      }}
      className={`relative aspect-[4/5] rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden group shadow-2xl flex flex-col`}
    >
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-${accentColor}-500`} />

      {/* Member Photo */}
      <div className="relative flex-1 overflow-hidden m-4 rounded-[1.8rem] border border-white/5">
        <img src={member.photo} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      </div>

      {/* Info Block */}
      <div className="px-6 pb-6 pt-2 relative z-10 flex items-end justify-between">
        <div>
          <span className={`text-${accentColor === 'orange' ? 'orange' : 'blue'}-500 text-[8px] font-black uppercase tracking-[0.3em] mb-1 block`}>
            {member.role}
          </span>
          <h3 className="text-white font-bold text-lg tracking-tight">{member.name}</h3>
        </div>
        <a href={member.link} target="_blank" rel="noreferrer"
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:border-white/30 transition-all duration-300">
          <Linkedin size={18} />
        </a>
      </div>

      {/* CRT Scanline effect on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_3px,transparent_3px)] bg-[length:100%_4px]" />
    </motion.div>
  );

  return (
    <section id="community" className="bg-[#030303] py-32 relative overflow-hidden border-t border-white/5">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-orange-600/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-md mb-8">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
              <span className="text-blue-400 text-[11px] font-black uppercase tracking-[0.3em]">Community</span>
            </div>
            <h2 className="text-5xl md:text-8xl text-white tracking-tightest leading-[0.8]" style={wide}>
              THE MAFIA <br />
              <span className="text-blue-500 italic font-medium lowercase"
                style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(59,130,246,0.3)' }}>gang</span>
            </h2>
          </motion.div>
          <motion.p initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="text-white/25 text-base md:text-lg font-medium max-w-sm lg:text-right leading-relaxed">
            Running the community with <span className="text-white/60">passion</span> and a <span className="text-white/60">hacker’s spirit</span>.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 perspective-[2000px]">
          {/* Founder First */}
          <TeamCard member={founder} accentColor="orange" />

          {/* Volunteers */}
          {volunteers.map((vol, i) => (
            <TeamCard key={i} member={vol} accentColor="blue" delay={(i + 1) * 0.05} />
          ))}
        </div>
      </div>
    </section>
  );
};


// ─── SPONSORS ────────────────────────────────────────────────────────────────
const SponsorsSection = () => {
  const sponsors = [
    { name: 'Mako IT Lab', link: 'https://www.makoitlab.com/', image: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767816977/users_cme79i2lk00qls401ar5qxqnc_VGly5cMkz1ZxkXas-1_76R8XDxGiLgjc8BaeXApow_yzzhyw.webp' },
    { name: 'Yuniq', link: 'https://yuniq.co/', image: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767817525/users_cme79i2lk00qls401ar5qxqnc_hBofB72xXBV4C0cL-users_clylc5w1v070to301jatq0e85_FVqmiMesQBlCZ0ZM-yuniq_njsnoy.jpg' },
    { name: 'Contentstack', link: 'https://www.contentstack.com/', image: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767817529/users_cme79i2lk00qls401ar5qxqnc_DaxnHl7f0QdeQwgx-square-image_pvgube.jpg' },
    { name: 'Navan AI', link: 'https://navan.ai/', image: 'https://res.cloudinary.com/dqudvximt/image/upload/v1771507803/WhatsApp_Image_2026-02-19_at_4.28.11_PM_bxnzfc.jpg' },
    { name: 'Notion', link: 'https://www.notion.com/', image: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767817532/users_cme79i2lk00qls401ar5qxqnc_891aQQNEpsjHP7Ef-notion-logo-png_seeklogo-425508_k0njb3.webp' },
    { name: 'Interview Buddy', link: 'https://interviewbuddy.net/', image: 'https://res.cloudinary.com/dqudvximt/image/upload/v1771508422/WhatsApp_Image_2026-02-19_at_4.28.12_PM_xxalgw.jpg' },
  ];

  const partners = [
    { name: 'Chennai React.JS', link: 'https://luma.com/chennai-reactjs', image: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767817843/users_cme79i2lk00qls401ar5qxqnc_OGGz5HgXCzS9rI8H-users_clylc5w1v070to301jatq0e85_bNj4z9CoW02cMzqm-circle_rs5ttj.png' },
    { name: 'D3 Community', link: 'https://www.linkedin.com/company/d3community/', image: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767817844/users_cme79i2lk00qls401ar5qxqnc_EMRqmDnatuO4Rk38-users_cm9cf3ngn02erro015wogiktk_8CHW9Warth4BkBG9-Blue_2520Minimalist_2520Simple_2520Technology_2520Logo_2520_2520_1_mqig9s.png' },
    { name: 'Namma Flutter', link: 'https://luma.com/flutter-chennai', image: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767817846/users_cme79i2lk00qls401ar5qxqnc_1KwVf1Iz3NmGXUQP-176333249_mhbrlj.webp' },
  ];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--x', `${x}%`);
    e.currentTarget.style.setProperty('--y', `${y}%`);
  };

  return (
    <section id="sponsors" className="bg-[#030303] py-32 relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[180px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* SUBSECTION: OFFICIAL SPONSORS */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-md mb-8">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
              <span className="text-blue-400 text-[11px] font-black uppercase tracking-[0.3em]">Backing the future</span>
            </div>
            <h2 className="text-6xl md:text-8xl text-white tracking-tightest leading-[0.8] relative" style={wide}>
              OUR <br />
              <span className="text-blue-500 italic font-medium lowercase"
                style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(59,130,246,0.4)' }}>sponsors</span>
            </h2>
          </motion.div>
          <motion.p initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="text-white/30 text-lg md:text-xl font-medium max-w-sm lg:text-right leading-relaxed">
            Powering the ecosystem with <span className="text-white">global vision</span> and relentless support.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-32 perspective-[2000px]">
          {sponsors.map((s, i) => (
            <motion.a key={i} href={s.link} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30, rotateY: 10 }} whileInView={{ opacity: 1, y: 0, rotateY: -5 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.1,
                duration: 0.8,
                y: { type: "spring", stiffness: 400, damping: 25 },
                rotateY: { type: "spring", stiffness: 400, damping: 25 }
              }}
              onMouseMove={handleMouseMove}
              whileHover={{ y: -12, rotateY: 0, backgroundColor: 'rgba(255,255,255,0.05)' }}
              className="relative aspect-[16/10] rounded-[3rem] border border-white/10 bg-[#0A0A0A] 
                overflow-hidden group transition-all duration-500 shadow-3xl flex items-center justify-center">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(59,130,246,0.15)_0%,transparent_70%)]" />
              </div>
              <div className="relative z-10 w-full h-full flex items-center justify-center p-14 sm:p-10 lg:p-14">
                <img src={s.image} alt={s.name}
                  className="max-w-full max-h-full object-contain filter brightness-110 group-hover:scale-110 transition-all duration-700 ease-[0.22,1,0.36,1] opacity-80 group-hover:opacity-100" />
              </div>
              <div className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                <ArrowUpRight className="text-white/20 group-hover:text-white transition-all overflow-visible" size={20} />
              </div>
              <div className="absolute bottom-8 left-8 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black text-white/20 group-hover:text-white uppercase tracking-[0.3em] transition-colors">{s.name}</span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* SUBSECTION: COMMUNITY PARTNERS */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 pt-20 border-t border-white/5">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-md mb-8">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
              <span className="text-blue-400 text-[11px] font-black uppercase tracking-[0.3em]">Growing Together</span>
            </div>
            <h2 className="text-5xl md:text-7xl text-white tracking-tightest leading-[0.8]" style={wide}>
              COMMUNITY <br />
              <span className="text-blue-500 italic font-medium lowercase"
                style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(59,130,246,0.3)' }}>partners</span>
            </h2>
          </motion.div>
          <motion.p initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="text-white/25 text-base md:text-lg font-medium max-w-sm lg:text-right leading-relaxed">
            Building a stronger tech ecosystem through <span className="text-white/60">collaborative excellence</span>.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 perspective-[2000px]">
          {partners.map((p, i) => (
            <motion.a key={i} href={p.link} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30, rotateY: 10 }} whileInView={{ opacity: 1, y: 0, rotateY: -5 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.1,
                duration: 0.8,
                y: { type: "spring", stiffness: 400, damping: 25 },
                rotateY: { type: "spring", stiffness: 400, damping: 25 }
              }}
              onMouseMove={handleMouseMove}
              whileHover={{ y: -12, rotateY: 0, backgroundColor: 'rgba(255,255,255,0.05)' }}
              className="relative aspect-[16/10] rounded-[3rem] border border-white/10 bg-[#0A0A0A] 
                overflow-hidden group transition-all duration-500 shadow-3xl flex items-center justify-center">
              {/* Spotlight Effect - Now Blue to match sponsors */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(59,130,246,0.15)_0%,transparent_70%)]" />
              </div>
              <div className="relative z-10 w-full h-full flex items-center justify-center p-14 sm:p-10 lg:p-14 transition-all duration-500">
                <img src={p.image} alt={p.name}
                  className="max-w-full max-h-full object-contain filter brightness-110 group-hover:scale-110 transition-all duration-700 ease-[0.22,1,0.36,1] opacity-80 group-hover:opacity-100" />
              </div>
              <div className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                <ArrowUpRight className="text-white/20 group-hover:text-white transition-all overflow-visible" size={20} />
              </div>
              <div className="absolute bottom-8 left-8 flex items-center gap-3">
                {/* Dot - Now Blue to match sponsors */}
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black text-white/20 group-hover:text-white uppercase tracking-[0.3em] transition-colors">{p.name}</span>
              </div>
              <div className="absolute inset-4 border border-white/[0.03] rounded-[2.2rem] pointer-events-none group-hover:border-white/[0.08] transition-colors" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── SOCIAL BENTO GRID ───────────────────────────────────────────────────────
const SocialSection = () => {
  const cells = [
    { name: 'LinkedIn', icon: <Linkedin size={32} />, link: 'https://www.linkedin.com/company/codesapiens-community/posts/', span: 'col-span-2 row-span-2', bg: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767874220/users_cme79i2lk00qls401ar5qxqnc_n74cMGsKIBuvEzzj-users_cme5bsukl01binm014j8ioh2j_2SNEHA31eEqsxFRS-original-33f53dcd2f48e068523d32df0e5cc92f_xkirvh.gif', color: '#0077B5', badge: '@codesapiens-community' },
    { name: 'GitHub', icon: <Github size={28} />, link: 'https://github.com/Codesapiens-in', span: 'col-span-2 row-span-1', bg: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767874482/users_cme79i2lk00qls401ar5qxqnc_MOSc1bv3RXu0WL5z-users_cme5bsukl01binm014j8ioh2j_7dOv2cTCX8B86u82-users_clylc5w1v070to301jatq0e85_AdzvY5ioFqaF37x5-github_dsjpx6.gif', color: '#ffffff', badge: '@Codesapiens-in' },
    { name: 'YouTube', icon: <Youtube size={28} />, link: 'https://youtube.com/@codesapiens-in', span: 'col-span-2 row-span-1', bg: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767874488/users_cme79i2lk00qls401ar5qxqnc_Ov9Ygh4NAQfPGktu-users_cme5bsukl01binm014j8ioh2j_5JQAosdeiVappI2y-users_clylc5w1v070to301jatq0e85_CCuEsN5SSMlu4LAN-youtube_aky1f3.gif', color: '#FF0000', badge: '@Codesapiens' },
    { name: 'Instagram', icon: <Instagram size={24} />, link: 'https://www.instagram.com/codesapiens/', span: 'col-span-1 row-span-1', bg: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767874489/users_cme79i2lk00qls401ar5qxqnc_3o1XM7ID2mXVDk6e-XeFzd3iFtoytJqTv-1497553304-104_84834_allkph.png', color: '#E1306C', badge: '@codesapiens.in' },
    { name: 'Twitter', icon: <Twitter size={24} />, link: 'https://twitter.com/codesapiens', span: 'col-span-1 row-span-1', bg: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767874490/users_cme79i2lk00qls401ar5qxqnc_XgLMxxPTSSuuRKu5-users_cme5bsukl01binm014j8ioh2j_XQ7ryCBwyUFzFg6v-CLIPLY_372109260_TWITTER_LOGO_400_ptqbvv.gif', color: '#1DA1F2', badge: '@codesapiens_in', bgSize: '40%' },
    { name: 'WhatsApp', icon: null, link: 'https://chat.whatsapp.com/LLtoddmQx5rIRNb8WE6rqC?mode=ems_copy_t', span: 'col-span-1 row-span-1', bg: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767875047/410201-PD391H-802_h7tcfj.jpg', color: '#25D366', badge: 'Join Group', bgSize: '50%' },
    { name: 'Luma', icon: null, link: 'https://lu.ma/codesapiens', span: 'col-span-1 row-span-1', bg: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767875075/users_cme79i2lk00qls401ar5qxqnc_WI6Z0HVxNMCrvfgn-ETzJoQJr1aCFL2r7-rrDC9gCyIJ77RqVW-luma_cqxcny.jpg', color: '#ffffff', badge: 'lu.ma' },
  ];

  return (
    <section id="social" className="bg-[#050505] py-28 border-t border-white/5">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10
            bg-white/3 text-white/40 text-xs font-bold uppercase tracking-widest mb-4">
            <Globe size={12} className="text-blue-400" />
            Stay Connected
          </div>
          <h2 className="text-4xl md:text-6xl text-white tracking-tight leading-tight"
            style={{ fontFamily: "'Archivo', sans-serif", fontVariationSettings: "'wdth' 112.5", fontWeight: 900 }}>
            Find us everywhere
          </h2>
        </motion.div>

        <div className="grid grid-cols-4 gap-3 h-auto md:h-[560px]">
          {cells.map((cell, i) => (
            <motion.a key={i} href={cell.link} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02, zIndex: 10 }}
              className={`${cell.span} ${cell.span.includes('col-span-1') ? 'max-md:col-span-2' : ''} ${cell.name === 'LinkedIn' ? 'max-md:row-span-2 max-md:h-[372px]' : 'h-[180px]'} relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/8
                hover:border-white/20 transition-all duration-300 group cursor-pointer md:h-full
                ${cell.customBg || 'bg-white/3'}`}>
              {/* Background image */}
              {cell.bg && (
                <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                  <div className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${cell.bgSize ? 'rounded-[2rem] overflow-hidden' : ''}`}
                    style={{
                      width: cell.bgSize || '100%',
                      height: cell.bgSize ? 'auto' : '100%',
                      aspectRatio: cell.bgSize ? '1/1' : 'auto',
                      backgroundImage: `url(${cell.bg})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 z-[1] transition-colors duration-300" />
                </div>
              )}
              {/* Content */}
              <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div style={{ color: cell.color }}>
                    {cell.icon}
                  </div>
                  <ArrowUpRight size={16} className="text-white/0 group-hover:text-white/60 transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{cell.name}</p>
                  {cell.badge && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm text-white text-[10px] font-bold">
                      {cell.badge}
                    </span>
                  )}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── HALL OF FAME ─────────────────────────────────────────────────────────────
const HallOfFameSection = () => {
  const [members, setMembers] = useState([
    { name: "Keerthana M G", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/2ABMHfqOsrpoL3OV-WhatsApp202025-08-312010.33.52_a8a27bbd_vzcgzq_1_bm8zch.jpg", rank: "Top Contributor" },
    { name: "Justin Benito", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/4SrLYdwh0tpuLlkt-team_2.a2a0c6917be79e15dc29_wjosq7_ftgm6j.jpg", rank: "MVP" },
    { name: "Mahaveer A", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/iAckgTxMcALuPbEx-IMG-20250112-WA0012_1_fwyhoa_oxegdx.jpg", rank: "Rising Star" }
  ]);

  useEffect(() => {
    authFetch(`${BACKEND_URL}/api/hall-of-fame`)
      .then(r => r.json())
      .then(d => { 
        if (d.success && d.members && d.members.length > 0) {
          setMembers(d.members); 
        }
      })
      .catch(() => { });
  }, []);

  return (
    <section className="bg-[#030303] py-28 border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 mb-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-md mb-8">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
              <span className="text-blue-500 text-[11px] font-black uppercase tracking-[0.3em]">Recognition</span>
            </div>

            <h2 className="text-5xl md:text-8xl text-white tracking-tightest leading-[0.8]" style={wide}>
              HALL OF <br />
              <span className="text-blue-500 italic font-medium lowercase" 
                style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(59,130,246,0.3)' }}>fame</span>
            </h2>
          </motion.div>

          <motion.p initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="text-white/25 text-base md:text-lg font-medium max-w-sm lg:text-right leading-relaxed italic">
            Celebrating the <span className="text-white/60">outstanding achievements</span> of our community members.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {members.map((member, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.05)" }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] transition-colors group cursor-default"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <div>
                <h4 className="text-white font-black text-lg tracking-tight leading-none mb-1" style={wide}>
                  {member.name}
                </h4>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">
                  {member.rank || "Hall of Fame"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── NOTICE / UPDATES ────────────────────────────────────────────────────────
const UpdatesSection = () => {
  const cards = [
    {
      label: 'Call for Speakers',
      sub: 'Share your knowledge with 500+ devs',
      image: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767877162/users_cme79i2lk00qls401ar5qxqnc_N0bIjmMP0Ybxoznz-1753684368888_jda3us.jpg',
      color: '#3B82F6', // Blue
      glow: 'rgba(59,130,246,0.3)'
    },
    {
      label: 'Become a Sponsor',
      sub: 'Empower the next gen of developers',
      image: 'https://res.cloudinary.com/dqudvximt/image/upload/v1767877178/users_cme79i2lk00qls401ar5qxqnc_KB4hFvAzhyqJF0xf-3a61cb74-01c9-4880-be04-a4036f32c4f9_t64kt9.jpg',
      color: '#A855F7', // Purple
      glow: 'rgba(168,85,247,0.3)'
    },
  ];

  const springConfig = { type: "spring", stiffness: 400, damping: 25 };

  return (
    <section className="bg-[#030303] py-32 border-t border-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col xl:flex-row gap-20 items-center">

          {/* Left Text Side */}
          <div className="w-full xl:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-md mb-8">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                <span className="text-blue-400 text-[11px] font-black uppercase tracking-[0.3em]">Latest Updates</span>
              </div>

              <h2 className="text-2xl md:text-5xl text-white tracking-tighter leading-[0.85] mb-6"
                style={{ fontFamily: "'Archivo', sans-serif", fontVariationSettings: "'wdth' 112.5", fontWeight: 900 }}>
                ONGOING <br />
                <span className="text-white/10 group-hover:text-white/20 transition-colors">OPPORTUNITIES</span>
              </h2>

              <p className="text-white/30 text-lg md:text-xl font-medium max-w-sm leading-relaxed">
                We're always looking for <span className="text-white/60">bright minds</span> to speak and <span className="text-white/60">visionary brands</span> to partner with us.
              </p>
            </motion.div>
          </div>

          {/* Right Cards Side */}
          <div className="w-full xl:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8 perspective-[2000px]">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9, rotateY: i === 0 ? 15 : -15 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                whileHover={{ y: -16, rotateY: i === 0 ? -5 : 5 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.8,
                  y: springConfig,
                  rotateY: springConfig
                }}
                className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/10 shadow-2xl"
                style={{ isolation: 'isolate' }}
              >
                {/* Image Layer */}
                <div className="absolute inset-0 z-0 overflow-hidden rounded-[2.5rem]">
                  <img src={card.image} alt={card.label}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity group-hover:opacity-60" />
                </div>

                {/* CRT Scanline effect on hover */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_3px,transparent_3px)] bg-[length:100%_4px] z-20" />

                {/* Content Layer */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-10">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest mb-3">
                      Register Now
                    </span>
                    <h3 className="text-white text-xl md:text-3xl font-black mb-2 leading-tight" style={wide}>
                      {card.label}
                    </h3>
                    <p className="text-white/40 text-xs md:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2 md:line-clamp-none">
                      {card.sub}
                    </p>
                  </div>
                </div>

                {/* Accent Glow */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                  style={{ color: card.color }} />
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

// ─── CTA BANNER ─────────────────────────────────────────────────────────────
const CTABanner = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-[#030303] py-32 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px]
          rounded-full bg-blue-600/8 blur-[100px]" />
      </div>
      <div className="container mx-auto px-6 lg:px-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <h2 className="flex flex-col items-center select-none"
            style={{ fontFamily: "'Archivo', sans-serif", fontVariationSettings: "'wdth' 112.5", fontWeight: 900 }}>

            {/* Top Text */}
            <span className="text-[clamp(2rem,7vw,5rem)] text-white leading-[0.8] tracking-tighter mb-4">
              BUILDING <br className="md:hidden" /> COMMUNITY
            </span>

            {/* Bottom Gradient Text */}
            <span className="text-[clamp(2rem,7vw,5rem)] leading-[0.8] tracking-tighter filter drop-shadow-[0_0_30px_rgba(37,99,235,0.4)]"
              style={{
                background: 'linear-gradient(to right, #3B82F6, #06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              SINCE 2023
            </span>
          </h2>

          {/* Decorative lines */}
          <div className="mt-16 flex justify-center items-center gap-12 opacity-20">
            <div className="h-[1px] w-32 bg-gradient-to-r from-transparent to-blue-500" />
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_blue]" />
            <div className="h-[1px] w-32 bg-gradient-to-l from-transparent to-blue-500" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── FOOTER ──────────────────────────────────────────────────────────────────
const Footer = () => {
  const socials = [
    { icon: <Linkedin size={18} />, href: 'https://www.linkedin.com/company/codesapiens-community/posts/' },
    { icon: <Github size={18} />, href: 'https://github.com/Codesapiens-in' },
    { icon: <Youtube size={18} />, href: 'https://youtube.com/@codesapiens-in' },
    { icon: <Instagram size={18} />, href: 'https://www.instagram.com/codesapiens/' },
    { icon: <Twitter size={18} />, href: 'https://twitter.com/codesapiens' },
  ];

  const communityLinks = [
    { label: 'About Us', href: '#vision' },
    { label: 'Events', href: '#moments' },
    { label: 'Team', href: '#community' },
    { label: 'Join Discord', href: '#' },
  ];

  return (
    <footer className="bg-[#030303] pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-blue-600/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shadow-xl">
                <img src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-white text-2xl font-black tracking-tight" style={{ fontFamily: "'Archivo', sans-serif", fontVariationSettings: "'wdth' 112.5" }}>
                CodeSapiens
              </span>
            </div>
            <p className="text-white/40 text-lg font-medium leading-relaxed max-w-md mb-8">
              Empowering students to build, learn, and grow together. Join the biggest student tech community in Tamil Nadu.
            </p>
            <div className="flex items-center gap-4">
              {socials.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center
                    text-white/20 hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Spacer for layout */}
          <div className="hidden lg:block"></div>

          {/* Links Column */}
          <div>
            <h4 className="text-white font-black uppercase tracking-[0.2em] text-sm mb-6" style={{ fontFamily: "'Archivo', sans-serif" }}>
              Community
            </h4>
            <ul className="space-y-4">
              {communityLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-white/30 hover:text-white text-base font-medium transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/20 text-sm font-medium">
            © 2025 CodeSapiens Community. All rights reserved.
          </p>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02]">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Designed & Built by Students</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
const CodeSapiensHero = () => {
  useEffect(() => {
    // Forcefully hide scrollbar on root elements
    const style = document.createElement('style');
    style.id = 'hide-scrollbar-landing';
    style.innerHTML = `
      html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; width: 0 !important; }
      html, body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById('hide-scrollbar-landing');
      if (el) el.remove();
    };
  }, []);

  return (
    <div className="bg-[#030303] selection:bg-blue-500/30">
      <LandingPopup />
      <Navbar />
      <HeroSection />
      <OurVisionSection />
      <CommunityMomentsSection />
      <ImpactSection />
      <SponsorsSection />
      <SocialSection />
      <UpdatesSection />
      <HallOfFameSection />
      <MafiaGangSection />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default CodeSapiensHero;
