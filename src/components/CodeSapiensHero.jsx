import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X, Github, Linkedin, Youtube, Users, Calendar, Code, Award, Crown, Rocket, Zap, Globe, Cpu, Handshake, Heart, ArrowUpRight, Instagram, Twitter, MessageCircle, Megaphone, Sparkles } from 'lucide-react';
import { BACKEND_URL } from '../config';
import { authFetch } from '../lib/authFetch';
import LandingPopup from './LandingPopup';
import GenerativeBackground from './GenerativeBackground';
import CustomCursor from './CustomCursor';
import Marquee from './Marquee';

// --- Stats Section ---
const StatsSection = () => {
    const defaultStats = {
        totalUsers: 2000,
        totalColleges: 50,
        topColleges: [
            { name: "Rajalakshmi Engineering College", count: 52 },
            { name: "Sri Sairam Engineering College", count: 49 },
            { name: "Panimalar Engineering College", count: 45 },
            { name: "Mazharul Uloom College,Ambur -635 802", count: 11 }
        ]
    };

    const [stats, setStats] = useState(defaultStats);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authFetch(`${BACKEND_URL}/api/public-stats`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.stats && data.stats.topColleges && data.stats.topColleges.length > 0) {
                    setStats({
                        totalUsers: data.stats.totalUsers || defaultStats.totalUsers,
                        totalColleges: Math.max(data.stats.totalColleges || 0, defaultStats.totalColleges),
                        topColleges: data.stats.topColleges
                    });
                }
            })
            .catch(err => console.error("Stats fetch error:", err))
            .finally(() => setLoading(false));
    }, []);

    const displayColleges = stats.topColleges.filter(c => c.name && c.name !== "Not specified").length > 0 
        ? stats.topColleges.filter(c => c.name && c.name !== "Not specified") 
        : defaultStats.topColleges;

    return (
        <section id="impact" className="py-24 bg-white text-slate-900 relative overflow-hidden">
            {/* Soft Grid Background */}
            <div className="absolute inset-0 light-grid-bg opacity-40"></div>

            <div className="container mx-auto px-6 relative z-10 w-full max-w-7xl">
                <div className="mb-20 text-center">
                    <span className="text-quantum-blue font-bold tracking-[0.4em] uppercase text-xs mb-6 block">Impact</span>
                    <h2 className="text-5xl md:text-7xl font-display mb-6 tracking-tighter uppercase">By The Numbers</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] max-w-2xl mx-auto">
                        We are growing fast. Join the movement.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start md:items-center">
                    {/* Left: Big Numbers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            viewport={{ once: true }}
                            className="glass-morphism-premium p-6 md:p-8 rounded-3xl text-center soft-elevation-shadow relative overflow-hidden group min-h-[200px] flex flex-col items-center justify-center"
                        >
                            <h3 className="text-golden-3 md:text-golden-4 font-display font-black text-slate-900 mb-2">
                                {stats.totalUsers}+
                            </h3>
                            <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">Total Members</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="glass-morphism-premium p-6 md:p-8 rounded-3xl text-center soft-elevation-shadow relative overflow-hidden group min-h-[200px] flex flex-col items-center justify-center"
                        >
                            <h3 className="text-golden-3 md:text-golden-4 font-display font-black text-slate-900 mb-2">
                                {stats.totalColleges}+
                            </h3>
                            <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">Colleges Reached</p>
                        </motion.div>
                    </div>

                    {/* Right: Top Colleges Chart */}
                    <div className="col-span-1 h-full w-full">
                        <div className="glass-morphism-premium p-8 rounded-3xl soft-elevation-shadow h-full flex flex-col relative overflow-hidden">
                            <h4 className="text-golden-2 font-display font-bold mb-8 flex items-center gap-3 text-slate-800">
                                Top Active Colleges
                            </h4>

                            <div className="flex-1 flex flex-col justify-center">
                                <div className="space-y-10">
                                    {/* Top 3 Podium */}
                                    <div className="flex items-end justify-center gap-4 mb-4 min-h-[160px]">
                                        {/* 2nd Place */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex flex-col items-center w-1/3"
                                        >
                                            <div className="text-center mb-3 px-1">
                                                <span className="text-slate-600 font-bold block text-sm line-clamp-2 min-h-[2.5em] leading-tight">
                                                    {displayColleges[1]?.name || "Second Place"}
                                                </span>
                                                <span className="text-slate-400 text-xs font-bold mt-1 block">{displayColleges[1]?.count || 0} Students</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-t-2xl relative border-t border-x border-slate-200 h-24 flex items-end justify-center pb-3">
                                                <span className="text-4xl font-black text-slate-200/50 absolute top-2">2</span>
                                                <div className="w-9 h-9 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold text-sm shadow-md">2</div>
                                            </div>
                                        </motion.div>

                                        {/* 1st Place */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="flex flex-col items-center w-1/3 -mt-6 z-10"
                                        >
                                            <div className="text-center mb-3 px-1">
                                                <span className="text-slate-900 font-bold block text-sm sm:text-base line-clamp-2 min-h-[2.5em] leading-tight">
                                                    {displayColleges[0]?.name || "First Place"}
                                                </span>
                                                <span className="text-quantum-blue text-xs font-bold mt-1 block">{displayColleges[0]?.count || 0} Students</span>
                                            </div>
                                            <div className="w-full bg-white rounded-t-2xl relative border-t-2 border-x border-slate-200 h-36 flex items-end justify-center pb-5 shadow-[0_-10px_25px_-10px_rgba(0,85,255,0.15)]">
                                                <span className="text-5xl font-black text-slate-100 absolute top-2">1</span>
                                                <div className="w-12 h-12 rounded-full bg-quantum-blue flex items-center justify-center text-white font-bold text-lg shadow-lg relative z-10">
                                                    <Crown size={24} />
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* 3rd Place */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="flex flex-col items-center w-1/3"
                                        >
                                            <div className="text-center mb-3 px-1">
                                                <span className="text-slate-600 font-bold block text-sm line-clamp-2 min-h-[2.5em] leading-tight">
                                                    {displayColleges[2]?.name || "Third Place"}
                                                </span>
                                                <span className="text-slate-400 text-xs font-bold mt-1 block">{displayColleges[2]?.count || 0} Students</span>
                                            </div>
                                            <div className="w-full bg-slate-50 rounded-t-2xl relative border-t border-x border-slate-200 h-20 flex items-end justify-center pb-3">
                                                <span className="text-4xl font-black text-slate-200/40 absolute top-2">3</span>
                                                <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-md">3</div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Remaining List */}
                                    <div className="space-y-3 mt-4">
                                        {displayColleges.slice(3, 5).map((college, index) => {
                                            const actualIndex = index + 3;
                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4 + (index * 0.1) }}
                                                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-100/80 transition-all border border-slate-100"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                                                        {actualIndex + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <h5 className="font-bold text-slate-700 truncate text-sm uppercase tracking-wide">{college.name}</h5>
                                                    </div>
                                                    <div className="px-3 py-1 rounded-full bg-quantum-blue/5 text-quantum-blue text-xs font-black shrink-0">
                                                        {college.count}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Sponsor Section with Spotlight Effect ---
const SponsorSection = () => {
    const sponsors = [

        {
            name: "Mako IT Lab",
            link: "https://www.makoitlab.com/",
            image: "https://res.cloudinary.com/dqudvximt/image/upload/v1767816977/users_cme79i2lk00qls401ar5qxqnc_VGly5cMkz1ZxkXas-1_76R8XDxGiLgjc8BaeXApow_yzzhyw.webp",
        },
        {
            name: "Yuniq",
            link: "https://yuniq.co/",
            image: "https://res.cloudinary.com/dqudvximt/image/upload/v1767817525/users_cme79i2lk00qls401ar5qxqnc_hBofB72xXBV4C0cL-users_clylc5w1v070to301jatq0e85_FVqmiMesQBlCZ0ZM-yuniq_njsnoy.jpg",
        },
        {
            name: "Contentstack",
            link: "https://www.contentstack.com/",
            image: "https://res.cloudinary.com/dqudvximt/image/upload/v1767817529/users_cme79i2lk00qls401ar5qxqnc_DaxnHl7f0QdeQwgx-square-image_pvgube.jpg",
        },
        {
            name: "Navan AI",
            link: "https://navan.ai/",
            image: "https://res.cloudinary.com/dqudvximt/image/upload/v1771507803/WhatsApp_Image_2026-02-19_at_4.28.11_PM_bxnzfc.jpg",
        },
        {
            name: "Notion",
            link: "https://www.notion.com/",
            image: "https://res.cloudinary.com/dqudvximt/image/upload/v1767817532/users_cme79i2lk00qls401ar5qxqnc_891aQQNEpsjHP7Ef-notion-logo-png_seeklogo-425508_k0njb3.webp",
        },
        {
            name: "Interview Buddy",
            link: "https://interviewbuddy.net/",
            image: "https://res.cloudinary.com/dqudvximt/image/upload/v1771508422/WhatsApp_Image_2026-02-19_at_4.28.12_PM_xxalgw.jpg",
        },
        
    ];

    return (
        <section className="py-24 bg-quantum-surface relative overflow-hidden text-slate-900">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-left mb-16">
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-5xl md:text-7xl font-display font-black tracking-widest uppercase">Our</h2>
                        <h2 className="text-5xl md:text-7xl font-display font-black text-quantum-blue italic uppercase tracking-tighter">sponsors</h2>
                        <div className="h-px bg-slate-200 flex-1 ml-4 self-center mt-2"></div>
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                        <span className="w-2 h-2 rounded-full bg-quantum-blue animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Backing The Future Community</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full mx-auto">
                    {sponsors.map((sponsor, idx) => (
                        <motion.a
                            key={idx}
                            href={sponsor.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group bg-white border border-slate-100 rounded-3xl p-8 w-full aspect-square flex flex-col justify-between hover:bg-white transition-all duration-500 sponsor-card-hover soft-elevation-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            {/* Top Right Arrow */}
                            <div className="self-end p-2 bg-slate-50 rounded-full text-slate-300 group-hover:bg-quantum-blue group-hover:text-white transition-colors">
                                <ArrowUpRight size={18} />
                            </div>

                            {/* Centered Image */}
                            <div className="flex-1 flex items-center justify-center p-4">
                                <img
                                    src={sponsor.image}
                                    alt={sponsor.name}
                                    className="max-w-[75%] max-h-[75%] object-contain transition-all duration-700"
                                />
                            </div>

                            {/* Name Badge */}
                            <div className="self-start px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                                <span className="font-bold text-slate-500 text-xs lowercase tracking-tight">{sponsor.name}</span>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
};





// --- Community Partners Section ---
const CommunityPartners = () => {
    const partners = [
        {
            image: "https://res.cloudinary.com/dqudvximt/image/upload/v1767817843/users_cme79i2lk00qls401ar5qxqnc_OGGz5HgXCzS9rI8H-users_clylc5w1v070to301jatq0e85_bNj4z9CoW02cMzqm-circle_rs5ttj.png",
            link: "#"
        },
        {
            image: "https://res.cloudinary.com/dqudvximt/image/upload/v1767817844/users_cme79i2lk00qls401ar5qxqnc_EMRqmDnatuO4Rk38-users_cm9cf3ngn02erro015wogiktk_8CHW9Warth4BkBG9-Blue_2520Minimalist_2520Simple_2520Technology_2520Logo_2520_2520_1_mqig9s.png",
            link: "#"
        },
        {
            image: "https://res.cloudinary.com/dqudvximt/image/upload/v1767817846/users_cme79i2lk00qls401ar5qxqnc_1KwVf1Iz3NmGXUQP-176333249_mhbrlj.webp",
            link: "#"
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden text-slate-900">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-left mb-16">
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-4xl md:text-6xl font-display font-black tracking-widest uppercase">Community</h2>
                        <h2 className="text-4xl md:text-6xl font-display font-black text-quantum-blue italic uppercase tracking-tighter">partners</h2>
                        <div className="h-px bg-slate-100 flex-1 ml-4 self-center mt-2"></div>
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                        <span className="w-2 h-2 rounded-full bg-quantum-blue animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Growing Together</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mx-auto">
                    {partners.map((partner, idx) => (
                        <div
                            key={idx}
                            className="relative group bg-slate-50/50 border border-slate-100 rounded-3xl p-8 w-full aspect-square flex flex-col justify-center items-center hover:bg-white transition-all duration-500 soft-elevation-shadow"
                        >
                            {/* Centered Image */}
                            <div className="flex-1 flex items-center justify-center p-2 w-full">
                                <img
                                    src={partner.image}
                                    alt="Community Partner"
                                    className="max-w-[75%] max-h-[75%] object-contain transition-all duration-700 hover:scale-105"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Programs Section ---
const ProgramsSection = () => {
    const programs = [
        { title: "Mentorship", desc: "One-on-one guidance from industry veterans to accelerate your career.", icon: <Users size={32} /> },
        { title: "Open Source", desc: "Contribute to real-world projects and build a portfolio that matters.", icon: <Github size={32} /> },
        { title: "Hackathons", desc: "Intense building sessions to turn your wildest ideas into reality.", icon: <Rocket size={32} /> }
    ];

    return (
        <section id="programs" className="py-32 bg-slate-50 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <span className="text-quantum-blue font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Our Programs</span>
                    <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase">CodeSapiens<br /><span className="text-quantum-blue italic">Initiatives</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {programs.map((prog, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ y: -8 }}
                            className="p-10 rounded-3xl bg-white border border-slate-100 shadow-sm group transition-all duration-500"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-8 group-hover:bg-quantum-blue group-hover:text-white transition-all shadow-inner">
                                {prog.icon}
                            </div>
                            <h3 className="text-2xl font-display font-bold mb-4 uppercase text-slate-800">{prog.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">{prog.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Social Media Bento Grid ---
const SocialMediaSection = () => {
    const socials = [
        {
            name: "LinkedIn",
            icon: <Linkedin size={40} />,
            link: "https://www.linkedin.com/company/codesapiens-community/posts/",
            color: "bg-[#0077b5]",
            textColor: "text-white",
            span: "col-span-1",
            badge: "@codesapiens-community",
            isLarge: true,
            backgroundImage: "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767874220/users_cme79i2lk00qls401ar5qxqnc_n74cMGsKIBuvEzzj-users_cme5bsukl01binm014j8ioh2j_2SNEHA31eEqsxFRS-original-33f53dcd2f48e068523d32df0e5cc92f_xkirvh.gif') center/cover no-repeat"
        },
        {
            name: "Luma",
            icon: null,
            link: "https://lu.ma/codesapiens",
            color: "bg-black",
            textColor: "text-white",
            span: "col-span-1",
            badge: null,
            backgroundImage: "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767875075/users_cme79i2lk00qls401ar5qxqnc_WI6Z0HVxNMCrvfgn-ETzJoQJr1aCFL2r7-rrDC9gCyIJ77RqVW-luma_cqxcny.jpg') center/cover no-repeat"
        },
        {
            name: "WhatsApp",
            icon: null,
            link: "https://chat.whatsapp.com/LLtoddmQx5rIRNb8WE6rqC?mode=ems_copy_t",
            color: "bg-[#25D366]",
            textColor: "text-white",
            span: "col-span-1",
            badge: null,
            customContent: (
                <div className="relative w-full h-full flex items-center justify-center">
                    <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1767875047/410201-PD391H-802_h7tcfj.jpg" alt="WhatsApp" className="w-24 h-24 object-contain rounded-xl" />
                </div>
            )
        },
        {
            name: "Instagram",
            icon: <Instagram size={32} />,
            link: "https://www.instagram.com/codesapiens/",
            color: "bg-white",
            textColor: "text-black",
            span: "col-span-1",
            badge: null,
            border: "border-gray-100 border",
            customContent: (
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center pb-6">
                        <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1767874489/users_cme79i2lk00qls401ar5qxqnc_3o1XM7ID2mXVDk6e-XeFzd3iFtoytJqTv-1497553304-104_84834_allkph.png" alt="Instagram" className="w-84 h-84 object-contain drop-shadow-xl" />
                    </div>
                    <div className="absolute bottom-0 left-0">
                        <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-800">
                            @Codesapiens.in
                        </span>
                    </div>
                </div>
            )
        },
        {
            name: "Twitter",
            icon: <Twitter size={32} className="text-[#1DA1F2]" />,
            link: "https://twitter.com/codesapiens",
            color: "bg-white",
            textColor: "text-black",
            span: "col-span-1",
            badge: null,
            border: "border-gray-100 border",
            customContent: (
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center pb-6">
                        <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1767874490/users_cme79i2lk00qls401ar5qxqnc_XgLMxxPTSSuuRKu5-users_cme5bsukl01binm014j8ioh2j_XQ7ryCBwyUFzFg6v-CLIPLY_372109260_TWITTER_LOGO_400_ptqbvv.gif" alt="Twitter" className="w-32 h-32 object-contain" />
                    </div>
                    <div className="absolute bottom-0 left-0">
                        <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-800">
                            @codesapiens_in
                        </span>
                    </div>
                </div>
            )
        },
        {
            name: "Volunteers Needed",
            icon: null,
            link: "https://forms.gle/volunteer", // Placeholder link
            color: "bg-black",
            textColor: "text-white",
            span: "col-span-1",
            badge: null,
            isLarge: false,
            backgroundImage: "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767876038/users_cme79i2lk00qls401ar5qxqnc_Hg7Si3j52FVfpQRN-image_x8wghd.png') center/cover no-repeat"
        },
        {
            name: "GitHub",
            icon: <Github size={40} />,
            link: "https://github.com/Codesapiens-in",
            color: "bg-black",
            textColor: "text-white",
            span: "col-span-1",
            badge: "@Codesapiens-in",
            isLarge: true,
            backgroundImage: "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767874482/users_cme79i2lk00qls401ar5qxqnc_MOSc1bv3RXu0WL5z-users_cme5bsukl01binm014j8ioh2j_7dOv2cTCX8B86u82-users_clylc5w1v070to301jatq0e85_AdzvY5ioFqaF37x5-github_dsjpx6.gif') center/cover no-repeat"
        },
        {
            name: "YouTube",
            icon: <Youtube size={40} className="text-red-600" />,
            link: "https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi",
            color: "bg-white",
            textColor: "text-black",
            span: "col-span-1",
            badge: "@Codesapiens",
            border: "border-gray-100 border",
            isLarge: true,
            backgroundImage: "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767874488/users_cme79i2lk00qls401ar5qxqnc_Ov9Ygh4NAQfPGktu-users_cme5bsukl01binm014j8ioh2j_5JQAosdeiVappI2y-users_clylc5w1v070to301jatq0e85_CCuEsN5SSMlu4LAN-youtube_aky1f3.gif') center/cover no-repeat"
        }
    ];

    return (
        <section id="social" className="py-32 bg-white relative overflow-hidden text-slate-900">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-left mb-16">
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-5xl md:text-7xl font-display font-black tracking-widest uppercase">Social</h2>
                        <h2 className="text-5xl md:text-7xl font-display font-black text-quantum-blue italic uppercase tracking-tighter">links</h2>
                        <div className="h-px bg-slate-100 flex-1 ml-4 self-center mt-2"></div>
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                        <Globe size={16} className="text-quantum-blue animate-pulse" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Connect With The Ecosystem</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[250px] gap-6 w-full mx-auto">
                    {socials.map((social, idx) => (
                        <motion.a
                            key={idx}
                            href={social.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`${social.span} ${social.color} ${social.textColor} ${social.border} rounded-3xl p-8 relative overflow-hidden group shadow-sm flex flex-col justify-between transition-all duration-500 hover:shadow-xl`}
                            style={social.backgroundImage ? { backgroundImage: social.color.includes('gradient') ? social.color : undefined } : {}}
                        >
                            {/* Custom Background Image if any with Subtle Overlay */}
                            {social.backgroundImage && (
                                <>
                                    <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105" style={{ background: social.backgroundImage }}></div>
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-[1]"></div>
                                </>
                            )}

                            {/* Top Right Arrow */}
                            <div className={`absolute top-4 right-4 p-2 rounded-full ${social.textColor === 'text-white' ? 'bg-white/20 text-white' : 'bg-white text-slate-400'} opacity-0 group-hover:opacity-100 transition-opacity z-[2] shadow-sm`}>
                                <ArrowUpRight size={16} />
                            </div>

                            {/* Content */}
                            <div className="relative z-[2] h-full flex flex-col justify-between">
                                {social.customContent ? (
                                    social.customContent
                                ) : (
                                    <>
                                        <div className="mb-auto">
                                            {social.customIcon || social.icon}
                                        </div>
                                        <div className="mt-auto">
                                            {social.badge && (
                                                <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${social.textColor === 'text-white' ? 'bg-white text-slate-900 shadow-lg' : 'bg-slate-900 text-white shadow-lg'}`}>
                                                    {social.badge}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
};


// --- Notice Section (Call for Speakers/Sponsors) ---
// --- Notice Section (Call for Speakers/Sponsors) ---
const NoticeSection = () => {
    return (
        <section className="py-12 bg-slate-50 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12 items-center max-w-5xl mx-auto">
                    <div className="flex items-center gap-4 shrink-0">
                        <h2 className="text-2xl md:text-3xl font-display font-black text-slate-800 tracking-widest uppercase">Latest</h2>
                        <h2 className="text-2xl md:text-3xl font-display font-black text-quantum-blue italic uppercase tracking-tighter">updates</h2>
                        <div className="h-px bg-slate-200 w-12 self-center mt-1 md:hidden"></div>
                    </div>

                    {/* Images Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {/* Call for Speakers */}
                        <div className="relative group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100">
                            <img
                                src="https://res.cloudinary.com/dqudvximt/image/upload/v1767877162/users_cme79i2lk00qls401ar5qxqnc_N0bIjmMP0Ybxoznz-1753684368888_jda3us.jpg"
                                alt="Call for Speakers"
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>

                        {/* Sponsors & Venue */}
                        <div className="relative group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100">
                            <img
                                src="https://res.cloudinary.com/dqudvximt/image/upload/v1767877178/users_cme79i2lk00qls401ar5qxqnc_KB4hFvAzhyqJF0xf-3a61cb74-01c9-4880-be04-a4036f32c4f9_t64kt9.jpg"
                                alt="Call for Sponsors and Venue"
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Service Card Component (Optimized Sticky Stacking Logic) ---
const ServiceCard = ({ index, service, total, targetScale, range, progress }) => {
    const container = useRef(null);

    // Using the progress passed from the parent section relative to its range
    const scale = useTransform(progress, range, [1, targetScale]);

    return (
        <div ref={container} className="h-screen flex items-center justify-center sticky top-0">
            <motion.div
                style={{
                    scale,
                    backgroundColor: service.color,
                    // Compress the 11-card pile by using a much tighter 4px offset instead of 25px
                    top: `calc(10vh + ${index * 4}px)`,
                    willChange: "transform",
                }}
                className="relative h-[520px] w-full max-w-5xl rounded-[40px] p-12 flex flex-col md:flex-row gap-12 border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden group beam-container origin-top transform-gpu"
            >
                {/* MeritFirst Inspired Beam Spin effect */}
                <div className="beam-spin opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                {/* Overlay to keep content readable above beam */}
                <div className="absolute inset-[2px] bg-inherit rounded-[38px] z-10" />

                <div className="flex-1 flex flex-col justify-center z-20">
                    <div className="w-24 h-24 rounded-3xl bg-white shadow-xl shadow-slate-200 flex items-center justify-center overflow-hidden mb-10 group-hover:scale-110 transition-transform duration-700 p-1">
                        {typeof service.icon === 'string' ? (
                            <img src={service.icon} alt={service.title} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            <div className="text-quantum-blue">{service.icon}</div>
                        )}
                    </div>
                    <h3 className="text-4xl md:text-6xl font-display font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none">
                        {service.title}
                    </h3>
                    <p className="text-xl text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">
                        {service.description}
                    </p>
                    <div className="mt-10">
                        <a href={service.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-900 group/btn">
                            <Linkedin size={18} className="text-[#0077b5]" />
                            Visit Profile 
                            <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300 text-quantum-blue" />
                        </a>
                    </div>
                </div>

                <div className="flex-1 relative hidden md:block z-20">
                    <div className="absolute inset-0 bg-slate-50 rounded-3xl border border-slate-200/30 overflow-hidden shadow-inner">
                        <div className="absolute inset-0 flex items-center justify-center transition-all duration-1000 group-hover:scale-105">
                             {typeof service.icon === 'string' ? (
                                <img src={service.icon} alt={service.title} className="w-full h-full object-cover transition-all duration-1000" />
                            ) : (
                                <div className="text-quantum-blue/10 group-hover:text-quantum-blue/20 transition-colors">
                                    {React.cloneElement(service.icon, { size: 300 })}
                                </div>
                            )}
                        </div>
                        {/* Decorative Badge */}
                        <div className="absolute top-8 right-8 px-4 py-2 bg-white/60 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg">
                             <span className="text-[10px] font-black uppercase tracking-widest text-quantum-blue">The Council</span>
                        </div>
                    </div>
                </div>

                {/* Number Indicator */}
                <div className="absolute bottom-8 right-12 text-9xl font-display font-black text-slate-900/5 italic select-none z-20">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </div>
            </motion.div>
        </div>
    );
};

// --- Main Hero Component ---
const CodeSapiensHero = () => {
    const [navScrolled, setNavScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hallOfFameEntries, setHallOfFameEntries] = useState([]);
    const [communityPhotos, setCommunityPhotos] = useState([]);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: hof } = await supabase.from('hall_of_fame').select('*').eq('is_active', true).order('created_at', { ascending: false });
                if (hof && hof.length > 0) setHallOfFameEntries(hof);

                const { data: photos } = await supabase.from('community_photos').select('*').eq('is_active', true).order('order_number', { ascending: true });
                
                // Fallback photos from original site - Precision Match
                const fallbackPhotos = [
                    { id: 1, title: "August 2025 Meetup", date: "Aug 2025", image_url: "/meetup_aug_2025.png" },
                    { id: 2, title: "May 2024 Meetup", date: "May 2024", image_url: "/meetup_may_2024.jpg" },
                    { id: 3, title: "June 2024 Meetup", date: "Jun 2024", image_url: "/meetup_june_2024.png" },
                    { id: 4, title: "November 2025 Meetup", date: "Nov 2025", image_url: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/users_cme79i2lk00qls401ar5qxqnc_tYvYry0ll1qJY9Cr-sZlcWmpyKLCEVr3R-WhatsApp25202025-08-10252015.15.02_25567a3d_c0frk5_dpl25k.jpg" },
                    { id: 5, title: "October 2025 Meetup", date: "Oct 2025", image_url: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/users_cme79i2lk00qls401ar5qxqnc_OadwAYSr5ySuegEn-IMG-20250914-WA0012_gvyeye_n1s3az.jpg" },
                    { id: 6, title: "September 2025 Meetup", date: "Sep 2025", image_url: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122532/width_800_pmtms3_cqtzrn.webp" }
                ];


                setCommunityPhotos([...fallbackPhotos, ...(photos || []).filter(p => !fallbackPhotos.some(fp => fp.title === p.title))]);
            } catch (err) {
                console.error("Supabase fetch error:", err);
            }
        };
        fetchData();
    }, []);

    // --- Performance Optimization: Manual Scroll Tracking ---
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        setNavScrolled(latest > 0.02);
    });

    // --- Hero Parallax Effects ---
    const heroY = useTransform(scrollYProgress, [0, 0.2], ["0%", "20%"]);
    const dashboardY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-10%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    const navItems = [
        { name: 'Vision', href: '#vision' },
        { name: 'Programs', href: '#programs' },
        { name: 'Community', href: '#mafia' },
        { name: 'Archive', href: '#events' },
        { name: 'Social', href: '#social' }
    ];

    return (
        <div ref={containerRef} className="relative min-h-screen bg-white text-slate-900 selection:bg-quantum-blue/10">
            <GenerativeBackground />
            <CustomCursor />
            
            {/* Scroll Progress Bar - Refined for Light Theme */}
            <motion.div className="scroll-progress h-[2px] bg-gradient-to-r from-quantum-blue to-quantum-cyan" style={{ scaleX }} />

            {/* Premium Navigation - Floating Pill Effect */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${navScrolled ? 'pt-4' : 'pt-6'}`}
            >
                <div className="mx-auto flex justify-center px-4 sm:px-6 lg:px-8">
                    <div className={`
                        relative flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500
                        ${navScrolled
                            ? 'backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/90 w-full max-w-5xl border border-slate-200/50'
                            : 'w-full max-w-7xl bg-transparent'
                        }
                    `}>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 cursor-pointer group shrink-0"
                            onClick={() => navigate('/')}
                        >
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center relative overflow-hidden shadow-md border border-slate-100">
                                <img src="/logo.jpg" alt="CodeSapiens Logo" className="w-full h-full object-cover relative z-10" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-xl md:text-2xl font-black tracking-tighter uppercase font-display text-slate-900 leading-none">
                                Code<span className="text-quantum-blue">Sapiens</span>
                            </span>
                        </motion.div>

                        {/* Desktop Menu - Refined Typography */}
                        <div className="hidden lg:flex items-center gap-6 lg:gap-8">
                            {navItems.map((item, idx) => (
                                <motion.a
                                    key={item.name}
                                    href={item.href}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-quantum-blue transition-colors relative group whitespace-nowrap"
                                >
                                    {item.name}
                                    <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-quantum-blue transition-all duration-300 group-hover:w-full" />
                                </motion.a>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/auth')}
                                className="hidden lg:flex px-6 py-3 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-[0.15em] rounded-full hover:bg-quantum-blue transition-all duration-300 shadow-md shadow-slate-900/10"
                            >
                                Explore Community
                            </motion.button>
                            
                            <button 
                                className="lg:hidden p-2 text-slate-900 hover:text-quantum-blue transition-colors bg-slate-100/50 rounded-full"
                                onClick={() => setMobileMenuOpen(true)}
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu - Light Edition */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 35, stiffness: 350 }}
                        className="fixed inset-0 z-[200] bg-white lg:hidden flex flex-col p-8"
                    >
                        <div className="flex justify-between items-center mb-16">
                            <div className="flex items-center gap-3">
                                <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg" />
                                <span className="text-2xl font-black tracking-tighter uppercase text-slate-900 font-display">Code<span className="text-quantum-blue">Sapiens</span></span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-slate-100 rounded-full text-slate-900">
                                <X size={28} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-8">
                            {navItems.map((item, idx) => (
                                <motion.a
                                    key={item.name}
                                    href={item.href}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-5xl font-display font-black uppercase tracking-tighter text-slate-900 hover:text-quantum-blue transition-colors"
                                >
                                    {item.name}
                                </motion.a>
                            ))}
                        </div>
                        <div className="mt-auto">
                            <button onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }} className="w-full py-5 bg-slate-900 text-white text-lg font-bold uppercase tracking-widest rounded-3xl shadow-2xl">
                                Explore Community
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section - Quantum Light Theme */}
            <section className="relative min-h-[110vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="max-w-4xl order-2 lg:order-1">
                            {/* Text Reveal Effects */}
                            <div className="text-reveal-overflow mb-3">
                                <motion.span
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                                    className="text-quantum-blue font-bold uppercase tracking-[0.4em] text-xs block"
                                >
                                    TN's Biggest Student Community
                                </motion.span>
                            </div>

                            <div className="text-reveal-overflow mb-4">
                                <motion.h1
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                                    className="text-7xl md:text-8xl lg:text-[130px] font-display font-black leading-[0.82] tracking-tighter text-slate-900"
                                >
                                    CODE<br /><span className="text-quantum-blue uppercase">Sapiens</span>
                                </motion.h1>
                            </div>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed mt-12 mb-12 font-medium"
                            >
                                bridging the gap between curiosity and career. Join a thriving community of builders, creators, and innovators in the digital age.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.8 }}
                                className="flex flex-col sm:flex-row gap-6"
                            >
                                <button className="group relative px-10 py-5 bg-slate-900 text-white font-bold uppercase text-xs tracking-[0.2em] rounded-full overflow-hidden transition-all duration-500 hover:bg-quantum-blue hover:shadow-2xl hover:shadow-quantum-blue/30">
                                    <span className="relative z-10 flex items-center gap-3">
                                        Join The Community <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                                <button className="px-10 py-5 border-2 border-slate-100 hover:border-slate-200 text-slate-800 font-bold uppercase text-xs tracking-[0.2em] rounded-full transition-all hover:bg-slate-50 font-display">
                                    Our Vision
                                </button>
                            </motion.div>
                        </motion.div>

                        <motion.div 
                            style={{ y: dashboardY }}
                            initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                            className="relative order-1 lg:order-2"
                        >
                            <div className="relative rounded-[40px] overflow-hidden group shadow-2xl shadow-slate-200 border-8 border-white">
                                <div className="absolute inset-0 bg-gradient-to-tr from-quantum-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <img
                                    src="https://res.cloudinary.com/dqudvximt/image/upload/v1771005975/Gemini_Generated_Image_il0qzjil0qzjil0q_1_cfh7ix.png"
                                    alt="CodeSapiens Ecosystem"
                                    className="w-full h-auto scale-100 group-hover:scale-110 transition-transform duration-1000"
                                />
                                {/* Light UI elements simulated */}
                                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-100 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-quantum-blue animate-pulse" />
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Network Active</span>
                                        </div>
                                        <span className="text-slate-900 font-black tracking-tighter text-sm uppercase">2k+ PARTNERS</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Decorative element */}
                            <div className="absolute -z-10 -top-12 -right-12 w-64 h-64 bg-quantum-blue/5 rounded-full blur-3xl" />
                            <div className="absolute -z-10 -bottom-12 -left-12 w-64 h-64 bg-quantum-cyan/5 rounded-full blur-3xl" />
                        </motion.div>
                    </div>
                </div>
                
                {/* Visual Anchors - Subtle Light Version */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-slate-300"
                >
                    <span className="text-[10px] uppercase font-bold tracking-[0.5em]">Scroll</span>
                    <motion.div 
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-px h-12 bg-gradient-to-b from-slate-200 to-transparent"
                    />
                </motion.div>
            </section>

            {/* Vision Section - Premium Light Edition */}
            <section id="vision" className="bg-white text-slate-900 py-32 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-24 items-start">
                        <div className="relative lg:sticky lg:top-32">
                            <span className="text-quantum-blue font-bold tracking-[0.4em] uppercase text-xs mb-6 block">Our Vision</span>
                            <h2 className="text-5xl md:text-7xl font-display font-black mb-12 leading-tight tracking-tighter text-slate-900">
                                A <span className="text-quantum-blue italic">Community</span> for the next generation of builders.
                            </h2>
                            <p className="text-xl text-slate-500 leading-relaxed mb-12 font-medium">
                                We are a non-profit community built for students, by students. We bridge the gap between academic theory and industry reality through hands-on collaboration.
                            </p>
                            <div className="grid grid-cols-2 gap-12 border-t border-slate-100 pt-12">
                                <div>
                                    <h3 className="text-5xl font-display font-black text-quantum-blue mb-2">2000+</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Global Members</p>
                                </div>
                                <div>
                                    <h3 className="text-5xl font-display font-black text-slate-900 mb-2">50+</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Colleges Represented</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative rounded-[40px] overflow-hidden shadow-2xl group border-8 border-white">
                            <img
                                src="https://res.cloudinary.com/dqudvximt/image/upload/v1767535873/1760365837828_vyrmco.jpg"
                                alt="Community Meeting"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent opacity-40" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Section — Sticky Stack + Grid-Shatter (Light Theme, Motion-Design Skill) */}
            {(() => {
                // Individual tile that clips a portion of the full-screen image
                const ShatterTile = ({ scrollYProgress, row, col, cols, rows, startOffset, imgSrc }) => {
                    const end = Math.min(startOffset + 0.3, 1);
                    const seed = (row * cols + col + 1) * 137.5;
                    const randX = Math.sin(seed) * 180;
                    const randY = Math.cos(seed) * 120;
                    const randRot = Math.sin(seed * 0.7) * 35;

                    return (
                        <motion.div
                            style={{
                                position: 'absolute',
                                left: `${(col / cols) * 100}%`,
                                top: `${(row / rows) * 100}%`,
                                width: `${(100 / cols) + 0.5}%`,
                                height: `${(100 / rows) + 0.5}%`,
                                x: useTransform(scrollYProgress, [startOffset, end], [0, randX]),
                                y: useTransform(scrollYProgress, [startOffset, end], [0, randY]),
                                scale: useTransform(scrollYProgress, [startOffset, end], [1, 0]),
                                opacity: useTransform(scrollYProgress, [startOffset, end], [1, 0]),
                                rotate: useTransform(scrollYProgress, [startOffset, end], [0, randRot]),
                                transformOrigin: 'center center',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                left: `${-(col / cols) * 100 * cols}%`,
                                top: `${-(row / rows) * 100 * rows}%`,
                                width: `${cols * 100}%`,
                                height: `${rows * 100}%`,
                                backgroundImage: `url(${imgSrc})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }} />
                        </motion.div>
                    );
                };

                // A single stacking event card with shatter exit
                const EventStackCard = ({ photo, index, total, sectionProgress }) => {
                    const COLS = 8;
                    const ROWS = 5;

                    // Each card's scroll range within the overall section
                    const cardStart = index / total;
                    const cardEnd = (index + 1) / total;
                    const cardProgress = useTransform(sectionProgress, [cardStart, cardEnd], [0, 1]);

                    // Sticky offset for stacking
                    const topOffset = 80 + index * 4;

                    // Scale down slightly as cards stack  
                    const targetScale = 1 - ((total - index) * 0.02);
                    const cardScale = useTransform(sectionProgress, [cardStart, cardEnd], [1, targetScale]);

                    // Generate shatter tiles with center-outward stagger
                    const tiles = [];
                    const maxDist = Math.sqrt(((COLS - 1) / 2) ** 2 + ((ROWS - 1) / 2) ** 2);
                    for (let r = 0; r < ROWS; r++) {
                        for (let c = 0; c < COLS; c++) {
                            const dx = c - (COLS - 1) / 2;
                            const dy = r - (ROWS - 1) / 2;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            const startOffset = 0.35 + (dist / maxDist) * 0.3;

                            tiles.push(
                                <ShatterTile
                                    key={`${r}-${c}`}
                                    scrollYProgress={cardProgress}
                                    row={r} col={c}
                                    cols={COLS} rows={ROWS}
                                    startOffset={startOffset}
                                    imgSrc={photo.image_url}
                                />
                            );
                        }
                    }

                    return (
                        <div
                            className="sticky w-full"
                            style={{
                                top: `${topOffset}px`,
                                height: 'calc(100vh - 100px)',
                                zIndex: total + index,
                            }}
                        >
                            <motion.div
                                style={{ scale: cardScale }}
                                className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50"
                            >
                                {/* Background gradient for when tiles shatter */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30" />

                                {/* Ghost title visible behind shatter */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center px-8">
                                        <motion.h3
                                            className="text-3xl md:text-6xl lg:text-7xl font-display font-black text-slate-900/[0.06] uppercase tracking-tighter"
                                            style={{
                                                opacity: useTransform(cardProgress, [0.3, 0.5], [0, 1]),
                                                scale: useTransform(cardProgress, [0.3, 0.6], [0.9, 1]),
                                            }}
                                        >
                                            {photo.title}
                                        </motion.h3>
                                    </div>
                                </div>

                                {/* Shatter tiles */}
                                <div className="absolute inset-0 z-10">
                                    {tiles}
                                </div>

                                {/* Bottom info bar — fades out as shatter begins */}
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 z-20 p-5 md:p-8"
                                    style={{
                                        opacity: useTransform(cardProgress, [0, 0.3], [1, 0])
                                    }}
                                >
                                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-slate-100/80 shadow-lg">
                                        <div className="flex items-end justify-between gap-4">
                                            <div>
                                                <h4 className="text-lg md:text-xl font-display font-bold text-slate-900">{photo.title}</h4>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{photo.date || "Past Event"}</p>
                                            </div>
                                            <motion.div
                                                animate={{ y: [0, 6, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                className="text-quantum-blue/40"
                                            >
                                                <ChevronDown size={20} />
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    );
                };

                // Main orchestrator component  
                const EventsStack = () => {
                    const sectionRef = useRef(null);
                    const photos = communityPhotos.slice(0, 5);
                    const { scrollYProgress: sectionProgress } = useScroll({
                        target: sectionRef,
                        offset: ['start start', 'end end']
                    });

                    return (
                        <section id="events" className="relative bg-white">
                            {/* Header */}
                            <div className="pt-32 pb-12 px-6 md:px-14 max-w-[1400px] mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                                    className="flex flex-col md:flex-row items-end justify-between gap-8"
                                >
                                    <div>
                                        <span className="text-quantum-blue font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Archive</span>
                                        <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase text-slate-900">Community<br /><span className="text-quantum-blue italic">Moments</span></h2>
                                    </div>
                                    <button className="px-8 py-4 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all text-xs font-bold uppercase tracking-widest text-slate-600 shadow-sm">
                                        View All Events
                                    </button>
                                </motion.div>
                            </div>

                            {/* Stack container — tall enough for all cards to scroll through */}
                            <div
                                ref={sectionRef}
                                className="relative px-3 md:px-6"
                                style={{ height: `${photos.length * 100}vh` }}
                            >
                                {photos.map((photo, i) => (
                                    <EventStackCard
                                        key={photo.id || i}
                                        photo={photo}
                                        index={i}
                                        total={photos.length}
                                        sectionProgress={sectionProgress}
                                    />
                                ))}
                            </div>
                        </section>
                    );
                };

                return <EventsStack />;
            })()}

            {/* Re-wiring high-priority original sections */}
            <StatsSection />
            <ProgramsSection />
            <Marquee topItems={["REACT", "P5.JS", "FRAMER MOTION", "SUPABASE", "VITE"]} bottomItems={["INNOVATION", "COMMUNITY", "CREATIVITY", "GROWTH", "MEMBERS"]} />
            <SponsorSection />
            <CommunityPartners />
            <SocialMediaSection />
            <NoticeSection />

            {/* Hall Of Fame - Quantum Light Edition */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--quantum-blue)_1px,_transparent_1px)] bg-[size:32px_32px]" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20 uppercase">
                        <span className="text-quantum-blue font-bold tracking-[0.4em] text-[10px] mb-4 block">Distinction</span>
                        <h2 className="text-6xl md:text-9xl font-display font-black text-slate-900 tracking-tighter">Hall Of <span className="text-quantum-blue italic">Fame</span></h2>
                    </div>

                    <div className="flex flex-wrap justify-center gap-12">
                        {hallOfFameEntries.map((entry, i) => (
                            <motion.div
                                key={entry.id || i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="w-80 group"
                            >
                                <div className="relative aspect-[3.5/4] rounded-[40px] overflow-hidden bg-slate-50 mb-8 shadow-2xl shadow-slate-200 border-8 border-white transition-all duration-700 group-hover:shadow-quantum-blue/10">
                                    <img src={entry.image_url} alt={entry.student_name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 border-[16px] border-white/20 group-hover:border-white/40 transition-all duration-500" />
                                </div>
                                <h3 className="text-2xl font-display font-black text-slate-900 mb-1 uppercase tracking-tighter">{entry.student_name}</h3>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed italic">"{entry.description}"</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mafia Gang Section - Rebuilt with Premium Stacking Effects */}
            <section id="mafia" className="relative py-32 bg-white overflow-visible">
                <div className="container mx-auto px-6 mb-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                        className="text-center"
                    >
                        <span className="text-quantum-blue font-bold tracking-[0.4em] uppercase text-[10px] mb-6 block">The Council</span>
                        <h2 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase text-slate-900 leading-[0.9]">
                            Mafia <span className="text-quantum-blue italic">Gang</span>
                        </h2>
                        <div className="mt-8 flex justify-center">
                            <div className="h-px w-24 bg-slate-100" />
                        </div>
                    </motion.div>
                </div>

                {(() => {
                    const members = [
                        { name: "Thiyaga B", role: "Founder", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/1679197646322_n1svjq_s5w42a.jpg", link: "https://www.linkedin.com/in/thiyaga-b" },
                        { name: "Keerthana M G", role: "", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/2ABMHfqOsrpoL3OV-WhatsApp202025-08-312010.33.52_a8a27bbd_vzcgzq_1_bm8zch.jpg", link: "https://in.linkedin.com/in/keerthana-m-g-12ba59256" },
                        { name: "Mahaveer A", role: "", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/iAckgTxMcALuPbEx-IMG-20250112-WA0012_1_fwyhoa_oxegdx.jpg", link: "https://www.linkedin.com/in/mahaveer1013" },
                        { name: "Justin Benito", role: "", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/4SrLYdwh0tpuLlkt-team_2.a2a0c6917be79e15dc29_wjosq7_ftgm6j.jpg", link: "https://www.linkedin.com/in/justinbenito" },
                        { name: "Koushik ram", role: "", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/nLDGxnsr6bZkCx0A-team_3.d2fd9099126beb0b86a1_vxhpxo_z3eods.jpg", link: "https://www.linkedin.com/in/koushik-ram-118495239" },
                        { name: "Athiram R S", role: "", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/Tlgueu6loMYMKJMs-team_1.150894ea4376f6423091_vrf0fr_weljyi.jpg", link: "https://www.linkedin.com/in/athi-ram-rs" },
                        { name: "Pranav Vikraman", role: "", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/5NmVUZRZI8sRCrZA-1735300455766_h8dhm2_dnully.jpg", link: "https://www.linkedin.com/in/pranav-vikraman-322020242" },
                        { name: "Vignesh R", role: "", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/JWz1OvtKurqSRsC7-WhatsApp202025-08-312011.22.52_bff7c8bd_mrok7q_b6meyd.jpg", link: "https://www.linkedin.com/in/vignesh-r-7727582b7" },
                        { name: "Anand S", role: "", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122532/3S8YnOu77Rt2wDJD-WhatsApp202025-08-312010.32.42_9b5cee10_puasao_zekkfa.jpg", link: "https://codesapiens-management-website.vercel.app" },
                        { name: "Subhaharini P", role: "", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/q5tsA3KUOwgSOpIa-team_5.efc764325a5ffbaf1b6e_1_sidv9r_fhxmqv.jpg", link: "https://www.linkedin.com/in/subhaharini-p-938568254" },
                        { name: "Jayasurya R", role: "", photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/1732031130575_b834gr_1_slc9fw.jpg", link: "https://www.linkedin.com/in/jayasurya-r-b37997279/" }
                    ];

                    // Create a ref and mapping container right here to track the whole section progress like AIVIXR
                    const MappedCards = () => {
                        const sectionRef = useRef(null);
                        const { scrollYProgress: sectionProgress } = useScroll({
                            target: sectionRef,
                            offset: ['start start', 'end end']
                        });

                        return (
                            <div ref={sectionRef} className="relative">
                                {members.map((member, index) => {
                                    const targetScale = 1 - ((members.length - index) * 0.03); // More subtle scale drop like AIVIXR
                                    return (
                                        <ServiceCard
                                            key={index}
                                            index={index}
                                            service={{
                                                title: member.name,
                                                description: member.role,
                                                icon: member.photo,
                                                color: index % 2 === 0 ? "#F8FAFC" : "#F1F5F9",
                                                link: member.link
                                            }}
                                            total={members.length}
                                            targetScale={targetScale}
                                            range={[index * (1 / members.length), 1]}
                                            progress={sectionProgress}
                                        />
                                    );
                                })}
                            </div>
                        );
                    };

                    return <MappedCards />;
                })()}
            </section>

            {/* Building Community Banner - MeritFirst "Hire on Merit" Style Scroll Color Transition */}
            {(() => {
                const ScrollColorText = () => {
                    const sectionRef = useRef(null);
                    const { scrollYProgress } = useScroll({
                        target: sectionRef,
                        offset: ['start 0.9', 'start 0.3']
                    });

                    const text1 = "Building Community";
                    const text2 = "Since 2023";

                    return (
                        <section ref={sectionRef} className="bg-white relative overflow-hidden min-h-[60vh] flex items-center justify-center py-32">
                            {/* Background decorative elements */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-quantum-blue/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
                            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-quantum-cyan/[0.02] blur-[120px] rounded-full translate-y-1/2 -translate-x-1/3" />

                            <div className="relative w-full px-6 text-center leading-none">
                                {/* Line 1: Building Community */}
                                <h2 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[clamp(2.5rem,8vw,10rem)] uppercase mb-2 md:mb-4">
                                    {text1.split('').map((char, i) => {
                                        const totalChars = text1.length + text2.length;
                                        const charProgress = i / totalChars;
                                        const charEnd = (i + 1) / totalChars;
                                        return (
                                            <motion.span
                                                key={`t1-${i}`}
                                                className="inline-block"
                                                style={{
                                                    whiteSpace: 'pre',
                                                    color: useTransform(
                                                        scrollYProgress,
                                                        [charProgress, charEnd],
                                                        ['#cbd5e1', '#0f172a']
                                                    ),
                                                    translateY: useTransform(
                                                        scrollYProgress,
                                                        [charProgress, charEnd],
                                                        [20, 0]
                                                    ),
                                                }}
                                            >
                                                {char === ' ' ? '\u00A0' : char}
                                            </motion.span>
                                        );
                                    })}
                                </h2>

                                {/* Line 2: Since 2023 */}
                                <h3 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-4xl md:text-6xl lg:text-[clamp(4rem,8vw,8rem)] uppercase italic">
                                    {text2.split('').map((char, i) => {
                                        const totalChars = text1.length + text2.length;
                                        const offset = text1.length;
                                        const charProgress = (offset + i) / totalChars;
                                        const charEnd = (offset + i + 1) / totalChars;
                                        return (
                                            <motion.span
                                                key={`t2-${i}`}
                                                className="inline-block"
                                                style={{
                                                    whiteSpace: 'pre',
                                                    color: useTransform(
                                                        scrollYProgress,
                                                        [charProgress, charEnd],
                                                        ['#cbd5e1', '#2563eb']
                                                    ),
                                                    translateY: useTransform(
                                                        scrollYProgress,
                                                        [charProgress, charEnd],
                                                        [20, 0]
                                                    ),
                                                }}
                                            >
                                                {char === ' ' ? '\u00A0' : char}
                                            </motion.span>
                                        );
                                    })}
                                </h3>
                            </div>
                        </section>
                    );
                };
                return <ScrollColorText />;
            })()}

            {/* "Next When?" CTA Section — Premium Motion Design */}
            <section className="relative bg-white overflow-hidden py-32 md:py-48">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_var(--quantum-blue)_1px,_transparent_1px)] bg-[size:40px_40px]" />
                
                {/* Floating decorative circles */}
                <motion.div
                    className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-quantum-blue/5 to-quantum-cyan/5 blur-3xl"
                    animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-gradient-to-br from-blue-100/30 to-cyan-50/20 blur-3xl"
                    animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-14 text-center">
                    {/* Small label */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                        className="flex items-center justify-center gap-3 mb-12"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-quantum-blue/40 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-quantum-blue"></span>
                        </span>
                        <span className="text-quantum-blue font-bold tracking-[0.3em] uppercase text-xs">Stay Tuned</span>
                    </motion.div>

                    {/* Main "Next When?" text */}
                    <motion.h2
                        initial={{ opacity: 0, y: 60, filter: 'blur(20px)' }}
                        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
                        className="text-6xl md:text-8xl lg:text-[clamp(6rem,12vw,14rem)] font-display font-black uppercase tracking-tighter leading-[0.9] mb-6"
                    >
                        <span className="text-slate-900">Next</span>
                        <br />
                        <span className="bg-gradient-to-r from-quantum-blue via-blue-500 to-quantum-cyan bg-clip-text text-transparent">
                            When?
                        </span>
                    </motion.h2>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
                        className="text-slate-400 text-lg md:text-xl font-medium max-w-xl mx-auto mb-16 leading-relaxed"
                    >
                        Something big is coming. Be part of the next wave of innovation, learning, and community.
                    </motion.p>

                    {/* CTA Button — Premium with beam-spin border */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                    >
                        <motion.a
                            href="#"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            className="group relative inline-flex items-center gap-3 px-12 py-5 bg-slate-900 text-white font-display font-bold text-lg uppercase tracking-widest rounded-full overflow-hidden shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/40 transition-shadow duration-500"
                        >
                            {/* Beam spin border */}
                            <span className="absolute inset-0 rounded-full overflow-hidden">
                                <span className="absolute inset-[-2px] bg-[conic-gradient(from_0deg,transparent_0deg,var(--quantum-blue)_60deg,transparent_120deg)] animate-spin" style={{ animationDuration: '3s' }} />
                                <span className="absolute inset-[2px] bg-slate-900 rounded-full" />
                            </span>
                            
                            {/* Button content */}
                            <span className="relative z-10 flex items-center gap-3">
                                <Users size={20} />
                                Join Community
                                <motion.span
                                    className="inline-block"
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <ArrowRight size={18} />
                                </motion.span>
                            </span>

                            {/* Hover gradient sweep */}
                            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-quantum-blue to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                            <span className="absolute inset-[2px] rounded-full bg-slate-900 group-hover:bg-transparent transition-colors duration-500 z-0" />
                        </motion.a>
                    </motion.div>

                    {/* Bottom decorative line */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
                        className="w-24 h-[2px] bg-gradient-to-r from-transparent via-quantum-blue/30 to-transparent mx-auto mt-20"
                    />
                </div>
            </section>

            {/* Footer - Professional Light Edition */}
            <footer className="bg-white border-t border-slate-100 py-32">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 justify-between items-start gap-24">
                        <div className="max-w-md">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100 overflow-hidden">
                                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-4xl font-display font-black uppercase tracking-tighter text-slate-900 leading-none">Code<span className="text-quantum-blue">Sapiens</span></span>
                            </div>
                            <p className="text-xl text-slate-400 leading-relaxed mb-12 font-medium">
                                Empowering students to build, learn, and grow together. Join the biggest student tech community in Tamil Nadu.
                            </p>
                            <div className="flex gap-8">
                                <a href="https://github.com/Codesapiens-in" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-quantum-blue hover:bg-white hover:shadow-xl transition-all"><Github size={20} /></a>
                                <a href="https://www.linkedin.com/company/codesapiens-community/" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-quantum-blue hover:bg-white hover:shadow-xl transition-all"><Linkedin size={20} /></a>
                                <a href="https://youtube.com/@codesapiens-in" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-quantum-blue hover:bg-white hover:shadow-xl transition-all"><Youtube size={20} /></a>
                                <a href="#" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-quantum-blue hover:bg-white hover:shadow-xl transition-all"><Users size={20} /></a>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div>
                                <h4 className="text-4xl font-display font-black text-slate-900 mb-8 tracking-tighter">Community</h4>
                                <ul className="space-y-4">
                                    <li><a href="#vision" className="text-lg font-bold text-slate-600 hover:text-quantum-blue transition-colors">About Us</a></li>
                                    <li><a href="#events" className="text-lg font-bold text-slate-600 hover:text-quantum-blue transition-colors">Events</a></li>
                                    <li><a href="#mafia" className="text-lg font-bold text-slate-600 hover:text-quantum-blue transition-colors">Team</a></li>
                                    <li><a href="#" className="text-lg font-bold text-slate-600 hover:text-quantum-blue transition-colors">Join Discord</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-32 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                        <p>© 2025 CodeSapiens Community. All rights reserved.</p>
                        <p className="mt-4 md:mt-0 italic text-slate-400">Designed & Built by Students.</p>
                    </div>
                </div>
            </footer>
            <LandingPopup />
        </div>
    );
};
export default CodeSapiensHero;



