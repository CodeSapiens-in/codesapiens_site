// src/pages/AdminMeetupEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Save, Calendar, Clock, Loader2 } from "lucide-react";

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
        setForm({
          title: data.title,
          description: data.description || "",
          start_date_time: data.start_date_time.slice(0, 16),
          end_date_time: data.end_date_time.slice(0, 16),
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

      toast.success("Meetup updated!");
      setTimeout(() => navigate("/admin/meetups"), 1000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold">Edit Meetup</h1>
            <div className="w-20" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Start
                </label>
                <input
                  type="datetime-local"
                  name="start_date_time"
                  value={form.start_date_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  End
                </label>
                <input
                  type="datetime-local"
                  name="end_date_time"
                  value={form.end_date_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}