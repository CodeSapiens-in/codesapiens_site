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
        const { data, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('uid', user.id)
          .single();

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

  const stats = userData
    ? [
        {
          title: "Total Points",
          value: userData.points?.toString() || "0",
          icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
          bgColor: "bg-blue-50",
          iconBg: "bg-blue-100",
        },
        {
          title: "Sessions Attended",
          value: userData.sessionsAttended?.toString() || "0",
          icon: <Calendar className="w-6 h-6 text-green-500" />,
          bgColor: "bg-green-50",
          iconBg: "bg-green-100",
        },
        {
          title: "Badges Earned",
          value: userData.badgesEarned?.toString() || "0",
          icon: <Trophy className="w-6 h-6 text-purple-500" />,
          bgColor: "bg-purple-50",
          iconBg: "bg-purple-100",
        },
        {
          title: "Volunteering Hours",
          value: userData.volunteeringHours?.toString() || "0",
          icon: <Users className="w-6 h-6 text-orange-500" />,
          bgColor: "bg-orange-50",
          iconBg: "bg-orange-100",
        },
      ]
    : [];

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
                  ! 👋
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

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`${stat.bgColor} rounded-xl p-4 sm:p-6 border border-gray-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          {stat.title}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`${stat.iconBg} p-3 rounded-lg`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Upcoming Events */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No upcoming events
                    </h3>
                    <p className="text-gray-500">
                      Check back later for new events!
                    </p>
                    <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                      Browse Events
                    </button>
                  </div>
                </div>

                {/* Recent Badges */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Trophy className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recent Badges
                    </h2>
                  </div>

                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-gray-400" />
                    </div>
                    {userData.badgesEarned > 0 ? (
                      <>
                        <p className="text-gray-700 mb-2">
                          You have {userData.badgesEarned} badge
                          {userData.badgesEarned !== 1 ? "s" : ""}!
                        </p>
                        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200">
                          View All Badges
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 text-sm mb-2">
                          No badges earned yet
                        </p>
                        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200">
                          Earn Your First Badge
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Links */}
              {userData.githubUrl ||
              userData.linkedinUrl ||
              userData.portfolioUrl ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
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

              {/* User Info Debug Panel (remove in production) */}
              <div className="bg-gray-100 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Debug: User Data
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Email:</strong> {userData.email || "Not set"}
                  </div>
                  <div>
                    <strong>Display Name:</strong>{" "}
                    {userData.displayName || "Not set"}
                  </div>
                  <div>
                    <strong>College:</strong> {userData.college || "Not set"}
                  </div>
                  <div>
                    <strong>Bio:</strong> {userData.bio || "Not set"}
                  </div>
                  <div>
                    <strong>Role:</strong> {userData.role}
                  </div>
                  <div>
                    <strong>Email Verified:</strong>{" "}
                    {userData.emailVerified ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>Points:</strong> {userData.points}
                  </div>
                  <div>
                    <strong>Badges:</strong> {userData.badgesEarned}
                  </div>
                  <div>
                    <strong>Sessions:</strong> {userData.sessionsAttended}
                  </div>
                  <div>
                    <strong>Volunteer Hours:</strong>{" "}
                    {userData.volunteeringHours}
                  </div>
                  <div>
                    <strong>Skills Count:</strong>{" "}
                    {userData.skills?.length || 0}
                  </div>
                  <div>
                    <strong>Admin Approved:</strong>{" "}
                    {userData.adminApproved ? "Yes" : "No"}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Quick Actions
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <button className="flex flex-col items-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Join Event
                    </span>
                  </button>

                  <button className="flex flex-col items-center p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Find Peers
                    </span>
                  </button>

                  <button className="flex flex-col items-center p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors duration-200">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                      <Trophy className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      View Badges
                    </span>
                  </button>

                  <button className="flex flex-col items-center p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors duration-200">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Progress
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      )}
    </div>
  );
}