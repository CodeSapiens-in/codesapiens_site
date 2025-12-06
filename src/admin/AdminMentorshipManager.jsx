import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, Link } from 'react-router-dom';
import {
    Loader2, ArrowLeft, Users, Clock, CheckCircle, XCircle, StopCircle, PlayCircle, Plus,
    Github, Linkedin, Globe, Mail, Calendar, X, Eye, UserCheck, UserX, Filter, Search,
    ExternalLink, Award, MapPin
} from 'lucide-react';

const AdminMentorshipManager = () => {
    const { id } = useParams();
    const [program, setProgram] = useState(null);
    const [weeks, setWeeks] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('registrations');

    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

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

            // Fetch Teams
            const { data: teamsData, error: teamsError } = await supabase
                .from('mentorship_teams')
                .select('*')
                .eq('program_id', id);
            if (teamsError) throw teamsError;
            setTeams(teamsData || []);

            // Fetch Registrations
            const { data: regData, error: regError } = await supabase
                .from('mentorship_registrations')
                .select('*')
                .eq('program_id', id);
            if (regError) throw regError;

            // Manual Join with Users - fetch full user details
            const userIds = [...new Set(regData.map(r => r.user_id).filter(Boolean))];
            let usersMap = {};

            if (userIds.length > 0) {
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('uid, display_name, email, username, github_url, linkedin_url, portfolio_url, college, sessions_attended, attended_meetups, avatar, bio, skills')
                    .in('uid', userIds);

                if (usersError) throw usersError;

                usersData.forEach(user => {
                    usersMap[user.uid] = user;
                });
            }

            // Build teams map
            const teamsMap = {};
            (teamsData || []).forEach(team => {
                teamsMap[team.id] = team;
            });

            const mergedRegistrations = regData.map(reg => ({
                ...reg,
                users: usersMap[reg.user_id] || { display_name: 'Unknown', email: 'Unknown' },
                team: reg.team_id ? teamsMap[reg.team_id] : null
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

    const approveTeam = async (teamId) => {
        try {
            const { error } = await supabase
                .from('mentorship_registrations')
                .update({ status: 'approved' })
                .eq('team_id', teamId);

            if (error) throw error;
            setRegistrations(registrations.map(r =>
                r.team_id === teamId ? { ...r, status: 'approved' } : r
            ));
        } catch (err) {
            console.error('Error approving team:', err);
            alert('Failed to approve team.');
        }
    };

    const rejectTeam = async (teamId) => {
        try {
            const { error } = await supabase
                .from('mentorship_registrations')
                .update({ status: 'rejected' })
                .eq('team_id', teamId);

            if (error) throw error;
            setRegistrations(registrations.map(r =>
                r.team_id === teamId ? { ...r, status: 'rejected' } : r
            ));
        } catch (err) {
            console.error('Error rejecting team:', err);
            alert('Failed to reject team.');
        }
    };

    const openUserModal = (reg) => {
        setSelectedUser(reg);
        setShowUserModal(true);
    };

    // Filter registrations
    const filteredRegistrations = registrations.filter(reg => {
        const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
        const matchesSearch = searchQuery === '' ||
            reg.users?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.users?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.users?.username?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Group by teams for team view
    const teamGroups = teams.map(team => ({
        ...team,
        members: registrations.filter(r => r.team_id === team.id)
    }));

    const individualRegistrations = filteredRegistrations.filter(r => !r.team_id);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!program) return <div className="p-8 text-center">Program not found</div>;

    const stats = {
        total: registrations.length,
        pending: registrations.filter(r => r.status === 'pending').length,
        approved: registrations.filter(r => r.status === 'approved').length,
        rejected: registrations.filter(r => r.status === 'rejected').length,
        teams: teams.length
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <Link
                    to="/admin/mentorship-programs"
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Programs
                </Link>

                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.title}</h1>
                            <p className="text-gray-600 max-w-2xl">{program.description}</p>
                            <div className="flex items-center mt-4 space-x-6 text-sm text-gray-500">
                                <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <Link
                            to={`/admin/mentorship/program/${id}/week/create`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Week
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500 opacity-50" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Approved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Rejected</p>
                                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-500 opacity-50" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Teams</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.teams}</p>
                            </div>
                            <Users className="w-8 h-8 text-purple-500 opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('registrations')}
                                className={`${activeTab === 'registrations'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                All Registrations ({registrations.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('teams')}
                                className={`${activeTab === 'teams'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Teams ({teams.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('weeks')}
                                className={`${activeTab === 'weeks'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Weekly Management
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'registrations' && (
                            <>
                                {/* Filters */}
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, or username..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Filter className="w-4 h-4 text-gray-400" />
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Registrations Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Links</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meetups</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredRegistrations.map((reg) => (
                                                <tr key={reg.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                {reg.users?.avatar ? (
                                                                    <img className="h-10 w-10 rounded-full object-cover" src={reg.users.avatar} alt="" />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                                        {reg.users?.display_name?.charAt(0) || '?'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{reg.users?.display_name || 'Unknown'}</div>
                                                                <div className="text-sm text-gray-500">{reg.users?.email}</div>
                                                                {reg.users?.username && (
                                                                    <div className="text-xs text-gray-400">@{reg.users.username}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            {reg.users?.github_url && (
                                                                <a href={reg.users.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                                                                    <Github className="w-5 h-5" />
                                                                </a>
                                                            )}
                                                            {reg.users?.linkedin_url && (
                                                                <a href={reg.users.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                                                                    <Linkedin className="w-5 h-5" />
                                                                </a>
                                                            )}
                                                            {reg.users?.portfolio_url && (
                                                                <a href={reg.users.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-600">
                                                                    <Globe className="w-5 h-5" />
                                                                </a>
                                                            )}
                                                            {!reg.users?.github_url && !reg.users?.linkedin_url && !reg.users?.portfolio_url && (
                                                                <span className="text-gray-400 text-xs">No links</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                                                            <span className="text-sm text-gray-600">
                                                                {reg.users?.attended_meetups?.length || reg.users?.sessions_attended || 0}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {reg.team ? (
                                                            <div>
                                                                <div className="text-sm text-gray-900">{reg.team.name}</div>
                                                                <div className="text-xs text-gray-500 capitalize">{reg.role}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">Individual</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                reg.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                    'bg-yellow-100 text-yellow-800'}`}>
                                                            {reg.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                onClick={() => openUserModal(reg)}
                                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => updateRegistrationStatus(reg.id, 'approved')}
                                                                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Approve"
                                                            >
                                                                <UserCheck className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => updateRegistrationStatus(reg.id, 'rejected')}
                                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Reject"
                                                            >
                                                                <UserX className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredRegistrations.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            No registrations found.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'teams' && (
                            <div className="space-y-6">
                                {teamGroups.map((team) => (
                                    <div key={team.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                                                <p className="text-sm text-gray-500">{team.members.length} members</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                    ${team.members.every(m => m.status === 'approved') ? 'bg-green-100 text-green-800' :
                                                        team.members.every(m => m.status === 'rejected') ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {team.members.every(m => m.status === 'approved') ? 'Approved' :
                                                        team.members.every(m => m.status === 'rejected') ? 'Rejected' : 'Pending'}
                                                </span>
                                                <button
                                                    onClick={() => approveTeam(team.id)}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                                                >
                                                    Approve All
                                                </button>
                                                <button
                                                    onClick={() => rejectTeam(team.id)}
                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                                                >
                                                    Reject All
                                                </button>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {team.members.map((member) => (
                                                <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            {member.users?.avatar ? (
                                                                <img className="h-10 w-10 rounded-full object-cover" src={member.users.avatar} alt="" />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                                    {member.users?.display_name?.charAt(0) || '?'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {member.users?.display_name}
                                                                {member.role === 'leader' && (
                                                                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Leader</span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{member.users?.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center space-x-2">
                                                            {member.users?.github_url && (
                                                                <a href={member.users.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700">
                                                                    <Github className="w-4 h-4" />
                                                                </a>
                                                            )}
                                                            {member.users?.linkedin_url && (
                                                                <a href={member.users.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                                                                    <Linkedin className="w-4 h-4" />
                                                                </a>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => openUserModal(member)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                                        >
                                                            View Details
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {teams.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        No teams registered yet.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'weeks' && (
                            <div className="space-y-6">
                                {weeks.map((week) => (
                                    <div key={week.id} className="border border-gray-200 rounded-xl p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Week {week.week_number}: {week.title}</h3>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${week.is_submission_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {week.is_submission_open ? 'Submissions Open' : 'Submissions Closed'}
                                                </span>
                                                <button
                                                    onClick={() => toggleSubmissionStatus(week.id, week.is_submission_open)}
                                                    className={`p-2 rounded-lg transition-colors ${week.is_submission_open ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                    title={week.is_submission_open ? "Stop Submissions" : "Open Submissions"}
                                                >
                                                    {week.is_submission_open ? <StopCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-4">
                                            <span className="font-medium">Closes:</span> {week.submission_close_date ? new Date(week.submission_close_date).toLocaleString() : 'Not set'}
                                        </div>
                                        <div className="flex justify-end space-x-3">
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
                                    <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl text-gray-500">
                                        No weeks added yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* User Detail Modal */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-16 w-16">
                                    {selectedUser.users?.avatar ? (
                                        <img className="h-16 w-16 rounded-full object-cover" src={selectedUser.users.avatar} alt="" />
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                                            {selectedUser.users?.display_name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedUser.users?.display_name}</h2>
                                    {selectedUser.users?.username && (
                                        <p className="text-gray-500">@{selectedUser.users.username}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Contact Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Contact</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-700">
                                        <Mail className="w-4 h-4 mr-3 text-gray-400" />
                                        {selectedUser.users?.email}
                                    </div>
                                    {selectedUser.users?.college && (
                                        <div className="flex items-center text-gray-700">
                                            <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                                            {selectedUser.users.college}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            {selectedUser.users?.bio && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Bio</h3>
                                    <p className="text-gray-700">{selectedUser.users.bio}</p>
                                </div>
                            )}

                            {/* Social Links */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Social Links</h3>
                                <div className="flex flex-wrap gap-3">
                                    {selectedUser.users?.github_url ? (
                                        <a
                                            href={selectedUser.users.github_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                        >
                                            <Github className="w-4 h-4 mr-2" />
                                            GitHub
                                            <ExternalLink className="w-3 h-3 ml-2" />
                                        </a>
                                    ) : (
                                        <span className="flex items-center px-4 py-2 bg-gray-100 text-gray-400 rounded-lg">
                                            <Github className="w-4 h-4 mr-2" />
                                            No GitHub
                                        </span>
                                    )}
                                    {selectedUser.users?.linkedin_url ? (
                                        <a
                                            href={selectedUser.users.linkedin_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Linkedin className="w-4 h-4 mr-2" />
                                            LinkedIn
                                            <ExternalLink className="w-3 h-3 ml-2" />
                                        </a>
                                    ) : (
                                        <span className="flex items-center px-4 py-2 bg-gray-100 text-gray-400 rounded-lg">
                                            <Linkedin className="w-4 h-4 mr-2" />
                                            No LinkedIn
                                        </span>
                                    )}
                                    {selectedUser.users?.portfolio_url && (
                                        <a
                                            href={selectedUser.users.portfolio_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <Globe className="w-4 h-4 mr-2" />
                                            Portfolio
                                            <ExternalLink className="w-3 h-3 ml-2" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Meetups & Activity */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Activity</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <div className="flex items-center">
                                            <Calendar className="w-8 h-8 text-blue-500 mr-3" />
                                            <div>
                                                <p className="text-2xl font-bold text-blue-900">
                                                    {selectedUser.users?.attended_meetups?.length || selectedUser.users?.sessions_attended || 0}
                                                </p>
                                                <p className="text-sm text-blue-700">Meetups Attended</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-4">
                                        <div className="flex items-center">
                                            <Award className="w-8 h-8 text-purple-500 mr-3" />
                                            <div>
                                                <p className="text-2xl font-bold text-purple-900">
                                                    {selectedUser.users?.skills?.length || 0}
                                                </p>
                                                <p className="text-sm text-purple-700">Skills Listed</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            {selectedUser.users?.skills && selectedUser.users.skills.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUser.users.skills.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Team Info */}
                            {selectedUser.team && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Team</h3>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="font-semibold text-gray-900">{selectedUser.team.name}</p>
                                        <p className="text-sm text-gray-500 capitalize">Role: {selectedUser.role}</p>
                                    </div>
                                </div>
                            )}

                            {/* Registration Status & Actions */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm text-gray-500">Registration Status:</span>
                                        <span className={`ml-2 px-3 py-1 inline-flex text-sm font-semibold rounded-full 
                                            ${selectedUser.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                selectedUser.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {selectedUser.status}
                                        </span>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => {
                                                updateRegistrationStatus(selectedUser.id, 'approved');
                                                setSelectedUser({ ...selectedUser, status: 'approved' });
                                            }}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                updateRegistrationStatus(selectedUser.id, 'rejected');
                                                setSelectedUser({ ...selectedUser, status: 'rejected' });
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMentorshipManager;

