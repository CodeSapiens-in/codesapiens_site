import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Save, Eye, Loader2, X, Image as ImageIcon,
    FileText, Clock
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

const AdminBlogEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        cover_image: '',
        status: 'draft'
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [userId, setUserId] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);

    // Quill editor modules configuration
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ],
        clipboard: {
            matchVisual: false
        }
    };

    const quillFormats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'blockquote', 'code-block',
        'list', 'bullet', 'indent',
        'direction', 'align',
        'link', 'image', 'video'
    ];

    useEffect(() => {
        checkAuthAndLoadBlog();
    }, [id]);

    const checkAuthAndLoadBlog = async () => {
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
            setUserId(user.id);

            // Load blog if editing
            if (id) {
                const { data: blogData, error: blogError } = await supabase
                    .from('blogs')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (blogError) {
                    setError('Blog not found');
                    return;
                }

                setFormData({
                    title: blogData.title || '',
                    slug: blogData.slug || '',
                    excerpt: blogData.excerpt || '',
                    content: blogData.content || '',
                    cover_image: blogData.cover_image || '',
                    status: blogData.status || 'draft'
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setAuthChecking(false);
        }
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 100);
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: isEditing ? prev.slug : generateSlug(title)
        }));
    };

    const handleEditorChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleSave = async (publishStatus = null) => {
        try {
            setSaving(true);
            setError(null);

            // Validation
            if (!formData.title.trim()) {
                setError('Title is required');
                return;
            }
            if (!formData.content.trim() || formData.content === '<p><br></p>') {
                setError('Content is required');
                return;
            }
            if (!formData.slug.trim()) {
                setError('Slug is required');
                return;
            }

            const status = publishStatus || formData.status;
            const blogData = {
                title: formData.title.trim(),
                slug: formData.slug.trim(),
                excerpt: formData.excerpt.trim() || null,
                content: formData.content,
                cover_image: formData.cover_image.trim() || null,
                status,
                published_at: status === 'published' ? new Date().toISOString() : null
            };

            if (isEditing) {
                const { error } = await supabase
                    .from('blogs')
                    .update(blogData)
                    .eq('id', id);

                if (error) throw error;
            } else {
                blogData.author_id = userId;
                const { error } = await supabase
                    .from('blogs')
                    .insert([blogData]);

                if (error) throw error;
            }

            navigate('/admin/blogs');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const getReadTime = () => {
        const words = formData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} min read`;
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading blog...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Custom styles for Quill editor */}
            <style>{`
        .ql-container {
          font-size: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .ql-editor {
          min-height: 500px;
          line-height: 1.6;
        }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 {
          color: #111827;
          font-weight: 600;
        }
        .ql-editor a {
          color: #2563eb;
        }
        .ql-editor pre {
          background-color: #1f2937;
          color: #e5e7eb;
          padding: 16px;
          border-radius: 8px;
        }
        .ql-editor blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 16px;
          margin-left: 0;
          font-style: italic;
          color: #4b5563;
        }
        .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
        .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background: #f9fafb;
        }
        .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
      `}</style>

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin/blogs')}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">
                                    {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {getReadTime()}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${formData.status === 'published'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {formData.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPreviewMode(!previewMode)}
                                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${previewMode
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Eye className="w-5 h-5 mr-2" />
                                Preview
                            </button>
                            <button
                                onClick={() => handleSave('draft')}
                                disabled={saving}
                                className="inline-flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                                Save Draft
                            </button>
                            <button
                                onClick={() => handleSave('published')}
                                disabled={saving}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                                Publish
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {previewMode ? (
                    /* Preview Mode */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">
                        {formData.cover_image && (
                            <img
                                src={formData.cover_image}
                                alt={formData.title}
                                className="w-full h-64 object-cover rounded-lg mb-6"
                            />
                        )}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title || 'Untitled'}</h1>
                        {formData.excerpt && (
                            <p className="text-xl text-gray-600 mb-6 border-l-4 border-blue-500 pl-4 italic">
                                {formData.excerpt}
                            </p>
                        )}
                        <div
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: formData.content }}
                        />
                    </div>
                ) : (
                    /* Edit Mode */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Editor */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <input
                                    type="text"
                                    placeholder="Enter your blog title..."
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="w-full text-2xl font-bold text-gray-900 border-0 focus:ring-0 placeholder:text-gray-400"
                                />
                            </div>

                            {/* Quill Editor */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={handleEditorChange}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder="Start writing your blog post..."
                                />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Slug */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL Slug
                                </label>
                                <div className="flex items-center">
                                    <span className="text-gray-400 text-sm">/blog/</span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        className="flex-1 border-0 focus:ring-0 text-sm text-gray-900 pl-1"
                                        placeholder="your-blog-slug"
                                    />
                                </div>
                            </div>

                            {/* Excerpt */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Excerpt
                                </label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Brief summary for previews..."
                                />
                            </div>

                            {/* Cover Image */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cover Image URL
                                </label>
                                <div className="space-y-3">
                                    <input
                                        type="url"
                                        value={formData.cover_image}
                                        onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {formData.cover_image ? (
                                        <img
                                            src={formData.cover_image}
                                            alt="Cover preview"
                                            className="w-full h-32 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminBlogEditor;
