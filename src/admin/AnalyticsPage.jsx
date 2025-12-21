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
  Loader2
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

  // Enterprise Color Palette
  const THEME = {
    primary: "#4F46E5", // Indigo 600
    secondary: "#64748B", // Slate 500
    success: "#10B981", // Emerald 500
    warning: "#F59E0B", // Amber 500
    danger: "#EF4444", // Red 500
    background: "#F8FAFC", // Slate 50
    cardBg: "#FFFFFF",
    border: "#E2E8F0", // Slate 200
    textMain: "#0F172A", // Slate 900
    textMuted: "#64748B", // Slate 500
  };

  const COLORS = [THEME.primary, THEME.success, THEME.warning, THEME.danger, '#8B5CF6', '#EC4899'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-slate-200 text-xs text-slate-700">
          <p className="font-semibold mb-1 border-b border-slate-100 pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="font-medium">{entry.name}:</span>
              <span className="font-bold text-slate-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const KPICard = ({ title, value, change, changeType, icon: Icon, trend }) => (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-md ${changeType === 'positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-center mt-2">
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${changeType === 'positive' ? 'text-emerald-700 bg-emerald-50' :
          changeType === 'negative' ? 'text-red-700 bg-red-50' : 'text-slate-600 bg-slate-100'
          }`}>
          {change}
        </span>
        <span className="text-xs text-slate-400 ml-2">vs last period</span>
      </div>
    </div>
  );

  const overviewCards = [
    {
      title: "Total Students",
      value: analyticsData.overview.totalStudents.toLocaleString(),
      icon: Users,
      change: calculateGrowthPercentage(
        analyticsData.overview.totalStudents,
        analyticsData.overview.previousTotal
      ),
      changeType: "positive",
    },
    {
      title: "Active Users",
      value: analyticsData.overview.activeStudents.toLocaleString(),
      icon: UserCheck,
      change: calculateGrowthPercentage(
        analyticsData.overview.activeStudents,
        analyticsData.overview.previousActive
      ),
      changeType: analyticsData.overview.activeStudents >= analyticsData.overview.previousActive ? "positive" : "negative",
    },
    {
      title: "Growth Rate",
      value: calculateGrowthPercentage(
        analyticsData.overview.totalStudents,
        analyticsData.overview.previousTotal
      ),
      icon: TrendingUp,
      change: "Stable",
      changeType: "neutral",
    },
    {
      title: "Departments",
      value: analyticsData.departmentDistribution.length.toString(),
      icon: Building,
      change: "+2 new", // Static for demo, dynamic in real app
      changeType: "positive",
    },
  ];

  return (
    <ErrorBoundary>
      <AdminLayout>
        <div className="min-h-screen bg-slate-50 font-sans">
          {loading && !refreshing ? (
            <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
              {/* Header Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Analytics Overview
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    System performance and user engagement metrics
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="7">Last 7 Days</option>
                      <option value="30">Last 30 Days</option>
                      <option value="90">This Quarter</option>
                      <option value="365">This Year</option>
                    </select>
                  </div>

                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
                  </button>

                  <button
                    onClick={exportReport}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {overviewCards.map((card, index) => (
                  <KPICard key={index} {...card} />
                ))}
              </div>

              {/* Main Widgets Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Growth Chart - 2 Cols */}
                <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Registration Trend</h3>
                      <p className="text-xs text-slate-500">Student acquisition over the selected period</p>
                    </div>
                    {/* Tiny Legend */}
                    <div className="flex gap-4 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Total
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Active
                      </div>
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.studentGrowth} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.1} />
                            <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.border} />
                        <XAxis
                          dataKey="period"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: THEME.textMuted, fontSize: 11 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: THEME.textMuted, fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="students"
                          stroke={THEME.primary}
                          strokeWidth={2}
                          fill="url(#colorTotal)"
                          name="Total Students"
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="active"
                          stroke={THEME.success}
                          strokeWidth={2}
                          fill="none"
                          name="Active Students"
                          strokeDasharray="4 4"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Hybrid Widget: Department Distribution */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Department Distribution</h3>
                  <div className="flex-1 relative min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.departmentDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {analyticsData.departmentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={1} stroke="#fff" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{analyticsData.departmentDistribution.length}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Depts</p>
                      </div>
                    </div>
                  </div>
                  {/* Mini Data Table */}
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr>
                          <th className="pb-2 text-xs font-semibold text-slate-500">Dept</th>
                          <th className="pb-2 text-xs font-semibold text-slate-500 text-right">Students</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.departmentDistribution.slice(0, 4).map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="py-2 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                              <span className="text-slate-700 truncate max-w-[120px]" title={item.name}>{item.name}</span>
                            </td>
                            <td className="py-2 text-right font-medium text-slate-900">{item.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Hybrid Widget: Top Majors (Bar Chart + List) */}
                <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-slate-900">Popular Majors</h3>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800">View All</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.majorDistribution.slice(0, 5)} layout="vertical" margin={{ left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={THEME.border} />
                          <XAxis type="number" hide />
                          <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            width={120}
                            tick={{ fill: THEME.textMuted, fontSize: 11 }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" fill={THEME.primary} radius={[0, 4, 4, 0]} barSize={24} name="Students">
                            {analyticsData.majorDistribution.slice(0, 5).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Detailed List */}
                    <div className="border rounded-md border-slate-100 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2 text-xs font-semibold text-slate-500 text-left">Rank</th>
                            <th className="px-4 py-2 text-xs font-semibold text-slate-500 text-left">Major</th>
                            <th className="px-4 py-2 text-xs font-semibold text-slate-500 text-right">Count</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {analyticsData.majorDistribution.slice(0, 6).map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-4 py-2 text-slate-400 font-mono text-xs">#{idx + 1}</td>
                              <td className="px-4 py-2 text-slate-700 font-medium truncate max-w-[150px]">{item.name}</td>
                              <td className="px-4 py-2 text-slate-900 font-bold text-right">{item.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Academic Year Stats */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Academic Years</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.yearDistribution} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.border} />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: THEME.textMuted, fontSize: 11 }}
                          dy={5}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: THEME.textMuted, fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill={THEME.success} radius={[4, 4, 0, 0]} name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </main>
          )}
        </div>
      </AdminLayout>
    </ErrorBoundary>
  );
};