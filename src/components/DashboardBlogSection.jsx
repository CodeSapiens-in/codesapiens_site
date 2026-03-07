import React, { useState, useEffect } from 'react';
import { FileText, Loader2, ChevronRight, Clock, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────
//  SPACE THEME TOKENS (matches ResumeAnalyzer)
//  bg-card:  #080B14   deep space navy
//  border:   #1A2240   nebula rim
//  primary:  #4F8EF7   starlight blue
//  accent:   #9B6DFF   nebula violet
//  teal:     #0FE8B4   pulsar teal
//  text:     #C8D6F0   moonlit silver
//  muted:    #4A5F80
// ─────────────────────────────────────────────

const DashboardBlogSection = ({ maxPosts = 3 }) => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => { fetchLatestBlogs(); }, []);

    const fetchLatestBlogs = async () => {
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select('id, title, slug, excerpt, cover_image, published_at, content')
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .limit(maxPosts);
            if (error) throw error;
            setBlogs(data || []);
        } catch (err) {
            console.error('Error fetching blogs:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getReadTime = (content) => {
        if (!content) return '1 min';
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        return `${Math.ceil(words / 200)} min`;
    };

    const getExcerpt = (blog) => {
        if (blog.excerpt) return blog.excerpt;
        const text = blog.content?.replace(/<[^>]*>/g, '') || '';
        return text.length > 80 ? text.substring(0, 80) + '...' : text;
    };

    /* ── Loading state ── */
    if (loading) {
        return (
            <div className="bg-[#080B14]/80 backdrop-blur-xl rounded-xl border border-[#1A2240] p-4 mb-6 shadow-[0_4px_24px_rgba(79,142,247,0.06)] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4F8EF7]/40 to-transparent" />
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F8EF7]/20 to-[#9B6DFF]/20 border border-[#4F8EF7]/30 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-[#4F8EF7]" />
                    </div>
                    <h2 className="text-sm font-bold text-white tracking-tight">Latest from Blog</h2>
                </div>
                <div className="flex items-center justify-center py-6">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#4F8EF7]" />
                        <span className="text-[10px] text-[#2A3D60] uppercase tracking-widest font-bold animate-pulse">Loading</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#080B14]/80 backdrop-blur-xl rounded-xl border border-[#1A2240] hover:border-[#4F8EF7]/30 p-4 mb-6 shadow-[0_4px_24px_rgba(79,142,247,0.06)] hover:shadow-[0_4px_28px_rgba(79,142,247,0.12)] transition-all duration-300 relative overflow-hidden">

            {/* Top shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4F8EF7]/40 to-transparent" />

            {/* Nebula corner glows */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#9B6DFF] rounded-full blur-[60px] opacity-[0.08] pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#4F8EF7] rounded-full blur-[55px] opacity-[0.05] pointer-events-none" />

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-3.5 relative z-10">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F8EF7]/20 to-[#9B6DFF]/20 border border-[#4F8EF7]/30 flex items-center justify-center shadow-[0_0_8px_rgba(79,142,247,0.15)]">
                        <FileText className="w-3.5 h-3.5 text-[#4F8EF7]" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-tight leading-none">Latest from Blog</h2>
                        <p className="text-[9px] text-[#2A3D60] uppercase tracking-widest font-bold mt-0.5">Community Updates</p>
                    </div>
                </div>

                {blogs.length > 0 && (
                    <button
                        onClick={() => navigate('/blogs')}
                        className="flex items-center gap-1 text-[10px] text-[#4F8EF7] hover:text-white font-bold uppercase tracking-widest transition-all group px-2.5 py-1 rounded-lg border border-[#4F8EF7]/20 hover:border-[#4F8EF7]/50 hover:bg-[#4F8EF7]/10"
                    >
                        View All
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                )}
            </div>

            {/* ── Empty state ── */}
            {blogs.length === 0 ? (
                <div className="text-center py-8 relative z-10">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[#04060F] border border-[#1A2240] rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(79,142,247,0.05)]">
                        <FileText className="w-5 h-5 text-[#1A2A50]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#2A3D60] mb-1">No articles yet</h3>
                    <p className="text-[#1E2A40] text-xs">Check back soon for new content!</p>
                </div>
            ) : (
                /* ── Blog list ── */
                <div className="space-y-1 relative z-10">
                    {blogs.map((blog) => (
                        <article
                            key={blog.id}
                            onClick={() => navigate(`/blog/${blog.slug}`)}
                            className="group flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-[#4F8EF7]/5 border border-transparent hover:border-[#4F8EF7]/10 transition-all duration-200"
                        >
                            {/* Thumbnail */}
                            {blog.cover_image ? (
                                <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border border-[#1A2240]">
                                    <img
                                        src={blog.cover_image}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            ) : (
                                <div className="w-11 h-11 rounded-lg flex-shrink-0 bg-gradient-to-br from-[#4F8EF7]/10 to-[#9B6DFF]/10 border border-[#1A2240] flex items-center justify-center">
                                    <span className="text-sm font-black text-[#4F8EF7] opacity-40">
                                        {blog.title?.charAt(0) || 'B'}
                                    </span>
                                </div>
                            )}

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[#C8D6F0] group-hover:text-[#4F8EF7] transition-colors line-clamp-1 text-xs mb-1">
                                    {blog.title}
                                </h3>
                                <div className="flex items-center gap-2 text-[9px] text-[#2A3D60] font-bold uppercase tracking-wider">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5 text-[#4F8EF7]" />
                                        {getReadTime(blog.content)} read
                                    </span>
                                    <span className="text-[#1A2240]">•</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-2.5 h-2.5 text-[#9B6DFF]" />
                                        {formatDate(blog.published_at)}
                                    </span>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex-shrink-0 w-5 h-5 rounded-full border border-[#1A2240] flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#4F8EF7] group-hover:to-[#9B6DFF] group-hover:border-transparent group-hover:shadow-[0_0_8px_rgba(79,142,247,0.3)] transition-all duration-200">
                                <ChevronRight className="w-2.5 h-2.5 text-[#2A3D60] group-hover:text-white transition-colors" />
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardBlogSection;

