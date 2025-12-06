import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Calendar, Clock, User, Share2, Copy,
    Loader2, Twitter, Linkedin, Facebook, Check
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import BlogCard from '../components/BlogCard';

const BlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);

    useEffect(() => {
        fetchBlog();
    }, [slug]);

    const fetchBlog = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch the blog post
            const { data, error } = await supabase
                .from('blogs')
                .select(`
          *,
          author:users!blogs_author_id_fkey(display_name, email, avatar)
        `)
                .eq('slug', slug)
                .eq('status', 'published')
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    setError('Blog post not found');
                } else {
                    throw error;
                }
                return;
            }

            setBlog(data);

            // Fetch related blogs (excluding current)
            const { data: related } = await supabase
                .from('blogs')
                .select('id, title, slug, excerpt, cover_image, published_at, content')
                .eq('status', 'published')
                .neq('id', data.id)
                .order('published_at', { ascending: false })
                .limit(3);

            setRelatedBlogs(related || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getReadTime = (content) => {
        if (!content) return '1 min';
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} min read`;
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareToTwitter = () => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(blog?.title || 'Check out this article');
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    };

    const shareToLinkedIn = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    };

    const shareToFacebook = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading article...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        The article you're looking for doesn't exist or has been removed.
                    </p>
                    <button
                        onClick={() => navigate('/blogs')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Blog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => navigate('/blogs')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back to Blog</span>
                        </button>

                        {/* Share Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowShareMenu(!showShareMenu)}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                                <span className="hidden sm:inline">Share</span>
                            </button>

                            {showShareMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowShareMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                        <button
                                            onClick={copyLink}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                            {copied ? 'Copied!' : 'Copy Link'}
                                        </button>
                                        <button
                                            onClick={shareToTwitter}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Twitter className="w-5 h-5" />
                                            Twitter
                                        </button>
                                        <button
                                            onClick={shareToLinkedIn}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Linkedin className="w-5 h-5" />
                                            LinkedIn
                                        </button>
                                        <button
                                            onClick={shareToFacebook}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Facebook className="w-5 h-5" />
                                            Facebook
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <article>
                    {/* Cover Image */}
                    {blog.cover_image && (
                        <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-8">
                            <img
                                src={blog.cover_image}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>
                    )}

                    {/* Title & Meta */}
                    <header className="mb-8">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {blog.title}
                        </h1>

                        {blog.excerpt && (
                            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                                {blog.excerpt}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-gray-500 border-b border-gray-200 pb-6">
                            {blog.author && (
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-medium">
                                            {(blog.author.display_name || blog.author.email)?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-900">
                                        {blog.author.display_name || blog.author.email}
                                    </span>
                                </div>
                            )}
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(blog.published_at)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {getReadTime(blog.content)}
                            </span>
                        </div>
                    </header>

                    {/* Content */}
                    <div
                        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-600 prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </article>

                {/* Related Posts */}
                {relatedBlogs.length > 0 && (
                    <section className="mt-16 pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            More Articles
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedBlogs.map((relatedBlog) => (
                                <BlogCard key={relatedBlog.id} blog={relatedBlog} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Back to Blog */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/blogs')}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to All Articles
                    </button>
                </div>
            </main>
        </div>
    );
};

export default BlogDetail;
