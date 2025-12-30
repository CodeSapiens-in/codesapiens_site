import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Github,
  Linkedin,
  Globe,
  Upload,
  Eye,
  Download,
  Trophy,
  TrendingUp,
  Loader2,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import skillsList from "../assets/skills.json";
import academicData from "../assets/academic.json";

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = ["Overview", "Skills", "Achievements"];

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("users")
          .select("username, display_name, bio, skills, github_url, linkedin_url, portfolio_url, resume_url, college, major, year")
          .eq("username", username)
          .eq("is_public", true)
          .single();

        if (error || !data) {
          throw new Error("Profile not found or not public");
        }

        const transformedProfile = {
          username: data.username,
          displayName: data.display_name || "User",
          bio: data.bio || "No bio available",
          githubUrl: data.github_url || "",
          linkedinUrl: data.linkedin_url || "",
          portfolioUrl: data.portfolio_url || "",
          resumeUrl: data.resume_url || null,
          college: data.college || "Not specified",
          major: data.major || "Not specified",
          year: data.year ? parseInt(data.year, 10) : null,
        };

        setProfile(transformedProfile);
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
        setUserSkills(skills);
        document.title = `${transformedProfile.displayName} (@${transformedProfile.username})`;
      } catch (err) {
        setError(err.message || "Failed to load profile");
        document.title = "Profile Not Found";
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

  const socialLinks = profile
    ? [
        { label: "GitHub Profile", icon: Github, href: profile.githubUrl || "#", available: !!profile.githubUrl },
        { label: "LinkedIn Profile", icon: Linkedin, href: profile.linkedinUrl || "#", available: !!profile.linkedinUrl },
        { label: "Portfolio Website", icon: Globe, href: profile.portfolioUrl || "#", available: !!profile.portfolioUrl },
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

  const personalInfo = profile
    ? [
        { label: "College", value: profile.college },
        { label: "Graduating Year", value: profile.year || "Not specified" },
        { label: "Major", value: profile.major },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
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

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.displayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xl sm:text-2xl lg:text-3xl">
                  {profile.displayName?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  {profile.displayName} (@{profile.username})
                </h1>
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                >
                  Share Profile
                </button>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">{profile.bio}</p>
            </div>
          </div>
        </div>
        <div className="px-3 sm:px-4 lg:px-6">
          <div className="hidden sm:flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-700"
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
      <main className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {personalInfo.map((info, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between py-2">
                      <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">{info.label}</span>
                      <span className="text-sm text-gray-900 sm:text-right sm:max-w-xs">
                        {info.label === "Year" && !info.value ? "Not specified" : info.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                        {link.available ? (
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
            {profile.resumeUrl && (
              <div className="bg-white rounded-lg shadow-sm border lg:col-span-2">
                <div className="p-4 sm:p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Resume</span>
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Current Resume:</span>
                    <div className="flex items-center space-x-2">
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Resume</span>
                      </a>
                      <a
                        href={profile.resumeUrl}
                        download
                        className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "Skills" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Technical Skills</h3>
              </div>
              <div className="p-4 sm:p-6">
                {technicalSkills.length > 0 && technicalSkills[0].skill !== "No skills added" ? (
                  <div className="space-y-4">
                    {technicalSkills.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <span className="text-sm font-medium text-gray-700">{item.skill}</span>
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
                    <p className="text-gray-500 mb-4">No technical skills added</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
      </main>
    </div>
  );
};

export default PublicProfile;