import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, animate } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X, Github, Linkedin, Youtube, Users, Calendar, Code, Award, Crown, Rocket, Zap, Globe, Cpu, Handshake, Heart, ArrowUpRight, Instagram, Twitter, MessageCircle, Megaphone, Sparkles } from 'lucide-react';
import { BACKEND_URL } from '../config';
import { authFetch } from '../lib/authFetch';
import LandingPopup from './LandingPopup';

const AnimatedCounter = ({ from, to, suffix, label }) => {
    const nodeRef = useRef(null);
    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;
        const controls = animate(from, to, {
            duration: 2.5,
            ease: "easeOut",
            onUpdate(value) {
                node.textContent = Math.round(value) + suffix + " " + label;
            }
        });
        return () => controls.stop();
    }, [from, to, suffix, label]);
    return <span ref={nodeRef} />;
};

// --- Fallback Data ---
const fallbackStats = {
    totalUsers: 2000,
    totalColleges: 50,
    topColleges: [
        { name: "Rajalakshmi Engineering College", count: 51 },
        { name: "Sri Sairam Engineering College", count: 46 },
        { name: "Panimalar Engineering College", count: 41 },
        { name: "Mazharul Uloom College,Ambur -635 802", count: 11 }
    ]
};

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
                } else {
                    setStats(fallbackStats);
                }
            })
            .catch(err => {
                console.error("Stats fetch error, using fallback:", err);
                setStats(fallbackStats);
            })
            .finally(() => setLoading(false));
    }, []);

    const colleges = stats.topColleges.filter(c => c.name && c.name !== "Not specified");

    return (
        <section className="py-24 bg-[#0a0a0a] text-white relative overflow-hidden">
            {/* Background Gradient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10 font-['Inter']">
                <div className="max-w-6xl xl:max-w-[1200px] mx-auto">
                    <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-12 mb-20 text-center md:text-left">
                        <div className="max-w-xl">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-[#0061FE] font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-4 block"
                            >
                                Impact & Growth
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
                            >
                                By The <span className="text-[#0061FE]">Numbers</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-gray-400 italic font-medium"
                            >
                                "We are growing fast. Join the movement to shape the future of tech."
                            </motion.p>
                        </div>

                        {/* Unified Key Stats - Right Column */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-row items-center justify-center gap-12 md:gap-16"
                        >
                            <div className="flex flex-col items-center md:items-end">
                                <span className="text-5xl md:text-6xl font-black text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    2000+
                                </span>
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Total Members</span>
                            </div>
                            <div className="h-16 w-px bg-white/10 hidden sm:block"></div>
                            <div className="flex flex-col items-center md:items-end">
                                <span className="text-5xl md:text-6xl font-black text-white mb-2 drop-shadow-[0_0_15_rgba(255,255,255,0.1)]">
                                    50+
                                </span>
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Colleges Reached</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Top Colleges Section */}
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="bg-[#111111] backdrop-blur-3xl rounded-[3rem] border border-white/5 p-8 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>

                            <div className="flex flex-col items-center mb-16">
                                <h4 className="text-2xl font-bold text-gray-200 mb-2">Top Active Colleges</h4>
                                <div className="h-1 w-12 bg-[#0061FE] rounded-full"></div>
                            </div>

                            {loading ? (
                                <div className="text-center text-gray-500 py-20 animate-pulse font-medium">Updating community leaderboards...</div>
                            ) : colleges.length > 0 ? (
                                <div className="flex flex-col gap-16">
                                    {/* Podium Staircase (3-2-1 Layout) */}
                                    {colleges.length >= 3 && (
                                        <div className="flex items-end justify-center gap-4 md:gap-8 min-h-[300px]">
                                            {/* 3rd Place - Left */}
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                whileInView={{ opacity: 1, height: "auto" }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: 0.4 }}
                                                className="flex flex-col items-center w-1/3 max-w-[180px]"
                                            >
                                                <div className="text-center mb-6">
                                                    <h5 className="text-gray-400 font-bold text-sm mb-1 leading-tight line-clamp-2 px-1">{colleges[2].name}</h5>
                                                    <p className="text-[#B45309] text-[10px] font-black uppercase tracking-widest">{colleges[2].count} Students</p>
                                                </div>
                                                <div className="w-full bg-gradient-to-t from-[#B45309]/30 to-[#B45309]/10 rounded-t-3xl border-t border-x border-[#B45309]/20 h-28 flex items-center justify-center relative overflow-hidden group/bar transition-all hover:bg-[#B45309]/20">
                                                    <span className="text-4xl font-black text-amber-700/30">3</span>
                                                </div>
                                            </motion.div>

                                            {/* 2nd Place - Center */}
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                whileInView={{ opacity: 1, height: "auto" }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className="flex flex-col items-center w-1/3 max-w-[200px]"
                                            >
                                                <div className="text-center mb-6">
                                                    <h5 className="text-gray-200 font-bold text-base mb-1 leading-tight line-clamp-2 px-1">{colleges[1].name}</h5>
                                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{colleges[1].count} Students</p>
                                                </div>
                                                <div className="w-full bg-gradient-to-t from-gray-500/30 to-gray-500/10 rounded-t-3xl border-t border-x border-gray-500/20 h-44 flex items-center justify-center relative overflow-hidden group/bar transition-all hover:bg-gray-500/20">
                                                    <span className="text-5xl font-black text-gray-400/30">2</span>
                                                </div>
                                            </motion.div>

                                            {/* 1st Place - Right */}
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                whileInView={{ opacity: 1, height: "auto" }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1 }}
                                                className="flex flex-col items-center w-1/3 max-w-[220px]"
                                            >
                                                <div className="text-center mb-6">
                                                    <h5 className="text-yellow-400 font-black text-xl mb-1 leading-tight line-clamp-2 px-1 drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]">{colleges[0].name}</h5>
                                                    <p className="text-yellow-500/80 text-[12px] font-black uppercase tracking-[0.15em]">{colleges[0].count} Students</p>
                                                </div>
                                                <div className="w-full bg-gradient-to-t from-yellow-600/40 to-yellow-400/20 rounded-t-3xl border-t border-x border-yellow-500/40 h-64 flex flex-col items-center justify-center relative overflow-hidden group/bar shadow-[0_-10px_40px_rgba(250,204,21,0.1)] transition-all hover:from-yellow-600/50">
                                                    <div className="absolute inset-0 bg-yellow-400/5 animate-pulse"></div>
                                                    <Crown className="text-yellow-400 mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" size={40} />
                                                    <span className="text-7xl font-black text-yellow-400/20">1</span>
                                                </div>
                                            </motion.div>
                                        </div>
                                    )}

                                    {/* Other Rankings Toggle/List */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                        {colleges.slice(colleges.length >= 3 ? 3 : 0, 8).map((college, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group/item"
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-gray-500 font-black text-lg border border-white/5 group-hover/item:text-[#0061FE] group-hover/item:border-[#0061FE]/30 transition-all">
                                                    {idx + (colleges.length >= 3 ? 4 : 1)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-gray-200 font-bold truncate group-hover/item:text-white transition-colors">{college.name}</h5>
                                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-0.5">{college.count} Members</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-10">
                                    <p>Stats will update soon</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Sponsor Section with Clean Grid Style ---
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
        <section className="py-24 bg-[#f8faff] relative overflow-hidden font-['Inter']">
            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[#0061FE] font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-4 block"
                    >
                        Our Partners
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-[#1E1919] tracking-tight"
                    >
                        Backed by <span className="text-[#0061FE]">Industry Leaders</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
                    {sponsors.map((sponsor, idx) => (
                        <motion.a
                            key={idx}
                            href={sponsor.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -5, boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)" }}
                            className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 border-t-[3px] border-t-[#0061FE] p-6 h-32 md:h-40 flex items-center justify-center group transition-all duration-300 overflow-hidden"
                        >
                            <motion.img
                                src={sponsor.image}
                                alt={sponsor.name}
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className="max-w-full max-h-full object-contain transition-all duration-500"
                            />
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
        <section className="py-24 bg-gray-50 relative overflow-hidden font-['Inter']">
            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                <div className="text-center mb-16">
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight leading-none ">Community</h2>
                            <h2 className="text-4xl md:text-6xl font-script text-[#0061FE] font-black leading-none">Partners</h2>
                        </div>
                        <div className="h-1.5 w-24 bg-[#0061FE] rounded-full mt-4"></div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-8 mt-6">
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-black text-gray-600 uppercase tracking-widest">GROWING TOGETHER</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    {partners.map((partner, idx) => (
                        <motion.a
                            key={idx}
                            href={partner.link}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-[2.5rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border-2 border-gray-100 flex flex-col hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-blue-100 transition-all duration-500 group relative"
                        >
                            {/* Inner Logo Container */}
                            <div className="bg-[#f5f9ff] rounded-[2rem] p-10 h-64 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:bg-[#ebf5ff]">
                                <img
                                    src={partner.image}
                                    alt="Community Partner"
                                    className="max-w-[75%] max-h-[75%] object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500 z-10"
                                />
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Social Media Bento Grid ---
const SocialMediaSection = () => {
    const socials = [
        { name: "LinkedIn", icon: <Linkedin size={24} />, link: "https://linkedin.com/company/codesapiens-community", color: "bg-[#0077b5]", delay: 0 },
        { name: "Instagram", icon: <Instagram size={24} />, link: "https://instagram.com/codesapiens", color: "bg-[#E4405F]", delay: 0.1 },
        { name: "Twitter", icon: <Twitter size={24} />, link: "https://twitter.com/codesapiens", color: "bg-[#1DA1F2]", delay: 0.2 },
        { name: "GitHub", icon: <Github size={24} />, link: "https://github.com/Codesapiens-in", color: "bg-[#333]", delay: 0.3 },
        { name: "YouTube", icon: <Youtube size={24} />, link: "https://youtube.com/@codesapiens-in", color: "bg-[#FF0000]", delay: 0.4 },
        { name: "WhatsApp", icon: <MessageCircle size={24} />, link: "https://chat.whatsapp.com/LLtoddmQx5rIRNb8WE6rqC", color: "bg-[#25D366]", delay: 0.5 },
    ];

    return (
        <section className="py-32 bg-white relative overflow-hidden font-['Inter']">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-600 rounded-full animate-[spin_60s_linear_infinite]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-blue-400 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                <div className="text-center mb-24">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight leading-none ">Social</h2>
                            <h2 className="text-4xl md:text-6xl font-script text-[#0061FE] font-black leading-none">Links</h2>
                        </div>
                        <div className="h-1.5 w-24 bg-[#0061FE] rounded-full mt-4"></div>
                    </div>
                </div>

                {/* Mobile: Simple icon grid */}
                <div className="md:hidden flex flex-col items-center gap-8 w-full">
                    {/* Mini Globe */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                    >
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#0061FE] via-[#3B82F6] to-[#60A5FA] flex items-center justify-center shadow-[0_0_60px_rgba(0,97,254,0.4)] relative overflow-hidden border-4 border-white/20">
                            <motion.div
                                animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.1, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#fff_0%,transparent_70%)]"
                            />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="relative z-10 text-white"
                            >
                                <Globe size={52} strokeWidth={1} />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* 2×3 Social Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                        {socials.map((social, idx) => (
                            <motion.a
                                key={idx}
                                href={social.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.07, duration: 0.5 }}
                                className="flex items-center gap-3 pl-2 pr-4 py-2.5 rounded-full bg-white border-2 border-gray-100 shadow-sm hover:border-[#0061FE] hover:shadow-md transition-all duration-300 group"
                            >
                                <div className={`${social.color} w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm transition-transform duration-500 group-hover:rotate-[360deg] flex-shrink-0`}>
                                    {React.cloneElement(social.icon, { size: 16 })}
                                </div>
                                <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.08em] truncate">
                                    {social.name}
                                </span>
                            </motion.a>
                        ))}
                    </div>
                </div>

                {/* Desktop: Orbit layout */}
                <div className="hidden md:flex relative justify-center items-center h-[500px] w-full max-w-5xl mx-auto">
                    {/* Decorative Orbit Rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[480px] h-[480px] border border-blue-50 rounded-full animate-[spin_60s_linear_infinite] opacity-50"></div>
                        <div className="w-[320px] h-[320px] border border-blue-50/50 rounded-full animate-[spin_40s_linear_infinite_reverse] opacity-50"></div>
                    </div>

                    {/* Central Globe */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                        className="relative z-20"
                    >
                        <div className="w-72 h-72 rounded-full bg-gradient-to-br from-[#0061FE] via-[#3B82F6] to-[#60A5FA] flex items-center justify-center shadow-[0_0_100px_rgba(0,97,254,0.4)] relative group cursor-pointer overflow-hidden border-8 border-white/20">
                            <motion.div
                                animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.1, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#fff_0%,transparent_70%)]"
                            />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="relative z-10 text-white drop-shadow-2xl"
                            >
                                <Globe size={100} strokeWidth={1} />
                            </motion.div>
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent h-1/2 w-full animate-[scan_3s_linear_infinite]"></div>
                        </div>
                    </motion.div>

                    {/* Orbiting Social Badges */}
                    {socials.map((social, idx) => {
                        const angle = (idx * (360 / socials.length)) * (Math.PI / 180);
                        const radiusX = 280;
                        const radiusY = 220;
                        return (
                            <motion.a
                                key={idx}
                                href={social.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0 }}
                                whileInView={{
                                    opacity: 1,
                                    x: Math.cos(angle) * radiusX,
                                    y: Math.sin(angle) * radiusY
                                }}
                                whileHover={{ scale: 1.05, zIndex: 30 }}
                                transition={{ delay: 0.05 * idx, duration: 1, type: "spring" }}
                                className="absolute z-10 pl-2 pr-6 py-2 rounded-full bg-white border-2 border-gray-100 shadow-[0_10px_25px_rgba(0,0,0,0.04)] flex items-center gap-4 group hover:border-[#0061FE] hover:shadow-[0_20px_40px_rgba(0,97,254,0.12)] transition-all duration-500"
                            >
                                <div className={`${social.color} w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-transform duration-500 group-hover:rotate-[360deg]`}>
                                    {React.cloneElement(social.icon, { size: 18 })}
                                </div>
                                <span className="text-[11px] font-black text-gray-800 uppercase tracking-[0.1em]">
                                    {social.name}
                                </span>
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};


// --- Notice Section (Call for Speakers/Sponsors) ---
// --- Notice Section (Call for Speakers/Sponsors) ---


// --- Main Hero Component ---
const CodeSapiensHero = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [communityPhotos, setCommunityPhotos] = useState([]);

    // Data Fetching
    useEffect(() => {
        const fetchData = async () => {
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
            <nav className="fixed top-0 w-full z-50 bg-[#101010]/90 backdrop-blur-md text-white border-b border-white/10 font-['Inter']">
                <div className="container mx-auto px-6 py-5 flex justify-between items-center relative">

                    {/* Desktop Left Links */}
                    <div className="hidden md:flex flex-1 items-center justify-end gap-10 lg:gap-14 font-medium text-golden-1 pr-14">
                        <a href="#vision" className="hover:text-[#0061FE] transition-colors">Vision</a>
                        <a href="/programs" className="hover:text-[#0061FE] transition-colors">Programs</a>
                        <a href="/meetups" className="hover:text-[#0061FE] transition-colors">Meetups</a>
                    </div>

                    {/* Centered Logo - Contained inside the nav block now instead of protruding entirely */}
                    <div className="flex-shrink-0 flex items-center justify-center relative z-[60]">
                        <img
                            src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg"
                            alt="CodeSapiens Logo"
                            className="w-12 h-12 md:w-14 md:h-14 lg:w-14 lg:h-14 rounded-full object-cover border border-white/20 shadow-lg hover:scale-105 transition-transform duration-300"
                        />
                    </div>

                    {/* Desktop Right Links */}
                    <div className="hidden md:flex flex-1 items-center justify-start gap-10 lg:gap-14 font-medium text-golden-1 pl-14">
                        <a href="#events" className="hover:text-[#0061FE] transition-colors">Events</a>
                        <a href="#community" className="hover:text-[#0061FE] transition-colors">Community</a>
                        <button onClick={() => navigate('/auth')} className="hover:text-[#0061FE]">Log in</button>
                    </div>

                    {/* Mobile Menu Button - positioned absolutely on mobile to keep logo centered natively */}
                    <div className="md:hidden absolute right-6 z-[60]">
                        <button className="text-white bg-white/5 p-2 rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-[#101010] text-white pt-24 px-6 md:hidden">
                    <div className="flex flex-col gap-6 text-golden-2 font-bold">
                        <a href="#vision" onClick={() => setIsMenuOpen(false)}>Vision</a>
                        <a href="/programs" onClick={() => setIsMenuOpen(false)}>Programs</a>
                        <a href="/meetups" onClick={() => setIsMenuOpen(false)}>Meetups</a>
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
                    <motion.svg
                        viewBox="0 0 800 800"
                        className="w-full h-full md:w-full md:h-full opacity-40 md:opacity-60"
                        animate={{ y: [-20, 20, -20] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <motion.path
                            d="M400,200 L600,300 L400,400 L200,300 Z"
                            fill="none" stroke="#0061FE" strokeWidth="1.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        />
                        <motion.path
                            d="M400,400 L600,500 L400,600 L200,500 Z"
                            fill="none" stroke="#F7F5F2" strokeWidth="1.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        />
                        <motion.path
                            d="M400,600 L600,700 L400,800 L200,700 Z"
                            fill="none" stroke="#9B0032" strokeWidth="1.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        />
                        <motion.line x1="200" y1="300" x2="200" y2="700" stroke="#333" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
                        <motion.line x1="600" y1="300" x2="600" y2="700" stroke="#333" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
                        <motion.line x1="400" y1="400" x2="400" y2="600" stroke="#333" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
                    </motion.svg>
                </motion.div>

                <div className="container mx-auto px-6 relative z-10 flex flex-col items-center justify-center min-h-[90vh] pt-10">

                    {/* Top Badges (New unified pill style with animated counters) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center justify-center mb-6 md:mb-8"
                    >
                        <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.05)] cursor-default transition-transform hover:scale-105 duration-300">
                            <div className="pl-3 pr-2 py-1.5 flex items-center gap-2 text-gray-300 font-['Inter'] font-medium text-sm">
                                <Users size={14} className="text-[#0061FE]" />
                                <AnimatedCounter from={0} to={2000} suffix="+" label="Members" />
                            </div>
                            <div className="bg-[#0061FE]/20 text-[#0061FE] px-5 py-1.5 rounded-full font-['Inter'] font-semibold text-sm flex items-center gap-2">
                                <Rocket size={14} />
                                <AnimatedCounter from={0} to={15} suffix="+" label="Events" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="text-center max-w-5xl w-full mx-auto relative z-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="relative inline-block"
                        >
                            <h1 className="text-[10vw] md:text-[8rem] lg:text-[140px] font-black leading-none tracking-normal md:tracking-tight mb-2 uppercase text-white drop-shadow-2xl" style={{ fontFamily: "'Viva Sans', Impact, sans-serif" }}>
                                CODESAPIENS<span className="text-[#0061FE]">.</span>
                            </h1>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="text-gray-300 text-lg md:text-2xl lg:text-3xl font-['Inter'] italic font-medium max-w-3xl mx-auto leading-relaxed mb-10 drop-shadow-md"
                        >
                            Tamil Nadu's largest student-run tech community<br className="hidden md:block" /> built by students, for students.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="flex justify-center mt-4"
                        >
                            <button onClick={() => navigate('/auth')} className="bg-[#0061FE] text-white px-8 py-4 text-lg font-['Inter'] font-bold rounded-xl hover:bg-[#0050d6] transition-all duration-300 flex items-center justify-center gap-3 group shadow-[0_0_30px_rgba(0,97,254,0.3)] hover:shadow-[0_0_40px_rgba(0,97,254,0.5)] active:scale-95">
                                Join now <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* Infinite Scrolling Marquee */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden bg-black/40 border-t border-white/5 py-4 backdrop-blur-sm z-20">
                    <div className="flex whitespace-nowrap overflow-hidden items-center group">
                        <motion.div
                            className="flex items-center gap-6"
                            animate={{ x: [0, -1000] }}
                            transition={{
                                repeat: Infinity,
                                ease: "linear",
                                duration: 20
                            }}
                        >
                            {/* Duplicate the text to create a seamless loop */}
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="flex items-center gap-12 text-2xl md:text-3xl font-['Inter'] italic font-bold text-white/40 uppercase tracking-[0.2em] px-6">
                                    <span className="hover:text-white transition-colors cursor-default">EXPLORE</span>
                                    <Rocket size={20} className="text-[#0061FE]" />
                                    <span className="hover:text-white transition-colors cursor-default">EVOLVE</span>
                                    <Rocket size={20} className="text-[#0061FE]" />
                                    <span className="hover:text-white transition-colors cursor-default">ENGINEER</span>
                                    <Rocket size={20} className="text-[#0061FE]" />
                                </div>
                            ))}
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
            <section id="vision" className="bg-[#FAF9F6] py-16 md:py-24 relative overflow-hidden text-left">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl xl:max-w-[1200px] mx-auto bg-[#1C1C1C] rounded-[2rem] p-3 md:p-5 shadow-2xl flex flex-col md:flex-row gap-6 md:gap-10 items-stretch border border-black/10">

                        {/* Image Left */}
                        <div className="w-full md:w-[45%] rounded-[1.5rem] overflow-hidden relative min-h-[350px] md:min-h-full">
                            <img
                                src="https://res.cloudinary.com/dqudvximt/image/upload/v1767535873/1760365837828_vyrmco.jpg"
                                alt="CodeSapiens Vision"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Subtle dark gradient to tie in the dark aesthetic */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/90 via-black/10 to-transparent"></div>
                        </div>

                        {/* Content Right */}
                        <div className="w-full md:w-[55%] py-4 md:py-8 pr-4 md:pr-10 flex flex-col justify-center">
                            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white tracking-tight font-['Inter']">
                                Our Vision
                            </h2>

                            <div className="space-y-6 text-gray-400 font-['Inter'] text-base leading-relaxed">
                                <p className="font-medium text-gray-200 text-lg leading-snug border-l-2 border-[#0061FE] pl-4">
                                    The only 'Inter-college students community' by the students for the students.
                                </p>

                                <p className="text-[1.05rem]">
                                    Our vision is to bring students together to collaborate, share, and grow. We envision a platform managed by students, for students, where you can build your career based on your interests.
                                </p>

                                <div className="bg-[#262626] p-5 md:p-6 rounded-2xl border border-white/5 relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#44A05D] rounded-l-2xl"></div>
                                    <p className="text-gray-300 mb-2 font-medium">
                                        We are here to help students build a career in Tech who say,
                                    </p>
                                    <p className="font-bold text-white text-lg md:text-xl mb-1 leading-tight">
                                        “Perusa Pannanum, but enna Pannanum Therla”
                                    </p>
                                    <p className="text-sm text-gray-500 font-medium mt-2">
                                        ("Want to do something big, but don't know what to do")
                                    </p>
                                </div>
                            </div>

                            <button onClick={() => navigate('/auth')} className="mt-8 self-start bg-[#4B9C58] hover:bg-[#3f8349] text-white px-8 py-3.5 text-sm md:text-base font-bold rounded-xl transition-all duration-300 flex items-center gap-2 transform active:scale-95 shadow-lg">
                                Join the Community <ArrowRight size={18} />
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            {/* Events Section - Community Moments */}
            <section id="events" className="py-24 md:py-32 bg-white text-[#1E1919] font-['Inter']">
                <div className="container mx-auto px-6 max-w-7xl">

                    {/* Past Events Gallery */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mx-auto max-w-6xl xl:max-w-[1200px] mb-12">
                        <h3 className="text-3xl md:text-4xl font-black text-black tracking-tight mb-4 md:mb-0">Community Moments</h3>
                        <div className="flex gap-2">
                            <button className="p-3 rounded-full border border-gray-300 hover:bg-black hover:text-white transition-colors"><ArrowRight className="rotate-180" size={20} /></button>
                            <button className="p-3 rounded-full border border-gray-300 hover:bg-black hover:text-white transition-colors"><ArrowRight size={20} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[250px] max-w-6xl xl:max-w-[1200px] mx-auto">
                        {[
                            {
                                id: 1,
                                title: "November 2025 Meetup",
                                image_url: "https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767537704/community-photos/halloffame-1767537703902-874266878.jpg",
                                className: "md:col-span-2 md:row-span-2"
                            },
                            {
                                id: 2,
                                title: "October 2025 Meetup",
                                image_url: "https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767537734/community-photos/halloffame-1767537734721-286693940.jpg",
                                className: "md:col-span-1 md:row-span-1"
                            },
                            {
                                id: 3,
                                title: "September 2025 Meetup",
                                image_url: "https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767537671/community-photos/halloffame-1767537671015-511535149.jpg",
                                className: "md:col-span-1 md:row-span-1"
                            },
                            {
                                id: 4,
                                title: "August 2025 Meetup",
                                image_url: "https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767537766/community-photos/halloffame-1767537766115-282602891.jpg",
                                className: "md:col-span-2 md:row-span-1"
                            },
                            {
                                id: 5,
                                title: "May 2024 Meetup",
                                image_url: "https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767538223/community-photos/halloffame-1767538223035-53933069.jpg",
                                className: "md:col-span-2 md:row-span-1"
                            },
                            {
                                id: 6,
                                title: "June 2024 Meetup",
                                image_url: "https://res.cloudinary.com/dhtyd2r5f/image/upload/v1767538197/community-photos/halloffame-1767538197379-764134620.jpg",
                                className: "md:col-span-2 md:row-span-1"
                            }
                        ].map((photo, i) => (
                            <motion.div
                                key={photo.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 0.98 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className={`group relative overflow-hidden rounded-2xl bg-[#EFEFEF] ${photo.className} min-h-[250px] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer`}
                            >
                                {/* Photo */}
                                <img
                                    src={photo.image_url}
                                    alt={photo.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Content Overlay (Bottom Left Pill Badge) */}
                                <div className="absolute bottom-5 left-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg inline-block">
                                        <h4 className="text-white font-bold text-sm md:text-base tracking-tight leading-none m-0">{photo.title}</h4>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            {/* Stats Section */}
            <StatsSection />

            {/* Sponsor Section */}
            {/* Sponsor Section */}
            <SponsorSection />
            <CommunityPartners />
            <SocialMediaSection />



            {/* Team / Mafia Gang */}
            <section id="community" className="py-24 bg-gradient-to-b from-[#101010] to-[#1E1E1E] text-white overflow-hidden relative font-['Inter']">
                {/* Subtle Background Glows */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-blue-600/30 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-emerald-600/20 blur-[120px] rounded-full"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                    <div className="text-center mb-16">


                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black mb-8 tracking-tighter"
                        >
                            Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061FE] to-[#00C6F7]">Mafia Gang</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto font-medium"
                        >
                            A diverse group of passionate students building Tamil Nadu's biggest student community.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                        {/* Founder Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10 }}
                            className="group relative h-[450px] rounded-[2.5rem] overflow-hidden bg-[#1a1a1a] border border-white/10 shadow-2xl transition-all duration-500"
                        >
                            <img
                                src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/1679197646322_n1svjq_s5w42a.jpg"
                                alt="Thiyaga B"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                            <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-start translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="text-2xl font-black mb-1 group-hover:text-blue-400 transition-colors">Thiyaga B</h3>
                                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Founder & CEO</p>

                                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                    <a href="https://www.linkedin.com/in/thiyagab/" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-[#0061FE] hover:scale-110 transition-all">
                                        <Linkedin size={18} />
                                    </a>

                                    <a href="#" className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-[#1DA1F2] hover:scale-110 transition-all">
                                        <Twitter size={18} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        {/* Volunteers Cards */}
                        {volunteers.map((vol, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -10 }}
                                className="group relative h-[450px] rounded-[2.5rem] overflow-hidden bg-[#1a1a1a] border border-white/5 shadow-xl transition-all duration-500"
                            >
                                <img
                                    src={vol.photo}
                                    alt={vol.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-70 group-hover:opacity-85 transition-opacity"></div>

                                <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-start translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-xl font-bold mb-1 truncate w-full group-hover:text-blue-400 transition-colors">{vol.name}</h3>
                                    <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.15em] mb-4">Core Member</p>

                                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                        {vol.link && (
                                            <a href={vol.link} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-[#0061FE] hover:scale-110 transition-all">
                                                <Linkedin size={16} />
                                            </a>
                                        )}

                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tagline Section */}
            <section className="py-20 bg-black flex items-center justify-center font-['Inter']">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-golden-2 md:text-golden-3 font-black text-white tracking-tighter uppercase leading-none">
                        Building Community <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061FE] to-[#00C6F7]">Since 2023</span>
                    </h2>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#101010] text-gray-400 py-16 border-t border-gray-900 font-['Inter']">
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
