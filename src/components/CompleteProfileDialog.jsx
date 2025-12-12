import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Building, GraduationCap, Calendar, ArrowRight, X, ChevronDown } from 'lucide-react';
import academicData from '../assets/academic.json';
import { BACKEND_URL } from '../config';

const CompleteProfileDialog = ({ isOpen, onClose, userId, onComplete, initialData }) => {
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
        if (collegeSearch.length < 3 || collegeSearch === formData.college) {
            setShowCollegeDropdown(false);
            setColleges([]);
            return;
        }

        const fetchColleges = async () => {
            setCollegeLoading(true);
            try {
                const response = await fetch(`${BACKEND_URL}/colleges/search`, {
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
    }, [collegeSearch]);

    const handleCollegeSelect = (collegeName) => {
        setFormData(prev => ({ ...prev, college: collegeName }));
        setCollegeSearch(collegeName);
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
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2B2929]/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[#F7F5F2] w-full max-w-lg overflow-visible relative shadow-2xl border-4 border-[#2B2929]"
            >
                {/* Decorative Header Bar */}
                <div className="h-4 w-full bg-[#00C6F7] border-b-4 border-[#2B2929]" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-[#2B2929]/10 rounded-full transition-colors text-[#2B2929]"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h2 className="text-4xl font-black tracking-tighter text-[#2B2929] mb-2 uppercase">
                            One Last Step
                        </h2>
                        <p className="text-[#2B2929]/70 font-medium text-lg">
                            Complete your profile to unlock the full experience.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-[#FF5018]/10 border-2 border-[#FF5018] text-[#FF5018] p-4 font-bold text-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#FF5018] rounded-full" />
                                {error}
                            </div>
                        )}

                        {/* College Search Input */}
                        <div className="space-y-2 relative" ref={collegeInputRef}>
                            <label className="text-sm font-bold text-[#2B2929] uppercase tracking-wider flex items-center gap-2">
                                <Building className="w-4 h-4" />
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
                                    className="w-full p-4 bg-white border-2 border-[#2B2929] text-[#2B2929] font-medium focus:ring-4 focus:ring-[#00C6F7]/20 focus:border-[#00C6F7] outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Search your college..."
                                />
                                {collegeLoading && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Results */}
                            {showCollegeDropdown && colleges.length > 0 && (
                                <div
                                    ref={collegeDropdownRef}
                                    className="absolute z-50 w-full bg-white border-2 border-[#2B2929] shadow-xl max-h-60 overflow-y-auto mt-1"
                                >
                                    {colleges.map((college, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleCollegeSelect(college)}
                                            className="w-full px-4 py-3 text-left text-sm font-bold text-[#2B2929] hover:bg-[#F7F5F2] hover:text-[#0061FE] transition-colors border-b border-gray-100 last:border-0"
                                        >
                                            {college}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Department Dropdown */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#2B2929] uppercase tracking-wider flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" />
                                    Department
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full p-4 bg-white border-2 border-[#2B2929] text-[#2B2929] font-medium focus:ring-4 focus:ring-[#00C6F7]/20 focus:border-[#00C6F7] outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Dept</option>
                                        {academicData.departments.map((dept, i) => (
                                            <option key={i} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Passout Year */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#2B2929] uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Passout Year
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full p-4 bg-white border-2 border-[#2B2929] text-[#2B2929] font-medium focus:ring-4 focus:ring-[#00C6F7]/20 focus:border-[#00C6F7] outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Year</option>
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#2B2929] text-white py-4 font-black uppercase tracking-widest hover:bg-[#00C6F7] hover:text-[#2B2929] transition-colors flex items-center justify-center gap-3 group mt-8 border-2 border-transparent hover:border-[#2B2929]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    SAVING...
                                </>
                            ) : (
                                <>
                                    GET STARTED
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
