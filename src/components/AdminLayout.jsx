import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: rows } = await supabase
                        .from('users')
                        .select('*')
                        .eq('uid', user.id);
                    // Use rows?.[0] if needed in the future
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
                {/* Ambient glows */}
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#00C6F7] rounded-full blur-[160px] opacity-10 pointer-events-none animate-pulse" />
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-[#A855F7] rounded-full blur-[160px] opacity-10 pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
                <div className="flex flex-col items-center gap-4 relative z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00C6F7]" />
                    <span className="text-xs text-gray-600 uppercase tracking-widest font-bold animate-pulse">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] relative overflow-x-hidden">
            {/* Subtle grid overlay */}
            <div
                className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
                style={{
                    backgroundImage: 'linear-gradient(#00C6F7 1px, transparent 1px), linear-gradient(90deg, #00C6F7 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}
            />
            {/* Top edge glow line */}
            <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00C6F7]/40 to-transparent z-10 pointer-events-none" />

            {/* Main Content Area */}
            <main className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
