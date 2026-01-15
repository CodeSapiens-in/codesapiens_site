import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';
import { Loader2, ArrowLeft, Eye, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminProgramSubmissions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [program, setProgram] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    // View Answer Modal
    const [selectedRegistration, setSelectedRegistration] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Fetch Program
            const { data: programData, error: programError } = await supabase
                .from('programs')
                .select('*')
                .eq('id', id)
                .single();
            if (programError) throw programError;
            setProgram(programData);

            // Fetch Registrations
            const { data: regData, error: regError } = await supabase
                .from('program_registrations')
                .select('*')
                .eq('program_id', id)
                .order('submitted_at', { ascending: false });

            if (regError) throw regError;
            setRegistrations(regData);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load submissions');
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (!registrations.length) return;

        // Flatten data for CSV
        const csvRows = [];

        // Headers
        const headers = ['Name', 'Email', 'Mobile', 'Submitted At', ...program.questions.map(q => q.title)];
        csvRows.push(headers.join(','));

        // Rows
        registrations.forEach(reg => {
            const row = [
                `"${reg.user_name}"`,
                `"${reg.user_email}"`,
                `"${reg.user_mobile || '-'}"`,
                `"${new Date(reg.submitted_at).toLocaleString()}"`,
                ...program.questions.map(q => {
                    const ans = reg.answers[q.id];
                    return `"${Array.isArray(ans) ? ans.join('; ') : (ans || '')}"`;
                })
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${program.title}_submissions.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout>
            <div className="p-8 min-h-screen bg-[#1E1E1E]">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => navigate('/admin')}
                            className="flex items-center gap-2 text-gray-500 hover:text-white font-bold mb-2 transition-colors uppercase text-sm tracking-wider"
                        >
                            <ArrowLeft size={16} /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                            {loading ? 'Loading...' : `Submissions: ${program?.title}`}
                        </h1>
                    </div>

                    {!loading && registrations.length > 0 && (
                        <button
                            onClick={downloadCSV}
                            className="flex items-center gap-2 bg-[#C2E812] text-black px-4 py-2 font-bold uppercase text-sm border-2 border-transparent hover:border-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-[#0061FE]" />
                    </div>
                ) : registrations.length === 0 ? (
                    <div className="bg-[#1E1E1E] border border-white/10 p-12 text-center rounded-lg">
                        <p className="text-gray-400 text-lg">No submissions yet.</p>
                    </div>
                ) : (
                    <div className="bg-[#1E1E1E] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-black/50 border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-bold">User</th>
                                        <th className="p-4 font-bold">Contact</th>
                                        <th className="p-4 font-bold">Submitted At</th>
                                        <th className="p-4 font-bold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {registrations.map((reg) => (
                                        <tr key={reg.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-white">{reg.user_name}</div>
                                                <div className="text-gray-500 text-xs">{reg.user_email}</div>
                                            </td>
                                            <td className="p-4 text-gray-300">
                                                {reg.user_mobile || <span className="text-gray-600 italic">Not provided</span>}
                                            </td>
                                            <td className="p-4 text-gray-300">
                                                {new Date(reg.submitted_at).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => setSelectedRegistration(reg)}
                                                    className="inline-flex items-center gap-1 bg-[#0061FE]/10 text-[#0061FE] px-3 py-1 rounded hover:bg-[#0061FE] hover:text-white transition-colors uppercase text-xs font-bold"
                                                >
                                                    <Eye size={14} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* View Answers Modal */}
            {selectedRegistration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1E1E1E] border-2 border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl">
                        <div className="sticky top-0 bg-[#1E1E1E] p-6 border-b border-white/10 flex justify-between items-center z-10">
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedRegistration.user_name}</h3>
                                <p className="text-gray-400 text-sm">Submission Details</p>
                            </div>
                            <button
                                onClick={() => setSelectedRegistration(null)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <span className="text-2xl font-bold">&times;</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* User Info Block */}
                            <div className="bg-black/30 p-4 rounded border border-white/5 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Email</label>
                                    <div className="text-white font-mono text-sm">{selectedRegistration.user_email}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Mobile</label>
                                    <div className="text-white font-mono text-sm">{selectedRegistration.user_mobile || '-'}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Submitted At</label>
                                    <div className="text-white font-mono text-sm">{new Date(selectedRegistration.submitted_at).toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Q&A */}
                            <div className="space-y-6">
                                {program.questions.map((q, idx) => (
                                    <div key={idx} className="border-l-2 border-[#0061FE] pl-4">
                                        <h4 className="text-gray-400 text-xs uppercase font-bold mb-1">
                                            Q{idx + 1}: {q.title}
                                        </h4>
                                        <div className="text-white text-base">
                                            {(() => {
                                                const ans = selectedRegistration.answers[q.id];
                                                if (Array.isArray(ans)) return ans.join(', ');
                                                if (!ans) return <span className="text-gray-600 italic">No answer</span>;
                                                return ans;
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end">
                            <button
                                onClick={() => setSelectedRegistration(null)}
                                className="bg-white text-black px-6 py-2 font-bold uppercase text-sm hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProgramSubmissions;
