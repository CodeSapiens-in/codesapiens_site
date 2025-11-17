// src/pages/UserMeetup.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import {
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function UserMeetup() {
  const { meetupId } = useParams(); // <-- only params, no navigate

  const [meetup, setMeetup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [form, setForm] = useState({ name: "", email: "" });

  // --------------------------------------------------------------
  // 1. Load meetup – stay on page on error
  // --------------------------------------------------------------
  useEffect(() => {
    const fetchMeetup = async () => {
      const { data, error } = await supabase
        .from("meetup")
        .select("title, description, start_date_time, end_date_time")
        .eq("id", meetupId)
        .single();

      if (error || !data) {
        toast.error("No meetup found with this ID");
        setMeetup(null); // keep null → show error UI
      } else {
        setMeetup(data);
      }
      setLoading(false);
    };
    fetchMeetup();
  }, [meetupId]);

  // --------------------------------------------------------------
  // 2. Form handling
  // --------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setRegistering(true);
    try {
      const { data, error } = await supabase
        .from("registrations")
        .insert({
          meetup_id: meetupId,
          user_name: form.name.trim(),
          user_email: form.email.trim().toLowerCase(),
        })
        .select("token")
        .single();

      if (error) throw error;

      setQrToken(data.token);
      setRegistered(true);
      toast.success("Registered! Show this QR at the venue.");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setRegistering(false);
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

  // ---- No meetup found -------------------------------------------------
  if (!meetup) {
    return (
      <>
        <Toaster position="top-center" />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Meetup Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The link you followed may be incorrect or the event has been removed.
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  // ---- Normal meetup UI ------------------------------------------------
  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Event Registration</h1>
            <div className="w-20" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Meetup Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{meetup.title}</h2>
            {meetup.description && <p className="text-gray-600 mb-6">{meetup.description}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-3 text-gray-700">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="font-semibold">Date</p>
                  <p>{formatDate(meetup.start_date_time)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold">Time</p>
                  <p>
                    {formatTime(meetup.start_date_time)} – {formatTime(meetup.end_date_time)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold">Status</p>
                  <p className="text-green-600 font-medium">Open</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          {!registered ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Register Now</h3>
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={registering}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-medium text-lg"
                >
                  {registering ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Registering…</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      <span>Register & Get QR</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* QR Success Card */
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Registered!</h3>
              <p className="text-gray-600 mb-8">Show this QR at the venue</p>

              <div className="bg-gray-50 p-8 rounded-2xl inline-block">
                <QRCodeCanvas value={qrToken} size={256} level="H" includeMargin />
              </div>

              <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
                <p className="text-sm font-mono text-indigo-700 break-all">{qrToken}</p>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                <strong>Name:</strong> {form.name} <br />
                <strong>Email:</strong> {form.email}
              </p>

              <button
                onClick={() => window.history.back()}
                className="mt-8 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
              >
                Back to Events
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}