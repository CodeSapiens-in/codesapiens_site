import React, { useState, useEffect } from "react";
import { Calendar, Trophy, Users, TrendingUp, Settings, X, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import DashboardBlogSection from "../components/DashboardBlogSection";

export default function UserDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mode, setMode] = useState("dashboard");
  const [formData, setFormData] = useState({ email: "" });
  const navigate = useNavigate();

  // Utility function to validate and normalize URLs
  const validateUrl = (url) => {
    if (!url) return "#";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  useEffect(() => {
    const handleAuthEvent = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get("type");

      if (type === "recovery" && session?.access_token) {
        setMode("newPassword");
        setFormData({ ...formData, email: session.user.email });
      }
    };
    handleAuthEvent();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setAuthChecking(true);
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Auth error:", authError);
          setIsAuthenticated(false);
          setAuthChecking(false);
          return;
        }

        if (!user) {
          setIsAuthenticated(false);
          setAuthChecking(false);
          return;
        }

        setIsAuthenticated(true);

        const { data, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("uid", user.id)
          .single();

        console.log("Fetched profile:", data, profileError);

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setError(profileError.message);
          return;
        }

        if (data) {
          if (data.role === "admin") {
            window.location.href = "/admin";
            return;
          }

          const transformedData = {
            uid: data.uid,
            displayName: data.display_name || "",
            email: data.email || user.email || "",
            phoneNumber: data.phone_number || "",
            avatar: data.avatar || "",
            adminApproved: data.admin_approved || false,
            badgesEarned: data.badges_earned || 0,
            bio: data.bio || "",
            college: data.college || "",
            createdAt: data.created_at,
            emailVerified: data.email_verified || user.email_confirmed_at !== null,
            githubUrl: data.github_url || "",
            linkedinUrl: data.linkedin_url || "",
            phoneVerified: data.phone_verified || false,
            points: data.points || 0,
            portfolioUrl: data.portfolio_url || "",
            role: data.role || "",
            sessionsAttended: data.sessions_attended || 0,
            skills: data.skills || [],
            updatedAt: data.updated_at,
            volunteeringHours: data.volunteering_hours || 0,
          };

          setUserData(transformedData);
        } else {
          setError("User profile not found");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error in fetchUserData:", err);
      } finally {
        setLoading(false);
        setAuthChecking(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle external link navigation for events
  const handleEventsClick = () => {
    window.open("https://luma.com/codesapiens?k=c&period=past", "_blank", "noopener,noreferrer");
  };

  // Render password recovery form
  if (mode === "newPassword") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Set New Password</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              /* Handle password update */
            }}
          >
            <input
              type="email"
              value={formData.email}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 bg-gray-50"
              placeholder="Email"
            />
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              placeholder="New Password"
            />
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              placeholder="Confirm New Password"
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Generate personalized welcome message
  const getPersonalizedWelcomeMessage = () => {
    if (!userData) return "Welcome back, Student!";
    const name = userData.displayName || userData.email?.split("@")[0] || "Student";
    const role = userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : "Member";
    const hasSkills = userData.skills && userData.skills.length > 0;
    const hasBadges = userData.badgesEarned > 0;

    if (hasBadges && hasSkills) {
      return `Welcome back, ${name}! As a ${role} with ${userData.badgesEarned} badge${userData.badgesEarned > 1 ? "s" : ""} and skills like ${userData.skills[0]}, you're making waves in our community!`;
    } else if (hasBadges) {
      return `Welcome back, ${name}! Your ${userData.badgesEarned} badge${userData.badgesEarned > 1 ? "s" : ""} as a ${role} show your dedication—keep shining!`;
    } else if (hasSkills) {
      return `Welcome back, ${name}! Your skills like ${userData.skills[0]} make you a standout ${role} in our community!`;
    } else {
      return `Welcome back, ${name}! Excited to see you grow as a ${role} in our community!`;
    }
  };

  const handleSignOut = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
      }

      // Clear any local state and redirect
      setUserData(null);
      setIsMobileMenuOpen(false);
      setIsProfileDropdownOpen(false);

      // Redirect to login or home page
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {authChecking && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {!authChecking && !isAuthenticated && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
            <button
              onClick={() => handleSignOut()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      {!authChecking && isAuthenticated && (
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-gray-600">Loading your dashboard...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <X className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">Error loading user data: {error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && userData && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {getPersonalizedWelcomeMessage()}
                </h1>
                <p className="text-gray-600">Here's what's happening in your student community today.</p>
                {userData.bio && <p className="text-gray-500 text-sm mt-1">{userData.bio}</p>}
                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                  <span>{userData.college || "No college set"}</span>
                  <span>•</span>
                  <span>{userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1)}</span>
                  {userData.emailVerified && (
                    <>
                      <span>•</span>
                      <span className="text-green-600">✓ Email Verified</span>
                    </>
                  )}
                  {!userData.emailVerified && (
                    <>
                      <span>•</span>
                      <span className="text-yellow-600">⚠ Email Not Verified</span>
                    </>
                  )}
                </div>
              </div>

              {/* Blog Section */}
              <DashboardBlogSection maxPosts={3} />

              {userData.skills && userData.skills.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {userData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Skills</h2>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Settings className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No skills added yet. Add your skills to help others find you!</p>
                    <button
                      className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                      onClick={() => navigate("/profile")}
                    >
                      Add Skills
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Calendar className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
                  </div>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Events</h3>
                    <p className="text-gray-500 mb-4">
                      We're working on an exciting events system where you can discover and join amazing learning opportunities.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <button
                        onClick={handleEventsClick}
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                      >
                        View Events
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </button>
                      <span className="text-sm text-gray-400">Opens in new tab</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Stay tuned for updates!</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Trophy className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-gray-900">Badges & Achievements</h2>
                  </div>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Badges Coming Soon!</h3>
                    <p className="text-gray-500 mb-4">
                      We're creating an exciting badge system to recognize your achievements and progress.
                    </p>
                    <p className="text-sm text-gray-400">Get ready to earn your first badge!</p>
                  </div>
                </div>
              </div>

              {userData.githubUrl || userData.linkedinUrl || userData.portfolioUrl ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Links</h2>
                  <div className="flex flex-wrap gap-3">
                    {userData.githubUrl && (
                      <a
                        href={validateUrl(userData.githubUrl)}
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(validateUrl(userData.githubUrl), "_blank", "noopener,noreferrer");
                        }}
                        className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                      >
                        <span className="text-sm font-medium text-gray-700">GitHub</span>
                      </a>
                    )}
                    {userData.linkedinUrl && (
                      <a
                        href={validateUrl(userData.linkedinUrl)}
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(validateUrl(userData.linkedinUrl), "_blank", "noopener,noreferrer");
                        }}
                        className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                      >
                        <span className="text-sm font-medium text-blue-700">LinkedIn</span>
                      </a>
                    )}
                    {userData.portfolioUrl && (
                      <a
                        href={validateUrl(userData.portfolioUrl)}
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(validateUrl(userData.portfolioUrl), "_blank", "noopener,noreferrer");
                        }}
                        className="flex items-center px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors duration-200"
                      >
                        <span className="text-sm font-medium text-purple-700">Portfolio</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Links</h2>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Settings className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">Add Profile Links</p>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                      onClick={() => navigate("/profile")}
                    >
                      Add Profile Links
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      )}
    </div>
  );
}