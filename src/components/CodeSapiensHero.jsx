import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X, Github, Linkedin, Youtube, Users, Calendar, Code, Award, Crown, Rocket, Zap, Globe, Cpu, Handshake, Heart, ArrowUpRight, Instagram, Twitter, MessageCircle, Megaphone, Sparkles } from 'lucide-react';
import { BACKEND_URL } from '../config';
import { authFetch } from '../lib/authFetch';
import LandingPopup from './LandingPopup';
import { useCustomCursor } from '../hooks/useCustomCursor';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useAurora } from '../hooks/useAurora';
import { useMagneticHover } from '../hooks/useMagneticHover';
import { use3DTilt } from '../hooks/use3DTilt';
import { useCountUp } from '../hooks/useCountUp';
import { useTypewriter } from '../hooks/useTypewriter';
import { useMouseParallax } from '../hooks/useParallax';
import { useSpotlightCard } from '../hooks/useSpotlightCard';

// ─── Global keyframes injected once ───────────────────────────────────────────
const LANDING_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;700;900&display=swap');

  .landing-wrap { cursor: none; }
  .landing-wrap a, .landing-wrap button, .landing-wrap [role="button"] { cursor: none; }

  @keyframes neon-pulse {
    0%,100% { box-shadow: 0 0 8px #7c3aed, 0 0 20px #7c3aed44; }
    50%      { box-shadow: 0 0 16px #06b6d4, 0 0 40px #06b6d444; }
  }
  @keyframes border-beam {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
  @keyframes glitch-flash {
    0%,100% { opacity:1; transform:translateX(0); }
    20%     { opacity:.7; transform:translateX(-3px) skewX(-2deg); }
    40%     { opacity:1; transform:translateX(3px)  skewX(2deg);  }
    60%     { opacity:.8; transform:translateX(-1px); }
  }
  @keyframes blink-cursor { 0%,100% { opacity:1; } 50% { opacity:0; } }
  @keyframes float-up {
    0%   { transform:translateY(0)   opacity:.3; }
    100% { transform:translateY(-80px); opacity:0; }
  }
  @keyframes token-drift { from { transform:translateY(0); } to { transform:translateY(-100vh); } }
  @keyframes aurora-shift { 0%,100% { filter:hue-rotate(0deg);} 50% { filter:hue-rotate(30deg);} }
  @keyframes ring-pulse { 0%,100%{transform:scale(1);opacity:.7;} 50%{transform:scale(1.15);opacity:1;} }

  .neon-btn {
    animation: neon-pulse 2.5s ease-in-out infinite;
    border: 1.5px solid #7c3aed;
    transition: all .3s ease;
  }
  .neon-btn:hover { animation: neon-pulse .8s ease-in-out infinite; border-color:#06b6d4; }

  .border-beam-card::before {
    content:'';
    position:absolute;
    inset:-2px;
    border-radius:inherit;
    background: linear-gradient(90deg, transparent, #7c3aed, #06b6d4, transparent);
    background-size:200% 100%;
    opacity:0;
    transition:opacity .3s;
    z-index:0;
    animation: border-beam 2s linear infinite;
  }
  .border-beam-card:hover::before { opacity:1; }
  .border-beam-card > * { position:relative; z-index:1; }

  .glitch-enter { animation: glitch-flash .5s ease forwards; }
  .blinking-cursor { animation: blink-cursor 1s step-end infinite; }

  .glass-card {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
  }

  .grad-text {
    background: linear-gradient(90deg, #a78bfa, #06b6d4);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .terminal-label::before {
    content: '$ ';
    color: #22c55e;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
  }

  .cursor-dot  { position:fixed; top:0; left:0; width:6px;  height:6px;  border-radius:50%; pointer-events:none; z-index:99999; transition:background .2s; will-change:transform; }
  .cursor-ring { position:fixed; top:0; left:0; width:36px; height:36px; border-radius:50%; border:2px solid #06b6d4; pointer-events:none; z-index:99998; mix-blend-mode:difference; transition:border-color .2s, width .2s, height .2s; will-change:transform; }
  .cursor-trail { position:fixed; top:0; left:0; border-radius:50%; pointer-events:none; z-index:99997; will-change:transform; }

  .scroll-progress-bar {
    position: fixed;
    top: 0; left: 0;
    height: 2px;
    background: linear-gradient(90deg, #7c3aed, #06b6d4);
    z-index: 100000;
    transform-origin: left;
    box-shadow: 0 0 8px #06b6d4;
  }

  .section-snap { scroll-snap-align: start; }
`;

// ─── StatsSection ─────────────────────────────────────────────────────────────
const StatsSection = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalColleges: 0, topColleges: [] });
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const count1 = useCountUp('2000+', inView);
  const count2 = useCountUp('50+', inView);

  useEffect(() => {
    authFetch(`${BACKEND_URL}/api/public-stats`)
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.stats); })
      .catch(e => console.error('Stats fetch error:', e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-12 relative overflow-hidden section-snap" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0f1a 100%)' }}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #7c3aed 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="container mx-auto px-4 md:px-6 relative z-10" ref={ref}>
        <div className="mb-8 text-center">
          <span className="terminal-label font-mono text-green-400 font-bold tracking-widest uppercase text-sm mb-4 block">Impact</span>
          <h2 className={`font-bold mb-6 grad-text ${inView ? 'glitch-enter' : ''}`}>By The Numbers</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">We are growing fast. Join the movement.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start md:items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
            {[{ val: count1, label: 'Total Members' }, { val: count2, label: 'Colleges Reached' }].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 100, damping: 15 }}
                className="glass-card border-beam-card p-4 md:p-6 rounded-2xl text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <h3 className="text-4xl md:text-5xl font-black grad-text mb-2 drop-shadow-lg">{item.val}</h3>
                <p className="text-slate-400 font-medium uppercase tracking-wider text-sm">{item.label}</p>
              </motion.div>
            ))}
          </div>
          <div className="col-span-1 h-full w-full overflow-hidden">
            <div className="glass-card p-6 rounded-2xl h-full flex flex-col relative overflow-hidden group shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <h4 className="text-lg font-bold mb-4 flex items-center gap-3 grad-text">Top Active Colleges</h4>
              <div className="flex-1 flex flex-col justify-center">
                {loading ? (
                  <div className="text-center text-slate-500 py-10 animate-pulse font-mono">Loading leaderboards...</div>
                ) : stats.topColleges.filter(c => c.name && c.name !== 'Not specified').length > 0 ? (
                  <div className="space-y-8">
                    {stats.topColleges.filter(c => c.name && c.name !== 'Not specified').length >= 3 ? (
                      <div className="flex items-end justify-center gap-2 md:gap-4 mb-4 min-h-[140px]">
                        {/* 2nd Place */}
                        <motion.div initial={{ opacity:0, y:50 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="flex flex-col items-center w-1/3">
                          <div className="text-center mb-2">
                            <span className="text-gray-300 font-bold block text-sm line-clamp-2 min-h-[2.5em] leading-tight">{stats.topColleges.filter(c=>c.name&&c.name!=='Not specified')[1].name}</span>
                            <span className="text-gray-500 text-xs font-mono mt-1 block">{stats.topColleges.filter(c=>c.name&&c.name!=='Not specified')[1].count} Students</span>
                          </div>
                          <div className="w-full bg-gradient-to-t from-gray-800 to-gray-600/50 rounded-t-lg relative border-t border-x border-gray-600 h-24 flex items-end justify-center pb-2">
                            <span className="text-3xl font-black text-gray-400/20 absolute top-2">2</span>
                            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-black font-bold text-sm shadow-[0_0_15px_rgba(156,163,175,0.5)]">2</div>
                          </div>
                        </motion.div>
                        {/* 1st Place */}
                        <motion.div initial={{ opacity:0, y:50 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="flex flex-col items-center w-1/3 -mt-4 z-10">
                          <div className="text-center mb-2">
                            <span className="text-yellow-400 font-bold block text-sm sm:text-lg line-clamp-2 min-h-[2.5em] leading-tight drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">{stats.topColleges.filter(c=>c.name&&c.name!=='Not specified')[0].name}</span>
                            <span className="text-yellow-500/80 text-xs font-mono mt-1 block font-bold">{stats.topColleges.filter(c=>c.name&&c.name!=='Not specified')[0].count} Students</span>
                          </div>
                          <div className="w-full bg-gradient-to-t from-yellow-900/40 to-yellow-600/40 rounded-t-lg relative border-t border-x border-yellow-500 h-32 flex items-end justify-center pb-4 overflow-hidden">
                            <div className="absolute inset-0 bg-yellow-400/10 animate-pulse" />
                            <span className="text-4xl font-black text-yellow-400/20 absolute top-2">1</span>
                            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-lg shadow-[0_0_20px_rgba(250,204,21,0.6)] relative z-10"><Crown size={20} /></div>
                          </div>
                        </motion.div>
                        {/* 3rd Place */}
                        <motion.div initial={{ opacity:0, y:50 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="flex flex-col items-center w-1/3">
                          <div className="text-center mb-2">
                            <span className="text-amber-700 font-bold block text-sm line-clamp-2 min-h-[2.5em] leading-tight">{stats.topColleges.filter(c=>c.name&&c.name!=='Not specified')[2].name}</span>
                            <span className="text-gray-500 text-xs font-mono mt-1 block">{stats.topColleges.filter(c=>c.name&&c.name!=='Not specified')[2].count} Students</span>
                          </div>
                          <div className="w-full bg-gradient-to-t from-amber-900/40 to-amber-700/40 rounded-t-lg relative border-t border-x border-amber-800 h-20 flex items-end justify-center pb-2">
                            <span className="text-3xl font-black text-amber-800/20 absolute top-2">3</span>
                            <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(180,83,9,0.5)]">3</div>
                          </div>
                        </motion.div>
                      </div>
                    ) : null}
                    <div className="space-y-3 mt-4">
                      {stats.topColleges.filter(c=>c.name&&c.name!=='Not specified')
                        .slice(stats.topColleges.filter(c=>c.name&&c.name!=='Not specified').length>=3?3:0,5)
                        .map((college, index) => {
                          const actualIndex = stats.topColleges.filter(c=>c.name&&c.name!=='Not specified').length>=3 ? index+3 : index;
                          return (
                            <motion.div key={index}
                              initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} transition={{ delay:0.4+(index*0.1) }}
                              className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm">{actualIndex+1}</div>
                              <div className="flex-1 min-w-0"><h5 className="font-medium text-slate-200 truncate">{college.name}</h5></div>
                              <div className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold font-mono">{college.count}</div>
                            </motion.div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-10 font-mono"><p>Stats will update soon_</p></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── SponsorSection ───────────────────────────────────────────────────────────
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
    <section className="py-12 relative overflow-hidden section-snap" style={{ background:'#0d0d1a' }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage:'radial-gradient(circle, #06b6d4 1px, transparent 1px)', backgroundSize:'32px 32px' }} />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-left mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none grad-text">OUR</h2>
            <h2 className="text-4xl md:text-6xl font-bold italic leading-none pt-2" style={{ color:'#06b6d4', fontStyle:'italic' }}>sponsors</h2>
            <div className="h-px bg-white/10 flex-1 ml-4 self-center mt-2" />
          </div>
          <div className="flex items-center gap-2 mb-8">
            <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">BACKING THE FUTURE</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full mx-auto">
          {sponsors.map((sponsor, idx) => (
            <motion.a key={idx} href={sponsor.link} target="_blank" rel="noopener noreferrer"
              initial={{ opacity:0, y:-40 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay: idx*0.08, type:'spring', stiffness:100, damping:15 }}
              className="sponsor-card relative group glass-card border-beam-card rounded-3xl p-4 md:p-6 w-full aspect-square flex flex-col justify-between hover:shadow-xl transition-all duration-300">
              <div className="self-end p-2 rounded-full bg-white/5 text-slate-400 group-hover:bg-violet-500/20 group-hover:text-violet-300 transition-colors">
                <ArrowUpRight size={18} />
              </div>
              <div className="flex-1 flex items-center justify-center p-2">
                <img src={sponsor.image} alt={sponsor.name} className="max-w-[85%] max-h-[85%] object-contain drop-shadow-sm transition-all duration-500 group-hover:scale-105" />
              </div>
              <div className="self-start px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                <span className="font-mono text-slate-300 text-xs">{sponsor.name}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CommunityPartners ────────────────────────────────────────────────────────
const CommunityPartners = () => {
  const partners = [
    { image:'https://res.cloudinary.com/dqudvximt/image/upload/v1767817843/users_cme79i2lk00qls401ar5qxqnc_OGGz5HgXCzS9rI8H-users_clylc5w1v070to301jatq0e85_bNj4z9CoW02cMzqm-circle_rs5ttj.png', link:'#' },
    { image:'https://res.cloudinary.com/dqudvximt/image/upload/v1767817844/users_cme79i2lk00qls401ar5qxqnc_EMRqmDnatuO4Rk38-users_cm9cf3ngn02erro015wogiktk_8CHW9Warth4BkBG9-Blue_2520Minimalist_2520Simple_2520Technology_2520Logo_2520_2520_1_mqig9s.png', link:'#' },
    { image:'https://res.cloudinary.com/dqudvximt/image/upload/v1767817846/users_cme79i2lk00qls401ar5qxqnc_1KwVf1Iz3NmGXUQP-176333249_mhbrlj.webp', link:'#' },
  ];
  return (
    <section className="py-12 relative overflow-hidden border-t border-white/5 section-snap" style={{ background:'#111118' }}>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-left mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-3xl md:text-6xl font-black tracking-tight leading-none grad-text">COMMUNITY</h2>
            <h2 className="text-3xl md:text-6xl font-bold italic leading-none pt-2" style={{ color:'#7c3aed' }}>partners</h2>
            <div className="h-px bg-white/10 flex-1 ml-4 self-center mt-2" />
          </div>
          <div className="flex items-center gap-2 mb-8">
            <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">GROWING TOGETHER</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full mx-auto">
          {partners.map((partner, idx) => (
            <motion.div key={idx}
              initial={{ opacity:0, y:-40 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:idx*0.1, type:'spring', stiffness:100, damping:15 }}
              className="community-card relative group glass-card border-beam-card rounded-3xl p-4 md:p-6 w-full aspect-square flex flex-col justify-center items-center hover:shadow-lg transition-all duration-300">
              <div className="flex-1 flex items-center justify-center p-2 w-full">
                <img src={partner.image} alt="Community Partner" className="max-w-[85%] max-h-[85%] object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── SocialMediaSection ───────────────────────────────────────────────────────
const SocialMediaSection = () => {
  const socials = [
    { name:'LinkedIn',  icon:<Linkedin size={40} />,   link:'https://www.linkedin.com/company/codesapiens-community/posts/', color:'bg-[#0077b5]', textColor:'text-white',  span:'col-span-1', badge:'@codesapiens-community', isLarge:true, backgroundImage:"url('https://res.cloudinary.com/dqudvximt/image/upload/v1767874220/users_cme79i2lk00qls401ar5qxqnc_n74cMGsKIBuvEzzj-users_cme5bsukl01binm014j8ioh2j_2SNEHA31eEqsxFRS-original-33f53dcd2f48e068523d32df0e5cc92f_xkirvh.gif') center/cover no-repeat" },
    { name:'Luma',      icon:null,                     link:'https://lu.ma/codesapiens',                                      color:'bg-black',     textColor:'text-white',  span:'col-span-1', badge:null,                 backgroundImage:"url('https://res.cloudinary.com/dqudvximt/image/upload/v1767875075/users_cme79i2lk00qls401ar5qxqnc_WI6Z0HVxNMCrvfgn-ETzJoQJr1aCFL2r7-rrDC9gCyIJ77RqVW-luma_cqxcny.jpg') center/cover no-repeat" },
    { name:'WhatsApp',  icon:null,                     link:'https://chat.whatsapp.com/LLtoddmQx5rIRNb8WE6rqC?mode=ems_copy_t', color:'bg-[#25D366]', textColor:'text-white', span:'col-span-1', badge:null,                customContent:(<div className="relative w-full h-full flex items-center justify-center"><img src="https://res.cloudinary.com/dqudvximt/image/upload/v1767875047/410201-PD391H-802_h7tcfj.jpg" alt="WhatsApp" className="w-24 h-24 object-contain rounded-xl"/></div>) },
    { name:'Instagram', icon:<Instagram size={32} />,  link:'https://www.instagram.com/codesapiens/',                          color:'bg-white',     textColor:'text-black',  span:'col-span-1', badge:null, border:'border-gray-100 border', customContent:(<div className="relative w-full h-full flex items-center justify-center"><div className="absolute inset-0 flex items-center justify-center pb-6"><img src="https://res.cloudinary.com/dqudvximt/image/upload/v1767874489/users_cme79i2lk00qls401ar5qxqnc_3o1XM7ID2mXVDk6e-XeFzd3iFtoytJqTv-1497553304-104_84834_allkph.png" alt="Instagram" className="w-84 h-84 object-contain drop-shadow-xl"/></div><div className="absolute bottom-0 left-0"><span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-800">@Codesapiens.in</span></div></div>) },
    { name:'Twitter',   icon:<Twitter size={32} className="text-[#1DA1F2]" />, link:'https://twitter.com/codesapiens', color:'bg-white', textColor:'text-black', span:'col-span-1', badge:null, border:'border-gray-100 border', customContent:(<div className="relative w-full h-full flex items-center justify-center"><div className="absolute inset-0 flex items-center justify-center pb-6"><img src="https://res.cloudinary.com/dqudvximt/image/upload/v1767874490/users_cme79i2lk00qls401ar5qxqnc_XgLMxxPTSSuuRKu5-users_cme5bsukl01binm014j8ioh2j_XQ7ryCBwyUFzFg6v-CLIPLY_372109260_TWITTER_LOGO_400_ptqbvv.gif" alt="Twitter" className="w-32 h-32 object-contain"/></div><div className="absolute bottom-0 left-0"><span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-800">@codesapiens_in</span></div></div>) },
    { name:'Volunteers Needed', icon:null, link:'https://forms.gle/volunteer', color:'bg-black', textColor:'text-white', span:'col-span-1', badge:null, isLarge:false, backgroundImage:"url('https://res.cloudinary.com/dqudvximt/image/upload/v1767876038/users_cme79i2lk00qls401ar5qxqnc_Hg7Si3j52FVfpQRN-image_x8wghd.png') center/cover no-repeat" },
    { name:'GitHub',    icon:<Github size={40} />,     link:'https://github.com/Codesapiens-in',                              color:'bg-black',     textColor:'text-white',  span:'col-span-1', badge:'@Codesapiens-in',     isLarge:true, backgroundImage:"url('https://res.cloudinary.com/dqudvximt/image/upload/v1767874482/users_cme79i2lk00qls401ar5qxqnc_MOSc1bv3RXu0WL5z-users_cme5bsukl01binm014j8ioh2j_7dOv2cTCX8B86u82-users_clylc5w1v070to301jatq0e85_AdzvY5ioFqaF37x5-github_dsjpx6.gif') center/cover no-repeat" },
    { name:'YouTube',   icon:<Youtube size={40} className="text-red-600" />, link:'https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi', color:'bg-white', textColor:'text-black', span:'col-span-1', badge:'@Codesapiens', border:'border-gray-100 border', isLarge:true, backgroundImage:"url('https://res.cloudinary.com/dqudvximt/image/upload/v1767874488/users_cme79i2lk00qls401ar5qxqnc_Ov9Ygh4NAQfPGktu-users_cme5bsukl01binm014j8ioh2j_5JQAosdeiVappI2y-users_clylc5w1v070to301jatq0e85_CCuEsN5SSMlu4LAN-youtube_aky1f3.gif') center/cover no-repeat" },
  ];
  return (
    <section className="py-20 relative overflow-hidden text-left section-snap" style={{ background:'linear-gradient(180deg,#0a0a0f 0%,#0d0d1a 100%)' }}>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-left mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none grad-text">SOCIAL</h2>
            <h2 className="text-4xl md:text-6xl font-bold italic leading-none pt-2" style={{ color:'#06b6d4' }}>links</h2>
            <div className="h-px bg-white/10 flex-1 ml-4 self-center mt-2" />
          </div>
          <div className="flex items-center gap-2 mb-8">
            <Globe size={16} className="text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">CONNECT WITH US</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4 md:gap-6 w-full mx-auto">
          {socials.map((social, idx) => (
            <motion.a key={idx} href={social.link} target="_blank" rel="noopener noreferrer"
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              whileHover={{ scale:1.03, y:-4 }}
              transition={{ delay:idx*0.05, type:'spring', stiffness:100, damping:15 }}
              className={`social-card ${social.span} ${social.color} ${social.textColor} ${social.border||''} rounded-3xl p-6 relative overflow-hidden group shadow-sm hover:shadow-xl flex flex-col justify-between transition-all border-beam-card`}
              style={social.backgroundImage ? { backgroundImage: social.color.includes('gradient') ? social.color : undefined } : {}}>
              {social.backgroundImage && <div className="absolute inset-0" style={{ background:social.backgroundImage }} />}
              <div className={`absolute top-4 right-4 p-2 rounded-full ${social.textColor==='text-white'?'bg-white/20 text-white':'bg-gray-100 text-gray-500'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                <ArrowUpRight size={16} />
              </div>
              {social.customContent ? social.customContent : (
                <>
                  <div className="mb-auto">{social.icon}</div>
                  <div className="z-10 mt-auto">
                    {social.badge && <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${social.textColor==='text-white'?'bg-white text-black':'bg-gray-100 text-gray-800'}`}>{social.badge}</span>}
                  </div>
                </>
              )}
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── NoticeSection ────────────────────────────────────────────────────────────
const NoticeSection = () => (
  <section className="py-4 relative overflow-hidden text-left section-snap" style={{ background:'linear-gradient(90deg,#0a0a0f,#111118)' }}>
    <div className="container mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-8 items-center max-w-4xl mx-auto">
        <div className="flex items-center gap-2 shrink-0">
          <h2 className="text-xl md:text-2xl font-black tracking-tight leading-none grad-text">LATEST</h2>
          <h2 className="text-xl md:text-2xl font-bold italic leading-none pt-1" style={{ color:'#06b6d4' }}>updates</h2>
          <div className="h-px bg-white/10 w-12 self-center mt-1 md:hidden" />
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          {[
            { src:'https://res.cloudinary.com/dqudvximt/image/upload/v1767877162/users_cme79i2lk00qls401ar5qxqnc_N0bIjmMP0Ybxoznz-1753684368888_jda3us.jpg', alt:'Call for Speakers' },
            { src:'https://res.cloudinary.com/dqudvximt/image/upload/v1767877178/users_cme79i2lk00qls401ar5qxqnc_KB4hFvAzhyqJF0xf-3a61cb74-01c9-4880-be04-a4036f32c4f9_t64kt9.jpg', alt:'Call for Sponsors and Venue' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }}
              transition={{ delay:i*0.1, type:'spring', stiffness:100, damping:15 }}
              className="relative group glass-card rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
              <img src={item.src} alt={item.alt} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);


// ─── Main Component ───────────────────────────────────────────────────────────
const CodeSapiensHero = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hallOfFameEntries, setHallOfFameEntries] = useState([]);
  const [communityPhotos, setCommunityPhotos] = useState([]);
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const heroRef = useRef(null);

  // Hooks
  const { dotRef, ringRef, trailRefs } = useCustomCursor(wrapRef);
  const scrollProgress = useScrollProgress();
  useAurora(canvasRef);

  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0,80], ['rgba(16,16,16,0.7)','rgba(10,10,15,0.97)']);
  const navPy = useTransform(scrollY, [0,80], [24,12]);
  const heroY  = useTransform(scrollY, [0,600], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0,400], [1, 0]);
  const shapeScale = useTransform(scrollY, [0,600], [1, 0.2]);

  // Parallax layers — different scroll speeds
  const canvasParallax = useTransform(scrollY, [0,800], [0, 160]);   // 0.2x
  const tokenParallax  = useTransform(scrollY, [0,800], [0, 400]);   // 0.5x
  const subtextParallax= useTransform(scrollY, [0,800], [0, 560]);   // 0.7x
  const headlineParallax=useTransform(scrollY, [0,800], [0, 680]);   // 0.85x

  // Mouse parallax for hero depth layers
  const auroraMP  = useMouseParallax(20,  false);
  const tokenMP   = useMouseParallax(10,  true);
  const headlineMP= useMouseParallax(4,   false);

  // Typewriter cycling tagline
  const heroTagline = useTypewriter(
    ['Code. Connect. Conquer.', 'Build. Break. Repeat.', 'Think in Code. Speak in Logic.'],
    { typeSpeed: 80, deleteSpeed: 40, pauseTime: 2000 }
  );
  const shapeOpacity = useTransform(scrollY, [0,400], [0.6, 0]);

  // Responsive spring for scroll progress bar
  const scaleX = useSpring(scrollProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  useEffect(() => {
    const fetchData = async () => {
      const { data: hof } = await supabase.from('hall_of_fame').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (hof) setHallOfFameEntries(hof);
      const { data: photos } = await supabase.from('community_photos').select('*').eq('is_active', true).order('order_number', { ascending: true });
      if (photos) setCommunityPhotos(photos);
    };
    fetchData();
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

  // Hero headline words for stagger animation
  const headline = 'CodeSapiens.'.split('');

  return (
    <div ref={wrapRef} className="landing-wrap text-[#f8fafc] min-h-screen font-sans overflow-x-hidden selection:bg-violet-600 selection:text-white" style={{ background:'#0a0a0f' }}>
      {/* ── Inject keyframes ── */}
      <style>{LANDING_STYLES}</style>

      {/* ── Cursor Elements ── */}
      {!isTouchDevice && (
        <>
          <div ref={dotRef} className="cursor-dot" style={{ background:'#06b6d4' }} />
          <div ref={ringRef} className="cursor-ring" />
          {Array.from({length:10}).map((_,i) => (
            <div key={i} ref={el => trailRefs.current[i]=el} className="cursor-trail" style={{ background:'#06b6d4', width:8, height:8 }} />
          ))}
        </>
      )}

      {/* ── Scroll Progress Bar ── */}
      <motion.div className="scroll-progress-bar" style={{ scaleX, width:'100%' }} />

      {/* ── Navbar ── */}
      <motion.nav className="fixed top-0 w-full z-50 border-b border-white/10"
        style={{ backgroundColor: navBg, paddingTop: navPy, paddingBottom: navPy }}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg" alt="CodeSapiens Logo" className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/30" />
            <span className="text-xl font-bold tracking-tight grad-text">CodeSapiens</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-300">
            {['#vision', '/programs', '/meetups', '#events', '#community'].map((href, i) => {
              const labels = ['Vision','Programs','Meetups','Events','Community'];
              return <a key={i} href={href} className="hover:text-cyan-400 transition-colors font-mono">{labels[i]}</a>;
            })}
            <button onClick={() => navigate('/auth')} className="hover:text-violet-400 transition-colors font-mono text-slate-300">Log in</button>
            <motion.button whileHover={{ scale:1.05 }} onClick={() => navigate('/auth')}
              className="neon-btn bg-transparent text-white px-5 py-2 rounded-lg font-bold font-mono text-sm">
              Get Started
            </motion.button>
          </div>
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile Menu ── */}
      {isMenuOpen && (
        <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',stiffness:100,damping:15}}
          className="fixed inset-0 z-40 text-white pt-24 px-6 md:hidden" style={{ background:'rgba(10,10,15,0.97)', backdropFilter:'blur(20px)' }}>
          <div className="flex flex-col gap-6 text-2xl font-bold font-mono">
            {['#vision','#events','#community'].map((h,i)=>{
              const l=['Vision','Events','Community'];
              return <a key={i} href={h} onClick={()=>setIsMenuOpen(false)} className="grad-text">{l[i]}</a>;
            })}
            <a href="/programs" onClick={()=>setIsMenuOpen(false)} className="grad-text">Programs</a>
            <a href="/meetups" onClick={()=>setIsMenuOpen(false)} className="grad-text">Meetups</a>
            <button onClick={()=>navigate('/auth')} className="text-left text-violet-400 font-mono">Log in</button>
          </div>
        </motion.div>
      )}

      {/* ── Hero Section ── */}
      <section ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden section-snap"
        style={{ background:'#0a0a0f' }}
        onMouseMove={(e) => { auroraMP.onMouseMove(e); tokenMP.onMouseMove(e); headlineMP.onMouseMove(e); }}
        onMouseLeave={() => { auroraMP.onMouseLeave(); tokenMP.onMouseLeave(); headlineMP.onMouseLeave(); }}>
        {/* Aurora Canvas */}
        <motion.canvas ref={canvasRef} className="absolute inset-0 w-full h-full"
          style={{ zIndex:0, y:canvasParallax, x:auroraMP.x, translateY:auroraMP.y }} />

        {/* Animated SVG shapes */}
        <motion.div className="absolute inset-0 md:right-0 md:left-auto md:w-1/2 h-full pointer-events-none flex items-center justify-center md:justify-end"
          style={{ scale:shapeScale, opacity:shapeOpacity, zIndex:1, x:tokenMP.x, y:tokenParallax }}>
          <svg viewBox="0 0 800 800" className="w-full h-full opacity-30">
            <motion.path d="M400,200 L600,300 L400,400 L200,300 Z" fill="none" stroke="#7c3aed" strokeWidth="1.5"
              initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}} transition={{duration:2,ease:'easeInOut'}} />
            <motion.path d="M400,400 L600,500 L400,600 L200,500 Z" fill="none" stroke="#06b6d4" strokeWidth="1.5"
              initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}} transition={{duration:2,delay:.5,ease:'easeInOut'}} />
            <motion.path d="M400,600 L600,700 L400,800 L200,700 Z" fill="none" stroke="#f59e0b" strokeWidth="1.5"
              initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}} transition={{duration:2,delay:1,ease:'easeInOut'}} />
            <motion.line x1="200" y1="300" x2="200" y2="700" stroke="#ffffff22" strokeWidth="1" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:1.5,delay:1}} />
            <motion.line x1="600" y1="300" x2="600" y2="700" stroke="#ffffff22" strokeWidth="1" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:1.5,delay:1}} />
          </svg>
        </motion.div>

        <div className="container mx-auto px-6 relative pt-20" style={{ zIndex:2 }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Headline with word stagger */}
            <motion.div style={{ y:heroY, opacity:heroOpacity, x:headlineMP.x }}>
              <motion.div className="flex flex-wrap mb-8" aria-label="CodeSapiens.">
                {headline.map((char, i) => (
                  <motion.span key={i}
                    initial={{ opacity:0, y:60 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ delay: 0.1 + i*0.04, type:'spring', stiffness:100, damping:15 }}
                    className={`text-5xl md:text-7xl font-extrabold leading-[1] tracking-tighter ${char==='.'?'text-violet-400':''}`}
                    style={ char!=='.' ? { background:'linear-gradient(90deg,#f8fafc,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' } : {} }>
                    {char}
                  </motion.span>
                ))}
              </motion.div>
              {/* ── Typewriter tagline ── */}
              <motion.div className="flex items-center gap-2 mb-6 font-mono"
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.65,duration:.6}}
                style={{ y: subtextParallax }}>
                <span className="text-cyan-400 text-lg md:text-xl font-bold tracking-tight" style={{ minHeight:'2rem' }}>
                  {heroTagline}
                </span>
                <span className="blinking-cursor text-cyan-400 text-lg md:text-xl font-bold">|</span>
              </motion.div>
              <motion.p className="text-slate-400 max-w-2xl leading-relaxed mb-10 font-light"
                initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:.7,duration:.8}}>
                The Biggest Student-Run Tech Community in TN.<br />
                <span className="text-slate-200 block mt-2">The only 'Inter-college students community' by the students for the students</span>
                <span className="text-slate-400 block mt-4 italic">
                  We are here to help students build a career in Tech who say,<br />
                  <span className="text-slate-200 not-italic">"Perusa Pannanum, but enna Pannanum Therla"</span><br />
                  ("Want to do something big, but don't know what to do").
                </span>
              </motion.p>
              <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.9}}>
                <motion.button onClick={() => navigate('/auth')}
                  whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.97 }}
                  className="neon-btn text-white px-8 py-4 font-bold rounded-lg flex items-center gap-3 group font-mono">
                  $ join_now <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right: Dashboard preview */}
            <motion.div initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} transition={{duration:1,delay:.4,type:'spring',stiffness:80,damping:15}}
              className="relative mt-12 lg:mt-0">
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-violet-500/20 group transition-transform duration-500 glass-card border-beam-card">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/15 to-cyan-600/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1771005975/Gemini_Generated_Image_il0qzjil0qzjil0q_1_cfh7ix.png"
                  alt="CodeSapiens Dashboard" className="w-full h-auto object-cover" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-600 rounded-full blur-[80px] opacity-25" />
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-600 rounded-full blur-[80px] opacity-20" />
              <p className="text-slate-500 text-sm italic text-right mt-4 font-mono">// designed and built by students, for students.</p>
            </motion.div>
          </div>
        </div>
        <motion.div animate={{y:[0,10,0]}} transition={{repeat:Infinity,duration:2}} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500">
          <ChevronDown size={32} />
        </motion.div>
      </section>

      {/* ── Vision Section ── */}
      <section id="vision" className="py-12 md:py-16 relative section-snap" style={{ background:'linear-gradient(180deg,#0a0a0f 0%,#0d0f1a 100%)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-px bg-gradient-to-b from-violet-500 to-cyan-500" />
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <motion.div className="relative md:sticky md:top-32"
              initial={{opacity:0, rotateY:90}} whileInView={{opacity:1, rotateY:0}}
              transition={{duration:.7, type:'spring', stiffness:100, damping:15}} viewport={{once:true}}>
              <span className="terminal-label font-mono text-green-400 font-bold tracking-widest uppercase text-sm mb-4 block">Our Vision</span>
              <h2 className="font-bold mb-8 leading-tight">
                <span className="text-rose-400">Non-profit</span> community built by{' '}
                <span className="grad-text">students</span>, for{' '}
                <span className="grad-text">students</span>.
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Our vision is to bring students together to collaborate, share, and grow. We envision a platform managed by students, for students, where you can build your career based on your interests.
              </p>
              <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                {[{val:'2000+',label:'Active Members'},{val:'15+',label:'Events Hosted'}].map((s,i)=>(
                  <div key={i}>
                    <h3 className="text-4xl font-bold text-rose-400 mb-2 font-mono">{s.val}</h3>
                    <p className="text-slate-500 uppercase tracking-widest text-xs font-mono">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div className="relative h-72 sm:h-80 md:h-96 w-full rounded-xl overflow-hidden shadow-lg border border-white/10 mt-8 md:mt-0 glass-card border-beam-card"
              initial={{opacity:0, rotateY:-90}} whileInView={{opacity:1, rotateY:0}}
              transition={{duration:.7, delay:.15, type:'spring', stiffness:100, damping:15}} viewport={{once:true}}>
              <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1767535873/1760365837828_vyrmco.jpg" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Events/Community Moments ── */}
      <section id="events" className="py-24 md:py-32 relative section-snap" style={{ background:'#0a0a0f' }}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-2xl font-bold grad-text font-mono">// Community Moments</h3>
            <div className="flex gap-2">
              <button className="p-2 rounded-full border border-white/10 hover:bg-white/10 hover:text-white transition-colors text-slate-400"><ArrowRight className="rotate-180" /></button>
              <button className="p-2 rounded-full border border-white/10 hover:bg-white/10 hover:text-white transition-colors text-slate-400"><ArrowRight /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {communityPhotos.slice(0,6).map((photo, i) => (
              <motion.div key={photo.id}
                initial={{ opacity:0, x: i%2===0 ? -60 : 60 }}
                whileInView={{ opacity:1, x:0 }}
                viewport={{ once:true, margin:'-50px' }}
                transition={{ duration:.6, delay:i*0.08, type:'spring', stiffness:100, damping:15 }}
                whileHover={{ y:-6 }}
                className="glass-card border-beam-card group relative overflow-hidden rounded-xl">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                </div>
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <h4 className="text-white font-bold text-lg mb-1">{photo.title}</h4>
                  <p className="text-slate-300 text-sm font-mono">{photo.description || photo.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <StatsSection />
      {/* ── Sponsors ── */}
      <SponsorSection />
      <CommunityPartners />
      <SocialMediaSection />
      <NoticeSection />

      {/* ── Hall of Fame ── */}
      <section className="py-32 relative overflow-hidden section-snap" style={{ background:'linear-gradient(135deg,#0d0d1a 0%,#150b30 50%,#0a0a0f 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage:'radial-gradient(circle, #7c3aed 1px, transparent 1px)', backgroundSize:'30px 30px' }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="terminal-label font-mono text-green-400 font-bold tracking-widest uppercase text-sm mb-4 block">Recognition</span>
            <h2 className="font-bold mb-6 grad-text">Hall of Fame</h2>
            <p className="text-slate-400 max-w-3xl mx-auto">Celebrating the outstanding achievements of our community members.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-10">
            {hallOfFameEntries.map((entry, i) => (
              <motion.div key={entry.id}
                initial={{ opacity:0, scale:0.85 }} whileInView={{ opacity:1, scale:1 }}
                transition={{ delay:i*0.1, type:'spring', stiffness:100, damping:15 }}
                className="hof-card glass-card border-beam-card p-1 rounded-xl shadow-xl w-full max-w-xs hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
                <div className="h-64 overflow-hidden bg-slate-800/50 mb-4 rounded-lg">
                  <img src={entry.image_url} alt={entry.student_name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="px-6 pb-8 text-center">
                  <h3 className="text-lg font-bold mb-2 grad-text">{entry.student_name}</h3>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm italic leading-relaxed">"{entry.description}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team / Mafia Gang ── */}
      <section id="community" className="py-8 md:py-16 relative section-snap" style={{ background:'#0a0a0f' }}>
        <div className="container mx-auto px-6 text-center">
          <span className="terminal-label font-mono text-green-400 font-bold tracking-widest uppercase text-xs md:text-sm mb-2 block">Community</span>
          <h2 className="text-2xl md:text-4xl font-bold mb-3 grad-text">The Mafia Gang</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto mb-8">Meet the core members who run the community. We are students, just like you.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-2 md:gap-x-4">
            <div className="col-span-2 md:col-span-1 flex flex-col items-center group">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 border-4 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] group-hover:scale-105 transition-transform">
                <img src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/1679197646322_n1svjq_s5w42a.jpg" alt="Thiyaga B" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-sm md:text-base mb-0.5 text-slate-200">Thiyaga B</h3>
              <p className="text-rose-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 font-mono">Founder</p>
              <a href="https://www.linkedin.com/in/thiyagab/" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors"><Linkedin size={14} /></a>
            </div>
            {volunteers.map((vol, i) => (
              <motion.div key={i}
                initial={{ opacity:0, scale:0.8 }} whileInView={{ opacity:1, scale:1 }}
                transition={{ delay:i*0.05, type:'spring', stiffness:100, damping:15 }}
                className="flex flex-col items-center group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-2 grayscale group-hover:grayscale-0 transition-all duration-500 border-2 border-transparent group-hover:border-cyan-400 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.4)] shadow-md">
                  <img src={vol.photo} alt={vol.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-xs md:text-sm mb-0.5 text-slate-300">{vol.name}</h3>
                {vol.link && <a href={vol.link} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors mt-1"><Linkedin size={12} /></a>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tagline ── */}
      <section className="py-20 flex items-center justify-center relative overflow-hidden section-snap" style={{ background:'#050508' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage:'radial-gradient(ellipse at center, #7c3aed 0%, transparent 70%)' }} />
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="font-black tracking-tighter uppercase leading-none">
            {'Building Community'.split(' ').map((word, i) => (
              <motion.span key={i} className="inline-block mr-4 text-slate-100"
                initial={{ opacity:0, y:60 }} whileInView={{ opacity:1, y:0 }}
                transition={{ delay:i*0.15, type:'spring', stiffness:100, damping:15 }} viewport={{ once:true }}>
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span initial={{ opacity:0, y:60 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:0.4, type:'spring', stiffness:100, damping:15 }} viewport={{ once:true }}
              className="grad-text">
              Since 2023
            </motion.span>
          </h2>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-16 relative section-snap" style={{ background:'#0a0a0f' }}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-6">
                <img src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg" alt="CodeSapiens Logo" className="w-8 h-8 rounded-full object-cover ring-1 ring-violet-500/30" />
                <span className="text-2xl font-bold tracking-tight grad-text">CodeSapiens</span>
              </div>
              <p className="text-slate-500 leading-relaxed mb-8 font-mono text-sm">
                {`// Empowering students to build, learn, and grow.`}<br />
                {`// The biggest student tech community in Tamil Nadu.`}
              </p>
              <div className="flex gap-6">
                {[
                  { href:'https://github.com/Codesapiens-in', icon:<Github size={20} /> },
                  { href:'https://www.linkedin.com/company/codesapiens-community/posts/', icon:<Linkedin size={20} /> },
                  { href:'https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi', icon:<Youtube size={20} /> },
                  { href:'https://discord.gg/codesapiens', icon:<Users size={20} /> },
                ].map((s,i)=>(
                  <motion.a key={i} href={s.href} target="_blank" rel="noreferrer"
                    whileHover={{ scale:1.2 }}
                    className="text-slate-500 hover:text-cyan-400 transition-colors"
                    onMouseEnter={e=>e.currentTarget.style.filter='drop-shadow(0 0 6px #06b6d4)'}
                    onMouseLeave={e=>e.currentTarget.style.filter='none'}>
                    {s.icon}
                  </motion.a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-slate-200 font-bold mb-6 font-mono">// Community</h4>
              <ul className="space-y-4 text-sm font-mono">
                {[['#vision','About Us'],['#events','Events'],['#community','Team'],['#','Join Discord']].map(([h,l],i)=>(
                  <li key={i}><a href={h} className="text-slate-500 hover:text-cyan-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 font-mono">
            <p>© 2025 CodeSapiens Community. All rights reserved.</p>
            <p>Designed &amp; Built by Students.<span className="blinking-cursor text-cyan-400 ml-0.5">_</span></p>
          </div>
        </div>
      </footer>

      <LandingPopup />
    </div>
  );
};

export default CodeSapiensHero;

