// src/pages/AdminMeetupsList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "../lib/supabaseClient";
import {
  Calendar,
  Clock,
  Users,
  QrCode,
  Edit,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const AdminMeetupsList = () => {
  const navigate = useNavigate();
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all meetups
  useEffect(() => {
    fetchMeetups();
  }, []);

  const fetchMeetups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("meetup")
        .select(`
          id,
          title,
          description,
          start_date_time,
          end_date_time,
          created_at,
          registrations(count)
        `)
        .order("start_date_time", { ascending: false });

      if (error) throw error;

      // Flatten registrations count
      const formatted = data.map(meetup => ({
        ...meetup,
        attendeeCount: meetup.registrations[0]?.count || 0
      }));
      setMeetups(formatted);
    } catch (err) {
      console.error("Error fetching meetups:", err);
      toast.error("Failed to load meetups");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this meetup? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("meetup")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMeetups(prev => prev.filter(m => m.id !== id));
      toast.success("Meetup deleted");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete meetup");
    } finally {
      setDeletingId(null);
    }
  };

  const getDuration = (start, end) => {
    const mins = Math.round((new Date(end) - new Date(start)) / 60000);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const isUpcoming = (start) => new Date(start) > new Date();
  const isLive = (start, end) => new Date(start) <= new Date() && new Date() <= new Date(end);

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Meetups</h1>
                <p className="text-sm text-gray-600 mt-1">Manage events and check-in attendees</p>
              </div>
              <button
                onClick={() => navigate("/admin/meetup/create")}
                className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-medium shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Create Meetup</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-600">Loading meetups...</p>
            </div>
          ) : meetups.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No meetups yet</h3>
              <p className="text-gray-600 mb-6">Create your first meetup to get started</p>
              <button
                onClick={() => navigate("/admin/meetup/create")}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                <Plus className="w-5 h-5" />
                <span>Create First Meetup</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {meetups.map((meetup) => {
                const upcoming = isUpcoming(meetup.start_date_time);
                const live = isLive(meetup.start_date_time, meetup.end_date_time);

                return (
                  <div
                    key={meetup.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                  >
                    {/* Status Badge */}
                    <div className="px-5 pt-4">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            live
                              ? "bg-green-100 text-green-800"
                              : upcoming
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {live ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Live Now
                            </>
                          ) : upcoming ? (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Upcoming
                            </>
                          ) : (
                            "Past"
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(meetup.start_date_time), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {meetup.title}
                      </h3>
                      {meetup.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {meetup.description}
                        </p>
                      )}

                      {/* Date & Time */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                          <span>
                            {format(new Date(meetup.start_date_time), "EEE, MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Clock className="w-4 h-4 mr-2 text-purple-600" />
                          <span>
                            {format(new Date(meetup.start_date_time), "h:mm a")} –{" "}
                            {format(new Date(meetup.end_date_time), "h:mm a")} ({getDuration(meetup.start_date_time, meetup.end_date_time)})
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Users className="w-4 h-4 mr-2 text-green-600" />
                          <span>{meetup.attendeeCount} {meetup.attendeeCount === 1 ? "attendee" : "attendees"}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/admin/scanner/${meetup.id}`)}
                            className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow"
                            title="Open QR Scanner"
                          >
                            <QrCode className="w-4 h-4" />
                            <span className="hidden sm:inline">Scanner</span>
                          </button>

                          <button
                            onClick={() => navigate(`/admin/meetup/edit/${meetup.id}`)}
                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleDelete(meetup.id)}
                          disabled={deletingId === meetup.id}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled Oppacity-50"
                          title="Delete"
                        >
                          {deletingId === meetup.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminMeetupsList;