import React, { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import { ArrowRight, Loader2, FileText, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const UserProgramsList = () => {
    const session = useSession();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPrograms(data || []);
        } catch (error) {
            console.error('Error fetching programs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F4F8] font-sans">
            {!session && <NavBar />}

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        EXPLORE <span className="text-[#0061FE]">PROGRAMS</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl font-medium">
                        Discover new opportunities, register for events, and join community initiatives.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0061FE]" />
                    </div>
                ) : programs.length === 0 ? (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Programs</h3>
                        <p className="text-gray-500">Check back later for new programs and forms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {programs.map((program) => (
                            <motion.div
                                key={program.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -5 }}
                                className="group relative bg-white border-[3px] border-black rounded-lg shadow-[8px_8px_0px_0px_#1E1E1E] hover:shadow-[12px_12px_0px_0px_#C2E812] transition-all duration-300 overflow-hidden flex flex-col h-full"
                            >
                                <div className="p-6 flex-grow">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-[#C2E812] text-black text-xs font-black uppercase px-2 py-1 border border-black">
                                            Open
                                        </span>
                                        <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(program.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-black mb-3 leading-tight group-hover:text-[#0061FE] transition-colors">
                                        {program.title}
                                    </h2>
                                    <p className="text-gray-600 font-medium line-clamp-3 mb-6">
                                        {program.description || "No description provided."}
                                    </p>
                                </div>
                                <div className="p-6 pt-0 mt-auto">
                                    <Link
                                        to={`/programs/${program.id}`}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white font-bold py-3 px-6 hover:bg-[#0061FE] transition-colors"
                                    >
                                        APPLY NOW <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProgramsList;
