// src/pages/UserMeetupsList.jsx
import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, MapPin, Loader2, CheckCircle, X,
  Ticket, ArrowRight, Zap, Hexagon, MoveUpRight, Smile, PenTool
} from "lucide-react";

// --- CUSTOM HAND-DRAWN DOODLES (ANIMATED) ---

const DrawVariant = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: { duration: 1.5, ease: "easeInOut" }
  }
};

const HandDrawnFolder = () => (
  <svg width="100" height="80" viewBox="0 0 100 80" fill="none" stroke="#0061FE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform -rotate-6">
    <motion.path
      d="M5,25 L5,75 L95,75 L95,25 L55,25 L45,5 L15,5 L5,25"
      variants={DrawVariant} initial="hidden" animate="visible"
    />
    <motion.path d="M5,25 L95,25" variants={DrawVariant} initial="hidden" animate="visible" />
  </svg>
);

const HandDrawnPlane = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#0061FE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-12">
    <motion.path
      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
      variants={DrawVariant} initial="hidden" animate="visible"
    />
  </svg>
);

const MeBubble = () => (
  <div className="relative group">
     <svg width="80" height="50" viewBox="0 0 80 50" fill="none" stroke="#FF5018" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
       <motion.path 
         d="M10,5 L70,5 L70,35 L40,35 L30,45 L25,35 L10,35 Z"
         variants={DrawVariant} initial="hidden" animate="visible"
       />
     </svg>
     <span className="absolute top-2 left-6 text-[#FF5018] font-black text-lg">ME</span>
  </div>
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

const MessyOval = ({ width = 140, height = 65, color = "#0061FE" }) => (
  <svg width={width} height={height} viewBox="0 0 140 65" className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] pointer-events-none">
    <motion.path
      d="M5,32.5 C5,10 35,5 70,5 C105,5 135,10 135,32.5 C135,55 105,60 70,60 C35,60 5,55 5,32.5 Z"
      fill="none" stroke={color} strokeWidth="4"
      variants={DrawVariant} initial="hidden" animate="visible"
    />
  </svg>
);

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

const HandDrawnHeart = () => (
  <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#D83B01" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform -rotate-6">
    <motion.path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
    />
  </svg>
);

// --- ANIMATED GRID SYSTEM (THE "FRAMEWORK") ---
const FrameworkGrid = () => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden h-full">
    {/* Vertical Lines - Animated */}
    <motion.div 
      initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }}
      className="w-px bg-[#0061FE]/40 absolute left-[40px] hidden md:block" 
    />
    <motion.div 
      initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
      className="w-px bg-[#0061FE]/40 absolute left-[40px] md:left-[260px]" 
    />
    <motion.div 
      initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ duration: 1.5, delay: 0.4, ease: "easeInOut" }}
      className="w-px bg-[#0061FE]/30 absolute right-[40px] hidden lg:block" 
    />
    
    {/* Horizontal Lines - Animated */}
    <motion.div 
      initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.1, ease: "easeInOut" }}
      className="absolute top-[180px] left-0 h-px bg-[#0061FE]/20" 
    />
    <motion.div 
      initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
      className="absolute top-[500px] left-0 h-px bg-[#0061FE]/20" 
    />
    <motion.div 
      initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
      className="absolute bottom-[100px] left-0 h-px bg-[#0061FE]/20" 
    />
  </div>
);

// --- MAIN COMPONENT ---

export default function UserMeetupsList() {
  const user = useUser();
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [expandedRegisterId, setExpandedRegisterId] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % pastEvents.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) { setUserProfile(null); return; }
    const fetchUserProfile = async () => {
      try {
        const { data } = await supabase.from("users").select("display_name, email, avatar").eq("uid", user.id).single();
        setUserProfile(data);
      } catch (err) { console.error(err); }
    };
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchMeetups = async () => {
      setLoading(true);
      const { data: meetupsData, error } = await supabase
        .from("meetup")
        .select("*, venue, registration_start_time, registration_end_time, registration_open_until_meetup_end")
        .order("start_date_time", { ascending: true });

      if (error) { toast.error("Failed to load meetups"); setLoading(false); return; }

      let enrichedMeetups = meetupsData;
      if (user) {
        const { data: registrations } = await supabase.from("registrations").select("*").eq("user_id", user.id);
        const registeredMap = {};
        registrations?.forEach((reg) => {
          registeredMap[reg.meetup_id] = { token: reg.token, name: reg.user_name, email: reg.user_email, registeredAt: reg.created_at };
        });
        enrichedMeetups = meetupsData.map((m) => ({ ...m, registered: !!registeredMap[m.id], registrationData: registeredMap[m.id] || null }));
      }
      setMeetups(enrichedMeetups);
      setLoading(false);
    };
    fetchMeetups();
  }, [user]);

  const handleRegister = async (meetupId) => {
    if (!user) return toast.error("Please log in to register");
    if (!userProfile?.display_name) return toast.error("Please set your display name in your profile.");

    try {
      const { data, error } = await supabase.from("registrations").insert({
        meetup_id: meetupId, user_name: userProfile.display_name, user_email: userProfile.email || user.email, user_id: user.id
      }).select("token, created_at").single();

      if (error) throw error;

      setMeetups((prev) => prev.map((m) => m.id === meetupId ? {
        ...m, registered: true, registrationData: { token: data.token, name: userProfile.display_name, email: userProfile.email, registeredAt: data.created_at }
      } : m));

      toast.success("Welcome to the chaos!");
      setExpandedRegisterId(null);
      const m = meetups.find(x => x.id === meetupId);
      if (m) setSelectedTicket({ ...m, registrationData: { token: data.token, name: userProfile.display_name } });

    } catch (err) { toast.error(err.message || "Failed"); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1E1E1E', color: '#fff' } }} />

      <div className="min-h-screen bg-[#F7F5F2] font-sans text-[#1E1E1E] selection:bg-[#C2E812] selection:text-black overflow-x-hidden relative">
        
        {/* --- ANIMATED BLUE GRID LINES --- */}
        <FrameworkGrid />

        {/* --- HERO SECTION --- */}
        <div className="bg-[#1E1E1E] text-white pt-24 pb-48 px-6 relative overflow-hidden border-b border-[#0061FE]/20">
          
          {/* --- SCATTERED HAND-DRAWN ICONS --- */}
          <motion.div className="absolute top-12 left-[280px] z-20" animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <HandDrawnCrown />
          </motion.div>
          <motion.div className="absolute top-20 right-[15%] z-20" animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <LightningBolt />
          </motion.div>
          <motion.div className="absolute top-40 right-[8%] z-20" animate={{ rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            <MeBubble />
          </motion.div>
          <motion.div className="absolute bottom-12 left-[8%] z-20" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <HandDrawnFolder />
          </motion.div>
          <motion.div className="absolute bottom-32 left-[40%] z-20 opacity-60" animate={{ x: [0, 20, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
             <HandDrawnPlane />
          </motion.div>

          {/* LEFT ALIGNED CONTENT CONTAINER */}
          <div className="w-full pl-[60px] md:pl-[260px] pr-4 relative z-10 text-left">
            
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              {/* Massive Left Aligned Typography */}
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.9] mb-8 relative z-10 text-left">
                WE MEET.<br />
                WE <span className="relative inline-block text-white z-10">
                  CODE
                  <MessyOval width={220} height={100} color="#0061FE" />
                </span>.<br />
                WE CREATE.
              </h1>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-8 items-start mt-16 pt-8 border-t-2 border-white/10 max-w-4xl relative">
              {/* Squiggle connecting text */}
              <div className="absolute -top-10 left-10">
                 <SquiggleArrow />
              </div>

              <div className="max-w-lg text-left">
                <p className="text-2xl md:text-3xl font-bold leading-tight opacity-90">
                  How we all work today is <span className="relative inline-block text-[#C2E812]">
                    messy
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0,5 Q50,10 100,5" stroke="#C2E812" strokeWidth="3" fill="none" />
                    </svg>
                  </span>.
                  Our meetups bring structure to the chaos.
                </p>
              </div>
              
              {userProfile && (
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex items-center gap-4 border border-white/20">
                  <div className="w-12 h-12 bg-[#C2E812] rounded-full flex items-center justify-center text-black font-black text-xl border-2 border-black">
                    {userProfile.display_name?.[0]}
                  </div>
                  <div className="text-left">
                    <div className="font-black text-sm uppercase tracking-widest text-[#C2E812]">Logged in as</div>
                    <div className="font-bold text-white">{userProfile.display_name}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="w-full pl-[60px] md:pl-[260px] pr-4 md:pr-12 -mt-32 relative z-20 pb-24 text-left">
          {meetups.length === 0 ? <EmptyState /> : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {meetups.map((meetup, index) => (
                <MeetupCard
                  key={meetup.id}
                  meetup={meetup}
                  index={index}
                  user={user}
                  isRegistering={expandedRegisterId === meetup.id}
                  onToggleRegister={() => setExpandedRegisterId(expandedRegisterId === meetup.id ? null : meetup.id)}
                  onRegisterConfirm={() => handleRegister(meetup.id)}
                  onViewTicket={() => setSelectedTicket(meetup)}
                />
              ))}
            </div>
          )}
        </div>

        {/* --- PAST EVENTS GALLERY --- */}
        <div className="w-full pl-[60px] md:pl-[260px] pr-4 md:pr-12 pb-24 relative text-left">
           {/* More floating doodles for gallery */}
           <div className="absolute -top-20 right-20 z-0">
              <HandDrawnHeart />
           </div>
           <div className="absolute top-40 -left-10 z-0 opacity-50">
              <SquiggleArrow />
           </div>

          <div className="mb-12 text-left relative z-10">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-[#1E1E1E] mb-6 relative inline-block">
              PAST <span className="text-[#0061FE]">CHAOS</span>
            </h2>
            <p className="text-xl font-bold text-gray-600 max-w-xl">
              A glimpse into our previous gatherings. Where code meets community.
            </p>
          </div>

          {/* Featured Image - Rotated Frame */}
          <div className="mb-16 max-w-5xl relative">
            {/* Decorative Tape/Stickers */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#C2E812] rounded-full mix-blend-multiply opacity-80 animate-pulse"></div>

            <motion.div
              initial={{ opacity: 0, rotate: -1 }}
              whileInView={{ opacity: 1, rotate: -1 }}
              viewport={{ once: true }}
              className="relative p-3 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-[#1E1E1E]"
            >
              <div className="relative overflow-hidden border-2 border-[#1E1E1E] h-[400px] md:h-[500px]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={pastEvents[currentImageIndex].image}
                    alt={pastEvents[currentImageIndex].title}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t-4 border-[#1E1E1E]">
                  <h3 className="text-3xl font-black text-[#1E1E1E] mb-1">{pastEvents[currentImageIndex].title}</h3>
                  <div className="flex items-center gap-2 font-bold text-[#0061FE]">
                    <Calendar className="w-5 h-5" />
                    {pastEvents[currentImageIndex].date}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Grid of smaller photos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl">
            {pastEvents.map((event, index) => {
               const rotation = index % 2 === 0 ? 2 : -2; 
               return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, rotate: 0, zIndex: 10 }}
                className={`relative p-2 bg-white shadow-md border-2 border-[#1E1E1E] cursor-pointer ${currentImageIndex === index ? 'ring-4 ring-[#C2E812] z-10' : ''}`}
                style={{ transform: `rotate(${rotation}deg)` }}
                onClick={() => setCurrentImageIndex(index)}
              >
                <div className="aspect-square overflow-hidden border-2 border-[#1E1E1E]">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </motion.div>
            )})}
          </div>
        </div>

      </div>

      {/* --- TICKET MODAL --- */}
      <AnimatePresence>
        {selectedTicket && <TicketModal meetup={selectedTicket} onClose={() => setSelectedTicket(null)} />}
      </AnimatePresence>
    </>
  );
}

// --- SUB COMPONENTS ---

const MeetupCard = ({ meetup, index, isRegistering, onToggleRegister, onRegisterConfirm, onViewTicket, user }) => {
  const startDate = new Date(meetup.start_date_time);
  const isRegistered = meetup.registered;
  const rotation = index % 2 === 0 ? 1 : -1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, type: "spring", bounce: 0.2 }}
      whileHover={{ y: -10, rotate: 0 }}
      className="relative flex flex-col bg-white rounded-[2rem] border-[3px] border-[#1E1E1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
      style={{ rotate: `${rotation}deg` }}
    >
        {/* Banner */}
        <div className="h-48 bg-[#F2F2F2] relative overflow-hidden flex items-center justify-center border-b-[3px] border-[#1E1E1E]">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
          {/* Blob */}
          <div className={`absolute w-32 h-32 rounded-full mix-blend-multiply opacity-90 ${index % 2 === 0 ? 'bg-[#C2E812] -right-8 -top-8' : 'bg-[#0061FE] -left-8 -bottom-8'}`}></div>

          <div className="relative z-10 flex flex-col items-center">
            <span className="text-6xl font-black text-[#1E1E1E] tracking-tighter leading-none">
              {startDate.getDate()}
            </span>
            <span className="text-xl font-black uppercase tracking-widest text-[#1E1E1E]">
              {startDate.toLocaleString('default', { month: 'short' })}
            </span>
          </div>

          {isRegistered && (
            <div className="absolute top-4 right-4 bg-[#C2E812] text-[#1E1E1E] px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_black]">
              Going
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 flex-1 flex flex-col bg-white">
          <h2 className="text-3xl font-black leading-tight mb-4 text-[#1E1E1E] tracking-tight hover:text-[#0061FE] transition-colors text-left">
            {meetup.title}
          </h2>

          <div className="flex flex-col gap-2 mb-6 text-left">
             <div className="flex items-center gap-2 text-gray-600 font-bold">
                <Clock className="w-5 h-5 text-[#FF5018]" />
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
             <div className="flex items-center gap-2 text-gray-600 font-bold">
                <MapPin className="w-5 h-5 text-[#0061FE]" />
                {meetup.venue}
             </div>
          </div>

          <p className="text-[#1E1E1E] text-lg font-medium leading-relaxed mb-8 text-left">
            {meetup.description}
          </p>

          <div className="mt-auto pt-6 border-t-[3px] border-dashed border-[#1E1E1E]/20 text-left">
            {isRegistering ? (
              <div className="bg-[#F7F5F2] p-4 rounded-xl border-[3px] border-[#1E1E1E] animate-in slide-in-from-bottom-2">
                <p className="font-black text-sm mb-3">Secure your spot?</p>
                <div className="flex gap-2">
                  <button onClick={onRegisterConfirm} className="flex-1 bg-[#1E1E1E] text-white py-2 rounded-lg font-black hover:bg-[#0061FE] shadow-[3px_3px_0px_0px_black] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_black]">
                    Yes
                  </button>
                  <button onClick={onToggleRegister} className="px-4 py-2 border-[2px] border-[#1E1E1E] rounded-lg font-bold hover:bg-gray-200">
                    No
                  </button>
                </div>
              </div>
            ) : (
               isRegistered ? (
                 <button onClick={onViewTicket} className="flex items-center gap-2 font-black text-[#1E1E1E] hover:text-[#0061FE] group/btn">
                    <Ticket className="w-6 h-6" />
                    <span className="text-lg">View Ticket</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                 </button>
               ) : (
                 <button onClick={onToggleRegister} className="bg-[#1E1E1E] text-white px-6 py-3 rounded-xl font-black text-lg hover:bg-[#0061FE] transition-all shadow-[4px_4px_0px_0px_black] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_black] flex items-center gap-2 w-fit">
                    Register Now <PenTool className="w-4 h-4" />
                 </button>
               )
            )}
          </div>
        </div>
    </motion.div>
  );
};

const TicketModal = ({ meetup, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1E1E]/90 backdrop-blur-md"
    >
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ rotate: 0, scale: 0.9, y: 0 }}
          animate={{ rotate: -5, scale: 0.95, y: 5 }}
          className="absolute inset-0 bg-white rounded-[2rem] border-[3px] border-[#1E1E1E] shadow-2xl"
        />
        <motion.div
          initial={{ y: 100, scale: 0.8 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 100, scale: 0.8 }}
          className="relative bg-white rounded-[2rem] border-[4px] border-[#1E1E1E] shadow-2xl overflow-hidden"
        >
          <div className="bg-[#0061FE] p-6 text-white flex justify-between items-start border-b-[4px] border-[#1E1E1E]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hexagon className="w-5 h-5 text-[#C2E812]" />
                <span className="text-xs font-black uppercase tracking-widest text-[#C2E812]">Ticket</span>
              </div>
              <h3 className="text-2xl font-black leading-tight">{meetup.title}</h3>
            </div>
            <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
            <div className="p-4 bg-white rounded-xl border-[3px] border-dashed border-[#1E1E1E] mb-6 shadow-sm">
              <QRCodeCanvas value={meetup.registrationData?.token || "error"} size={160} />
            </div>
            <div className="text-center w-full">
              <h4 className="text-2xl font-black text-[#1E1E1E] mb-2">{meetup.registrationData?.name}</h4>
              <div className="inline-block bg-[#1E1E1E] text-white px-4 py-1 rounded-lg font-mono text-sm font-bold">
                {meetup.registrationData?.token?.substring(0, 8).toUpperCase()}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#1E1E1E] flex flex-col items-center justify-center text-white relative overflow-hidden">
    <Loader2 className="w-16 h-16 animate-spin text-[#C2E812] mb-6" />
    <p className="font-black text-xl tracking-[0.2em] animate-pulse">LOADING...</p>
  </div>
);

const EmptyState = () => (
  <div className="bg-white border-[3px] border-dashed border-[#1E1E1E] rounded-[2.5rem] p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
    <div className="w-20 h-20 bg-[#F7F5F2] rounded-full flex items-center justify-center mx-auto mb-6 border-[3px] border-[#1E1E1E]">
      <Smile className="w-10 h-10 text-[#1E1E1E]" />
    </div>
    <h3 className="text-3xl font-black text-[#1E1E1E] mb-2">No Meetups</h3>
    <p className="text-lg font-bold text-gray-500">Check back later for new events.</p>
  </div>
);

// --- PAST EVENTS DATA ---
const pastEvents = [
  {
    id: 1,
    title: "August Meetup 2025",
    image: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/users_cme79i2lk00qls401ar5qxqnc_tYvYry0ll1qJY9Cr-sZlcWmpyKLCEVr3R-WhatsApp25202025-08-10252015.15.02_25567a3d_c0frk5_dpl25k.jpg",
    date: "August 2025",
  },
  {
    id: 2,
    title: "July Meetup 2024",
    image: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122532/width_800_pmtms3_cqtzrn.webp",
    date: "July 2025",
  },
  {
    id: 3,
    title: "Summer of code 2024",
    image: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122534/codesapiens_3_md0nvd_ceyry4.png",
    date: "Summer 2024",
  },
  {
    id: 5,
    title: "September Meetup 2025",
    image: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122957/users_cme79i2lk00qls401ar5qxqnc_OadwAYSr5ySuegEn-IMG-20250914-WA0012_gvyeye_n1s3az.jpg",
    date: "September 2025",
  },
  {
    id: 6,
    title: "Github Contest",
    image: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122991/1753106111524_wqepam_wam1st.jpg",
    date: "July 2025",
  }
];