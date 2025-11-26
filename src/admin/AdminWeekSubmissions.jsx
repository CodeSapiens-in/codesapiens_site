import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle, XCircle, ExternalLink, FileText, RefreshCw } from 'lucide-react';

const AdminWeekSubmissions = () => {
    const { weekId } = useParams();
    const [week, setWeek] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        fetchData();
    }, [weekId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Week Details
            const { data: weekData, error: weekError } = await supabase
                .from('mentorship_weeks')
                .select('*, mentorship_programs(id, title)')
                .eq('id', weekId)
                .single();

            if (weekError) throw weekError;
            setWeek(weekData);

            // 2. Fetch Submissions
            const { data: subData, error: subError } = await supabase
                .from('mentorship_submissions')
                .select('*')
                .eq('week_id', weekId)
                .order('created_at', { ascending: false });

            if (subError) throw subError;

            // 3. Manual Join with Users
            const userIds = [...new Set(subData.map(s => s.user_id).filter(Boolean))];
            let usersMap = {};

            if (userIds.length > 0) {
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('uid, display_name, email, avatar')
                    .in('uid', userIds);

                if (usersError) throw usersError;

                usersData.forEach(user => {
                    usersMap[user.uid] = user;
                });
            }

            const mergedSubmissions = subData.map(sub => ({
                ...sub,
                users: usersMap[sub.user_id] || { display_name: 'Unknown', email: 'Unknown', avatar: null }
            }));

            setSubmissions(mergedSubmissions);

        } catch (err) {
            console.error('Error fetching submissions:', err);
            setError('Failed to load submissions.');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (submissionId, newStatus) => {
        try {
            const { error } = await supabase
                .from('mentorship_submissions')
                .update({ status: newStatus })
                .eq('id', submissionId);

            if (error) throw error;

            // Update local state
            setSubmissions(submissions.map(s =>
                s.id === submissionId ? { ...s, status: newStatus } : s
            ));

            if (selectedSubmission && selectedSubmission.id === submissionId) {
                setSelectedSubmission({ ...selectedSubmission, status: newStatus });
            }

        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!week) return <div className="p-8 text-center">Week not found</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <Link
                    to={`/admin/mentorship/manage/${week.program_id}`}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Program Manager
                </Link>

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Week {week.week_number}: {week.title}</h1>
                        <p className="text-gray-600">Submissions Management</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Submissions</span>
                        <p className="text-2xl font-bold text-blue-600">{submissions.length}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List of Submissions */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="font-semibold text-gray-700">Students</h2>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                            {submissions.map((sub) => (
                                <div
                                    key={sub.id}
                                    onClick={() => setSelectedSubmission(sub)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedSubmission?.id === sub.id
                                            ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300'
                                            : 'bg-white border-gray-100 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{sub.users?.display_name}</p>
                                            <p className="text-xs text-gray-500">{new Date(sub.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${sub.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                sub.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {submissions.length === 0 && (
                                <p className="text-center text-gray-400 py-8">No submissions yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Submission Details */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-200px)] flex flex-col">
                        {selectedSubmission ? (
                            <>
                                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                            {selectedSubmission.users?.display_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">{selectedSubmission.users?.display_name}</h2>
                                            <p className="text-sm text-gray-500">{selectedSubmission.users?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => updateStatus(selectedSubmission.id, 'approved')}
                                            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${selectedSubmission.status === 'approved'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-white border border-green-600 text-green-600 hover:bg-green-50'
                                                }`}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedSubmission.id, 'submitted')}
                                            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${selectedSubmission.status === 'submitted'
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'bg-white border border-yellow-500 text-yellow-500 hover:bg-yellow-50'
                                                }`}
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 overflow-y-auto flex-1">
                                    {/* Dynamic Fields Rendering */}
                                    {week.content?.fields && week.content.fields.length > 0 ? (
                                        <div className="space-y-6">
                                            {week.content.fields.map((field, idx) => (
                                                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">{field.label}</h3>
                                                    <div className="text-gray-900 whitespace-pre-wrap">
                                                        {selectedSubmission.content?.[field.id] || <span className="text-gray-400 italic">No answer provided</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // Fallback for legacy submissions
                                        <div className="space-y-6">
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Submission Content</h3>
                                                <p className="text-gray-900 whitespace-pre-wrap">
                                                    {selectedSubmission.content?.text || JSON.stringify(selectedSubmission.content)}
                                                </p>
                                            </div>
                                            {selectedSubmission.content?.links && Array.isArray(selectedSubmission.content.links) && (
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Links</h3>
                                                    <ul className="space-y-1">
                                                        {selectedSubmission.content.links.map((link, i) => (
                                                            <li key={i}>
                                                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                                                                    <ExternalLink className="w-3 h-3 mr-1" /> {link}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <FileText className="w-16 h-16 mb-4 opacity-20" />
                                <p>Select a submission to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminWeekSubmissions;
