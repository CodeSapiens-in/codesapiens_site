import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X, Github, Linkedin, Youtube, Users, Calendar, Code, Award, Crown, Rocket, Zap, Globe, Cpu, Handshake, Heart, ArrowUpRight, Instagram, Twitter, MessageCircle, Megaphone, Sparkles } from 'lucide-react';
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
        <section className="py-12 bg-gradient-to-br from-[#101010] via-[#050505] to-[#001a45] text-white relative overflow-hidden">
            {/* Background Elements */}

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="mb-8 text-center">
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
                            className="bg-black/40 backdrop-blur-3xl p-4 md:p-6 rounded-2xl border border-white/10 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden group"
                        >
                            {/* Specular Highlight */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <h3 className="text-golden-2 md:text-golden-3 font-black text-white mb-2 drop-shadow-lg">
                                {/* {stats.totalUsers > 0 ? stats.totalUsers : "1500+"} */}
                                2000+
                            </h3>
                            <p className="text-gray-400 font-medium uppercase tracking-normal md:tracking-wider text-golden-1">Total Members</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-black/40 backdrop-blur-3xl p-4 md:p-6 rounded-2xl border border-white/10 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden group"
                        >
                            {/* Specular Highlight */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <h3 className="text-golden-2 md:text-golden-3 font-black text-white mb-2 drop-shadow-lg">
                                {/* {stats.totalColleges > 0 ? stats.totalColleges : "50+"} */}
                                50+
                            </h3>
                            <p className="text-gray-400 font-medium uppercase tracking-normal md:tracking-wider text-golden-1">Colleges Reached</p>
                        </motion.div>
                    </div>

                    {/* Right: Top Colleges Chart */}
                    <div className="col-span-1 h-full w-full overflow-hidden">
                        <div className="bg-black/40 backdrop-blur-3xl p-6 rounded-2xl border border-white/10 h-full flex flex-col relative overflow-hidden group shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                            {/* Specular Highlight */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                            <h4 className="text-golden-2 font-bold mb-4 flex items-center gap-3">
                                Top Active Colleges
                            </h4>

                            <div className="flex-1 flex flex-col justify-center">
                                {loading ? (
                                    <div className="text-center text-gray-500 py-10 animate-pulse">Loading leaderboards...</div>
                                ) : stats.topColleges.filter(c => c.name && c.name !== "Not specified").length > 0 ? (
                                    <div className="space-y-8">
                                        {/* Top 3 Podium - Only show if we have enough data, else fallback to list */}
                                        {stats.topColleges.filter(c => c.name && c.name !== "Not specified").length >= 3 ? (
                                            <div className="flex items-end justify-center gap-2 md:gap-4 mb-4 min-h-[140px]">
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
                                        <p>Stats will update soon</p>
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
        <section className="py-12 bg-[#FFFFF0] relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-left mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight leading-none">OUR</h2>
                        <h2 className="text-4xl md:text-6xl font-script text-[#2563ea] font-bold italic leading-none pt-2">sponsors</h2>
                        <div className="h-px bg-gray-200 flex-1 ml-4 self-center mt-2"></div>
                    </div>
                    {/* <span className="text-[#0061FE] font-bold tracking-widest uppercase text-golden-1 mb-2 block">Our Partners</span> */}
                    <div className="flex items-center gap-2 mb-8">
                        <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">BACKING THE FUTURE</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full mx-auto">
                    {sponsors.map((sponsor, idx) => (
                        <a
                            key={idx}
                            href={sponsor.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group bg-white border border-gray-100 rounded-3xl p-4 md:p-6 w-full aspect-square flex flex-col justify-between hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block"
                        >
                            {/* Top Right Arrow */}
                            <div className="self-end p-2 bg-gray-50 rounded-full text-gray-400 group-hover:bg-[#0061FE] group-hover:text-white transition-colors">
                                <ArrowUpRight size={18} />
                            </div>

                            {/* Centered Image */}
                            <div className="flex-1 flex items-center justify-center p-2">
                                <img
                                    src={sponsor.image}
                                    alt={sponsor.name}
                                    className="max-w-[85%] max-h-[85%] object-contain drop-shadow-sm transition-all duration-500"
                                />
                            </div>

                            {/* Name Badge */}
                            <div className="self-start px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg">
                                <span className="font-bold text-gray-800 text-xs">{sponsor.name}</span>
                            </div>
                        </a>
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
        <section className="py-12 bg-white relative overflow-hidden border-t border-gray-100">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-left mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-3xl md:text-6xl font-black text-black tracking-tight leading-none">COMMUNITY</h2>
                        <h2 className="text-3xl md:text-6xl font-script text-[#2563ea] font-bold italic leading-none pt-2">partners</h2>
                        <div className="h-px bg-gray-200 flex-1 ml-4 self-center mt-2"></div>
                    </div>
                    <div className="flex items-center gap-2 mb-8">
                        <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">GROWING TOGETHER</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full mx-auto">
                    {partners.map((partner, idx) => (
                        <div
                            key={idx}
                            className="relative group bg-white border border-gray-100 rounded-3xl p-4 md:p-6 w-full aspect-square flex flex-col justify-center items-center hover:shadow-lg transition-all duration-300"
                        >
                            {/* Centered Image */}
                            <div className="flex-1 flex items-center justify-center p-2 w-full">
                                <img
                                    src={partner.image}
                                    alt="Community Partner"
                                    className="max-w-[85%] max-h-[85%] object-contain drop-shadow-sm"
                                />
                            </div>
                        </div>
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
        <section className="py-20 bg-[#FAF9F6] relative overflow-hidden text-left">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-left mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight leading-none">SOCIAL</h2>
                        <h2 className="text-4xl md:text-6xl font-script text-[#2563ea] font-bold italic leading-none pt-2">links</h2>
                        <div className="h-px bg-gray-200 flex-1 ml-4 self-center mt-2"></div>
                    </div>
                    <div className="flex items-center gap-2 mb-8">
                        <Globe size={16} className="text-[#0061FE] animate-pulse" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">CONNECT WITH US</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4 md:gap-6 w-full mx-auto">
                    {socials.map((social, idx) => (
                        <motion.a
                            key={idx}
                            href={social.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`${social.span} ${social.color} ${social.textColor} ${social.border} rounded-3xl p-6 relative overflow-hidden group shadow-sm hover:shadow-xl flex flex-col justify-between transition-all`}
                            style={social.backgroundImage ? { backgroundImage: social.color.includes('gradient') ? social.color : undefined } : {}}
                        >
                            {/* Custom Background Image if any */}
                            {social.backgroundImage && (
                                <div className="absolute inset-0" style={{ background: social.backgroundImage }}></div>
                            )}

                            {/* Top Right Arrow */}
                            <div className={`absolute top-4 right-4 p-2 rounded-full ${social.textColor === 'text-white' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                <ArrowUpRight size={16} />
                            </div>

                            {/* Content */}
                            {social.customContent ? (
                                social.customContent
                            ) : (
                                <>
                                    <div className="mb-auto">
                                        {social.customIcon || social.icon}
                                    </div>
                                    <div className="z-10 mt-auto">
                                        {social.badge && (
                                            <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${social.textColor === 'text-white' ? 'bg-white text-black' : 'bg-gray-100 text-gray-800'}`}>
                                                {social.badge}
                                            </span>
                                        )}
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


// --- Notice Section (Call for Speakers/Sponsors) ---
// --- Notice Section (Call for Speakers/Sponsors) ---
const NoticeSection = () => {
    return (
        <section className="py-4 bg-[#FFF8DC] relative overflow-hidden text-left">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-8 items-center max-w-4xl mx-auto">
                    {/* Title (Left Side on Desktop) */}
                    <div className="flex items-center gap-2 shrink-0">
                        <h2 className="text-xl md:text-2xl font-black text-black tracking-tight leading-none">LATEST</h2>
                        <h2 className="text-xl md:text-2xl font-script text-[#2563ea] font-bold italic leading-none pt-1">updates</h2>
                        <div className="h-px bg-gray-200 w-12 self-center mt-1 md:hidden"></div>
                    </div>

                    {/* Images Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                        {/* Call for Speakers */}
                        <div className="relative group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            <img
                                src="https://res.cloudinary.com/dqudvximt/image/upload/v1767877162/users_cme79i2lk00qls401ar5qxqnc_N0bIjmMP0Ybxoznz-1753684368888_jda3us.jpg"
                                alt="Call for Speakers"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        {/* Sponsors & Venue */}
                        <div className="relative group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            <img
                                src="https://res.cloudinary.com/dqudvximt/image/upload/v1767877178/users_cme79i2lk00qls401ar5qxqnc_KB4hFvAzhyqJF0xf-3a61cb74-01c9-4880-be04-a4036f32c4f9_t64kt9.jpg"
                                alt="Call for Sponsors and Venue"
                                className="w-full h-auto object-cover"
                            />
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

    // Fallback community photos when Supabase credentials are missing
    const fallbackCommunityPhotos = [
        { id: 'fb-1', title: 'November 2025 Meetup', description: 'Monthly community gathering', image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=450&fit=crop', order_number: 1 },
        { id: 'fb-2', title: 'October 2025 Meetup', description: 'Tech talks & networking', image_url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=450&fit=crop', order_number: 2 },
        { id: 'fb-3', title: 'September 2025 Meetup', description: 'Workshop & collaboration', image_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=450&fit=crop', order_number: 3 },
        { id: 'fb-4', title: 'August 2025 Meetup', description: 'Hackathon kickoff', image_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=450&fit=crop', order_number: 4 },
        { id: 'fb-5', title: 'May 2025 Meetup', description: 'Community celebration', image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=450&fit=crop', order_number: 5 },
        { id: 'fb-6', title: 'June 2024 Meetup', description: 'First anniversary meetup', image_url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=450&fit=crop', order_number: 6 },
    ];

    // Fallback hall of fame entries when Supabase credentials are missing
    const fallbackHallOfFame = [
        { id: 'hof-1', name: 'Sample Achiever', achievement: 'Outstanding contributor', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', is_active: true },
    ];

    const [communityPhotos, setCommunityPhotos] = useState([]);
    const [hallOfFameEntries, setHallOfFameEntries] = useState([]);

    // Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            const { data: hof } = await supabase.from('hall_of_fame').select('*').eq('is_active', true).order('created_at', { ascending: false });
            setHallOfFameEntries(hof && hof.length > 0 ? hof : fallbackHallOfFame);

            const { data: photos } = await supabase.from('community_photos').select('*').eq('is_active', true).order('order_number', { ascending: true });
            setCommunityPhotos(photos && photos.length > 0 ? photos : fallbackCommunityPhotos);
        };
        fetchData();
    }, []);

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

    // Mouse-tracking aurora for hero
    const heroRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });
    const auroraX = useTransform(smoothX, [0, 1], ['-20%', '20%']);
    const auroraY = useTransform(smoothY, [0, 1], ['-15%', '15%']);

    const handleMouseMove = useCallback((e) => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
    }, [mouseX, mouseY]);

    // Stagger animation variant for words
    const wordReveal = {
        hidden: { opacity: 0, y: 40, rotateX: -40 },
        visible: (i) => ({
            opacity: 1, y: 0, rotateX: 0,
            transition: { delay: 0.3 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        })
    };

    const navLinks = [
        { label: 'Vision', href: '#vision' },
        { label: 'Programs', href: '/programs' },
        { label: 'Meetups', href: '/meetups' },
        { label: 'Events', href: '#events' },
        { label: 'Community', href: '#community' },
    ];

    return (
        <div className="bg-[#F7F5F2] text-[#1E1919] min-h-screen font-sans overflow-x-hidden selection:bg-[#0061FE] selection:text-white">
            {/* ─── Premium Navigation ─── */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 w-full z-50 border-b border-white/[0.04]"
            >
                <div className="absolute inset-0 bg-[#060611]/60 backdrop-blur-2xl" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex justify-between items-center h-16 md:h-[72px]">
                        {/* Logo */}
                        <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.02 }}>
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#0061FE] to-[#00C6F7] rounded-full opacity-0 group-hover:opacity-40 blur-sm transition-opacity" />
                                <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg" alt="CodeSapiens Logo" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10 relative" />
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#060611]" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-white">CodeSapiens</span>
                        </motion.div>

                        {/* Desktop Nav — pill container */}
                        <div className="hidden md:flex items-center">
                            <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.03] mr-4">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="relative px-4 py-1.5 text-sm font-medium text-gray-400 hover:text-white rounded-full hover:bg-white/[0.08] transition-all duration-200"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate('/auth')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-3 py-1.5">Log in</button>
                                <motion.button
                                    onClick={() => navigate('/auth')}
                                    whileHover={{ scale: 1.04, y: -1 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="relative group px-5 py-2.5 rounded-full text-sm font-bold text-white overflow-hidden"
                                >
                                    {/* Animated gradient border */}
                                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0061FE] via-[#00C6F7] to-[#0061FE] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />
                                    <span className="absolute inset-[1.5px] rounded-full bg-[#0a0a1a]" />
                                    <span className="absolute inset-[1.5px] rounded-full bg-gradient-to-r from-[#0061FE] to-[#00C6F7] opacity-90" />
                                    <span className="relative z-10">Get Started</span>
                                </motion.button>
                            </div>
                        </div>

                        {/* Mobile burger */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* ─── Mobile Menu ─── */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, clipPath: 'circle(0% at 95% 5%)' }}
                        animate={{ opacity: 1, clipPath: 'circle(150% at 95% 5%)' }}
                        exit={{ opacity: 0, clipPath: 'circle(0% at 95% 5%)' }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-40 bg-[#060611] text-white pt-24 px-8 md:hidden"
                    >
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#0061FE]/20 rounded-full blur-[120px] pointer-events-none" />
                        <div className="relative z-10 flex flex-col h-[calc(100%-6rem)]">
                            <div className="flex flex-col gap-2 flex-1">
                                {navLinks.map((item, i) => (
                                    <motion.a
                                        key={item.label}
                                        href={item.href}
                                        initial={{ opacity: 0, x: -40 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -40 }}
                                        transition={{ delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-3xl font-extrabold tracking-tight py-3 px-4 rounded-2xl hover:bg-white/[0.05] transition-colors"
                                    >
                                        {item.label}
                                        <span className="text-[#0061FE]">.</span>
                                    </motion.a>
                                ))}
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="pb-8 space-y-3"
                            >
                                <button onClick={() => navigate('/auth')} className="block text-gray-400 font-medium text-lg px-4 py-2">Log in</button>
                                <button onClick={() => navigate('/auth')} className="w-full bg-gradient-to-r from-[#0061FE] to-[#00C6F7] text-white px-6 py-4 rounded-2xl text-lg font-bold shadow-[0_0_40px_rgba(0,97,254,0.3)]">
                                    Get Started
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════════ HERO SECTION ═══════════════════ */}
            <section
                ref={heroRef}
                onMouseMove={handleMouseMove}
                className="relative min-h-screen bg-[#040410] text-white flex items-center overflow-hidden"
            >
                {/* ── BACKGROUND: Layered for depth ── */}
                <div className="absolute inset-0 z-0">
                    {/* 1. Subtle dot matrix */}
                    <div className="absolute inset-0 opacity-[0.06]" style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />

                    {/* 2. Constellation SVG lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
                        <motion.line x1="10%" y1="20%" x2="35%" y2="15%" stroke="#0061FE" strokeWidth="0.5"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, delay: 1 }} />
                        <motion.line x1="35%" y1="15%" x2="50%" y2="40%" stroke="#00C6F7" strokeWidth="0.5"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, delay: 1.5 }} />
                        <motion.line x1="50%" y1="40%" x2="75%" y2="25%" stroke="#0061FE" strokeWidth="0.5"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, delay: 2 }} />
                        <motion.line x1="75%" y1="25%" x2="90%" y2="55%" stroke="#00C6F7" strokeWidth="0.5"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, delay: 2.5 }} />
                        <motion.line x1="20%" y1="70%" x2="45%" y2="80%" stroke="#0061FE" strokeWidth="0.5"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, delay: 3 }} />
                        <motion.line x1="45%" y1="80%" x2="65%" y2="60%" stroke="#00C6F7" strokeWidth="0.5"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, delay: 3.5 }} />
                        {/* Constellation dots */}
                        {['10%,20%', '35%,15%', '50%,40%', '75%,25%', '90%,55%', '20%,70%', '45%,80%', '65%,60%'].map((pos, i) => {
                            const [cx, cy] = pos.split(',');
                            return <motion.circle key={i} cx={cx} cy={cy} r="2" fill="#0061FE" opacity="0.4"
                                initial={{ scale: 0 }} animate={{ scale: [0, 1, 0.8] }} transition={{ delay: 1 + i * 0.3, duration: 0.5 }} />;
                        })}
                    </svg>

                    {/* 3. Mouse-tracking aurora glow */}
                    <motion.div
                        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
                        style={{
                            x: auroraX,
                            y: auroraY,
                            left: '20%',
                            top: '-10%',
                            background: 'radial-gradient(circle, rgba(0,97,254,0.15) 0%, rgba(0,198,247,0.08) 40%, transparent 70%)',
                            filter: 'blur(80px)',
                        }}
                    />
                    <motion.div
                        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
                        style={{
                            x: useTransform(smoothX, [0, 1], ['10%', '-10%']),
                            y: useTransform(smoothY, [0, 1], ['5%', '-5%']),
                            right: '-5%',
                            bottom: '0%',
                            background: 'radial-gradient(circle, rgba(0,198,247,0.12) 0%, rgba(0,97,254,0.06) 40%, transparent 70%)',
                            filter: 'blur(80px)',
                        }}
                    />
                </div>

                {/* Floating geometric shapes */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-[15%] right-[12%] w-16 h-16 border border-[#0061FE]/15 rounded-lg pointer-events-none"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="absolute bottom-[20%] left-[8%] w-10 h-10 border border-[#00C6F7]/12 rounded-full pointer-events-none"
                />
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 90, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[60%] right-[6%] w-5 h-5 bg-[#0061FE]/10 rounded-sm pointer-events-none"
                />
                <motion.div
                    animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute top-[25%] left-[15%] w-3 h-3 bg-[#00C6F7]/15 rounded-full pointer-events-none"
                />

                {/* ── CONTENT ── */}
                <div className="container mx-auto px-6 relative z-10 pt-32 pb-24">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        {/* Left — Copy with kinetic typography */}
                        <div className="max-w-2xl" style={{ perspective: '1000px' }}>
                            {/* Animated badge with gradient border spin */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="inline-flex items-center gap-2.5 mb-10 relative"
                            >
                                <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-[#0061FE] via-[#00C6F7] to-[#0061FE] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] opacity-60" />
                                <div className="relative flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#0a0a1a]/90 backdrop-blur-xl">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                                    </span>
                                    <span className="text-sm text-gray-300 font-medium">Biggest Student-Run Tech Community in TN</span>
                                </div>
                            </motion.div>

                            {/* Kinetic heading — word by word reveal with 3D */}
                            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold leading-[0.98] tracking-[-0.04em] mb-8">
                                <span className="block overflow-hidden">
                                    <motion.span
                                        initial={{ y: 80, rotateX: -40, opacity: 0 }}
                                        animate={{ y: 0, rotateX: 0, opacity: 1 }}
                                        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                        className="inline-block"
                                    >
                                        Code
                                    </motion.span>
                                    <motion.span
                                        initial={{ y: 80, rotateX: -40, opacity: 0 }}
                                        animate={{ y: 0, rotateX: 0, opacity: 1 }}
                                        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                        className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#0061FE] via-[#3389FF] to-[#00C6F7]"
                                    >
                                        Sapiens
                                    </motion.span>
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.8, type: 'spring', stiffness: 400, damping: 10 }}
                                        className="inline-block text-[#00C6F7] ml-0.5"
                                    >
                                        .
                                    </motion.span>
                                </span>
                            </h1>

                            {/* Subtitle with stagger */}
                            <div className="space-y-3 mb-12">
                                <motion.p
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-xl"
                                >
                                    The only <span className="text-white font-semibold relative">
                                        inter-college students community
                                        <motion.span
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ delay: 1.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                            className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0061FE] to-[#00C6F7] origin-left"
                                        />
                                    </span> — by the students, for the students.
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
                                    className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-lg"
                                >
                                    We help students who say{' '}
                                    <span className="text-white/80 font-medium">"Perusa Pannanum, but enna Pannanum Therla"</span>{' '}
                                    <span className="text-gray-600">— "Want to do something big, but don't know what to do."</span>
                                </motion.p>
                            </div>

                            {/* Premium CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <motion.button
                                    onClick={() => navigate('/auth')}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group relative inline-flex items-center justify-center gap-3 px-9 py-4.5 rounded-2xl text-base font-bold text-white overflow-hidden"
                                >
                                    {/* Animated rotating gradient border */}
                                    <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0061FE] via-[#00C6F7] to-[#0061FE] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />
                                    <span className="absolute inset-[2px] rounded-[14px] bg-gradient-to-r from-[#0061FE] to-[#0080FF]" />
                                    {/* Glow layer */}
                                    <span className="absolute inset-0 rounded-2xl shadow-[0_0_40px_rgba(0,97,254,0.35)] group-hover:shadow-[0_0_60px_rgba(0,97,254,0.5)] transition-shadow duration-300" />
                                    <span className="relative z-10 flex items-center gap-3">
                                        Join Now
                                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
                                    </span>
                                    {/* Shine sweep */}
                                    <span className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-20">
                                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                    </span>
                                </motion.button>
                                <motion.button
                                    onClick={() => { const el = document.getElementById('vision'); el && el.scrollIntoView({ behavior: 'smooth' }); }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group inline-flex items-center justify-center gap-2 px-8 py-4.5 text-base font-semibold rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm text-gray-300 hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300"
                                >
                                    Explore
                                    <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
                                </motion.button>
                            </motion.div>

                            {/* Social-proof counters with animated separator */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.6 }}
                                className="flex items-center gap-0 mt-14"
                            >
                                {[
                                    { value: '2,000+', label: 'Members', icon: Users },
                                    { value: '50+', label: 'Colleges', icon: Globe },
                                    { value: '15+', label: 'Events', icon: Calendar },
                                ].map((s, i) => (
                                    <React.Fragment key={i}>
                                        {i > 0 && <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/10 to-transparent mx-6 sm:mx-8" />}
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.1 + i * 0.12 }}
                                            className="text-left group cursor-default"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <s.icon size={14} className="text-[#0061FE] opacity-60" />
                                                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{s.value}</p>
                                            </div>
                                            <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-semibold">{s.label}</p>
                                        </motion.div>
                                    </React.Fragment>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right — 3D Tilt Dashboard Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="relative mt-8 lg:mt-0"
                            style={{ perspective: '1200px' }}
                        >
                            {/* 3D tilt card */}
                            <motion.div
                                style={{
                                    rotateY: useTransform(smoothX, [0, 1], [4, -4]),
                                    rotateX: useTransform(smoothY, [0, 1], [-3, 3]),
                                }}
                                className="relative group"
                            >
                                {/* Animated gradient border ring */}
                                <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-br from-[#0061FE]/40 via-transparent to-[#00C6F7]/40 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative rounded-[22px] overflow-hidden border border-white/[0.06] bg-[#0a0a1a]/80 backdrop-blur-md shadow-[0_20px_80px_-20px_rgba(0,97,254,0.2)]">
                                    {/* Hover gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0061FE]/10 via-transparent to-[#00C6F7]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none" />
                                    {/* Reflection highlight */}
                                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    <img
                                        src="https://res.cloudinary.com/dqudvximt/image/upload/v1771005975/Gemini_Generated_Image_il0qzjil0qzjil0q_1_cfh7ix.png"
                                        alt="CodeSapiens Dashboard"
                                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                                    />
                                </div>
                            </motion.div>

                            {/* Floating feature cards */}
                            <motion.div
                                initial={{ opacity: 0, x: -30, y: 20 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute -top-5 -left-3 sm:-left-6 z-20"
                            >
                                <motion.div
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.08] bg-[#0d0d20]/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0061FE] to-[#3389FF] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,97,254,0.3)]">
                                        <Code size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white leading-tight">DSA Practice</p>
                                        <p className="text-[10px] text-gray-500 font-medium">200+ problems</p>
                                    </div>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 30, y: -20 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ delay: 1.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute -bottom-3 -right-2 sm:-right-5 z-20"
                            >
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.08] bg-[#0d0d20]/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00C6F7] to-[#0061FE] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,198,247,0.3)]">
                                        <Rocket size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white leading-tight">Mentorship</p>
                                        <p className="text-[10px] text-gray-500 font-medium">1-on-1 guidance</p>
                                    </div>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute top-1/2 -right-4 sm:-right-10 -translate-y-1/2 z-20 hidden sm:block"
                            >
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.08] bg-[#0d0d20]/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0061FE] to-[#00C6F7] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,97,254,0.2)]">
                                        <Calendar size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white leading-tight">Live Events</p>
                                        <p className="text-[10px] text-gray-500 font-medium">Every month</p>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Decorative blurs */}
                            <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-[#0061FE] rounded-full blur-[120px] opacity-15 pointer-events-none" />
                            <div className="absolute -top-20 -left-20 w-56 h-56 bg-[#00C6F7] rounded-full blur-[120px] opacity-10 pointer-events-none" />
                        </motion.div>
                    </div>
                </div>

                {/* Scroll indicator — capsule mouse */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
                >
                    <div className="w-7 h-11 rounded-full border-2 border-white/15 flex justify-center pt-2">
                        <motion.div
                            animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                            className="w-1.5 h-2.5 rounded-full bg-gradient-to-b from-[#0061FE] to-[#00C6F7]"
                        />
                    </div>
                </motion.div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#F7F5F2] to-transparent z-[5] pointer-events-none" />
            </section>




            {/* Vision Section */}
            <section id="vision" className="bg-[#F7F5F2] text-[#1E1919] py-12 md:py-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-px bg-gradient-to-b from-[#060611] to-[#0061FE]"></div>
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
                                    <h3 className="text-golden-3 font-bold text-[#FF0000] mb-2">2000+</h3>
                                    <p className="text-golden-1 text-gray-500 uppercase tracking-widest">Active Members</p>
                                </div>
                                <div>
                                    <h3 className="text-golden-3 font-bold text-[#FF0000] mb-2">15+</h3>
                                    <p className="text-golden-1 text-gray-500 uppercase tracking-widest">Events Hosted</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative h-72 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 mt-8 md:mt-0">
                            <img
                                src="https://res.cloudinary.com/dqudvximt/image/upload/v1767535873/1760365837828_vyrmco.jpg"

                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>


                    </div>
                </div>
            </section>

            {/* Events Section - Community Moments */}
            <section id="events" className="py-24 md:py-32 bg-white text-[#1E1919]">
                <div className="container mx-auto px-6">


                    {/* Past Events Gallery */}
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-golden-2 font-bold">Community Moments</h3>
                        <div className="flex gap-2">
                            <button className="p-2 rounded-full border border-gray-700 hover:bg-white hover:text-black transition-colors"><ArrowRight className="rotate-180" /></button>
                            <button className="p-2 rounded-full border border-gray-700 hover:bg-white hover:text-black transition-colors"><ArrowRight /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {communityPhotos.slice(0, 6).map((photo, i) => (
                            <motion.div
                                key={photo.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -5 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group relative overflow-hidden rounded-xl bg-[#2A2A2A] border border-gray-800"
                            >
                                {/* Photo */}
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img
                                        src={photo.image_url}
                                        alt={photo.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute bottom-0 left-0 w-full p-6">
                                    <h4 className="text-white font-bold text-lg mb-1">{photo.title}</h4>
                                    <p className="text-gray-300 text-sm">{photo.description || photo.date}</p>
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
            <NoticeSection />

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
            <section id="community" className="py-8 md:py-16 bg-[#F7F5F2] text-[#1E1919]">
                <div className="container mx-auto px-6 text-center">
                    <span className="text-[#0061FE] font-bold tracking-widest uppercase text-xs md:text-sm text-golden-1 mb-2 block">Community</span>
                    <h2 className="text-2xl md:text-4xl text-golden-2 md:text-golden-3 font-bold mb-3">The Mafia Gang</h2>
                    <p className="text-golden-1 text-gray-600 text-sm md:text-base max-w-2xl mx-auto mb-8">
                        Meet the core members who run the community. We are students, just like you.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-2 md:gap-x-4">
                        {/* Founder */}
                        <div className="col-span-2 md:col-span-1 flex flex-col items-center group">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 border-4 border-[#FA5D00] shadow-lg group-hover:scale-105 transition-transform">
                                <img src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/1679197646322_n1svjq_s5w42a.jpg" alt="Thiyaga B" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-bold text-golden-2 mb-0.5 text-sm md:text-base">Thiyaga B</h3>
                            <p className="text-[#FA5D00] text-golden-1 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1">Founder</p>
                            <a href="https://www.linkedin.com/in/thiyagab/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0061FE] transition-colors"><Linkedin size={14} /></a>
                        </div>
                        {volunteers.map((vol, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex flex-col items-center group"
                            >
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-2 grayscale group-hover:grayscale-0 transition-all duration-500 border-2 border-transparent group-hover:border-[#0061FE] shadow-md">
                                    <img src={vol.photo} alt={vol.name} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-bold text-golden-1 mb-0.5 text-xs md:text-sm">{vol.name}</h3>
                                {vol.link && (
                                    <a href={vol.link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0061FE] transition-colors mt-1">
                                        <Linkedin size={12} />
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tagline Section */}
            <section className="py-20 bg-black flex items-center justify-center">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-golden-2 md:text-golden-3 font-black text-white tracking-tighter uppercase leading-none">
                        Building Community <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061FE] to-[#00C6F7]">Since 2023</span>
                    </h2>
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
