import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  Clock, 
  Loader2, 
  Type, 
  AlignLeft,
  MapPin,
  Eye,
  Pencil
} from "lucide-react";

export default function AdminMeetupEdit() {
  const { meetupId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date_time: "",
    end_date_time: "",
  });

  // ---------- Load meetup ----------
  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("meetup")
        .select("*")
        .eq("id", meetupId)
        .single();

      if (error) {
        toast.error("Meetup not found");
        navigate("/admin/meetups");
      } else {
        // Slice(0,16) trims seconds/timezone for datetime-local input compatibility
        setForm({
          title: data.title,
          description: data.description || "",
          start_date_time: data.start_date_time ? data.start_date_time.slice(0, 16) : "",
          end_date_time: data.end_date_time ? data.end_date_time.slice(0, 16) : "",
        });
      }
      setLoading(false);
    };
    fetch();
  }, [meetupId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || form.title.length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }
    if (new Date(form.end_date_time) <= new Date(form.start_date_time)) {
      toast.error("End time must be after start time");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("meetup")
        .update({
          title: form.title.trim(),
          description: form.description.trim() || null,
          start_date_time: form.start_date_time,
          end_date_time: form.end_date_time,
          updated_at: new Date().toISOString(),
        })
        .eq("id", meetupId);

      if (error) throw error;

      toast.success("Meetup updated successfully!");
      setTimeout(() => navigate("/admin/meetups"), 1000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper for Preview
  const formatPreviewTime = (dateStr) => {
    if (!dateStr) return "--:--";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "--:--" : date.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Event</h1>
              <p className="text-xs text-gray-500">Update details</p>
            </div>
          </div>
          
          {/* Desktop Save Button */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="hidden sm:flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 text-indigo-600 border-b border-gray-100 pb-4">
              <Pencil className="w-5 h-5" />
              <h2 className="font-semibold text-gray-900">Event Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Title */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Event Name"
                    required
                    minLength={3}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <AlignLeft className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={6}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe your event..."
                  />
                </div>
              </div>

              <div className="h-px bg-gray-100 my-2" />

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Date & Time</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      type="datetime-local"
                      name="start_date_time"
                      value={form.start_date_time}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Date & Time</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      type="datetime-local"
                      name="end_date_time"
                      value={form.end_date_time}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Duration Helper */}
              {form.start_date_time && form.end_date_time && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                  new Date(form.end_date_time) > new Date(form.start_date_time) 
                  ? "bg-blue-50 text-blue-700 border border-blue-100" 
                  : "bg-red-50 text-red-700 border border-red-100"
                }`}>
                   {new Date(form.end_date_time) > new Date(form.start_date_time) ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Duration: <strong>{((new Date(form.end_date_time) - new Date(form.start_date_time)) / (1000 * 60 * 60)).toFixed(1)} hours</strong></span>
                      </>
                   ) : (
                      "End time must be after start time"
                   )}
                </div>
              )}

              {/* Mobile Save Button */}
              <div className="sm:hidden pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-xl shadow-lg disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>Save Changes</span>
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
              <div className="bg-white rounded-2xl shadow-xl shadow-indigo-50 border border-gray-100 overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                 
                 <div className="p-6 sm:p-8">
                    <div className="flex gap-5 items-start">
                        {/* Date Box Preview */}
                        <div className="hidden sm:flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 rounded-2xl w-16 h-16 shrink-0 border border-indigo-100">
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                {form.start_date_time ? new Date(form.start_date_time).toLocaleString('default', { month: 'short' }) : "MMM"}
                            </span>
                            <span className="text-xl font-bold">
                                {form.start_date_time ? new Date(form.start_date_time).getDate() : "DD"}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 leading-tight break-words">
                                {form.title || <span className="text-gray-300 italic">Untitled Event</span>}
                            </h3>
                            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-indigo-500" />
                                    <span>
                                        {formatPreviewTime(form.start_date_time)} – {formatPreviewTime(form.end_date_time)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-pink-500" />
                                    <span>Event Venue</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                            {form.description || <span className="text-gray-300 italic">Description will appear here...</span>}
                        </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}