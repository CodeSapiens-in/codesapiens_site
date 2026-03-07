import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import { User, FileText, Upload, Search, Loader2, AlertCircle, CheckCircle2, BrainCircuit, ArrowRight, Zap, Star } from 'lucide-react';
import { useUser } from '@supabase/auth-helpers-react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from '../lib/authFetch';
import { BACKEND_URL } from '../config';

// ─────────────────────────────────────────────
//  SPACE THEME TOKENS
//  bg-deep:       #03040A  (void black)
//  bg-card:       #080B14  (deep space navy)
//  border:        #1A2240  (nebula rim)
//  primary:       #4F8EF7  (starlight blue)
//  accent:        #9B6DFF  (nebula violet)
//  glow-teal:     #0FE8B4  (pulsar teal)
//  text-body:     #C8D6F0  (moonlit silver)
//  text-muted:    #4A5F80
// ─────────────────────────────────────────────

// ── Animated star-field background ──────────────────────────────────────────
const AnalyzerBackground = React.memo(() => {
    const stars = Array.from({ length: 90 }, (_, i) => ({
        id: i,
        x: (i * 137.508) % 100,
        y: (i * 97.3) % 100,
        r: i % 5 === 0 ? 1.8 : i % 3 === 0 ? 1.2 : 0.7,
        delay: (i * 0.23) % 4,
        dur: 2.5 + (i % 3),
    }));

    const shoots = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        top: 8 + i * 13,
        delay: i * 2.8,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Void gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#03040A] via-[#05091A] to-[#03040A]" />

            {/* Nebula atmosphere blobs */}
            <div className="absolute top-[-10%] left-[-5%] w-[55%] h-[55%] rounded-full bg-[#4F8EF7] opacity-[0.04] blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#9B6DFF] opacity-[0.05] blur-[130px]" />
            <div className="absolute top-[45%] left-[40%] w-[30%] h-[30%] rounded-full bg-[#0FE8B4] opacity-[0.025] blur-[100px]" />

            {/* SVG: stars + shooting stars + constellation */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {stars.map(s => (
                    <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity="0">
                        <animate
                            attributeName="opacity"
                            values={`0;${0.35 + s.r * 0.15};0`}
                            dur={`${s.dur}s`}
                            begin={`${s.delay}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                ))}

                {shoots.map(s => (
                    <line key={s.id} x1="-5%" y1={`${s.top}%`} x2="0%" y2={`${s.top}%`} stroke="white" strokeWidth="1" opacity="0">
                        <animate attributeName="x1" values="-5%;110%" dur="2.2s" begin={`${s.delay}s`} repeatCount="indefinite" />
                        <animate attributeName="x2" values="0%;116%" dur="2.2s" begin={`${s.delay}s`} repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0;0.7;0" dur="2.2s" begin={`${s.delay}s`} repeatCount="indefinite" />
                    </line>
                ))}

                <polyline points="10%,20% 25%,35% 40%,22% 55%,38%" fill="none" stroke="#4F8EF7" strokeWidth="0.4" opacity="0.1" strokeDasharray="4 6" />
                <polyline points="62%,65% 74%,54% 86%,70% 96%,57%" fill="none" stroke="#9B6DFF" strokeWidth="0.4" opacity="0.1" strokeDasharray="4 6" />
            </svg>

            {/* Floating icons */}
            <motion.div className="absolute top-[22%] left-[7%] opacity-[0.06]" animate={{ y: [0, -18, 0], rotate: [0, 5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
                <BrainCircuit className="w-28 h-28 text-[#4F8EF7]" />
            </motion.div>
            <motion.div className="absolute bottom-[22%] right-[7%] opacity-[0.06]" animate={{ y: [0, 22, 0], rotate: [0, -8, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}>
                <FileText className="w-20 h-20 text-[#9B6DFF]" />
            </motion.div>
            <motion.div className="absolute top-[55%] left-[4%] opacity-[0.05]" animate={{ y: [0, 14, 0], opacity: [0.05, 0.12, 0.05] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}>
                <Zap className="w-20 h-20 text-[#0FE8B4]" />
            </motion.div>
        </div>
    );
});

// ── Reusable glassmorphic card ───────────────────────────────────────────────
const SpaceCard = ({ children, className = '', shimmer = true }) => (
    <div className={`relative bg-[#080B14]/80 backdrop-blur-xl rounded-2xl border border-[#1A2240] shadow-[0_4px_32px_rgba(79,142,247,0.06)] overflow-hidden ${className}`}>
        {shimmer && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4F8EF7]/40 to-transparent" />}
        {children}
    </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const ResumeAnalyzer = () => {
    const user = useUser();
    const navigate = useNavigate();
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeUrl, setResumeUrl] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [parsingStatus, setParsingStatus] = useState('');
    const [profileResumeUrl, setProfileResumeUrl] = useState(null);
    const [useProfileResume, setUseProfileResume] = useState(false);
    const [analysisMode, setAnalysisMode] = useState('jd');

    useEffect(() => {
        const fetchProfileResume = async () => {
            if (!user) return;
            try {
                const { data } = await supabase.from('users').select('resume_url').eq('uid', user.id).single();
                if (data?.resume_url) setProfileResumeUrl(data.resume_url);
            } catch (err) { console.error('Error fetching profile resume:', err); }
        };
        fetchProfileResume();
    }, [user]);

    pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                setResumeFile(file); setResumeUrl(URL.createObjectURL(file));
                setAnalysisResult(null); setError(null);
            } else { setError('Please upload a PDF or an image file.'); }
        }
    };

    const extractTextFromPdf = async (url) => {
        let worker = null;
        try {
            setParsingStatus('Initializing OCR worker...');
            worker = await Tesseract.createWorker('eng', 1, { logger: m => console.log(m) });
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            const maxPages = Math.min(pdf.numPages, 5);
            for (let i = 1; i <= maxPages; i++) {
                setParsingStatus(`Processing page ${i} of ${pdf.numPages}...`);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height; canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;
                const { data: { text } } = await worker.recognize(canvas.toDataURL('image/png'));
                fullText += text + '\n';
            }
            await worker.terminate();
            return fullText;
        } catch (err) {
            if (worker) await worker.terminate();
            throw new Error(`Failed to extract text from PDF: ${err.message}`);
        }
    };

    const extractTextFromImage = async (url) => {
        try {
            setParsingStatus('Processing image...');
            const { data: { text } } = await Tesseract.recognize(url, 'eng', { logger: m => console.log(m) });
            return text;
        } catch (err) { throw new Error('Failed to extract text from image.'); }
    };

    const handleAnalyze = async () => {
        if (!resumeFile && !useProfileResume) { setError('Please provide a resume.'); return; }
        if (analysisMode === 'jd' && !jobDescription.trim()) { setError('Please provide a job description for JD Match mode.'); return; }
        setLoading(true); setError(null); setAnalysisResult(null);
        try {
            let resumeText = '';
            if (useProfileResume) {
                const isImage = /\.(png|jpg|jpeg)$/i.test(resumeUrl);
                resumeText = isImage ? await extractTextFromImage(resumeUrl) : await extractTextFromPdf(resumeUrl);
            } else if (resumeFile) {
                resumeText = resumeFile.type === 'application/pdf' ? await extractTextFromPdf(resumeUrl) : await extractTextFromImage(resumeUrl);
            }
            setParsingStatus('Analyzing with AI...');
            const response = await authFetch(`${BACKEND_URL}/api/analyze-resume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText, jobDescription: analysisMode === 'jd' ? jobDescription : null, mode: analysisMode }),
            });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            const result = await response.json();
            if (!result.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error('AI returned an empty response.');
            const generatedText = result.candidates[0].content.parts[0].text;
            const match = generatedText.match(/```(?:json)?\s*([\s\S]*?)```/);
            const cleanText = match?.[1]?.trim() ?? generatedText.substring(generatedText.indexOf('{'), generatedText.lastIndexOf('}') + 1);
            setAnalysisResult(JSON.parse(cleanText));
        } catch (err) {
            setError(err.message || 'Something went wrong during analysis.');
        } finally { setLoading(false); setParsingStatus(''); }
    };

    return (
        <div className="min-h-screen bg-[#03040A] pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
            <AnalyzerBackground />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* ── Page header ── */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#4F8EF7]/25 bg-[#4F8EF7]/8 mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7] animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4F8EF7]">AI-Powered</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4 leading-none">
                        Resume{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8EF7] via-[#9B6DFF] to-[#0FE8B4]">
                            Analyzer
                        </span>
                    </h1>
                    <p className="text-lg text-[#7A90B8] max-w-xl mx-auto font-medium">
                        Optimize your CV with AI. Beat the ATS. Get hired.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">

                    {/* ════ LEFT: Controls ════ */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="space-y-5">

                        {/* Mode toggle */}
                        <SpaceCard className="p-1.5">
                            <div className="flex">
                                {[{ id: 'jd', label: 'JD Match' }, { id: 'general', label: 'General Review' }].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setAnalysisMode(mode.id)}
                                        className={`flex-1 relative py-3 text-xs font-bold uppercase tracking-[0.15em] rounded-xl transition-colors duration-200 z-10 ${analysisMode === mode.id ? 'text-white' : 'text-[#4A5F80] hover:text-[#C8D6F0]'}`}
                                    >
                                        {analysisMode === mode.id && (
                                            <motion.div
                                                layoutId="space-mode-bubble"
                                                className={`absolute inset-0 rounded-xl -z-10 ${mode.id === 'jd' ? 'bg-gradient-to-r from-[#1B2E6B] to-[#0E1A45] border border-[#4F8EF7]/40 shadow-[0_0_16px_rgba(79,142,247,0.2)]' : 'bg-gradient-to-r from-[#2A1660] to-[#160B38] border border-[#9B6DFF]/40 shadow-[0_0_16px_rgba(155,109,255,0.2)]'}`}
                                                transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}
                                            />
                                        )}
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                        </SpaceCard>

                        {/* Upload card */}
                        <SpaceCard className="p-7">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0FE8B4]/20 to-[#4F8EF7]/20 border border-[#0FE8B4]/30 flex items-center justify-center shadow-[0_0_12px_rgba(15,232,180,0.12)]">
                                    <Upload className="w-5 h-5 text-[#0FE8B4]" />
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Upload Resume</h3>
                            </div>

                            {/* Drop zone */}
                            <div className="border border-dashed border-[#1A2A50] hover:border-[#4F8EF7]/60 rounded-2xl p-8 text-center hover:bg-[#4F8EF7]/5 transition-all cursor-pointer group relative overflow-hidden">
                                {/* Corner brackets */}
                                <span className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-[#4F8EF7]/40 rounded-tl-sm" />
                                <span className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-[#4F8EF7]/40 rounded-tr-sm" />
                                <span className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-[#4F8EF7]/40 rounded-bl-sm" />
                                <span className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-[#4F8EF7]/40 rounded-br-sm" />

                                <input type="file" id="resume-upload" className="hidden" accept=".pdf,image/*" onChange={(e) => { setUseProfileResume(false); handleFileChange(e); }} />
                                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center w-full h-full">
                                    <div className="w-14 h-14 bg-[#04060F] rounded-full flex items-center justify-center mb-4 border border-[#1A2240] group-hover:scale-110 transition-transform shadow-[0_0_18px_rgba(79,142,247,0.1)]">
                                        <FileText className="w-7 h-7 text-[#4F8EF7]" />
                                    </div>
                                    <span className="text-base font-bold text-[#C8D6F0] mb-1">Click to upload PDF or Image</span>
                                    <span className="text-sm text-[#3D5075] font-medium">Supports formatted resumes</span>
                                </label>
                            </div>

                            {/* OR divider */}
                            <div className="relative flex items-center justify-center my-5">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#111B30]" /></div>
                                <span className="relative z-10 bg-[#080B14] px-3 text-[10px] font-bold text-[#2A3D60] uppercase tracking-[0.2em]">OR</span>
                            </div>

                            {/* Profile resume button */}
                            <button
                                onClick={() => {
                                    if (profileResumeUrl) {
                                        setUseProfileResume(true); setResumeFile(null);
                                        setResumeUrl(profileResumeUrl); setAnalysisResult(null); setError(null);
                                        toast.success('Using profile resume!');
                                    } else { toast.error('No resume found in profile'); }
                                }}
                                className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 border ${useProfileResume
                                    ? 'border-[#4F8EF7]/60 bg-[#4F8EF7]/10 text-[#4F8EF7] shadow-[0_0_14px_rgba(79,142,247,0.15)]'
                                    : 'border-[#1A2240] text-[#4A5F80] hover:border-[#4F8EF7]/30 hover:text-[#C8D6F0]'
                                }`}
                            >
                                <User className="w-4 h-4" />
                                {useProfileResume ? 'Using Profile Resume' : 'Use Profile Resume'}
                            </button>

                            {resumeFile && !useProfileResume && (
                                <div className="mt-4 flex items-center gap-3 text-sm font-bold text-[#0FE8B4] bg-[#0FE8B4]/8 p-3.5 rounded-xl border border-[#0FE8B4]/20">
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{resumeFile.name}</span>
                                </div>
                            )}
                        </SpaceCard>

                        {/* JD input */}
                        <AnimatePresence>
                            {analysisMode === 'jd' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <SpaceCard className="p-7">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9B6DFF]/20 to-[#4F8EF7]/20 border border-[#9B6DFF]/30 flex items-center justify-center shadow-[0_0_12px_rgba(155,109,255,0.12)]">
                                                <Zap className="w-5 h-5 text-[#9B6DFF]" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white tracking-tight">Job Description</h3>
                                        </div>
                                        <textarea
                                            className="w-full h-56 p-5 bg-[#04060F] border border-[#1A2240] rounded-xl focus:border-[#4F8EF7]/60 focus:ring-2 focus:ring-[#4F8EF7]/10 text-sm font-medium text-[#C8D6F0] resize-none outline-none transition-all placeholder:text-[#2A3D60]"
                                            placeholder="Paste the job description here to compare..."
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                        />
                                    </SpaceCard>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Analyze button */}
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl text-white font-black text-base uppercase tracking-[0.15em] transition-all ${loading
                                ? 'bg-[#0C1020] border border-[#1A2240] text-[#3D5075] cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#1B3A8C] via-[#2047B0] to-[#1B3A8C] hover:from-[#2047B0] hover:via-[#3060D0] hover:to-[#2047B0] border border-[#4F8EF7]/40 shadow-[0_4px_24px_rgba(79,142,247,0.25)] hover:shadow-[0_6px_32px_rgba(79,142,247,0.4)] hover:-translate-y-0.5 active:translate-y-0'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <Loader2 className="w-5 h-5 animate-spin text-[#4F8EF7]" />
                                    <span className="text-[#4F8EF7]">{parsingStatus || 'Crunching Data...'}</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    <BrainCircuit className="w-5 h-5" />
                                    {analysisMode === 'jd' ? 'Analyze Match' : 'Get Feedback'}
                                </div>
                            )}
                        </button>

                        {error && (
                            <div className="p-4 bg-red-950/40 text-red-400 rounded-xl border border-red-500/20 font-bold flex items-center gap-3 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                    </motion.div>

                    {/* ════ RIGHT: Results ════ */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.25 }} className="h-full">
                        {analysisResult ? (
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="sticky top-8">
                                <SpaceCard>
                                    {/* Score header */}
                                    <div className="relative p-10 text-center overflow-hidden bg-gradient-to-b from-[#0A0F20] to-[#080B14]">
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-64 h-64 rounded-full bg-[#4F8EF7] opacity-[0.05] blur-[70px]" />
                                        </div>

                                        {/* Score ring */}
                                        <div className="relative inline-flex items-center justify-center w-40 h-40 rounded-full border-2 border-[#4F8EF7]/50 bg-[#04060F] mb-6 shadow-[0_0_32px_rgba(79,142,247,0.18),inset_0_0_20px_rgba(79,142,247,0.05)]">
                                            <div className="absolute inset-[-6px] rounded-full border border-[#9B6DFF]/20 border-dashed animate-spin" style={{ animationDuration: '22s' }} />
                                            <span className="text-5xl font-black text-white">{analysisResult.matchPercentage}%</span>
                                            <span className={`absolute -bottom-4 px-4 py-1 rounded-lg font-black tracking-[0.18em] text-[10px] border ${
                                                analysisMode === 'jd'
                                                    ? 'bg-[#0FE8B4]/15 text-[#0FE8B4] border-[#0FE8B4]/30'
                                                    : 'bg-[#4F8EF7]/15 text-[#4F8EF7] border-[#4F8EF7]/30'
                                            }`}>
                                                {analysisMode === 'jd' ? 'MATCH' : 'SCORE'}
                                            </span>
                                        </div>

                                        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Analysis Complete</h2>
                                        <p className="text-[#7A90B8] text-sm font-medium leading-relaxed max-w-sm mx-auto">{analysisResult.summary}</p>
                                    </div>

                                    {/* Result panels */}
                                    <div className="p-7 space-y-4">
                                        <div className="p-5 rounded-2xl bg-[#071610] border border-[#0FE8B4]/20">
                                            <h3 className="text-sm font-bold text-[#0FE8B4] mb-3 flex items-center gap-2 uppercase tracking-wider">
                                                <CheckCircle2 className="w-4 h-4" /> Key Strengths
                                            </h3>
                                            <div className="prose prose-sm max-w-none text-[#8EBAAA]">
                                                <ReactMarkdown>{analysisResult.strengths}</ReactMarkdown>
                                            </div>
                                        </div>

                                        <div className="p-5 rounded-2xl bg-[#160810] border border-[#FF6B8A]/20">
                                            <h3 className="text-sm font-bold text-[#FF6B8A] mb-3 flex items-center gap-2 uppercase tracking-wider">
                                                <AlertCircle className="w-4 h-4" /> Areas for Improvement
                                            </h3>
                                            <div className="prose prose-sm max-w-none text-[#B89099]">
                                                <ReactMarkdown>{analysisResult.weaknesses}</ReactMarkdown>
                                            </div>
                                        </div>

                                        <div className="p-5 rounded-2xl bg-[#070F18] border border-[#4F8EF7]/20">
                                            <h3 className="text-sm font-bold text-[#4F8EF7] mb-3 flex items-center gap-2 uppercase tracking-wider">
                                                <ArrowRight className="w-4 h-4" /> Action Plan
                                            </h3>
                                            <div className="prose prose-sm max-w-none text-[#8899B8]">
                                                <ReactMarkdown>{analysisResult.improvements}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                </SpaceCard>
                            </motion.div>
                        ) : (
                            /* Empty state */
                            <SpaceCard className="h-full min-h-[580px] flex flex-col items-center justify-center text-center p-12 border-dashed" shimmer={false}>
                                <div className="relative mb-8">
                                    <div className="w-28 h-28 rounded-full bg-[#04060F] border border-[#1A2240] flex items-center justify-center shadow-[0_0_40px_rgba(79,142,247,0.05)]">
                                        <BrainCircuit className="w-14 h-14 text-[#1A2A50]" />
                                    </div>
                                    <div className="absolute inset-[-10px] rounded-full border border-[#4F8EF7]/10 border-dashed animate-spin" style={{ animationDuration: '20s' }} />
                                    <div className="absolute inset-[-22px] rounded-full border border-[#9B6DFF]/07 border-dashed animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#2A3D60] mb-3 tracking-tight">Ready when you are</h3>
                                <p className="text-[#1E2E48] font-medium max-w-xs leading-relaxed">
                                    Upload your resume and get instant, AI-powered career feedback.
                                </p>
                            </SpaceCard>
                        )}
                    </motion.div>
                </div>
            </div>

            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#080B14',
                        color: '#C8D6F0',
                        border: '1px solid #1A2240',
                        fontWeight: 700,
                        fontSize: '13px',
                    },
                }}
            />
        </div>
    );
};

export default ResumeAnalyzer;
