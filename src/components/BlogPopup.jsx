import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { BookOpen, X } from 'lucide-react';

const BlogPopup = ({ onClose }) => {
    return createPortal(
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[99999] md:w-full md:max-w-sm bg-[#0D0D2B]/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_48px_rgba(0,198,247,0.2)] border border-[#00C6F7]/25 overflow-hidden"
        >
            {/* Top shimmer gradient bar */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00C6F7] to-[#A855F7]" />

            {/* Ambient glow inside */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#A855F7] rounded-full blur-[60px] opacity-15 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#00C6F7] rounded-full blur-[60px] opacity-10 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 px-5 py-4 flex justify-between items-center border-b border-[#00C6F7]/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C6F7]/20 to-[#A855F7]/20 border border-[#00C6F7]/30 flex items-center justify-center shadow-[0_0_10px_rgba(0,198,247,0.2)]">
                        <BookOpen className="w-4 h-4 text-[#00C6F7]" />
                    </div>
                    <div>
                        <span className="font-bold text-white text-sm">New Insights!</span>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00C6F7] animate-pulse" />
                            <span className="text-[10px] text-[#00C6F7] font-bold uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-600 hover:text-white hover:bg-[#00C6F7]/10 p-1.5 rounded-full transition-all border border-transparent hover:border-[#00C6F7]/30"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Body */}
            <div className="relative z-10 p-6">
                <h3 className="text-xl font-black text-white mb-2 leading-tight">
                    Explore Our
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00C6F7] to-[#A855F7]">
                        Latest Blogs
                    </span>
                </h3>
                <p className="text-gray-500 mb-5 text-sm font-light leading-relaxed">
                    Discover stories, tutorials, and updates from the community.
                </p>
                <a
                    href="/blogs"
                    className="block w-full text-center bg-gradient-to-r from-[#00C6F7] to-[#A855F7] text-black py-3 rounded-xl font-black hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_24px_rgba(0,198,247,0.3)] text-sm uppercase tracking-widest"
                >
                    Read Now →
                </a>
            </div>
        </motion.div>,
        document.body
    );
};

export default BlogPopup;
