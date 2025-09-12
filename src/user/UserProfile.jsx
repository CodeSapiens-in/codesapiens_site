import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  TrendingUp, 
  Award, 
  Calendar, 
  Hash,
  Github,
  Linkedin,
  Globe,
  Menu,
  X,
  Loader2,
  Trophy,
  Save,
  XCircle,
  ChevronDown,
  Plus,
  Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import skillsList from '../assets/skills.json'; // Assuming the JSON is in the assets folder
import academicData from '../assets/academic.json'; // Load academic.json for majors and departments

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [editingSkillIndex, setEditingSkillIndex] = useState(null);
  const [editingSkillValue, setEditingSkillValue] = useState('');
  const [userAchievements, setUserAchievements] = useState({ badges: [], certificates: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [collegeLoading, setCollegeLoading] = useState(false);
  const [collegeError, setCollegeError] = useState(null);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [showEditSkillDropdown, setShowEditSkillDropdown] = useState(false);

  const tabs = ['Overview', 'Skills', 'Achievements', 'Activity'];

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setAuthChecking(true);
        setLoading(true);
        setError(null);

        const { data: { user }, error: authError } = await supabase.auth.getUser();

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

        const { data, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('uid', user.id)
          .single();

        console.log('Fetched profile:', data, profileError);

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError(profileError.message);
          return;
        }

        if (data) {
          const transformedUser = {
            uid: data.uid,
            displayName: data.display_name || 'User',
            email: data.email || user.email || '',
            phoneNumber: data.phone_number || '',
            avatar: data.avatar || '',
            bio: data.bio || 'No bio available',
            college: data.college || 'Not specified',
            role: data.role || 'Student',
            githubUrl: data.github_url || '',
            linkedinUrl: data.linkedin_url || '',
            portfolioUrl: data.portfolio_url || '',
            volunteeringHours: data.volunteering_hours || 0,
            emailVerified: data.email_verified || user.email_confirmed_at !== null,
            phoneVerified: data.phone_verified || false,
            adminApproved: data.admin_approved || false,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            year: data.year || 'Not specified',
            major: data.major || 'Not specified',
            department: data.department || 'Not specified'
          };

          let skills = [];
          if (data.skills) {
            try {
              if (Array.isArray(data.skills)) {
                skills = data.skills;
              } else if (typeof data.skills === 'string') {
                skills = JSON.parse(data.skills);
              }
            } catch (e) {
              console.error('Error parsing skills:', e);
              skills = typeof data.skills === 'string' ? [data.skills] : [];
            }
          }

          setUserData(transformedUser);
          setEditedData(transformedUser);
          setUserSkills(skills);
        } else {
          setError("User profile not found");
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
        setAuthChecking(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch colleges from API
  useEffect(() => {
    const fetchColleges = async () => {
      if (collegeSearch.length < 3) {
        setColleges([]);
        setCollegeLoading(false);
        setCollegeError(null);
        return;
      }
      
      try {
        setCollegeLoading(true);
        setCollegeError(null);
        const response = await fetch('https://colleges-name-api.onrender.com/colleges/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'keyword': collegeSearch
          },
          body: JSON.stringify({})
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        let collegeNames = [];
        if (Array.isArray(data)) {
          collegeNames = data.map(item => item[2].trim());
        } else if (data.colleges && Array.isArray(data.colleges)) {
          collegeNames = data.colleges.map(item => item[2].trim());
        } else if (data.data && Array.isArray(data.data)) {
          collegeNames = data.data.map(item => item[2].trim());
        } else {
          console.warn('Unexpected API response format:', data);
          collegeNames = [];
        }

        setColleges(collegeNames);
      } catch (err) {
        console.error('Error fetching colleges:', err);
        setColleges([]);
        setCollegeError('Failed to fetch colleges. Please try again.');
      } finally {
        setCollegeLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchColleges, 300);
    return () => clearTimeout(timeoutId);
  }, [collegeSearch]);

  const handleEditStart = () => {
    setIsEditing(true);
    setCollegeSearch(editedData.college || '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCollegeChange = (e) => {
    const value = e.target.value;
    setCollegeSearch(value);
    setCollegeError(null);
  };

  const handleCollegeSelect = (e, collegeName) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmedCollegeName = collegeName.trim();
    setEditedData((prev) => ({ ...prev, college: trimmedCollegeName }));
    setCollegeSearch(trimmedCollegeName);
    setColleges([]);
    setCollegeError(null);
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !skillsList.skills.includes(newSkill.trim())) return;
    const updatedSkills = [...userSkills, newSkill.trim()];
    try {
      const { error } = await supabase
        .from('users')
        .update({ skills: updatedSkills })
        .eq('uid', userData.uid);
      if (error) throw error;
      setUserSkills(updatedSkills);
      setNewSkill('');
      setShowSkillDropdown(false);
    } catch (err) {
      console.error('Error adding skill:', err);
      setError(err.message);
    }
  };

  const handleEditSkill = (index) => {
    setEditingSkillIndex(index);
    setEditingSkillValue(userSkills[index]);
    setShowEditSkillDropdown(true);
  };

  const handleSaveSkill = async (index) => {
    if (!editingSkillValue.trim() || !skillsList.skills.includes(editingSkillValue.trim())) return;
    const updatedSkills = [...userSkills];
    updatedSkills[index] = editingSkillValue.trim();
    try {
      const { error } = await supabase
        .from('users')
        .update({ skills: updatedSkills })
        .eq('uid', userData.uid);
      if (error) throw error;
      setUserSkills(updatedSkills);
      setEditingSkillIndex(null);
      setEditingSkillValue('');
      setShowEditSkillDropdown(false);
    } catch (err) {
      console.error('Error updating skill:', err);
      setError(err.message);
    }
  };

  const handleDeleteSkill = async (index) => {
    const updatedSkills = userSkills.filter((_, i) => i !== index);
    try {
      const { error } = await supabase
        .from('users')
        .update({ skills: updatedSkills })
        .eq('uid', userData.uid);
      if (error) throw error;
      setUserSkills(updatedSkills);
    } catch (err) {
      console.error('Error deleting skill:', err);
      setError(err.message);
    }
  };

  const handleSave = async () => {
    if (editedData.college && !colleges.includes(editedData.college) && collegeSearch.length >= 3) {
      setCollegeError('Please select a college from the dropdown.');
      return;
    }

    try {
      const updateData = {
        display_name: editedData.displayName,
        phone_number: editedData.phoneNumber,
        bio: editedData.bio,
        college: editedData.college,
        role: editedData.role,
        github_url: editedData.githubUrl,
        linkedin_url: editedData.linkedinUrl,
        portfolio_url: editedData.portfolioUrl,
        volunteering_hours: parseInt(editedData.volunteeringHours, 10) || 0,
        year: editedData.year,
        major: editedData.major,
        department: editedData.department
      };
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('uid', editedData.uid);
      if (error) throw error;
      setUserData(editedData);
      setIsEditing(false);
      setColleges([]);
      setCollegeSearch('');
      setCollegeError(null);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({ ...userData });
    setColleges([]);
    setCollegeSearch('');
    setCollegeError(null);
    setEditingSkillIndex(null);
    setEditingSkillValue('');
    setShowSkillDropdown(false);
    setShowEditSkillDropdown(false);
  };

  const personalInfo = userData ? [
    { label: "College", value: userData.college, editable: true, type: "college" },
    { label: "Role", value: userData.role, editable: true, type: "text" },
    { label: "Volunteering Hours", value: userData.volunteeringHours?.toString() || "0", editable: true, type: "number" },
    { label: "Year", value: userData.year, editable: true, type: "text" },
    { label: "Major", value: userData.major, editable: true, type: "dropdown", options: academicData.majors },
    { label: "Department", value: userData.department, editable: true, type: "dropdown", options: academicData.departments }
  ] : [];

  const socialLinks = userData ? [
    { label: "GitHub Profile", icon: Github, href: userData.githubUrl || "#", available: !!userData.githubUrl, name: "githubUrl" },
    { label: "LinkedIn Profile", icon: Linkedin, href: userData.linkedinUrl || "#", available: !!userData.linkedinUrl, name: "linkedinUrl" },
    { label: "Portfolio Website", icon: Globe, href: userData.portfolioUrl || "#", available: !!userData.portfolioUrl, name: "portfolioUrl" }
  ] : [];

  const technicalSkills = userSkills.length > 0 ? 
    userSkills.slice(0, 5).map((skill, index) => ({
      skill,
      level: 90 - (index * 5),
      color: ["bg-yellow-500", "bg-blue-500", "bg-green-500", "bg-green-600", "bg-purple-500"][index] || "bg-gray-500"
    })) : 
    [{ skill: "No skills added", level: 0, color: "bg-gray-300" }];

  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view this profile.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              {userData.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt={userData.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xl sm:text-2xl lg:text-3xl">
                  {userData.displayName?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                {isEditing ? (
                  <input 
                    type="text"
                    name="displayName"
                    value={editedData.displayName}
                    onChange={handleInputChange}
                    className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                    placeholder="Enter display name"
                  />
                ) : (
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {userData.displayName}
                  </h1>
                )}
                {userData.emailVerified && (
                  <span className="text-green-500 text-sm bg-green-50 px-2 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
                {!isEditing ? (
                  <button 
                    onClick={handleEditStart}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="Edit profile"
                  >
                    <Edit className="w-5 h-5 text-gray-500 hover:text-blue-500" />
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleSave}
                      className="p-1 hover:bg-green-100 rounded-full transition-colors"
                      title="Save changes"
                    >
                      <Save className="w-5 h-5 text-green-500 hover:text-green-600" />
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="p-1 hover:bg-red-100 rounded-full transition-colors"
                      title="Cancel editing"
                    >
                      <XCircle className="w-5 h-5 text-red-500 hover:text-red-600" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Bio */}
              {isEditing ? (
                <textarea 
                  name="bio"
                  value={editedData.bio}
                  onChange={handleInputChange}
                  className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                  {userData.bio}
                </p>
              )}
              
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                {/* Email */}
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{userData.email}</span>
                </div>
                
                {/* Phone */}
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input 
                      type="tel"
                      name="phoneNumber"
                      value={editedData.phoneNumber}
                      onChange={handleInputChange}
                      className="border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent flex-1"
                      placeholder="Phone number"
                    />
                  </div>
                ) : userData.phoneNumber && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{userData.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-3 sm:px-4 lg:px-6">
          <div className="hidden sm:flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white"
            >
              {tabs.map((tab) => (
                <option key={tab} value={tab}>{tab}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {personalInfo.map((info, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between py-2">
                      <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">{info.label}</span>
                      {isEditing && info.editable ? (
                        <div className="sm:text-right sm:max-w-xs w-full relative">
                          {info.type === "college" ? (
                            <div className="relative">
                              <input 
                                type="text"
                                value={collegeSearch}
                                onChange={handleCollegeChange}
                                className={`text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full pr-8 ${
                                  collegeError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                                }`}
                                placeholder="Search college (min 3 characters)..."
                              />
                              {collegeLoading && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                </div>
                              )}
                              {!collegeLoading && collegeSearch.length >= 3 && (
                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              )}
                              {colleges.length > 0 && (
                                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                                  {colleges.map((college, i) => (
                                    <button
                                      key={i}
                                      onClick={(e) => handleCollegeSelect(e, college)}
                                      className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                    >
                                      {college}
                                    </button>
                                  ))}
                                </div>
                              )}
                              {collegeSearch.length >= 3 && colleges.length === 0 && !collegeLoading && (
                                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 p-4 text-center text-sm text-gray-500">
                                  No colleges found
                                </div>
                              )}
                              {collegeError && (
                                <p className="text-sm text-red-500 mt-1">{collegeError}</p>
                              )}
                            </div>
                          ) : info.type === "number" ? (
                            <input 
                              type="number"
                              name="volunteeringHours"
                              value={editedData.volunteeringHours}
                              onChange={handleInputChange}
                              className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
                              placeholder="Hours"
                              min="0"
                            />
                          ) : info.type === "dropdown" ? (
                            <div className="relative">
                              <select
                                name={info.label.toLowerCase()}
                                value={editedData[info.label.toLowerCase()]}
                                onChange={handleInputChange}
                                className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full pr-8 appearance-none"
                              >
                                <option value="Not specified">Select {info.label}</option>
                                {info.options.map((option, i) => (
                                  <option key={i} value={option}>{option}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                          ) : (
                            <input 
                              type="text"
                              name={info.label.toLowerCase()}
                              value={editedData[info.label.toLowerCase()]}
                              onChange={handleInputChange}
                              className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
                              placeholder={info.label}
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-900 sm:text-right sm:max-w-xs">{info.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {socialLinks.map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <IconComponent className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{link.label}</span>
                        </div>
                        {isEditing ? (
                          <input 
                            type="url"
                            name={link.name}
                            value={editedData[link.name]}
                            onChange={handleInputChange}
                            className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-w-xs"
                            placeholder="https://..."
                          />
                        ) : link.available ? (
                          <a 
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">Not set</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technical Skills */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Technical Skills</h3>
              </div>
              <div className="p-4 sm:p-6">
                {userSkills.length > 0 ? (
                  <div className="space-y-4">
                    {technicalSkills.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          {editingSkillIndex === index ? (
                            <div className="flex items-center space-x-2 w-full relative">
                              <select
                                value={editingSkillValue}
                                onChange={(e) => setEditingSkillValue(e.target.value)}
                                className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 flex-1 pr-8"
                                onFocus={() => setShowEditSkillDropdown(true)}
                              >
                                <option value="">Select a skill</option>
                                {skillsList.skills.map((skill, i) => (
                                  <option key={i} value={skill}>{skill}</option>
                                ))}
                              </select>
                              {showEditSkillDropdown && (
                                <ChevronDown className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              )}
                              <button
                                onClick={() => handleSaveSkill(index)}
                                className="p-1 hover:bg-green-100 rounded-full transition-colors"
                                title="Save skill"
                              >
                                <Save className="w-5 h-5 text-green-500 hover:text-green-600" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingSkillIndex(null);
                                  setShowEditSkillDropdown(false);
                                }}
                                className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                title="Cancel editing"
                              >
                                <XCircle className="w-5 h-5 text-red-500 hover:text-red-600" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm font-medium text-gray-700">{item.skill}</span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditSkill(index)}
                                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                  title="Edit skill"
                                >
                                  <Edit className="w-4 h-4 text-gray-500 hover:text-blue-500" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSkill(index)}
                                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                  title="Delete skill"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                            style={{ width: `${item.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No technical skills added yet</p>
                  </div>
                )}
                <div className="mt-6 flex items-center space-x-2 relative">
                  <select
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 flex-1 pr-8"
                    onFocus={() => setShowSkillDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                  >
                    <option value="">Select a skill</option>
                    {skillsList.skills.map((skill, i) => (
                      <option key={i} value={skill}>{skill}</option>
                    ))}
                  </select>
                  {showSkillDropdown && (
                    <ChevronDown className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  )}
                  <button
                    onClick={handleAddSkill}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                    title="Add skill"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Achievements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Achievements Coming Soon!</h4>
                  <p className="text-gray-500 mb-4">
                    We're working on an exciting achievements system with badges, certifications, and rewards.
                  </p>
                  <p className="text-sm text-gray-400">Stay tuned for updates!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Activity' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 sm:p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Activity Timeline Coming Soon!</h4>
                <p className="text-gray-500 mb-4">
                  We're building a comprehensive activity tracking system to show your learning journey.
                </p>
                <p className="text-sm text-gray-400">Check back soon for detailed activity insights!</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-3 py-2 sm:hidden z-40">
        <div className="flex justify-around">
          {tabs.map((tab, index) => {
            const icons = [TrendingUp, Award, Calendar, Menu];
            const IconComponent = icons[index];
            return (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                  activeTab === tab ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-medium">{tab}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-20 sm:hidden"></div>
    </div>
  );
};

export default UserProfile;