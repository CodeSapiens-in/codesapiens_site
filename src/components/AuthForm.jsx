import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@supabase/auth-helpers-react';

export default function AuthForm() {
  const session = useSession();
  const [mode, setMode] = useState('signIn'); // 'signIn', 'signUp', 'forgotPassword'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  // Listen to session state for navigation
  useEffect(() => {
    if (session) {
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect') || '/';
      navigate(redirectUrl);
    }
  }, [session, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* 
    Dynamic Redirect URL helper
    In development use localhost, in production use site url.
    We prefer window.location.origin as it works dynamically for all environments (dev, preview, prod).
  */
  const getURL = () => {
    let url =
      import.meta.env?.VITE_SITE_URL ??
      import.meta.env?.NEXT_PUBLIC_SITE_URL ??
      import.meta.env?.NEXT_PUBLIC_VERCEL_URL ??
      window.location.origin ??
      'http://localhost:3000/';

    // Make sure to include `https://` when not localhost.
    url = url.startsWith('http') ? url : `https://${url}`;
    // Make sure to include a trailing `/`.
    url = url.endsWith('/') ? url : `${url}/`;
    return url;
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const signInWithGoogle = async () => {
    setLoading(true);
    setMessage(null);
    // Preserve redirect param for Google OAuth
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('redirect') || '/';

    // Construct the full redirect URL
    // dbURL() returns base with trailing slash, so we remove leading slash from path if present
    const cleanPath = redirectPath.startsWith('/') ? redirectPath.slice(1) : redirectPath;
    const fullRedirectUrl = `${getURL()}${cleanPath}`;

    console.log('[Auth] Redirecting to:', fullRedirectUrl);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: fullRedirectUrl, // Use the dynamic URL
      },
    });
    if (error) {
      setMessage(`Google Login Failed: ${error.message}`);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'forgotPassword') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage('Password reset link sent! Check your email.');
      } else if (mode === 'signUp') {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        setMessage('Check your email for confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        if (error) throw error;
        // navigate('/') handled by useEffect
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    setMessage(null);
    setFormData({ email: '', password: '' });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex bg-[#0A0A0F] overflow-hidden">

      {/* Left Panel - Mirror / Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Deep space layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F] via-[#0D0D2B] to-[#0A0A0F]"></div>

        {/* Animated cyan glow top-left */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00C6F7] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        {/* Purple glow bottom-right */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#A855F7] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        {/* Center subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00C6F7] rounded-full blur-[100px] opacity-5"></div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(#00C6F7 1px, transparent 1px), linear-gradient(90deg, #00C6F7 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}>
        </div>

        {/* Animated SVG geometry — mirror motif */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 500 500" className="w-[420px] h-[420px] opacity-30">
            <motion.path
              d="M250,80 L420,250 L250,420 L80,250 Z"
              fill="none" stroke="#00C6F7" strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 2 }}
            />
            <motion.path
              d="M250,130 L370,250 L250,370 L130,250 Z"
              fill="none" stroke="#A855F7" strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, delay: 0.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 2 }}
            />
            <motion.path
              d="M250,180 L320,250 L250,320 L180,250 Z"
              fill="none" stroke="#00C6F7" strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, delay: 1, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 2 }}
            />
            {/* Center cross lines */}
            <motion.line x1="250" y1="80" x2="250" y2="420" stroke="#00C6F7" strokeWidth="0.5" opacity="0.3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1.5 }} />
            <motion.line x1="80" y1="250" x2="420" y2="250" stroke="#A855F7" strokeWidth="0.5" opacity="0.3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1.5 }} />
            {/* Corner dots */}
            <circle cx="250" cy="80" r="3" fill="#00C6F7" opacity="0.8" />
            <circle cx="420" cy="250" r="3" fill="#A855F7" opacity="0.8" />
            <circle cx="250" cy="420" r="3" fill="#00C6F7" opacity="0.8" />
            <circle cx="80" cy="250" r="3" fill="#A855F7" opacity="0.8" />
            <circle cx="250" cy="250" r="5" fill="none" stroke="#00C6F7" strokeWidth="1.5" opacity="0.6" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-16 h-full text-white">
          <div>
            {/* Logo */}
            <div className="w-12 h-12 mb-10 bg-[#0D0D2B] backdrop-blur-md rounded-xl flex items-center justify-center border border-[#00C6F7]/30 shadow-[0_0_20px_rgba(0,198,247,0.2)]">
              <img
                src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg"
                alt="Logo"
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>

            <h1 className="text-5xl font-light tracking-wide leading-tight mb-6">
              Welcome to <br />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00C6F7] to-[#A855F7]">CodeSapiens</span>
            </h1>
            <p className="text-lg text-gray-400 font-light max-w-md leading-relaxed mb-10">
              Join the biggest student-run tech community in TN. Connect, learn, and build your future with us.
            </p>

            {/* Stats pills */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-[#0D0D2B]/80 border border-[#00C6F7]/20 rounded-xl px-4 py-3 w-fit backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-[#00C6F7] animate-pulse"></div>
                <span className="text-sm text-gray-300 font-light">2000+ Active Members</span>
              </div>
              <div className="flex items-center gap-3 bg-[#0D0D2B]/80 border border-[#A855F7]/20 rounded-xl px-4 py-3 w-fit backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-sm text-gray-300 font-light">50+ Colleges Reached</span>
              </div>
              <div className="flex items-center gap-3 bg-[#0D0D2B]/80 border border-[#00C6F7]/20 rounded-xl px-4 py-3 w-fit backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-[#00C6F7] animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span className="text-sm text-gray-300 font-light">15+ Events Hosted</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-600 text-sm font-light">
            <span>© 2025 CodeSapiens</span>
            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
            <span>Privacy Policy</span>
            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
            <span>Terms</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-[#0A0A0F]">
        {/* Subtle background glow behind form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#00C6F7] rounded-full blur-[140px] opacity-5 pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-[#0D0D2B]/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-[0_8px_48px_rgba(0,198,247,0.12)] border border-[#00C6F7]/20"
            >
              {/* Mode indicator dots */}
              <div className="flex gap-2 mb-6">
                <div className={`h-1 rounded-full transition-all duration-300 ${mode === 'signIn' ? 'w-8 bg-gradient-to-r from-[#00C6F7] to-[#A855F7]' : 'w-3 bg-gray-700'}`}></div>
                <div className={`h-1 rounded-full transition-all duration-300 ${mode === 'signUp' ? 'w-8 bg-gradient-to-r from-[#00C6F7] to-[#A855F7]' : 'w-3 bg-gray-700'}`}></div>
                <div className={`h-1 rounded-full transition-all duration-300 ${mode === 'forgotPassword' ? 'w-8 bg-gradient-to-r from-[#00C6F7] to-[#A855F7]' : 'w-3 bg-gray-700'}`}></div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-light text-white mb-2 tracking-wide">
                  {mode === 'signIn' ? 'Welcome Back' : mode === 'signUp' ? 'Create Account' : 'Reset Password'}
                </h2>
                <p className="text-gray-500 font-light text-sm">
                  {mode === 'signIn'
                    ? 'Enter your details to access your account'
                    : mode === 'signUp'
                      ? 'Start your journey with us today'
                      : 'We will send you a link to reset it'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 text-gray-600 absolute left-3 top-3.5 transition-colors group-focus-within:text-[#00C6F7]" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-[#0A0A0F] border border-[#00C6F7]/20 rounded-lg focus:ring-2 focus:ring-[#00C6F7]/50 focus:border-[#00C6F7]/60 outline-none transition-all font-light text-white placeholder-gray-600"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {mode !== 'forgotPassword' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="w-5 h-5 text-gray-600 absolute left-3 top-3.5 transition-colors group-focus-within:text-[#00C6F7]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 bg-[#0A0A0F] border border-[#00C6F7]/20 rounded-lg focus:ring-2 focus:ring-[#00C6F7]/50 focus:border-[#00C6F7]/60 outline-none transition-all font-light text-white placeholder-gray-600"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-3.5 text-gray-600 hover:text-[#00C6F7] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signIn' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => toggleMode('forgotPassword')}
                      className="text-xs text-gray-500 hover:text-[#00C6F7] font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#00C6F7] to-[#A855F7] text-black py-3.5 rounded-lg font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(0,198,247,0.3)] flex items-center justify-center space-x-2"
                >
                  <span>{loading ? 'Processing...' : mode === 'signIn' ? 'Sign In' : mode === 'signUp' ? 'Create Account' : 'Send Reset Link'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                {mode !== 'forgotPassword' && (
                  <>
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#00C6F7]/10" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase tracking-widest">
                        <span className="bg-[#0D0D2B] px-3 text-gray-600">Or continue with</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={signInWithGoogle}
                      disabled={loading}
                      className="w-full bg-[#0A0A0F] text-gray-300 border border-[#00C6F7]/20 hover:border-[#00C6F7]/50 py-3.5 rounded-lg font-medium hover:bg-[#0D0D2B] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 shadow-[0_0_15px_rgba(0,198,247,0.05)] hover:shadow-[0_0_20px_rgba(0,198,247,0.15)]"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.56-.2-2.32H12v4.4h5.84c-.25 1.32-.98 2.44-2.04 3.2v2.55h3.3c1.92-1.77 3.03-4.38 3.03-7.13z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-1.01 7.28-2.73l-3.3-2.55c-.9.62-2.05.98-3.98.98-3.06 0-5.66-2.06-6.6-4.84H1.04v2.62C2.84 20.42 6.72 23 12 23z" />
                        <path fill="#FBBC05" d="M5.4 14.08c-.43-1.26-.68-2.61-.68-4.02 0-1.41.25-2.76.68-4.02V3.46H1.04C.37 5.18 0 7.04 0 9.02c0 1.98.37 3.84 1.04 5.56l4.36-3.5z" />
                        <path fill="#EA4335" d="M12 6.98c1.62 0 3.06.55 4.2 1.63l3.15-3.15C17.46 3.05 14.97 2 12 2 6.72 2 2.84 4.58 1.04 8.52l4.36 3.5C6.34 9.16 8.94 6.98 12 6.98z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </>
                )}

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg text-sm text-center ${message.startsWith('Error') || message.includes('Failed')
                      ? 'bg-red-950/50 text-red-400 border border-red-500/30'
                      : 'bg-[#00C6F7]/10 text-[#00C6F7] border border-[#00C6F7]/30'}`}
                  >
                    {message}
                  </motion.div>
                )}
              </form>

              <div className="mt-8">
                <p className="text-gray-600 text-sm font-light">
                  {mode === 'signUp' ? 'Already have an account? ' : mode === 'forgotPassword' ? 'Remember your password? ' : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => toggleMode(mode === 'signUp' ? 'signIn' : 'signUp')}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C6F7] to-[#A855F7] font-medium hover:underline underline-offset-4 transition-all"
                  >
                    {mode === 'signUp' ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}