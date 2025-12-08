import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { Loader2, X, Eye, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

// --- CUSTOM SVG: THE "DOORWAY SCENE" ---
const drawVariant = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1, 
    transition: { duration: 1.5, ease: "easeInOut" } 
  }
};

const fadeVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 1.2, duration: 0.5 } }
};

const DoorwayScene = () => (
  <svg width="400" height="300" viewBox="0 0 400 300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <motion.g variants={drawVariant} initial="hidden" animate="visible">
      <rect x="180" y="40" width="100" height="220" stroke="white" /> 
      <rect x="185" y="45" width="90" height="215" stroke="white" strokeWidth="0.5" opacity="0.5" />
      <rect x="195" y="60" width="25" height="30" />
      <rect x="235" y="60" width="25" height="30" />
      <rect x="195" y="100" width="25" height="30" />
      <rect x="235" y="100" width="25" height="30" />
      <rect x="195" y="140" width="25" height="30" />
      <rect x="235" y="140" width="25" height="30" />
      <circle cx="265" cy="180" r="3" fill="white" />
      <rect x="210" y="220" width="40" height="8" />
    </motion.g>
    <motion.g variants={drawVariant} initial="hidden" animate="visible">
      <line x1="120" y1="260" x2="120" y2="80" strokeWidth="2" />
      <path d="M100 260 H140" />
      <path d="M120 90 L100 85" />
      <path d="M120 100 L140 95" />
      <path d="M120 110 L100 105" />
      <path d="M100 105 Q90 130 95 180 L115 180 Q120 130 100 105" />
      <path d="M140 95 L140 120" />
      <rect x="130" y="120" width="30" height="40" rx="2" />
    </motion.g>
    <motion.g variants={drawVariant} initial="hidden" animate="visible">
      <rect x="310" y="60" width="40" height="50" rx="2" />
      <path d="M315 90 Q325 80 330 100 T345 70" opacity="0.6" />
    </motion.g>
    <motion.g variants={fadeVariant} initial="hidden" animate="visible">
      <path d="M200 250 L220 245 L225 255 L205 260 Z" fill="#FFB6C1" stroke="none" />
      <path d="M200 250 L220 245 L225 255 L205 260 Z" stroke="white" strokeWidth="1" fill="none" />
      <path d="M230 255 L250 250 L255 260 L235 265 Z" fill="#FFB6C1" stroke="none" />
      <path d="M230 255 L250 250 L255 260 L235 265 Z" stroke="white" strokeWidth="1" fill="none" />
      <path d="M215 240 L235 235 L240 245 L220 250 Z" fill="#FFB6C1" stroke="none" />
      <path d="M215 240 L235 235 L240 245 L220 250 Z" stroke="white" strokeWidth="1" fill="none" />
    </motion.g>
    <motion.g initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.5, duration: 0.8 }}>
      <path d="M160 260 Q150 220 170 200 Q180 190 190 200 Q195 210 185 220 Q190 240 185 260 Z" fill="#D2B48C" stroke="none" />
      <path d="M160 260 Q150 220 170 200 Q180 190 190 200 Q195 210 185 220 Q190 240 185 260" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M175 205 L165 215" stroke="white" />
      <path d="M160 250 Q140 255 145 240" stroke="white" strokeWidth="1.5" />
    </motion.g>
  </svg>
);

// --- SCROLL COMPONENT (Move this logic here to keep main component clean) ---
const ScrollRevealSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"] 
  });

  const clipPath = useTransform(scrollYProgress, [0, 1], ["inset(0 0 0 0%)", "inset(0 0 0 100%)"]);

  return (
    <div ref={containerRef} className="relative h-[250vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Layer 1: BOTTOM (Image Background + White Text) */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2669&auto=format&fit=crop" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          
          <div className="absolute inset-0 flex items-center justify-center p-8 md:p-24">
            <h2 className="text-6xl md:text-9xl font-black text-white leading-[0.9] tracking-tighter text-center max-w-7xl">
              Mentorship Program provides new opportunities for Growth and Development
            </h2>
          </div>
        </div>

        {/* Layer 2: TOP (White Background + Black Text) */}
        <motion.div 
          style={{ clipPath }}
          className="absolute inset-0 w-full h-full bg-white flex items-center justify-center p-8 md:p-24"
        >
           <h2 className="text-6xl md:text-9xl font-black text-[#1E1E1E] leading-[0.9] tracking-tighter text-center max-w-7xl">
              Mentorship Program provides new opportunities for Growth and Development
           </h2>
        </motion.div>

      </div>
    </div>
  );
};

const UserMentorshipForm = () => {
  const COOLDOWN_DURATION = 300;
  const [formData, setFormData] = useState({
    email: "", reasonForMentorship: "", skillsToDevelop: "", domain: "", topicsInterested: "", expectations: "", previousProjects: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        setAuthChecking(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setIsAuthenticated(false);
          setError("Please log in.");
          return;
        }

        setIsAuthenticated(true);
        setFormData((prev) => ({ ...prev, email: user.email || "" }));

        const { data: userData } = await supabase.from("users").select("mentorship_request").eq("uid", user.id).single();

        if (userData && userData.mentorship_request && Array.isArray(userData.mentorship_request)) {
          const latestRequest = userData.mentorship_request.reduce((latest, request) => !latest || new Date(request.created_at) > new Date(latest.created_at) ? request : latest, null);
          if (latestRequest) {
            setLastSubmissionTime(latestRequest.created_at);
            const timePassed = Math.floor((Date.now() - new Date(latestRequest.created_at)) / 1000);
            if (timePassed < COOLDOWN_DURATION) {
              setCountdown(COOLDOWN_DURATION - timePassed);
              setShowCountdown(true);
            }
          }
        }
      } catch (err) { setError("Failed to verify authentication."); } 
      finally { setAuthChecking(false); }
    };
    checkAuthAndFetchData();
  }, []);

  useEffect(() => {
    if (success) { setTimeout(() => setSuccess(null), 3000); }
  }, [success]);

  useEffect(() => {
    if (lastSubmissionTime && countdown > 0) {
      const timer = setInterval(() => {
        const timePassed = Math.floor((Date.now() - new Date(lastSubmissionTime)) / 1000);
        const remaining = COOLDOWN_DURATION - timePassed;
        if (remaining <= 0) { setCountdown(null); setShowCountdown(false); } 
        else { setCountdown(remaining); }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lastSubmissionTime, countdown]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (lastSubmissionTime) {
        const timePassed = Math.floor((Date.now() - new Date(lastSubmissionTime)) / 1000);
        if (timePassed < COOLDOWN_DURATION) {
          setLoading(false); return;
        }
      }

      const mentorshipRequest = {
        reasonForMentorship: formData.reasonForMentorship.trim(),
        skillsToDevelop: formData.skillsToDevelop.split(",").map(s => s.trim()).filter(Boolean),
        domain: formData.domain.trim(),
        topicsInterested: formData.topicsInterested.split(",").map(t => t.trim()).filter(Boolean),
        expectations: formData.expectations.trim(),
        previousProjects: formData.previousProjects.trim(),
        created_at: new Date().toISOString(),
      };

      const { data: existingData } = await supabase.from("users").select("mentorship_request").eq("uid", user.id).single();
      const updatedRequests = existingData?.mentorship_request ? [...existingData.mentorship_request, mentorshipRequest] : [mentorshipRequest];

      const { error } = await supabase.from("users").update({ mentorship_request: updatedRequests, updated_at: new Date().toISOString() }).eq("uid", user.id);
      if (error) throw error;

      setSuccess("Submitted successfully!");
      setLastSubmissionTime(mentorshipRequest.created_at);
      setCountdown(COOLDOWN_DURATION);
      setShowCountdown(true);
      setFormData({ ...formData, reasonForMentorship: "", skillsToDevelop: "", domain: "", topicsInterested: "", expectations: "", previousProjects: "" });

    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  };

  if (authChecking) return <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-[#C2E812]" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center text-white"><Link to="/login" className="px-8 py-3 bg-[#0061FE] rounded-lg font-bold">Log In</Link></div>;

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#C2E812] selection:text-black">

      {/* --- SECTION 1: FRAMEWORK HERO (FULL SCREEN BLACK) --- */}
      {/* Changed min-h-[60vh] to h-screen for full viewport height */}
      <div className="bg-[#1E1E1E] text-white h-screen flex flex-col relative overflow-hidden">
        <div className="absolute top-[25%] left-0 w-full h-px bg-[#0061FE]/20"></div>
        <div className="absolute bottom-[25%] left-0 w-full h-px bg-[#0061FE]/20"></div>
        <div className="max-w-[1600px] mx-auto w-full h-full flex-1 flex flex-col justify-end p-8 md:p-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="absolute top-12 left-12 md:left-24">
             <div className="bg-[#F7F5F2] text-[#1E1E1E] px-4 py-3 font-bold text-sm tracking-wide">
                <span className="font-serif italic mr-2">✍️</span> Application
             </div>
          </motion.div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:translate-x-32 md:-translate-y-12 scale-125 md:scale-150 pointer-events-none">
             <DoorwayScene />
          </div>
          {/* Added margin-bottom to pull it up slightly from the very bottom edge if needed */}
          <motion.h1 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="text-[12vw] md:text-[9rem] font-bold leading-none tracking-tighter text-white relative z-20 mt-auto mb-12">
            Mentorship
          </motion.h1>
        </div>
      </div>

      {/* --- SECTION 2: SCROLL REVEAL (Moved to Middle) --- */}
      <ScrollRevealSection />

      {/* --- SECTION 3: FORM & CONTEXT (Moved to Bottom) --- */}
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left: Visual Context */}
        <div className="w-full md:w-1/2 bg-[#F7F5F2] flex flex-col relative border-r border-gray-100">
          <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
            <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2670&auto=format&fit=crop" alt="Mentorship" className="absolute inset-0 w-full h-full object-cover filter saturate-0 contrast-125 hover:saturate-100 transition-all duration-700" />
            <div className="absolute inset-0 bg-[#1E1E1E]/10"></div>
          </div>
          <div className="p-12 md:p-16 flex-1 flex flex-col justify-center">
            <h2 className="text-4xl md:text-6xl font-black text-[#1E1E1E] leading-[0.9] mb-8 tracking-tight">
              Grow with <br/><span className="text-[#0061FE] decoration-wavy underline decoration-[#C2E812]">Guidance.</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-md">
              Connect with senior developers. Break through plateaus. Our mentorship program is designed to bridge the gap between learning and doing.
            </p>
            <Link to="/mentorship-list" className="inline-flex items-center gap-3 text-lg font-bold text-[#1E1E1E] border-b-2 border-[#1E1E1E] pb-1 w-fit hover:text-[#0061FE] hover:border-[#0061FE] transition-colors">
              View past requests <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Right: The Form */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-16 lg:p-20 flex flex-col justify-center">
          {showCountdown ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#F7F5F2] border-2 border-dashed border-[#1E1E1E] rounded-3xl p-16 text-center">
              <div className="w-20 h-20 bg-[#C2E812] rounded-full flex items-center justify-center mx-auto mb-6">
                 <Sparkles className="w-10 h-10 text-[#1E1E1E]" />
              </div>
              <h3 className="text-3xl font-black text-[#1E1E1E] mb-2">Request Received</h3>
              <p className="text-gray-500 mb-8 text-lg">
                Cooldown active: <span className="font-mono font-bold text-[#0061FE] bg-blue-50 px-2 py-1 rounded">{formatCountdown(countdown)}</span>
              </p>
              <Link to="/mentorship-list" className="block w-full bg-[#1E1E1E] text-white py-4 rounded-xl font-bold hover:bg-[#0061FE] transition-colors">
                View Status
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 max-w-xl mx-auto w-full">
              <div className="mb-8">
                <h3 className="text-3xl font-black text-[#1E1E1E] mb-2 tracking-tight">Application Details</h3>
                <div className="h-1 w-20 bg-[#C2E812]"></div>
              </div>
              {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg flex gap-2"><X className="w-5 h-5" /> {error}</div>}
              {success && <div className="bg-green-50 text-green-600 p-4 rounded-lg flex gap-2"><CheckCircle2 className="w-5 h-5" /> {success}</div>}
              <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Domain Interest</label>
                    <input type="text" name="domain" value={formData.domain} onChange={handleInputChange} placeholder="e.g. Frontend Architecture" required className="w-full bg-[#F7F5F2] border-b-2 border-gray-200 px-4 py-4 text-lg font-bold text-[#1E1E1E] focus:outline-none focus:border-[#0061FE] transition-colors" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Skills</label>
                        <textarea name="skillsToDevelop" value={formData.skillsToDevelop} onChange={handleInputChange} placeholder="React, Three.js..." required rows="3" className="w-full bg-[#F7F5F2] border-2 border-transparent focus:border-[#0061FE] px-4 py-3 rounded-xl text-sm font-medium resize-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Key Topics</label>
                        <textarea name="topicsInterested" value={formData.topicsInterested} onChange={handleInputChange} placeholder="Performance, A11y..." required rows="3" className="w-full bg-[#F7F5F2] border-2 border-transparent focus:border-[#0061FE] px-4 py-3 rounded-xl text-sm font-medium resize-none" />
                    </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your "Why"</label>
                  <textarea name="reasonForMentorship" value={formData.reasonForMentorship} onChange={handleInputChange} placeholder="What is your main blocker right now?" required rows="3" className="w-full bg-white border-2 border-gray-200 px-4 py-3 rounded-xl text-[#1E1E1E] font-medium focus:outline-none focus:border-[#0061FE] transition-all" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Previous Work</label>
                   <textarea name="previousProjects" value={formData.previousProjects} onChange={handleInputChange} placeholder="Link or describe past projects..." required rows="2" className="w-full bg-white border-2 border-gray-200 px-4 py-3 rounded-xl text-[#1E1E1E] font-medium focus:outline-none focus:border-[#0061FE] transition-all" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#1E1E1E] text-white font-bold py-5 rounded-xl hover:bg-[#0061FE] transition-all transform hover:-translate-y-1 shadow-lg disabled:opacity-50 flex justify-center items-center gap-3">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Submit Application <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
};

export default UserMentorshipForm;