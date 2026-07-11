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

    return createPortal(
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 pointer-events-none">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto" onClick={handleClose}></div>
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="bg-[#F7F7FF] border border-[#27187e20] p-6 sm:p-8 rounded-xl shadow-[0_8px_32px_0_rgba(39,24,126,0.15)] w-full max-w-sm relative pointer-events-auto overflow-hidden text-center font-dm-sans"
                    >
                        {/* Top accent bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#27187E]"></div>

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-[#27187E] transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="mb-6 mt-2">
                            {/* Timer */}
                            <div className="flex items-center justify-center gap-1.5 mb-6">
                                {/* Minutes */}
                                <div className="flex gap-1">
                                    <div className={`w-9 h-11 rounded-md border flex items-center justify-center text-lg font-bold font-mono transition-colors ${timeLeft === 0 ? 'border-red-300 text-red-500 bg-red-50' : 'border-[#27187e20] text-[#27187E] bg-white'}`}>
                                        {timeLeft === 0 ? 'O' : Math.floor(timeLeft / 60).toString().padStart(2, '0')[0]}
                                    </div>
                                    <div className={`w-9 h-11 rounded-md border flex items-center justify-center text-lg font-bold font-mono transition-colors ${timeLeft === 0 ? 'border-red-300 text-red-500 bg-red-50' : 'border-[#27187e20] text-[#27187E] bg-white'}`}>
                                        {timeLeft === 0 ? 'O' : Math.floor(timeLeft / 60).toString().padStart(2, '0')[1]}
                                    </div>
                                </div>

                                <span className={`text-lg font-bold pb-0.5 ${timeLeft === 0 ? 'text-transparent' : 'text-gray-300'}`}>:</span>

                                {/* Seconds */}
                                <div className="flex gap-1">
                                    <div className={`w-9 h-11 rounded-md border flex items-center justify-center text-lg font-bold font-mono transition-colors ${timeLeft === 0 ? 'border-red-300 text-red-500 bg-red-50' : 'border-[#27187e20] text-[#27187E] bg-white'}`}>
                                        {timeLeft === 0 ? 'P' : (timeLeft % 60).toString().padStart(2, '0')[0]}
                                    </div>
                                    <div className={`w-9 h-11 rounded-md border flex items-center justify-center text-lg font-bold font-mono transition-colors ${timeLeft === 0 ? 'border-red-300 text-red-500 bg-red-50' : 'border-[#27187e20] text-[#27187E] bg-white'}`}>
                                        {timeLeft === 0 ? 'S' : (timeLeft % 60).toString().padStart(2, '0')[1]}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl sm:text-2xl font-medium tracking-tight mb-2">
                                Join <span className="italic text-[#27187E]">CodeSapiens</span>
                            </h3>
                            <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                                You can't even finish a coffee in 1 minute, but you can join TN's biggest student community in under{" "}
                                <span className="text-[#27187E] font-medium">20 seconds</span>.
                            </p>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            className="w-full bg-[#27187E] text-white font-medium py-3 px-4 rounded-md flex items-center justify-center gap-3 hover:bg-[#1F1366] transition-colors mb-3 group cursor-pointer"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Join Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={handleClose}
                            className="w-full text-sm text-gray-400 hover:text-[#27187E] transition-colors"
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