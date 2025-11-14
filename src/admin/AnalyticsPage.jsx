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
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

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
                        className={`text-sm font-medium ${
                          card.changeType === "positive" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {card.change}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {/* Student Growth Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2 xl:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Student Growth</h2>
                  <UserCheck className="w-5 h-5 text-green-500" />
                </div>
                {analyticsData.studentGrowth.length > 0 ? (
                  <>
                    <div className="h-64 md:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData.studentGrowth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="students"
                            stroke="#3B82F6"
                            fill="#93C5FD"
                            fillOpacity={0.3}
                            name="Total Students"
                          />
                          <Area
                            type="monotone"
                            dataKey="active"
                            stroke="#10B981"
                            fill="#6EE7B7"
                            fillOpacity={0.3}
                            name="Active Students"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    {renderGrowthSummary()}
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No growth data available
                  </div>
                )}
              </div>

              {/* College Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">College Distribution</h2>
                  <School className="w-5 h-5 text-blue-500" />
                </div>
                {analyticsData.collegeDistribution.length > 0 ? (
                  <>
                    <div className="h-48 md:h-56 flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.collegeDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="value"
                          >
                            {analyticsData.collegeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {renderDistributionLegend(analyticsData.collegeDistribution, "Colleges (Total: " + totalStudents.toLocaleString() + ")")}
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No college data available
                  </div>
                )}
              </div>

              {/* Year Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Year Distribution</h2>
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                {analyticsData.yearDistribution.length > 0 ? (
                  <>
                    <div className="h-48 md:h-56 flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.yearDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="value"
                          >
                            {analyticsData.yearDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {renderDistributionLegend(analyticsData.yearDistribution, "Graudating year (Total: " + totalStudents.toLocaleString() + ")")}
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No year data available
                  </div>
                )}
              </div>

              {/* Department Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Department Distribution</h2>
                  <Building className="w-5 h-5 text-teal-500" />
                </div>
                {analyticsData.departmentDistribution.length > 0 ? (
                  <>
                    <div className="h-48 md:h-56 flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.departmentDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="value"
                          >
                            {analyticsData.departmentDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {renderDistributionLegend(analyticsData.departmentDistribution, "Departments (Total: " + totalStudents.toLocaleString() + ")")}
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No department data available
                  </div>
                )}
              </div>

              {/* Major Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Major Distribution</h2>
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                </div>
                {analyticsData.majorDistribution.length > 0 ? (
                  <>
                    <div className="h-48 md:h-56 flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.majorDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="value"
                          >
                            {analyticsData.majorDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {renderDistributionLegend(analyticsData.majorDistribution, "Majors (Total: " + totalStudents.toLocaleString() + ")")}
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No major data available
                  </div>
                )}
              </div>

              {/* Skills Popularity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2 xl:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Popular Skills</h2>
                  <BookOpen className="w-5 h-5 text-purple-500" />
                </div>
                {analyticsData.skillsPopularity.length > 0 ? (
                  <>
                    <div className="h-64 md:h-72 lg:h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analyticsData.skillsPopularity}
                          margin={{ top: 5, right: 20, left: 10, bottom: 80 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="skill"
                            angle={-45}
                            textAnchor="end"
                            height={90}
                            interval={0}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="count" fill="#8B5CF6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {renderSkillsLegend(analyticsData.skillsPopularity, "All Skills Mentions (Total: " + analyticsData.skillsPopularity.reduce((sum, item) => sum + item.count, 0) + ")")}
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No skills data available
                  </div>
                )}
              </div>
            </div>

            {/* Summary Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-5 h-5 text-yellow-500 mr-2" />
                Key Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Engagement Rate</h3>
                  <p className="text-blue-700 text-sm">
                    {analyticsData.overview.totalStudents > 0
                      ? `${Math.round(
                          (analyticsData.overview.activeStudents /
                            analyticsData.overview.totalStudents) *
                            100
                        )}%`
                      : "0%"}{" "}
                    of students are actively participating in community activities
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Community Size</h3>
                  <p className="text-green-700 text-sm">
                    {analyticsData.overview.totalStudents} total students
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Top Skills</h3>
                  <p className="text-purple-700 text-sm">
                    {analyticsData.skillsPopularity.length > 0
                      ? `${analyticsData.skillsPopularity[0]?.skill || "Various skills"} is most popular among students`
                      : "No skills data available yet"}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">Top Year</h3>
                  <p className="text-orange-700 text-sm">
                    {analyticsData.yearDistribution.length > 0
                      ? `Year ${analyticsData.yearDistribution[0]?.name || "Not Specified"} has the most students`
                      : "No year data available yet"}
                  </p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-teal-900 mb-2">Top Department</h3>
                  <p className="text-teal-700 text-sm">
                    {analyticsData.departmentDistribution.length > 0
                      ? `${analyticsData.departmentDistribution[0]?.name || "Not Specified"} is the most common department`
                      : "No department data available yet"}
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-900 mb-2">Top Major</h3>
                  <p className="text-indigo-700 text-sm">
                    {analyticsData.majorDistribution.length > 0
                      ? `${analyticsData.majorDistribution[0]?.name || "Not Specified"} is the most popular major`
                      : "No major data available yet"}
                  </p>
                </div>
              </div>
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
          </main>
        )}
      </div>
    </ErrorBoundary>
  );
}