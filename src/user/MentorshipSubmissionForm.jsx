import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Send, AlertCircle, Save, Lock, Clock, Users } from 'lucide-react';

const MentorshipSubmissionForm = () => {
    const { weekId } = useParams();
    const navigate = useNavigate();
    const [week, setWeek] = useState(null);
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Dynamic Form State
    const [answers, setAnswers] = useState({});
    const [existingSubmission, setExistingSubmission] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [userRole, setUserRole] = useState('individual'); // 'individual', 'leader', 'member'

    useEffect(() => {
        fetchWeekDetails();
    }, [weekId]);

    const fetchWeekDetails = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Fetch Week
            const { data: weekData, error: weekError } = await supabase
                .from('mentorship_weeks')
                .select('*, mentorship_programs(id, title, team_based)')
                .eq('id', weekId)
                .single();

            if (weekError) throw weekError;
            setWeek(weekData);
            setProgram(weekData.mentorship_programs);

            // Fetch Registration & Role
            const { data: reg, error: regError } = await supabase
                .from('mentorship_registrations')
                .select('id, role, team_id, invitation_status')
                .eq('user_id', user.id)
                .eq('program_id', weekData.program_id)
                .single();

            if (regError || !reg) throw new Error('Registration not found.');

            if (reg.invitation_status === 'pending') {
                throw new Error('You must accept your team invitation before viewing submissions.');
            }

            setUserRole(reg.role || 'individual');

            // Check dates
            const now = new Date();
            const openDate = weekData.submission_open_date ? new Date(weekData.submission_open_date) : null;
            const closeDate = weekData.submission_close_date ? new Date(weekData.submission_close_date) : null;

            if (openDate && now < openDate) throw new Error('Submissions are not open yet.');

            // Determine if read-only
            let readOnly = false;

            // 1. Deadline passed
            if (closeDate && now > closeDate) {
                readOnly = true;
            }

            // 2. Member restriction (Only Leader can submit)
            if (reg.role === 'member') {
                readOnly = true;
            }

            setIsReadOnly(readOnly);

            // Check if already submitted (by anyone in the team if it's a team)
            // If individual, check user_id. If team, check team_id (or user_id of leader)
            // Ideally submissions should link to team_id if it exists.
            // For now, let's assume we look for submission by this user OR by the leader if we are a member.
            // Actually, if we are a member, we want to see the LEADER's submission.

            let query = supabase
                .from('mentorship_submissions')
                .select('*')
                .eq('week_id', weekId);

            if (reg.team_id && weekData.mentorship_programs.team_based) {
                // Fetch submission by the team's leader
                const { data: team } = await supabase
                    .from('mentorship_teams')
                    .select('leader_id')
                    .eq('id', reg.team_id)
                    .single();

                if (team) {
                    query = query.eq('user_id', team.leader_id);
                } else {
                    query = query.eq('user_id', user.id); // Fallback if team leader not found
                }
            } else {
                query = query.eq('user_id', user.id);
            }

            const { data: existingSub } = await query.maybeSingle(); // Use maybeSingle to avoid error if multiple (shouldn't happen)

            if (existingSub) {
                setExistingSubmission(existingSub);
                if (existingSub.content) {
                    setAnswers(existingSub.content);
                }
            } else if (closeDate && now > closeDate) {
                // No submission and deadline passed
                // Don't throw error here, just show read only empty form
            }

        } catch (err) {
            console.error('Error fetching week:', err);
            setError(err.message || 'Failed to load submission details.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (fieldId, value) => {
        if (isReadOnly) return;
        setAnswers(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isReadOnly) return;

        setSubmitting(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Get registration ID and role
            const { data: reg } = await supabase
                .from('mentorship_registrations')
                .select('id, role')
                .eq('user_id', user.id)
                .eq('program_id', program.id)
                .single();

            if (!reg) throw new Error('Registration not found.');
            if (reg.role === 'member') throw new Error('Only the Team Leader can submit.');

            // Validate required fields
            if (week.content?.fields) {
                for (const field of week.content.fields) {
                    if (field.required && !answers[field.id]) {
                        throw new Error(`Please fill in the required field: ${field.label}`);
                    }
                }
            } else {
                // Legacy validation
                if (!answers.text) throw new Error('Please provide submission content.');
            }

            if (existingSubmission) {
                // UPDATE
                const { error: updateError } = await supabase
                    .from('mentorship_submissions')
                    .update({
                        content: answers,
                        status: 'submitted', // Reset status to submitted on edit
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingSubmission.id);

                if (updateError) throw updateError;
            } else {
                // INSERT
                const { error: insertError } = await supabase
                    .from('mentorship_submissions')
                    .insert({
                        registration_id: reg.id,
                        week_id: weekId,
                        user_id: user.id,
                        content: answers,
                        status: 'submitted'
                    });

                if (insertError) throw insertError;
            }

            navigate(`/programs/${program.id}`);
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.message || 'Failed to submit.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error && !week) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot Access Submission</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        to="/programs"
                        className="inline-flex items-center text-blue-600 hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Programs
                    </Link>
                </div>
            </div>
        );
    }

    // Determine fields to render
    const fields = week.content?.fields || [
        { id: 'text', label: 'Submission Description / Notes', type: 'textarea', required: true },
        { id: 'links', label: 'Project Links (one per line)', type: 'textarea', required: false }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link
                    to={`/programs/${program.id}`}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to {program.title}
                </Link>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Week {week.week_number} Submission</span>
                                <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6">{week.title}</h1>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                                {isReadOnly && userRole === 'member' && (
                                    <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                        <Users className="w-3 h-3 mr-1" />
                                        Team Member View
                                    </div>
                                )}
                                {isReadOnly && (
                                    <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                                        <Lock className="w-3 h-3 mr-1" />
                                        Read Only
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">Task / Question</h3>
                            <div className="prose prose-blue max-w-none text-gray-800">
                                {week.content?.description ? (
                                    <p className="whitespace-pre-wrap">{week.content.description}</p>
                                ) : (
                                    <p className="whitespace-pre-wrap">{typeof week.content === 'string' ? week.content : 'Please complete the tasks below.'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        {userRole === 'member' && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                                <p className="text-blue-700 text-sm">
                                    You are viewing this submission as a <strong>Team Member</strong>. Only the Team Leader can submit or edit work.
                                </p>
                            </div>
                        )}

                        {fields.map((field, idx) => (
                            <div key={idx}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {field.label} {field.required && !isReadOnly && <span className="text-red-500">*</span>}
                                </label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        value={answers[field.id] || ''}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        rows="5"
                                        disabled={isReadOnly}
                                        className={`w-full px-4 py-3 border rounded-lg resize-none ${isReadOnly
                                                ? 'bg-gray-50 text-gray-600 border-gray-200'
                                                : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            }`}
                                        placeholder={isReadOnly ? 'No answer provided' : `Enter ${field.label.toLowerCase()}...`}
                                        required={field.required && !isReadOnly}
                                    />
                                ) : (
                                    <input
                                        type={field.type === 'link' ? 'url' : 'text'}
                                        value={answers[field.id] || ''}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full px-4 py-3 border rounded-lg ${isReadOnly
                                                ? 'bg-gray-50 text-gray-600 border-gray-200'
                                                : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            }`}
                                        placeholder={isReadOnly ? 'No answer provided' : `Enter ${field.label.toLowerCase()}...`}
                                        required={field.required && !isReadOnly}
                                    />
                                )}
                            </div>
                        ))}

                        {!isReadOnly && (
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            {existingSubmission ? 'Updating...' : 'Submitting...'}
                                        </>
                                    ) : (
                                        <>
                                            {existingSubmission ? <Save className="w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                                            {existingSubmission ? 'Update Submission' : 'Submit Work'}
                                        </>
                                    )}
                                </button>
                                {existingSubmission && (
                                    <p className="text-center text-sm text-gray-500 mt-2">
                                        You can edit your submission until the deadline.
                                    </p>
                                )}
                            </div>
                        )}

                        {isReadOnly && existingSubmission && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                                <p className="text-gray-600 text-sm flex items-center justify-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {userRole === 'member' ? 'Submission managed by Team Leader' : `Submission closed on ${new Date(week.submission_close_date).toLocaleDateString()}`}
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MentorshipSubmissionForm;
