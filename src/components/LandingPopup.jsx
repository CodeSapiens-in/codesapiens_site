import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Show popup after 3 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
    };

    const handleGoogleLogin = () => {
        navigate('/auth');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 pointer-events-none">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={handleClose}></div>
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="bg-[#1E1919] border border-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-md relative pointer-events-auto overflow-hidden"
                    >
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0061FE] to-[#00C6F7]"></div>

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-6 mt-2">
                            <div className="w-12 h-12 bg-[#0061FE]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <img
                                    src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg"
                                    alt="Logo"
                                    className="w-8 h-8 rounded-full"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Join CodeSapiens</h3>
                            <p className="text-gray-400 text-sm">
                                Unlock exclusive events, mentorship, and connect with 1500+ students.
                            </p>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            className="w-full bg-white text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors mb-4"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                        </button>

                        <button
                            onClick={handleClose}
                            className="w-full text-gray-500 text-sm hover:text-white transition-colors"
                        >
                            Maybe later
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LandingPopup;
