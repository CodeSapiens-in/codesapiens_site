import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Globe, Github, Building, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

// API Configuration - Change only if you use Turnstile backend verification
const API_BASE_URL = 'https://colleges-name-api.vercel.app';

export default function CodeSapiensPlatform() {
  const [mode, setMode] = useState('signIn');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [profile, setProfile] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);
  const scriptLoadedRef = useRef(false);
  const navigate = useNavigate();

  // Load Cloudflare Turnstile script once
  useEffect(() => {
    if (scriptLoadedRef.current || window.turnstile) return;

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      console.log('[CodeSapiens] Turnstile script loaded');
    };
    document.body.appendChild(script);
  }, []);

  // Render Turnstile widget when mode changes
  useEffect(() => {
    if (widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    if (!window.turnstile || !turnstileRef.current) return;

    const sitekey = '0x4AAAAAAB8LVUdoo8-C9TDo'; // Replace if needed

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey,
      callback: (token) => {
        setTurnstileToken(token);
        setMessage(null);
      },
      'error-callback': () => {
        setMessage('CAPTCHA error. Please try again.');
        setTurnstileToken(null);
      },
      'expired-callback': () => {
        setMessage('CAPTCHA expired. Please try again.');
        setTurnstileToken(null);
      },
    });
  }, [mode]);

  // Listen to Supabase auth state (critical for OAuth redirect)
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setMessage('Signed in successfully!');
        navigate('/');
      }
      if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });
  }, [navigate]);

  // Fetch user profile after login
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', user.id)
        .single();

      if (!error && data) setProfile(data);
    };

    fetchProfile();
  }, [loading]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Google OAuth Login
  const signInWithGoogle = async () => {
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173', // Works in dev
      },
    });

    if (error) {
      setMessage(`Google Login Failed: ${error.message}`);
      setLoading(false);
    }
    // On success: redirects to Google → back to your app → auto-handled by listener
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!turnstileToken && mode !== 'signUp') {
      setMessage('Please complete the CAPTCHA.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'forgotPassword') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: 'http://localhost:5173/reset-password',
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
        navigate('/');
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    setMessage(null);
    setFormData({ email: '', password: '' });
    setTurnstileToken(null);
  };

  const features = [
    { icon: Calendar, title: 'College Network', description: 'Connect with students from your college and beyond', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
    { icon: Globe, title: 'Skill Development', description: 'Attend workshops and earn certificates', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
    { icon: Github, title: 'Portfolio Building', description: 'Showcase your projects and achievements', bgColor: 'bg-green-100', iconColor: 'text-green-600' },
    { icon: Building, title: 'Professional Network', description: 'Build connections for your career', bgColor: 'bg-orange-100', iconColor: 'text-orange-600' },
  ];

  const renderContent = () => {
    if (!profile) return null;
    if (profile.role === 'admin') {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg mt-4">
          <h2 className="font-bold text-lg mb-2">Admin Dashboard</h2>
          <p>Welcome, {profile.display_name || 'Admin'}!</p>
        </div>
      );
    }
    return (
      <div className="p-4 bg-green-50 border border-green-300 rounded-lg mt-4">
        <h2 className="font-bold text-lg mb-2">Student Dashboard</h2>
        <p>Welcome, {profile.display_name || 'Student'}!</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img
                src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg"
                alt="CodeSapiens Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-semibold text-gray-900">CodeSapiens</span>
          </div>
          <span className="text-base text-gray-600 mt-2 sm:mt-0">
            Student Community Management Platform
          </span>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Left Content */}
        <div className="flex-1 mb-8 lg:mb-0 lg:pr-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Build Your Student Community
            </h1>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
              Connect, learn, and grow with fellow students. Attend workshops, earn badges, and build your professional network.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 px-8 py-12">
          {mode === 'forgotPassword' ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-600 mb-6">Enter your email to receive a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>
                <div ref={turnstileRef} className="my-6" />
                <button
                  type="submit"
                  disabled={loading || !turnstileToken}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <p className="text-center text-gray-600">
                  Back to{' '}
                  <button type="button" onClick={() => toggleMode('signIn')} className="text-blue-600 font-medium">
                    Sign In
                  </button>
                </p>
              </form>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {mode === 'signUp' ? 'Join Our Community' : 'Welcome Back'}
                </h2>
                <p className="text-gray-600">
                  {mode === 'signUp' ? 'Create your account to get started' : 'Sign in to continue'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {mode !== 'signUp' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Google Sign-In Button */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.56-.2-2.32H12v4.4h5.84c-.25 1.32-.98 2.44-2.04 3.2v2.55h3.3c1.92-1.77 3.03-4.38 3.03-7.13z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-1.01 7.28-2.73l-3.3-2.55c-.9.62-2.05.98-3.98.98-3.06 0-5.66-2.06-6.6-4.84H1.04v2.62C2.84 20.42 6.72 23 12 23z" />
                    <path fill="#FBBC05" d="M5.4 14.08c-.43-1.26-.68-2.61-.68-4.02 0-1.41.25-2.76.68-4.02V3.46H1.04C.37 5.18 0 7.04 0 9.02c0 1.98.37 3.84 1.04 5.56l4.36-3.5z" />
                    <path fill="#EA4335" d="M12 6.98c1.62 0 3.06.55 4.2 1.63l3.15-3.15C17.46 3.05 14.97 2 12 2 6.72 2 2.84 4.58 1.04 8.52l4.36 3.5C6.34 9.16 8.94 6.98 12 6.98z" />
                  </svg>
                  Continue with Google
                </button>

                {/* Turnstile CAPTCHA (only for email/password) */}
                {mode !== 'signUp' && <div ref={turnstileRef} className="my-6" />}

                <button
                  type="submit"
                  disabled={loading || (!turnstileToken && mode !== 'signUp')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Please wait...' : mode === 'signUp' ? 'Sign Up' : 'Sign In'}
                </button>

                <div className="text-center space-y-2 text-sm text-gray-600">
                  <p>
                    {mode === 'signUp' ? 'Already have an account? ' : "Don't have an account? "}
                    <button type="button" onClick={() => toggleMode(mode === 'signUp' ? 'signIn' : 'signUp')} className="text-blue-600 font-medium">
                      {mode === 'signUp' ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                  <p>
                    <button type="button" onClick={() => toggleMode('forgotPassword')} className="text-blue-600 font-medium">
                      Forgot Password?
                    </button>
                  </p>
                </div>

                {message && (
                  <div className={`p-3 rounded-lg text-sm ${message.startsWith('Error') || message.includes('Failed') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                    {message}
                  </div>
                )}
              </form>

              {profile && renderContent()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}