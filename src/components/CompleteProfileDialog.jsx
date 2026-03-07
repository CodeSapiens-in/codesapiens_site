import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Building, GraduationCap, Calendar, ArrowRight, X, ChevronDown } from 'lucide-react';
import academicData from '../assets/academic.json';
import { BACKEND_URL } from '../config';
import { authFetch } from '../lib/authFetch';

const CompleteProfileDialog = ({ isOpen, userId, onComplete, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        college: '',
        department: '',
        year: ''
    });
    const [error, setError] = useState(null);

    // College Search State
    const [collegeSearch, setCollegeSearch] = useState("");
    const [colleges, setColleges] = useState([]);
    const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
    const [collegeLoading, setCollegeLoading] = useState(false);
    const [lastSelectedCollege, setLastSelectedCollege] = useState("");
    const collegeInputRef = useRef(null);
    const collegeDropdownRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                college: initialData.college || '',
                department: initialData.department || '',
                year: initialData.year || ''
            });
            setCollegeSearch(initialData.college || '');
            setLastSelectedCollege(initialData.college || '');
        }
    }, [initialData]);

    // Click outside handler for college dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                collegeInputRef.current &&
                !collegeInputRef.current.contains(event.target) &&
                (!collegeDropdownRef.current || !collegeDropdownRef.current.contains(event.target))
            ) {
                setShowCollegeDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // College Search Effect
    useEffect(() => {
        if (collegeSearch.length < 3 || collegeSearch === lastSelectedCollege) {
            setShowCollegeDropdown(false);
            setColleges([]);
            return;
        }

        const fetchColleges = async () => {
            setCollegeLoading(true);
            try {
                const response = await authFetch(`${BACKEND_URL}/colleges/search`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        keyword: collegeSearch,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    let collegeNames = [];
                    if (Array.isArray(data)) {
                        collegeNames = data.map((item) => item[2]?.trim()).filter(Boolean);
                    } else if (data.colleges && Array.isArray(data.colleges)) {
                        collegeNames = data.colleges.map((item) => item[2]?.trim()).filter(Boolean);
                    } else if (data.data && Array.isArray(data.data)) {
                        collegeNames = data.data.map((item) => item[2]?.trim()).filter(Boolean);
                    }

                    // Clean up names
                    collegeNames = collegeNames.map((name) => name.replace(/\s*\(ID?:[^)]*\)$/, "").trim());
                    setColleges(collegeNames);
                    setShowCollegeDropdown(true);
                }
            } catch (err) {
                console.error("Error fetching colleges:", err);
            } finally {
                setCollegeLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchColleges, 300);
        return () => clearTimeout(timeoutId);
    }, [collegeSearch, lastSelectedCollege]);

    const handleCollegeSelect = (collegeName) => {
        setFormData(prev => ({ ...prev, college: collegeName }));
        setCollegeSearch(collegeName);
        setLastSelectedCollege(collegeName);
        setShowCollegeDropdown(false);
    };

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 5 - i);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.college || !formData.department || !formData.year) {
            setError('Please fill in all fields');
            return;
        }

        // Enforce college selection from dropdown
        if (formData.college !== lastSelectedCollege) {
            setError('Please select a valid college from the dropdown list.');
            return;
        }

        try {
            setLoading(true);
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    college: formData.college,
                    department: formData.department,
                    year: parseInt(formData.year)
                })
                .eq('uid', userId);

            if (updateError) throw updateError;


            if (onComplete) onComplete(formData);
            // onClose(); // No longer needed as parent should handle unmounting/redirect based on data
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0A0F]/95 backdrop-blur-md cursor-not-allowed">

            {/* Ambient background glows behind dialog */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00C6F7] rounded-full blur-[160px] opacity-10 pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A855F7] rounded-full blur-[160px] opacity-10 pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="bg-[#0D0D2B]/95 backdrop-blur-xl w-full max-w-lg overflow-hidden relative shadow-[0_0_80px_rgba(0,198,247,0.2)] border border-[#00C6F7]/25 rounded-2xl max-h-[90vh] flex flex-col cursor-auto"
            >
                {/* Top gradient bar */}
                <div className="h-1 w-full bg-gradient-to-r from-[#00C6F7] via-[#A855F7] to-[#00C6F7] bg-[length:200%] animate-[shimmer_2s_linear_infinite]" />

                {/* Corner glow inside card */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#A855F7] rounded-full blur-[80px] opacity-15 pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#00C6F7] rounded-full blur-[80px] opacity-10 pointer-events-none" />

                <div className="p-8 overflow-y-auto relative z-10">

                    {/* Progress steps */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00C6F7] to-[#A855F7] flex items-center justify-center text-black text-xs font-black shadow-[0_0_12px_rgba(0,198,247,0.5)]">✓</div>
                            <span className="text-xs text-[#00C6F7] font-bold uppercase tracking-widest">Account</span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#00C6F7]/40 to-[#A855F7]/40"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full border-2 border-[#00C6F7] bg-[#0A0A0F] flex items-center justify-center text-[#00C6F7] text-xs font-black shadow-[0_0_12px_rgba(0,198,247,0.3)]">2</div>
                            <span className="text-xs text-[#00C6F7] font-bold uppercase tracking-widest">Profile</span>
                        </div>
                        <div className="flex-1 h-px bg-[#00C6F7]/10"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full border-2 border-gray-700 bg-[#0A0A0F] flex items-center justify-center text-gray-600 text-xs font-black">3</div>
                            <span className="text-xs text-gray-600 font-bold uppercase tracking-widest">Explore</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 bg-[#00C6F7]/10 border border-[#00C6F7]/30 rounded-full px-3 py-1 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00C6F7] animate-pulse"></div>
                            <span className="text-xs text-[#00C6F7] font-bold uppercase tracking-widest">One Last Step</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter text-white mb-3 leading-none">
                            Complete Your
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00C6F7] to-[#A855F7]">Profile</span>
                        </h2>
                        <p className="text-gray-400 font-light text-base leading-relaxed">
                            Help us personalise your experience. This takes only <span className="text-[#00C6F7] font-medium">30 seconds</span>.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-950/50 border border-red-500/40 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3"
                            >
                                <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {/* College Search */}
                        <div className="space-y-2 relative" ref={collegeInputRef}>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Building className="w-3.5 h-3.5 text-[#00C6F7]" />
                                College Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={collegeSearch}
                                    onChange={(e) => {
                                        setCollegeSearch(e.target.value);
                                        setFormData(prev => ({ ...prev, college: e.target.value }));
                                    }}
                                    className="w-full p-4 bg-[#0A0A0F] border border-[#00C6F7]/20 hover:border-[#00C6F7]/40 rounded-xl text-white font-medium focus:ring-2 focus:ring-[#00C6F7]/40 focus:border-[#00C6F7]/70 outline-none transition-all placeholder:text-gray-600 text-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]"
                                    placeholder="Search your college..."
                                />
                                {collegeLoading && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 animate-spin text-[#00C6F7]" />
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Results */}
                            {showCollegeDropdown && colleges.length > 0 && (
                                <div
                                    ref={collegeDropdownRef}
                                    className="absolute z-50 w-full bg-[#0D0D2B] border border-[#00C6F7]/30 rounded-xl shadow-[0_8px_32px_rgba(0,198,247,0.15)] max-h-56 overflow-y-auto mt-1 backdrop-blur-xl"
                                >
                                    {colleges.map((college, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleCollegeSelect(college)}
                                            className="w-full px-4 py-3 text-left text-sm font-medium text-gray-300 hover:bg-[#00C6F7]/10 hover:text-[#00C6F7] transition-colors border-b border-[#00C6F7]/5 last:border-0 first:rounded-t-xl last:rounded-b-xl"
                                        >
                                            {college}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Department */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <GraduationCap className="w-3.5 h-3.5 text-[#A855F7]" />
                                    Department
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full p-4 bg-[#0A0A0F] border border-[#A855F7]/20 hover:border-[#A855F7]/40 rounded-xl text-white font-medium focus:ring-2 focus:ring-[#A855F7]/40 focus:border-[#A855F7]/70 outline-none transition-all appearance-none cursor-pointer text-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]"
                                    >
                                        <option value="" className="bg-[#0D0D2B]">Select Dept</option>
                                        {academicData.departments.map((dept, i) => (
                                            <option key={i} value={dept} className="bg-[#0D0D2B]">{dept}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown className="w-4 h-4 text-[#A855F7]" />
                                    </div>
                                </div>
                            </div>

                            {/* Passout Year */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-[#00C6F7]" />
                                    Passout Year
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full p-4 bg-[#0A0A0F] border border-[#00C6F7]/20 hover:border-[#00C6F7]/40 rounded-xl text-white font-medium focus:ring-2 focus:ring-[#00C6F7]/40 focus:border-[#00C6F7]/70 outline-none transition-all appearance-none cursor-pointer text-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]"
                                    >
                                        <option value="" className="bg-[#0D0D2B]">Select Year</option>
                                        {years.map(year => (
                                            <option key={year} value={year} className="bg-[#0D0D2B]">{year}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown className="w-4 h-4 text-[#00C6F7]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What you unlock section */}
                        <div className="bg-[#0A0A0F]/60 border border-[#00C6F7]/10 rounded-xl p-4 space-y-2">
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">What you unlock 🚀</p>
                            <div className="grid grid-cols-2 gap-2">
                                {['Meetups & Events', 'Mentorship Access', 'College Leaderboard', 'Resume Tools'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#00C6F7] to-[#A855F7] flex-shrink-0"></div>
                                        <span className="text-xs text-gray-400 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#00C6F7] to-[#A855F7] text-black py-4 font-black uppercase tracking-widest rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group mt-2 shadow-[0_0_30px_rgba(0,198,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Get Started
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default CompleteProfileDialog;
