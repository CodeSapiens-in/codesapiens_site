import React from 'react';
import { motion } from 'framer-motion';

// ─────────────────────────────────────────────
//  SPACE THEME — matches ResumeAnalyzer &
//  DashboardBlogSection
//  Warp-in: pages feel like jumping out of
//  hyperspace — slight scale + fade + upward drift
// ─────────────────────────────────────────────

const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.985, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0,  scale: 1,     filter: 'blur(0px)' }}
            exit={{    opacity: 0, y: -12, scale: 1.01,  filter: 'blur(4px)' }}
            transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1], // custom cubic — snappy deceleration
            }}
            className="w-full h-full"
        >
            {/* Starfield flash on enter — fades out immediately */}
            <motion.div
                initial={{ opacity: 0.06 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="pointer-events-none fixed inset-0 z-[9999] bg-gradient-to-br from-[#4F8EF7]/10 via-[#080B14]/60 to-[#9B6DFF]/10"
                aria-hidden="true"
            />

            {children}
        </motion.div>
    );
};

export default PageTransition;

