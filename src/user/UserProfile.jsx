import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Trash2,
  Download,
  Upload,
  Eye,
  Check,
  Sparkles,
  Star,
  Zap,
  Code,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import skillsList from "../assets/skills.json";
import academicData from "../assets/academic.json";
import "../styles/profile-animations.css";


// Simple debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Update the extractGithubUsername function to handle both URL formats
const extractGithubUsername = (url) => {
  if (!url) return null;
  try {
    // Handle both full URLs and simple usernames
    if (url.includes('github.com/')) {
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(normalizedUrl);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      return pathParts[0];
    } else {
      // If it's just a username, return it directly
      return url.split("/").pop();
    }
  } catch (e) {
    console.warn("[Frontend] : Invalid GitHub URL format:", url, e.message);
    return null;
  }
};

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [editingSkillIndex, setEditingSkillIndex] = useState(null);
  const [editingSkillValue, setEditingSkillValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [collegeLoading, setCollegeLoading] = useState(false);
  const [collegeError, setCollegeError] = useState(null);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [lastSelectedCollege, setLastSelectedCollege] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [showEditSkillDropdown, setShowEditSkillDropdown] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeError, setResumeError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [usernameError, setUsernameError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const resumeDropRef = useRef(null);
  const collegeInputRef = useRef(null);
  const collegeDropdownRef = useRef(null);

  // Add "Attended Meetups" to tabs
  const tabs = ["Overview", "Skills", "Achievements", "Activity", "Attended Meetups"];

  // Generate years from 2020 to 2040 for the dropdown
  const graduationYears = [
    ...Array.from({ length: 21 }, (_, i) => (2020 + i).toString()),
    "Already Graduated"
  ];

  // Utility function to validate and normalize URLs
  const validateUrl = (url) => {
    if (!url) return "";
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return url.startsWith("http") ? url : `https://${url}`;
    } catch (e) {
      console.warn(`[Frontend] : Invalid URL detected: ${url}`);
      return "";
    }
  };

  // Fetch user data from Supabase and GitHub avatar if GitHub URL exists
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setAuthChecking(true);
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("[Frontend] : Auth error:", authError.message);
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
          .from("users")
          .select("*")
          .eq("uid", user.id)
          .single();

        console.log("[Frontend] : Fetched profile:", data, "Error:", profileError);

        if (profileError) {
          console.error("[Frontend] : Error fetching profile:", profileError.message);
          setError(profileError.message);
          return;
        }

        if (data) {
          const transformedUser = {
            uid: data.uid,
            displayName: data.display_name || "User",
            email: data.email || user.email || "",
            phoneNumber: data.phone_number || "",
            avatar: data.avatar || "",
            bio: data.bio || "No bio available",
            college: data.college || "Not specified",
            githubUrl: data.github_url || "",
            linkedinUrl: data.linkedin_url || "",
            portfolioUrl: data.portfolio_url || "",
            resumeUrl: data.resume_url || null,
            emailVerified: data.email_verified || user.email_confirmed_at !== null,
            phoneVerified: data.phone_verified || false,
            adminApproved: data.admin_approved || false,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            year: data.year === "Already Graduated"
              ? "Already Graduated"
              : data.year
                ? parseInt(data.year, 10)
                : null,
            graduatingyear: data.year === "Already Graduated"
              ? "Already Graduated"
              : data.year?.toString() || "Not specified",
            major: data.major || "Not specified",
            department: data.department || "Not specified",
            username: data.username || "",
            isPublic: data.is_public || false,
            attendedMeetups: data.attended_meetups || [],
          };

          setResumeUrl(transformedUser.resumeUrl);
          let skills = [];
          if (data.skills) {
            try {
              if (Array.isArray(data.skills)) {
                skills = data.skills;
              } else if (typeof data.skills === "string") {
                skills = JSON.parse(data.skills);
              }
            } catch (e) {
              console.error("[Frontend] : Error parsing skills:", e.message);
              skills = typeof data.skills === "string" ? [data.skills] : [];
            }
          }

          // Log social links for debugging
          console.log("[Frontend] : Social links fetched:", {
            githubUrl: transformedUser.githubUrl,
            linkedinUrl: transformedUser.linkedinUrl,
            portfolioUrl: transformedUser.portfolioUrl,
          });

          setUserData(transformedUser);
          setEditedData(transformedUser);
          setUserSkills(skills);
        } else {
          setError("User profile not found");
        }
      } catch (err) {
        setError(err.message);
        console.error("[Frontend] : Error fetching user data:", err.message);
      } finally {
        setLoading(false);
        setAuthChecking(false);
      }
    };

    fetchUserData();
  }, []);

  // Click-outside handling for college dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        collegeInputRef.current &&
        !collegeInputRef.current.contains(event.target) &&
        (!collegeDropdownRef.current || !collegeDropdownRef.current.contains(event.target))
      ) {
        setShowCollegeDropdown(false);
        setColleges([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Username availability check (debounced)
  useEffect(() => {
    if (!isEditing || !editedData?.username) {
      setUsernameError(null);
      return;
    }

    const username = editedData.username.trim();
    const usernameRegex = /^[a-z0-9_]{3,20}$/;

    if (!username) {
      setUsernameError("Username is required.");
      return;
    }

    if (!usernameRegex.test(username)) {
      setUsernameError("Username must be 3-20 characters, alphanumeric or underscores, lowercase.");
      return;
    }

    const checkUsername = debounce(async () => {
      try {
        console.log("[Frontend] : Checking username availability:", username);
        const { data: existingUser } = await supabase
          .from("users")
          .select("username")
          .eq("username", username)
          .neq("uid", userData.uid)
          .single();

        if (existingUser) {
          setUsernameError("This username is already taken. Please choose another.");
        } else {
          setUsernameError(null);
        }
      } catch (err) {
        console.error("[Frontend] : Error checking username:", err.message);
        setUsernameError("Error checking username availability. Please try again.");
      }
    }, 500);

    checkUsername();
  }, [editedData?.username, isEditing, userData?.uid]);

  // College search API
  useEffect(() => {
    if (collegeSearch.length < 3 || collegeSearch === lastSelectedCollege) {
      setShowCollegeDropdown(false);
      setColleges([]);
      setCollegeLoading(false);
      setCollegeError(null);
      return;
    }

    setShowCollegeDropdown(true);
    setCollegeLoading(true);
    setCollegeError(null);

    const fetchColleges = async () => {
      try {
        console.log("[Frontend] : Fetching colleges with keyword:", collegeSearch);
        const response = await fetch("https://colleges-name-api.vercel.app/colleges/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            keyword: collegeSearch,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error || "Unknown error"}`);
        }

        const data = await response.json();
        console.log("[Frontend] : Colleges fetched:", data);

        let collegeNames = [];
        if (Array.isArray(data)) {
          collegeNames = data.map((item) => item[2]?.trim()).filter(Boolean);
        } else if (data.colleges && Array.isArray(data.colleges)) {
          collegeNames = data.colleges.map((item) => item[2]?.trim()).filter(Boolean);
        } else if (data.data && Array.isArray(data.data)) {
          collegeNames = data.data.map((item) => item[2]?.trim()).filter(Boolean);
        } else {
          console.warn("[Frontend] : Unexpected API response format:", data);
          collegeNames = [];
        }

        collegeNames = collegeNames.map((name) => name.replace(/\s*\(ID?:[^)]*\)$/, "").trim());

        setColleges(collegeNames);
      } catch (err) {
        console.error("[Frontend] : Error fetching colleges:", err.message);
        setColleges([]);
        setCollegeError(err.message || "Failed to fetch colleges. Please try again.");
      } finally {
        setCollegeLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchColleges, 300);
    return () => clearTimeout(timeoutId);
  }, [collegeSearch, lastSelectedCollege]);

  // Resume drag-and-drop helpers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setResumeError(null);
    if (!file) return;

    if (!["application/pdf"].includes(file.type)) {
      setResumeError("Please select a PDF file.");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setResumeError("File size must be under 1MB.");
      return;
    }

    setResumeFile(file);
    uploadResume(file);
  };

  const uploadResume = async (file) => {
    if (!file || !userData?.uid) {
      setResumeError("Missing file or user data.");
      return;
    }

    setUploadingResume(true);
    setResumeError(null);

    try {
      console.log("[Frontend] : Uploading resume for userId:", userData.uid, "Filename:", file.name);
      const { data: { user } } = await supabase.auth.getUser();
      console.log("[Frontend] : Auth user ID:", user?.id);

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("userId", userData.uid);

      const response = await fetch("https://colleges-name-api.vercel.app/upload-resume", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("[Frontend] : Upload response:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to upload resume to backend.");
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({ resume_url: result.url })
        .eq("uid", userData.uid);

      if (updateError) {
        console.error("[Frontend] : DB update error:", updateError.message);
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      setResumeUrl(result.url);
      setResumeFile(null);
      console.log("[Frontend] : Resume uploaded successfully:", result.url);
    } catch (err) {
      console.error("[Frontend] : Full upload error:", err.message);
      setResumeError(err.message || "Failed to upload resume. Please try again.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleRemoveResume = async () => {
    if (!resumeUrl || !userData?.uid) {
      setResumeError("No resume or user data available.");
      return;
    }

    setResumeError(null);

    try {
      console.log("[Frontend] : Starting resume removal for userId:", userData.uid, "Resume URL:", resumeUrl);
      const response = await fetch("https://colleges-name-api.vercel.app/delete-resume", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userData.uid }),
      });

      const result = await response.json();
      console.log("[Frontend] : Delete response:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete resume from backend.");
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({ resume_url: null })
        .eq("uid", userData.uid);

      if (updateError) {
        console.error("[Frontend] : DB update error:", updateError.message);
        throw new Error("Storage file deleted, but database update failed.");
      }

      setResumeUrl(null);
      console.log("[Frontend] : Resume removed successfully.");
    } catch (err) {
      console.error("[Frontend] : Error removing resume:", err.message);
      setResumeError(err.message || "Failed to remove resume.");
    }
  };

  // Editing helpers
  const handleEditStart = () => {
    setIsEditing(true);
    setCollegeSearch(editedData.college || "");
    setLastSelectedCollege(editedData.college || "");
    setShowCollegeDropdown(false);
    setSaveError(null);
    setUsernameError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
    setSaveError(null);
    if (name === "username") {
      setUsernameError(null);
    }
  };

  const handleCollegeChange = (e) => {
    const value = e.target.value;
    setCollegeSearch(value);
    setEditedData((prev) => ({ ...prev, college: value }));
    setCollegeError(null);
    setSaveError(null);
  };

  const handleCollegeSelect = (e, collegeName) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmedCollegeName = collegeName.trim();
    setEditedData((prev) => ({ ...prev, college: trimmedCollegeName }));
    setCollegeSearch(trimmedCollegeName);
    setLastSelectedCollege(trimmedCollegeName);
    setColleges([]);
    setShowCollegeDropdown(false);
    setCollegeError(null);
    setSaveError(null);
    if (collegeInputRef.current) {
      collegeInputRef.current.blur();
    }
  };

  // Skills helpers
  const handleAddSkill = async () => {
    if (!newSkill.trim() || !skillsList.skills.includes(newSkill.trim())) return;
    const updatedSkills = [...userSkills, newSkill.trim()];
    try {
      const { error } = await supabase
        .from("users")
        .update({ skills: updatedSkills })
        .eq("uid", userData.uid);
      if (error) throw error;
      setUserSkills(updatedSkills);
      setNewSkill("");
      setShowSkillDropdown(false);
    } catch (err) {
      console.error("[Frontend] : Error adding skill:", err.message);
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
        .from("users")
        .update({ skills: updatedSkills })
        .eq("uid", userData.uid);
      if (error) throw error;
      setUserSkills(updatedSkills);
      setEditingSkillIndex(null);
      setEditingSkillValue("");
      setShowEditSkillDropdown(false);
    } catch (err) {
      console.error("[Frontend] : Error updating skill:", err.message);
      setError(err.message);
    }
  };

  const handleDeleteSkill = async (index) => {
    const updatedSkills = userSkills.filter((_, i) => i !== index);
    try {
      const { error } = await supabase
        .from("users")
        .update({ skills: updatedSkills })
        .eq("uid", userData.uid);
      if (error) throw error;
      setUserSkills(updatedSkills);
    } catch (err) {
      console.error("[Frontend] : Error deleting skill:", err.message);
      setError(err.message);
    }
  };

  // Save profile
  const handleSave = async () => {
    setSaveError(null);
    setUsernameError(null);
    const finalCollege = editedData.college?.trim() || "Not specified";
    const username = editedData.username?.trim();

    if (!username) {
      setUsernameError("Username is required.");
      setSaveError("Username is required.");
      return;
    }

    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setUsernameError("Username must be 3-20 characters, alphanumeric or underscores, lowercase.");
      setSaveError("Invalid username format.");
      return;
    }

    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("username")
        .eq("username", username)
        .neq("uid", userData.uid)
        .single();

      if (existingUser) {
        setUsernameError("This username is already taken. Please choose another.");
        setSaveError("This username is already taken. Please choose another.");
        return;
      }
    } catch (err) {
      console.error("[Frontend] : Error checking username in save:", err.message);
      setUsernameError("Error checking username availability. Please try again.");
      setSaveError("Error checking username availability.");
      return;
    }

    if (finalCollege.length >= 3 && finalCollege !== lastSelectedCollege && !colleges.includes(finalCollege)) {
      setCollegeError("Please select a valid college from the dropdown.");
      setSaveError("Invalid college selection.");
      return;
    }

    try {
      const updateData = {
        display_name: editedData.displayName?.trim() || "User",
        phone_number: editedData.phoneNumber?.trim() || "",
        bio: editedData.bio?.trim() || "No bio available",
        college: finalCollege,
        github_url: validateUrl(editedData.githubUrl?.trim()),
        linkedin_url: validateUrl(editedData.linkedinUrl?.trim()),
        portfolio_url: validateUrl(editedData.portfolioUrl?.trim()),
        // Fix the year handling here
        year: editedData.graduatingyear === "Already Graduated"
          ? "Already Graduated"
          : editedData.graduatingyear
            ? parseInt(editedData.graduatingyear, 10)
            : null,
        major: editedData.major?.trim() || "Not specified",
        department: editedData.department?.trim() || "Not specified",
        username,
        is_public: editedData.isPublic || false,
      };

      console.log("[Frontend] : Updating user data:", updateData);

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("uid", editedData.uid);

      if (error) {
        console.error("[Frontend] : Supabase update error:", error.message);
        throw new Error(`Failed to save profile: ${error.message}`);
      }

      const updatedUserData = {
        ...editedData,
        ...updateData,
      };
      setUserData(updatedUserData);
      setEditedData(updatedUserData);
      setIsEditing(false);
      setColleges([]);
      setCollegeSearch("");
      setShowCollegeDropdown(false);
      setCollegeError(null);
      setLastSelectedCollege(finalCollege);
      setUsernameError(null);
    } catch (err) {
      console.error("[Frontend] : Save error:", err.message);
      setSaveError(err.message || "Failed to save profile. Please try again.");
      if (err.message.includes("duplicate key value violates unique constraint")) {
        setUsernameError("This username is already taken. Please choose another.");
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({ ...userData });
    setColleges([]);
    setCollegeSearch("");
    setShowCollegeDropdown(false);
    setCollegeError(null);
    setSaveError(null);
    setUsernameError(null);
    setLastSelectedCollege("");
    setEditingSkillIndex(null);
    setEditingSkillValue("");
    setShowSkillDropdown(false);
    setShowEditSkillDropdown(false);
  };

  // Data for UI sections
  const personalInfo = userData
    ? [
      { label: "Username", value: userData.username || "Not set", editable: true, type: "text" },
      { label: "College", value: userData.college, editable: true, type: "college" },
      {
        label: "Graduating Year",
        value: userData.year === "Already Graduated"
          ? "Already Graduated"
          : userData.year?.toString() || "Not specified",
        editable: true,
        type: "dropdown",
        options: graduationYears,
        name: "graduatingyear" // Add this to match the state property
      },
      { label: "Major", value: userData.major, editable: true, type: "dropdown", options: academicData.majors },
      { label: "Department", value: userData.department, editable: true, type: "dropdown", options: academicData.departments },
    ]
    : [];

  // Social links
  const socialLinks = userData
    ? [
      { label: "GitHub Profile", icon: Github, href: userData.githubUrl, name: "githubUrl" },
      { label: "LinkedIn Profile", icon: Linkedin, href: userData.linkedinUrl, name: "linkedinUrl" },
      { label: "Portfolio Website", icon: Globe, href: userData.portfolioUrl, name: "portfolioUrl" },
    ]
    : [];

  const technicalSkills =
    userSkills.length > 0
      ? userSkills.slice(0, 5).map((skill, index) => ({
        skill,
        level: 90 - index * 5,
        color: ["bg-yellow-500", "bg-blue-500", "bg-green-500", "bg-green-600", "bg-purple-500"][index] || "bg-gray-500",
      }))
      : [{ skill: "No skills added", level: 0, color: "bg-gray-300" }];

  // Render loading / auth states
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
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
            onClick={() => (window.location.href = "/login")}
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    );
  }

  if (!userData) return null;

  // Main JSX
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
              {userData.githubUrl && extractGithubUsername(userData.githubUrl) ? (
                <img
                  src={`https://avatars.githubusercontent.com/${extractGithubUsername(userData.githubUrl)}`}
                  alt={userData.displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("[Frontend] : Failed to load GitHub avatar");
                    e.target.onError = null;
                    e.target.src = ''; // Clear the failed image
                    // Fallback to initial letter
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="text-white font-bold text-xl sm:text-2xl lg:text-3xl">
                      ${userData.displayName?.charAt(0).toUpperCase() || "U"}
                    </span>`;
                  }}
                />
              ) : (
                <span className="text-white font-bold text-xl sm:text-2xl lg:text-3xl">
                  {userData.displayName?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>

            {/* Name, bio, contact */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      name="displayName"
                      value={editedData.displayName || ""}
                      onChange={handleInputChange}
                      className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent flex-1 min-w-0"
                      placeholder="Enter display name"
                    />
                  ) : (
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                      {userData.displayName} {userData.username ? `(@${userData.username})` : ""}
                    </h1>
                  )}
                  {userData.emailVerified && (
                    <span className="text-green-500 text-sm bg-green-50 px-2 py-1 rounded-full flex-shrink-0">Verified</span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={handleEditStart}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                        title="Edit profile"
                      >
                        <Edit className="w-5 h-5" />
                        <span>Edit Profile</span>
                      </button>

                      {userData.isPublic && userData.username && (
                        <button
                          onClick={() => {
                            const profileUrl = `${window.location.origin}/profile/${userData.username}`;
                            navigator.clipboard.writeText(profileUrl);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isCopied ? "bg-green-600 text-white" : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                          title="Share public profile"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-5 h-5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-5 h-5" />
                              <span>Share Profile</span>
                            </>
                          )}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className={`flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg transition-colors duration-200 text-sm font-medium ${usernameError ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
                          }`}
                        title="Save changes"
                        disabled={!!usernameError}
                      >
                        <Save className="w-5 h-5" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
                        title="Cancel editing"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  name="bio"
                  value={editedData.bio || ""}
                  onChange={handleInputChange}
                  className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">{userData.bio}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{userData.email}</span>
                </div>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={editedData.phoneNumber || ""}
                      onChange={handleInputChange}
                      className="border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent flex-1"
                      placeholder="Phone number"
                    />
                  </div>
                ) : (
                  userData.phoneNumber && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{userData.phoneNumber}</span>
                    </div>
                  )
                )}
              </div>

              {isEditing && (
                <div className="mt-4 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={editedData.isPublic || false}
                    onChange={(e) => setEditedData((prev) => ({ ...prev, isPublic: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-600">
                    Make my profile public (accessible via username)
                  </label>
                </div>
              )}

              {saveError && <p className="text-sm text-red-500 mt-2">{saveError}</p>}
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-4 lg:px-6">
          <div className="hidden sm:flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-700"
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
                <option key={tab} value={tab}>
                  {tab}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Overview Tab */}
        {activeTab === "Overview" && (
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
                            <div className="relative" ref={collegeInputRef}>
                              <input
                                ref={(el) => {
                                  if (el) collegeInputRef.current = el;
                                }}
                                type="text"
                                value={collegeSearch}
                                onChange={handleCollegeChange}
                                className={`text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full pr-8 ${collegeError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
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
                              {showCollegeDropdown && collegeSearch.length >= 3 && (
                                colleges.length > 0 ? (
                                  <div
                                    ref={collegeDropdownRef}
                                    className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1"
                                  >
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
                                ) : !collegeLoading ? (
                                  <div
                                    ref={collegeDropdownRef}
                                    className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 p-4 text-center text-sm text-gray-500"
                                  >
                                    No colleges found
                                  </div>
                                ) : null
                              )}
                              {collegeError && <p className="text-sm text-red-500 mt-2 bg-red-50 px-3 py-1 rounded">{collegeError}</p>}
                            </div>
                          ) : info.type === "dropdown" ? (
                            <div className="relative">
                              <select
                                name={info.name || info.label.toLowerCase().replace(" ", "")}
                                value={editedData[info.name || info.label.toLowerCase().replace(" ", "")] || "Not specified"}
                                onChange={handleInputChange}
                                className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full pr-8 appearance-none"
                              >
                                <option value="Not specified">Select {info.label}</option>
                                {info.options.map((option, i) => (
                                  <option key={i} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="text"
                                name={info.label.toLowerCase().replace(" ", "")}
                                value={editedData[info.label.toLowerCase().replace(" ", "")] || ""}
                                onChange={handleInputChange}
                                className={`text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full ${info.label === "Username" && usernameError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                  }`}
                                placeholder={info.label}
                              />
                              {info.label === "Username" && usernameError && (
                                <p className="text-sm text-red-500 mt-2 bg-red-50 px-3 py-1 rounded w-full">{usernameError}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-900 sm:text-right sm:max-w-xs">
                          {info.label === "Graduating Year" && !info.value ? "Not specified" : info.value}
                        </span>
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
                    const isValidUrl = link.href && validateUrl(link.href) === link.href;
                    console.log(`[Frontend] : Rendering social link - ${link.label}:`, {
                      href: link.href,
                      isValid: isValidUrl,
                    });
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
                            value={editedData[link.name] || ""}
                            onChange={handleInputChange}
                            className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-w-xs"
                            placeholder="https://..."
                          />
                        ) : isValidUrl ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                            onClick={() => console.log(`[Frontend] : Navigating to ${link.label}: ${link.href}`)}
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

            {/* Resume */}
            <div className="bg-white rounded-lg shadow-sm border lg:col-span-2">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Resume</span>
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                {resumeUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Current Resume:</span>
                      <div className="flex items-center space-x-2">
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Resume</span>
                        </a>
                        <a
                          href={resumeUrl}
                          download
                          className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </a>
                        <button
                          onClick={handleRemoveResume}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm text-red-600 mb-4 font-medium">
                        There is already a resume uploaded. Uploading a new one will delete the existing resume.
                      </p>
                      <input
                        type="file"
                        id="resume-upload"
                        accept=".pdf"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="hidden"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 transition-colors"
                      >
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">Click to select new resume (will replace current)</p>
                        <p className="text-xs text-gray-500 mt-1">PDF only, max 1MB</p>
                      </label>
                    </div>
                    {resumeError && <p className="text-sm text-red-500 mt-2 bg-red-50 px-3 py-1 rounded">{resumeError}</p>}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No resume uploaded yet</p>
                    <p className="text-sm text-gray-500 mb-6">Upload your resume to showcase your experience</p>
                    <div
                      ref={resumeDropRef}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                        }`}
                    >
                      {uploadingResume ? (
                        <div className="flex flex-col items-center space-y-2">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                          <p className="text-sm text-blue-600">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <input
                            type="file"
                            id="resume-drop"
                            accept=".pdf"
                            onChange={(e) => handleFileSelect(e.target.files[0])}
                            className="hidden"
                          />
                          <label htmlFor="resume-drop" className="cursor-pointer block">
                            <p className="text-sm font-medium text-gray-700">Drag & drop your resume here, or click to select</p>
                            <p className="text-xs text-gray-500 mt-1">PDF only, max 1MB</p>
                          </label>
                        </>
                      )}
                      {resumeError && <p className="text-sm text-red-500 mt-2 bg-red-50 px-3 py-1 rounded">{resumeError}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === "Skills" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                  <option key={i} value={skill}>
                                    {skill}
                                  </option>
                                ))}
                              </select>
                              {showEditSkillDropdown && (
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                      <option key={i} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                  {showSkillDropdown && (
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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

        {/* Achievements Tab */}
        {activeTab === "Achievements" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Achievements Coming Soon!</h4>
                  <p className="text-gray-500 mb-4">We're working on an exciting achievements system with badges, certifications, and rewards.</p>
                  <p className="text-sm text-gray-400">Stay tuned for updates!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "Activity" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            </div>

            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">Join events and hackathons to build your streak!</p>
            </div>
          </div>
        )}

        {/* Attended Meetups Tab */}
        {activeTab === "Attended Meetups" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Attended Meetups</h2>
            </div>

            {userData.attendedMeetups && userData.attendedMeetups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userData.attendedMeetups.map((meetup, index) => (
                  <div key={index} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                    <h3 className="font-bold text-gray-900 mb-1">{meetup.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(meetup.date).toLocaleDateString()}</span>
                    </div>
                    {meetup.venue && (
                      <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                        📍 {meetup.venue}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No meetups attended yet</p>
                <p className="text-sm text-gray-400 mt-1">Check in at events to see them here!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile bottom navigation */}
      < div className="fixed bottom-0 left-0 right-0 bg-white border-t px-3 py-2 sm:hidden z-40" >
        <div className="flex justify-around">
          {tabs.map((tab, index) => {
            const icons = [TrendingUp, Award, Trophy, TrendingUp, Calendar];
            const IconComponent = icons[index];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${activeTab === tab ? "text-blue-600 bg-blue-50" : "text-gray-600"
                  }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-medium">{tab}</span>
              </button>
            );
          })}
        </div>
      </div >
      <div className="h-20 sm:hidden"></div>
    </div >
  );
};

export default UserProfile;