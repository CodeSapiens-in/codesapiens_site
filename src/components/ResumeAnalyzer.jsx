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

// Doodles removed


// Background Animation Component - Memoized to prevent re-renders
const AnalyzerBackground = React.memo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Vivid Layer - Falling Blocks (High Opacity) */}
        <div className="absolute inset-0 opacity-100">
            {/* Falling Orange Blocks ("Box Game" Style) */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={`block-${i}`}
                    className="absolute bg-[#FF3E00]"
                    style={{
                        width: i % 3 === 0 ? '12px' : '20px',
                        height: i % 3 === 0 ? '12px' : '20px', // Square shapes
                        left: `${5 + i * 7}%`,
                        top: -50,
                        opacity: 1, // Maximum brightness (fully opaque)
                        boxShadow: '0 0 15px rgba(255, 62, 0, 0.8)' // Strong neon glow
                    }}
                    animate={{
                        y: ['0vh', '110vh'],
                        rotate: i % 2 === 0 ? [0, 180] : [0, -180]
                    }}
                    transition={{
                        duration: 7 + Math.random() * 8, // Slightly faster for more energy
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.5,
                        repeatDelay: 0
                    }}
                />
            ))}

            {/* Small "Pixel" Chunks */}
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={`pixel-${i}`}
                    className="absolute bg-[#FF3E00]"
                    style={{
                        width: '8px',
                        height: '8px',
                        right: `${8 + i * 10}%`,
                        top: -50,
                        opacity: 1, // Maximum brightness
                        boxShadow: '0 0 10px rgba(255, 62, 0, 0.6)'
                    }}
                    animate={{
                        y: ['0vh', '110vh'],
                    }}
                    transition={{
                        duration: 10 + Math.random() * 6,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 1.5,
                    }}
                />
            ))}
        </div>

        {/* Subtle Layer - Icons & patterns (Low Opacity) */}
        <div className="absolute inset-0 opacity-10">
            {/* Floating Document Icon 1 */}
            <motion.div
                className="absolute top-1/4 left-[10%]"
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <FileText className="w-24 h-24 text-[#1E1E1E]" />
            </motion.div>

            {/* Floating Search Icon */}
            <motion.div
                className="absolute top-[15%] right-[35%]"
                animate={{
                    y: [0, -15, 0],
                    x: [0, 10, 0],
                    rotate: [0, -5, 0],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            >
                <Search className="w-20 h-20 text-[#0061FE]/20" />
            </motion.div>

            {/* Floating Star Icon */}
            <motion.div
                className="absolute bottom-[20%] right-[10%]"
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 15, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            >
                <Star className="w-16 h-16 text-[#FF5018]/20" />
            </motion.div>

            {/* Floating Zap Icon */}
            <motion.div
                className="absolute top-[60%] left-[5%]"
                animate={{
                    y: [0, 20, 0],
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                }}
            >
                <Zap className="w-24 h-24 text-[#C2E812]/30" />
            </motion.div>

            {/* Floating Brain Icon */}
            <motion.div
                className="absolute top-1/3 right-[15%]"
                animate={{
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <BrainCircuit className="w-32 h-32 text-[#0061FE]" />
            </motion.div>

            {/* Floating Document Icon 2 */}
            <motion.div
                className="absolute bottom-1/4 left-[20%]"
                animate={{
                    y: [0, 40, 0],
                    rotate: [0, -10, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <FileText className="w-16 h-16 text-[#C2E812]" />
            </motion.div>

            {/* Connecting Lines / Tech Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-30">
                <motion.path
                    d="M100,200 Q400,100 700,300 T1200,200"
                    fill="none"
                    stroke="#1E1E1E"
                    strokeWidth="2"
                    strokeDasharray="10 10"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                />
            </svg>
        </div>
    </div>
));

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
    const [analysisMode, setAnalysisMode] = useState('jd'); // 'jd' or 'general'

    // Fetch user profile resume
    useEffect(() => {
        const fetchProfileResume = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('resume_url')
                    .eq('uid', user.id)
                    .single();
                if (data && data.resume_url) setProfileResumeUrl(data.resume_url);
            } catch (err) { console.error("Error fetching profile resume:", err); }
        };
        fetchProfileResume();
    }, [user]);

    // Configure pdf.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

    // Gemini API logic moved to backend

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                setResumeFile(file);
                setResumeUrl(URL.createObjectURL(file));
                setAnalysisResult(null);
                setError(null);
            } else {
                setError('Please upload a PDF or an image file.');
            }
        }
    };

    const extractTextFromPdf = async (url) => {
        let worker = null;
        try {
            setParsingStatus('Initializing OCR worker...');
            worker = await Tesseract.createWorker('eng', 1, {
                logger: m => console.log(m)
            });

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
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;

                const { data: { text } } = await worker.recognize(canvas.toDataURL('image/png'));
                fullText += text + '\n';
            }

            await worker.terminate();
            return fullText;
        } catch (err) {
            console.error('PDF extraction error:', err);
            if (worker) await worker.terminate();
            throw new Error(`Failed to extract text from PDF: ${err.message}`);
        }
    };

    const extractTextFromImage = async (url) => {
        try {
            setParsingStatus('Processing image...');
            const { data: { text } } = await Tesseract.recognize(
                url, 'eng', { logger: m => console.log(m) }
            );
            return text;
        } catch (err) {
            console.error('Image extraction error:', err);
            throw new Error('Failed to extract text from image.');
        }
    };

    const handleAnalyze = async () => {
        if ((!resumeFile && !useProfileResume)) { setError('Please provide a resume.'); return; }
        if (analysisMode === 'jd' && !jobDescription.trim()) { setError('Please provide a job description for JD Match mode.'); return; }

        setLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            let resumeText = '';
            if (useProfileResume) {
                if (resumeUrl.toLowerCase().endsWith('.png') || resumeUrl.toLowerCase().endsWith('.jpg') || resumeUrl.toLowerCase().endsWith('.jpeg')) {
                    resumeText = await extractTextFromImage(resumeUrl);
                } else {
                    resumeText = await extractTextFromPdf(resumeUrl);
                }
            } else if (resumeFile) {
                if (resumeFile.type === 'application/pdf') {
                    resumeText = await extractTextFromPdf(resumeUrl);
                } else {
                    resumeText = await extractTextFromImage(resumeUrl);
                }
            }

            setParsingStatus('Analyzing with AI...');
            const response = await authFetch(`${BACKEND_URL}/api/analyze-resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-client-source': 'codesapiens-web'
                },
                body: JSON.stringify({
                    resumeText,
                    jobDescription: analysisMode === 'jd' ? jobDescription : '',
                    analysisMode
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Analysis failed: ${response.statusText}`);
            }

            const result = await response.json();

            // The backend now returns the structured result directly
            // But if the backend forwarded the raw Gemini response structure (which my code does not, it returns the result directly, wait let me check index.js)
            // In index.js: const result = await response.json(); return res.json(result); 
            // The result from Gemini is complex (candidates[0].content...)
            // So the backend returns that complex object.
            // I should handle the parsing here as before or move parsing to backend.
            // The plan said "Return the JSON response to the frontend".
            // Let's modify the backend to parse it or keep parsing here.
            // The previous frontend code did:
            // const result = await response.json();
            // const generatedText = result.candidates[0].content.parts[0].text;
            // ... parsing ...
            // So if I return result from backend, I still need to parse here.

            // However, it's better if backend returns the CLEAN structure.
            // But I already wrote index.js to just return res.json(result) where result is gemini response.
            // So I will keep the parsing logic here for now to be safe, or I can update index.js to parse it. 
            // Updating index.js to parse would be cleaner but I already edited it.
            // Let's check what I wrote in index.js
            // I wrote: const result = await response.json(); return res.json(result);
            // So it returns the raw Gemini response.
            // So I must parse it here.

            if (!result.candidates || !result.candidates[0]?.content?.parts?.[0]?.text) {
                throw new Error('AI returned an empty response.');
            }

            const generatedText = result.candidates[0].content.parts[0].text;

            // Robust JSON extraction using Regex
            const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
            const match = generatedText.match(jsonRegex);

            let cleanText = generatedText;
            if (match && match[1]) {
                cleanText = match[1].trim();
            } else {
                // Fallback: finding the first '{' and last '}'
                const firstOpen = generatedText.indexOf('{');
                const lastClose = generatedText.lastIndexOf('}');

                if (firstOpen !== -1 && lastClose !== -1) {
                    cleanText = generatedText.substring(firstOpen, lastClose + 1);
                }
            }

            try {
                // Pre-cleaning: Remove potential control characters that break JSON.parse
                // cleanText = cleanText.replace(/[\x00-\x1F\x7F-\x9F]/g, ""); 
                // Note: The above might remove newlines which are valid in JSON strings. 
                // Better to just try parsing first.

                const parsedResult = JSON.parse(cleanText);
                setAnalysisResult(parsedResult);
            } catch (jsonErr) {
                console.error('JSON Parse Error:', jsonErr);
                console.error('Offending JSON string:', cleanText);

                // Attempt one more cleanup: strict escape of newlines if they are unescaped inside strings? 
                // For now, failure is safer than guessing wrong.
                throw new Error("AI response contained invalid characters. Please try again (sometimes specialized formatting symbols cause this).");
            }

        } catch (err) {
            console.error('Analysis error:', err);
            setError(err.message || 'Something went wrong during analysis.');
        } finally {
            setLoading(false);
            setParsingStatus('');
        }
    };





    return (
        <div className="min-h-screen bg-[#F7F5F2] pt-24 pb-12 px-4 md:px-8 font-sans text-[#1E1E1E] relative overflow-hidden">
            <AnalyzerBackground />
            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-[#1E1E1E] mb-4">Resume Analyzer</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Optimize your CV with AI. Beat the ATS. Get hired.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">

                    {/* LEFT COLUMN: Controls */}
                    <div className="space-y-8">
                        {/* Mode Toggle - Apple Style */}
                        <div className="bg-white p-1.5 rounded-2xl flex shadow-sm border border-gray-100 relative z-0">
                            {[
                                { id: 'jd', label: 'JD Match' },
                                { id: 'general', label: 'General Review' }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setAnalysisMode(mode.id)}
                                    className={`flex-1 relative py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-colors duration-200 z-10 ${analysisMode === mode.id ? 'text-white' : 'text-gray-500 hover:text-[#1E1E1E]'
                                        }`}
                                >
                                    {analysisMode === mode.id && (
                                        <motion.div
                                            layoutId="active-bubble"
                                            className={`absolute inset-0 rounded-xl -z-10 shadow-md ${mode.id === 'jd' ? 'bg-[#1E1E1E]' : 'bg-[#0061FE]'
                                                }`}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    {mode.label}
                                </button>
                            ))}
                        </div>

                        {/* Upload Card */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-[#C2E812] rounded-xl">
                                    <Upload className="w-6 h-6 text-black" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1E1E1E]">Upload Resume</h3>
                            </div>

                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-[#0061FE] hover:bg-blue-50/30 transition-all cursor-pointer relative group">
                                <input
                                    type="file"
                                    id="resume-upload"
                                    className="hidden"
                                    accept=".pdf,image/*"
                                    onChange={(e) => {
                                        setUseProfileResume(false);
                                        handleFileChange(e);
                                    }}
                                />
                                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center w-full h-full">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-gray-100 group-hover:scale-110 transition-transform shadow-sm">
                                        <FileText className="w-8 h-8 text-[#0061FE]" />
                                    </div>
                                    <span className="text-lg font-bold text-[#1E1E1E] mb-1">Click to upload PDF or Image</span>
                                    <span className="text-sm text-gray-400 font-medium">Supports formatted resumes</span>
                                </label>
                            </div>

                            <div className="relative flex items-center justify-center my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <span className="relative z-10 bg-white px-3 text-sm font-bold text-gray-400 uppercase tracking-widest">OR</span>
                            </div>

                            <button
                                onClick={() => {
                                    if (profileResumeUrl) {
                                        setUseProfileResume(true);
                                        setResumeFile(null);
                                        setResumeUrl(profileResumeUrl);
                                        setAnalysisResult(null);
                                        setError(null);
                                        toast.success("Using profile resume!");
                                    } else {
                                        toast.error("No resume found in profile");
                                    }
                                }}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 border-2 ${useProfileResume
                                    ? 'border-[#0061FE] bg-blue-50 text-[#0061FE]'
                                    : 'border-[#1E1E1E] text-[#1E1E1E] hover:bg-gray-50'
                                    }`}
                            >
                                <User className="w-5 h-5" />
                                {useProfileResume ? 'Using Profile Resume' : 'Use Profile Resume'}
                            </button>

                            {resumeFile && !useProfileResume && (
                                <div className="mt-4 flex items-center gap-3 text-sm font-bold text-green-700 bg-green-50 p-4 rounded-xl border border-green-200">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="truncate">{resumeFile.name}</span>
                                </div>
                            )}
                        </div>

                        {/* JD Match Input */}
                        <AnimatePresence>
                            {analysisMode === 'jd' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-[#FF5018] rounded-xl text-white">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-[#1E1E1E]">Job Description</h3>
                                    </div>
                                    <textarea
                                        className="w-full h-64 p-6 border-2 border-gray-100 rounded-xl focus:border-[#0061FE] focus:ring-4 focus:ring-blue-500/10 text-base font-medium resize-none outline-none transition-all placeholder:text-gray-400 bg-gray-50"
                                        placeholder="Paste the job description here to compare..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Analyze Button */}
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl text-white font-bold text-xl shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:shadow-md ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#1E1E1E] hover:bg-[#0061FE]'
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    {parsingStatus || 'CRUNCHING DATA...'}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3 tracking-wide">
                                    <BrainCircuit className="w-6 h-6" />
                                    {analysisMode === 'jd' ? 'ANALYZE MATCH' : 'GET FEEDBACK'}
                                </div>
                            )}
                        </button>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Results */}
                    <div className="h-full">
                        {analysisResult ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden sticky top-8"
                            >
                                <div className="bg-[#1E1E1E] p-10 text-center text-white relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
                                    <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-4 border-[#C2E812] bg-[#1E1E1E] mb-6 relative shadow-lg z-10">
                                        <span className="text-5xl font-black">{analysisResult.matchPercentage}%</span>
                                        <span className={`absolute -bottom-4 px-4 py-1.5 rounded-lg text-[#1E1E1E] font-bold tracking-widest text-xs shadow-md ${analysisMode === 'jd' ? 'bg-[#C2E812]' : 'bg-[#0061FE] text-white'
                                            }`}>
                                            {analysisMode === 'jd' ? 'MATCH' : 'SCORE'}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-bold mb-3 tracking-tight">Analysis Complete</h2>
                                    <p className="text-gray-400 font-medium leading-relaxed max-w-lg mx-auto">{analysisResult.summary}</p>
                                </div>

                                <div className="p-8 space-y-8">
                                    {/* Strengths */}
                                    <div className='p-6 bg-green-50 rounded-2xl border border-green-100'>
                                        <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="w-6 h-6" />
                                            Key Strengths
                                        </h3>
                                        <div className="prose prose-sm prose-green font-medium">
                                            <ReactMarkdown>{analysisResult.strengths}</ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Weaknesses */}
                                    <div className='p-6 bg-red-50 rounded-2xl border border-red-100'>
                                        <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-6 h-6" />
                                            Areas for Improvement
                                        </h3>
                                        <div className="prose prose-sm prose-red font-medium">
                                            <ReactMarkdown>{analysisResult.weaknesses}</ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Action Plan */}
                                    <div className='p-6 bg-blue-50 rounded-2xl border border-blue-100'>
                                        <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                                            <ArrowRight className="w-6 h-6" />
                                            Action Plan
                                        </h3>
                                        <div className="prose prose-sm prose-blue font-medium">
                                            <ReactMarkdown>{analysisResult.improvements}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 min-h-[600px] opacity-70">
                                <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-8 border border-gray-100">
                                    <BrainCircuit className="w-16 h-16 text-gray-300" />
                                </div>
                                <h3 className="text-3xl font-bold text-[#1E1E1E] mb-4">Ready when you are</h3>
                                <p className="text-xl text-gray-500 max-w-sm font-medium">
                                    Upload your resume and get instant, AI-powered career feedback.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1E1E1E', color: '#fff', border: '1px solid #333' } }} />
        </div>
    );
};

export default ResumeAnalyzer;
