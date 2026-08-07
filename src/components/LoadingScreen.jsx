import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const duration = 2500;
        const intervalTime = 20;
        const steps = duration / intervalTime;
        const increment = 100 / steps;

        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = prev + increment;
                if (next >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return next;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (progress >= 100) {
            const timeout = setTimeout(() => {
                onComplete();
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [progress, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[9999] font-[Archivo_Black] cursor-none"
        >
            {/*
                Layer 1: Base Layer
                Background: deep space dark
                Text: dim white
                Visible where the wipe hasn't reached yet.
            */}
            <div className="absolute inset-0 bg-[#0A0A0F] text-gray-800 flex flex-col items-center justify-center">
                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'linear-gradient(#00C6F7 1px, transparent 1px), linear-gradient(90deg, #00C6F7 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }}
                />

                {/* Center brand */}
                <div className="text-4xl md:text-6xl font-black tracking-tighter uppercase relative z-10 text-gray-800">
                    CodeSapiens
                </div>

                {/* Bottom right percentage */}
                <div
                    className="absolute bottom-6 right-6 md:bottom-12 md:right-12 text-6xl md:text-9xl font-black tracking-tighter leading-none z-10 text-gray-800"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {Math.floor(progress)}%
                </div>

                {/* Bottom left tag */}
                <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-800">Loading</span>
                </div>
            </div>

            {/*
                Layer 2: Wipe Layer (Overlay)
                Background: deep dark with cyan/purple glow
                Text: bright white + cyan accents
                Width increases from 0% to 100%.
            */}
            <div
                className="absolute inset-0 bg-[#0D0D2B] text-white overflow-hidden"
                style={{
                    width: `${progress}%`,
                    borderRight: progress < 100 ? '1px solid rgba(0,198,247,0.4)' : 'none',
                    boxShadow: progress < 100 ? '2px 0 20px rgba(0,198,247,0.2)' : 'none'
                }}
            >
                {/*
                    Inner container must be full screen (w-screen h-screen)
                    so content aligns perfectly with base layer.
                */}
                <div className="w-screen h-screen flex flex-col items-center justify-center relative">

                    {/* Cyan grid overlay on dark layer */}
                    <div
                        className="absolute inset-0 opacity-[0.06]"
                        style={{
                            backgroundImage: 'linear-gradient(#00C6F7 1px, transparent 1px), linear-gradient(90deg, #00C6F7 1px, transparent 1px)',
                            backgroundSize: '50px 50px'
                        }}
                    />

                    {/* Ambient glow center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00C6F7] rounded-full blur-[140px] opacity-[0.06] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#A855F7] rounded-full blur-[120px] opacity-[0.08] pointer-events-none" />

                    {/* Center brand — gradient text */}
                    <div className="text-4xl md:text-6xl font-black tracking-tighter uppercase relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#00C6F7] to-[#A855F7]">
                        CodeSapiens
                    </div>

                    {/* Bottom right percentage — gradient */}
                    <div
                        className="absolute bottom-6 right-6 md:bottom-12 md:right-12 text-6xl md:text-9xl font-black tracking-tighter leading-none z-10 text-transparent bg-clip-text bg-gradient-to-b from-[#00C6F7] to-[#A855F7]"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                        {Math.floor(progress)}%
                    </div>

                    {/* Bottom left tag */}
                    <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-10 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00C6F7] animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[#00C6F7]">Loading</span>
                    </div>

                    {/* Progress bar at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#00C6F7] via-[#A855F7] to-transparent z-20" />
                </div>
            </div>

        </motion.div>
    );
};

export default LoadingScreen;

