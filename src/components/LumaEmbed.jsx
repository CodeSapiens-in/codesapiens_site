import React, { useState } from 'react';
import { Loader2, Calendar } from 'lucide-react';

// ─────────────────────────────────────────────
//  SPACE THEME — matches ResumeAnalyzer,
//  DashboardBlogSection & PageTransition
//  bg-card:  #080B14   deep space navy
//  border:   #1A2240   nebula rim
//  primary:  #4F8EF7   starlight blue
//  accent:   #9B6DFF   nebula violet
//  text:     #C8D6F0   moonlit silver
// ─────────────────────────────────────────────

export default function LumaEmbed({ src, style, title = 'Luma Calendar' }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            style={{ maxWidth: 1000, margin: '0 auto' }}
            className="relative rounded-2xl overflow-hidden border border-[#1A2240] shadow-[0_4px_32px_rgba(79,142,247,0.08)] bg-[#080B14]"
        >
            {/* Top shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4F8EF7]/40 to-transparent z-10" />

            {/* Nebula corner glows */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#9B6DFF] rounded-full blur-[70px] opacity-[0.07] pointer-events-none z-0" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#4F8EF7] rounded-full blur-[65px] opacity-[0.05] pointer-events-none z-0" />

            {/* Header bar */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#1A2240] relative z-10">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F8EF7]/20 to-[#9B6DFF]/20 border border-[#4F8EF7]/30 flex items-center justify-center shadow-[0_0_8px_rgba(79,142,247,0.15)]">
                    <Calendar className="w-3.5 h-3.5 text-[#4F8EF7]" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white tracking-tight leading-none">{title}</p>
                    <p className="text-[9px] text-[#2A3D60] uppercase tracking-widest font-bold mt-0.5">Upcoming Events</p>
                </div>
            </div>

            {/* Loading skeleton */}
            {!loaded && (
                <div className="absolute inset-0 top-[52px] flex flex-col items-center justify-center gap-3 bg-[#080B14] z-10">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-[#04060F] border border-[#1A2240] flex items-center justify-center shadow-[0_0_24px_rgba(79,142,247,0.08)]">
                            <Loader2 className="w-5 h-5 animate-spin text-[#4F8EF7]" />
                        </div>
                        {/* Orbit ring */}
                        <div
                            className="absolute inset-[-8px] rounded-full border border-[#4F8EF7]/15 border-dashed animate-spin"
                            style={{ animationDuration: '18s' }}
                        />
                    </div>
                    <span className="text-[10px] text-[#2A3D60] uppercase tracking-widest font-bold animate-pulse">
                        Loading Calendar
                    </span>
                </div>
            )}

            {/* iframe */}
            <iframe
                src={src}
                title={title}
                onLoad={() => setLoaded(true)}
                loading="lazy"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                style={{
                    width: '100%',
                    height: 760,
                    border: 0,
                    display: 'block',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    background: 'transparent',
                    ...style,
                }}
            />
        </div>
    );
}

// Usage:
// <LumaEmbed src="https://lu.ma/embed/your-calendar-id?view=calendar" />
// <LumaEmbed src="..." title="Community Events" style={{ height: 600 }} />
