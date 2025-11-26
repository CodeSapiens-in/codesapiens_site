import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Users, Clock, AlertCircle, CheckCircle, XCircle, StopCircle, PlayCircle, Plus } from 'lucide-react';

const AdminMentorshipManager = () => {
    const { id } = useParams();
    const [program, setProgram] = useState(null);
    const [weeks, setWeeks] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('weeks');

    useEffect(() => {
        fetchProgramDetails();
    }, [id]);

    const fetchProgramDetails = async () => {
        try {
            setLoading(true);

            // Fetch Program
            const { data: programData, error: programError } = await supabase
                .from('mentorship_programs')
                .select('*')
                .eq('id', id)
                .single();
            if (programError) throw programError;
            setProgram(programData);

            // Fetch Weeks
            const { data: weeksData, error: weeksError } = await supabase
                .from('mentorship_weeks')
                .select('*')
                .eq('program_id', id)
                .order('week_number', { ascending: true });
            if (weeksError) throw weeksError;
            setWeeks(weeksData);

            // Fetch Registrations
            const { data: regData, error: regError } = await supabase
                .from('mentorship_registrations')
                .select('*')
                .eq('program_id', id);
            if (regError) throw regError;

            // Manual Join with Users
            const userIds = [...new Set(regData.map(r => r.user_id).filter(Boolean))];
            let usersMap = {};

            if (userIds.length > 0) {
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('uid, display_name, email')
                    .in('uid', userIds);

                if (usersError) throw usersError;

                usersData.forEach(user => {
                    usersMap[user.uid] = user;
                });
            }

            const mergedRegistrations = regData.map(reg => ({
                ...reg,
                users: usersMap[reg.user_id] || { display_name: 'Unknown', email: 'Unknown' }
            }));

            setRegistrations(mergedRegistrations);

        } catch (err) {
            console.error('Error fetching details:', err);
            setError('Failed to load program details.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSubmissionStatus = async (weekId, currentStatus) => {
        try {
            const { error } = await supabase
                .from('mentorship_weeks')
                .update({ is_submission_open: !currentStatus })
                .eq('id', weekId);

            if (error) throw error;

            // Update local state
            setWeeks(weeks.map(w => w.id === weekId ? { ...w, is_submission_open: !currentStatus } : w));
        } catch (err) {
            console.error('Error toggling status:', err);
            alert('Failed to update submission status.');
        }
    };

    const updateRegistrationStatus = async (regId, newStatus) => {
        try {
            const { error } = await supabase
                .from('mentorship_registrations')
                .update({ status: newStatus })
                .eq('id', regId);

            if (error) throw error;

            setRegistrations(registrations.map(r => r.id === regId ? { ...r, status: newStatus } : r));
        } catch (err) {
            console.error('Error updating registration:', err);
            alert('Failed to update registration status.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!program) return <div className="p-8 text-center">Program not found</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <Link
                    to="/admin/mentorship"
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Programs
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.title}</h1>
                            <p className="text-gray-600">{program.description}</p>
                            <div className="flex items-center mt-4 space-x-6 text-sm text-gray-500">
                                <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}</span>
                                <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> {registrations.length} Registered</span>
                            </div>
                            <Link
                                to={`/admin/mentorship/program/${id}/week/create`}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Week
                            </Link>
                        </div>
                    </div>

                    <div className="mb-6 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('weeks')}
                                className={`${activeTab === 'weeks'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Weekly Management
                            </button>
                            <button
                                onClick={() => setActiveTab('registrations')}
                                className={`${activeTab === 'registrations'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Registrations ({registrations.length})
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'weeks' ? (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Weekly Management</h2>
                            {weeks.map((week) => (
                                <div key={week.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Week {week.week_number}: {week.title}</h3>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${week.is_submission_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {week.is_submission_open ? 'Submissions Open' : 'Submissions Closed'}
                                            </span>
                                            <button
                                                onClick={() => toggleSubmissionStatus(week.id, week.is_submission_open)}
                                                className={`p-2 rounded-lg transition-colors ${week.is_submission_open ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={week.is_submission_open ? "Stop Submissions Immediately" : "Open Submissions"}
                                            >
                                                {week.is_submission_open ? <StopCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                        <div>
                                            <span className="block font-medium text-gray-500">Closes</span>
                                            {week.submission_close_date ? new Date(week.submission_close_date).toLocaleString() : 'Not set'}
                                        </div>
                                    </div>

                                    {/* Field Builder Display */}
                                    <div className="mt-4 border-t border-gray-100 pt-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Submission Fields</h4>
                                        {week.content?.fields && week.content.fields.length > 0 ? (
                                            <div className="space-y-2">
                                                {week.content.fields.map((field, idx) => (
                                                    <div key={idx} className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                        <span className="font-medium mr-2">{field.label}</span>
                                                        <span className="text-xs text-gray-400 uppercase">({field.type})</span>
                                                        {field.required && <span className="ml-2 text-red-500 text-xs">*Required</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No custom fields defined. Default text area will be used.</p>
                                        )}
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-3">
                                        <Link
                                            to={`/admin/mentorship/submissions/${week.id}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            View Submissions
                                        </Link>
                                        <Link
                                            to={`/admin/mentorship/week/${week.id}/edit`}
                                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                                        >
                                            Edit Week
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {weeks.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                                    <p className="text-gray-500">No weeks added yet.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {registrations.map((reg) => (
                                        <tr key={reg.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {reg.users?.display_name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="text-sm text-gray-500">{reg.users?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{reg.mentorship_teams?.name || '-'}</div>
                                                {reg.role && <div className="text-xs text-gray-500 capitalize">{reg.role}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        reg.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {reg.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => updateRegistrationStatus(reg.id, 'approved')}
                                                    className="text-green-600 hover:text-green-900 mr-4"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => updateRegistrationStatus(reg.id, 'rejected')}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMentorshipManager;
