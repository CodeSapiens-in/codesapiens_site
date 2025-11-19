// src/pages/AdminMeetup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "../lib/supabaseClient";
import {
  Calendar,
  Clock,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const AdminMeetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date_time: "",
    end_date_time: "",
  });

  // Fetch current user on mount
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { title, start_date_time, end_date_time } = formData;
    if (!title.trim() || title.trim().length < 3) {
      toast.error("Title must be at least 3 characters");
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
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("meetup")
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            start_date_time: formData.start_date_time,
            end_date_time: formData.end_date_time,
            created_by: currentUser.id,
            updated_by: currentUser.id,
          },
        ])
        .select();

      if (error) throw error;

      toast.success("Meetup created successfully!");
      setTimeout(() => navigate("/admin/meetups"), 1500);
    } catch (err) {
      console.error("Error creating meetup:", err);
      toast.error(err.message || "Failed to create meetup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create New Meetup</h1>
              <div className="w-20" />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meetup Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="e.g. React India Meetup #12"
                  required
                  minLength={3}
                />
                <p className="mt-1 text-xs text-gray-500">At least 3 characters</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                  placeholder="Tell attendees what to expect..."
                />
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Start Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="start_date_time"
                    value={formData.start_date_time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    End Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="end_date_time"
                    value={formData.end_date_time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              {/* Time Validation Hint */}
              {formData.start_date_time && formData.end_date_time && (
                <div className="flex items-center space-x-2 text-sm">
                  {new Date(formData.end_date_time) > new Date(formData.start_date_time) ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-700">
                        Duration: {Math.round(
                          (new Date(formData.end_date_time) - new Date(formData.start_date_time)) / (1000 * 60)
                        )}{" "}
                        minutes
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700">End time must be after start time</span>
                    </>
                  )}
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Create Meetup</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Card */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">After Creation</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You'll be redirected to the meetup list</li>
              <li>• You can then add attendees and generate QR codes</li>
              <li>• Each attendee gets a unique, secure QR token</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminMeetup;