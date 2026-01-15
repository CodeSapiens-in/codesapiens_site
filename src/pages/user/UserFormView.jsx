import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabaseClient';
import NavBar from '../../components/NavBar';
import { Loader2, ChevronDown, CheckSquare, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const UserFormView = () => {
    const session = useSession();
    const { id } = useParams();
    const navigate = useNavigate();
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // User & Profile State
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [missingDetails, setMissingDetails] = useState({ name: '', mobile: '' });

    // Form State
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        fetchProgramAndUser();
    }, [id]);

    const fetchProgramAndUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUser(user);
                // Fetch Profile
                const { data: profileData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('uid', user.id)
                    .single();
                setProfile(profileData);
            }

            // Fetch Program (Public)
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProgram(data);

            // Restore saved answers if returning from login
            const savedAnswers = localStorage.getItem(`temp_form_answers_${id}`);
            if (savedAnswers) {
                setAnswers(JSON.parse(savedAnswers));
                localStorage.removeItem(`temp_form_answers_${id}`);
                // Optional: Toast "Restored your progress"
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Program not found');
            navigate('/programs');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleCheckboxChange = (questionId, option, checked) => {
        setAnswers(prev => {
            const current = prev[questionId] || [];
            let updated;
            if (checked) {
                updated = [...current, option];
            } else {
                updated = current.filter(item => item !== option);
            }
            return { ...prev, [questionId]: updated };
        });
    };

    const validateAndSubmit = () => {
        if (!user) {
            // Save progress and redirect to login
            localStorage.setItem(`temp_form_answers_${id}`, JSON.stringify(answers));
            const currentPath = window.location.pathname;
            toast('Please login to submit your application', { icon: '🔒' });
            navigate(`/auth?redirect=${currentPath}`);
            return;
        }

        // Form Validation
        const missingRequired = program.questions.filter(q => q.required && (!answers[q.id] || (Array.isArray(answers[q.id]) && answers[q.id].length === 0)));
        if (missingRequired.length > 0) {
            toast.error(`Please fill in all required fields.`);
            return;
        }

        // Profile Validation
        const hasName = profile?.display_name && profile.display_name.trim() !== '';
        const hasMobile = profile?.phone_number && profile.phone_number.trim() !== '';

        if (!hasName || !hasMobile) {
            setMissingDetails({
                name: hasName ? profile.display_name : '',
                mobile: hasMobile ? profile.phone_number : ''
            });
            setShowProfileModal(true);
        } else {
            // Proceed to submit with existing details
            finalSubmit(profile.display_name, profile.phone_number);
        }
    };

    const handleProfileSubmit = async () => {
        if (!missingDetails.name.trim() || !missingDetails.mobile.trim()) {
            toast.error('Name and Mobile Number are required.');
            return;
        }

        // Optionally update the user's profile in the DB so they don't have to enter it again
        try {
            await supabase.from('users').update({
                display_name: missingDetails.name,
                phone_number: missingDetails.mobile
            }).eq('uid', user.id);

            // Proceed to final submit
            finalSubmit(missingDetails.name, missingDetails.mobile);
            setShowProfileModal(false);

        } catch (err) {
            console.error("Error updating profile", err);
            // Even if profile update fails, try to submit the form with the provided details
            finalSubmit(missingDetails.name, missingDetails.mobile);
            setShowProfileModal(false);
        }
    };

    const finalSubmit = async (userName, userMobile) => {
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('program_registrations')
                .insert({
                    program_id: program.id,
                    user_id: user.id,
                    user_name: userName,
                    user_email: user.email,
                    user_mobile: userMobile,
                    answers: answers,
                    status: 'submitted',
                    submitted_at: new Date()
                });

            if (error) throw error;

            setSubmitted(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2]">
                <Loader2 className="w-12 h-12 animate-spin text-[#0061FE]" />
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#F0F4F8] font-sans">
                {!session && <NavBar />}
                <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                    <div className="bg-white border-[3px] border-black p-12 shadow-[8px_8px_0px_0px_#1E1E1E]">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-[3px] border-black">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-black mb-4">Application Submitted!</h2>
                        <p className="text-gray-600 text-lg mb-8">
                            Thank you for applying to <strong>{program?.title || 'Program'}</strong>. We have received your submission.
                        </p>
                        <button
                            onClick={() => navigate('/programs')}
                            className="bg-[#1E1E1E] text-white px-8 py-3 font-bold uppercase hover:bg-[#0061FE] transition-colors"
                        >
                            Explore More Programs
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!program) return null;

    return (
        <div className="min-h-screen bg-[#F7F5F2] font-sans pb-20 relative">
            {!session && <NavBar />}

            <div className="max-w-3xl mx-auto px-4 mt-12">
                <button
                    onClick={() => navigate('/programs')}
                    className="flex items-center gap-2 text-gray-500 hover:text-black font-bold mb-6 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Programs
                </button>

                <div className="bg-white border-[3px] border-black p-8 px-10 mb-8 shadow-[8px_8px_0px_0px_#1E1E1E] relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#0061FE]"></div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-[#1E1E1E]">
                        {program.title}
                    </h1>
                    <p className="text-lg font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {program.description}
                    </p>
                </div>

                <div className="space-y-6">
                    {program.questions.map((q) => (
                        <div key={q.id} className="bg-white border-[3px] border-black p-6 md:p-8 shadow-[4px_4px_0px_0px_#1E1E1E]">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-[#1E1E1E] flex items-start gap-1">
                                    {q.title}
                                    {q.required && <span className="text-red-500 text-lg ml-1">*</span>}
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {q.type === 'short_answer' && (
                                    <input
                                        type="text"
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                                        className="w-full bg-gray-50 border-b-[2px] border-gray-300 focus:border-black focus:outline-none py-2 px-1 transition-colors font-medium text-lg"
                                        placeholder="Your answer"
                                    />
                                )}
                                {q.type === 'paragraph' && (
                                    <textarea
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                                        className="w-full bg-gray-50 border-b-[2px] border-gray-300 focus:border-black focus:outline-none py-2 px-1 transition-colors resize-none h-32 font-medium text-lg"
                                        placeholder="Your answer"
                                    />
                                )}
                                {q.type === 'multiple_choice' && (
                                    <div className="space-y-3">
                                        {q.options?.map((option, idx) => (
                                            <label key={idx} className={`flex items-center gap-3 cursor-pointer group p-3 border-2 rounded-lg transition-all ${answers[q.id] === option ? 'border-[#0061FE] bg-[#F0F7FF]' : 'border-transparent hover:bg-gray-50'}`}>
                                                <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                                                    <input
                                                        type="radio"
                                                        name={q.id}
                                                        value={option}
                                                        checked={answers[q.id] === option}
                                                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                                                        className="peer appearance-none w-5 h-5 rounded-full border-[2px] border-gray-400 checked:border-[#0061FE] checked:border-[6px] transition-all"
                                                    />
                                                </div>
                                                <span className={`font-bold transition-colors ${answers[q.id] === option ? 'text-[#0061FE]' : 'text-gray-700'}`}>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {q.type === 'checkbox' && (
                                    <div className="space-y-3">
                                        {q.options?.map((option, idx) => {
                                            const isChecked = (answers[q.id] || []).includes(option);
                                            return (
                                                <label key={idx} className={`flex items-center gap-3 cursor-pointer group p-3 border-2 rounded-lg transition-all ${isChecked ? 'border-[#0061FE] bg-[#F0F7FF]' : 'border-transparent hover:bg-gray-50'}`}>
                                                    <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => handleCheckboxChange(q.id, option, e.target.checked)}
                                                            className="peer appearance-none w-5 h-5 border-[2px] border-gray-400 checked:bg-[#0061FE] checked:border-black transition-all"
                                                        />
                                                        <CheckSquare size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                                    </div>
                                                    <span className={`font-bold transition-colors ${isChecked ? 'text-[#0061FE]' : 'text-gray-700'}`}>{option}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                                {q.type === 'dropdown' && (
                                    <div className="relative w-full md:w-1/2">
                                        <select
                                            value={answers[q.id] || ''}
                                            onChange={(e) => handleInputChange(q.id, e.target.value)}
                                            className="w-full appearance-none bg-white border-[2px] border-black px-4 py-3 font-bold focus:shadow-[4px_4px_0px_0px_#C2E812] focus:outline-none cursor-pointer"
                                        >
                                            <option value="" disabled>Choose an option</option>
                                            {q.options?.map((option, idx) => (
                                                <option key={idx} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black">
                                            <ChevronDown size={20} strokeWidth={3} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={validateAndSubmit}
                        disabled={submitting}
                        className="bg-[#0061FE] text-white px-10 py-4 text-lg font-black uppercase tracking-wider border-[3px] border-black shadow-[6px_6px_0px_0px_black] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_black] active:translate-y-2 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : 'Submit Form'}
                    </button>
                </div>
            </div>

            {/* --- Missing Details Popup --- */}
            <AnimatePresence>
                {showProfileModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#C2E812] p-8 w-full max-w-md relative"
                        >
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-black"
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-black text-black mb-2">COMPLETE YOUR PROFILE</h2>
                            <p className="text-gray-600 mb-6 font-medium">We need a few more details to process your application.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={missingDetails.name}
                                        onChange={(e) => setMissingDetails({ ...missingDetails, name: e.target.value })}
                                        className="w-full bg-gray-50 border-[2px] border-gray-200 focus:border-[#0061FE] focus:outline-none p-3 font-bold transition-all"
                                        placeholder="e.g. John Wick"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Mobile Number</label>
                                    <input
                                        type="tel"
                                        value={missingDetails.mobile}
                                        onChange={(e) => setMissingDetails({ ...missingDetails, mobile: e.target.value })}
                                        className="w-full bg-gray-50 border-[2px] border-gray-200 focus:border-[#0061FE] focus:outline-none p-3 font-bold transition-all"
                                        placeholder="e.g. +91 98765 43210"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleProfileSubmit}
                                className="w-full mt-8 bg-[#C2E812] text-black font-black uppercase py-4 border-[2px] border-transparent hover:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none transition-all"
                            >
                                UPDATE & SUBMIT
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}

export default UserFormView;
