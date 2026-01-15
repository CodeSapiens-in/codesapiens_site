import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';
import { Loader2, ArrowLeft, Plus, Edit2, Users, Trash2, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminProgramsList = () => {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            const { data, error } = await supabase
                .from('programs')
                .select('*, program_registrations(count)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPrograms(data || []);
        } catch (error) {
            console.error('Error fetching programs:', error);
            toast.error('Failed to load programs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"? This will delete all submissions as well.`)) return;

        try {
            // Cascade delete handles submissions, just delete program
            const { error } = await supabase
                .from('programs')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Form deleted successfully');
            setPrograms(programs.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting program:', error);
            toast.error('Failed to delete form');
        }
    };

    return (
        <AdminLayout>
            <div className="p-8 min-h-screen bg-[#1E1E1E]">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <Link to="/admin" className="flex items-center gap-2 text-gray-500 hover:text-white font-bold mb-2 transition-colors uppercase text-sm tracking-wider">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                            Manage <span className="text-[#C2E812]">Forms</span>
                        </h1>
                    </div>

                    <button
                        onClick={() => navigate('/admin/form-builder')}
                        className="flex items-center gap-2 bg-[#0061FE] text-white px-6 py-3 font-black uppercase tracking-wider border-2 border-transparent hover:border-white shadow-[4px_4px_0px_0px_black] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_black] active:translate-y-2 active:shadow-none transition-all"
                    >
                        <Plus size={20} strokeWidth={3} /> Create New Form
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0061FE]" />
                    </div>
                ) : programs.length === 0 ? (
                    <div className="bg-black/30 border-2 border-dashed border-white/20 rounded-xl p-16 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <FileText size={40} className="text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Forms Created Yet</h3>
                        <p className="text-gray-400 mb-8 max-w-md">Create your first form to start collecting responses from users.</p>
                        <button
                            onClick={() => navigate('/admin/form-builder')}
                            className="bg-[#C2E812] text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-white transition-colors"
                        >
                            Start Building
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programs.map((program) => (
                            <div key={program.id} className="bg-white group relative border-[3px] border-transparent hover:border-[#C2E812] transition-colors overflow-hidden">
                                <div className="p-6 pb-20">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-wide">
                                            {program.is_active ? 'Active' : 'Draft'}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(program.id, program.title)}
                                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                            title="Delete Form"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <h3 className="text-2xl font-black text-black mb-2 uppercase leading-tight line-clamp-2">
                                        {program.title}
                                    </h3>
                                    <p className="text-gray-500 font-medium text-sm line-clamp-2 mb-4">
                                        {program.description || "No description provided."}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                                        <Users size={16} />
                                        <span>{program.program_registrations?.[0]?.count || 0} Submissions</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 w-full bg-gray-50 border-t border-gray-100 p-4 flex gap-2">
                                    <button
                                        onClick={() => navigate(`/admin/programs/${program.id}/submissions`)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-2 font-bold uppercase text-sm hover:bg-[#0061FE] transition-colors"
                                    >
                                        <Users size={16} /> Submissions
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/form-builder/${program.id}`)}
                                        className="w-12 flex items-center justify-center bg-gray-200 text-black hover:bg-[#C2E812] transition-colors font-bold border border-transparent hover:border-black"
                                        title="Edit Form"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminProgramsList;
