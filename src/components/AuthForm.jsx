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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const signInWithGoogle = async () => {
    setLoading(true);
    setMessage(null);
    // Preserve redirect param for Google OAuth
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect') || '/';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectUrl}`,
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
    <div className="min-h-screen flex bg-zinc-50 overflow-hidden">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-black/80"></div>

        <div className="relative z-10 flex flex-col justify-between p-16 h-full text-zinc-50">
          <div>
            <div className="w-12 h-12 mb-8 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <img
                src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg"
                alt="Logo"
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
            <h1 className="text-5xl font-light tracking-wide leading-tight mb-6">
              Welcome to <br />
              <span className="font-semibold">CodeSapiens</span>
            </h1>
            <p className="text-xl text-zinc-400 font-light max-w-md leading-relaxed">
              Join the biggest student-run tech community. Connect, learn, and build your future with us.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4 text-zinc-400 text-sm font-light">
              <span>© 2025 CodeSapiens</span>
              <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
              <span>Privacy Policy</span>
              <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
              <span>Terms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-zinc-100"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-light text-zinc-900 mb-2 tracking-wide">
                  {mode === 'signIn' ? 'Welcome Back' : mode === 'signUp' ? 'Create Account' : 'Reset Password'}
                </h2>
                <p className="text-zinc-500 font-light text-sm">
                  {mode === 'signIn'
                    ? 'Enter your details to access your account'
                    : mode === 'signUp'
                      ? 'Start your journey with us today'
                      : 'We will send you a link to reset it'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5 transition-colors group-focus-within:text-zinc-800" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all font-light text-zinc-900 placeholder-zinc-400"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {mode !== 'forgotPassword' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5 transition-colors group-focus-within:text-zinc-800" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all font-light text-zinc-900 placeholder-zinc-400"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-600 transition-colors"
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
                      className="text-xs text-zinc-500 hover:text-zinc-900 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-zinc-900 text-white py-3.5 rounded-lg font-medium tracking-wide hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/20 flex items-center justify-center space-x-2"
                >
                  <span>{loading ? 'Processing...' : mode === 'signIn' ? 'Sign In' : mode === 'signUp' ? 'Create Account' : 'Send Reset Link'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                {mode !== 'forgotPassword' && (
                  <>
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase tracking-widest">
                        <span className="bg-white px-2 text-zinc-400">Or continue with</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={signInWithGoogle}
                      disabled={loading}
                      className="w-full bg-white text-zinc-700 border border-zinc-200 py-3.5 rounded-lg font-medium hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.56-.2-2.32H12v4.4h5.84c-.25 1.32-.98 2.44-2.04 3.2v2.55h3.3c1.92-1.77 3.03-4.38 3.03-7.13z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-1.01 7.28-2.73l-3.3-2.55c-.9.62-2.05.98-3.98.98-3.06 0-5.66-2.06-6.6-4.84H1.04v2.62C2.84 20.42 6.72 23 12 23z" />
                        <path fill="#FBBC05" d="M5.4 14.08c-.43-1.26-.68-2.61-.68-4.02 0-1.41.25-2.76.68-4.02V3.46H1.04C.37 5.18 0 7.04 0 9.02c0 1.98.37 3.84 1.04 5.56l4.36-3.5z" />
                        <path fill="#EA4335" d="M12 6.98c1.62 0 3.06.55 4.2 1.63l3.15-3.15C17.46 3.05 14.97 2 12 2 6.72 2 2.84 4.58 1.04 8.52l4.36 3.5C6.34 9.16 8.94 6.98 12 6.98z" />
                      </svg>
                      <span>Google</span>
                    </button>
                  </>
                )}

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg text-sm text-center ${message.startsWith('Error') || message.includes('Failed') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}
                  >
                    {message}
                  </motion.div>
                )}
              </form>

              <div className="mt-8">
                <p className="text-zinc-500 text-sm font-light">
                  {mode === 'signUp' ? 'Already have an account? ' : mode === 'forgotPassword' ? 'Remember your password? ' : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => toggleMode(mode === 'signUp' ? 'signIn' : 'signUp')}
                    className="text-zinc-900 font-medium hover:underline underline-offset-4 transition-all"
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