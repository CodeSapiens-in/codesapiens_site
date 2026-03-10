import React, { useRef } from 'react';
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useVelocity,
    useAnimationFrame,
    useMotionValue
} from 'framer-motion';

function ParallaxText({ children, baseVelocity = 100 }) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false
    });

    // Wrap logic for infinite scroll
    const x = useTransform(baseX, (v) => `${((v % 25) + 25) % 25 - 50}%`);

    const directionFactor = useRef(1);
    useAnimationFrame((t, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

        if (velocityFactor.get() < 0) {
            directionFactor.current = -1;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = 1;
        }

        moveBy += directionFactor.current * moveBy * velocityFactor.get();

        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div className="flex whitespace-nowrap flex-nowrap overflow-hidden py-4">
            <motion.div className="flex whitespace-nowrap flex-nowrap text-4xl md:text-6xl font-black uppercase tracking-tighter" style={{ x }}>
                <span className="mr-12">{children} </span>
                <span className="mr-12">{children} </span>
                <span className="mr-12">{children} </span>
                <span className="mr-12">{children} </span>
            </motion.div>
        </div>
    );
}

const Marquee = ({ topItems, bottomItems }) => {
    const renderItems = (items) => (
        <>
            {items.map((item, i) => (
                <span
                    key={i}
                    className="inline-flex items-center gap-6 px-12 text-slate-100 font-display font-black hover:text-quantum-blue transition-colors duration-500 cursor-default"
                >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-100 group-hover:bg-quantum-blue transition-colors" />
                    {item}
                </span>
            ))}
        </>
    );

    return (
        <div className="py-20 overflow-hidden bg-transparent">
            <div className="relative mb-4">
                <ParallaxText baseVelocity={-2}>
                    {renderItems(topItems)}
                </ParallaxText>
            </div>
            <div className="relative">
                <ParallaxText baseVelocity={2}>
                    {renderItems(bottomItems)}
                </ParallaxText>
            </div>
        </div>
    );
};

export default Marquee;
