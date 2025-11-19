// src/admin/AdminScannerMeetup.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, QrCode, Check, X, AlertCircle, ScanLine, ArrowRight } from "lucide-react";

export default function AdminScannerMeetup() {
  const { meetupId } = useParams();
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  
  // Ref to track the auto-restart timer so we can cancel it if button is clicked
  const timeoutRef = useRef(null);
  
  const [scanning, setScanning] = useState(false);
  const [title, setTitle] = useState("Loading...");
  const [result, setResult] = useState(null);

  // --- LOGIC SECTION ---
  useEffect(() => {
    supabase
      .from("meetup")
      .select("title")
      .eq("id", meetupId)
      .single()
      .then(({ data }) => data && setTitle(data.title || "Event"));
  }, [meetupId]);

  const startScanner = async () => {
    setScanning(true);
    setResult(null);

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 12, qrbox: { width: 280, height: 280 } },
        async (text) => await handleScan(text.trim()),
        () => {}
      );
    } catch (err) {
      toast.error("Camera access denied");
      setScanning(false);
    }
  };

  // Helper to restart scanner (used by both Timer and Button)
  const resumeScanning = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setResult(null);
    scannerRef.current?.start(
      { facingMode: "environment" }, 
      { fps: 12, qrbox: 280 }, 
      handleScan, 
      () => {}
    );
  };

  // FIX: Helper to trigger result AND schedule the next scan
  const finishScan = (resultObj) => {
    setResult(resultObj);
    // Always schedule the next scan, regardless of result type
    timeoutRef.current = setTimeout(resumeScanning, 2200);
  };

  const handleScan = async (code) => {
    if (!code) return;
    scannerRef.current?.stop(); // Pause camera immediately

    let name = "User";

    try {
      // 1. Check if using Old Token (tok-...)
      if (code.startsWith("tok-")) {
        const { data: reg } = await supabase
          .from("registrations")
          .select("user_name, user_id, is_checked_in")
          .eq("meetup_id", meetupId)
          .eq("token", code)
          .single();

        if (!reg) {
          finishScan({ name: "Not registered", type: "error" });
          return;
        }

        if (reg.is_checked_in) {
          finishScan({ name: reg.user_name || "User", type: "already" });
          return;
        }

        name = reg.user_name || "User";
        if (reg.user_id) {
          const { data: u } = await supabase
            .from("users")
            .select("display_name")
            .eq("uid", reg.user_id)
            .single()
            .catch(() => ({ data: null }));
          if (u?.display_name) name = u.display_name;
        }

        await supabase
          .from("registrations")
          .update({ is_checked_in: true, checked_in_at: new Date().toISOString() })
          .eq("meetup_id", meetupId)
          .eq("token", code);

        finishScan({ name: name, type: "success" });
      } 
      // 2. Check if using New UID Flow
      else {
        const { data: user } = await supabase
          .from("users")
          .select("display_name, username")
          .eq("uid", code)
          .single()
          .catch(() => ({ data: null }));

        if (!user) {
          finishScan({ name: "User not found", type: "error" });
          return;
        }

        name = user.display_name || user.username || "User";

        const { data: reg } = await supabase
          .from("registrations")
          .select("id, is_checked_in")
          .eq("meetup_id", meetupId)
          .eq("user_id", code)
          .single()
          .catch(() => ({ data: null }));

        if (!reg) {
          finishScan({ name: "Not registered", type: "error" });
          return;
        }

        if (reg.is_checked_in) {
          finishScan({ name: name, type: "already" });
          return;
        }

        await supabase
          .from("registrations")
          .update({ is_checked_in: true, checked_in_at: new Date().toISOString() })
          .eq("id", reg.id);

        finishScan({ name: name, type: "success" });
      }
    } catch (e) {
      finishScan({ name: "Scan failed", type: "error" });
    }
  };

  useEffect(() => {
    return () => {
      scannerRef.current?.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // --- UI SECTION ---
  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      
      <div className="fixed inset-0 bg-zinc-950 text-white overflow-hidden flex flex-col">
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-6 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between max-w-md mx-auto w-full">
            <button 
              onClick={() => navigate(-1)} 
              className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-bold tracking-tight">Scanner</h1>
              <p className="text-xs text-white/60 truncate max-w-[150px]">{title}</p>
            </div>
            <div className="w-11" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative bg-black">
          
          <div id="reader" className="absolute inset-0 w-full h-full object-cover [&>video]:object-cover [&>video]:h-full [&>video]:w-full" />

          {/* Active Scanning UI */}
          {scanning && !result && (
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
              <div className="absolute inset-0 border-[100vmax] border-black/60 box-border pointer-events-none transition-all duration-500" />
              
              <div className="relative w-72 h-72 z-20">
                <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-emerald-500 rounded-tl-2xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-emerald-500 rounded-tr-2xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-emerald-500 rounded-bl-2xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-emerald-500 rounded-br-2xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-scan-laser opacity-80" />
              </div>

              <p className="absolute bottom-24 text-white/80 text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm z-20">
                Align QR code within frame
              </p>
            </div>
          )}

          {/* Start Screen */}
          {!scanning && (
            <div className="absolute inset-0 z-20 bg-zinc-900 flex flex-col items-center justify-center p-6">
              <div className="w-full max-w-md space-y-8 text-center">
                <div className="relative mx-auto w-32 h-32">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                  <div className="relative bg-zinc-800 border border-zinc-700 rounded-3xl w-full h-full flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-white" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Ready to Check In</h2>
                  <p className="text-zinc-400">Scan attendee tickets or user IDs</p>
                </div>

                <button
                  onClick={startScanner}
                  className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg shadow-xl hover:bg-emerald-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ScanLine className="w-5 h-5" />
                  Tap to Scan
                </button>
              </div>
            </div>
          )}

          {/* Result Modal */}
          {result && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
              <div 
                className={`w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-8 pb-6 text-center shadow-2xl transform transition-all animate-pop-up
                  ${result.type === 'success' ? 'shadow-[0_0_50px_rgba(16,185,129,0.2)]' : ''}
                  ${result.type === 'error' ? 'shadow-[0_0_50px_rgba(239,68,68,0.2)]' : ''}
                `}
              >
                {/* Icon */}
                <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6
                  ${result.type === "success" ? "bg-emerald-500/20 text-emerald-400" : 
                    result.type === "already" ? "bg-amber-500/20 text-amber-400" : 
                    "bg-red-500/20 text-red-400"}`}
                >
                  {result.type === "success" && <Check className="w-10 h-10" strokeWidth={3} />}
                  {result.type === "already" && <AlertCircle className="w-10 h-10" strokeWidth={3} />}
                  {result.type === "error" && <X className="w-10 h-10" strokeWidth={3} />}
                </div>

                {/* Text */}
                <h2 className={`text-3xl font-black mb-2 tracking-tight
                   ${result.type === "success" ? "text-emerald-400" : 
                     result.type === "already" ? "text-amber-400" : 
                     "text-red-400"}`}
                >
                  {result.type === "success" ? "Checked In!" : 
                   result.type === "already" ? "Already In" : 
                   "Error"}
                </h2>
                
                <p className="text-2xl text-white font-semibold break-words leading-tight mb-6">
                  {result.name}
                </p>
                
                {/* Auto Progress */}
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-white/20 w-full animate-progress-shrink origin-left" />
                </div>

                {/* Immediate Scan Button */}
                <button 
                  onClick={resumeScanning}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 rounded-xl font-medium text-white transition-colors flex items-center justify-center gap-2"
                >
                  Scan Next <ArrowRight className="w-4 h-4 opacity-60" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        @keyframes scan-laser {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-laser { animation: scan-laser 2s ease-in-out infinite; }
        
        @keyframes pop-up {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop-up { animation: pop-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }

        @keyframes progress-shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        .animate-progress-shrink { animation: progress-shrink 2.2s linear forwards; }
      `}</style>
    </>
  );
}