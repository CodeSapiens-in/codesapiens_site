// src/pages/UserMeetupsList.jsx
import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useUser } from "@supabase/auth-helpers-react"; // <-- NEW
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import {
  Calendar,
  Clock,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  LogIn,
} from "lucide-react";

export default function UserMeetupsList() {
  const user = useUser(); // <-- Current logged-in user
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // --------------------------------------------------------------
  // 1. Load ALL meetups
  // --------------------------------------------------------------
  useEffect(() => {
    const fetchMeetups = async () => {
      const { data, error } = await supabase
        .from("meetup")
        .select("id, title, description, start_date_time, end_date_time")
        .order("start_date_time", { ascending: true });

      if (error) {
        toast.error("Failed to load meetups");
        setMeetups([]);
      } else {
        setMeetups(data);
      }
      setLoading(false);
    };
    fetchMeetups();
  }, []);

  // --------------------------------------------------------------
  // 2. Registration for a specific meetup
  // --------------------------------------------------------------
  const handleRegister = async (meetupId, name, email) => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("registrations")
        .insert({
          meetup_id: meetupId,
          user_name: name.trim(),
          user_email: email.trim().toLowerCase(),
        })
        .select("token")
        .single();

      if (error) throw error;

      setMeetups((prev) =>
        prev.map((m) =>
          m.id === meetupId
            ? { ...m, registered: true, qrToken: data.token, regName: name, regEmail: email }
            : m
        )
      );
      toast.success("Registered! Show this QR at the venue.");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    }
  };

  // --------------------------------------------------------------
  // 3. Helpers
  // --------------------------------------------------------------
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

  // --------------------------------------------------------------
  // 4. UI
  // --------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (meetups.length === 0) {
    return (
      <>
        <Toaster position="top-center" />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Meetups</h2>
            <p className="text-gray-600">Check back later for upcoming events.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              Upcoming Meetups
            </h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {meetups.map((meetup) => (
            <div
              key={meetup.id}
              className="bg-white rounded-2xl shadow-lg p-8 transition-all"
            >
              {/* Meetup Info */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {meetup.title}
                  </h2>
                  {meetup.description && (
                    <p className="text-gray-600 mb-4">{meetup.description}</p>
                  )}

                  <div className="flex flex-wrap gap-6 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <span>{formatDate(meetup.start_date_time)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span>
                        {formatTime(meetup.start_date_time)} –{" "}
                        {formatTime(meetup.end_date_time)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <span>Open</span>
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                {!meetup.registered && (
                  <button
                    onClick={() => setExpandedId(meetup.id)}
                    disabled={!user}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {user ? "Register Now" : "Login to Register"}
                  </button>
                )}
              </div>

              {/* Registration Form */}
              {expandedId === meetup.id && !meetup.registered && (
                <div className="mt-8 pt-6 border-t">
                  <RegistrationForm
                    meetupId={meetup.id}
                    user={user}
                    onRegister={(name, email) => {
                      handleRegister(meetup.id, name, email);
                      setExpandedId(null);
                    }}
                    onCancel={() => setExpandedId(null)}
                  />
                </div>
              )}

              {/* QR Code */}
              {meetup.registered && (
                <div className="mt-8 pt-6 border-t text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    You're Registered!
                  </h3>
                  <p className="text-gray-600 mb-6">Show this QR at the venue</p>

                  <div className="bg-gray-50 p-6 rounded-2xl inline-block">
                    <QRCodeCanvas
                      value={meetup.qrToken}
                      size={220}
                      level="H"
                      includeMargin
                    />
                  </div>

                  <div className="mt-4 p-3 bg-indigo-50 rounded-xl inline-block">
                    <p className="text-sm font-mono text-indigo-700 break-all">
                      {meetup.qrToken}
                    </p>
                  </div>

                  <p className="mt-4 text-sm text-gray-500">
                    <strong>Name:</strong> {meetup.regName} <br />
                    <strong>Email:</strong> {meetup.regEmail}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// --------------------------------------------------------------
// Registration Form (Auto-filled, Non-editable)
// --------------------------------------------------------------
function RegistrationForm({ meetupId, user, onRegister, onCancel }) {
  const [submitting, setSubmitting] = useState(false);

  // Extract name & email from Supabase auth user
  const name =
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0].replace(".", " ") : "");
  const email = user?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to register.");
      return;
    }
    setSubmitting(true);
    await onRegister(name, email);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Field - Disabled */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          readOnly
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
          placeholder="Your name"
        />
      </div>

      {/* Email Field - Disabled */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          readOnly
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
          placeholder="your@email.com"
        />
      </div>

      {/* Login Hint */}
      {!user && (
        <div className="flex items-center space-x-2 text-amber-600 text-sm">
          <LogIn className="w-4 h-4" />
          <span>Please log in to register with your account details.</span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={submitting || !user}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          <span>{submitting ? "Registering…" : "Register & Get QR"}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}