import React, { useState, useEffect } from 'react';
import {
  Users,
  BarChart3,
  Loader2,
  Award,
  Image,
  MessageSquare,
  Zap,
  Clock,
  ArrowRight,
  Activity,
  Smile
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { motion } from 'framer-motion';

// --- CUSTOM HAND-DRAWN DOODLES (ANIMATED) ---
const DrawVariant = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.5, ease: "easeInOut" }
  }
};

const HandDrawnCrown = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#C2E812" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform -rotate-12">
    <motion.path
      d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"
      variants={DrawVariant} initial="hidden" animate="visible"
    />
  </svg>
);

const LightningBolt = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#FF5018" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-12">
    <motion.path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      animate={{ scale: [1, 1.1, 1], rotate: [12, 15, 12] }}
      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
    />
  </svg>
);

const MessyOval = ({ width = 140, height = 65, color = "#0061FE" }) => (
  <svg width={width} height={height} viewBox="0 0 140 65" className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] pointer-events-none">
    <motion.path
      d="M5,32.5 C5,10 35,5 70,5 C105,5 135,10 135,32.5 C135,55 105,60 70,60 C35,60 5,55 5,32.5 Z"
      fill="none" stroke={color} strokeWidth="4"
      variants={DrawVariant} initial="hidden" animate="visible"
    />
  </svg>
);

const SquiggleArrow = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="#C2E812" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <motion.path
      d="M10,50 Q30,10 50,30 T55,10"
      variants={DrawVariant} initial="hidden" animate="visible"
    />
    <motion.path d="M45,5 L55,10 L50,20" variants={DrawVariant} initial="hidden" animate="visible" />
  </svg>
);

const HandDrawnHeart = () => (
  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#D83B01" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform -rotate-6">
    <motion.path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
    />
  </svg>
);

const FrameworkGrid = () => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden h-full mix-blend-overlay opacity-20">
    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
  </div>
);

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const { data: profileRows, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('uid', user.id);

        const profileData = profileRows?.[0];

        if (profileError || profileData?.role !== 'admin') {
          navigate('/');
          return;
        }

        setProfile(profileData);
        setIsAuthenticated(true);

        const { data: studentsData, error: studentsError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'student')
          .order('created_at', { ascending: false });

        if (studentsError) throw studentsError;

        const transformedStudents = studentsData?.map((student, index) => ({
          id: student.uid,
          name: student.display_name || student.email?.split('@')[0] || `Student ${index + 1}`,
          email: student.email,
          avatar: student.display_name?.charAt(0).toUpperCase() || student.email?.charAt(0).toUpperCase() || 'S',
          status: student.admin_approved ? 'active' : 'inactive',
          lastSeen: getRelativeTime(student.updated_at || student.created_at),
          role: student.role,
          college: student.college
        })) || [];

        setStudents(transformedStudents);
        setStats({ totalStudents: transformedStudents.length });

      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const quickActions = [
    {
      icon: Users,
      label: "MANAGE USERS",
      desc: "Control the fleet",
      color: "#0061FE",
      onClick: () => navigate('/user-list')
    },
    {
      icon: BarChart3,
      label: "DATA & INSIGHTS",
      desc: "Growth metrics",
      color: "#C2E812",
      onClick: () => navigate('/analytics')
    },
    {
      icon: Award,
      label: "HALL OF FAME",
      desc: "Top performers",
      color: "#FF5018",
      onClick: () => navigate('/admin/hall-of-fame')
    },
    {
      icon: Image,
      label: "GALLERY",
      desc: "Community shots",
      color: "#F7F5F2",
      textColor: "text-[#1E1E1E]",
      onClick: () => navigate('/admin/community-photos')
    },
    {
      icon: MessageSquare,
      label: "FEEDBACK",
      desc: "User voices",
      color: "#1E1E1E",
      textColor: "text-white",
      onClick: () => navigate('/admin/feedback')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E]">
        <Loader2 className="w-16 h-16 animate-spin text-[#C2E812]" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F7F5F2] font-sans text-[#1E1E1E] selection:bg-[#C2E812] selection:text-black overflow-x-hidden relative p-4 md:p-8">
        <FrameworkGrid />

        {/* --- HEADER SECTION --- */}
        <div className="relative mb-20 mt-12">
          {/* Floating Doodles */}
          <motion.div className="absolute -top-12 left-0 z-20" animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <HandDrawnCrown />
          </motion.div>
          <motion.div className="absolute top-10 right-10 md:right-32 z-20" animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <LightningBolt />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-[#1E1E1E] text-[#C2E812] px-4 py-1.5 font-black uppercase tracking-widest text-sm transform -rotate-2">
                Admin Panel
              </div>
              <div className="font-bold text-[#1E1E1E] flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 relative z-10 text-left text-[#1E1E1E]">
              WE <span className="relative inline-block text-[#0061FE] z-10">
                MANAGE
                <MessyOval width={240} height={110} color="#C2E812" />
              </span>.<br />
              WE BUILD.
            </h1>
            <p className="text-xl md:text-2xl font-bold max-w-2xl leading-tight">
              Welcome back, <span className="px-2 bg-[#C2E812] text-black transform -skew-x-12 inline-block">{profile?.display_name?.split(' ')[0] || 'Admin'}</span>.
              You have <span className="underline decoration-4 decoration-[#FF5018] underline-offset-4">{stats.totalStudents} chaos pilots</span> (students) onboard today.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">

          {/* LEFT COL: ACTIONS & FEED */}
          <div className="lg:col-span-8 space-y-16">

            {/* QUICK ACTIONS */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <SquiggleArrow />
                <h3 className="text-4xl font-black tracking-tighter text-[#1E1E1E]">QUICK COMMANDS</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={index}
                      onClick={action.onClick}
                      whileHover={{ y: -5, x: -5, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
                      className={`relative group bg-white border-[3px] border-[#1E1E1E] p-6 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 border-[2px] border-[#1E1E1E] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`} style={{ backgroundColor: action.color }}>
                          <Icon className={`w-6 h-6 ${action.textColor === 'text-white' ? 'text-white' : 'text-[#1E1E1E]'}`} />
                        </div>
                        <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity -rotate-45 group-hover:rotate-0" />
                      </div>
                      <h4 className="text-xl font-black leading-none mb-1">{action.label}</h4>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{action.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            {/* RECENT REGISTRATIONS (Brutalist List) */}
            <section>
              <div className="flex justify-between items-end mb-6 border-b-[3px] border-[#1E1E1E] pb-2">
                <h3 className="text-4xl font-black tracking-tighter text-[#1E1E1E]">FRESH BLOOD</h3>
                <button onClick={() => navigate('/user-list')} className="text-lg font-bold hover:bg-[#C2E812] px-2 transition-colors">VIEW ALL &rarr;</button>
              </div>

              <div className="space-y-4">
                {students.slice(0, 5).map((student, idx) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-4 bg-white p-4 border-[3px] border-[#1E1E1E] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <div className="w-12 h-12 bg-[#F7F5F2] border-[2px] border-[#1E1E1E] flex items-center justify-center font-black text-xl">
                      {student.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-black leading-none">{student.name}</h4>
                      <p className="text-xs font-bold text-gray-500 uppercase">{student.email}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="bg-[#0061FE] text-white text-xs font-bold px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_black] mb-1">
                        {student.college || 'NO COLLEGE'}
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-400">{student.lastSeen}</span>
                    </div>
                  </motion.div>
                ))}
                {students.length === 0 && (
                  <div className="p-8 border-[3px] border-dashed border-[#1E1E1E] text-center bg-white">
                    <Smile className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="font-bold text-gray-500">No new recruits yet.</p>
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* RIGHT COL: FEED & WIDGETS */}
          <div className="lg:col-span-4 space-y-12">

            {/* ACTIVITY LOG */}
            <section className="bg-[#1E1E1E] text-white p-6 border-[3px] border-[#1E1E1E] shadow-[8px_8px_0px_0px_#C2E812] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Activity className="w-24 h-24" />
              </div>
              <h3 className="text-2xl font-black mb-6 tracking-tighter text-[#C2E812]">LIVE ENTROPY</h3>

              <div className="space-y-8 relative pl-4 border-l-[3px] border-white/20">
                {/* Fake System Event */}
                <div className="relative">
                  <div className="absolute -left-[23px] top-1 w-4 h-4 bg-[#0061FE] border-2 border-white rounded-full"></div>
                  <p className="font-bold leading-tight">System backup completed.</p>
                  <span className="text-xs font-mono text-gray-400">12:00 AM</span>
                </div>

                {students.slice(0, 4).map((student, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-1 w-4 h-4 bg-[#FF5018] border-2 border-white rounded-full"></div>
                    <p className="leading-tight text-sm">
                      <span className="font-black text-[#C2E812]">{student.name}</span> <span className="font-medium text-gray-300">spawned in the world.</span>
                    </p>
                    <span className="text-xs font-mono text-gray-500">{student.lastSeen}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* PRO TIP WIDGET */}
            <section className="bg-[#C2E812] p-6 border-[3px] border-[#1E1E1E] shadow-[8px_8px_0px_0px_#1E1E1E] relative">
              <div className="absolute -top-6 -right-6 transform rotate-12">
                <HandDrawnHeart />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#1E1E1E] p-2 text-white">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-[#1E1E1E]">PRO TIP</h3>
              </div>
              <p className="font-bold text-lg leading-tight mb-6">
                Engagement drops when you're boring. Reply to <span className="bg-white px-1">Community Photos</span> to keep the chaos alive.
              </p>
              <button
                onClick={() => navigate('/analytics')}
                className="w-full bg-[#1E1E1E] text-white font-black py-3 hover:bg-[#0061FE] transition-colors border-2 border-transparent hover:border-black"
              >
                CHECK STATS
              </button>
            </section>

          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;