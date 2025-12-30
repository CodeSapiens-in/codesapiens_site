import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';
import { Loader2, MessageSquare, User, Calendar, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminFeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('feedback')
                .select(`
                    *,
                    users:user_id (
                        display_name,
                        email,
                        avatar
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFeedbacks(data || []);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            toast.error('Failed to load feedback');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) return;

        try {
            const { error } = await supabase
                .from('feedback')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setFeedbacks(prev => prev.filter(f => f.id !== id));
            toast.success('Feedback deleted');
        } catch (error) {
            console.error('Error deleting feedback:', error);
            toast.error('Failed to delete feedback');
        }
    };

    const filteredFeedbacks = feedbacks.filter(feedback =>
        feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.users?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                            User Feedback
                        </h1>
                        <p className="text-gray-500 mt-1">View and manage feedback from users</p>
                    </div>

                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search feedback..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredFeedbacks.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No feedback found</p>
                            </div>
                        ) : (
                            filteredFeedbacks.map((feedback) => (
                                <div key={feedback.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {feedback.users?.avatar ? (
                                                    <img src={feedback.users.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {feedback.users?.display_name || 'Unknown User'}
                                                    </h3>
                                                    <span className="text-sm text-gray-500">•</span>
                                                    <span className="text-sm text-gray-500">{feedback.users?.email}</span>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {feedback.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(feedback.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(feedback.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete feedback"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminFeedbackList;
