import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown, Loader2, X, ArrowRight, Sparkles, Terminal, Code2 } from 'lucide-react';

// --- SVG DOODLES (Doorway Scene) ---
const DoorwayScene = () => (
  <svg width="300" height="300" viewBox="0 0 300 300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}>
      {/* Door Frame */}
      <rect x="120" y="40" width="100" height="200" />
      {/* Window Panes */}
      <rect x="135" y="55" width="30" height="40" />
      <rect x="175" y="55" width="30" height="40" />
      <rect x="135" y="110" width="30" height="40" />
      <rect x="175" y="110" width="30" height="40" />
      {/* Knob */}
      <circle cx="205" cy="150" r="3" fill="currentColor" />

      {/* Coat Rack */}
      <line x1="60" y1="80" x2="100" y2="80" />
      <line x1="80" y1="80" x2="80" y2="240" />
      <path d="M60,240 L100,240" />

      {/* Hanging Coat */}
      <path d="M80,90 Q60,120 65,180 L95,180 Q100,120 80,90" />

      {/* Mail/Papers on floor */}
      <path d="M130,240 L150,230 L170,240 L150,250 Z" />
      <path d="M160,245 L180,235 L200,245 L180,255 Z" />
    </motion.g>

    {/* Dog - Animated */}
    <motion.g
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 1 }}
    >
      <path d="M100,240 Q100,210 120,200 Q140,190 150,210 Q160,230 150,240 L100,240 Z" fill="#C2E812" stroke="none" />
      <path d="M100,240 Q100,210 120,200 Q140,190 150,210 Q160,230 150,240 L100,240 Z" stroke="#C2E812" />
      <circle cx="115" cy="215" r="2" fill="black" />
      <path d="M100,240 L90,230" stroke="#C2E812" strokeWidth="3" /> {/* Tail */}
    </motion.g>
  </svg>
);

const UserMentorshipFormList = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user's mentorship submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setAuthChecking(true);
        setLoading(true);
        setError(null);

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('mentorship_request')
          .eq('uid', user.id)
          .single();

        if (userError) {
          setError(userError.message);
          return;
        }

        if (!userData || !userData.mentorship_request) {
          setSubmissions([]);
          return;
        }

        let parsedRequests = [];
        try {
          if (Array.isArray(userData.mentorship_request)) {
            parsedRequests = userData.mentorship_request;
          } else if (typeof userData.mentorship_request === 'string') {
            parsedRequests = JSON.parse(userData.mentorship_request);
          }
        } catch (parseError) {
          setError('Failed to parse mentorship requests.');
          return;
        }

        parsedRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setSubmissions(parsedRequests);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setAuthChecking(false);
      }
    };

    fetchSubmissions();
  }, []);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#C2E812]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-3xl font-black mb-4">Join the Collective</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to view your mentorship journey.</p>
          <button onClick={() => (window.location.href = '/login')} className="px-8 py-3 bg-[#0061FE] text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#C2E812] selection:text-black">

      {/* --- HERO SECTION --- */}
      <div className="bg-[#1E1E1E] text-white min-h-[80vh] flex flex-col justify-center relative overflow-hidden px-6 pt-20">
        {/* Doodles Positioned */}
        <div className="absolute top-1/4 right-[10%] md:right-[20%] opacity-90 transform scale-125">
          <DoorwayScene />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block bg-white text-[#1E1E1E] px-4 py-1 font-mono text-sm font-bold mb-6 transform -rotate-2">
                  // YOUR JOURNEY
            </div>
            <h1 className="text-[15vw] md:text-[12rem] font-black leading-[0.8] tracking-tighter">
              Mentor<br />ship
            </h1>
          </motion.div>
        </div>

        {/* Horizontal Line */}
        <div className="absolute bottom-32 left-0 w-full h-px bg-white/20"></div>
      </div>

      {/* --- SPLIT CONTENT SECTION --- */}
      <div className="flex flex-col md:flex-row min-h-[80vh]">
        {/* Left: Image */}
        <div className="w-full md:w-1/2 relative min-h-[50vh] md:min-h-auto">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
            alt="Mentorship collaboration"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0061FE]/10 mix-blend-multiply"></div>
        </div>

        {/* Right: Text Content */}
        <div className="w-full md:w-1/2 bg-white p-12 md:p-24 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-[#1E1E1E] leading-tight mb-8">
              Mentorship brings your <span className="text-[#0061FE]">coding journey</span> to life across projects and challenges.
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              Connect with experienced developers, get code reviews, and level up your skills. Track your requests and progress right here.
            </p>

            <a href="/mentorship-form" className="inline-flex items-center gap-3 text-xl font-bold text-[#1E1E1E] hover:text-[#0061FE] transition-colors group">
              Start a new request <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* --- SUBMISSIONS LIST --- */}
      <div className="bg-[#F7F5F2] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-black text-[#1E1E1E]">Your Requests</h3>
            <div className="bg-[#1E1E1E] text-white px-3 py-1 rounded-full text-sm font-bold">
              {submissions.length} Total
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="bg-white border-[3px] border-dashed border-[#1E1E1E]/20 rounded-[2rem] p-16 text-center">
              <Sparkles className="w-16 h-16 text-[#C2E812] mx-auto mb-6" />
              <h4 className="text-2xl font-bold text-[#1E1E1E] mb-2">No requests yet</h4>
              <p className="text-gray-500 mb-8">Ready to start learning? Submit your first mentorship request.</p>
              <a href="/mentorship-form" className="bg-[#1E1E1E] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0061FE] transition-colors">
                Get Started
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((submission, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-[1.5rem] border-2 border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E] overflow-hidden group"
                >
                  <div
                    className="p-8 cursor-pointer flex flex-col md:flex-row gap-6 md:items-center justify-between"
                    onClick={() => toggleExpand(index)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-[#C2E812] text-[#1E1E1E] px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest">
                          Request #{submissions.length - index}
                        </span>
                        <span className="text-gray-500 font-mono text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> {formatDate(submission.created_at)}
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold text-[#1E1E1E] mb-2 group-hover:text-[#0061FE] transition-colors">
                        {submission.domain || 'General Mentorship'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {submission.skillsToDevelop?.slice(0, 3).map((skill, i) => (
                          <span key={i} className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                        {submission.skillsToDevelop?.length > 3 && (
                          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            +{submission.skillsToDevelop.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full border-2 border-[#1E1E1E] flex items-center justify-center transition-transform duration-300 ${expandedIndex === index ? 'rotate-180 bg-[#1E1E1E] text-white' : 'bg-white text-[#1E1E1E]'}`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <motion.div
                    initial={false}
                    animate={{ height: expandedIndex === index ? 'auto' : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-8 pt-0 border-t-2 border-dashed border-[#1E1E1E]/10 bg-gray-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                        <div>
                          <h5 className="font-black text-sm uppercase tracking-widest text-gray-400 mb-4">Details</h5>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-bold text-[#1E1E1E]">Topics Interested</label>
                              <p className="text-gray-600 mt-1">{submission.topicsInterested?.join(', ') || 'None specified'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-bold text-[#1E1E1E]">Expectations</label>
                              <p className="text-gray-600 mt-1">{submission.expectations || 'None specified'}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-black text-sm uppercase tracking-widest text-gray-400 mb-4">Background</h5>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-bold text-[#1E1E1E]">Previous Projects</label>
                              <p className="text-gray-600 mt-1">{submission.previousProjects || 'None specified'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-bold text-[#1E1E1E]">Reason for Mentorship</label>
                              <p className="text-gray-600 mt-1">{submission.reasonForMentorship || 'None specified'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMentorshipFormList;