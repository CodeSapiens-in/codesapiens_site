// src/pages/UserMeetupsList.jsx
import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Loader2,
  CheckCircle,
  X,
  Ticket,
  ChevronRight,
} from "lucide-react";

export default function UserMeetupsList() {
  const user = useUser();
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [expandedRegisterId, setExpandedRegisterId] = useState(null);

  // 1. Fetch User Profile
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const { data, error } = await supabase
          .from("users")
          .select("display_name, email")
          .eq("uid", user.id)
          .single();

        if (!error) setUserProfile(data);
      };
      fetchUserProfile();
    }
  }, [user]);

  // 2. Fetch Meetups & Status
  useEffect(() => {
    const fetchMeetups = async () => {
      setLoading(true);

      const { data: meetupsData, error: meetupError } = await supabase
        .from("meetup")
        .select("*")
        .order("start_date_time", { ascending: true });

      if (meetupError) {
        toast.error("Failed to load meetups");
        setLoading(false);
        return;
      }

      let enrichedMeetups = meetupsData;

      if (user) {
        const { data: registrations } = await supabase
          .from("registrations")
          .select("meetup_id, token, user_name, user_email, created_at")
          .eq("user_id", user.id);

        const registeredMap = {};
        registrations?.forEach((reg) => {
          registeredMap[reg.meetup_id] = {
            token: reg.token,
            name: reg.user_name,
            email: reg.user_email,
            registeredAt: reg.created_at,
          };
        });

        enrichedMeetups = meetupsData.map((m) => ({
          ...m,
          registered: !!registeredMap[m.id],
          registrationData: registeredMap[m.id] || null,
        }));
      }

      setMeetups(enrichedMeetups);
      setLoading(false);
    };

    fetchMeetups();
  }, [user]);

  // 3. Handle Registration
  const handleRegister = async (meetupId) => {
    if (!userProfile) return toast.error("Profile not loaded");

    try {
      const { data, error } = await supabase
        .from("registrations")
        .insert({
          meetup_id: meetupId,
          user_name: userProfile.display_name || userProfile.email.split("@")[0],
          user_email: userProfile.email,
          user_id: user.id,
        })
        .select("token, created_at")
        .single();

      if (error) throw error;

      // Update local state to reflect registration immediately
      setMeetups((prev) =>
        prev.map((m) =>
          m.id === meetupId
            ? {
                ...m,
                registered: true,
                registrationData: {
                  token: data.token,
                  name: userProfile.display_name,
                  email: userProfile.email,
                  registeredAt: data.created_at,
                },
              }
            : m
        )
      );

      toast.success("Registration successful!");
      setExpandedRegisterId(null);
      
      // Automatically open the ticket immediately after registering
      const registeredMeetup = meetups.find(m => m.id === meetupId);
      if(registeredMeetup) {
         setSelectedTicket({
            ...registeredMeetup, 
            registrationData: {
                token: data.token, 
                name: userProfile.display_name, 
                email: userProfile.email
            }
         });
      }

    } catch (err) {
      toast.error(err.message || "Registration failed");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Toaster position="top-center" />
      
      <div className="min-h-screen bg-gray-50 pb-12">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Events & Meetups</h1>
            {user && userProfile && (
              <div className="hidden sm:block text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {userProfile.display_name || user.email}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          {meetups.length === 0 ? (
            <EmptyState />
          ) : (
            meetups.map((meetup) => (
              <MeetupCard
                key={meetup.id}
                meetup={meetup}
                user={user}
                userProfile={userProfile}
                isRegistering={expandedRegisterId === meetup.id}
                onToggleRegister={() => setExpandedRegisterId(expandedRegisterId === meetup.id ? null : meetup.id)}
                onRegisterConfirm={() => handleRegister(meetup.id)}
                onViewTicket={() => setSelectedTicket(meetup)}
              />
            ))
          )}
        </div>
      </div>

      {/* Ticket Modal Overlay */}
      {selectedTicket && (
        <TicketModal 
          meetup={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
        />
      )}
    </>
  );
}

/* --- Sub Components --- */

function MeetupCard({ meetup, user, userProfile, isRegistering, onToggleRegister, onRegisterConfirm, onViewTicket }) {
  // ✅ FIX: If DB stores LOCAL time (not UTC), treat it as local time
  // Parse the timestamp WITHOUT timezone conversion
  const parseLocalDate = (dateString) => {
    if (!dateString) return new Date();
    
    // Remove timezone indicator if present (Z, +00:00, etc)
    // This forces the browser to interpret it as LOCAL time
    const cleanedString = dateString.replace(/Z$|[+-]\d{2}:\d{2}$/, '');
    
    // Create date object - browser treats this as local time
    return new Date(cleanedString);
  };

  const startDateObj = parseLocalDate(meetup.start_date_time);
  const endDateObj = parseLocalDate(meetup.end_date_time);
  
  const isUpcoming = startDateObj > new Date();

  // Format time in 12-hour format
  const formatTime = (date) => {
    if (!date || isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-US", { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };
  
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md ${!isUpcoming ? 'opacity-80 grayscale-[0.5]' : ''}`}>
      <div className="p-6 flex flex-col md:flex-row gap-6">
        
        {/* Date Box */}
        <div className="hidden md:flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 rounded-xl w-20 h-20 shrink-0 border border-indigo-100">
          <span className="text-xs font-bold uppercase tracking-wider">
            {startDateObj.toLocaleString('default', { month: 'short' })}
          </span>
          <span className="text-2xl font-bold">{startDateObj.getDate()}</span>
        </div>

        <div className="flex-1">
          {/* Header & Status Badge */}
          <div className="flex justify-between items-start mb-2">
            <div className="md:hidden text-indigo-600 font-bold text-sm mb-1">
              {startDateObj.toDateString()}
            </div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {meetup.title}
            </h2>
            {meetup.registered && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                <CheckCircle className="w-3 h-3" /> Registered
              </span>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{meetup.description}</p>

          {/* Info Row */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-700">
                {formatTime(startDateObj)} – {formatTime(endDateObj)}
              </span>
            </div>
            {/* Placeholder for Location */}
             <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
               <MapPin className="w-4 h-4 text-gray-400" />
               <span className="font-medium text-gray-700">Event Venue</span> 
             </div>
          </div>

          {/* Action Area */}
          <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
            {!user ? (
              <button onClick={() => toast.error("Please log in")} className="text-sm font-medium text-indigo-600 hover:underline">
                Log in to register
              </button>
            ) : meetup.registered ? (
              <button 
                onClick={onViewTicket}
                className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
              >
                <Ticket className="w-4 h-4" />
                View Entry Pass
              </button>
            ) : isUpcoming ? (
              <button 
                onClick={onToggleRegister}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isRegistering 
                    ? "bg-gray-100 text-gray-600" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                }`}
              >
                {isRegistering ? "Cancel" : "Register Now"}
                {!isRegistering && <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="text-gray-400 text-sm font-medium">Event Ended</span>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Registration Form */}
      {isRegistering && (
        <div className="bg-gray-50 p-6 border-t border-gray-100 animate-in slide-in-from-top-2">
          <RegistrationForm 
            userProfile={userProfile} 
            onConfirm={onRegisterConfirm} 
          />
        </div>
      )}
    </div>
  );
}

function TicketModal({ meetup, onClose }) {
  if (!meetup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-indigo-600 p-6 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold mb-1">Entry Pass</h3>
          <p className="text-indigo-100 text-sm line-clamp-1">{meetup.title}</p>
        </div>

        {/* Ticket Body */}
        <div className="p-8 flex flex-col items-center text-center relative">
            {/* Cutout effect visual */}
           <div className="absolute top-[-10px] left-0 w-4 h-8 bg-black/60 rounded-r-full z-10" style={{transform: 'translateY(-50%)'}}></div>
           <div className="absolute top-[-10px] right-0 w-4 h-8 bg-black/60 rounded-l-full z-10" style={{transform: 'translateY(-50%)'}}></div>

          <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-inner mb-6">
            <QRCodeCanvas
              value={meetup.registrationData?.token || "error"}
              size={200}
              level="H"
            />
          </div>

          <div className="space-y-1 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Attendee</p>
            <p className="text-gray-900 font-medium text-lg">{meetup.registrationData?.name}</p>
            <p className="text-gray-500 text-sm">{meetup.registrationData?.email}</p>
          </div>
          
          <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 w-full">
            <p className="text-xs text-gray-400 mb-1">Token ID</p>
            <p className="font-mono text-xs text-gray-600 break-all">{meetup.registrationData?.token}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t">
            <p className="text-xs text-gray-500">Present this QR code at the entrance.</p>
        </div>
      </div>
    </div>
  );
}

function RegistrationForm({ userProfile, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    onConfirm().finally(() => setSubmitting(false));
  };

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Confirm Registration</h3>
      
      <div className="grid gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
          <div className="px-3 py-2 bg-white border rounded-lg text-gray-700 text-sm shadow-sm">
            {userProfile?.display_name || "User"}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
          <div className="px-3 py-2 bg-white border rounded-lg text-gray-700 text-sm shadow-sm">
            {userProfile?.email}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-70 flex justify-center items-center gap-2 transition-colors shadow-md shadow-indigo-100"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        Confirm Registration
      </button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">No Upcoming Meetups</h3>
      <p className="text-gray-500 mt-1">Stay tuned! New events will be announced soon.</p>
    </div>
  );
}