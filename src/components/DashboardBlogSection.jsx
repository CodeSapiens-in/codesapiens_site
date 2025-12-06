import React, { useState, useEffect } from 'react';
import { FileText, Loader2, ChevronRight, Clock, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const DashboardBlogSection = ({ maxPosts = 3 }) => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLatestBlogs();
    }, []);

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
        return new Date(dateString).toLocaleDateString('en-US', {
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

    const getExcerpt = (blog) => {
        if (blog.excerpt) return blog.excerpt;
        const text = blog.content?.replace(/<[^>]*>/g, '') || '';
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center space-x-3 mb-6">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-900">Latest from Blog</h2>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-900">Latest from Blog</h2>
                </div>
                {blogs.length > 0 && (
                    <button
                        onClick={() => navigate('/blogs')}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        View All
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                )}
            </div>

            {blogs.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No articles yet</h3>
                    <p className="text-gray-500">Check back soon for new content from our community!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {blogs.map((blog) => (
                        <article
                            key={blog.id}
                            onClick={() => navigate(`/blog/${blog.slug}`)}
                            className="group flex gap-4 p-3 -mx-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            {/* Thumbnail */}
                            {blog.cover_image && (
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={blog.cover_image}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                                    {blog.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                    {getExcerpt(blog)}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {getReadTime(blog.content)} read
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(blog.published_at)}
                                    </span>
                                </div>
                            </div>

                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 self-center" />
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardBlogSection;
