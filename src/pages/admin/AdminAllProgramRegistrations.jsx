import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Search, Filter, CheckCircle, XCircle, Clock, User, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminAllProgramRegistrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [programFilter, setProgramFilter] = useState('all');
    const [programs, setPrograms] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterData();
    }, [searchQuery, statusFilter, programFilter, registrations]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch all registrations
            const { data: regData, error: regError } = await supabase
                .from('mentorship_registrations')
                .select(`
                    *,
                    mentorship_programs (
                        id,
                        title
                    )
                `)
                .order('created_at', { ascending: false });

            if (regError) throw regError;

            // 2. Extract user IDs
            const userIds = [...new Set(regData.map(r => r.user_id).filter(Boolean))];

            // 3. Fetch user profiles
            let usersMap = {};
            if (userIds.length > 0) {
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('uid, display_name, email, avatar')
                    .in('uid', userIds);

                if (usersError) throw usersError;

                // Create a map for easy lookup
                usersData.forEach(user => {
                    usersMap[user.uid] = user;
                });
            }

            // 4. Merge data
            const mergedData = regData.map(reg => ({
                ...reg,
                users: usersMap[reg.user_id] || { display_name: 'Unknown', email: 'Unknown', avatar: null }
            }));

            console.log('Merged registrations:', mergedData);

            setRegistrations(mergedData || []);

            // Extract unique programs for filter
            const uniquePrograms = [...new Set(mergedData.map(r => r.mentorship_programs?.title).filter(Boolean))];
            setPrograms(uniquePrograms);

        } catch (err) {
            console.error('Error fetching registrations:', err);
            setError('Failed to load registrations. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        let filtered = registrations;

        // Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(reg =>
                reg.users?.display_name?.toLowerCase().includes(lowerQuery) ||
                reg.users?.email?.toLowerCase().includes(lowerQuery) ||
                reg.mentorship_programs?.title?.toLowerCase().includes(lowerQuery)
            );
        }

        // Status Filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(reg => reg.status === statusFilter);
        }

        // Program Filter
        if (programFilter !== 'all') {
            filtered = filtered.filter(reg => reg.mentorship_programs?.title === programFilter);
        }

        setFilteredRegistrations(filtered);
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('mentorship_registrations')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setRegistrations(registrations.map(r =>
                r.id === id ? { ...r, status: newStatus } : r
            ));

            alert(`Registration ${newStatus} successfully.`);

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

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">All Program Registrations</h1>
                        <p className="text-gray-600 mt-1">Manage registrations across all mentorship programs</p>
                    </div>
                    <Link
                        to="/admin/mentorship"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Back to Programs
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or program..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            <select
                                value={programFilter}
                                onChange={(e) => setProgramFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Programs</option>
                                {programs.map((prog, idx) => (
                                    <option key={idx} value={prog}>{prog}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRegistrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                                    {reg.users?.avatar ? (
                                                        <img src={reg.users.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        reg.users?.display_name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{reg.users?.display_name || 'Unknown User'}</div>
                                                    <div className="text-sm text-gray-500">{reg.users?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                                                {reg.mentorship_programs?.title || 'Unknown Program'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(reg.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    reg.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {reg.status === 'pending' && (
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => updateStatus(reg.id, 'approved')}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors flex items-center"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(reg.id, 'rejected')}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors flex items-center"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" /> Reject
                                                    </button>
                                                </div>
                                            )}
                                            {reg.status !== 'pending' && (
                                                <span className="text-gray-400 text-xs italic">No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredRegistrations.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No registrations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAllProgramRegistrations;
