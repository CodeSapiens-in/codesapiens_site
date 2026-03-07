import React, { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Hero — premium reusable hero section.
 * Brand colours: #0061FE · #00C6F7
 * Stack: React + Tailwind + Framer Motion only.
 */

const Hero = ({
  badge = 'Now Open',
  heading = "We invest in the world's potential",
  subheading = 'Technology, innovation and capital unlocking long-term value and driving economic growth.',
  ctaLabel = 'Get Started',
  ctaHref = '#',
  onCtaClick,
  secondaryLabel = 'Learn More',
  secondaryHref = '#',
  onSecondaryClick,
}) => {
  const sectionRef = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 40, damping: 20 });
  const smy = useSpring(my, { stiffness: 40, damping: 20 });

  const handleMouseMove = useCallback((e) => {
    if (!sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }, [mx, my]);

  const words = heading.split(' ');

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#040410] text-white selection:bg-[#0061FE]/40"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 z-0">
        {/* Dot matrix */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />

        {/* SVG constellation */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
          {['15%,25%,40%,18%', '40%,18%,60%,45%', '60%,45%,82%,30%', '25%,72%,50%,85%', '50%,85%,72%,62%'].map((coords, i) => {
            const [x1, y1, x2, y2] = coords.split(',');
            return <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i % 2 === 0 ? '#0061FE' : '#00C6F7'} strokeWidth="0.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, delay: 0.8 + i * 0.4 }} />;
          })}
          {['15%,25%', '40%,18%', '60%,45%', '82%,30%', '25%,72%', '50%,85%', '72%,62%'].map((pos, i) => {
            const [cx, cy] = pos.split(',');
            return <motion.circle key={i} cx={cx} cy={cy} r="2" fill="#0061FE" opacity="0.4"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.3 }} />;
          })}
        </svg>

        {/* Mouse-tracking aurora */}
        <motion.div className="absolute w-[700px] h-[700px] rounded-full pointer-events-none" style={{
          x: useTransform(smx, [0, 1], ['-15%', '15%']),
          y: useTransform(smy, [0, 1], ['-10%', '10%']),
          left: '25%', top: '-5%',
          background: 'radial-gradient(circle, rgba(0,97,254,0.14) 0%, rgba(0,198,247,0.07) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
        <motion.div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none" style={{
          x: useTransform(smx, [0, 1], ['10%', '-10%']),
          y: useTransform(smy, [0, 1], ['5%', '-5%']),
          right: '0%', bottom: '5%',
          background: 'radial-gradient(circle, rgba(0,198,247,0.1) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }} />
      </div>

      {/* Floating shapes */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[18%] right-[15%] w-14 h-14 border border-[#0061FE]/12 rounded-lg pointer-events-none" />
      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[25%] left-[10%] w-4 h-4 bg-[#00C6F7]/10 rounded-full pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-32 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2.5 mb-10 relative"
        >
          <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-[#0061FE] via-[#00C6F7] to-[#0061FE] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] opacity-50" />
          <div className="relative flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#0a0a1a]/90 backdrop-blur-xl">
            <Sparkles size={14} className="text-[#00C6F7]" />
            <span className="text-sm text-gray-300 font-medium">{badge}</span>
          </div>
        </motion.div>

        {/* Heading — staggered word reveal */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] font-extrabold tracking-[-0.03em] leading-[1.06] mb-7">
          {words.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <motion.span
                initial={{ y: 60, rotateX: -30, opacity: 0 }}
                animate={{ y: 0, rotateX: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`inline-block ${i >= words.length - 2
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#0061FE] via-[#3389FF] to-[#00C6F7]'
                    : ''
                  }`}
              >
                {word}
              </motion.span>
              {i < words.length - 1 && '\u00A0'}
            </span>
          ))}
        </h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed mb-14"
        >
          {subheading}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href={ctaHref}
            onClick={onCtaClick}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-2xl text-base font-bold text-white overflow-hidden"
          >
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0061FE] via-[#00C6F7] to-[#0061FE] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />
            <span className="absolute inset-[2px] rounded-[14px] bg-gradient-to-r from-[#0061FE] to-[#0080FF]" />
            <span className="absolute inset-0 rounded-2xl shadow-[0_0_40px_rgba(0,97,254,0.35)] group-hover:shadow-[0_0_60px_rgba(0,97,254,0.5)] transition-shadow duration-300" />
            <span className="relative z-10">{ctaLabel}</span>
            <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1.5" />
            <span className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-20">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </span>
          </motion.a>

          <motion.a
            href={secondaryHref}
            onClick={onSecondaryClick}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm text-gray-300 hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300"
          >
            {secondaryLabel}
          </motion.a>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-24 flex flex-col items-center gap-5"
        >
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-600">
            Trusted by developers worldwide
          </span>
          <div className="flex items-center gap-8 opacity-30 hover:opacity-50 transition-opacity duration-500">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-6 rounded-md bg-white/10" />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="w-7 h-11 rounded-full border-2 border-white/15 flex justify-center pt-2">
          <motion.div animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-1.5 h-2.5 rounded-full bg-gradient-to-b from-[#0061FE] to-[#00C6F7]" />
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#040410] to-transparent z-10 pointer-events-none" />
    </section>
  );
};

export default Hero;
