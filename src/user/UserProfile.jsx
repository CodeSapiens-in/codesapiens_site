import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  TrendingUp, 
  Award, 
  Calendar, 
  Hash,
  Github,
  Linkedin,
  Globe,
  Menu,
  X,
  Loader2,
  Trophy
} from 'lucide-react';
// Import your Supabase client
import { supabase } from '../lib/supabaseClient';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [userAchievements, setUserAchievements] = useState({ badges: [], certificates: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const tabs = ['Overview', 'Skills', 'Achievements', 'Activity'];

  // Fetch user data from Supabase
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
          // Transform the data from snake_case to camelCase for component use
          const transformedUser = {
            uid: data.uid,
            displayName: data.display_name || 'User',
            email: data.email || user.email || '',
            phoneNumber: data.phone_number || '',
            avatar: data.avatar || '',
            bio: data.bio || 'No bio available',
            college: data.college || 'Not specified',
            role: data.role || 'Student',
            githubUrl: data.github_url || '',
            linkedinUrl: data.linkedin_url || '',
            portfolioUrl: data.portfolio_url || '',
            location: 'Coimbatore, Tamil Nadu', // You might want to add this to your database
            volunteeringHours: data.volunteering_hours || 0,
            projectsCompleted: 8, // This might come from a separate projects table
            emailVerified: data.email_verified || user.email_confirmed_at !== null,
            phoneVerified: data.phone_verified || false,
            adminApproved: data.admin_approved || false,
            badgesEarned: data.badges_earned || 0,
            points: data.points || 0,
            sessionsAttended: data.sessions_attended || 0,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };

          // Create stats from user data
          const stats = [
            {
              label: "Points",
              value: data.points?.toString() || "0",
              icon: TrendingUp,
              color: "text-orange-500",
              bgColor: "bg-orange-50"
            },
            {
              label: "Badges", 
              value: data.badges_earned?.toString() || "0",
              icon: Award,
              color: "text-purple-500",
              bgColor: "bg-purple-50"
            },
            {
              label: "Sessions",
              value: data.sessions_attended?.toString() || "0",
              icon: Calendar,
              color: "text-blue-500", 
              bgColor: "bg-blue-50"
            },
            {
              label: "Rank",
              value: "#--", // You might want to calculate this from a leaderboard query
              icon: Hash,
              color: "text-green-500",
              bgColor: "bg-green-50"
            }
          ];

          // Parse skills if they're stored as JSON string or array
          let skills = [];
          if (data.skills) {
            try {
              if (Array.isArray(data.skills)) {
                skills = data.skills;
              } else if (typeof data.skills === 'string') {
                skills = JSON.parse(data.skills);
              }
            } catch (e) {
              console.error('Error parsing skills:', e);
              skills = typeof data.skills === 'string' ? [data.skills] : [];
            }
          }

          setUserData(transformedUser);
          setUserStats(stats);
          setUserSkills(skills);

          // You can add additional data fetching here if needed
          // await fetchUserActivity(user.id);
          // await fetchUserAchievements(user.id);

        } else {
          setError("User profile not found");
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
        setAuthChecking(false);
      }
    };

    fetchUserData();
  }, []);

  // Optional: Function to fetch user activity from additional tables
  const fetchUserActivity = async (userId) => {
    try {
      // Example query for user activities - adjust based on your schema
      const { data, error } = await supabase
        .from('user_activities') // Assuming you have an activities table
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setUserActivity(data || []);
    } catch (err) {
      console.error('Error fetching user activity:', err);
    }
  };

  // Optional: Function to fetch user achievements
  const fetchUserAchievements = async (userId) => {
    try {
      // Example query for user badges/achievements - adjust based on your schema
      const { data, error } = await supabase
        .from('user_badges') // Assuming you have a badges table
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setUserAchievements({ badges: data || [], certificates: [] });
    } catch (err) {
      console.error('Error fetching user achievements:', err);
    }
  };

  // Mock data for demonstration - you can replace these with actual API calls
  const mockPersonalInfo = userData ? [
    { label: "College", value: userData.college },
    { label: "Role", value: userData.role },
    { label: "Volunteering Hours", value: userData.volunteeringHours?.toString() || "0" },
    { label: "Projects Completed", value: userData.projectsCompleted?.toString() || "0" }
  ] : [];

  const socialLinks = userData ? [
    { 
      label: "GitHub Profile", 
      icon: Github, 
      href: userData.githubUrl || "#",
      available: !!userData.githubUrl 
    },
    { 
      label: "LinkedIn Profile", 
      icon: Linkedin, 
      href: userData.linkedinUrl || "#",
      available: !!userData.linkedinUrl 
    },
    { 
      label: "Portfolio Website", 
      icon: Globe, 
      href: userData.portfolioUrl || "#",
      available: !!userData.portfolioUrl 
    }
  ] : [];

  // Mock activity data - replace with actual data from your activities table
  const mockRecentActivity = [
    { action: "Completed Machine Learning Workshop", time: "2 hours ago", type: "achievement" },
    { action: "Submitted Project: E-commerce Website", time: "1 day ago", type: "project" },
    { action: "Earned JavaScript Certification Badge", time: "3 days ago", type: "badge" },
    { action: "Attended React.js Study Session", time: "1 week ago", type: "session" }
  ];

  // Mock skills data with proficiency levels
  const mockTechnicalSkills = userSkills.length > 0 ? 
    userSkills.slice(0, 5).map((skill, index) => ({
      skill: skill,
      level: 90 - (index * 5), // Mock proficiency levels
      color: ["bg-yellow-500", "bg-blue-500", "bg-green-500", "bg-green-600", "bg-purple-500"][index] || "bg-gray-500"
    })) : 
    [
      { skill: "No skills added", level: 0, color: "bg-gray-300" }
    ];

  const mockSoftSkills = [
    "Leadership", "Communication", "Team Work", "Problem Solving",
    "Critical Thinking", "Time Management", "Adaptability", "Creativity"
  ];

  // Auth checking state
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view this profile.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              {userData.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt={userData.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xl sm:text-2xl lg:text-3xl">
                  {userData.displayName?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {userData.displayName}
                </h1>
                {userData.emailVerified && (
                  <span className="text-green-500 text-sm bg-green-50 px-2 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                {userData.bio}
              </p>
              
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{userData.email}</span>
                </div>
                {userData.phoneNumber && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{userData.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{userData.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {userStats && userStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 border hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-2 sm:p-2.5 rounded-lg ${stat.bgColor}`}>
                      <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-3 sm:px-4 lg:px-6">
          {/* Desktop Tabs */}
          <div className="hidden sm:flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mobile Tabs */}
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white"
            >
              {tabs.map((tab) => (
                <option key={tab} value={tab}>{tab}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {mockPersonalInfo.map((info, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between py-2">
                      <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">{info.label}</span>
                      <span className="text-sm text-gray-900 sm:text-right sm:max-w-xs">{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {socialLinks.map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <IconComponent className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{link.label}</span>
                        </div>
                        {link.available ? (
                          <a 
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">Not set</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border lg:col-span-2">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {mockRecentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        activity.type === 'achievement' ? 'bg-green-500' :
                        activity.type === 'project' ? 'bg-blue-500' :
                        activity.type === 'badge' ? 'bg-purple-500' : 'bg-orange-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technical Skills */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Technical Skills</h3>
              </div>
              <div className="p-4 sm:p-6">
                {userSkills.length > 0 ? (
                  <div className="space-y-4">
                    {mockTechnicalSkills.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{item.skill}</span>
                          <span className="text-sm text-gray-500">{item.level}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                            style={{ width: `${item.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No technical skills added yet</p>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Add Skills
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Soft Skills */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Soft Skills</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-3">
                  {mockSoftSkills.map((skill, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                      <span className="text-sm font-medium text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Achievements' && (
          <div className="space-y-6">
            {/* Badges */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Earned Badges</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    {userStats && userStats[1]?.value !== "0" 
                      ? `You have earned ${userStats[1]?.value} badges!` 
                      : "No badges earned yet"}
                  </p>
                  <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                    {userStats && userStats[1]?.value !== "0" ? "View All Badges" : "Earn Your First Badge"}
                  </button>
                </div>
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="text-center py-8">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No certifications added yet</p>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Add Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Activity' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 sm:p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Activity timeline will be available soon</p>
                <p className="text-sm text-gray-400">Check back later to see your recent activities</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-3 py-2 sm:hidden z-40">
        <div className="flex justify-around">
          {tabs.map((tab, index) => {
            const icons = [TrendingUp, Award, Calendar, Menu];
            const IconComponent = icons[index];
            return (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                  activeTab === tab ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-medium">{tab}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile padding bottom to account for fixed nav */}
      <div className="h-20 sm:hidden"></div>
    </div>
  );
};

export default UserProfile;