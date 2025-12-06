import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight, Loader2, CheckCircle, UserPlus, X, AlertCircle } from 'lucide-react';

const MentorshipLanding = () => {
    const [programs, setPrograms] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    // Team Registration State
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [selectedProgramId, setSelectedProgramId] = useState(null);
    const [teamForm, setTeamForm] = useState({
        teamName: '',
        member2: '',
        member3: ''
    });
    const [teamLoading, setTeamLoading] = useState(false);
    const [teamError, setTeamError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            // Fetch published programs
            const { data: programsData, error: programsError } = await supabase
                .from('mentorship_programs')
                .select('*')
                .eq('status', 'published')
                .order('start_date', { ascending: true });

            if (programsError) throw programsError;
            setPrograms(programsData || []);

            if (currentUser) {
                // Fetch user's registrations
                const { data: regData, error: regError } = await supabase
                    .from('mentorship_registrations')
                    .select('*, mentorship_teams(name)')
                    .eq('user_id', currentUser.id);

                if (regError) throw regError;
                setMyRegistrations(regData || []);
            }

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load mentorship programs.');
        } finally {
            setLoading(false);
        }
    };

    const getRegistrationStatus = (programId) => {
        const reg = myRegistrations.find(r => r.program_id === programId);
        return reg ? reg.status : null;
    };

    const getInvitationStatus = (programId) => {
        const reg = myRegistrations.find(r => r.program_id === programId);
        return reg ? reg.invitation_status : null;
    };

    const handleRegister = async (programId) => {
        if (!user) {
            window.location.href = '/auth'; // Redirect to login
            return;
        }

        try {
            const { error } = await supabase
                .from('mentorship_registrations')
                .insert({
                    user_id: user.id,
                    program_id: programId,
                    status: 'pending',
                    role: 'individual',
                    invitation_status: 'accepted'
                });

            if (error) throw error;
            refreshRegistrations();
            alert('Registration successful!');
        } catch (err) {
            console.error('Registration error:', err);
            alert('Failed to register. You might already be registered.');
        }
    };

    const handleTeamRegisterClick = (programId) => {
        if (!user) {
            window.location.href = '/auth';
            return;
        }
        setSelectedProgramId(programId);
        setShowTeamModal(true);
    };

    const handleTeamSubmit = async (e) => {
        e.preventDefault();
        setTeamLoading(true);
        setTeamError(null);

        try {
            // 1. Validate Usernames
            const m2Input = teamForm.member2.trim();
            const m3Input = teamForm.member3.trim();

            if (!m2Input || !m3Input) throw new Error('Please provide usernames for both team members.');

            console.log('[Team Registration] Looking up usernames:', m2Input, m3Input);

            // Check if usernames exist using RPC function (bypasses RLS)
            const [res2, res3] = await Promise.all([
                supabase.rpc('get_user_by_username', { lookup_username: m2Input }),
                supabase.rpc('get_user_by_username', { lookup_username: m3Input })
            ]);

            console.log('[Team Registration] Response for member2:', res2);
            console.log('[Team Registration] Response for member3:', res3);

            if (res2.error) {
                console.error('[Team Registration] Error looking up member2:', res2.error);
                throw new Error(`Error looking up ${m2Input}: ${res2.error.message}`);
            }
            if (res3.error) {
                console.error('[Team Registration] Error looking up member3:', res3.error);
                throw new Error(`Error looking up ${m3Input}: ${res3.error.message}`);
            }

            const member2 = res2.data?.[0];
            const member3 = res3.data?.[0];

            console.log('[Team Registration] Found member2:', member2);
            console.log('[Team Registration] Found member3:', member3);

            const missing = [];
            if (!member2) missing.push(m2Input);
            if (!member3) missing.push(m3Input);

            if (missing.length > 0) {
                throw new Error(`Users not found: ${missing.join(', ')}. Please check the usernames are correct.`);
            }

            // 2. Create Team
            const { data: teamData, error: teamError } = await supabase
                .from('mentorship_teams')
                .insert({
                    name: teamForm.teamName,
                    leader_id: user.id,
                    program_id: selectedProgramId
                })
                .select()
                .single();

            if (teamError) throw teamError;

            // 3. Register Leader (Accepted)
            const registrations = [
                {
                    user_id: user.id,
                    program_id: selectedProgramId,
                    team_id: teamData.id,
                    role: 'leader',
                    status: 'pending', // Program approval status
                    invitation_status: 'accepted'
                },
                {
                    user_id: member2.uid,
                    program_id: selectedProgramId,
                    team_id: teamData.id,
                    role: 'member',
                    status: 'pending',
                    invitation_status: 'pending'
                },
                {
                    user_id: member3.uid,
                    program_id: selectedProgramId,
                    team_id: teamData.id,
                    role: 'member',
                    status: 'pending',
                    invitation_status: 'pending'
                }
            ];

            const { error: regError } = await supabase
                .from('mentorship_registrations')
                .insert(registrations);

            if (regError) throw regError;

            setShowTeamModal(false);
            setTeamForm({ teamName: '', member2: '', member3: '' });
            refreshRegistrations();
            alert('Team registered successfully! Invitations sent to members.');

        } catch (err) {
            console.error('Team registration error:', err);
            setTeamError(err.message);
        } finally {
            setTeamLoading(false);
        }
    };

    const handleAcceptInvitation = async (regId) => {
        try {
            const { error } = await supabase
                .from('mentorship_registrations')
                .update({ invitation_status: 'accepted' })
                .eq('id', regId);

            if (error) throw error;
            refreshRegistrations();
        } catch (err) {
            console.error('Error accepting invitation:', err);
            alert('Failed to accept invitation.');
        }
    };

    const handleRejectInvitation = async (regId) => {
        if (!confirm('Are you sure you want to decline this invitation?')) return;
        try {
            const { error } = await supabase
                .from('mentorship_registrations')
                .delete()
                .eq('id', regId);

            if (error) throw error;
            refreshRegistrations();
        } catch (err) {
            console.error('Error rejecting invitation:', err);
            alert('Failed to reject invitation.');
        }
    };

    const refreshRegistrations = async () => {
        if (!user) return;
        const { data: regData } = await supabase
            .from('mentorship_registrations')
            .select('*, mentorship_teams(name)')
            .eq('user_id', user.id);
        setMyRegistrations(regData || []);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Mentorship Programs
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                        Accelerate your career with structured guidance, weekly challenges, and expert feedback.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 max-w-3xl mx-auto">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Invitations Section */}
                {myRegistrations.some(r => r.invitation_status === 'pending') && (
                    <div className="mb-12 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Invitations</h2>
                        <div className="space-y-4">
                            {myRegistrations.filter(r => r.invitation_status === 'pending').map(reg => (
                                <div key={reg.id} className="bg-white p-6 rounded-xl shadow-md border border-blue-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Team Invitation: {reg.mentorship_teams?.name || 'Unknown Team'}
                                        </h3>
                                        <p className="text-gray-600 text-sm">You have been invited to join this team.</p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => handleAcceptInvitation(reg.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleRejectInvitation(reg.id)}
                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {programs.map((program) => {
                        const reg = myRegistrations.find(r => r.program_id === program.id);
                        const status = reg ? reg.status : null;
                        const invitationStatus = reg ? reg.invitation_status : null;

                        const now = new Date();
                        const regOpen = new Date(program.registration_open_date);
                        const regClose = new Date(program.registration_close_date);
                        const isRegOpen = now >= regOpen && now <= regClose;
                        const isUpcoming = now < regOpen;

                        return (
                            <div key={program.id} className="flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="h-48 bg-gray-200 relative">
                                    {program.image_url ? (
                                        <img src={program.image_url} alt={program.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                            <Calendar className="w-16 h-16 opacity-50" />
                                        </div>
                                    )}
                                    {status && (
                                        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-sm">
                                            <span className={`text-xs font-bold uppercase tracking-wide ${status === 'approved' ? 'text-green-600' :
                                                status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                                                }`}>
                                                {status}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{program.description}</p>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                                                <span>{new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Users className="w-5 h-5 mr-2 text-purple-500" />
                                                <span>Registration: {new Date(program.registration_open_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        {status === 'approved' && invitationStatus === 'accepted' ? (
                                            <Link
                                                to={`/programs/${program.id}`}
                                                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                                            >
                                                Go to Dashboard
                                                <ArrowRight className="ml-2 -mr-1 w-4 h-4" />
                                            </Link>
                                        ) : invitationStatus === 'pending' ? (
                                            <div className="w-full text-center px-4 py-2 border border-yellow-300 bg-yellow-50 rounded-md text-sm font-medium text-yellow-800">
                                                Invitation Pending
                                            </div>
                                        ) : status === 'pending' ? (
                                            <button disabled className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-50">
                                                Registration Pending
                                            </button>
                                        ) : isRegOpen ? (
                                            <>
                                                <button
                                                    onClick={() => handleRegister(program.id)}
                                                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Register Individually
                                                </button>
                                                <button
                                                    onClick={() => handleTeamRegisterClick(program.id)}
                                                    className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                                                >
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Register as Team
                                                </button>
                                            </>
                                        ) : isUpcoming ? (
                                            <button disabled className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed">
                                                Opens Soon
                                            </button>
                                        ) : (
                                            <button disabled className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed">
                                                Registration Closed
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {programs.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No active mentorship programs at the moment. Check back later!</p>
                    </div>
                )}
            </div>

            {/* Team Registration Modal */}
            {showTeamModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setShowTeamModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Register as Team</h2>
                        <p className="text-gray-600 text-sm mb-6">
                            Create a team of 3. You will be the Team Leader. Invitations will be sent to the other members.
                        </p>

                        {teamError && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-sm text-red-700 flex items-start">
                                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{teamError}</span>
                            </div>
                        )}

                        <form onSubmit={handleTeamSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                                <input
                                    type="text"
                                    required
                                    value={teamForm.teamName}
                                    onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Code Warriors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Member 2 Username</label>
                                <input
                                    type="text"
                                    required
                                    value={teamForm.member2}
                                    onChange={(e) => setTeamForm({ ...teamForm, member2: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Member 3 Username</label>
                                <input
                                    type="text"
                                    required
                                    value={teamForm.member3}
                                    onChange={(e) => setTeamForm({ ...teamForm, member3: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Username"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={teamLoading}
                                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 mt-6"
                            >
                                {teamLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Team & Register'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorshipLanding;
