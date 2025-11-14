import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // Adjust path to your Supabase client
import { Loader2, X, Eye } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link for navigation

const UserMentorshipForm = () => {
  // Define the cooldown duration (in seconds)
  const COOLDOWN_DURATION = 300; // Changed from 15 to 30 seconds

  const [formData, setFormData] = useState({
    email: "",
    reasonForMentorship: "",
    skillsToDevelop: "",
    domain: "",
    topicsInterested: "",
    expectations: "",
    previousProjects: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);

  // Format countdown seconds into days, hours, minutes, seconds
  const formatCountdown = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    const parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
    return parts.join(", ");
  };

  // Check authentication status and fetch existing mentorship data
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        setAuthChecking(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error("[Frontend] : Auth error:", authError);
          setIsAuthenticated(false);
          setError("Authentication failed. Please log in.");
          return;
        }
        if (!user) {
          setIsAuthenticated(false);
          setError("Please log in to submit the mentorship form.");
          return;
        }

        setIsAuthenticated(true);
        setFormData((prev) => ({ ...prev, email: user.email || "" }));

        // Ensure user exists in users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("mentorship_request")
          .eq("uid", user.id)
          .single();

        if (userError && userError.code === "PGRST116") {
          // User doesn't exist, create a new row
          const { error: insertError } = await supabase
            .from("users")
            .insert({ uid: user.id, email: user.email || "unknown@example.com" });
          if (insertError) {
            console.error("[Frontend] : Error creating user:", insertError);
            setError("Failed to initialize user data. Please try again.");
            return;
          }
        } else if (userError) {
          console.error("[Frontend] : Error fetching user data:", userError);
          setError("Failed to fetch user data. Please try again.");
          return;
        }

        // Fetch latest submission time from mentorship_request array
        if (userData && userData.mentorship_request && Array.isArray(userData.mentorship_request)) {
          const latestRequest = userData.mentorship_request.reduce((latest, request) => {
            return !latest || new Date(request.created_at) > new Date(latest.created_at) ? request : latest;
          }, null);
          if (latestRequest) {
            setLastSubmissionTime(latestRequest.created_at);
            const timePassed = Math.floor((Date.now() - new Date(latestRequest.created_at)) / 1000);
            if (timePassed < COOLDOWN_DURATION) { // Updated to use COOLDOWN_DURATION
              setCountdown(COOLDOWN_DURATION - timePassed); // Updated
              setShowCountdown(true);
            }
          }
        }
      } catch (err) {
        console.error("[Frontend] : Error checking auth or fetching data:", err);
        setError("Failed to verify authentication or fetch data. Please try again.");
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuthAndFetchData();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Countdown timer for submission lockout
  useEffect(() => {
    if (lastSubmissionTime && countdown > 0) {
      const timer = setInterval(() => {
        const timePassed = Math.floor((Date.now() - new Date(lastSubmissionTime)) / 1000);
        const remaining = COOLDOWN_DURATION - timePassed; // Updated to use COOLDOWN_DURATION
        if (remaining <= 0) {
          setCountdown(null);
          setShowCountdown(false);
        } else {
          setCountdown(remaining);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lastSubmissionTime, countdown]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
    setSuccess(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated. Please log in.");
      }
      if (!user.email) {
        throw new Error("User email not available. Please ensure your account has an email.");
      }

      // Check if COOLDOWN_DURATION seconds have passed since last submission
      if (lastSubmissionTime) {
        const timePassed = Math.floor((Date.now() - new Date(lastSubmissionTime)) / 1000);
        if (timePassed < COOLDOWN_DURATION) { // Updated to use COOLDOWN_DURATION
          setCountdown(COOLDOWN_DURATION - timePassed); // Updated
          setShowCountdown(true);
          setError(`Please wait ${formatCountdown(COOLDOWN_DURATION - timePassed)} before submitting again.`); // Updated
          setLoading(false);
          return;
        }
      }

      const mentorshipRequest = {
        reasonForMentorship: formData.reasonForMentorship.trim(),
        skillsToDevelop: formData.skillsToDevelop.split(",").map((s) => s.trim()).filter(Boolean),
        domain: formData.domain.trim(),
        topicsInterested: formData.topicsInterested.split(",").map((t) => t.trim()).filter(Boolean),
        expectations: formData.expectations.trim(),
        previousProjects: formData.previousProjects.trim(),
        created_at: new Date().toISOString(),
      };

      console.log("[Frontend] : Submitting mentorship request for user:", user.id, "Email:", user.email, "Data:", mentorshipRequest);

      // Fetch existing mentorship_request array
      const { data: existingData, error: fetchError } = await supabase
        .from("users")
        .select("mentorship_request")
        .eq("uid", user.id)
        .single();

      if (fetchError) {
        console.error("[Frontend] : Error fetching existing data:", fetchError);
        throw new Error("Failed to fetch existing data. Please try again.");
      }

      // Append new request to existing array or create new array
      const updatedMentorshipRequest = Array.isArray(existingData.mentorship_request)
        ? [...existingData.mentorship_request, mentorshipRequest]
        : [mentorshipRequest];

      // Update the users table with the new mentorship_request array
      const { data, error } = await supabase
        .from("users")
        .update({
          mentorship_request: updatedMentorshipRequest,
          updated_at: new Date().toISOString(),
        })
        .eq("uid", user.id)
        .select("*")
        .single();

      if (error) {
        console.error("[Frontend] : Error saving mentorship request:", error);
        throw new Error(
          error.code === "23502"
            ? `Missing required field: ${error.message.includes("email") ? "email" : "unknown"}`
            : error.code === "42501"
            ? "Permission denied. Check RLS policies for the 'users' table."
            : error.code === "42P01"
            ? "Table 'users' does not exist or 'mentorship_request' column is missing."
            : error.message || "Failed to save mentorship request."
        );
      }

      console.log("[Frontend] : Mentorship request saved:", data);
      setSuccess("Mentorship request submitted successfully!");
      setLastSubmissionTime(mentorshipRequest.created_at);
      setCountdown(COOLDOWN_DURATION); // Updated to use COOLDOWN_DURATION
      setShowCountdown(true);
      setFormData({
        email: user.email || "",
        reasonForMentorship: "",
        skillsToDevelop: "",
        domain: "",
        topicsInterested: "",
        expectations: "",
        previousProjects: "",
      });
    } catch (err) {
      console.error("[Frontend] : Submission error:", err);
      setError(err.message || "Failed to submit form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">{error || "Please log in to submit the mentorship form."}</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (showCountdown) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-lg p-4 bg-white rounded-xl shadow-md relative">
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          {success && <p className="text-sm text-green-500 mb-4">{success}</p>}
          <p className="text-sm text-blue-500 mb-4">
            Please wait {formatCountdown(countdown)} before submitting another request.
          </p>
          <Link
            to="/mentorship-list"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
          >
            <Eye className="w-5 h-5" />
            <span>View Submissions</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Fixed Image */}
      <div className="fixed top-0 left-0 w-full md:w-1/2 h-screen">
        <img
          src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/sea-7456253_1280_vbb9f8_qmwugf.jpg"
          alt="Mentorship"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Scrollable Form */}
      <div className="w-full md:ml-[50%] md:w-1/2 flex justify-center items-start bg-gray-50 overflow-y-auto min-h-screen">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-lg flex-col gap-4 bg-white p-4 md:p-8 rounded-xl shadow-md relative my-4 md:my-8"
        >
          {/* Loading Bar */}
          {loading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse" />
          )}

          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Join Our Mentorship
            </h2>
            <Link
              to="/mentorship-list"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
            >
              <Eye className="w-5 h-5" />
              <span>View Submissions</span>
            </Link>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {success && <p className="text-sm text-green-500 text-center">{success}</p>}

          {/* Email Field */}
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1 text-sm font-medium text-gray-700">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@example.com"
              required
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Reason for Mentorship */}
          <div className="flex flex-col">
            <label htmlFor="reasonForMentorship" className="mb-1 text-sm font-medium text-gray-700">
              Why do you need a mentor?
            </label>
            <textarea
              id="reasonForMentorship"
              name="reasonForMentorship"
              value={formData.reasonForMentorship}
              onChange={handleInputChange}
              placeholder="E.g., I need guidance on career growth or technical skills..."
              required
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              rows="3"
            />
          </div>

          {/* Specific Skills or Goals */}
          <div className="flex flex-col">
            <label htmlFor="skillsToDevelop" className="mb-1 text-sm font-medium text-gray-700">
              Specific skills or goals to develop
            </label>
            <textarea
              id="skillsToDevelop"
              name="skillsToDevelop"
              value={formData.skillsToDevelop}
              onChange={handleInputChange}
              placeholder="E.g., React, Node.js, Cloud Computing (list them separated by commas)"
              required
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              rows="2"
            />
          </div>

          {/* Domain */}
          <div className="flex flex-col">
            <label htmlFor="domain" className="mb-1 text-sm font-medium text-gray-700">
              Your domain
            </label>
            <input
              type="text"
              id="domain"
              name="domain"
              value={formData.domain}
              onChange={handleInputChange}
              placeholder="E.g., Web Development, Data Science, AI"
              required
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Topics Interested In */}
          <div className="flex flex-col">
            <label htmlFor="topicsInterested" className="mb-1 text-sm font-medium text-gray-700">
              Topics you are interested in
            </label>
            <textarea
              id="topicsInterested"
              name="topicsInterested"
              value={formData.topicsInterested}
              onChange={handleInputChange}
              placeholder="E.g., Frontend frameworks, Backend APIs, DevOps..."
              required
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              rows="2"
            />
          </div>

          {/* Expectations from Mentorship */}
          <div className="flex flex-col">
            <label htmlFor="expectations" className="mb-1 text-sm font-medium text-gray-700">
              What do you expect from this mentorship?
            </label>
            <textarea
              id="expectations"
              name="expectations"
              value={formData.expectations}
              onChange={handleInputChange}
              placeholder="E.g., Weekly sessions, project feedback, career advice..."
              required
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              rows="3"
            />
          </div>

          {/* Previous Projects */}
          <div className="flex flex-col">
            <label htmlFor="previousProjects" className="mb-1 text-sm font-medium text-gray-700">
              Previous projects you have worked on
            </label>
            <textarea
              id="previousProjects"
              name="previousProjects"
              value={formData.previousProjects}
              onChange={handleInputChange}
              placeholder="E.g., Built a personal portfolio website, contributed to open-source..."
              required
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              rows="3"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white transition ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Submitting...
              </div>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserMentorshipForm;