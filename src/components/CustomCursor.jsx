import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const [isHovering, setIsHovering] = useState(false);
    
    // Smooth spring motion for the cursor
    const mouseX = useSpring(0, { stiffness: 500, damping: 28, mass: 0.5 });
    const mouseY = useSpring(0, { stiffness: 500, damping: 28, mass: 0.5 });

    useEffect(() => {
        const moveMouse = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleHover = (e) => {
            const target = e.target;
            const isClickable = 
                target.tagName === 'A' || 
                target.tagName === 'BUTTON' || 
                target.closest('a') || 
                target.closest('button') ||
                window.getComputedStyle(target).cursor === 'pointer';
            
            setIsHovering(isClickable);
        };

        window.addEventListener('mousemove', moveMouse);
        window.addEventListener('mouseover', handleHover);

        return () => {
            window.removeEventListener('mousemove', moveMouse);
            window.removeEventListener('mouseover', handleHover);
        };
    }, [mouseX, mouseY]);

    return (
        <>
            {/* Main Dot - Quantum Blue for light mode visibility */}
            <motion.div
                className="fixed top-0 left-0 w-2.5 h-2.5 bg-quantum-blue rounded-full pointer-events-none z-[10000] hidden md:block"
                style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
                animate={{
                    scale: isHovering ? 3.5 : 1,
                    backgroundColor: isHovering ? 'rgba(0, 85, 255, 0.2)' : 'rgba(0, 85, 255, 1)',
                }}
            />
            {/* Outer Ring - Subtle slate for professional finish */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 border border-slate-400/20 rounded-full pointer-events-none z-[9999] hidden md:block"
                style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
                animate={{
                    scale: isHovering ? 1.4 : 1,
                    opacity: isHovering ? 0 : 1,
                }}
            />
        </>
    );
};

export default CustomCursor;
