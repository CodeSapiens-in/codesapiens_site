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
        // Check cooldown
        const FIVE_MINUTES_MS = 5 * 60 * 1000;
        const lastDismissed = localStorage.getItem('landingPopupDismissedAt');

        if (lastDismissed) {
            const dismissedTime = parseInt(lastDismissed, 10);
            if (Date.now() - dismissedTime < FIVE_MINUTES_MS) {
                return; // Still within cooldown
            }
        }

        // Show popup after 3 seconds
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
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={handleClose}></div>
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-2xl w-full max-w-md relative pointer-events-auto overflow-hidden text-center"
                    >
                        {/* Decorative Gradient Line */}
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-quantum-blue to-quantum-cyan"></div>

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6 mt-4">
                            {/* Box Timer */}
                            <div className="flex items-center justify-center gap-2 mb-6">
                                 {/* Minutes / OO */}
                                <div className="flex gap-1.5">
                                    <div className={`w-10 h-14 bg-slate-50 rounded-xl border ${timeLeft === 0 ? 'border-red-200' : 'border-slate-100'} flex items-center justify-center font-display font-black text-xl ${timeLeft === 0 ? 'text-red-500' : 'text-slate-900'} shadow-inner transition-colors`}>
                                        {timeLeft === 0 ? 'O' : Math.floor(timeLeft / 60).toString().padStart(2, '0')[0]}
                                    </div>
                                    <div className={`w-10 h-14 bg-slate-50 rounded-xl border ${timeLeft === 0 ? 'border-red-200' : 'border-slate-100'} flex items-center justify-center font-display font-black text-xl ${timeLeft === 0 ? 'text-red-500' : 'text-slate-900'} shadow-inner transition-colors`}>
                                        {timeLeft === 0 ? 'O' : Math.floor(timeLeft / 60).toString().padStart(2, '0')[1]}
                                    </div>
                                </div>

                                <span className={`text-slate-200 font-bold pb-1 text-2xl ${timeLeft === 0 ? 'text-transparent' : ''}`}>:</span>

                                {/* Seconds / PS */}
                                <div className="flex gap-1.5">
                                    <div className={`w-10 h-14 bg-slate-50 rounded-xl border ${timeLeft === 0 ? 'border-red-200' : 'border-slate-100'} flex items-center justify-center font-display font-black text-xl ${timeLeft === 0 ? 'text-red-500' : 'text-quantum-blue'} shadow-inner transition-colors`}>
                                        {timeLeft === 0 ? 'P' : (timeLeft % 60).toString().padStart(2, '0')[0]}
                                    </div>
                                    <div className={`w-10 h-14 bg-slate-50 rounded-xl border ${timeLeft === 0 ? 'border-red-200' : 'border-slate-100'} flex items-center justify-center font-display font-black text-xl ${timeLeft === 0 ? 'text-red-500' : 'text-quantum-blue'} shadow-inner transition-colors`}>
                                        {timeLeft === 0 ? 'S' : (timeLeft % 60).toString().padStart(2, '0')[1]}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-display font-black text-slate-900 mb-3">Join CodeSapiens</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                You can't even finish a coffee in 1 minute, but you can join Tennessee's biggest student community in under <span className="text-quantum-blue font-bold">20 seconds</span>.
                            </p>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            className="w-full bg-slate-900 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-quantum-blue transition-all mb-4 group shadow-xl shadow-slate-900/10"
                        >
                            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Join Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={handleClose}
                            className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
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
