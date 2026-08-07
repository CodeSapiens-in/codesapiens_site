import React, { useState, useEffect, useRef } from 'react';
import { House, Bell, Settings, Menu, X, ChevronDown, User, Loader2, Shield, Users, BarChart3, TextSearch, BookPlus, CalendarSearch, FileCheck2, Computer, BrainCircuit, Code, BookOpen, LayoutDashboard, FileText } from 'lucide-react';
import BreadCrumbs from './ui/BreadCrumbs';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '@supabase/auth-helpers-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavBar() {
  const user = useUser();
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



  // Fetch user data using Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setAuthChecking(true);
        setLoading(true);
        setError(null);



        if (!user) {
          setIsAuthenticated(false);
          setAuthChecking(false);
          return;
        }

        setIsAuthenticated(true);

        // Fetch user profile from the users table
        const { data: rows, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('uid', user.id);

        if (profileError) {
          throw new Error(`Failed to fetch user profile: ${profileError.message}`);
        }

        const data = rows?.[0];

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
  }, [user]);

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
      navigate(href);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear any local state first
      setUserData(null);
      setIsMobileMenuOpen(false);
      setIsProfileDropdownOpen(false);

      // Sign out from Supabase with global scope to clear all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });

      if (error) {
        console.error('Error signing out:', error);
      }

      // Clear any localStorage items that might persist session-like data
      localStorage.removeItem('blogPopupDismissedAt');
      localStorage.removeItem('feedbackPopupDismissedAt');

      // Manually clear Supabase auth tokens from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key.includes('auth-token') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });

      // Force a full page reload to clear all React state and reinitialize
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out error:', err);
      // Even if there's an error, try to redirect
      window.location.href = '/';
    }
  };

  const isAdmin = userData?.role === 'admin';
  const isUser = userData?.role === 'student' || userData?.role === 'user';

  const renderUserAvatar = (size = 'w-9 h-9', textSize = 'text-sm') => {
    if (loading) {
      return (
        <div className={`${size} bg-zinc-200 rounded-full flex items-center justify-center animate-pulse`}>
          <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
        </div>
      );
    }

    if (userData?.avatar) {
      return (
        <img
          src={userData.avatar}
          alt={userData.displayName}
          className={`${size} rounded-full object-cover border-2 border-[#00C6F7]/40 shadow-[0_0_10px_rgba(0,198,247,0.2)]`}
        />
      );
    }

    const gradientClass = isAdmin
      ? 'bg-gradient-to-br from-[#A855F7] to-[#00C6F7]'
      : 'bg-gradient-to-br from-[#00C6F7] to-[#0D0D2B]';

    return (
      <div className={`${size} ${gradientClass} rounded-full flex items-center justify-center shadow-sm`}>
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
          <div className="h-4 bg-zinc-200 rounded animate-pulse w-24"></div>
          {showEmail && <div className="h-3 bg-zinc-200 rounded animate-pulse w-32"></div>}
        </div>
      );
    }

    return (
      <div>
        <div className="font-medium text-white">
          {userData?.displayName || 'Loading...'}
        </div>
        {showEmail && (
          <div className="text-sm text-gray-400 flex items-center space-x-1">
            {isAdmin ? (
              <>
                <Shield className="w-3 h-3 text-[#A855F7]" />
                <span>Admin • {userData?.email || ''}</span>
              </>
            ) : (
              <>
                <span>{userData?.email || ''}</span>
                {userData?.emailVerified && (
                  <span className="text-[#00C6F7]">✓</span>
                )}
                {!userData?.emailVerified && (
                  <span className="text-yellow-500">⚠</span>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLogo = () => {
    return (
      <div className="flex items-center space-x-3 flex-shrink-0 cursor-pointer group" onClick={() => navigate(isAdmin ? '/admin' : '/')}>
        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center overflow-hidden rounded-full shadow-sm transition-transform duration-300 group-hover:scale-105">
          <img
            src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg"
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-lg sm:text-xl font-light tracking-wider text-white group-hover:text-[#00C6F7] transition-colors">
          {isAdmin ? 'CodeSapiens Admin' : 'CodeSapiens'}
        </span>
      </div>
    );
  };

  const renderDesktopNavigation = () => {
    const hoverColor = isAdmin ? 'hover:text-[#A855F7]' : 'hover:text-[#00C6F7]';
    const activeClass = "text-[#00C6F7] bg-[#00C6F7]/10";
    const baseClass = "text-gray-400 px-3 py-2 rounded-md font-light tracking-wide transition-all duration-300 hover:bg-[#0D0D2B] hover:border-[#00C6F7]/30 border border-transparent flex items-center space-x-2";

    if (isAdmin) {
      return (
        <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate('/admin')} className={`${baseClass} ${hoverColor}`}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button onClick={() => navigate('/user-list')} className={`${baseClass} ${hoverColor}`}>
              <Users className="w-4 h-4" />
              <span>Users</span>
            </button>
            <button onClick={() => navigate('/analytics')} className={`${baseClass} ${hoverColor}`}>
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button onClick={() => navigate('/admin/meetups')} className={`${baseClass} ${hoverColor}`}>
              <CalendarSearch className="w-4 h-4" />
              <span>Meetups</span>
            </button>
            <button onClick={() => navigate('/admin/mentorship-programs')} className={`${baseClass} ${hoverColor}`}>
              <BookPlus className="w-4 h-4" />
              <span>Programs</span>
            </button>
            <button onClick={() => navigate('/admin/blogs')} className={`${baseClass} ${hoverColor}`}>
              <FileText className="w-4 h-4" />
              <span>Blogs</span>
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
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          ref={profileDropdownRef}
          className="bg-[#0A0A0F]/98 backdrop-blur-xl rounded-xl shadow-[0_8px_40px_rgba(0,198,247,0.15)] border border-[#00C6F7]/20 py-2"
          style={{
            position: 'fixed',
            zIndex: 9999,
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="px-4 py-3 border-b border-[#00C6F7]/10">
            <div className="flex items-center space-x-3">
              {renderUserAvatar('w-12 h-12', 'text-lg')}
              <div className="min-w-0 flex-1">
                {renderUserInfo()}
                {!isAdmin && userData?.college && (
                  <div className="text-xs text-zinc-400 mt-1 truncate font-light">
                    {userData.college}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="py-2">
            {isAdmin ? (
              <>
                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/analytics'); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[#0D0D2B] hover:text-[#00C6F7] transition-colors">
                  <TextSearch className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>View Analytics</span>
                </button>
                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/mentorship-form'); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[#0D0D2B] hover:text-[#00C6F7] transition-colors">
                  <BrainCircuit className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>Mentorship Form Submission</span>
                </button>
                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/admin/meetups'); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[#0D0D2B] hover:text-[#00C6F7] transition-colors">
                  <CalendarSearch className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>Meetups</span>
                </button>
                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/admin/mentorship-programs'); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[#0D0D2B] hover:text-[#A855F7] transition-colors">
                  <BookPlus className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>Programs</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/profile'); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[#0D0D2B] hover:text-[#00C6F7] transition-colors">
                  <User className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>Profile</span>
                </button>
                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/'); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[#0D0D2B] hover:text-[#00C6F7] transition-colors">
                  <House className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>Dashboard</span>
                </button>
                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/resource'); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[#0D0D2B] hover:text-[#00C6F7] transition-colors">
                  <BookPlus className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>Resources</span>
                </button>

                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/resume-analyzer'); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[#0D0D2B] hover:text-[#00C6F7] transition-colors">
                  <BrainCircuit className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>Resume Analyze</span>
                </button>

                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/mentorship'); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[#0D0D2B] hover:text-[#A855F7] transition-colors">
                  <BrainCircuit className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>Mentorship</span>
                </button>
                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/mentorship-list'); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[#0D0D2B] hover:text-[#00C6F7] transition-colors">
                  <FileCheck2 className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>My Submissions</span>
                </button>
                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('https://luma.com/codesapiens?period=past'); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[#0D0D2B] hover:text-[#00C6F7] transition-colors">
                  <CalendarSearch className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>Events</span>
                </button>
                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/meetups'); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[#0D0D2B] hover:text-[#00C6F7] transition-colors">
                  <Users className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>Meetups</span>
                </button>
                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/programs'); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-[#0D0D2B] hover:text-[#00C6F7] transition-colors">
                  <BookOpen className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>Programs</span>
                </button>

              </>
            )}
            <div className="border-t border-[#00C6F7]/10 mt-2 pt-2">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 active:bg-red-950/60 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderMobileMenu = () => {
    if (!isMobileMenuOpen) return null;

    const hoverColor = isAdmin ? 'hover:text-[#A855F7]' : 'hover:text-[#00C6F7]';

    return (
      <AnimatePresence>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          ref={mobileMenuRef}
          className="md:hidden border-t border-[#00C6F7]/20 py-4 space-y-2 bg-[#0A0A0F]/98 backdrop-blur-md overflow-hidden"
        >
          {isAdmin && (
            <>
              <button onClick={() => navigate('/admin')} className={`w-full text-left block px-4 py-2 text-gray-400 hover:bg-[#0D0D2B] ${hoverColor} rounded-md font-light transition-colors flex items-center space-x-2`}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button onClick={() => navigate('/user-list')} className={`w-full text-left block px-4 py-2 text-gray-400 hover:bg-[#0D0D2B] ${hoverColor} rounded-md font-light transition-colors flex items-center space-x-2`}>
                <Users className="w-4 h-4" />
                <span>Users</span>
              </button>
              <button onClick={() => navigate('/analytics')} className={`w-full text-left block px-4 py-2 text-gray-400 hover:bg-[#0D0D2B] ${hoverColor} rounded-md font-light transition-colors flex items-center space-x-2`}>
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
              <button onClick={() => navigate('/admin/meetups')} className={`w-full text-left block px-4 py-2 text-gray-400 hover:bg-[#0D0D2B] ${hoverColor} rounded-md font-light transition-colors flex items-center space-x-2`}>
                <CalendarSearch className="w-4 h-4" />
                <span>Meetups</span>
              </button>
              <button onClick={() => navigate('/admin/mentorship-programs')} className={`w-full text-left block px-4 py-2 text-gray-400 hover:bg-[#0D0D2B] ${hoverColor} rounded-md font-light transition-colors flex items-center space-x-2`}>
                <BookPlus className="w-4 h-4" />
                <span>Programs</span>
              </button>
              <button onClick={() => navigate('/admin/blogs')} className={`w-full text-left block px-4 py-2 text-gray-400 hover:bg-[#0D0D2B] ${hoverColor} rounded-md font-light transition-colors flex items-center space-x-2`}>
                <FileText className="w-4 h-4" />
                <span>Blogs</span>
              </button>
            </>
          )}


          {/* Mobile User Info */}
          <div className="border-t border-[#00C6F7]/10 pt-4 mt-4">
            <div className="px-4 py-2">
              <div className="flex items-center space-x-3 mb-3">
                {renderUserAvatar('w-10 h-10')}
                <div>
                  {renderUserInfo()}
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left block text-sm text-red-400 hover:text-red-300 py-1 font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Auth checking state
  if (authChecking) {
    return (
      <nav className="bg-[#0A0A0F]/95 backdrop-blur-md shadow-sm border-b border-[#00C6F7]/20 sticky top-0 z-50 w-full">
        <div className="w-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-[70px]">
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 bg-[#0D0D2B] rounded-full animate-pulse border border-[#00C6F7]/20"></div>
              <div className="w-32 h-6 bg-[#0D0D2B] rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <Loader2 className="w-5 h-5 text-[#00C6F7] animate-spin" />
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

  return (
    <>
      <nav className="bg-[#0A0A0F]/95 backdrop-blur-md border-b border-[#00C6F7]/20 sticky top-0 z-50 w-full transition-all duration-300 shadow-[0_4px_24px_0_rgba(0,198,247,0.07)]">
        <div className="w-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-[70px]">
            {/* Logo Section */}
            {renderLogo()}

            {/* Desktop Navigation - Centered */}
            {renderDesktopNavigation()}

            {/* Right Section */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* User Profile Section */}
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-[#0D0D2B] border border-transparent hover:border-[#00C6F7]/30 transition-all duration-200 group"
                  disabled={loading}
                >
                  {renderUserAvatar()}
                  <div className="hidden lg:flex items-center space-x-1">
                    {renderUserInfo()}
                    <ChevronDown className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''} group-hover:text-[#00C6F7]`} />
                  </div>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 text-gray-400 hover:text-[#00C6F7] hover:bg-[#0D0D2B] rounded-lg transition-colors border border-transparent hover:border-[#00C6F7]/30"
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
          <div className="bg-red-950/50 border-b border-red-500/30 px-6 py-2">
            <p className="text-red-400 text-sm">
              Failed to load user data: {error}
            </p>
          </div>
        )}

        {/* Breadcrumbs */}
        <BreadCrumbs />
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