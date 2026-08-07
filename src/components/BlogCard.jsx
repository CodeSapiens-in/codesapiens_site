import React from 'react';
import { Clock, Calendar, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const BlogCard = ({ blog, variant = 'default' }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getReadTime = (content) => {
        if (!content) return '1 min';
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} min`;
    };

    const getExcerpt = (content, maxLength = 120) => {
        if (blog.excerpt) return blog.excerpt;
        const text = content?.replace(/<[^>]*>/g, '') || '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // --- FEATURED CARD (Large) ---
    if (variant === 'featured') {
        return (
            <motion.article
                onClick={() => navigate(`/blog/${blog.slug}`)}
                className="group relative bg-[#0D0D2B]/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_48px_rgba(0,198,247,0.12)] overflow-hidden cursor-pointer border border-[#00C6F7]/20 hover:border-[#00C6F7]/50 transition-all duration-300"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
            >
                <div className="grid md:grid-cols-2 gap-0 h-full">
                    {/* Image */}
                    <div className="relative h-64 md:h-full overflow-hidden">
                        {blog.cover_image ? (
                            <img
                                src={blog.cover_image}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#00C6F7]/20 to-[#A855F7]/20 flex items-center justify-center">
                                <span className="text-white text-8xl font-black opacity-10">
                                    {blog.title?.charAt(0) || 'B'}
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D2B]/60 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-8 lg:p-10 flex flex-col justify-center bg-transparent">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#00C6F7]/20 to-[#A855F7]/20 border border-[#00C6F7]/30 text-[#00C6F7] text-xs font-bold uppercase tracking-wider rounded-full mb-6 w-fit">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00C6F7] animate-pulse" />
                            Featured Story
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00C6F7] group-hover:to-[#A855F7] transition-all leading-tight">
                            {blog.title}
                        </h2>
                        <p className="text-gray-400 mb-6 line-clamp-3 text-base font-light leading-relaxed">
                            {getExcerpt(blog.content, 200)}
                        </p>
                        <div className="mt-auto flex items-center justify-between border-t border-[#00C6F7]/10 pt-6">
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-600 uppercase tracking-widest">
                                <span>{getReadTime(blog.content)} READ</span>
                                <span className="text-[#00C6F7]/40">•</span>
                                <span>{formatDate(blog.published_at)}</span>
                            </div>
                            <div className="w-12 h-12 bg-[#0A0A0F] border border-[#00C6F7]/20 rounded-full flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#00C6F7] group-hover:to-[#A855F7] group-hover:border-transparent transition-all shadow-[0_0_15px_rgba(0,198,247,0.1)] group-hover:shadow-[0_0_20px_rgba(0,198,247,0.4)]">
                                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.article>
        );
    }

    // --- COMPACT ROW (Sidebar/List) ---
    if (variant === 'compact') {
        return (
            <motion.article
                onClick={() => navigate(`/blog/${blog.slug}`)}
                className="group flex items-center gap-4 p-4 bg-[#0D0D2B]/80 backdrop-blur-sm rounded-xl border border-[#00C6F7]/15 hover:border-[#00C6F7]/40 cursor-pointer transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,198,247,0.1)]"
                whileHover={{ x: 5 }}
            >
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#0A0A0F] border border-[#00C6F7]/10">
                    {blog.cover_image ? (
                        <img
                            src={blog.cover_image}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#00C6F7]/10 to-[#A855F7]/10 flex items-center justify-center">
                            <span className="text-[#00C6F7] text-2xl font-black opacity-40">
                                {blog.title?.charAt(0) || 'B'}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-200 group-hover:text-[#00C6F7] transition-colors line-clamp-2 mb-1 text-sm">
                        {blog.title}
                    </h3>
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        {formatDate(blog.published_at)}
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-[#00C6F7] transition-colors flex-shrink-0" />
            </motion.article>
        );
    }

    // --- DEFAULT BENTO CARD (Grid) ---
    return (
        <motion.article
            onClick={() => navigate(`/blog/${blog.slug}`)}
            className="group relative bg-[#0D0D2B]/80 backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full border border-[#00C6F7]/15 hover:border-[#00C6F7]/45 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,198,247,0.15)]"
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* Top gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00C6F7]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Image Area */}
            <div className="relative h-56 overflow-hidden">
                {blog.cover_image ? (
                    <img
                        src={blog.cover_image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0A0A0F] via-[#0D0D2B] to-[#0A0A0F] flex items-center justify-center relative overflow-hidden">
                        {/* Grid pattern */}
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: 'linear-gradient(#00C6F7 1px, transparent 1px), linear-gradient(90deg, #00C6F7 1px, transparent 1px)',
                                backgroundSize: '24px 24px'
                            }}
                        />
                        {/* Glow blob */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-[#00C6F7] rounded-full blur-[60px] opacity-10" />
                        </div>
                        <span className="text-white text-6xl font-black opacity-10 z-10">
                            {blog.title?.charAt(0) || 'B'}
                        </span>
                    </div>
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D2B]/80 via-transparent to-transparent" />

                {/* Read Time Badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#0A0A0F]/80 backdrop-blur-md border border-[#00C6F7]/30 rounded-lg text-xs font-bold uppercase tracking-wider text-[#00C6F7] shadow-[0_0_10px_rgba(0,198,247,0.2)]">
                    {getReadTime(blog.content)}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-7 flex flex-col flex-1">
                <div className="mb-4">
                    <h3 className="text-xl md:text-2xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00C6F7] group-hover:to-[#A855F7] transition-all leading-tight line-clamp-2">
                        {blog.title}
                    </h3>
                    <p className="text-gray-500 text-sm font-light line-clamp-3 leading-relaxed">
                        {getExcerpt(blog.content)}
                    </p>
                </div>

                <div className="mt-auto pt-5 border-t border-[#00C6F7]/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Author Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00C6F7]/20 to-[#A855F7]/20 border border-[#00C6F7]/20 flex items-center justify-center text-xs font-bold text-[#00C6F7]">
                            {blog.author?.display_name?.charAt(0) || <User className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-300">{blog.author?.display_name || 'CodeSapiens'}</span>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{formatDate(blog.published_at)}</span>
                        </div>
                    </div>

                    <div className="w-9 h-9 rounded-full border border-[#00C6F7]/20 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#00C6F7] group-hover:to-[#A855F7] group-hover:border-transparent transition-all shadow-[0_0_10px_rgba(0,198,247,0.05)] group-hover:shadow-[0_0_18px_rgba(0,198,247,0.35)]">
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
                    </div>
                </div>
            </div>
        </motion.article>
    );
};

export default BlogCard;
