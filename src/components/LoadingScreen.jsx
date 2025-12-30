import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const duration = 2500; // Slightly longer for the effect to be appreciated
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
            }, 800); // 800ms delay at full black screen before fading out
            return () => clearTimeout(timeout);
        }
    }, [progress, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[9999] font-[Archivo Black] cursor-none"
        >
            {/* 
        Layer 1: Base Layer 
        Background: White
        Text: Black
        Visible where the wipe hasn't reached yet.
      */}
            <div className="absolute inset-0 bg-white text-black flex flex-col items-center justify-center">
                {/* Centered Content */}
                <div className="text-4xl md:text-6xl font-bold tracking-tighter uppercase relative z-10">
                    CodeSapiens
                </div>

                {/* Bottom Right Percentage */}
                <div
                    className="absolute bottom-6 right-6 md:bottom-12 md:right-12 text-6xl md:text-9xl font-black tracking-tighter leading-none z-10"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {Math.floor(progress)}%
                </div>
            </div>

            {/* 
        Layer 2: Wipe Layer (Overlay)
        Background: Black
        Text: White
        Width increases from 0% to 100%. 
        Overflow hidden clips the content to show the "wipe".
      */}
            <div
                className="absolute inset-0 bg-black text-white overflow-hidden border-r-[1px] border-black/10"
                style={{ width: `${progress}%` }}
            >
                {/* 
          Inner Container
          Must be exactly full screen size (w-screen h-screen) so content aligns perfectly 
          with the base layer regardless of the parent's width.
        */}
                <div className="w-screen h-screen flex flex-col items-center justify-center relative">
                    {/* Centered Content - must match Layer 1 EXACTLY */}
                    <div className="text-4xl md:text-6xl font-bold tracking-tighter uppercase relative z-10">
                        CodeSapiens
                    </div>

                    {/* Bottom Right Percentage - must match Layer 1 EXACTLY */}
                    <div
                        className="absolute bottom-6 right-6 md:bottom-12 md:right-12 text-6xl md:text-9xl font-black tracking-tighter leading-none z-10 opacity-100"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                        {Math.floor(progress)}%
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

export default LoadingScreen;
