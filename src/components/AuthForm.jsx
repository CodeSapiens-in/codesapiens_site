import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Globe, Github, Building, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

// API Configuration - Change this to your backend URL
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

  // Load Cloudflare Turnstile script only once
  useEffect(() => {
    if (scriptLoadedRef.current) {
      return;
    }

    const scriptId = 'turnstile-script';
    if (document.getElementById(scriptId)) {
      scriptLoadedRef.current = true;
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('[CodeSapiens] Turnstile script loaded successfully');
      scriptLoadedRef.current = true;
    };
    script.onerror = () => {
      console.error('[CodeSapiens] Failed to load Turnstile script');
      setMessage('❌ Failed to load CAPTCHA script');
    };
    document.body.appendChild(script);
  }, []);

  // Render Turnstile widget
  useEffect(() => {
    // Clean up existing widget first
    if (widgetIdRef.current !== null && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      } catch (e) {
        console.warn('[CodeSapiens] Error removing Turnstile widget:', e);
      }
    }

    // Wait for Turnstile to be ready
    if (!window.turnstile || !turnstileRef.current) {
      const checkInterval = setInterval(() => {
        if (window.turnstile && turnstileRef.current) {
          clearInterval(checkInterval);
          renderTurnstile();
        }
      }, 100);

      return () => clearInterval(checkInterval);
    } else {
      renderTurnstile();
    }

    function renderTurnstile() {
      if (!turnstileRef.current || !window.turnstile) return;

      // Use your Turnstile sitekey
      const sitekey = '0x4AAAAAAB8LVUdoo8-C9TDo';

      if (!sitekey || typeof sitekey !== 'string' || sitekey.trim() === '') {
        console.error('[CodeSapiens] Invalid sitekey');
        setMessage('❌ Invalid CAPTCHA sitekey. Contact support.');
        return;
      }

      try {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: sitekey.trim(),
          callback: (token) => {
            console.log('[CodeSapiens] Turnstile token received');
            setTurnstileToken(token);
            setMessage(null);
          },
          'error-callback': (errorCode) => {
            console.error('[CodeSapiens] Turnstile error:', errorCode);
            setMessage(`❌ CAPTCHA error: ${errorCode}`);
            setTurnstileToken(null);
          },
          'expired-callback': () => {
            console.log('[CodeSapiens] Turnstile token expired');
            setMessage('❌ CAPTCHA expired, please try again.');
            setTurnstileToken(null);
          },
        });
      } catch (error) {
        console.error('[CodeSapiens] Failed to render Turnstile:', error);
        setMessage(`❌ Failed to initialize CAPTCHA: ${error.message}`);
      }
    }

    // Cleanup function
    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {
          console.warn('[CodeSapiens] Cleanup error:', e);
        }
      }
    };
  }, [mode]);

  // Fetch user profile
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
      if (error) {
        console.error('[CodeSapiens] Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    };
    fetchProfile();
  }, [mode, loading]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!turnstileToken) {
      setMessage('❌ Please complete the CAPTCHA.');
      setLoading(false);
      return;
    }

    try {
      // Verify Turnstile token with YOUR backend
      console.log('[CodeSapiens] Verifying token with backend:', `${API_BASE_URL}/verify-turnstile`);
      
      const verifyResponse = await fetch(`${API_BASE_URL}/verify-turnstile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: turnstileToken }),
      });

      console.log('[CodeSapiens] Response status:', verifyResponse.status);
      console.log('[CodeSapiens] Response headers:', verifyResponse.headers.get('content-type'));

      // Check if response is JSON
      const contentType = verifyResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await verifyResponse.text();
        console.error('[CodeSapiens] Non-JSON response:', textResponse.substring(0, 200));
        throw new Error('Server returned non-JSON response. Is the backend running on http://localhost:3000?');
      }

      const verifyResult = await verifyResponse.json();
      console.log('[CodeSapiens] Turnstile verification result:', verifyResult);

      if (!verifyResult.success) {
        // Reset Turnstile on verification failure
        setTurnstileToken(null);
        if (window.turnstile && widgetIdRef.current !== null) {
          try {
            console.log('[CodeSapiens] Resetting Turnstile after verification failure');
            window.turnstile.reset(widgetIdRef.current);
          } catch (resetErr) {
            console.warn('[CodeSapiens] Failed to reset Turnstile:', resetErr);
          }
        }
        throw new Error(verifyResult.error || 'CAPTCHA verification failed');
      }

      // Proceed with authentication
      if (mode === 'forgotPassword') {
        const redirectTo =
          window.location.hostname === 'localhost'
            ? `${window.location.origin}/reset-password`
            : 'https://codesapiens-management-website.vercel.app/reset-password';

        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, { redirectTo });
        if (error) {
          // Reset Turnstile on password reset error
          setTurnstileToken(null);
          if (window.turnstile && widgetIdRef.current !== null) {
            window.turnstile.reset(widgetIdRef.current);
          }
          throw error;
        }
        setMessage('✅ Password reset link has been sent to your email!');
        setTimeout(() => {
          navigate('/auth');
          setMode('signIn');
          setFormData({ email: '', password: '' });
          setTurnstileToken(null);
        }, 2000);
      } else if (mode === 'signUp') {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (error) {
          // Reset Turnstile on signup error
          setTurnstileToken(null);
          if (window.turnstile && widgetIdRef.current !== null) {
            window.turnstile.reset(widgetIdRef.current);
          }
          throw error;
        }
        setMessage('✅ Check your inbox for a confirmation email.');
        setFormData({ email: '', password: '' });
        setTurnstileToken(null);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) {
          // Reset Turnstile on signin error
          setTurnstileToken(null);
          if (window.turnstile && widgetIdRef.current !== null) {
            window.turnstile.reset(widgetIdRef.current);
          }
          throw error;
        }
        navigate('/');
        setMessage('✅ Signed in!');
        setTurnstileToken(null);
      }
    } catch (err) {
      console.error('[CodeSapiens] Submission error:', err);
      
      // Better error messages
      let errorMessage = err.message;
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Make sure backend is running on http://localhost:3000';
      } else if (err.message.includes('<!DOCTYPE')) {
        errorMessage = 'Server returned HTML instead of JSON. Check if backend is running correctly.';
      }
      
      setMessage(`❌ ${errorMessage}`);
      
      // Reset Turnstile widget on error so user can try again with new token
      setTurnstileToken(null);
      if (window.turnstile && widgetIdRef.current !== null) {
        try {
          console.log('[CodeSapiens] Resetting Turnstile widget after error');
          window.turnstile.reset(widgetIdRef.current);
        } catch (resetErr) {
          console.warn('[CodeSapiens] Failed to reset Turnstile:', resetErr);
        }
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
    {
      icon: Calendar,
      title: 'College Network',
      description: 'Connect with students from your college and beyond',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Globe,
      title: 'Skill Development',
      description: 'Attend workshops and earn certificates',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: Github,
      title: 'Portfolio Building',
      description: 'Showcase your projects and achievements',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: Building,
      title: 'Professional Network',
      description: 'Build connections for your career',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  const renderContent = () => {
    if (!profile) return null;
    if (profile.role === 'admin') {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg mt-4">
          <h2 className="font-bold text-lg mb-2">Admin Dashboard</h2>
          <p>Welcome, {profile.display_name || 'Admin'}! You can manage users and content here.</p>
        </div>
      );
    }
    return (
      <div className="p-4 bg-green-50 border border-green-300 rounded-lg mt-4">
        <h2 className="font-bold text-lg mb-2">Student Dashboard</h2>
        <p>Welcome, {profile.display_name || 'Student'}! Explore workshops, earn badges, and connect.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg"
                alt="CodeSapiens Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-gray-900">CodeSapiens</span>
          </div>
          <span className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-0">
            Student Community Management Platform
          </span>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Left Content */}
        <div className="flex-1 mb-8 lg:mb-0 lg:pr-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Build Your Student Community
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed">
              Connect, learn, and grow with fellow students. Attend workshops, earn badges, and build
              your professional network in one comprehensive platform.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-300"
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}
                    >
                      <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 px-4 sm:px-8 py-8 sm:py-12">
          {mode === 'forgotPassword' ? (
            <div className="w-full">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Enter your email to receive a password reset link
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-2.5 sm:top-3" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 text-sm sm:text-base"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>
                <div className="my-4">
                  <div ref={turnstileRef} />
                </div>
                <button
                  type="submit"
                  disabled={loading || !turnstileToken}
                  className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base transition-all duration-200"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
                <div className="text-center">
                  <p className="text-sm sm:text-base text-gray-600">
                    Back to{' '}
                    <button
                      type="button"
                      onClick={() => toggleMode('signIn')}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
                {message && (
                  <div
                    className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                      message.startsWith('✅')
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {message}
                  </div>
                )}
              </form>
            </div>
          ) : (
            <>
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {mode === 'signUp' ? 'Join Our Community' : 'Welcome Back'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {mode === 'signUp' ? 'Create your account to get started' : 'Sign in to your account'}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-2.5 sm:top-3" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 text-sm sm:text-base"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-2.5 sm:top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full pl-10 sm:pl-11 pr-10 sm:pr-12 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 text-sm sm:text-base"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>
                <div className="my-4">
                  <div ref={turnstileRef} />
                </div>
                <button
                  type="submit"
                  disabled={loading || !turnstileToken}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none text-sm sm:text-base"
                >
                  {loading
                    ? mode === 'signUp'
                      ? 'Creating…'
                      : 'Signing…'
                    : mode === 'signUp'
                    ? 'Sign Up'
                    : 'Sign In'}
                </button>
                <div className="text-center space-y-2">
                  <p className="text-sm sm:text-base text-gray-600">
                    {mode === 'signUp' ? 'Already have an account? ' : 'No account yet? '}
                    <button
                      type="button"
                      onClick={() => toggleMode(mode === 'signUp' ? 'signIn' : 'signUp')}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      {mode === 'signUp' ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    Forgot your password?{' '}
                    <button
                      type="button"
                      onClick={() => toggleMode('forgotPassword')}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      Reset Password
                    </button>
                  </p>
                </div>
                {message && (
                  <div
                    className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                      message.startsWith('✅')
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
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