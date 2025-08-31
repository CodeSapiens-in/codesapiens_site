import React, { useState, useEffect, useRef } from 'react';
import { Bell, Settings, Menu, X, ChevronDown, User, Loader2 } from 'lucide-react';

// Import your actual Supabase client
import { supabase } from '../lib/supabaseClient';

// Mock Supabase for demonstration - replace with your actual client

export default function UserNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs for click outside detection
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Fetch user data using Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the current authenticated user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw new Error(`Authentication error: ${authError.message}`);
        }

        if (!user) {
          throw new Error('No authenticated user found');
        }

        // Fetch user profile from the users table
        const { data, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('uid', user.id)
          .single();

        if (profileError) {
          throw new Error(`Failed to fetch user profile: ${profileError.message}`);
        }

        if (!data) {
          throw new Error('User profile not found');
        }

        // Transform the data
        const transformedUser = {
          uid: data.uid,
          displayName: data.display_name || user.email?.split('@')[0] || 'User',
          email: data.email || user.email || '',
          avatar: data.avatar || '',
          role: data.role || '',
          initials: (data.display_name || user.email || 'U')
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
        };

        setUserData(transformedUser);

      } catch (err) {
        setError(err.message);
        console.error('Error fetching user data:', err);
        
        // Fallback user data
        setUserData({
          uid: 'fallback',
          displayName: 'User',
          email: 'user@example.com',
          avatar: '',
          role: 'student',
          initials: 'U'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdowns on route change or escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsProfileDropdownOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (href) => {
    // Close all dropdowns when navigating
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    
    // Handle navigation
    if (href && href !== '#') {
      window.location.href = href;
    }
  };

  const handleSignOut = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      }
      
      // Clear any local state and redirect
      setUserData(null);
      setIsMobileMenuOpen(false);
      setIsProfileDropdownOpen(false);
      
      // Redirect to login or home page
      window.location.href = '/login';
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const renderUserAvatar = (size = 'w-9 h-9', textSize = 'text-sm') => {
    if (loading) {
      return (
        <div className={`${size} bg-gray-300 rounded-full flex items-center justify-center animate-pulse`}>
          <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
        </div>
      );
    }

    if (userData?.avatar) {
      return (
        <img 
          src={userData.avatar} 
          alt={userData.displayName}
          className={`${size} rounded-full object-cover`}
        />
      );
    }

    return (
      <div className={`${size} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md`}>
        <span className={`text-white font-medium ${textSize}`}>
          {userData?.initials || 'U'}
        </span>
      </div>
    );
  };

  const renderUserInfo = (showEmail = true) => {
    if (loading) {
      return (
        <div className="space-y-1">
          <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
          {showEmail && <div className="h-3 bg-gray-300 rounded animate-pulse w-32"></div>}
        </div>
      );
    }

    return (
      <div>
        <div className="font-medium text-gray-900">
          {userData?.displayName || 'Loading...'}
        </div>
        {showEmail && (
          <div className="text-sm text-gray-500">
            {userData?.email || ''}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">CS</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">CodeSapiens</span>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-auto">
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => handleNavClick('dashboard')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={() => handleNavClick('#')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
              >
                Events
              </button>
              <button 
                onClick={() => handleNavClick('#')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
              >
                Community
              </button>
              <button 
                onClick={() => handleNavClick('#')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
              >
                Badges
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Notification Bell */}
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </span>
              </button>
            </div>

            {/* User Profile Section */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={loading}
              >
                {renderUserAvatar()}
                <div className="hidden lg:flex items-center space-x-1">
                  <div className="text-left">
                    {renderUserInfo()}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 ml-1 transition-transform ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && !loading && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      {renderUserAvatar('w-12 h-12', 'text-lg')}
                      <div>
                        {renderUserInfo()}
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button 
                      onClick={() => handleNavClick('profile')}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </button>
                    <button 
                      onClick={() => handleNavClick('#')}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Account Preferences
                    </button>
                    <button 
                      onClick={() => handleNavClick('#')}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Help & Support
                    </button>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Icon */}
            <button 
              onClick={() => handleNavClick('#')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden border-t border-gray-200 py-4 space-y-2 bg-white">
            <button 
              onClick={() => handleNavClick('dashboard')}
              className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md font-medium transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => handleNavClick('#')}
              className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md font-medium transition-colors"
            >
              Events
            </button>
            <button 
              onClick={() => handleNavClick('#')}
              className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md font-medium transition-colors"
            >
              Community
            </button>
            <button 
              onClick={() => handleNavClick('#')}
              className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md font-medium transition-colors"
            >
              Badges
            </button>
            
            {/* Mobile User Info */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="px-4 py-2">
                <div className="flex items-center space-x-3 mb-3">
                  {renderUserAvatar('w-10 h-10')}
                  <div>
                    {renderUserInfo()}
                  </div>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleNavClick('profile')}
                    className="w-full text-left block text-sm text-gray-700 hover:text-blue-600 py-1"
                  >
                    Profile Settings
                  </button>
                  <button 
                    onClick={() => handleNavClick('#')}
                    className="w-full text-left block text-sm text-gray-700 hover:text-blue-600 py-1"
                  >
                    Account Preferences
                  </button>
                  <button 
                    onClick={() => handleNavClick('#')}
                    className="w-full text-left block text-sm text-gray-700 hover:text-blue-600 py-1"
                  >
                    Help & Support
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left block text-sm text-red-600 hover:text-red-700 py-1"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2">
          <p className="text-red-700 text-sm">
            Failed to load user data: {error}
          </p>
        </div>
      )}
    </nav>
  );
}