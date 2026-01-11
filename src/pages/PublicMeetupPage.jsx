// src/pages/PublicMeetupPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import {
    Calendar, Clock, MapPin, Loader2, ArrowLeft,
    Ticket, Users, Zap
} from "lucide-react";

// --- ANIMATED GRID SYSTEM (THE "FRAMEWORK") ---
const FrameworkGrid = () => (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden h-full opacity-30">
        <motion.div
            initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-px bg-[#0061FE]/20 absolute left-[40px] hidden md:block"
        />
        <motion.div
            initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
            className="w-px bg-[#0061FE]/20 absolute left-[40px] md:left-[260px]"
        />
        <motion.div
            initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.1, ease: "easeInOut" }}
            className="absolute top-[180px] left-0 h-px bg-[#0061FE]/10"
        />
    </div>
);

export default function PublicMeetupPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const session = useSession();
    const [meetup, setMeetup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMeetup = async () => {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from("meetup")
                .select("id, title, description, start_date_time, end_date_time, venue")
                .eq("id", id)
                .single();

            if (fetchError) {
                setError("Meetup not found");
                setLoading(false);
                return;
            }

            setMeetup(data);
            setLoading(false);
        };

        fetchMeetup();
    }, [id]);

    const handleRegisterClick = () => {
        if (session) {
            // User is already logged in, redirect to meetups page
            navigate("/meetups");
        } else {
            // Redirect to auth with redirect param
            navigate(`/auth?redirect=/meetup/${id}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1E1E1E] flex flex-col items-center justify-center text-white relative overflow-hidden">
                <Loader2 className="w-16 h-16 animate-spin text-[#C2E812] mb-6" />
                <p className="font-black text-xl tracking-[0.2em] animate-pulse">LOADING...</p>
            </div>
        );
    }

    if (error || !meetup) {
        return (
            <div className="min-h-screen bg-[#F7F5F2] flex flex-col items-center justify-center text-[#1E1E1E] p-6">
                <div className="bg-white border-[3px] border-dashed border-[#1E1E1E] rounded-[2.5rem] p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] max-w-md">
                    <div className="w-20 h-20 bg-[#F7F5F2] rounded-full flex items-center justify-center mx-auto mb-6 border-[3px] border-[#1E1E1E]">
                        <Calendar className="w-10 h-10 text-[#1E1E1E]" />
                    </div>
                    <h3 className="text-3xl font-black text-[#1E1E1E] mb-2">Meetup Not Found</h3>
                    <p className="text-lg font-bold text-gray-500 mb-6">This meetup doesn't exist or has been removed.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-[#1E1E1E] text-white px-6 py-3 rounded-xl font-black text-lg hover:bg-[#0061FE] transition-all shadow-[4px_4px_0px_0px_black]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const startDate = new Date(meetup.start_date_time);
    const endDate = new Date(meetup.end_date_time);
    const isPast = endDate < new Date();

    return (
        <div className="min-h-screen bg-[#F7F5F2] font-sans text-[#1E1E1E] selection:bg-[#C2E812] selection:text-black overflow-x-hidden relative">
            {/* --- ANIMATED BLUE GRID LINES --- */}
            <FrameworkGrid />

            {/* --- HEADER --- */}
            <div className="pt-8 px-6 relative z-10">
                <div className="w-full max-w-4xl mx-auto">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1E1E1E] font-bold transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="py-12 px-6 relative z-10">
                <div className="w-full max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="bg-white rounded-[2rem] border-[3px] border-[#1E1E1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                    >
                        {/* Banner */}
                        <div className="h-48 md:h-64 bg-[#F2F2F2] relative overflow-hidden flex items-center justify-center border-b-[3px] border-[#1E1E1E]">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
                            {/* Decorative Blobs */}
                            <div className="absolute w-40 h-40 rounded-full mix-blend-multiply opacity-90 bg-[#C2E812] -right-10 -top-10"></div>
                            <div className="absolute w-32 h-32 rounded-full mix-blend-multiply opacity-80 bg-[#0061FE] -left-8 -bottom-8"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <span className="text-7xl md:text-8xl font-black text-[#1E1E1E] tracking-tighter leading-none">
                                    {startDate.getDate()}
                                </span>
                                <span className="text-2xl md:text-3xl font-black uppercase tracking-widest text-[#1E1E1E]">
                                    {startDate.toLocaleString('default', { month: 'short' })} {startDate.getFullYear()}
                                </span>
                            </div>

                            {isPast && (
                                <div className="absolute top-4 right-4 bg-gray-500 text-white px-4 py-2 text-sm font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_black]">
                                    Event Ended
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-8 md:p-12">
                            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6 text-[#1E1E1E] tracking-tight">
                                {meetup.title}
                            </h1>

                            <div className="flex flex-wrap gap-6 mb-8">
                                <div className="flex items-center gap-3 text-gray-600 font-bold">
                                    <div className="p-2 bg-[#FF5018]/10 rounded-lg">
                                        <Clock className="w-6 h-6 text-[#FF5018]" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">Time</div>
                                        <div className="text-[#1E1E1E]">
                                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-gray-600 font-bold">
                                    <div className="p-2 bg-[#0061FE]/10 rounded-lg">
                                        <MapPin className="w-6 h-6 text-[#0061FE]" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">Venue</div>
                                        <div className="text-[#1E1E1E]">{meetup.venue}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-gray-600 font-bold">
                                    <div className="p-2 bg-[#C2E812]/30 rounded-lg">
                                        <Calendar className="w-6 h-6 text-[#1E1E1E]" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">Date</div>
                                        <div className="text-[#1E1E1E]">
                                            {startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10">
                                {meetup.description}
                            </p>

                            {/* CTA Section */}
                            <div className="border-t-[3px] border-dashed border-[#1E1E1E]/20 pt-8">
                                {isPast ? (
                                    <div className="bg-gray-100 rounded-2xl p-6 text-center">
                                        <p className="text-gray-500 font-bold text-lg">This event has ended. Check out our upcoming meetups!</p>
                                        <Link
                                            to="/"
                                            className="mt-4 inline-flex items-center gap-2 text-[#0061FE] font-black hover:underline"
                                        >
                                            View All Events <Zap className="w-4 h-4" />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-[#1E1E1E] rounded-xl">
                                                <Users className="w-6 h-6 text-[#C2E812]" />
                                            </div>
                                            <div>
                                                <div className="font-black text-xl text-[#1E1E1E]">Join the Community!</div>
                                                <div className="text-gray-500 font-medium">Register now to secure your spot</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleRegisterClick}
                                            className="bg-[#1E1E1E] text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-[#0061FE] transition-all shadow-[4px_4px_0px_0px_black] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_black] flex items-center gap-3 w-full md:w-auto justify-center"
                                        >
                                            <Ticket className="w-5 h-5" />
                                            {session ? "Go to Meetups" : "Register Now"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* CodeSapiens Branding */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 text-center"
                    >
                        <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100">
                            <img
                                src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg"
                                alt="CodeSapiens"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="text-left">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hosted by</div>
                                <div className="font-bold text-[#1E1E1E]">CodeSapiens</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
