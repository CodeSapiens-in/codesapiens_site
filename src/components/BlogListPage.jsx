import React, { useState, useEffect } from 'react';
import { FileText, Loader2, ChevronRight, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import BlogCard from './BlogCard';

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

    const featuredBlog = filteredBlogs[0];
    const otherBlogs = filteredBlogs.slice(1);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                            CodeSapiens Blog
                        </h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                            Insights, tutorials, and stories from our community of developers and learners.
                        </p>

                        {/* Search */}
                        <div className="max-w-md mx-auto relative">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-white/30 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={fetchBlogs}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {blogs.length === 0 ? 'No blog posts yet' : 'No matching articles'}
                        </h3>
                        <p className="text-gray-500">
                            {blogs.length === 0
                                ? 'Check back soon for new content!'
                                : 'Try adjusting your search terms.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Featured Post */}
                        {featuredBlog && (
                            <section className="mb-12">
                                <BlogCard blog={featuredBlog} variant="featured" />
                            </section>
                        )}

                        {/* Blog Grid */}
                        {otherBlogs.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Latest Articles
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {otherBlogs.map((blog) => (
                                        <BlogCard key={blog.id} blog={blog} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default BlogListPage;
