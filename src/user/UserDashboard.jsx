import React, { useState, useEffect } from "react";
import {
  ArrowUpRight, Settings, Users, Star,
  Zap, LogOut, ChevronRight, PenTool, Calendar,
  FileText, Handshake, MapPin, X, BookOpen
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from '@supabase/auth-helpers-react';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- CUSTOM ANIMATED VISUALS ---

// 2. The "Framework" Dots Animation (Profile Background)
const FrameworkNodes = () => (
  <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
    <motion.div
      className="absolute top-1/4 left-10 w-4 h-4 bg-white rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.div
      className="absolute bottom-1/4 right-10 w-4 h-4 bg-white rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, delay: 1, repeat: Infinity }}
    />
    <svg className="absolute inset-0 w-full h-full">
      <line x1="40" y1="25%" x2="calc(100% - 40px)" y2="75%" stroke="white" strokeWidth="2" />
    </svg>
  </div>
);

// 3. The "Typography" Big Aa Style
const TypographyVisual = ({ isHovered }) => (
  <div className="absolute bottom-[-20px] right-[-20px] font-sans font-bold leading-none select-none pointer-events-none opacity-90 transition-transform duration-500 transform"
    style={{ transform: isHovered ? 'scale(1.1) translate(-10px, -10px)' : 'scale(1)' }}>
    <span className="text-[140px] tracking-tighter text-[#2B2929]">Aa</span>
  </div>
);

// --- MAIN COMPONENTS ---

const BentoCard = ({ children, className, onClick, delay = 0, hoverColor }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer flex flex-col justify-between p-6 sm:p-8 transition-shadow hover:shadow-2xl ${className}`}
    >
      {/* Dynamic Hover Overlay */}
      {hoverColor && (
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.1 : 0 }}
          style={{ backgroundColor: hoverColor }}
        />
      )}

      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {typeof children === 'function' ? children(isHovered) : children}
      </div>
    </motion.div>
  );
};

const BlogPopup = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 50, scale: 0.9 }}
    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 md:w-full md:max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
  >
    <div className="bg-[#FF5018] p-4 flex justify-between items-center text-white">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        <span className="font-bold">New Insights!</span>
      </div>
      <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
        <X className="w-5 h-5" />
      </button>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Explore Our Latest Blogs</h3>
      <p className="text-gray-600 mb-4 text-sm">Discover stories, tutorials, and updates from the community.</p>
      <a
        href="/blogs"
        className="block w-full text-center bg-[#2B2929] text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
      >
        Read Now
      </a>
    </div>
  </motion.div>
);

const TransitionOverlay = ({ data, onComplete }) => {
  if (!data.isActive) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      initial={{
        clipPath: `circle(0px at ${data.x}px ${data.y}px)`,
        backgroundColor: data.color
      }}
      animate={{
        clipPath: `circle(150vmax at ${data.x}px ${data.y}px)`,
        backgroundColor: "#ffffff"
      }}
      transition={{
        clipPath: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }, // Smooth expansion
        backgroundColor: { delay: 0.5, duration: 0.4, ease: "easeOut" } // Fade to white near end
      }}
      onAnimationComplete={onComplete}
    />
  );
};

export default function UserDashboard() {
  const user = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meetups, setMeetups] = useState([]);
  const [showBlogPopup, setShowBlogPopup] = useState(false);
  const navigate = useNavigate();

  // Transition State
  const [transitionData, setTransitionData] = useState({
    isActive: false,
    color: "",
    x: 0,
    y: 0,
    path: ""
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (!user) return;

        // 1. Fetch User Profile
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("uid", user.id)
          .single();

        if (profile) {
          setUserData({
            displayName: profile.display_name || "Creator",
            email: profile.email,
            avatar: profile.avatar,
            points: profile.points || 1250,
            college: profile.college || "Codesapiens Univ"
          });
        }

        // 2. Fetch Registered Meetups
        const { data: registrations, error: regError } = await supabase
          .from("registrations")
          .select("meetup_id")
          .eq("user_id", user.id);

        if (registrations && registrations.length > 0) {
          const meetupIds = registrations.map(r => r.meetup_id);
          const { data: meetupsData, error: meetupsError } = await supabase
            .from("meetup")
            .select("*")
            .in("id", meetupIds)
            .order("start_date_time", { ascending: true });

          if (meetupsData) {
            setMeetups(meetupsData);
          }
        } else {
          setMeetups([]);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  // Blog Popup Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBlogPopup(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handle Card Click for Transition
  const handleCardClick = (e, path, color) => {
    if (!path) return;

    // If external link, open directly
    if (path.startsWith('http')) {
      window.open(path, '_blank');
      return;
    }

    // Get click coordinates
    const x = e.clientX;
    const y = e.clientY;

    setTransitionData({
      isActive: true,
      color,
      x,
      y,
      path
    });
  };

  const handleTransitionComplete = () => {
    navigate(transitionData.path);
    // Reset state after navigation (optional, but good for cleanup if component stays mounted)
    setTimeout(() => {
      setTransitionData({ isActive: false, color: "", x: 0, y: 0, path: "" });
    }, 500);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-[#00C6F7] border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#2B2929] font-sans p-4 sm:p-8 lg:p-12 selection:bg-[#FFC845]">

      <TransitionOverlay data={transitionData} onComplete={handleTransitionComplete} />


      <div className="max-w-[1400px] mx-auto">

        {/* Navbar / Header area */}
        <div className="flex justify-between items-end mb-10 border-b-2 border-[#2B2929] pb-6">
          <div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-2 text-[#2B2929]">
              DASHBOARD
            </h1>
            <p className="text-xl md:text-2xl font-medium text-[#2B2929]/70">
              Welcome back, {userData?.displayName?.split(' ')[0]}
            </p>
          </div>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(280px,auto)]">

          {/* 1. PROFILE (The "Framework" Card) - Navy Blue */}
          <BentoCard
            className="col-span-1 md:col-span-2 row-span-2 bg-[#1E293B] text-white relative group border-none"
            onClick={(e) => handleCardClick(e, '/profile', '#1E293B')}
          >
            {(isHovered) => (
              <>
                <FrameworkNodes />

                {/* Profile Label */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-black text-white/5 pointer-events-none select-none tracking-widest">
                  PROFILE
                </div>

                <div className="flex justify-between items-start z-10">
                  <div className="w-24 h-24 border-4 border-white overflow-hidden bg-white/10">
                    {userData?.avatar ? (
                      <img src={userData.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                        {userData?.displayName?.[0]}
                      </div>
                    )}
                  </div>
                  <ArrowUpRight className={`w-12 h-12 transition-transform duration-300 ${isHovered ? 'translate-x-2 -translate-y-2 text-[#00C6F7]' : 'text-white/50'}`} />
                </div>

                <div className="mt-auto z-10">
                  <h2 className="text-4xl font-bold mb-1 tracking-tight">{userData?.displayName}</h2>
                  <p className="text-white/60 text-lg mb-8 font-mono">{userData?.college}</p>


                </div>
              </>
            )}
          </BentoCard>

          {/* 2. BLOGS - Red/Orange */}
          <BentoCard
            className="bg-[#FF5018] text-[#2B2929] relative overflow-hidden"
            onClick={(e) => handleCardClick(e, '/blogs', '#FF5018')}
            delay={0.1}
          >
            {(isHovered) => (
              <>
                <div className="z-10">
                  <h3 className="text-3xl font-bold mb-2">Blogs &<br />Stories</h3>
                  <p className="font-medium opacity-80">Read the latest insights.</p>
                </div>
                <TypographyVisual isHovered={isHovered} />
                <div className="mt-auto z-10">
                  <button className="bg-[#2B2929] text-white px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-[#FF5018] transition-colors">
                    Read Now
                  </button>
                </div>
              </>
            )}
          </BentoCard>

          {/* 3. RESUME BUILDER - Blue */}
          <BentoCard
            className="bg-[#0061FE] text-white"
            onClick={(e) => handleCardClick(e, '/resume', '#0061FE')}
            delay={0.2}
          >
            {(isHovered) => (
              <>
                <div className="flex justify-between items-start">
                  <FileText className="w-10 h-10 stroke-[2]" />
                  <motion.div animate={isHovered ? { y: -5 } : { y: 0 }}>
                    <ArrowUpRight className="w-8 h-8" />
                  </motion.div>
                </div>
                <div className="mt-auto">
                  <h3 className="text-3xl font-bold mb-2">Resume<br />Builder</h3>
                  <p className="text-white/80 font-medium">Create your professional CV</p>
                </div>
              </>
            )}
          </BentoCard>

          {/* 4. MEETUPS - Yellow */}
          <BentoCard
            className="bg-[#FFD600] text-[#2B2929]"
            onClick={(e) => handleCardClick(e, '/meetups', '#FFD600')}
            delay={0.3}
          >
            {(isHovered) => (
              <>
                <div className="flex justify-between items-start">
                  <MapPin className="w-10 h-10 stroke-[2]" />
                  <motion.div animate={isHovered ? { scale: 1.2 } : { scale: 1 }}>
                    <div className="w-3 h-3 bg-[#2B2929] rounded-full" />
                  </motion.div>
                </div>
                <div className="mt-auto">
                  <h3 className="text-3xl font-bold mb-2">Meetups</h3>
                  <p className="text-[#2B2929]/80 font-medium">Connect locally</p>
                </div>
              </>
            )}
          </BentoCard>

          {/* 5. MENTORSHIP - Lime */}
          <BentoCard
            className="bg-[#CCFF00] text-[#2B2929]"
            onClick={(e) => handleCardClick(e, '/mentorship', '#CCFF00')}
            delay={0.4}
          >
            {(isHovered) => (
              <>
                <div className="flex justify-between items-start">
                  <Handshake className="w-10 h-10 stroke-[2]" />
                  <Star className={`w-8 h-8 ${isHovered ? 'fill-[#2B2929]' : 'fill-transparent'} transition-colors`} />
                </div>
                <div className="mt-auto">
                  <h3 className="text-3xl font-bold mb-2">Mentorship</h3>
                  <p className="text-[#2B2929]/80 font-medium">Find or become a mentor</p>
                </div>
              </>
            )}
          </BentoCard>

          {/* 6. ATTENDED MEETUPS LIST (Replaces Analytics) - Lavender */}
          <BentoCard
            className="col-span-1 md:col-span-2 bg-[#D8C3F8] relative overflow-hidden"
            delay={0.5}
          >
            {(isHovered) => (
              <div className="h-full flex flex-col relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-[#2B2929]">Attended Meetups</h3>
                  <div className="bg-[#2B2929] text-white text-xs px-2 py-1 font-bold rounded">
                    {meetups.length} Total
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {meetups.length > 0 ? (
                    meetups.map((meetup) => (
                      <div key={meetup.id} className="bg-white/50 p-3 rounded-xl flex items-center justify-between hover:bg-white/80 transition-colors">
                        <div>
                          <h4 className="font-bold text-[#2B2929] text-sm line-clamp-1">{meetup.title}</h4>
                          <p className="text-xs text-gray-600">{new Date(meetup.start_date_time).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-[#2B2929] p-1.5 rounded-full">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                      <Calendar className="w-12 h-12 mb-2" />
                      <p className="font-medium">No meetups yet.</p>
                      <button onClick={(e) => handleCardClick(e, '/meetups', '#FFD600')} className="text-sm underline mt-1">Register for one!</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </BentoCard>

          {/* 7. RESOURCES - Cyan */}
          <BentoCard
            className="bg-[#00C6F7] text-[#2B2929]"
            onClick={(e) => handleCardClick(e, '/resource', '#00C6F7')}
            delay={0.6}
          >
            {(isHovered) => (
              <>
                <div className="flex justify-between">
                  <h3 className="text-3xl font-bold">Tools</h3>
                  <motion.div
                    animate={isHovered ? { rotate: 90 } : { rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Zap className="w-10 h-10 fill-[#2B2929]" />
                  </motion.div>
                </div>

                <div className="mt-auto space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-2 bg-[#2B2929] opacity-20 w-full rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#2B2929]"
                        initial={{ width: "0%" }}
                        whileInView={{ width: `${Math.random() * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                      />
                    </div>
                  ))}
                  <p className="text-sm font-bold mt-2 pt-2">Resource Library</p>
                </div>
              </>
            )}
          </BentoCard>

          {/* 8. EVENTS (Luma) - White/Cream */}
          <BentoCard
            className="bg-white text-[#2B2929] border border-gray-200"
            onClick={() => window.open("https://luma.com/codesapiens", "_blank")}
            delay={0.7}
          >
            {(isHovered) => (
              <>
                <div className="flex justify-between items-start">
                  <Calendar className="w-10 h-10 stroke-[2.5]" />
                  <ExternalLinkIcon isHovered={isHovered} />
                </div>
                <div className="mt-auto">
                  <h3 className="text-3xl font-black tracking-tighter mb-2">LUMA<br />EVENTS</h3>
                  <p className="text-gray-500 font-medium">Register now</p>
                </div>
              </>
            )}
          </BentoCard>

        </div>
      </div>

      {/* Blog Popup */}
      <AnimatePresence>
        {showBlogPopup && <BlogPopup onClose={() => setShowBlogPopup(false)} />}
      </AnimatePresence>
    </div>
  );
}

const ExternalLinkIcon = ({ isHovered }) => (
  <motion.svg
    width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    animate={isHovered ? { x: 2, y: -2 } : { x: 0, y: 0 }}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </motion.svg>
);