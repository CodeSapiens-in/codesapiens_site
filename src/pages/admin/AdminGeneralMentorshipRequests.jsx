import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Search, Eye, X, Mail, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminGeneralMentorshipRequests = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = requests.filter(req =>
                req.display_name?.toLowerCase().includes(lowerQuery) ||
                req.email?.toLowerCase().includes(lowerQuery) ||
                req.domain?.toLowerCase().includes(lowerQuery)
            );
            setFilteredRequests(filtered);
        } else {
            setFilteredRequests(requests);
        }
    }, [searchQuery, requests]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            // Fetch users who have a non-empty mentorship_request array
            // Note: Supabase filtering on JSON arrays can be tricky. 
            // We'll fetch users where mentorship_request is not null, then filter client-side if needed for array length.
            const { data, error } = await supabase
                .from('users')
                .select('uid, display_name, email, mentorship_request, created_at')
                .not('mentorship_request', 'is', null);

            if (error) throw error;

            // Flatten the data: one row per request, or just show latest?
            // The user form appends requests. Let's show the latest request for each user for now, 
            // or expand to show all. Given the UI, listing users with requests seems best.

            const processedData = data
                .filter(user => Array.isArray(user.mentorship_request) && user.mentorship_request.length > 0)
                .map(user => {
                    // Get the latest request
                    const latestRequest = user.mentorship_request.reduce((latest, current) => {
                        return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
                    }, user.mentorship_request[0]);

                    return {
                        ...user,
                        latestRequest,
                        requestCount: user.mentorship_request.length
                    };
                })
                .sort((a, b) => new Date(b.latestRequest.created_at) - new Date(a.latestRequest.created_at));

            setRequests(processedData);
            setFilteredRequests(processedData);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to load mentorship requests.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
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
                        <h1 className="text-3xl font-bold text-gray-900">General Mentorship Requests</h1>
                        <p className="text-gray-600 mt-1">Requests submitted via the general mentorship form</p>
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
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or domain..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="ml-4 text-sm text-gray-500">
                            Showing {filteredRequests.length} requests
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRequests.map((req) => (
                                    <tr key={req.uid} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                    {req.display_name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{req.display_name || 'Unknown User'}</div>
                                                    <div className="text-sm text-gray-500">{req.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                {req.latestRequest.domain}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(req.latestRequest.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {req.latestRequest.reasonForMentorship}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleViewDetails(req)}
                                                className="text-blue-600 hover:text-blue-900 flex items-center justify-end ml-auto"
                                            >
                                                <Eye className="w-4 h-4 mr-1" /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No requests found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                Mentorship Request Details
                                            </h3>
                                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                                    {selectedRequest.display_name?.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900">{selectedRequest.display_name}</h4>
                                                <div className="flex items-center text-gray-600 text-sm mt-1">
                                                    <Mail className="w-4 h-4 mr-1" /> {selectedRequest.email}
                                                </div>
                                                <div className="flex items-center text-gray-600 text-sm mt-1">
                                                    <Calendar className="w-4 h-4 mr-1" /> Submitted: {new Date(selectedRequest.latestRequest.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Domain</h4>
                                                <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.latestRequest.domain}</p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Reason for Mentorship</h4>
                                                <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded whitespace-pre-wrap">{selectedRequest.latestRequest.reasonForMentorship}</p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Skills to Develop</h4>
                                                <div className="mt-1 flex flex-wrap gap-2">
                                                    {selectedRequest.latestRequest.skillsToDevelop.map((skill, idx) => (
                                                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Topics of Interest</h4>
                                                <div className="mt-1 flex flex-wrap gap-2">
                                                    {selectedRequest.latestRequest.topicsInterested.map((topic, idx) => (
                                                        <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Expectations</h4>
                                                <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded whitespace-pre-wrap">{selectedRequest.latestRequest.expectations}</p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Previous Projects</h4>
                                                <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded whitespace-pre-wrap">{selectedRequest.latestRequest.previousProjects}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={closeModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGeneralMentorshipRequests;
