// src/pages/UserMeetupsList.jsx
import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, MapPin, Loader2, CheckCircle, X,
  Ticket, ArrowRight, Zap, Hexagon, MoveUpRight, Smile, PenTool, LayoutGrid, Hourglass, CalendarX
} from "lucide-react";

// --- ANIMATED GRID SYSTEM (THE "FRAMEWORK") ---
const FrameworkGrid = () => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden h-full opacity-30">
    <motion.div
      initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }}
      className="w-px bg-[#0061FE]/20 absolute left-[40px] hidden md:block"
    />
    <motion.div
      initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
      className="w-px bg-[#0061FE]/20 absolute left-[40px] md:left-[260px]"
    />
    <motion.div
      initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.1, ease: "easeInOut" }}
      className="absolute top-[180px] left-0 h-px bg-[#0061FE]/10"
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
        const { data: rows } = await supabase.from("users").select("display_name, email, avatar").eq("uid", user.id);
        setUserProfile(rows?.[0] || null);
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
          registeredMap[reg.meetup_id] = { token: reg.token, name: reg.user_name, email: reg.user_email, registeredAt: reg.created_at, status: reg.status || "pending" };
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
        ...m, registered: true, registrationData: { token: data.token, name: userProfile.display_name, email: userProfile.email, registeredAt: data.created_at, status: "pending" }
      } : m));

      toast.success("Registration submitted! Awaiting admin approval.");
      setExpandedRegisterId(null);
      // Don't show ticket modal - wait for admin approval

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
        <div className="pt-24 pb-12 px-6 relative overflow-hidden">
          <div className="w-full max-w-7xl mx-auto relative z-10 text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-[#1E1E1E] rounded-2xl">
                  <LayoutGrid className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1E1E1E]">
                  Community Meetups
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl leading-relaxed">
                Join our events to learn, code, and connect with fellow developers. Structured chaos, maximum impact.
              </p>
            </motion.div>

            {userProfile && (
              <div className="mt-8 inline-flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-[#C2E812] rounded-full flex items-center justify-center text-black font-black text-lg">
                  {userProfile.display_name?.[0]}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Logged in as</div>
                  <div className="font-bold text-[#1E1E1E]">{userProfile.display_name}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="w-full max-w-7xl mx-auto px-6 pb-24 relative z-20">
          {(() => {
            const now = new Date();
            const upcomingMeetups = meetups.filter(m => new Date(m.end_date_time) > now);
            const pastMeetups = meetups.filter(m => new Date(m.end_date_time) <= now);

            if (meetups.length === 0) return <EmptyState />;

            return (
              <>
                {/* Upcoming Meetups Section */}
                {upcomingMeetups.length > 0 && (
                  <div className="mb-16">
                    <div className="mb-8">
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#1E1E1E] mb-2 flex items-center gap-3">
                        <span className="w-3 h-3 bg-[#10b981] rounded-full animate-pulse"></span>
                        Upcoming Meetups
                      </h2>
                      <p className="text-lg font-medium text-gray-500">Register now to secure your spot!</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                      {upcomingMeetups.map((meetup, index) => (
                        <MeetupCard
                          key={meetup.id}
                          meetup={meetup}
                          index={index}
                          user={user}
                          isRegistering={expandedRegisterId === meetup.id}
                          onToggleRegister={() => setExpandedRegisterId(expandedRegisterId === meetup.id ? null : meetup.id)}
                          onRegisterConfirm={() => handleRegister(meetup.id)}
                          onViewTicket={() => setSelectedTicket(meetup)}
                          isPast={false}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Meetups Section */}
                {pastMeetups.length > 0 && (
                  <div>
                    <div className="mb-8">
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#1E1E1E] mb-2 flex items-center gap-3">
                        <CalendarX className="w-8 h-8 text-gray-400" />
                        Past Meetups
                      </h2>
                      <p className="text-lg font-medium text-gray-500">These events have ended.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 opacity-75">
                      {pastMeetups.map((meetup, index) => (
                        <MeetupCard
                          key={meetup.id}
                          meetup={meetup}
                          index={index + upcomingMeetups.length}
                          user={user}
                          isRegistering={false}
                          onToggleRegister={() => { }}
                          onRegisterConfirm={() => { }}
                          onViewTicket={() => setSelectedTicket(meetup)}
                          isPast={true}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* --- PAST EVENTS GALLERY --- */}
        <div className="w-full max-w-7xl mx-auto px-6 pb-24 relative">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#1E1E1E] mb-4">
              Past Events
            </h2>
            <p className="text-lg font-medium text-gray-500 max-w-xl">
              A glimpse into our previous gatherings. Where code meets community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Main Big Image */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-2 relative h-[400px] rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 bg-white group"
            >
              <div className="absolute inset-0 bg-[#F2F2F2]">
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
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end h-full">
                <h3 className="text-2xl font-bold text-white mb-1">{pastEvents[currentImageIndex].title}</h3>
                <div className="flex items-center gap-2 font-medium text-white/80">
                  <Calendar className="w-4 h-4" />
                  {pastEvents[currentImageIndex].date}
                </div>
              </div>
            </motion.div>

            {/* Grid of smaller photos */}
            <div className="grid grid-cols-2 gap-4 h-[400px]">
              {pastEvents.slice(0, 4).map((event, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-gray-100 ${currentImageIndex === index ? 'ring-2 ring-[#0061FE]' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
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

const MeetupCard = ({ meetup, index, isRegistering, onToggleRegister, onRegisterConfirm, onViewTicket, user, isPast = false }) => {
  const startDate = new Date(meetup.start_date_time);
  const isRegistered = meetup.registered;
  const rotation = index % 2 === 0 ? 1 : -1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, type: "spring", bounce: 0.2 }}
      whileHover={isPast ? {} : { y: -10, rotate: 0 }}
      className={`relative flex flex-col bg-white rounded-[2rem] border-[3px] border-[#1E1E1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden ${isPast ? 'grayscale-[30%]' : ''}`}
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

        {isPast ? (
          <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_black]">
            Ended
          </div>
        ) : isRegistered && (
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
          {isPast ? (
            <div className="flex items-center gap-2 text-gray-500 font-bold">
              <CalendarX className="w-5 h-5" />
              <span>This event has ended</span>
            </div>
          ) : isRegistering ? (
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
              meetup.registrationData?.status === "approved" ? (
                <button onClick={onViewTicket} className="flex items-center gap-2 font-black text-[#1E1E1E] hover:text-[#0061FE] group/btn">
                  <Ticket className="w-6 h-6" />
                  <span className="text-lg">View Ticket</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </button>
              ) : meetup.registrationData?.status === "rejected" ? (
                <div className="flex items-center gap-2 text-red-600 font-bold">
                  <X className="w-5 h-5" />
                  <span>Registration Rejected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 font-bold">
                  <Hourglass className="w-5 h-5 animate-pulse" />
                  <span>Pending Admin Approval</span>
                </div>
              )
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