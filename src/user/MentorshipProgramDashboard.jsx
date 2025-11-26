import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle, Circle, Lock, Clock, FileText, ChevronRight, ArrowLeft } from 'lucide-react';

const MentorshipProgramDashboard = () => {
    const { id } = useParams();
    const [program, setProgram] = useState(null);
    const [weeks, setWeeks] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) throw new Error('Not authenticated');
            setUser(currentUser);

            // Check registration
            const { data: registration, error: regError } = await supabase
                .from('mentorship_registrations')
                .select('id, status')
                .eq('user_id', currentUser.id)
                .eq('program_id', id)
                .single();

            if (regError || !registration || registration.status !== 'approved') {
                throw new Error('You are not enrolled in this program.');
            }

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

            // Fetch User Submissions
            const { data: subsData, error: subsError } = await supabase
                .from('mentorship_submissions')
                .select('*')
                .eq('user_id', currentUser.id)
                .in('week_id', weeksData.map(w => w.id));
            if (subsError) throw subsError;
            setSubmissions(subsData || []);

        } catch (err) {
            console.error('Error fetching dashboard:', err);
            setError(err.message || 'Failed to load dashboard.');
        } finally {
            setLoading(false);
        }
    };

    const getSubmissionStatus = (weekId) => {
        const sub = submissions.find(s => s.week_id === weekId);
        return sub ? sub.status : null;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-red-500 text-xl font-semibold mb-4">{error}</div>
                <Link to="/mentorship" className="text-blue-600 hover:underline">Back to Programs</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link to="/programs" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Programs
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">{program.title}</h1>
                    <p className="mt-2 text-gray-600">Your learning journey</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Progress Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
                            <div className="relative pt-1">
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                                    <div
                                        style={{ width: `${(submissions.length / weeks.length) * 100}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 mb-6">{submissions.length} of {weeks.length} weeks completed</p>
                            </div>

                            <div className="space-y-4">
                                {weeks.map((week, index) => {
                                    const status = getSubmissionStatus(week.id);
                                    const isCompleted = !!status;
                                    return (
                                        <div key={week.id} className="flex items-center">
                                            {isCompleted ? (
                                                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-300 mr-3" />
                                            )}
                                            <span className={`text-sm ${isCompleted ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                                Week {week.week_number}: {week.title}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        {weeks.map((week) => {
                            const submission = submissions.find(s => s.week_id === week.id);
                            const now = new Date();
                            const openDate = week.submission_open_date ? new Date(week.submission_open_date) : null;
                            const closeDate = week.submission_close_date ? new Date(week.submission_close_date) : null;

                            const isOpen = week.is_submission_open &&
                                (!openDate || now >= openDate) &&
                                (!closeDate || now <= closeDate);

                            const isPastDeadline = closeDate && now > closeDate;
                            const isFuture = openDate && now < openDate;

                            return (
                                <div key={week.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Week {week.week_number}</span>
                                                <h3 className="text-xl font-bold text-gray-900 mt-1">{week.title}</h3>
                                            </div>
                                            {submission ? (
                                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Submitted
                                                </span>
                                            ) : isOpen ? (
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" /> Active
                                                </span>
                                            ) : isFuture ? (
                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex items-center">
                                                    <Lock className="w-3 h-3 mr-1" /> Locked
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" /> Closed
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-gray-600 mb-6">
                                            {typeof week.content === 'string'
                                                ? week.content
                                                : week.content?.description || 'No instructions provided.'}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="text-sm text-gray-500">
                                                {closeDate && (
                                                    <span>Deadline: {closeDate.toLocaleDateString()} {closeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                )}
                                            </div>

                                            {submission ? (
                                                <Link
                                                    to={`/programs/submit/${week.id}`} // View submission details
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                                                >
                                                    View Submission <ChevronRight className="w-4 h-4 ml-1" />
                                                </Link>
                                            ) : isOpen ? (
                                                <Link
                                                    to={`/programs/submit/${week.id}`}
                                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                >
                                                    Submit Work <ChevronRight className="w-4 h-4 ml-1" />
                                                </Link>
                                            ) : (
                                                <button disabled className="text-gray-400 font-medium text-sm cursor-not-allowed">
                                                    {isFuture ? 'Available Soon' : 'Submission Closed'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorshipProgramDashboard;
