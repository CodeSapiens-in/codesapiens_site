import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Loader2, X, Eye, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

// DoorwayScene removed


// ScrollRevealSection removed

const UserMentorshipForm = () => {
  const COOLDOWN_DURATION = 300;
  const [formData, setFormData] = useState({
    email: "", reasonForMentorship: "", skillsToDevelop: "", domain: "", topicsInterested: "", expectations: "", previousProjects: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        setAuthChecking(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setIsAuthenticated(false);
          setError("Please log in.");
          return;
        }

        setIsAuthenticated(true);
        setFormData((prev) => ({ ...prev, email: user.email || "" }));

        const { data: userRows } = await supabase.from("users").select("mentorship_request").eq("uid", user.id);
        const userData = userRows?.[0];

        if (userData && userData.mentorship_request && Array.isArray(userData.mentorship_request)) {
          const latestRequest = userData.mentorship_request.reduce((latest, request) => !latest || new Date(request.created_at) > new Date(latest.created_at) ? request : latest, null);
          if (latestRequest) {
            setLastSubmissionTime(latestRequest.created_at);
            const timePassed = Math.floor((Date.now() - new Date(latestRequest.created_at)) / 1000);
            if (timePassed < COOLDOWN_DURATION) {
              setCountdown(COOLDOWN_DURATION - timePassed);
              setShowCountdown(true);
            }
          }
        }
      } catch (err) { setError("Failed to verify authentication."); }
      finally { setAuthChecking(false); }
    };
    checkAuthAndFetchData();
  }, []);

  useEffect(() => {
    if (success) { setTimeout(() => setSuccess(null), 3000); }
  }, [success]);

  useEffect(() => {
    if (lastSubmissionTime && countdown > 0) {
      const timer = setInterval(() => {
        const timePassed = Math.floor((Date.now() - new Date(lastSubmissionTime)) / 1000);
        const remaining = COOLDOWN_DURATION - timePassed;
        if (remaining <= 0) { setCountdown(null); setShowCountdown(false); }
        else { setCountdown(remaining); }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lastSubmissionTime, countdown]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (lastSubmissionTime) {
        const timePassed = Math.floor((Date.now() - new Date(lastSubmissionTime)) / 1000);
        if (timePassed < COOLDOWN_DURATION) {
          setLoading(false); return;
        }
      }

      const mentorshipRequest = {
        reasonForMentorship: formData.reasonForMentorship.trim(),
        skillsToDevelop: formData.skillsToDevelop.split(",").map(s => s.trim()).filter(Boolean),
        domain: formData.domain.trim(),
        topicsInterested: formData.topicsInterested.split(",").map(t => t.trim()).filter(Boolean),
        expectations: formData.expectations.trim(),
        previousProjects: formData.previousProjects.trim(),
        created_at: new Date().toISOString(),
      };

      const { data: existingRows } = await supabase.from("users").select("mentorship_request").eq("uid", user.id);
      const existingData = existingRows?.[0];
      const updatedRequests = existingData?.mentorship_request ? [...existingData.mentorship_request, mentorshipRequest] : [mentorshipRequest];

      const { error } = await supabase.from("users").update({ mentorship_request: updatedRequests, updated_at: new Date().toISOString() }).eq("uid", user.id);
      if (error) throw error;

      setSuccess("Submitted successfully!");
      setLastSubmissionTime(mentorshipRequest.created_at);
      setCountdown(COOLDOWN_DURATION);
      setShowCountdown(true);
      setFormData({ ...formData, reasonForMentorship: "", skillsToDevelop: "", domain: "", topicsInterested: "", expectations: "", previousProjects: "" });

    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (authChecking) return <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-[#C2E812]" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center text-white"><Link to="/login" className="px-8 py-3 bg-[#0061FE] rounded-lg font-bold">Log In</Link></div>;

  return (
    <div className="min-h-screen bg-[#F7F5F2] pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-[#1E1E1E] mb-4">Mentorship Program</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with senior developers, break through plateaus, and accelerate your growth.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="p-8 md:p-12">
            {showCountdown ? (
              <div className="bg-[#F7F5F2] border-2 border-dashed border-[#1E1E1E] rounded-3xl p-16 text-center">
                <div className="w-20 h-20 bg-[#C2E812] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-[#1E1E1E]" />
                </div>
                <h3 className="text-3xl font-black text-[#1E1E1E] mb-2">Request Received</h3>
                <p className="text-gray-500 mb-8 text-lg">
                  Cooldown active: <span className="font-mono font-bold text-[#0061FE] bg-blue-50 px-2 py-1 rounded">{formatCountdown(countdown)}</span>
                </p>
                <Link to="/mentorship-list" className="block w-full bg-[#1E1E1E] text-white py-4 rounded-xl font-bold hover:bg-[#0061FE] transition-colors">
                  View Status
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-[#1E1E1E]">Application Details</h3>
                    <p className="text-sm text-gray-500 mt-1">Tell us about your goals</p>
                  </div>
                  <Link to="/mentorship-list" className="text-sm font-bold text-[#0061FE] hover:underline flex items-center gap-1">
                    View Past Requests <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg flex gap-2"><X className="w-5 h-5" /> {error}</div>}
                {success && <div className="bg-green-50 text-green-600 p-4 rounded-lg flex gap-2"><CheckCircle2 className="w-5 h-5" /> {success}</div>}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Domain Interest</label>
                    <input type="text" name="domain" value={formData.domain} onChange={handleInputChange} placeholder="e.g. Frontend Architecture" required className="w-full bg-[#F7F5F2] border-2 border-transparent focus:border-[#0061FE] px-5 py-4 rounded-xl text-lg font-bold text-[#1E1E1E] transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Target Skills</label>
                      <textarea name="skillsToDevelop" value={formData.skillsToDevelop} onChange={handleInputChange} placeholder="React, Three.js..." required rows="3" className="w-full bg-[#F7F5F2] border-2 border-transparent focus:border-[#0061FE] px-4 py-3 rounded-xl text-sm font-medium resize-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Key Topics</label>
                      <textarea name="topicsInterested" value={formData.topicsInterested} onChange={handleInputChange} placeholder="Performance, A11y..." required rows="3" className="w-full bg-[#F7F5F2] border-2 border-transparent focus:border-[#0061FE] px-4 py-3 rounded-xl text-sm font-medium resize-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your "Why"</label>
                    <textarea name="reasonForMentorship" value={formData.reasonForMentorship} onChange={handleInputChange} placeholder="What is your main blocker right now?" required rows="3" className="w-full bg-[#F7F5F2] border-2 border-transparent focus:border-[#0061FE] px-4 py-3 rounded-xl text-[#1E1E1E] font-medium transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Previous Work</label>
                    <textarea name="previousProjects" value={formData.previousProjects} onChange={handleInputChange} placeholder="Link or describe past projects..." required rows="2" className="w-full bg-[#F7F5F2] border-2 border-transparent focus:border-[#0061FE] px-4 py-3 rounded-xl text-[#1E1E1E] font-medium transition-all" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#1E1E1E] text-white font-bold py-5 rounded-xl hover:bg-[#0061FE] transition-all transform hover:-translate-y-1 shadow-lg disabled:opacity-50 flex justify-center items-center gap-3">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Submit Application <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserMentorshipForm;