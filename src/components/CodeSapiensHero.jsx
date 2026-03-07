import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X, Github, Linkedin, Youtube, Users, Calendar, Code, Award, Crown } from 'lucide-react';
import { BACKEND_URL } from '../config';
import { authFetch } from '../lib/authFetch';
import LandingPopup from './LandingPopup';

// --- Stats Section ---
const StatsSection = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalColleges: 0, topColleges: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authFetch(`${BACKEND_URL}/api/public-stats`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStats(data.stats);
                }
            })
            .catch(err => console.error("Stats fetch error:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="py-24 bg-[#101010] text-white relative overflow-hidden">
            {/* Background Elements */}
            {/* Background Elements */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                {/* Moving Blob 1 - Blue (Large) */}
                <motion.div
                    animate={{
                        x: [0, 100, -100, 0],
                        y: [0, -100, 100, 0],
                        scale: [1, 1.2, 0.8, 1],
                        opacity: [0.4, 0.7, 0.4]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="absolute top-[-20%] left-[-10%] w-[900px] h-[900px] bg-[#0061FE] rounded-full blur-[150px] mix-blend-screen opacity-40"
                />

                {/* Moving Blob 2 - Violet (Large) */}
                <motion.div
                    animate={{
                        x: [0, -150, 100, 0],
                        y: [0, 100, -50, 0],
                        scale: [1, 1.3, 0.9, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 20,
                        delay: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-[#7F00FF] rounded-full blur-[160px] mix-blend-screen opacity-30"
                />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="mb-16 text-center">
                    <span className="text-[#0061FE] font-bold tracking-widest uppercase text-golden-1 mb-4 block">Impact</span>
                    <h2 className="text-golden-2 md:text-golden-3 font-bold mb-6">By The Numbers</h2>
                    <p className="text-golden-1 text-gray-400 max-w-2xl mx-auto">
                        We are growing fast. Join the movement.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start md:items-center">
                    {/* Left: Big Numbers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">

                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-black/40 backdrop-blur-3xl p-3 md:p-8 rounded-2xl border border-white/10 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden group"
                        >
                            {/* Specular Highlight */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <h3 className="text-golden-2 md:text-golden-3 font-black text-white mb-2 drop-shadow-lg">
                                {stats.totalUsers > 0 ? stats.totalUsers : "1500+"}
                            </h3>
                            <p className="text-gray-400 font-medium uppercase tracking-normal md:tracking-wider text-golden-1">Total Members</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-black/40 backdrop-blur-3xl p-3 md:p-8 rounded-2xl border border-white/10 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden group"
                        >
                            {/* Specular Highlight */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <h3 className="text-golden-2 md:text-golden-3 font-black text-white mb-2 drop-shadow-lg">
                                {stats.totalColleges > 0 ? stats.totalColleges : "50+"}
                            </h3>
                            <p className="text-gray-400 font-medium uppercase tracking-normal md:tracking-wider text-golden-1">Colleges Reached</p>
                        </motion.div>
                    </div>

                    {/* Right: Top Colleges Chart */}
                    <div className="col-span-1 h-full w-full overflow-hidden">
                        <div className="bg-black/40 backdrop-blur-3xl p-8 rounded-2xl border border-white/10 h-full flex flex-col relative overflow-hidden group shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                            {/* Specular Highlight */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                            <h4 className="text-golden-2 font-bold mb-8 flex items-center gap-3">
                                Top Active Colleges
                            </h4>

                            <div className="flex-1 flex flex-col justify-center">
                                {loading ? (
                                    <div className="text-center text-gray-500 py-10 animate-pulse">Loading leaderboards...</div>
                                ) : stats.topColleges.filter(c => c.name && c.name !== "Not specified").length > 0 ? (
                                    <div className="space-y-8">
                                        {/* Top 3 Podium - Only show if we have enough data, else fallback to list */}
                                        {stats.topColleges.filter(c => c.name && c.name !== "Not specified").length >= 3 ? (
                                            <div className="flex items-end justify-center gap-2 md:gap-4 mb-4 min-h-[180px]">
                                                {/* 2nd Place */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 50 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="flex flex-col items-center w-1/3"
                                                >
                                                    <div className="text-center mb-2">
                                                        <span className="text-gray-300 font-bold block text-sm sm:text-base line-clamp-2 min-h-[2.5em] leading-tight">
                                                            {stats.topColleges.filter(c => c.name && c.name !== "Not specified")[1].name}
                                                        </span>
                                                        <span className="text-gray-500 text-xs font-mono mt-1 block">{stats.topColleges.filter(c => c.name && c.name !== "Not specified")[1].count} Students</span>
                                                    </div>
                                                    <div className="w-full bg-gradient-to-t from-gray-800 to-gray-600/50 rounded-t-lg relative border-t border-x border-gray-600 h-24 flex items-end justify-center pb-2">
                                                        <span className="text-3xl font-black text-gray-400/20 absolute top-2">2</span>
                                                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-black font-bold text-sm shadow-[0_0_15px_rgba(156,163,175,0.5)]">2</div>
                                                    </div>
                                                </motion.div>

                                                {/* 1st Place */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 50 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="flex flex-col items-center w-1/3 -mt-4 z-10"
                                                >
                                                    <div className="text-center mb-2">
                                                        <span className="text-yellow-400 font-bold block text-sm sm:text-lg line-clamp-2 min-h-[2.5em] leading-tight drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">
                                                            {stats.topColleges.filter(c => c.name && c.name !== "Not specified")[0].name}
                                                        </span>
                                                        <span className="text-yellow-500/80 text-xs font-mono mt-1 block font-bold">{stats.topColleges.filter(c => c.name && c.name !== "Not specified")[0].count} Students</span>
                                                    </div>
                                                    <div className="w-full bg-gradient-to-t from-yellow-900/40 to-yellow-600/40 rounded-t-lg relative border-t border-x border-yellow-500 h-32 flex items-end justify-center pb-4 overflow-hidden">
                                                        <div className="absolute inset-0 bg-yellow-400/10 animate-pulse"></div>
                                                        <span className="text-4xl font-black text-yellow-400/20 absolute top-2">1</span>
                                                        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-lg shadow-[0_0_20px_rgba(250,204,21,0.6)] relative z-10">
                                                            <Crown size={20} />
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* 3rd Place */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 50 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="flex flex-col items-center w-1/3"
                                                >
                                                    <div className="text-center mb-2">
                                                        <span className="text-amber-700 font-bold block text-sm sm:text-base line-clamp-2 min-h-[2.5em] leading-tight">
                                                            {stats.topColleges.filter(c => c.name && c.name !== "Not specified")[2].name}
                                                        </span>
                                                        <span className="text-gray-500 text-xs font-mono mt-1 block">{stats.topColleges.filter(c => c.name && c.name !== "Not specified")[2].count} Students</span>
                                                    </div>
                                                    <div className="w-full bg-gradient-to-t from-amber-900/40 to-amber-700/40 rounded-t-lg relative border-t border-x border-amber-800 h-20 flex items-end justify-center pb-2">
                                                        <span className="text-3xl font-black text-amber-800/20 absolute top-2">3</span>
                                                        <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(180,83,9,0.5)]">3</div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        ) : null}

                                        {/* Remaining List (4th and 5th) */}
                                        <div className="space-y-3 mt-4">
                                            {stats.topColleges
                                                .filter(c => c.name && c.name !== "Not specified")
                                                .slice(stats.topColleges.filter(c => c.name && c.name !== "Not specified").length >= 3 ? 3 : 0, 5) // Skip top 3 if we showed podium, else show all
                                                .map((college, index) => {
                                                    const actualIndex = stats.topColleges.filter(c => c.name && c.name !== "Not specified").length >= 3 ? index + 3 : index;
                                                    return (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            whileInView={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.4 + (index * 0.1) }}
                                                            className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-[#1E1919] border border-gray-700 flex items-center justify-center text-gray-400 font-bold text-sm">
                                                                {actualIndex + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="font-medium text-gray-200 truncate">{college.name}</h5>
                                                            </div>
                                                            <div className="px-3 py-1 rounded-full bg-[#0061FE]/10 text-[#0061FE] text-xs font-bold">
                                                                {college.count}
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-10">
                                        <p>Stats currently unavailable</p>
                                        <p className="text-xs mt-2 opacity-50">Backend: {BACKEND_URL}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Main Hero Component ---
const CodeSapiensHero = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hallOfFameEntries, setHallOfFameEntries] = useState([]);
    const [communityPhotos, setCommunityPhotos] = useState([]);

    // Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            const { data: hof } = await supabase.from('hall_of_fame').select('*').eq('is_active', true).order('created_at', { ascending: false });
            if (hof) setHallOfFameEntries(hof);

            const { data: photos } = await supabase.from('community_photos').select('*').eq('is_active', true).order('order_number', { ascending: true });
            if (photos) setCommunityPhotos(photos);
        };
        fetchData();
    }, []);

    // Scroll Progress
    const { scrollY } = useScroll();

    // Geometric Shape Animation
    const shapeScale = useTransform(scrollY, [0, 600], [1, 0.2]);
    const shapeY = useTransform(scrollY, [0, 600], [0, 200]);
    const shapeOpacity = useTransform(scrollY, [0, 400], [0.8, 0]);

    // Content for Sticky Scroll
    const visionContent = [
        {
            title: "Meetups",
            description: <span className="text-gray-600">Offline events and mini-hackathons where you build and launch projects in minutes. <span className="bg-yellow-300 text-black px-1 rounded-sm">Connect with like-minded peers.</span></span>,
            content: (
                <div className="w-full flex justify-center">
                    <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1759740834/users_cme79i2lk00qls401ar5qxqnc_OadwAYSr5ySuegEn-IMG-20250914-WA0012_gvyeye.jpg" alt="Meetups" className="w-full max-w-md h-auto rounded-lg" />
                </div>
            )
        },
        {
            title: "Hackathons",
            description: <span className="text-gray-600">Fun, minimal hackathons to get hands-on experience and win prizes. Push your limits and <span className="bg-yellow-300 text-black px-1 rounded-sm">build something amazing.</span></span>,
            content: (
                <div className="w-full flex justify-center">
                    <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1759740764/width_800_pmtms3.webp" alt="Hackathons" className="w-full max-w-md h-auto rounded-lg" />
                </div>
            )
        },
        {
            title: "Nurturing Talent",
            description: <span className="text-gray-600">We help you discover your interests and build a unique profile that stands out. <span className="bg-yellow-300 text-black px-1 rounded-sm">Mentorship from seniors and industry experts.</span></span>,
            content: (
                <div className="w-full flex justify-center">
                    <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1759741375/users_cme79i2lk00qls401ar5qxqnc_tYvYry0ll1qJY9Cr-sZlcWmpyKLCEVr3R-WhatsApp25202025-08-10252015.15.02_25567a3d_c0frk5.jpg" alt="Nurturing Talent" className="w-full max-w-md h-auto rounded-lg" />
                </div>
            )
        }
    ];

    const volunteers = [
        { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/2ABMHfqOsrpoL3OV-WhatsApp202025-08-312010.33.52_a8a27bbd_vzcgzq_1_bm8zch.jpg", name: "Keerthana M G", link: "https://in.linkedin.com/in/keerthana-m-g-12ba59256" },
        { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/iAckgTxMcALuPbEx-IMG-20250112-WA0012_1_fwyhoa_oxegdx.jpg", name: "Mahaveer A", link: "https://www.linkedin.com/in/mahaveer1013" },
        { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/4SrLYdwh0tpuLlkt-team_2.a2a0c6917be79e15dc29_wjosq7_ftgm6j.jpg", name: "Justin Benito", link: "https://www.linkedin.com/in/justinbenito" },
        { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/nLDGxnsr6bZkCx0A-team_3.d2fd9099126beb0b86a1_vxhpxo_z3eods.jpg", name: "Koushik ram", link: "https://www.linkedin.com/in/koushik-ram-118495239" },
        { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/Tlgueu6loMYMKJMs-team_1.150894ea4376f6423091_vrf0fr_weljyi.jpg", name: "Athiram R S", link: "https://www.linkedin.com/in/athi-ram-rs" },
        { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/5NmVUZRZI8sRCrZA-1735300455766_h8dhm2_dnully.jpg", name: "Pranav Vikraman", link: "https://www.linkedin.com/in/pranav-vikraman-322020242" },
        { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/JWz1OvtKurqSRsC7-WhatsApp202025-08-312011.22.52_bff7c8bd_mrok7q_b6meyd.jpg", name: "Vignesh R", link: "https://www.linkedin.com/in/vignesh-r-7727582b7" },
        { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122532/3S8YnOu77Rt2wDJD-WhatsApp202025-08-312010.32.42_9b5cee10_puasao_zekkfa.jpg", name: "Anand S", link: "https://codesapiens-management-website.vercel.app" },
        { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/q5tsA3KUOwgSOpIa-team_5.efc764325a5ffbaf1b6e_1_sidv9r_fhxmqv.jpg", name: "Subhaharini P", link: "https://www.linkedin.com/in/subhaharini-p-938568254" },
        { photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/1732031130575_b834gr_1_slc9fw.jpg", name: "Jayasurya R", link: "https://www.linkedin.com/in/jayasurya-r-b37997279/" }
    ];

    return (
        <div className="bg-[#F7F5F2] text-[#1E1919] min-h-screen font-sans overflow-x-hidden selection:bg-[#0061FE] selection:text-white">
            {/* Navigation - Dark Mode for Hero */}
            <nav className="fixed top-0 w-full z-50 bg-[#101010]/90 backdrop-blur-md text-white border-b border-white/10">
                <div className="container mx-auto px-6 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg" alt="CodeSapiens Logo" className="w-10 h-10 rounded-full object-cover" />
                        <span className="text-xl font-bold tracking-tight">CodeSapiens</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 font-medium text-golden-1">
                        <a href="#vision" className="hover:text-[#0061FE] transition-colors">About</a>
                        <a href="#events" className="hover:text-[#0061FE] transition-colors">Highlights</a>
                        <a href="#community" className="hover:text-[#0061FE] transition-colors">Team</a>
                        <button onClick={() => navigate('/auth')} className="hover:text-[#0061FE]">Log in</button>
                        <button onClick={() => navigate('/auth')} className="bg-white text-black px-5 py-2.5 rounded-sm hover:bg-gray-200 transition-colors font-bold">
                            Get Started
                        </button>
                    </div>
                    <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-[#101010] text-white pt-24 px-6 md:hidden">
                    <div className="flex flex-col gap-6 text-golden-2 font-bold">
                        <a href="#vision" onClick={() => setIsMenuOpen(false)}>Vision</a>
                        <a href="#events" onClick={() => setIsMenuOpen(false)}>Events</a>
                        <a href="#community" onClick={() => setIsMenuOpen(false)}>Community</a>
                        <button onClick={() => navigate('/auth')} className="text-left text-[#0061FE]">Log in</button>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative min-h-screen bg-[#101010] text-white flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }}>
                </div>
                <motion.div
                    className="absolute inset-0 md:right-0 md:left-auto md:w-1/2 h-full pointer-events-none z-0 flex items-center justify-center md:justify-end"
                    style={{ scale: shapeScale, y: shapeY, opacity: shapeOpacity }}
                >
                    <svg viewBox="0 0 800 800" className="w-full h-full md:w-full md:h-full opacity-40 md:opacity-60">
                        <motion.path
                            d="M400,200 L600,300 L400,400 L200,300 Z"
                            fill="none" stroke="#0061FE" strokeWidth="1.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                        />
                        <motion.path
                            d="M400,400 L600,500 L400,600 L200,500 Z"
                            fill="none" stroke="#F7F5F2" strokeWidth="1.5"
                            initial={{ pathLength: 0, opacity: 1 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                        />
                        <motion.path
                            d="M400,600 L600,700 L400,800 L200,700 Z"
                            fill="none" stroke="#9B0032" strokeWidth="1.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
                        />
                        <motion.line x1="200" y1="300" x2="200" y2="700" stroke="#333" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1 }} />
                        <motion.line x1="600" y1="300" x2="600" y2="700" stroke="#333" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1 }} />
                        <motion.line x1="400" y1="400" x2="400" y2="600" stroke="#333" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1 }} />
                    </svg>
                </motion.div>

                <div className="container mx-auto px-6 relative z-10 pt-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="max-w-4xl"
                        >
                            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1] tracking-tighter mb-8 font-archivo-black">
                                CodeSapiens<span className="text-[#0061FE]">.</span>
                            </h1>
                            <p className="text-golden-1 text-gray-400 max-w-2xl leading-relaxed mb-10 font-light">
                                The Biggest Student-Run Tech Community in TN.<br />
                                <span className="text-white block mt-2">The only 'Inter-college students community' by the students for the students</span>
                                <span className="text-gray-400 block mt-4 text-golden-1 italic">
                                    We are here to help students build a career in Tech who say, <br />
                                    <span className="text-white not-italic">“Perusa Pannanum, but enna Pannanum Therla”</span> <br />
                                    ("Want to do something big, but don't know what to do").
                                </span>
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <button onClick={() => navigate('/auth')} className="bg-[#0061FE] text-white px-8 py-4 text-golden-1 font-bold rounded-sm hover:bg-[#0050d6] transition-all flex items-center justify-center gap-3 group">
                                    Join Now <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>

                            </div>
                        </motion.div>

                        {/* Right: Dashboard Preview Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="relative mt-12 lg:mt-0"
                        >
                            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-800 group transition-transform duration-500">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#0061FE]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
                                <img
                                    src="https://res.cloudinary.com/dqudvximt/image/upload/v1766304825/preview-4_qcqokz.png"
                                    alt="CodeSapiens Dashboard"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#0061FE] rounded-full blur-[80px] opacity-30"></div>
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#9B0032] rounded-full blur-[80px] opacity-30"></div>

                            {/* Badge Text */}
                            <p className="text-gray-400 text-golden-1 italic text-right mt-4">Designed and built by students, for students.</p>
                        </motion.div>
                    </div>
                </div>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500"
                >
                    <ChevronDown size={32} />
                </motion.div>
            </section>



            {/* Vision Section */}
            <section id="vision" className="bg-[#F7F5F2] text-[#1E1919] py-12 md:py-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-px bg-gradient-to-b from-[#101010] to-[#0061FE]"></div>
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-start">
                        <div className="relative md:sticky md:top-32">
                            <span className="text-[#0061FE] font-bold tracking-widest uppercase text-golden-1 mb-4 block">Our Vision</span>
                            <h2 className="text-golden-2 md:text-golden-3 font-bold mb-8 leading-tight">
                                <span className="text-[#FF5018]">Non-profit</span> community built by <span className="text-[#0061FE]">students</span>, for <span className="text-[#0061FE]">students</span>.
                            </h2>
                            <p className="text-golden-1 text-gray-600 leading-relaxed mb-8">
                                Our vision is to bring students together to collaborate, share, and grow. We envision a platform managed by students, for students, where you can build your career based on your interests.
                            </p>
                            <div className="grid grid-cols-2 gap-8 border-t border-gray-200 pt-8">
                                <div>
                                    <h3 className="text-golden-3 font-bold text-[#FF0000] mb-2">1500+</h3>
                                    <p className="text-golden-1 text-gray-500 uppercase tracking-widest">Active Members</p>
                                </div>
                                <div>
                                    <h3 className="text-golden-3 font-bold text-[#FF0000] mb-2">15+</h3>
                                    <p className="text-golden-1 text-gray-500 uppercase tracking-widest">Events Hosted</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative h-72 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 mt-8 md:mt-0">
                            <video
                                src="https://res.cloudinary.com/dqudvximt/video/upload/v1765443313/66c503d081b2f012369fc5d2_674798e5512046ff64125032_Collaboration_Top-Down_Table-transcode_jgafvj.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>

                        <div className="col-span-2 mt-4">
                            <div className="space-y-8 md:space-y-16">
                                {visionContent.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-center`}
                                    >
                                        <div className="w-full md:w-2/5 text-center md:text-left">
                                            <h3 className="text-golden-2 font-bold mb-3 md:mb-4 text-[#1E1919]">{item.title}</h3>
                                            <p className="text-golden-1 text-gray-600 leading-relaxed">{item.description}</p>
                                        </div>
                                        <div className="w-full md:w-3/5 h-auto flex items-center justify-center">
                                            {item.content}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <StatsSection />

            {/* Events Section */}
            <section id="events" className="py-24 md:py-32 bg-[#1E1919] text-[#F7F5F2]">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
                        <div>
                            <span className="text-[#0061FE] font-bold tracking-widest uppercase text-golden-1 mb-4 block">Events</span>
                            <h2 className="text-golden-2 md:text-golden-3 font-bold text-white mb-4">What's Happening</h2>
                            <p className="text-golden-1 text-gray-400">Join us at our upcoming events.</p>
                        </div>

                    </div>

                    {/* Luma Embed */}
                    <div className="mb-24">
                        <iframe
                            src="https://luma.com/embed/calendar/cal-UvcJfwpSBZdMc61/events"
                            width="100%"
                            height="500"
                            className="rounded-sm border border-gray-800 shadow-2xl bg-white"
                            frameBorder="0"
                            allowFullScreen=""
                            aria-hidden="false"
                            tabIndex="0"
                        ></iframe>
                    </div>

                    {/* Past Events Gallery */}
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-golden-2 font-bold">Community Moments</h3>
                        <div className="flex gap-2">
                            <button className="p-2 rounded-full border border-gray-700 hover:bg-white hover:text-black transition-colors"><ArrowRight className="rotate-180" /></button>
                            <button className="p-2 rounded-full border border-gray-700 hover:bg-white hover:text-black transition-colors"><ArrowRight /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {communityPhotos.slice(0, 6).map((photo, i) => (
                            <motion.div
                                key={photo.id}
                                initial={{ opacity: 0, rotate: i % 2 === 0 ? 3 : -3, scale: 0.9 }}
                                whileInView={{ opacity: 1, rotate: i % 2 === 0 ? 3 : -3, scale: 1 }}
                                whileHover={{
                                    scale: 1.05,
                                    rotate: 0,
                                    zIndex: 50,
                                    transition: { duration: 0.2 }
                                }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="relative cursor-pointer"
                            >
                                {/* Sticky Note Card */}
                                <div className="bg-[#FFFBEA] border border-[#eaddc5] shadow-xl p-4 pb-8 rounded-sm relative">
                                    {/* Tape Effects */}
                                    <div className="absolute -top-3 -left-3 w-16 h-6 bg-gradient-to-b from-amber-200/80 to-amber-300/60 rounded-sm shadow-sm z-20" style={{ transform: 'rotate(-45deg)' }}></div>
                                    <div className="absolute -bottom-3 -right-3 w-16 h-6 bg-gradient-to-b from-amber-200/80 to-amber-300/60 rounded-sm shadow-sm z-20" style={{ transform: 'rotate(-45deg)' }}></div>

                                    {/* Photo */}
                                    <div className="aspect-[4/3] overflow-hidden rounded-sm mb-4 border-4 border-white shadow-inner relative z-10 bg-gray-100">
                                        <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Info - Handwritten Font Style */}
                                    <div className="text-[#1E1919] relative z-10 text-center">
                                        <p className="font-bold text-golden-1 mb-1 text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>{photo.title}</p>
                                        <p className="text-golden-1 text-gray-500 font-medium italic">{photo.description || photo.date}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sponsors Section */}
            <section className="py-20 bg-[#FFFEF9] relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="mb-12">
                        <h2 className="text-5xl font-black mb-2">
                            <span className="text-black">OUR</span>
                            <span className="text-[#0061FE]">sponsors</span>
                        </h2>
                        <p className="text-[#00D9A3] font-medium uppercase tracking-wider text-sm">● BACKING THE FUTURE</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { name: "Make IT Lab", logo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122534/codesapiens_3_md0nvd_ceyry4.png", link: "https://makeitlab.in" },
                            { name: "YuniQ", logo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122532/width_800_pmtms3_cqtzrn.webp", link: "https://yuniq.in" },
                            { name: "Contentstack", logo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122991/1753106111524_wqepam_wam1st.jpg", link: "https://www.contentstack.com" },
                            { name: "Navan AI", logo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122957/users_cme79i2lk00qls401ar5qxqnc_OadwAYSr5ySuegEn-IMG-20250914-WA0012_gvyeye_n1s3az.jpg", link: "https://navan.ai" },
                            { name: "Notion", logo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/users_cme79i2lk00qls401ar5qxqnc_tYvYry0ll1qJY9Cr-sZlcWmpyKLCEVr3R-WhatsApp25202025-08-10252015.15.02_25567a3d_c0frk5_dpl25k.jpg", link: "https://www.notion.so" },
                            { name: "Interview Buddy", logo: "https://res.cloudinary.com/dqudvximt/image/upload/v1759740834/users_cme79i2lk00qls401ar5qxqnc_OadwAYSr5ySuegEn-IMG-20250914-WA0012_gvyeye.jpg", link: "https://interviewbuddy.in" }
                        ].map((sponsor, i) => (
                            <a
                                key={i}
                                href={sponsor.link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group relative overflow-hidden cursor-pointer h-full"
                                >
                                    <div className="absolute top-3 right-3 text-gray-300 group-hover:text-[#0061FE] transition-colors">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                                        </svg>
                                    </div>
                                    <div className="aspect-square flex items-center justify-center mb-4">
                                        <img src={sponsor.logo} alt={sponsor.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <p className="text-center text-sm font-medium text-gray-700 group-hover:text-[#0061FE] transition-colors">{sponsor.name}</p>
                                </motion.div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Community Partners */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="mb-12">
                        <h2 className="text-5xl font-black mb-2">
                            <span className="text-black">COMMUNITY</span>
                            <span className="text-[#0061FE]">partners</span>
                        </h2>
                        <p className="text-[#00D9A3] font-medium uppercase tracking-wider text-sm">● GROWING TOGETHER</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Chennai React.JS", logo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/users_cme79i2lk00qls401ar5qxqnc_tYvYry0ll1qJY9Cr-sZlcWmpyKLCEVr3R-WhatsApp25202025-08-10252015.15.02_25567a3d_c0frk5_dpl25k.jpg", link: "https://www.meetup.com/chennai-react-js/" },
                            { name: "D3 Community", logo: "https://res.cloudinary.com/dqudvximt/image/upload/v1759740834/users_cme79i2lk00qls401ar5qxqnc_OadwAYSr5ySuegEn-IMG-20250914-WA0012_gvyeye.jpg", link: "https://d3community.in" },
                            { name: "Namma Flutter", logo: "https://res.cloudinary.com/dqudvximt/image/upload/v1759740764/width_800_pmtms3.webp", link: "https://www.meetup.com/namma-flutter/" }
                        ].map((partner, i) => (
                            <a
                                key={i}
                                href={partner.link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-[#FAFAFA] rounded-2xl p-10 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer h-full"
                                >
                                    <div className="aspect-square flex items-center justify-center mb-4 bg-white rounded-xl p-6 group-hover:scale-105 transition-transform duration-300">
                                        <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain" />
                                    </div>
                                    <p className="text-center text-base font-semibold text-gray-800 group-hover:text-[#0061FE] transition-colors">{partner.name}</p>
                                </motion.div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Links */}
            <section className="py-20 bg-[#FAFAFA]">
                <div className="container mx-auto px-6">
                    <div className="mb-12">
                        <h2 className="text-5xl font-black mb-2">
                            <span className="text-black">SOCIAL</span>
                            <span className="text-[#0061FE]">links</span>
                        </h2>
                        <p className="text-[#0061FE] font-medium uppercase tracking-wider text-sm">● CONNECT WITH US</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <motion.a
                            href="https://www.linkedin.com/company/codesapiens"
                            target="_blank"
                            rel="noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-[#0077B5] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform shadow-lg group aspect-square"
                        >
                            <Linkedin size={48} className="text-white" />
                            <span className="text-white font-bold text-sm">@codesapiens-community</span>
                        </motion.a>

                        <motion.a
                            href="https://lu.ma/codesapiens"
                            target="_blank"
                            rel="noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-[#FF6B6B] via-[#FFD93D] to-[#6BCF7F] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform shadow-lg aspect-square"
                        >
                            <Calendar size={48} className="text-white" />
                            <span className="text-white font-bold text-sm">Luma Events</span>
                        </motion.a>

                        <motion.a
                            href="https://chat.whatsapp.com/codesapiens"
                            target="_blank"
                            rel="noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#25D366] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform shadow-lg aspect-square"
                        >
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            <span className="text-white font-bold text-sm">WhatsApp</span>
                        </motion.a>

                        <motion.a
                            href="https://www.instagram.com/codesapiens.in"
                            target="_blank"
                            rel="noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform shadow-lg aspect-square"
                        >
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                            <span className="text-white font-bold text-sm">@Codesapiens.in</span>
                        </motion.a>

                        <motion.a
                            href="https://twitter.com/codesapiens_in"
                            target="_blank"
                            rel="noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="bg-[#1DA1F2] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform shadow-lg aspect-square"
                        >
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                            <span className="text-white font-bold text-sm">@codesapiens_in</span>
                        </motion.a>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="bg-[#FFE66D] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform shadow-lg aspect-square border-4 border-dashed border-gray-800"
                        >
                            <Users size={48} className="text-gray-800" />
                            <span className="text-gray-800 font-black text-sm">VOLUNTEERS NEEDED</span>
                        </motion.div>

                        <motion.a
                            href="https://github.com/codesapiensin"
                            target="_blank"
                            rel="noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 }}
                            className="bg-[#181717] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform shadow-lg aspect-square"
                        >
                            <Github size={48} className="text-white" />
                            <span className="text-white font-bold text-sm">@Codesapiens-in</span>
                        </motion.a>

                        <motion.a
                            href="https://www.youtube.com/@CodeSapiens"
                            target="_blank"
                            rel="noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.7 }}
                            className="bg-[#FF0000] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform shadow-lg aspect-square"
                        >
                            <Youtube size={48} className="text-white" />
                            <span className="text-white font-bold text-sm">@Codesapiens</span>
                        </motion.a>
                    </div>
                </div>
            </section>

            {/* Latest Updates Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="mb-12">
                        <h2 className="text-5xl font-black mb-2">
                            <span className="text-black">LATEST</span>
                            <span className="text-[#0061FE]">updates</span>
                        </h2>
                        <p className="text-gray-600 font-medium uppercase tracking-wider text-sm">● WHAT'S NEW</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                                    <Calendar size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold mb-3">Speakers Call Open!</h3>
                                    <p className="text-white/90 mb-4 leading-relaxed">
                                        Got something cool in tech to share? Whether you're a student, dev, or tech enthusiast, come teach what you know!
                                    </p>
                                    <ul className="space-y-2 mb-4">
                                        <li className="flex items-center gap-2">
                                            <span className="text-white/80">✓</span>
                                            <span className="text-sm">Any tech topic</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-white/80">✓</span>
                                            <span className="text-sm">Open to all</span>
                                        </li>
                                    </ul>
                                    <a
                                        href="https://codesapiens.in"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-white text-[#667eea] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        Apply Now
                                        <ArrowRight size={18} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-[#f093fb] to-[#f5576c] rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                                    <Users size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold mb-3">Call for Sponsors & Venue</h3>
                                    <p className="text-white/90 mb-4 leading-relaxed">
                                        We're looking for venues and sponsors for our inter-college events! Help us bring the student community together.
                                    </p>
                                    <p className="text-sm text-white/80 mb-4">
                                        Contact us to support student growth, innovation, and community impact.
                                    </p>
                                    <a
                                        href="mailto:contact@codesapiens.in"
                                        className="inline-flex items-center gap-2 bg-white text-[#f5576c] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        Get in Touch
                                        <ArrowRight size={18} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Hall of Fame */}
            <section className="py-32 bg-[#0061FE] text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-golden-2 md:text-golden-3 font-bold mb-6">Hall of Fame</h2>
                        <p className="text-golden-1 text-white/80 max-w-3xl mx-auto">Celebrating the outstanding achievements of our community members.</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-10">
                        {hallOfFameEntries.map((entry, i) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white text-[#1E1919] p-1 rounded-sm shadow-xl w-full max-w-xs transform hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className="h-64 overflow-hidden bg-gray-200 mb-4">
                                    <img src={entry.image_url} alt={entry.student_name} className="w-full h-full object-cover" />
                                </div>
                                <div className="px-6 pb-8 text-center">
                                    <h3 className="text-golden-2 font-bold mb-2">{entry.student_name}</h3>
                                    <div className="w-12 h-1 bg-[#0061FE] mx-auto mb-4"></div>
                                    <p className="text-gray-600 text-golden-1 italic leading-relaxed">"{entry.description}"</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team / Mafia Gang */}
            <section id="community" className="py-24 md:py-32 bg-[#F7F5F2] text-[#1E1919]">
                <div className="container mx-auto px-6 text-center">
                    <span className="text-[#0061FE] font-bold tracking-widest uppercase text-golden-1 mb-4 block">Our Team</span>
                    <h2 className="text-golden-2 md:text-golden-3 font-bold mb-6">Meet the Core Team</h2>
                    <p className="text-golden-1 text-gray-600 max-w-2xl mx-auto mb-20">
                        A passionate student team building experiences, opportunities, and a stronger tech community for everyone.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-8">
                        {/* Founder */}
                        <div className="col-span-2 md:col-span-1 flex flex-col items-center group">
                            <div className="w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-[#FA5D00] shadow-lg group-hover:scale-105 transition-transform">
                                <img src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/1679197646322_n1svjq_s5w42a.jpg" alt="Thiyaga B" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-bold text-golden-2 mb-1">Thiyaga B</h3>
                            <p className="text-[#FA5D00] text-golden-1 font-bold uppercase tracking-widest mb-3">Founder</p>
                            <a href="https://www.linkedin.com/in/thiyagab/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0061FE] transition-colors"><Linkedin size={20} /></a>
                        </div>
                        {volunteers.map((vol, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex flex-col items-center group"
                            >
                                <div className="w-32 h-32 rounded-full overflow-hidden mb-5 grayscale group-hover:grayscale-0 transition-all duration-500 border-2 border-transparent group-hover:border-[#0061FE] shadow-md">
                                    <img src={vol.photo} alt={vol.name} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-bold text-golden-1 mb-1">{vol.name}</h3>
                                {vol.link && (
                                    <a href={vol.link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0061FE] transition-colors mt-2">
                                        <Linkedin size={18} />
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Big Tagline Section */}
            <section className="py-24 bg-gradient-to-br from-[#0061FE] to-[#0050d6] text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
                <div className="container mx-auto px-6 relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black mb-6 leading-tight"
                    >
                        Built by Students.<br />Powered by Ambition.
                    </motion.h2>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        Join a community where learning meets opportunity, and ambition turns into achievement.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#101010] text-gray-400 py-16 border-t border-gray-900">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                        <div className="max-w-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <img src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg" alt="CodeSapiens Logo" className="w-8 h-8 rounded-full object-cover" />
                                <span className="text-2xl font-bold text-white tracking-tight">CodeSapiens</span>
                            </div>
                            <p className="text-gray-500 leading-relaxed mb-8">
                                Empowering students to build, learn, and grow together. Join the biggest student tech community in Tamil Nadu.
                            </p>
                            <div className="flex gap-6">
                                <a href="https://github.com/Codesapiens-in" className="text-gray-400 hover:text-white transition-colors"><Github size={20} /></a>
                                <a href="https://www.linkedin.com/company/codesapiens-community/posts/" className="text-gray-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
                                <a href="https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi" className="text-gray-400 hover:text-white transition-colors"><Youtube size={20} /></a>
                                <a href="https://discord.gg/codesapiens" className="text-gray-400 hover:text-white transition-colors"><Users size={20} /></a>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-16">
                            <div>
                                <h4 className="text-white font-bold mb-6">Community</h4>
                                <ul className="space-y-4 text-golden-1">
                                    <li><a href="#vision" className="hover:text-[#0061FE] transition-colors">About Us</a></li>
                                    <li><a href="#events" className="hover:text-[#0061FE] transition-colors">Events</a></li>
                                    <li><a href="#community" className="hover:text-[#0061FE] transition-colors">Team</a></li>
                                    <li><a href="#" className="hover:text-[#0061FE] transition-colors">Join Discord</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-golden-1 text-gray-600">
                        <p>© 2025 CodeSapiens Community. All rights reserved.</p>
                        <p>Designed & Built by Students.</p>
                    </div>
                </div>
            </footer>
            <LandingPopup />
        </div>
    );
};

export default CodeSapiensHero;
