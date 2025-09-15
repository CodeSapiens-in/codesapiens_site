import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ResetPassword() {
  const [mode, setMode] = useState('forgotPassword'); // 'forgotPassword' | 'newPassword'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Handle password reset link
  useEffect(() => {
    const handleAuthEvent = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const urlParams = new URLSearchParams(location.search);
      const type = urlParams.get('type');

      if (type === 'recovery' && session?.access_token) {
        setMode('newPassword');
        setFormData({ ...formData, email: session.user.email });
      }
    };
    handleAuthEvent();
  }, [location]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'forgotPassword') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password?type=recovery`,
        });
        if (error) throw error;
        setMessage('✅ Password reset link has been sent to your email!');
      } else if (mode === 'newPassword') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { error } = await supabase.auth.updateUser({
          password: formData.password,
        });
        if (error) throw error;
        setMessage('✅ Password updated successfully! Redirecting to sign-in...');
        setTimeout(() => {
          setMode('forgotPassword');
          setFormData({ email: '', password: '', confirmPassword: '' });
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    setMessage(null);
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {mode === 'forgotPassword' ? 'Reset Password' : 'Set New Password'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {mode === 'forgotPassword' ? 'Enter your email to reset your password' : 'Enter your new password'}
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
                disabled={loading || mode === 'newPassword'}
                className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 text-sm sm:text-base"
                placeholder="admin@example.com"
              />
            </div>
          </div>
          {mode === 'newPassword' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">New Password</label>
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
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-2.5 sm:top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full pl-10 sm:pl-11 pr-10 sm:pr-12 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 text-sm sm:text-base"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none text-sm sm:text-base"
          >
            {loading
              ? mode === 'forgotPassword'
                ? 'Sending…'
                : 'Updating…'
              : mode === 'forgotPassword'
              ? 'Send Reset Link'
              : 'Update Password'}
          </button>
          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Back to{' '}
              <button
                type="button"
                onClick={() => toggleMode('forgotPassword')}
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
    </div>
  );
}