import React, { useState, useEffect } from 'react';
import {
    FileText, Plus, Search, Edit, Trash2, Eye, EyeOff,
    Loader2, X, Clock, Calendar, ChevronRight, Mail
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminBlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [deleteModalBlog, setDeleteModalBlog] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthAndFetchBlogs();
    }, []);

    const checkAuthAndFetchBlogs = async () => {
        try {
            setAuthChecking(true);
            setLoading(true);
            setError(null);

            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                setIsAuthenticated(false);
                setAuthChecking(false);
                return;
            }

            // Check if user is admin
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('role')
                .eq('uid', user.id)
                .single();

            if (profileError || profileData?.role !== 'admin') {
                navigate('/');
                return;
            }

            setIsAuthenticated(true);
            await fetchBlogs();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setAuthChecking(false);
        }
    };

    const fetchBlogs = async () => {
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select(`
          *,
          author:users!blogs_author_id_fkey(display_name, email)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBlogs(data || []);
        } catch (err) {
            setError(err.message);
        }
    };

    const togglePublishStatus = async (blog) => {
        try {
            const newStatus = blog.status === 'published' ? 'draft' : 'published';
            const { error } = await supabase
                .from('blogs')
                .update({
                    status: newStatus,
                    published_at: newStatus === 'published' ? new Date().toISOString() : null
                })
                .eq('id', blog.id);

            if (error) throw error;
            await fetchBlogs();
        } catch (err) {
            alert('Error updating blog status: ' + err.message);
        }
    };

    const deleteBlog = async (id) => {
        try {
            const { error } = await supabase
                .from('blogs')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setDeleteModalBlog(null);
            await fetchBlogs();
        } catch (err) {
            alert('Error deleting blog: ' + err.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not published';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getReadTime = (content) => {
        if (!content) return '1 min read';
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} min read`;
    };

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (blog.excerpt && blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filter === 'all' || blog.status === filter;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: blogs.length,
        published: blogs.filter(b => b.status === 'published').length,
        drafts: blogs.filter(b => b.status === 'draft').length
    };

    if (authChecking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <FileText className="w-8 h-8 text-blue-600" />
                                Blog Management
                            </h1>
                            <p className="text-gray-600 mt-1">Create and manage blog posts for your community</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/blog/create')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Blog Post
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Posts</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Published</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{stats.published}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Eye className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Drafts</p>
                                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.drafts}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <EyeOff className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Drafts</option>
                        </select>
                    </div>
                </div>

                {/* Blog List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <X className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={fetchBlogs}
                            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {blogs.length === 0 ? 'No blog posts yet' : 'No matching blogs'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {blogs.length === 0
                                ? 'Create your first blog post to share with your community.'
                                : 'Try adjusting your search or filter criteria.'}
                        </p>
                        {blogs.length === 0 && (
                            <button
                                onClick={() => navigate('/admin/blog/create')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create First Post
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBlogs.map((blog) => (
                            <div
                                key={blog.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    {/* Cover Image */}
                                    {blog.cover_image && (
                                        <div className="w-full lg:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={blog.cover_image}
                                                alt={blog.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                                    {blog.title}
                                                </h3>
                                                {blog.excerpt && (
                                                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                                        {blog.excerpt}
                                                    </p>
                                                )}
                                            </div>
                                            <span
                                                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${blog.status === 'published'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                            >
                                                {blog.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {getReadTime(blog.content)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(blog.published_at || blog.created_at)}
                                            </span>
                                            {blog.author && (
                                                <span>
                                                    By {blog.author.display_name || blog.author.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 lg:flex-shrink-0">
                                        <button
                                            onClick={() => togglePublishStatus(blog)}
                                            className={`p-2 rounded-lg transition-colors ${blog.status === 'published'
                                                ? 'text-yellow-600 hover:bg-yellow-50'
                                                : 'text-green-600 hover:bg-green-50'
                                                }`}
                                            title={blog.status === 'published' ? 'Unpublish' : 'Publish'}
                                        >
                                            {blog.status === 'published' ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/blog/email/${blog.id}`)}
                                            className="p-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                                            title="Send via Email"
                                        >
                                            <Mail className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/blog/edit/${blog.id}`)}
                                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModalBlog(blog)}
                                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                            title="View"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModalBlog && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Blog Post</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to delete "{deleteModalBlog.title}"? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteModalBlog(null)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteBlog(deleteModalBlog.id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminBlogList;
