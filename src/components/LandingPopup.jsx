import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);
    const navigate = useNavigate();

    useEffect(() => {
        const FIVE_MINUTES_MS = 5 * 60 * 1000;
        const lastDismissed = localStorage.getItem('landingPopupDismissedAt');

        if (lastDismissed) {
            const dismissedTime = parseInt(lastDismissed, 10);
            if (Date.now() - dismissedTime < FIVE_MINUTES_MS) {
                return;
            }
        }

        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let interval;
        if (isVisible && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isVisible, timeLeft]);

    const handleClose = () => {
        localStorage.setItem('landingPopupDismissedAt', Date.now().toString());
        setIsVisible(false);
    };

    const handleGoogleLogin = () => {
        navigate('/auth');
    };

    const isExpired = timeLeft === 0;

    return createPortal(
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 pointer-events-none">

                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-[#0A0A0F]/80 backdrop-blur-md pointer-events-auto"
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        className="bg-[#0D0D2B]/95 backdrop-blur-xl border border-[#00C6F7]/25 p-6 rounded-2xl shadow-[0_8px_48px_rgba(0,198,247,0.2)] w-full max-w-md relative pointer-events-auto overflow-hidden text-center"
                    >
                        {/* Top shimmer line */}
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00C6F7] to-[#A855F7]" />

                        {/* Ambient glows */}
                        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#A855F7] rounded-full blur-[80px] opacity-15 pointer-events-none" />
                        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#00C6F7] rounded-full blur-[80px] opacity-10 pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-600 hover:text-white hover:bg-[#00C6F7]/10 p-1.5 rounded-full transition-all border border-transparent hover:border-[#00C6F7]/30 z-10"
                        >
                            <X size={16} />
                        </button>

                        <div className="mb-6 mt-4 relative z-10">

                            {/* Timer blocks */}
                            <div className="flex items-center justify-center gap-2 mb-6">
                                {/* Minutes */}
                                <div className="flex gap-1">
                                    <div className={`w-11 h-14 rounded-xl border flex items-center justify-center text-xl font-black font-mono shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] transition-all duration-300 ${
                                        isExpired
                                            ? 'bg-red-950/50 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                            : 'bg-[#0A0A0F] border-[#00C6F7]/15 text-white'
                                    }`}>
                                        {isExpired ? 'O' : Math.floor(timeLeft / 60).toString().padStart(2, '0')[0]}
                                    </div>
                                    <div className={`w-11 h-14 rounded-xl border flex items-center justify-center text-xl font-black font-mono shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] transition-all duration-300 ${
                                        isExpired
                                            ? 'bg-red-950/50 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                            : 'bg-[#0A0A0F] border-[#00C6F7]/15 text-white'
                                    }`}>
                                        {isExpired ? 'O' : Math.floor(timeLeft / 60).toString().padStart(2, '0')[1]}
                                    </div>
                                </div>

                                <span className={`text-xl font-black pb-1 transition-colors ${isExpired ? 'text-transparent' : 'text-[#00C6F7]/40'}`}>:</span>

                                {/* Seconds */}
                                <div className="flex gap-1">
                                    <div className={`w-11 h-14 rounded-xl border flex items-center justify-center text-xl font-black font-mono shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] transition-all duration-300 ${
                                        isExpired
                                            ? 'bg-red-950/50 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                            : 'bg-[#0A0A0F] border-[#A855F7]/25 text-transparent bg-clip-text bg-gradient-to-b from-[#00C6F7] to-[#A855F7]'
                                    }`}>
                                        {isExpired ? 'P' : (timeLeft % 60).toString().padStart(2, '0')[0]}
                                    </div>
                                    <div className={`w-11 h-14 rounded-xl border flex items-center justify-center text-xl font-black font-mono shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] transition-all duration-300 ${
                                        isExpired
                                            ? 'bg-red-950/50 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                            : 'bg-[#0A0A0F] border-[#A855F7]/25 text-transparent bg-clip-text bg-gradient-to-b from-[#00C6F7] to-[#A855F7]'
                                    }`}>
                                        {isExpired ? 'S' : (timeLeft % 60).toString().padStart(2, '0')[1]}
                                    </div>
                                </div>
                            </div>

                            {/* Heading */}
                            <h3 className="text-2xl font-black text-white mb-3 leading-tight">
                                Join{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C6F7] to-[#A855F7]">
                                    CodeSapiens
                                </span>
                            </h3>
                            <p className="text-gray-400 text-sm font-light leading-relaxed">
                                You can't even finish a coffee in 1 minute, but you can join TN's biggest student community in under{' '}
                                <span className="text-[#00C6F7] font-bold">20 seconds</span>.
                            </p>
                        </div>

                        {/* Google Join Button */}
                        <button
                            onClick={handleGoogleLogin}
                            className="relative z-10 w-full bg-gradient-to-r from-[#00C6F7] to-[#A855F7] text-black font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all mb-3 group shadow-[0_0_30px_rgba(0,198,247,0.3)] text-sm uppercase tracking-widest"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Join Now
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={handleClose}
                            className="relative z-10 w-full text-gray-600 text-xs hover:text-gray-400 transition-colors font-medium tracking-widest uppercase py-1"
                        >
                            Maybe later
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default LandingPopup;
