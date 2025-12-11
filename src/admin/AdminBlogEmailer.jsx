import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowLeft, Mail, Send, Users, Search, CheckSquare, Square,
    Loader2, X, Check, AlertCircle, User, Building, Filter
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { BACKEND_URL } from '../config';

const API_BASE_URL = BACKEND_URL;

const AdminBlogEmailer = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);

    // Data state
    const [blog, setBlog] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedEmails, setSelectedEmails] = useState(new Set());

    // UI state
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [collegeFilter, setCollegeFilter] = useState('all');
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        checkAuthAndLoad();
    }, [id]);

    // Auto-hide toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const checkAuthAndLoad = async () => {
        try {
            setAuthChecking(true);
            setLoading(true);

            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                setIsAuthenticated(false);
                setAuthChecking(false);
                return;
            }

            // Check admin role
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('role')
                .eq('uid', user.id)
                .single();

            if (profileError || profile?.role !== 'admin') {
                navigate('/');
                return;
            }

            setIsAuthenticated(true);

            // Fetch blog and students in parallel
            await Promise.all([fetchBlog(), fetchStudents()]);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setAuthChecking(false);
        }
    };

    const fetchBlog = async () => {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        setBlog(data);
    };

    const fetchStudents = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/students`);
            const data = await response.json();

            if (data.success) {
                setStudents(data.students);
            } else {
                throw new Error(data.error || 'Failed to fetch students');
            }
        } catch (err) {
            // Fallback to direct Supabase query
            const { data, error } = await supabase
                .from('users')
                .select('uid, display_name, email, college, role, avatar')
                .eq('role', 'student')
                .order('display_name', { ascending: true });

            if (error) throw error;
            setStudents(data || []);
        }
    };

    // Get unique colleges for filter
    const colleges = useMemo(() => {
        const collegeSet = new Set(students.map(s => s.college).filter(Boolean));
        return ['all', ...Array.from(collegeSet).sort()];
    }, [students]);

    // Filter students based on search and college filter
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch = !searchTerm ||
                student.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCollege = collegeFilter === 'all' || student.college === collegeFilter;

            return matchesSearch && matchesCollege;
        });
    }, [students, searchTerm, collegeFilter]);

    // Selection handlers
    const toggleStudent = (email) => {
        const newSelected = new Set(selectedEmails);
        if (newSelected.has(email)) {
            newSelected.delete(email);
        } else {
            newSelected.add(email);
        }
        setSelectedEmails(newSelected);
    };

    const selectAll = () => {
        const allEmails = new Set(filteredStudents.map(s => s.email).filter(Boolean));
        setSelectedEmails(allEmails);
    };

    const deselectAll = () => {
        setSelectedEmails(new Set());
    };

    // Send email handlers
    const sendToSelected = async () => {
        if (selectedEmails.size === 0) {
            setToast({ type: 'error', message: 'Please select at least one student' });
            return;
        }

        if (!confirm(`Send blog to ${selectedEmails.size} selected student(s)?`)) return;

        setSending(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/send-blog-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emails: Array.from(selectedEmails),
                    blog: {
                        title: blog.title,
                        excerpt: blog.excerpt,
                        content: blog.content,
                        cover_image: blog.cover_image,
                        slug: blog.slug
                    }
                })
            });

            const result = await response.json();

            if (result.success) {
                setToast({
                    type: 'success',
                    message: result.message
                });
                setSelectedEmails(new Set());
            } else {
                throw new Error(result.error || 'Failed to send emails');
            }
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        } finally {
            setSending(false);
        }
    };

    const sendToAll = async () => {
        if (!confirm(`Send blog to ALL ${students.length} students? This may take a while.`)) return;

        setSending(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/send-blog-email-all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    blog: {
                        title: blog.title,
                        excerpt: blog.excerpt,
                        content: blog.content,
                        cover_image: blog.cover_image,
                        slug: blog.slug
                    }
                })
            });

            const result = await response.json();

            if (result.success) {
                setToast({
                    type: 'success',
                    message: result.message
                });
            } else {
                throw new Error(result.error || 'Failed to send emails');
            }
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        } finally {
            setSending(false);
        }
    };

    // Loading state
    if (authChecking || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Auth error state
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    // Blog not found
    if (!blog) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Blog Not Found</h2>
                    <button
                        onClick={() => navigate('/admin/blogs')}
                        className="text-blue-600 hover:underline"
                    >
                        Back to Blogs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span>{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Sending Overlay */}
            {sending && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">Sending Emails...</h3>
                        <p className="text-gray-500 mt-2">Please wait, this may take a while.</p>
                    </div>
                </div>
            )}

            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/blogs')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Blogs
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Mail className="w-8 h-8 text-blue-600" />
                                Send Blog via Email
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Select students to receive this blog post
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Blog Preview */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="font-semibold text-gray-900">Blog Preview</h2>
                            </div>

                            {blog.cover_image && (
                                <img
                                    src={blog.cover_image}
                                    alt={blog.title}
                                    className="w-full h-40 object-cover"
                                />
                            )}

                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{blog.title}</h3>
                                {blog.excerpt && (
                                    <p className="text-gray-500 text-sm line-clamp-3">{blog.excerpt}</p>
                                )}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${blog.status === 'published'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {blog.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student Selection */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Selection Header */}
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-gray-500" />
                                        <h2 className="font-semibold text-gray-900">
                                            Students ({students.length})
                                        </h2>
                                        {selectedEmails.size > 0 && (
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                                {selectedEmails.size} selected
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={selectAll}
                                            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={deselectAll}
                                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Search and Filter */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search students..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select
                                            value={collegeFilter}
                                            onChange={(e) => setCollegeFilter(e.target.value)}
                                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                        >
                                            {colleges.map(college => (
                                                <option key={college} value={college}>
                                                    {college === 'all' ? 'All Colleges' : college}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Student List */}
                            <div className="max-h-96 overflow-y-auto">
                                {filteredStudents.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>No students found</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredStudents.map((student) => (
                                            <div
                                                key={student.uid}
                                                onClick={() => toggleStudent(student.email)}
                                                className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${selectedEmails.has(student.email)
                                                    ? 'bg-blue-50'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                {/* Checkbox */}
                                                <div className="flex-shrink-0 w-5">
                                                    {selectedEmails.has(student.email) ? (
                                                        <CheckSquare className="w-5 h-5 text-blue-600" />
                                                    ) : (
                                                        <Square className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>

                                                {/* Avatar */}
                                                <div className="flex-shrink-0 w-10">
                                                    {student.avatar ? (
                                                        <img
                                                            src={student.avatar}
                                                            alt={student.display_name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Name & Email */}
                                                <div className="flex-1 min-w-0 overflow-hidden">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {student.display_name || 'No Name'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {student.email}
                                                    </p>
                                                </div>

                                                {/* College */}
                                                {student.college && (
                                                    <div className="flex-shrink-0 hidden sm:flex items-center text-sm text-gray-500">
                                                        <Building className="w-4 h-4 mr-1 flex-shrink-0" />
                                                        <span className="truncate max-w-32">{student.college}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={sendToSelected}
                                        disabled={selectedEmails.size === 0 || sending}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-5 h-5" />
                                        Send to Selected ({selectedEmails.size})
                                    </button>
                                    <button
                                        onClick={sendToAll}
                                        disabled={students.length === 0 || sending}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Users className="w-5 h-5" />
                                        Send to All Students ({students.length})
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AdminBlogEmailer;
