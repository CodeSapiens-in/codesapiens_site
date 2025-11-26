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
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function UserMeetupsList() {
  const user = useUser();
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [expandedRegisterId, setExpandedRegisterId] = useState(null);

  // 1. Fetch User Profile (Reliable & Required)
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("display_name, email, avatar")
          .eq("uid", user.id)
          .single();

        if (error) throw error;

        if (!data?.display_name) {
          toast.error("Please set your display name in your profile.");
        }

        setUserProfile(data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        toast.error("Failed to load your profile. Please refresh.");
      }
    };

    fetchUserProfile();
  }, [user]);

  // 2. Fetch Meetups + Registration Status
  useEffect(() => {
    const fetchMeetups = async () => {
      setLoading(true);

      const { data: meetupsData, error: meetupError } = await supabase
        .from("meetup")
        .select("*, venue, registration_start_time, registration_end_time, registration_open_until_meetup_end")
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

  // 3. Handle Registration – Uses display_name from users table
  const handleRegister = async (meetupId) => {
    if (!user) return toast.error("Please log in to register");
    if (!userProfile?.display_name) {
      toast.error("Please set your display name in your profile first.");
      return;
    }

    const nameToUse = userProfile.display_name.trim();
    const emailToUse = userProfile.email || user.email;

    if (!nameToUse) {
      toast.error("Display name is required. Update your profile.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("registrations")
        .insert({
          meetup_id: meetupId,
          user_name: nameToUse,
          user_email: emailToUse,
          user_id: user.id,
        })
        .select("token, created_at")
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("You're already registered for this event!");
          return;
        }
        throw error;
      }

      // Update UI instantly
      setMeetups((prev) =>
        prev.map((m) =>
          m.id === meetupId
            ? {
              ...m,
              registered: true,
              registrationData: {
                token: data.token,
                name: nameToUse,
                email: emailToUse,
                registeredAt: data.created_at,
              },
            }
            : m
        )
      );

      toast.success("Registered successfully!");

      // Auto-open ticket
      const registeredMeetup = meetups.find((m) => m.id === meetupId);
      if (registeredMeetup) {
        setSelectedTicket({
          ...registeredMeetup,
          registrationData: {
            token: data.token,
            name: nameToUse,
            email: emailToUse,
          },
        });
      }

      setExpandedRegisterId(null);
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.message || "Registration failed");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50/50 pb-12 font-sans">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Community Events
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Discover & Connect
                </h1>
                <p className="text-lg text-gray-500 max-w-lg">
                  Join our latest meetups, workshops, and hackathons. Connect with fellow developers and grow your skills.
                </p>
              </div>

              {user && userProfile && (
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      userProfile.display_name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{userProfile.display_name || "Welcome!"}</p>
                    <p className="text-xs text-gray-500">{userProfile.email || user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
          {meetups.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-8">
              {meetups.map((meetup) => (
                <MeetupCard
                  key={meetup.id}
                  meetup={meetup}
                  user={user}
                  userProfile={userProfile}
                  isRegistering={expandedRegisterId === meetup.id}
                  onToggleRegister={() =>
                    setExpandedRegisterId(expandedRegisterId === meetup.id ? null : meetup.id)
                  }
                  onRegisterConfirm={() => handleRegister(meetup.id)}
                  onViewTicket={() => setSelectedTicket(meetup)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Modal */}
      {selectedTicket && <TicketModal meetup={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </>
  );
}

/* === Sub Components === */
function MeetupCard({ meetup, user, userProfile, isRegistering, onToggleRegister, onRegisterConfirm, onViewTicket }) {
  const parseLocalDate = (dateString) => {
    if (!dateString) return new Date();
    const cleanedString = dateString.replace(/Z$|[+-]\d{2}:\d{2}$/, "");
    return new Date(cleanedString);
  };

  const startDateObj = parseLocalDate(meetup.start_date_time);
  const endDateObj = parseLocalDate(meetup.end_date_time);
  const isUpcoming = startDateObj > new Date();
  const isLive = startDateObj <= new Date() && new Date() <= endDateObj;

  const formatTime = (date) => {
    if (!date || isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Registration Status Logic
  const getRegistrationStatus = () => {
    const now = new Date();

    // 1. Not Open Yet
    if (meetup.registration_start_time && now < new Date(meetup.registration_start_time)) {
      return {
        isOpen: false,
        message: `Opens ${new Date(meetup.registration_start_time).toLocaleDateString()}`,
        type: 'upcoming'
      };
    }

    // 2. Closed
    let closeTime = null;
    if (meetup.registration_open_until_meetup_end) {
      closeTime = endDateObj;
    } else if (meetup.registration_end_time) {
      closeTime = new Date(meetup.registration_end_time);
    } else {
      // Default: Close when event starts if no specific end time set
      closeTime = startDateObj;
    }

    if (now > closeTime) {
      return { isOpen: false, message: "Registration Closed", type: 'closed' };
    }

    // 3. Open
    return { isOpen: true, message: "Register Now", type: 'open' };
  };

  const regStatus = getRegistrationStatus();

  return (
    <div
      className={`group bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-xl hover:border-indigo-100 ${!isUpcoming && !isLive ? "opacity-75 grayscale-[0.3]" : ""
        }`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Left: Date */}
        <div className="md:w-48 bg-gray-50 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100 group-hover:bg-indigo-50/30 transition-colors">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full max-w-[100px]">
            <span className="block text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              {startDateObj.toLocaleString("default", { month: "short" })}
            </span>
            <span className="block text-3xl font-black text-gray-900">{startDateObj.getDate()}</span>
          </div>
          <div className="mt-4 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">
              <Clock className="w-3 h-3" />
              {formatTime(startDateObj)}
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col">
          <div className="flex-1">
            <div className="flex justify-between items-start gap-4 mb-3">
              <div>
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 animate-pulse mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    LIVE NOW
                  </span>
                )}
                <h2 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {meetup.title}
                </h2>
              </div>
              {meetup.registered && (
                <div className="hidden sm:flex flex-col items-end">
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Registered
                  </span>
                </div>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2 md:line-clamp-3">
              {meetup.description}
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="font-medium">{meetup.venue || "Venue not set"}</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
            {meetup.registered ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="sm:hidden bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Registered
                </span>
                <button
                  onClick={onViewTicket}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Ticket className="w-4 h-4" />
                  View Entry Pass
                </button>
              </div>
            ) : regStatus.isOpen ? (
              !user ? (
                <button
                  onClick={() => toast.error("Please log in to register")}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  Log in to register <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onToggleRegister}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${isRegistering
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
                    }`}
                >
                  {isRegistering ? "Cancel" : "Register Now"}
                  {!isRegistering && <ChevronRight className="w-4 h-4" />}
                </button>
              )
            ) : (
              <span className={`text-sm font-medium px-4 py-2 rounded-lg ${regStatus.type === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}>
                {regStatus.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Registration Confirmation */}
      {isRegistering && (
        <div className="bg-gray-50/50 border-t border-gray-100 p-6 md:p-8 animate-in slide-in-from-top-2">
          <RegistrationForm userProfile={userProfile} user={user} onConfirm={onRegisterConfirm} />
        </div>
      )}
    </div>
  );
}

function TicketModal({ meetup, onClose }) {
  if (!meetup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-black tracking-tight mb-2 relative z-10">ENTRY PASS</h3>
          <p className="text-indigo-100 text-sm line-clamp-1 relative z-10 font-medium opacity-90">
            {meetup.title}
          </p>
        </div>

        <div className="p-8 flex flex-col items-center text-center relative bg-white">
          <div className="absolute top-[-12px] left-0 w-6 h-12 bg-black/60 rounded-r-full z-10" style={{ transform: "translateY(-50%)" }}></div>
          <div className="absolute top-[-12px] right-0 w-6 h-12 bg-black/60 rounded-l-full z-10" style={{ transform: "translateY(-50%)" }}></div>

          <div className="bg-white p-3 rounded-2xl border-2 border-dashed border-gray-200 mb-8">
            <QRCodeCanvas value={meetup.registrationData?.token || "error"} size={180} level="H" className="rounded-lg" />
          </div>

          <div className="space-y-1 mb-8 w-full">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Attendee</p>
            <h4 className="text-gray-900 font-bold text-xl">{meetup.registrationData?.name}</h4>
            <p className="text-gray-500 text-sm">{meetup.registrationData?.email}</p>
          </div>

          <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 w-full flex flex-col items-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Token ID</p>
            <p className="font-mono text-sm text-indigo-600 font-bold tracking-wider">{meetup.registrationData?.token}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium">
            Show this QR code at {meetup.venue || "the venue"} entrance
          </p>
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

  const displayName = userProfile?.display_name || "User";
  const displayEmail = userProfile?.email || "your@email.com";

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Confirm Registration</h3>
          <p className="text-xs text-gray-500">Review your details before registering</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="group">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
          <div className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm font-medium shadow-sm group-hover:border-indigo-300 transition-colors">
            {displayName}
          </div>
        </div>
        <div className="group">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
          <div className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm font-medium shadow-sm group-hover:border-indigo-300 transition-colors">
            {displayEmail}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-70 flex justify-center items-center gap-2 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5"
      >
        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
        {submitting ? "Registering..." : "Confirm & Get Ticket"}
      </button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-gray-500 font-medium animate-pulse">Loading events...</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Calendar className="w-10 h-10 text-indigo-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Meetups</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        We don't have any events scheduled right now. Check back later for updates!
      </p>
    </div>
  );
}