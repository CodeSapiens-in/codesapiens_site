import React, { useState, useEffect } from "react";
import { Calendar, Trophy, Users, TrendingUp, Settings, X } from "lucide-react";

// Import your actual Supabase client
import { supabase } from "../lib/supabaseClient";

export default function UserDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setAuthChecking(true);
        setLoading(true);
        setError(null);

        // Get the current authenticated user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error('Auth error:', authError);
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

        // Fetch user profile from the users table
        const { data, error: profileError } = await supabase.auth.getUser();

        console.log('Fetched profile:', data, profileError);

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError(profileError.message);
          return;
        }

        if (data) {
          // Handle role-based redirect
          if (data.role === "admin") {
            window.location.href = "/admin";
            return;
          }

          // Transform the data from snake_case to camelCase
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Auth Checking State - Prevents login page flash */}
      {authChecking && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying authentication...</p>
          </div>
        </div>
      )}

      {/* Unauthenticated State */}
      {!authChecking && !isAuthenticated && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please log in to access your dashboard.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Only show when authenticated */}
      {!authChecking && isAuthenticated && (
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-gray-600">Loading your dashboard...</p>
            </div>
          )}

          {/* Error State */}
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

          {/* Main Content - Only show when data is loaded */}
          {!loading && !error && userData && (
            <>
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Welcome back,{" "}
                  {userData.displayName ||
                    userData.email?.split("@")[0] ||
                    "Student"}
                  !
                </h1>
                <p className="text-gray-600">
                  Here's what's happening in your student community today.
                </p>
                {userData.bio && (
                  <p className="text-gray-500 text-sm mt-1">{userData.bio}</p>
                )}
                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                  <span>{userData.college || "No college set"}</span>
                  <span>•</span>
                  <span>
                    {userData.role?.charAt(0).toUpperCase() +
                      userData.role?.slice(1)}
                  </span>
                  {userData.emailVerified && (
                    <>
                      <span>•</span>
                      <span className="text-green-600">✓ Email Verified</span>
                    </>
                  )}
                  {!userData.emailVerified && (
                    <>
                      <span>•</span>
                      <span className="text-yellow-600">
                        ⚠ Email Not Verified
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Skills Section */}
              {userData.skills && userData.skills.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Your Skills
                  </h2>
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Your Skills
                  </h2>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Settings className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      No skills added yet. Add your skills to help others find
                      you!
                    </p>
                    <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                      Add Skills
                    </button>
                  </div>
                </div>
              )}

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Upcoming Events */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Calendar className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Upcoming Events
                    </h2>
                  </div>

                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Events Coming Soon!
                    </h3>
                    <p className="text-gray-500 mb-4">
                      We're working on an exciting events system where you can discover and join amazing learning opportunities.
                    </p>
                    <p className="text-sm text-gray-400">Stay tuned for updates!</p>
                  </div>
                </div>

                {/* Recent Badges */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Trophy className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Badges & Achievements
                    </h2>
                  </div>

                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Badges Coming Soon!
                    </h3>
                    <p className="text-gray-500 mb-4">
                      We're creating an exciting badge system to recognize your achievements and progress.
                    </p>
                    <p className="text-sm text-gray-400">Get ready to earn your first badge!</p>
                  </div>
                </div>
              </div>

              {/* Profile Links */}
              {userData.githubUrl ||
              userData.linkedinUrl ||
              userData.portfolioUrl ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Your Links
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {userData.githubUrl && (
                      <a
                        href={userData.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          GitHub
                        </span>
                      </a>
                    )}
                    {userData.linkedinUrl && (
                      <a
                        href={userData.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                      >
                        <span className="text-sm font-medium text-blue-700">
                          LinkedIn
                        </span>
                      </a>
                    )}
                    {userData.portfolioUrl && (
                      <a
                        href={userData.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors duration-200"
                      >
                        <span className="text-sm font-medium text-purple-700">
                          Portfolio
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Your Links
                  </h2>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Settings className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">
                      No profile links added yet
                    </p>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
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