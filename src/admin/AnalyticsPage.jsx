import React, { useState, useEffect, Component } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Users,
  School,
  UserCheck,
  BookOpen,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  Calendar,
  Building,
  GraduationCap,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import AdminLayout from '../components/AdminLayout';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-red-700 mb-4">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("30"); // days
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalStudents: 0,
      activeStudents: 0,
      previousTotal: 0,
      previousActive: 0,
    },
    studentGrowth: [],
    collegeDistribution: [],
    skillsPopularity: [],
    yearDistribution: [],
    departmentDistribution: [],
    majorDistribution: [],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const endDate = new Date();
      const timeRangeDays = parseInt(timeRange);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - timeRangeDays);
      const previousStart = new Date(startDate);
      previousStart.setDate(previousStart.getDate() - timeRangeDays);

      // Fetch all users data
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*");

      if (usersError) throw new Error(`Failed to fetch users: ${usersError.message}`);

      // Calculate overview metrics
      const totalStudents = users?.length || 0;
      const previousTotal = users?.filter((user) => new Date(user.created_at) < startDate).length || 0;

      const activeStudents = users?.filter((user) => {
        const lastActivity = new Date(user.updated_at || user.created_at);
        return lastActivity > startDate;
      }).length || 0;

      const previousActive = users?.filter((user) => {
        const lastActivity = new Date(user.updated_at || user.created_at);
        return lastActivity > previousStart && lastActivity <= startDate;
      }).length || 0;

      // Generate student growth data dynamically
      let studentGrowth = [];
      let intervalType = 'month';
      let numIntervals = 6;
      if (timeRangeDays <= 7) {
        intervalType = 'day';
        numIntervals = timeRangeDays;
      } else if (timeRangeDays <= 90) {
        intervalType = 'week';
        numIntervals = Math.floor(timeRangeDays / 7);
      } else {
        intervalType = 'month';
        numIntervals = Math.floor(timeRangeDays / 30);
      }
      numIntervals = Math.max(numIntervals, 1);

      for (let i = numIntervals; i >= 0; i--) {
        let date = new Date(endDate);
        let name;
        if (intervalType === 'day') {
          date.setDate(date.getDate() - i);
          name = date.toLocaleDateString("en-US", { weekday: "short" });
        } else if (intervalType === 'week') {
          date.setDate(date.getDate() - i * 7);
          name = `Wk ${numIntervals - i + 1}`;
        } else {
          date.setMonth(date.getMonth() - i);
          name = date.toLocaleDateString("en-US", { month: "short" });
        }

        const studentsUpToThisMonth = users?.filter((user) => {
          const createdAt = new Date(user.created_at);
          return createdAt <= date;
        }).length || 0;

        const activePeriodStart = new Date(date);
        activePeriodStart.setDate(activePeriodStart.getDate() - 30);

        const activeUpToThisMonth = users?.filter((user) => {
          const createdAt = new Date(user.created_at);
          const lastActivity = new Date(user.updated_at || user.created_at);
          return (
            createdAt <= date &&
            lastActivity > activePeriodStart
          );
        }).length || 0;

        studentGrowth.push({
          period: name,
          students: studentsUpToThisMonth,
          active: activeUpToThisMonth,
        });
      }

      // Calculate college distribution
      const collegeMap = {};
      users?.forEach((user) => {
        const college = user.college || "Not Specified";
        collegeMap[college] = (collegeMap[college] || 0) + 1;
      });

      const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"];
      const collegeDistribution = Object.entries(collegeMap).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }));

      // Calculate year distribution
      const yearMap = {};
      users?.forEach((user) => {
        const year = user.year?.toString() || "Not Specified";
        yearMap[year] = (yearMap[year] || 0) + 1;
      });

      const yearDistribution = Object.entries(yearMap).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }));

      // Calculate department distribution
      const departmentMap = {};
      users?.forEach((user) => {
        const department = user.department || "Not Specified";
        departmentMap[department] = (departmentMap[department] || 0) + 1;
      });

      const departmentDistribution = Object.entries(departmentMap).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }));

      // Calculate major distribution
      const majorMap = {};
      users?.forEach((user) => {
        const major = user.major || "Not Specified";
        majorMap[major] = (majorMap[major] || 0) + 1;
      });

      const majorDistribution = Object.entries(majorMap).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }));

      // Calculate skills popularity
      const skillsMap = {};
      users?.forEach((user) => {
        if (user.skills && Array.isArray(user.skills)) {
          user.skills.forEach((skill) => {
            skillsMap[skill] = (skillsMap[skill] || 0) + 1;
          });
        }
      });

      const skillsPopularity = Object.entries(skillsMap)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count);

      setAnalyticsData({
        overview: {
          totalStudents,
          activeStudents,
          previousTotal,
          previousActive,
        },
        studentGrowth,
        collegeDistribution,
        yearDistribution,
        departmentDistribution,
        majorDistribution,
        skillsPopularity,
      });
    } catch (err) {
      setError(
        err.message || "An error occurred while fetching analytics data."
      );
      console.error("Error fetching analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange: `${timeRange} days`,
      ...analyticsData,
    };

    const jsonData = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calculateGrowthPercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const growth = ((current - previous) / previous) * 100;
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
  };

  const totalStudents = analyticsData.overview.totalStudents;

  const renderDistributionLegend = (data, title) => {
    if (data.length === 0) return null;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
        <ul className="space-y-2 max-h-32 overflow-y-auto">
          {data.map((item) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <li key={item.name} className="flex justify-between items-center text-xs">
                <span className="flex items-center">
                  <span
                    className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  {item.name}
                </span>
                <span className="font-medium">
                  {item.value} ({percentage}%)
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderSkillsLegend = (data, title) => {
    if (data.length === 0) return null;
    const totalMentions = data.reduce((sum, item) => sum + item.count, 0);
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {data.map((item, index) => {
            const percentage = totalMentions > 0 ? ((item.count / totalMentions) * 100).toFixed(1) : 0;
            const color = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"][index % 6];
            return (
              <li key={item.skill} className="flex justify-between items-center text-xs">
                <span className="flex items-center">
                  <span
                    className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  ></span>
                  <span className="truncate flex-1">{item.skill}</span>
                </span>
                <span className="font-medium ml-2">
                  {item.count} ({percentage}%)
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderGrowthSummary = () => {
    const latest = analyticsData.studentGrowth[analyticsData.studentGrowth.length - 1];
    if (!latest) return null;
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Latest Period Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Total Students:</span> <span className="font-medium">{latest.students.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500">Active Students:</span> <span className="font-medium">{latest.active.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  const overviewCards = [
    {
      title: "Total Students",
      value: analyticsData.overview.totalStudents.toLocaleString(),
      icon: <Users className="w-6 h-6 text-blue-500" />,
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      change: calculateGrowthPercentage(
        analyticsData.overview.totalStudents,
        analyticsData.overview.previousTotal
      ),
      changeType: "positive",
    },
    {
      title: "Active Students",
      value: analyticsData.overview.activeStudents.toLocaleString(),
      icon: <UserCheck className="w-6 h-6 text-green-500" />,
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
      change: calculateGrowthPercentage(
        analyticsData.overview.activeStudents,
        analyticsData.overview.previousActive
      ),
      changeType: analyticsData.overview.activeStudents >= analyticsData.overview.previousActive ? "positive" : "negative",
    },
  ];

  return (
    <ErrorBoundary>
      <AdminLayout>
        <div className="min-h-screen bg-gray-50">
          {loading && !refreshing ? (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading analytics...</p>
              </div>
            </div>
          ) : (
            <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      Analytics Dashboard
                    </h1>
                    <p className="text-gray-600">
                      Insights and metrics for your student community
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 mt-4 sm:mt-0 flex-wrap">
                    <div className="relative">
                      <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        aria-label="Select time range"
                      >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                      </select>
                    </div>
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Refresh analytics data"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={exportReport}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      aria-label="Export analytics report"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <p className="text-red-700">Error: {error}</p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    aria-label="Retry loading analytics data"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                {overviewCards.map((card, index) => (
                  <div
                    key={index}
                    className={`${card.bgColor} rounded-xl p-4 sm:p-6 border border-gray-200 transition-shadow hover:shadow-md`}
                    role="region"
                    aria-label={`${card.title} overview`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`${card.iconBg} p-3 rounded-lg`}>{card.icon}</div>
                      {card.change && (
                        <div
                          className={`text-sm font-medium ${card.changeType === "positive" ? "text-green-600" : "text-red-600"
                            }`}
                        >
                          {card.change}
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                    <p className="text-gray-600 text-sm">{card.title}</p>
                  </div>
                ))}
              </div>

              {/* Top Stats & Data Source Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                  <h3 className="font-semibold text-teal-900 mb-2">Top Department</h3>
                  <p className="text-teal-700 text-sm">
                    {analyticsData.departmentDistribution.length > 0
                      ? `${analyticsData.departmentDistribution[0]?.name || "Not Specified"} is the most common department`
                      : "No department data available yet"}
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h3 className="font-semibold text-indigo-900 mb-2">Top Major</h3>
                  <p className="text-indigo-700 text-sm">
                    {analyticsData.majorDistribution.length > 0
                      ? `${analyticsData.majorDistribution[0]?.name || "Not Specified"} is the most popular major`
                      : "No major data available yet"}
                  </p>
                </div>
                {/* Data Source Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <BookOpen className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800 mb-1">Data Integration Notes</h3>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• User data is fetched from Supabase users table</li>
                        <li>• Growth calculations are based on available data</li>
                        <li>• Year, department, and major distributions included</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Growth Trend</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.studentGrowth}>
                        <defs>
                          <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Area type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorStudents)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  {renderGrowthSummary()}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.departmentDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {analyticsData.departmentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {renderDistributionLegend(analyticsData.departmentDistribution, "Departments")}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Year Distribution</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.yearDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                        <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Major Distribution</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.majorDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {analyticsData.majorDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {renderDistributionLegend(analyticsData.majorDistribution, "Majors")}
                </div>
              </div>

            </main>
          )}
        </div>
      </AdminLayout>
    </ErrorBoundary>
  );
};