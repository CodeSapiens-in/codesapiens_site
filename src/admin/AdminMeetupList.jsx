import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "../lib/supabaseClient";
import {
  Calendar,
  Clock,
  Users,
  QrCode,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  MoreHorizontal,
  TrendingUp,
  CalendarDays,
  MapPin
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

  // Calculate Stats for Dashboard Header
  const stats = useMemo(() => {
    const total = meetups.length;
    const upcoming = meetups.filter(m => new Date(m.start_date_time) > new Date()).length;
    const totalAttendees = meetups.reduce((acc, curr) => acc + curr.attendeeCount, 0);
    return { total, upcoming, totalAttendees };
  }, [meetups]);

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
      toast.error("Failed to delete meetup");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50/50 pb-12">
        
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your community events</p>
              </div>
              <button
                onClick={() => navigate("/admin/meetup/create")}
                className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Event</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Dashboard Stats Cards */}
          {!loading && meetups.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                label="Total Events" 
                value={stats.total} 
                icon={CalendarDays} 
                color="text-blue-600" 
                bg="bg-blue-50" 
              />
              <StatCard 
                label="Upcoming" 
                value={stats.upcoming} 
                icon={TrendingUp} 
                color="text-green-600" 
                bg="bg-green-50" 
              />
              <StatCard 
                label="Total Attendees" 
                value={stats.totalAttendees} 
                icon={Users} 
                color="text-purple-600" 
                bg="bg-purple-50" 
              />
            </div>
          )}

          {/* Main Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-500 font-medium">Loading your dashboard...</p>
            </div>
          ) : meetups.length === 0 ? (
            <EmptyState navigate={navigate} />
          ) : (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-5 px-1">All Events</h2>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {meetups.map((meetup) => (
                  <AdminMeetupCard
                    key={meetup.id}
                    meetup={meetup}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                    navigate={navigate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* --- Sub Components --- */

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
    </div>
    <div className={`p-4 rounded-xl ${bg}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
  </div>
);

const AdminMeetupCard = ({ meetup, onDelete, deletingId, navigate }) => {
  // FIX: Slice strings to avoid Timezone shifts
  const rawStart = meetup.start_date_time.slice(0, 19);
  const rawEnd = meetup.end_date_time.slice(0, 19);
  
  const startObj = new Date(rawStart);
  const endObj = new Date(rawEnd);
  const isUpcoming = startObj > new Date();
  const isLive = startObj <= new Date() && new Date() <= endObj;

  const formatTime = (date) => date.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col overflow-hidden">
      
      {/* Top Section: Date & Content */}
      <div className="p-6 flex gap-5 flex-1">
        {/* Date Leaf Visual */}
        <div className="flex flex-col items-center justify-center bg-gray-50 text-gray-600 rounded-2xl w-16 h-16 shrink-0 border border-gray-200 shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {startObj.toLocaleString('default', { month: 'short' })}
          </span>
          <span className="text-xl font-bold text-gray-900">{startObj.getDate()}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
             {/* Status Label */}
            {isLive ? (
               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                  ● Live Now
               </span>
            ) : isUpcoming ? (
               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                  Upcoming
               </span>
            ) : (
               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  Past Event
               </span>
            )}
            
            {/* Relative Time */}
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
              {formatDistanceToNow(startObj, { addSuffix: true })}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 truncate" title={meetup.title}>
            {meetup.title}
          </h3>

          <div className="space-y-1.5">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2 text-indigo-500" />
              <span>{formatTime(startObj)} – {formatTime(endObj)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-2 text-indigo-500" />
              <span className="font-medium text-gray-700">{meetup.attendeeCount}</span>
              <span className="ml-1">registered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center gap-3">
        <button
          onClick={() => navigate(`/admin/scanner/${meetup.id}`)}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <QrCode className="w-4 h-4" />
          Scan Tickets
        </button>

        <div className="flex gap-1">
          <button
            onClick={() => navigate(`/admin/meetup/edit/${meetup.id}`)}
            className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all"
            title="Edit Details"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(meetup.id)}
            disabled={deletingId === meetup.id}
            className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all disabled:opacity-50"
            title="Delete Event"
          >
            {deletingId === meetup.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ navigate }) => (
  <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
    <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
      <Calendar className="w-10 h-10 text-indigo-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">No meetups found</h3>
    <p className="text-gray-500 mb-8 max-w-md mx-auto">
      You haven't created any events yet. Get started by creating your first meetup to track attendees and generate tickets.
    </p>
    <button
      onClick={() => navigate("/admin/meetup/create")}
      className="inline-flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-200"
    >
      <Plus className="w-5 h-5" />
      <span>Create First Event</span>
    </button>
  </div>
);

export default AdminMeetupsList;