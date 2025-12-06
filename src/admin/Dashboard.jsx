import React, { useState, useEffect } from 'react';
import { Users, Search, BarChart3, Loader2, X, FileText } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
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

        // Fetch admin profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('uid', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to fetch admin profile');
          return;
        }

        // Check if user is admin
        if (profileData?.role !== 'admin') {
          // Redirect non-admin users to student dashboard
          navigate('/');
          return;
        }

        setProfile(profileData);
        setIsAuthenticated(true);

        // Fetch all students data
        const { data: studentsData, error: studentsError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'student')
          .order('created_at', { ascending: false });

        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          setError('Failed to fetch students data');
          return;
        }

        // Skip events fetching for now since table doesn't exist
        setEvents([]); // Set empty array for now

        // Transform students data
        const transformedStudents = studentsData?.map((student, index) => ({
          id: student.uid,
          name: student.display_name || student.email?.split('@')[0] || `Student ${index + 1}`,
          email: student.email,
          avatar: student.display_name?.charAt(0).toUpperCase() || student.email?.charAt(0).toUpperCase() || 'S',
          status: student.admin_approved ? 'active' : 'inactive',
          lastSeen: getRelativeTime(student.updated_at || student.created_at),
          points: student.points || 0,
          sessions: student.sessions_attended || 0,
          badges: student.badges_earned || 0,
          college: student.college,
          adminApproved: student.admin_approved || false,
          emailVerified: student.email_verified || false,
          phoneVerified: student.phone_verified || false,
          skills: student.skills || [],
          bio: student.bio || '',
          volunteeringHours: student.volunteering_hours || 0
        })) || [];

        setStudents(transformedStudents);

        // Calculate stats from actual data
        const totalStudents = transformedStudents.length;

        setStats({
          totalStudents
        });

      } catch (err) {
        setError(err.message);
        console.error('Error in fetchAdminData:', err);
      } finally {
        setLoading(false);
        setAuthChecking(false);
      }
    };

    fetchAdminData();
  }, []);

  // Helper function to get relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Never';

    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  // Handle add student
  const handleAddStudent = () => {
    alert('Add Student functionality would be implemented here');
  };

  // Handle send notice
  const handleSendNotice = () => {
    alert('Send Notice functionality would be implemented here');
  };

  // Filter students based on search and filter
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.college && student.college.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === '' || student.status === filter;
    return matchesSearch && matchesFilter;
  });

  const quickActions = [
    {
      icon: BarChart3,
      label: "View Analytics",
      shortLabel: "Analytics",
      color: "bg-purple-600 hover:bg-purple-700",
      onClick: () => navigate('/analytics')
    },
    {
      icon: FileText,
      label: "Manage Blogs",
      shortLabel: "Blogs",
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => navigate('/admin/blogs')
    }
  ];

  const statsCards = [
    {
      title: "Total Students",
      value: stats.totalStudents.toString(),
      change: "+12%",
      icon: Users,
      color: "bg-blue-100",
      iconColor: "text-blue-600"
    }
  ];

  // Auth checking state
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
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
          <p className="text-gray-600 mb-4">Please log in to access the admin dashboard.</p>
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
            <p className="text-gray-600">Loading admin dashboard...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="p-3 sm:p-4 lg:p-6">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 flex flex-col sm:flex-row sm:items-center">
            <span>Welcome, {profile?.display_name || 'Administrator'}!</span>
            <span className="text-2xl sm:ml-2">👋</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage your student community, events, and track engagement metrics.</p>
          {profile && (
            <div className="mt-2 text-sm text-gray-500">
              {profile.college} • {profile.email}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 leading-tight">{stat.title}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                      <span className="text-xs text-green-600 font-medium hidden sm:inline">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`p-2 lg:p-3 rounded-lg ${stat.color} self-end lg:self-auto`}>
                    <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Student Management */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Student Management</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {filteredStudents.length}
                    </span>
                  </div>
                  <button className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto" onClick={() => navigate('/user-list')}>
                    + View All Students
                  </button>
                </div>

                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students by name, email, or college..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {students.length === 0 ? 'No students registered yet' : 'No students found matching your search'}
                    </p>
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <div key={student.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-medium text-sm">{student.avatar}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{student.name}</h4>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">{student.email}</p>
                                <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                                  <span>{student.points} points</span>
                                  <span>•</span>
                                  <span>{student.sessions} sessions</span>
                                  <span>•</span>
                                  <span>{student.badges} badges</span>
                                  {student.college && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-24">{student.college}</span>
                                    </>
                                  )}
                                </div>
                                {student.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {student.skills.slice(0, 2).map((skill, idx) => (
                                      <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                        {skill}
                                      </span>
                                    ))}
                                    {student.skills.length > 2 && (
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                        +{student.skills.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-4 sm:space-y-6 order-1 xl:order-2">
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-1 gap-2 sm:gap-3">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={`flex flex-col sm:flex-row xl:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 xl:space-x-2 ${action.color} text-white py-3 sm:py-2 xl:py-3 px-2 sm:px-3 xl:px-4 rounded-lg transition-colors text-xs sm:text-sm font-medium`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="sm:hidden xl:inline">{action.label}</span>
                      <span className="hidden sm:inline xl:hidden">{action.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity - Hidden on mobile */}
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hidden sm:block">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {students.slice(0, 3).map((student, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{student.name} joined the community</p>
                      <p className="text-xs text-gray-500">{student.lastSeen}</p>
                    </div>
                  </div>
                ))}
                {students.length === 0 && (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-3 py-2 sm:hidden">
          <div className="flex justify-around">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="flex flex-col items-center space-y-1 py-2 px-3"
                >
                  <IconComponent className="w-5 h-5 text-gray-600" />
                  <span className="text-xs text-gray-600">{action.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile padding bottom to account for fixed nav */}
        <div className="h-16 sm:hidden"></div>
      </main>
    </div>
  );
};

export default Dashboard;