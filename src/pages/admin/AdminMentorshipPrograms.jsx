import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Calendar, Users, Edit, Trash2, Loader2, ExternalLink, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const AdminMentorshipPrograms = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('mentorship_programs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPrograms(data || []);
        } catch (err) {
            console.error('Error fetching programs:', err);
            setError('Failed to load mentorship programs.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this program? This action cannot be undone.')) return;

        try {
            const { error } = await supabase
                .from('mentorship_programs')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setPrograms(programs.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting program:', err);
            alert('Failed to delete program.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'archived': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mentorship Programs</h1>
                        <p className="text-gray-600 mt-1">Manage your mentorship cohorts and curriculums</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/admin/mentorship/create"
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Program
                        </Link>
                        <Link
                            to="/admin/mentorship/general-requests"
                            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Users className="w-5 h-5 mr-2" />
                            General Requests
                        </Link>
                        <Link
                            to="/admin/mentorship/all-registrations"
                            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <BookOpen className="w-5 h-5 mr-2" />
                            All Registrations
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs.map((program) => (
                        <div key={program.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-48 bg-gray-200 relative">
                                {program.image_url ? (
                                    <img src={program.image_url} alt={program.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                        <Calendar className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                                        {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{program.description}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>{new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Users className="w-4 h-4 mr-2" />
                                        <span>Registration: {new Date(program.registration_open_date).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <Link
                                        to={`/admin/mentorship/manage/${program.id}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                    >
                                        Manage
                                        <ExternalLink className="w-4 h-4 ml-1" />
                                    </Link>
                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/admin/mentorship/edit/${program.id}`}
                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(program.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {programs.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No programs found</h3>
                            <p className="text-gray-500 mt-1">Get started by creating your first mentorship program.</p>
                            <Link
                                to="/admin/mentorship/create"
                                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create Program
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMentorshipPrograms;
