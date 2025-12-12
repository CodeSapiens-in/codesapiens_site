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
  Briefcase,
  MapPin,
} from "lucide-react";
import { toast } from 'react-hot-toast';
import { supabase } from "../lib/supabaseClient";
import { useUser } from '@supabase/auth-helpers-react';
import skillsList from "../assets/skills.json";
import academicData from "../assets/academic.json";
import "../styles/profile-animations.css";
import { BACKEND_URL } from '../config';

// --- CUSTOM VISUAL COMPONENTS ---

const DrawVariant = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.5, ease: "easeInOut" }
  }
};

const FrameworkGrid = () => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden h-full">
    {/* Vertical Lines - Animated */}
    <motion.div
      initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }}
      className="w-px bg-[#0061FE]/40 absolute left-[40px] hidden md:block"
    />
    <motion.div
      initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
      className="w-px bg-[#0061FE]/40 absolute left-[40px] md:left-[260px]"
    />
    <motion.div
      initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ duration: 1.5, delay: 0.4, ease: "easeInOut" }}
      className="w-px bg-[#0061FE]/30 absolute right-[40px] hidden lg:block"
    />

    {/* Horizontal Lines - Animated */}
    <motion.div
      initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.1, ease: "easeInOut" }}
      className="absolute top-[180px] left-0 h-px bg-[#0061FE]/20"
    />
    <motion.div
      initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
      className="absolute top-[500px] left-0 h-px bg-[#0061FE]/20"
    />
    <motion.div
      initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
      className="absolute bottom-[100px] left-0 h-px bg-[#0061FE]/20"
    />
  </div>
);

const HandDrawnCrown = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#C2E812" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform -rotate-12">
    <motion.path
      d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"
      variants={DrawVariant} initial="hidden" animate="visible"
    />
  </svg>
);

const MessyUnderline = () => (
  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
    <path d="M0,5 Q50,10 100,5" stroke="#C2E812" strokeWidth="3" fill="none" />
  </svg>
);


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
  const user = useUser();
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

  // Tabs
  const tabs = ["Overview", "Skills", "Activity", "Attended Meetups"];

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
  }, [user]);

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
        const response = await fetch(`${BACKEND_URL}/colleges/search`, {
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

      const response = await fetch(`${BACKEND_URL}/upload-resume`, {
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
      const response = await fetch(`${BACKEND_URL}/delete-resume`, {
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
      toast.error("Username is required");
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
      toast.success("Profile updated successfully!");
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
    <div className="min-h-screen bg-[#F7F5F2] font-sans text-[#1E1E1E] selection:bg-[#C2E812] selection:text-black relative overflow-x-hidden">

      {/* --- HEADER SECTION --- */}
      <div className="bg-[#1E1E1E] text-white pt-20 pb-32 px-6 relative overflow-visible">
        <FrameworkGrid />

        {/* Doodles */}
        <div className="absolute top-10 right-10 opacity-80 animate-pulse">
          <HandDrawnCrown />
        </div>

        {/* Header GIF */}
        <div className="absolute top-0 right-0 h-full w-1/2 opacity-30 pointer-events-none mix-blend-screen overflow-hidden">
          <img
            src="https://cdn.prod.website-files.com/66c503d081b2f012369fc5d2/674664f62774f41bc13a74c1_ec9f58238cd0ef03e6ae0ba36c19e502.gif"
            alt="Header Decoration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Animated Paper Rocket */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <motion.div
            initial={{ x: "-10vw", y: 100, rotate: 45 }}
            animate={{
              x: "110vw",
              y: [100, 50, 120, -20],
              rotate: [45, 35, 50, 25]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              delay: 1
            }}
            className="absolute top-10"
          >
            <PaperRocket className="w-16 h-16 drop-shadow-lg" />
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">

          {/* Left: Profile Info */}
          <div className="flex-1 w-full md:max-w-2xl">
            <div className="mb-6">
              {isEditing ? (
                <input
                  name="displayName"
                  value={editedData.displayName}
                  onChange={handleInputChange}
                  className="bg-transparent border-b-2 border-[#0061FE] text-4xl md:text-6xl font-black text-white focus:outline-none w-full mb-2"
                />
              ) : (
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 relative inline-block">
                  {userData.displayName}
                  <MessyUnderline />
                </h1>
              )}
              <p className="text-[#0061FE] font-mono text-lg">@{userData.username || "username"}</p>
            </div>

            {isEditing ? (
              <textarea
                name="bio"
                value={editedData.bio}
                onChange={handleInputChange}
                className="w-full bg-white/10 text-white p-3 rounded border border-white/20 focus:border-[#C2E812] outline-none mb-6"
                rows="2"
              />
            ) : (
              <p className="text-xl text-gray-300 leading-relaxed mb-6 max-w-xl">{userData.bio}</p>
            )}

            {/* Meta Data Row */}
            <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-400 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#C2E812]" />
                {isEditing ? <input name="major" value={editedData.major} onChange={handleInputChange} className="bg-transparent border-b border-gray-500 text-white w-32" /> : (userData.major || "N/A")}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0061FE]" />
                India
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF5018]" />
                Class of {isEditing ? <input name="graduatingyear" value={editedData.graduatingyear} onChange={handleInputChange} className="bg-transparent border-b border-gray-500 text-white w-20" /> : (userData.graduatingyear || "N/A")}
              </div>
            </div>
          </div>

          {/* Right: Stats & Actions */}
          <div className="flex flex-col items-end gap-6">
            <div className="flex gap-8 text-center">
              <div>
                <div className="text-3xl font-black text-white">{userData.attendedMeetups.length}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Meetups</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white">{userSkills.length}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Skills</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white">0</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Projects</div>
              </div>
            </div>

            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleEditStart}
                    className="bg-white text-[#1E1E1E] px-6 py-3 font-bold rounded-xl hover:bg-[#C2E812] transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                  >
                    Edit Profile
                  </button>
                  {userData.isPublic && userData.username && (
                    <button
                      onClick={() => {
                        const profileUrl = `${window.location.origin}/profile/${userData.username}`;
                        navigator.clipboard.writeText(profileUrl);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className={`p-3 border-2 border-white/20 rounded-xl transition-colors ${isCopied ? "bg-[#C2E812] text-black border-[#C2E812]" : "hover:bg-white/10 text-white"}`}
                      title="Copy Profile Link"
                    >
                      {isCopied ? <Check className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button onClick={handleSave} className="bg-[#C2E812] text-black px-6 py-3 font-bold rounded-xl hover:bg-[#aacc00]">Save</button>
                  <button onClick={handleCancel} className="bg-white/10 text-white px-6 py-3 font-bold rounded-xl border border-white/20">Cancel</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- OVERLAPPING AVATAR & CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 relative z-20 -mt-20 mb-20">

        {/* Avatar */}
        <div className="relative inline-block mb-12">
          <div className="w-40 h-40 md:w-48 md:h-48 bg-[#1E1E1E] rounded-full border-[6px] border-[#F7F5F2] overflow-hidden shadow-2xl relative z-10">
            {userData.githubUrl ? (
              <img
                src={`https://avatars.githubusercontent.com/${extractGithubUsername(userData.githubUrl)}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-bold bg-[#FF5018] text-white">
                {userData.displayName[0]}
              </div>
            )}
          </div>
          {/* Verified Badge */}
          <div className="absolute bottom-4 right-4 bg-[#0061FE] text-white p-2 rounded-full border-4 border-[#F7F5F2] z-20">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b-2 border-[#1E1E1E]/10">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-lg font-bold tracking-tight transition-all ${activeTab === tab
                ? "text-[#1E1E1E] border-b-4 border-[#FF5018]"
                : "text-gray-400 hover:text-[#1E1E1E]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 gap-8">

          {/* LEFT COL (Full Width) */}
          <div className="space-y-8">
            {activeTab === "Overview" && (
              <>
                {/* Resume / Featured Project */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-[#C2E812] text-[#1E1E1E] text-xs font-black px-4 py-2 rounded-bl-2xl uppercase tracking-widest">Featured</div>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-[#1E1E1E] mb-2">Resume & CV</h3>
                      <p className="text-gray-500">Your professional journey, documented.</p>
                    </div>
                    <div className="bg-[#F7F5F2] p-4 rounded-2xl">
                      <Briefcase className="w-8 h-8 text-[#1E1E1E]" />
                    </div>
                  </div>

                  {userData.resumeUrl ? (
                    <div className="flex items-center gap-4 bg-[#F7F5F2] p-4 rounded-2xl border border-gray-200">
                      <div className="bg-[#FF5018] text-white p-3 rounded-xl">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#1E1E1E]">Resume.pdf</p>
                        <p className="text-xs text-gray-500">Uploaded recently</p>
                      </div>
                      <div className="flex gap-2">
                        <a href={userData.resumeUrl} target="_blank" className="p-2 hover:bg-white rounded-lg transition-colors text-[#0061FE]"><Eye className="w-5 h-5" /></a>
                        <button onClick={handleRemoveResume} className="p-2 hover:bg-white rounded-lg transition-colors text-red-500"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-[#0061FE] hover:bg-[#0061FE]/5 transition-all cursor-pointer"
                      onClick={() => document.getElementById('resume-upload').click()}
                    >
                      <Upload className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                      <p className="font-bold text-gray-600">Upload Resume</p>
                      <p className="text-sm text-gray-400">PDF, max 5MB</p>
                      <input id="resume-upload" type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileSelect(e.target.files[0])} />
                    </div>
                  )}
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-[#1E1E1E] mb-6">Personal Details</h3>
                  <div className="space-y-4">
                    {personalInfo.map((info, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="font-bold text-gray-500 mb-1 sm:mb-0">{info.label}</span>
                        {isEditing && info.editable ? (
                          <div className="sm:text-right sm:max-w-xs w-full relative">
                            {info.type === "college" ? (
                              <div className="relative" ref={collegeInputRef}>
                                <input
                                  ref={(el) => { if (el) collegeInputRef.current = el; }}
                                  type="text"
                                  value={collegeSearch}
                                  onChange={handleCollegeChange}
                                  className={`bg-[#F7F5F2] border-none rounded-lg px-3 py-2 font-bold text-[#1E1E1E] focus:ring-2 focus:ring-[#0061FE] w-full outline-none ${collegeError ? "ring-2 ring-red-500" : ""}`}
                                  placeholder="Search college..."
                                />
                                {collegeLoading && <div className="absolute right-2 top-1/2 -translate-y-1/2"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>}
                                {showCollegeDropdown && collegeSearch.length >= 3 && (
                                  colleges.length > 0 ? (
                                    <div ref={collegeDropdownRef} className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto mt-1 text-left">
                                      {colleges.map((college, i) => (
                                        <button key={i} onClick={(e) => handleCollegeSelect(e, college)} className="w-full px-4 py-3 text-left text-sm font-bold text-[#1E1E1E] hover:bg-[#F7F5F2] transition-colors border-b border-gray-50 last:border-0">
                                          {college}
                                        </button>
                                      ))}
                                    </div>
                                  ) : !collegeLoading ? (
                                    <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 p-4 text-center text-sm text-gray-500">No colleges found</div>
                                  ) : null
                                )}
                              </div>
                            ) : info.type === "dropdown" ? (
                              <div className="relative">
                                <select
                                  name={info.name || info.label.toLowerCase().replace(" ", "")}
                                  value={editedData[info.name || info.label.toLowerCase().replace(" ", "")] || "Not specified"}
                                  onChange={handleInputChange}
                                  className="bg-[#F7F5F2] border-none rounded-lg px-3 py-2 font-bold text-[#1E1E1E] focus:ring-2 focus:ring-[#0061FE] w-full outline-none appearance-none"
                                >
                                  <option value="Not specified">Select {info.label}</option>
                                  {info.options.map((option, i) => <option key={i} value={option}>{option}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>
                            ) : (
                              <input
                                type="text"
                                name={info.label.toLowerCase().replace(" ", "")}
                                value={editedData[info.label.toLowerCase().replace(" ", "")] || ""}
                                onChange={handleInputChange}
                                className="bg-[#F7F5F2] border-none rounded-lg px-3 py-2 font-bold text-[#1E1E1E] focus:ring-2 focus:ring-[#0061FE] w-full outline-none"
                              />
                            )}
                          </div>
                        ) : (
                          <span className="font-bold text-[#1E1E1E] sm:text-right sm:max-w-xs">{info.label === "Graduating Year" && !info.value ? "Not specified" : info.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-[#1E1E1E] mb-6">Recent Activity</h3>
                  {userData.attendedMeetups.length > 0 ? (
                    <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                      {userData.attendedMeetups.slice(0, 3).map((m, i) => (
                        <div key={i} className="relative pl-10">
                          <div className="absolute left-2 top-1.5 w-4 h-4 bg-[#0061FE] rounded-full border-4 border-white shadow-sm"></div>
                          <p className="font-bold text-[#1E1E1E] text-lg">{m.title}</p>
                          <p className="text-sm text-gray-500 mb-1">{new Date(m.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600 bg-[#F7F5F2] inline-block px-3 py-1 rounded-lg">📍 {m.venue || "Online"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 italic">No recent activity to show.</div>
                  )}
                </div>
              </>
            )}

            {activeTab === "Skills" && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black">Skills & Expertise</h3>
                  <div className="flex gap-2">
                    <input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add skill..."
                      className="bg-[#F7F5F2] border-none rounded-xl px-4 py-2 font-bold focus:ring-2 focus:ring-[#C2E812] outline-none"
                    />
                    <button onClick={handleAddSkill} className="bg-[#1E1E1E] text-white p-2 rounded-xl hover:bg-[#C2E812] hover:text-black transition-colors"><Plus /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {userSkills.map((skill, i) => (
                    <div key={i} className="bg-[#F7F5F2] px-5 py-3 rounded-xl font-bold text-[#1E1E1E] flex items-center gap-3 group hover:bg-[#1E1E1E] hover:text-white transition-colors cursor-default">
                      {skill}
                      <button onClick={() => handleDeleteSkill(i)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"><XCircle className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Attended Meetups" && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-[#1E1E1E] mb-6">Attended Meetups</h3>
                {userData.attendedMeetups && userData.attendedMeetups.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {userData.attendedMeetups.map((meetup, index) => (
                      <div key={index} className="p-6 rounded-2xl border border-gray-100 bg-[#F7F5F2] hover:bg-white hover:shadow-md transition-all group">
                        <h3 className="text-lg font-black text-[#1E1E1E] mb-2 group-hover:text-[#0061FE] transition-colors">{meetup.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(meetup.date).toLocaleDateString()}</span>
                        </div>
                        {meetup.venue && (
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            📍 {meetup.venue}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-[#F7F5F2] rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Calendar className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-bold">No meetups attended yet</p>
                    <p className="text-sm text-gray-400 mt-1">Check in at events to see them here!</p>
                  </div>
                )}
              </div>
            )}
          </div>



        </div>

      </div>
    </div>
  );
};
// --- HELPER COMPONENTS ---

const InfoItem = ({ icon: Icon, label, value, isEditing, editInput }) => (
  <div>
    <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider mb-1">
      <Icon className="w-3 h-3" /> {label}
    </div>
    {isEditing && editInput ? editInput : (
      <div className="text-white font-bold text-lg truncate">{value || "N/A"}</div>
    )}
  </div>
);

const SocialLink = ({ icon: Icon, label, url, isEditing }) => {
  if (isEditing) {
    return (
      <div className="flex items-center gap-3 bg-[#F7F5F2] p-3 rounded-xl">
        <Icon className="w-5 h-5 text-gray-400" />
        <input placeholder={label} className="bg-transparent text-[#1E1E1E] text-sm w-full font-bold outline-none" defaultValue={url} />
      </div>
    )
  }

  if (!url) return null;

  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F5F2] transition-colors group">
      <div className="bg-[#F7F5F2] p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
        <Icon className="w-5 h-5 text-[#1E1E1E]" />
      </div>
      <span className="font-bold text-sm text-gray-600 group-hover:text-[#1E1E1E]">{label}</span>
      <ExternalLink className="w-4 h-4 text-gray-300 ml-auto group-hover:text-[#0061FE]" />
    </a>
  )
};

const PaperRocket = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12L22 2L15 22L11 13L2 12Z" fill="#FF5018" stroke="#FF5018" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50" />
  </svg>
);

export default UserProfile;