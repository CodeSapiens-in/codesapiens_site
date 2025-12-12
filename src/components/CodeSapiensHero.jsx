import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X, Github, Linkedin, Youtube, Users, Calendar, Code, Award } from 'lucide-react';
import { BACKEND_URL } from '../config';
import LandingPopup from './LandingPopup';

// --- Stats Section ---
const StatsSection = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalColleges: 0, topColleges: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/public-stats`)
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
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#0061FE] rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#9B0032] rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-16 text-center">
                    <span className="text-[#0061FE] font-bold tracking-widest uppercase text-sm mb-4 block">Impact</span>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">By The Numbers</h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        We are growing fast. Join the movement.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* Left: Big Numbers */}
                    <div className="grid grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-[#1E1919] p-8 rounded-2xl border border-gray-800 text-center"
                        >
                            <Users className="w-10 h-10 text-[#0061FE] mx-auto mb-4" />
                            <h3 className="text-5xl font-black text-white mb-2">
                                {stats.totalUsers > 0 ? stats.totalUsers : "1500+"}
                            </h3>
                            <p className="text-gray-500 font-medium uppercase tracking-wider text-xs">Total Members</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#1E1919] p-8 rounded-2xl border border-gray-800 text-center"
                        >
                            <Award className="w-10 h-10 text-[#FA5D00] mx-auto mb-4" />
                            <h3 className="text-5xl font-black text-white mb-2">
                                {stats.totalColleges > 0 ? stats.totalColleges : "50+"}
                            </h3>
                            <p className="text-gray-500 font-medium uppercase tracking-wider text-xs">Colleges Reached</p>
                        </motion.div>
                    </div>

                    {/* Right: Top Colleges Chart */}
                    <div className="bg-[#1E1919] p-8 rounded-2xl border border-gray-800">
                        <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Code className="text-[#0061FE]" /> Top Active Colleges
                        </h4>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center text-gray-500 py-10">Loading stats...</div>
                            ) : stats.topColleges.filter(c => c.name && c.name !== "Not specified").length > 0 ? (
                                stats.topColleges
                                    .filter(c => c.name && c.name !== "Not specified")
                                    .map((college, index) => (
                                        <div key={index} className="relative">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-300 truncate w-3/4">{college.name}</span>
                                                <span className="text-[#0061FE] font-bold">{college.count}</span>
                                            </div>
                                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${(college.count / stats.topColleges[0].count) * 100}%` }}
                                                    transition={{ duration: 1, delay: index * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-[#0061FE] to-[#00C6F7] rounded-full"
                                                />
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="text-center text-gray-500 py-10">
                                    <p>Stats currently unavailable</p>
                                    <p className="text-xs mt-2">Backend: {BACKEND_URL}</p>
                                </div>
                            )}
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
            description: "Offline events and mini-hackathons where you build and launch projects in minutes. Connect with like-minded peers.",
            content: (
                <div className="h-full w-full bg-[#0061FE] flex items-center justify-center text-white p-0">
                    <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1765446924/Gemini_Generated_Image_g1g8reg1g8reg1g8_aqqe3e.png" alt="Meetups" className="w-full h-full object-cover" />
                </div>
            )
        },
        {
            title: "Hackathons",
            description: "Fun, minimal hackathons to get hands-on experience and win prizes. Push your limits and build something amazing.",
            content: (
                <div className="h-full w-full bg-[#9B0032] flex items-center justify-center text-white p-0">
                    <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1765446926/Gemini_Generated_Image_7vm7h67vm7h67vm7_ixfxbu.png" alt="Hackathons" className="w-full h-full object-cover" />
                </div>
            )
        },
        {
            title: "Nurturing Talent",
            description: "We help you discover your interests and build a unique profile that stands out. Mentorship from seniors and industry experts.",
            content: (
                <div className="h-full w-full bg-[#FA5D00] flex items-center justify-center text-white p-0">
                    <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1765446901/Gemini_Generated_Image_j2rd2bj2rd2bj2rd_h2pygn.png" alt="Nurturing Talent" className="w-full h-full object-cover" />
                </div>
            )
        },
        {
            title: "Curated Sessions",
            description: "Practical skills, code examples, and presentations based on community feedback. Learn what matters.",
            content: (
                <div className="h-full w-full bg-purple-600 flex items-center justify-center text-white p-0">
                    <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1765446916/Gemini_Generated_Image_3or3oi3or3oi3or3_htqozy.png" alt="Curated Sessions" className="w-full h-full object-cover" />
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
                    <div className="hidden md:flex items-center gap-8 font-medium text-sm">
                        <a href="#vision" className="hover:text-[#0061FE] transition-colors">Vision</a>
                        <a href="#events" className="hover:text-[#0061FE] transition-colors">Events</a>
                        <a href="#community" className="hover:text-[#0061FE] transition-colors">Community</a>
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
                    <div className="flex flex-col gap-6 text-2xl font-bold">
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
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-4xl"
                    >
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold leading-[1] tracking-tighter mb-8 font-archivo-black">
                            CodeSapiens<span className="text-[#0061FE]">.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl leading-relaxed mb-12 font-light">
                            The Biggest Student-Run Tech Community in TN.<br />
                            <span className="text-white block mt-2">The only 'Inter-college students community' by the students for the students</span>
                            <span className="text-gray-400 block mt-4 text-lg italic">
                                We are here to help students build a career in Tech who say, <br />
                                <span className="text-white not-italic">“Perusa Pannanum, but enna Pannanum Therla”</span> <br />
                                ("Want to do something big, but don't know what to do").
                            </span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <button onClick={() => navigate('/auth')} className="bg-[#0061FE] text-white px-8 py-4 text-lg font-bold rounded-sm hover:bg-[#0050d6] transition-all flex items-center justify-center gap-3 group">
                                Join Now <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={() => document.getElementById('vision').scrollIntoView({ behavior: 'smooth' })} className="border border-gray-700 text-white px-8 py-4 text-lg font-medium rounded-sm hover:bg-white hover:text-black transition-all">
                                Explore
                            </button>
                        </div>
                    </motion.div>
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
            <section id="vision" className="bg-[#F7F5F2] text-[#1E1919] py-24 md:py-32 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-px bg-gradient-to-b from-[#101010] to-[#0061FE]"></div>
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-start">
                        <div className="relative md:sticky md:top-32">
                            <span className="text-[#0061FE] font-bold tracking-widest uppercase text-sm mb-4 block">Our Vision</span>
                            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                                Not just a club.<br />
                                A <span className="text-[#0061FE]">launchpad</span>.
                            </h2>
                            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                                Our vision is to bring students together to collaborate, share, and grow. We envision a platform managed by students, for students, where you can build your career based on your interests.
                            </p>
                            <div className="grid grid-cols-2 gap-8 border-t border-gray-200 pt-8">
                                <div>
                                    <h3 className="text-4xl font-bold text-[#1E1919] mb-2">1500+</h3>
                                    <p className="text-sm text-gray-500 uppercase tracking-widest">Active Members</p>
                                </div>
                                <div>
                                    <h3 className="text-4xl font-bold text-[#1E1919] mb-2">50+</h3>
                                    <p className="text-sm text-gray-500 uppercase tracking-widest">Events Hosted</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <video
                                src="https://res.cloudinary.com/dqudvximt/video/upload/v1765443313/66c503d081b2f012369fc5d2_674798e5512046ff64125032_Collaboration_Top-Down_Table-transcode_jgafvj.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>

                        <div className="col-span-2 mt-12">
                            <div className="space-y-20">
                                {visionContent.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex flex-col md:flex-row gap-10 items-center"
                                    >
                                        <div className="flex-1">
                                            <h3 className="text-3xl font-bold mb-4 text-[#1E1919]">{item.title}</h3>
                                            <p className="text-lg text-gray-600 leading-relaxed">{item.description}</p>
                                        </div>
                                        <div className="flex-1 h-64 w-full rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
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
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                        <div>
                            <span className="text-[#0061FE] font-bold tracking-widest uppercase text-sm mb-4 block">Events</span>
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">What's Happening</h2>
                            <p className="text-xl text-gray-400">Join us at our upcoming events.</p>
                        </div>
                        <button className="hidden md:flex items-center gap-2 text-[#0061FE] font-medium hover:gap-3 transition-all mt-6 md:mt-0">
                            View all events <ArrowRight size={20} />
                        </button>
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
                        <h3 className="text-3xl font-bold">Community Moments</h3>
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
                                        <p className="font-bold text-xl mb-1 text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>{photo.title}</p>
                                        <p className="text-sm text-gray-500 font-medium italic">{photo.description || photo.date}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Hall of Fame */}
            <section className="py-32 bg-[#0061FE] text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-7xl font-bold mb-6">Hall of Fame</h2>
                        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">Celebrating the outstanding achievements of our community members.</p>
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
                                    <h3 className="text-2xl font-bold mb-2">{entry.student_name}</h3>
                                    <div className="w-12 h-1 bg-[#0061FE] mx-auto mb-4"></div>
                                    <p className="text-gray-600 text-sm italic leading-relaxed">"{entry.description}"</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team / Mafia Gang */}
            <section id="community" className="py-24 md:py-32 bg-[#F7F5F2] text-[#1E1919]">
                <div className="container mx-auto px-6 text-center">
                    <span className="text-[#0061FE] font-bold tracking-widest uppercase text-sm mb-4 block">Community</span>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">The Mafia Gang</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-20">
                        Meet the core members who run the community. We are students, just like you.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-8">
                        {/* Founder */}
                        <div className="col-span-2 md:col-span-1 flex flex-col items-center group">
                            <div className="w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-[#FA5D00] shadow-lg group-hover:scale-105 transition-transform">
                                <img src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/1679197646322_n1svjq_s5w42a.jpg" alt="Thiyaga B" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-bold text-xl mb-1">Thiyaga B</h3>
                            <p className="text-[#FA5D00] text-sm font-bold uppercase tracking-widest mb-3">Founder</p>
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
                                <h3 className="font-bold text-lg mb-1">{vol.name}</h3>
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

            {/* Tagline Section */}
            <section className="py-20 bg-black flex items-center justify-center">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-none">
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
                                <ul className="space-y-4 text-sm">
                                    <li><a href="#vision" className="hover:text-[#0061FE] transition-colors">About Us</a></li>
                                    <li><a href="#events" className="hover:text-[#0061FE] transition-colors">Events</a></li>
                                    <li><a href="#community" className="hover:text-[#0061FE] transition-colors">Team</a></li>
                                    <li><a href="#" className="hover:text-[#0061FE] transition-colors">Join Discord</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
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