
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import {
    Calendar,
    Clock,
    Save,
    ArrowLeft,
    Loader2,
    Type,
    AlignLeft,
    MapPin,
    Eye,
    LayoutTemplate
} from "lucide-react";

const AdminMeetup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        venue: "",
        start_date_time: "",
        end_date_time: "",
        registration_start_time: "",
        registration_end_time: "",
        registration_open_until_meetup_end: false,
    });

    // Fetch current user
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please log in to create a meetup");
                navigate("/login");
            } else {
                setCurrentUser(user);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const validateForm = () => {
        const { title, venue, start_date_time, end_date_time, registration_start_time, registration_end_time, registration_open_until_meetup_end } = formData;
        if (!title.trim() || title.trim().length < 3) {
            toast.error("Title must be at least 3 characters");
            return false;
        }
        if (!venue.trim()) {
            toast.error("Venue is required");
            return false;
        }
        if (!start_date_time || !end_date_time) {
            toast.error("Both start and end times are required");
            return false;
        }
        if (new Date(end_date_time) <= new Date(start_date_time)) {
            toast.error("End time must be after start time");
            return false;
        }
        if (registration_start_time && !registration_open_until_meetup_end && registration_end_time) {
            if (new Date(registration_end_time) <= new Date(registration_start_time)) {
                toast.error("Registration end time must be after registration start time");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from("meetup")
                .insert([
                    {
                        title: formData.title.trim(),
                        description: formData.description.trim() || null,
                        venue: formData.venue.trim(),
                        start_date_time: formData.start_date_time,
                        end_date_time: formData.end_date_time,
                        registration_start_time: formData.registration_start_time || null,
                        registration_end_time: formData.registration_open_until_meetup_end ? null : (formData.registration_end_time || null),
                        registration_open_until_meetup_end: formData.registration_open_until_meetup_end,
                        created_by: currentUser.id,
                        updated_by: currentUser.id,
                    },
                ])
                .select();

            if (error) throw error;

            toast.success("Meetup created successfully!");
            setTimeout(() => navigate("/admin/meetups"), 1500); // Adjust path as needed
        } catch (err) {
            console.error("Error creating meetup:", err);
            toast.error(err.message || "Failed to create meetup");
        } finally {
            setLoading(false);
        }
    };

    // Helper for Live Preview Date
    const formatPreviewDate = (dateStr) => {
        if (!dateStr) return "---";
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
    };

    const formatPreviewTime = (dateStr) => {
        if (!dateStr) return "--:--";
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? "--:--" : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Create Event</h1>
                        <p className="text-xs text-gray-500">Admin Dashboard</p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Form */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-6 text-indigo-600">
                            <LayoutTemplate className="w-5 h-5" />
                            <h2 className="font-semibold text-gray-900">Event Details</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Title Input */}
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Event Title</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Type className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="e.g. Tech Meetup 2025"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description Input */}
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <AlignLeft className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                        placeholder="What is this event about?"
                                    />
                                </div>
                            </div>

                            {/* Venue Input */}
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Venue</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="venue"
                                        value={formData.venue}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="e.g. Conference Hall A, Online, etc."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 my-6" />

                            {/* Date & Time Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Starts</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="datetime-local"
                                            name="start_date_time"
                                            value={formData.start_date_time}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ends</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Clock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="datetime-local"
                                            name="end_date_time"
                                            value={formData.end_date_time}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Registration Window Section */}
                            <div className="h-px bg-gray-100 my-6" />

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Registration Window</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Registration Opens At</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Clock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            </div>
                                            <input
                                                type="datetime-local"
                                                name="registration_start_time"
                                                value={formData.registration_start_time}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">Leave empty to open immediately</p>
                                    </div>

                                    <div className="group">
                                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${formData.registration_open_until_meetup_end ? 'text-gray-300' : 'text-gray-500'}`}>
                                            Registration Closes At
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Clock className={`h-5 w-5 transition-colors ${formData.registration_open_until_meetup_end ? 'text-gray-200' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
                                            </div>
                                            <input
                                                type="datetime-local"
                                                name="registration_end_time"
                                                value={formData.registration_end_time}
                                                onChange={handleChange}
                                                disabled={formData.registration_open_until_meetup_end}
                                                className={`block w-full pl-10 pr-3 py-3 border rounded-xl transition-all ${formData.registration_open_until_meetup_end
                                                    ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                                    : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                    <input
                                        type="checkbox"
                                        id="registration_open_until_meetup_end"
                                        name="registration_open_until_meetup_end"
                                        checked={formData.registration_open_until_meetup_end}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                    />
                                    <label htmlFor="registration_open_until_meetup_end" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                        Keep registration open until the event ends
                                    </label>
                                </div>
                            </div>

                            {/* Duration Calculation / Error */}
                            {formData.start_date_time && formData.end_date_time && (
                                <div className={`mt-2 p-3 rounded-lg text-sm flex items-center gap-2 ${new Date(formData.end_date_time) > new Date(formData.start_date_time)
                                    ? "bg-green-50 text-green-700 border border-green-100"
                                    : "bg-red-50 text-red-700 border border-red-100"
                                    }`}>
                                    {new Date(formData.end_date_time) > new Date(formData.start_date_time) ? (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Duration: {((new Date(formData.end_date_time) - new Date(formData.start_date_time)) / (1000 * 60 * 60)).toFixed(1)} hours
                                        </>
                                    ) : (
                                        "End time must be after start time"
                                    )}
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {loading ? "Creating Event..." : "Publish Event"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Live Preview */}
                <div className="lg:col-span-5">
                    <div className="sticky top-24 space-y-4">
                        <div className="flex items-center gap-2 text-gray-400 mb-2 ml-1">
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Live Preview</span>
                        </div>

                        {/* Preview Card */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                            <div className="p-6 sm:p-8">
                                <div className="flex gap-5 items-start">
                                    {/* Date Box Preview */}
                                    <div className="hidden sm:flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 rounded-2xl w-16 h-16 shrink-0 border border-indigo-100">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                            {formData.start_date_time ? new Date(formData.start_date_time).toLocaleString('default', { month: 'short' }) : "DEC"}
                                        </span>
                                        <span className="text-xl font-bold">
                                            {formData.start_date_time ? new Date(formData.start_date_time).getDate() : "25"}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-2xl font-bold text-gray-900 leading-tight break-words">
                                            {formData.title || <span className="text-gray-300 italic">Untitled Event</span>}
                                        </h3>
                                        <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-indigo-500" />
                                                <span>
                                                    {formatPreviewTime(formData.start_date_time)} – {formatPreviewTime(formData.end_date_time)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-pink-500" />
                                                <span>{formData.venue || "Event Venue"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                        {formData.description || <span className="text-gray-300 italic">Description will appear here...</span>}
                                    </p>
                                </div>
                            </div>

                            {/* Faux Action Bar */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
                                <div className="h-2 w-20 bg-gray-200 rounded"></div>
                                <div className="h-8 w-28 bg-indigo-600 rounded-lg opacity-20"></div>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-blue-800 text-sm">
                            <p><strong>Tip:</strong> Use a catchy title to attract more attendees. Detailed descriptions help reduce questions later.</p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default AdminMeetup;
