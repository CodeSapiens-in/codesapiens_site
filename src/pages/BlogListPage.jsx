import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Search, Plus, MoreHorizontal, Link, Send, Edit2, Image as ImageIcon, PenTool, BookOpen, Type, AlignLeft, Quote, Video, Mic, Hash, Code, Terminal, Cpu, Globe } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import { motion } from 'framer-motion';

const FloatingElement = ({ children, className, delay = 0, x = 0, y = 0 }) => (
    <motion.div
        initial={{ y: y + 20, opacity: 0 }}
        animate={{ y: y, opacity: 1 }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
        className={`absolute ${className}`}
    >
        <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}
        >
            {children}
        </motion.div>
    </motion.div>
);

const BlogListPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('blogs')
                .select(`
          *,
          author:users!blogs_author_id_fkey(display_name, email)
        `)
                .eq('status', 'published')
                .order('published_at', { ascending: false });

            if (error) throw error;
            setBlogs(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.excerpt && blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Hero Section - Iconography Style */}
            <div className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center">

                {/* Massive Typography */}
                <motion.h1
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-[25vw] font-bold text-white tracking-tighter leading-none select-none z-10"
                >
                    Blog
                </motion.h1>

                {/* Floating Elements */}

                {/* 1. Card Stack (Top Left) */}
                <FloatingElement className="top-[15%] left-[10%] z-20" delay={0.2}>
                    <div className="relative w-64 h-48">
                        {/* Stacked Cards */}
                        <div className="absolute top-0 left-0 w-full h-full bg-white rounded-2xl shadow-xl transform -rotate-6 border border-gray-200" />
                        <div className="absolute top-2 left-2 w-full h-full bg-white rounded-2xl shadow-xl transform -rotate-3 border border-gray-200" />
                        <div className="absolute top-4 left-4 w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-white" />
                                    <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white" />
                                </div>
                                <div className="bg-blue-50 p-2 rounded-lg">
                                    <Plus className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Design Vault</h3>
                                <p className="text-xs text-gray-500">Private • 9 items</p>
                            </div>
                        </div>

                        {/* Orange Button */}
                        <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-[#FF5018] text-white p-4 rounded-xl shadow-lg flex flex-col items-center gap-1">
                            <Plus className="w-6 h-6" />
                            <span className="text-xs font-bold">New</span>
                        </div>
                    </div>
                </FloatingElement>

                {/* 2. UFO Icon (Right) */}
                <FloatingElement className="top-[40%] right-[15%] z-0" delay={0.5}>
                    <div className="text-white/20">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />
                        </svg>
                    </div>
                </FloatingElement>

                {/* 3. Action Menu (Bottom Left) */}
                <FloatingElement className="bottom-[15%] left-[20%] z-30" delay={0.4}>
                    <div className="bg-white rounded-2xl shadow-2xl p-2 w-48">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl text-blue-600 font-bold cursor-pointer hover:bg-blue-100 transition-colors">
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 text-gray-600 font-medium cursor-pointer hover:bg-gray-50 rounded-xl transition-colors">
                            <Link className="w-4 h-4" />
                            <span>Copy link</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 text-gray-600 font-medium cursor-pointer hover:bg-gray-50 rounded-xl transition-colors">
                            <Send className="w-4 h-4" />
                            <span>Send</span>
                        </div>
                    </div>
                    {/* Arrow Curve */}
                    <svg className="absolute -bottom-8 -right-8 w-16 h-16 text-blue-400 transform rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </FloatingElement>

                {/* 4. Image Placeholder (Bottom Right) */}
                <FloatingElement className="bottom-[10%] right-[10%] z-20" delay={0.6}>
                    <div className="bg-[#F7F5F2] w-64 h-64 rounded-3xl p-8 flex items-center justify-center shadow-2xl">
                        <div className="w-24 h-24 bg-gray-300 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </FloatingElement>

                {/* Grid Lines Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-10"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }}>
                </div>
            </div>

            {/* Iconography / Content Section */}
            <div className="relative bg-white py-24 overflow-hidden border-b border-blue-100">
                {/* Blue Grid Background */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(#E0F2FE 1px, transparent 1px), linear-gradient(90deg, #E0F2FE 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="mb-16 max-w-3xl">
                        <h2 className="text-5xl md:text-6xl font-bold text-[#1E1E1E] mb-6 tracking-tight">
                            Great stories are simple, intuitive, and scalable.
                        </h2>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Our platform blends these core elements and plays with typography, media, and layout to bring both personality and information to your writing.
                        </p>
                    </div>

                    {/* Icon Marquees */}
                    <div className="space-y-12">
                        {/* Row 1: Writing Tools */}
                        <div>
                            <p className="text-blue-500 font-medium mb-4 text-sm uppercase tracking-wider">Writing Tools</p>
                            <div className="flex overflow-hidden relative mask-linear-fade">
                                <motion.div
                                    className="flex gap-16 items-center whitespace-nowrap"
                                    animate={{ x: [0, -1000] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    {[...Array(2)].map((_, i) => (
                                        <React.Fragment key={i}>
                                            <FileText className="w-16 h-16 text-[#1E1E1E] stroke-[1.5]" />
                                            <Edit2 className="w-16 h-16 text-[#1E1E1E] stroke-[1.5]" />
                                            <PenTool className="w-16 h-16 text-[#1E1E1E] stroke-[1.5]" />
                                            <BookOpen className="w-16 h-16 text-[#1E1E1E] stroke-[1.5]" />
                                            <Type className="w-16 h-16 text-[#1E1E1E] stroke-[1.5]" />
                                            <AlignLeft className="w-16 h-16 text-[#1E1E1E] stroke-[1.5]" />
                                            <Quote className="w-16 h-16 text-[#1E1E1E] stroke-[1.5]" />
                                            <Link className="w-16 h-16 text-[#1E1E1E] stroke-[1.5]" />
                                        </React.Fragment>
                                    ))}
                                </motion.div>
                            </div>
                        </div>

                        {/* Row 2: Media & Tech */}
                        <div>
                            <p className="text-blue-500 font-medium mb-4 text-sm uppercase tracking-wider">Media & Tech</p>
                            <div className="flex overflow-hidden relative mask-linear-fade">
                                <motion.div
                                    className="flex gap-16 items-center whitespace-nowrap"
                                    animate={{ x: [-1000, 0] }}
                                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                >
                                    {[...Array(2)].map((_, i) => (
                                        <React.Fragment key={i}>
                                            <ImageIcon className="w-12 h-12 text-[#1E1E1E] stroke-[1.5]" />
                                            <Video className="w-12 h-12 text-[#1E1E1E] stroke-[1.5]" />
                                            <Mic className="w-12 h-12 text-[#1E1E1E] stroke-[1.5]" />
                                            <Hash className="w-12 h-12 text-[#1E1E1E] stroke-[1.5]" />
                                            <Code className="w-12 h-12 text-[#1E1E1E] stroke-[1.5]" />
                                            <Terminal className="w-12 h-12 text-[#1E1E1E] stroke-[1.5]" />
                                            <Cpu className="w-12 h-12 text-[#1E1E1E] stroke-[1.5]" />
                                            <Globe className="w-12 h-12 text-[#1E1E1E] stroke-[1.5]" />
                                        </React.Fragment>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">

                {/* Search Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <h3 className="text-4xl font-bold text-[#1E1E1E] mb-2 tracking-tight">Available Stories</h3>
                        <p className="text-gray-500 text-lg">Explore the latest insights and tutorials.</p>
                    </div>

                    <div className="w-full md:w-auto min-w-[300px] lg:min-w-[400px] relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border border-gray-200 text-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                    </div>
                ) : error ? (
                    <div className="text-center py-32 bg-red-50 rounded-3xl border border-red-100">
                        <p className="text-red-600 mb-6 text-lg font-medium">{error}</p>
                        <button
                            onClick={fetchBlogs}
                            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="text-center py-32 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                            <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {blogs.length === 0 ? 'No stories yet' : 'No matches found'}
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {blogs.length === 0
                                ? 'We are crafting new content. Check back soon!'
                                : `We couldn't find any articles matching "${searchTerm}". Try a different keyword.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                        {filteredBlogs.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BlogListPage;
