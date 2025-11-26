import React, { useState, useEffect, useRef } from 'react';
import { Bell, Settings, Menu, X, ChevronDown, User, Loader2, Shield, Users, BarChart3, TextSearch, BookPlus, CalendarSearch, FileCheck2, Computer, BrainCircuit ,Code} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function UnifiedNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Refs for click outside detection
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Function to fetch all user emails
  const fetchAllUserEmails = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      console.log('Current user:', data?.user || 'No user logged in');

      if (error) {
        console.error('Error fetching user emails:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const emails = data.map(user => user.email);
        console.log('User emails:', emails);
      } else {
        console.log('No user emails found in the database');
      }
    } catch (err) {
      console.error('Unexpected error fetching user emails:', err.message);
    }
  };

  // Fetch user data using Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setAuthChecking(true);
        setLoading(true);
        setError(null);

        // Get the current authenticated user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error('Auth error:', authError);
          setIsAuthenticated(false);
          setAuthChecking(false);
          return;
        }

        if (!user) {
          setIsAuthenticated(false);
          setAuthChecking(false);
          return;
        }

        setIsAuthenticated(true);

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
          adminApproved: data.admin_approved || false,
          emailVerified: data.email_verified || user.email_confirmed_at !== null,
          college: data.college || '',
          initials: (data.display_name || user.email || 'U')
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
        };

        setUserData(transformedUser);

        // Fetch all user emails after fetching user data
        await fetchAllUserEmails();

      } catch (err) {
        setError(err.message);
        console.error('Error fetching user data:', err);

        // Fallback user data for demonstration
        setUserData({
          uid: 'fallback',
          displayName: 'User',
          email: 'user@example.com',
          avatar: '',
          role: 'student',
          initials: 'U',
          emailVerified: false,
          college: ''
        });
      } finally {
        setLoading(false);
        setAuthChecking(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && 
          !profileDropdownRef.current.contains(event.target) &&
          !profileButtonRef.current?.contains(event.target)) {
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

  // Adjust dropdown position on mobile
  useEffect(() => {
    if (isProfileDropdownOpen && profileDropdownRef.current && profileButtonRef.current) {
      const adjustDropdownPosition = () => {
        const dropdown = profileDropdownRef.current;
        const button = profileButtonRef.current;
        const buttonRect = button.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Reset styles
        dropdown.style.position = 'fixed';
        dropdown.style.zIndex = '9999';
        
        // Calculate available space
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const dropdownHeight = dropdown.offsetHeight;
        
        // Position vertically
        if (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) {
          // Show below
          dropdown.style.top = `${buttonRect.bottom + 8}px`;
          dropdown.style.bottom = 'auto';
        } else {
          // Show above
          dropdown.style.bottom = `${viewportHeight - buttonRect.top + 8}px`;
          dropdown.style.top = 'auto';
        }
        
        // Position horizontally
        const dropdownWidth = Math.min(320, viewportWidth - 32); // Max width with padding
        dropdown.style.width = `${dropdownWidth}px`;
        
        // Align to right edge of button but ensure it stays within viewport
        const rightPosition = viewportWidth - buttonRect.right;
        const maxRight = viewportWidth - dropdownWidth - 16; // 16px padding from edge
        
        if (buttonRect.right - dropdownWidth < 16) {
          // Would go off left edge, align to left edge with padding
          dropdown.style.left = '16px';
          dropdown.style.right = 'auto';
        } else {
          // Align to right edge of button
          dropdown.style.right = `${Math.max(16, rightPosition)}px`;
          dropdown.style.left = 'auto';
        }
        
        // Ensure dropdown doesn't exceed viewport height
        const maxHeight = Math.min(
          spaceBelow >= dropdownHeight ? spaceBelow - 16 : spaceAbove - 16,
          viewportHeight * 0.8
        );
        dropdown.style.maxHeight = `${maxHeight}px`;
        dropdown.style.overflowY = 'auto';
      };
      
      // Adjust position immediately and on scroll/resize
      adjustDropdownPosition();
      window.addEventListener('scroll', adjustDropdownPosition, true);
      window.addEventListener('resize', adjustDropdownPosition);
      
      return () => {
        window.removeEventListener('scroll', adjustDropdownPosition, true);
        window.removeEventListener('resize', adjustDropdownPosition);
      };
    }
  }, [isProfileDropdownOpen]);

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
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const isAdmin = userData?.role === 'admin';
  const isUser = userData?.role === 'student' || userData?.role === 'user';

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

    const gradientClass = isAdmin
      ? 'bg-gradient-to-br from-red-500 to-orange-600'
      : 'bg-gradient-to-br from-blue-500 to-purple-600';

    return (
      <div className={`${size} ${gradientClass} rounded-full flex items-center justify-center shadow-md`}>
        <span className={`text-white font-medium ${textSize}`}>
          {userData?.initials || (isAdmin ? 'A' : 'U')}
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
          <div className="text-sm text-gray-500 flex items-center space-x-1">
            {isAdmin ? (
              <>
                <Shield className="w-3 h-3 text-red-500" />
                <span>Admin • {userData?.email || ''}</span>
              </>
            ) : (
              <>
                <span>{userData?.email || ''}</span>
                {userData?.emailVerified && (
                  <span className="text-green-600">✓</span>
                )}
                {!userData?.emailVerified && (
                  <span className="text-yellow-600">⚠</span>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLogo = () => {
    if (isAdmin) {
      return (
        <div className="flex items-center space-x-3 flex-shrink-0 cursor-pointer" onClick={() => navigate('/admin')}>
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
            <Shield className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-semibold text-gray-900">CodeSapiens Admin</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-3 flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">CS</span>
        </div>
        <span className="text-xl font-semibold text-gray-900">CodeSapiens</span>
      </div>
    );
  };

  const renderDesktopNavigation = () => {
    const hoverColor = isAdmin ? 'hover:text-red-600' : 'hover:text-blue-600';

    if (isAdmin) {
      return (
        <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-auto">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate('/user-list')}
              className={`text-gray-700 ${hoverColor} px-3 py-2 rounded-md font-medium transition-colors flex items-center space-x-2`}
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className={`text-gray-700 ${hoverColor} px-3 py-2 rounded-md font-medium transition-colors`}
            >
              Analytics
            </button>
            <button
              onClick={() => navigate('/mentorship-form')}
              className={`text-gray-700 ${hoverColor} px-3 py-2 rounded-md font-medium transition-colors`}
            >
              MentorShip
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderProfileDropdown = () => {
    if (!isProfileDropdownOpen || loading) return null;

    return (
      <div 
        ref={profileDropdownRef}
        className="bg-white rounded-xl shadow-2xl border border-gray-200 py-2"
        style={{
          position: 'fixed',
          zIndex: 9999,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            {renderUserAvatar('w-12 h-12', 'text-lg')}
            <div className="min-w-0 flex-1">
              {renderUserInfo()}
              {!isAdmin && userData?.college && (
                <div className="text-xs text-gray-400 mt-1 truncate">
                  {userData.college}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="py-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  navigate('/analytics');
                }}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <TextSearch className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>View Analytics</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  navigate('/mentorship-form');
                }}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <BrainCircuit className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Mentorship Form Submission</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  navigate('/resource');
                }}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <BookPlus className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Resources</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  navigate('/resume');
                }}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <FileCheck2 className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Resume Builder(Beta)</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  navigate('/mentorship');
                }}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <Computer className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Mentorship</span>
              </button>
            
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  window.open("https://luma.com/codesapiens?k=c&period=past", "_blank");
                }}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <CalendarSearch className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Events</span>
              </button>
            </>
          )}
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={() => {
                setIsProfileDropdownOpen(false);
                handleSignOut();
              }}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMobileMenu = () => {
    if (!isMobileMenuOpen) return null;

    const hoverColor = isAdmin ? 'hover:text-red-600' : 'hover:text-blue-600';

    return (
      <div ref={mobileMenuRef} className="md:hidden border-t border-gray-200 py-4 space-y-2 bg-white">
        {isAdmin ? (
          <>
            <button
              onClick={() => navigate('/user-list')}
              className={`w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 ${hoverColor} rounded-md font-medium transition-colors flex items-center space-x-2`}
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </button>
            <button
              onClick={() => handleNavClick('/analytics')}
              className={`w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 ${hoverColor} rounded-md font-medium transition-colors`}
            >
              Analytics
            </button>
          </>
        ) : (
          <>
          </>
        )}

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
              {isAdmin ? (
                <>
                </>
              ) : (
                <>
                </>
              )}
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
    );
  };

  // Auth checking state
  if (authChecking) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full">
        <div className="w-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="w-32 h-6 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Not authenticated - don't render navbar
  if (!isAuthenticated) {
    return null;
  }

  // Not admin or user - don't render navbar
  if (!isAdmin && !isUser) {
    return null;
  }

  const notificationCount = isAdmin ? 3 : 1;

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full">
        <div className="w-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            {renderLogo()}

            {/* Desktop Navigation - Centered */}
            {renderDesktopNavigation()}

            {/* Right Section */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Notification Bell */}
              <div className="relative">
              </div>

              {/* User Profile Section */}
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={loading}
                >
                  {renderUserAvatar()}
                  <div className="hidden lg:flex items-center space-x-1">
                    {renderUserInfo()}
                    <ChevronDown className={`w-4 h-4 text-gray-500 ml-1 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
              </div>

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
          {renderMobileMenu()}
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

      {/* Profile Dropdown - Rendered as a portal */}
      {renderProfileDropdown()}

      {/* Backdrop for desktop screens - only show on desktop when dropdown is open */}
      {isProfileDropdownOpen && window.innerWidth >= 768 && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileDropdownOpen(false)}
          style={{ pointerEvents: 'auto' }}
        />
      )}
    </>
  );
}