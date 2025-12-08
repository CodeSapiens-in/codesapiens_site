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
                // if (!user) {
                //     navigate('/');
                //     return;
                // }

                if (user) {
                    const { data } = await supabase
                        .from('users')
                        .select('*')
                        .eq('uid', user.id)
                        .single();

                    // if (data?.role !== 'admin') {
                    //     navigate('/');
                    //     return;
                    // }
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
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Main Content Area */}
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
