import React, { useState, useEffect } from 'react';
import {
  Loader2,
  X,
  Mail,
  Phone,
  Github,
  Linkedin,
  Globe,
  Trophy,
  Calendar,
  Search,
  Eye,
  Download,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf'; // Use specific import for pdfjs-dist
import ReactMarkdown from 'react-markdown';

const AvatarWithFallback = ({ src, alt, name, className, textSize }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold ${textSize || 'text-sm'}`}>
        {name?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

const AllUserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const [resumeFeedback, setResumeFeedback] = useState(null);
  const [resumeScore, setResumeScore] = useState(null);
  const usersPerPage = 10;

  // Gemini API Key (Store securely in environment variables in production)
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  // Configure pdf.js worker to match version 3.11.174
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch all users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('users')
          .select('*');

        if (error) {
          console.error('Error fetching users:', error);
          setError(error.message);
          return;
        }

        const transformedUsers = data.map(user => ({
          uid: user.uid,
          displayName: user.display_name || 'User',
          email: user.email || '',
          phoneNumber: user.phone_number || '',
          avatar: user.avatar || '',
          bio: user.bio || 'No bio available',
          college: user.college || 'Not specified',
          role: user.role || 'Student',
          githubUrl: user.github_url || '',
          linkedinUrl: user.linkedin_url || '',
          portfolioUrl: user.portfolio_url || '',
          volunteeringHours: user.volunteering_hours || 0,
          emailVerified: user.email_verified || false,
          phoneVerified: user.phone_verified || false,
          adminApproved: user.admin_approved || false,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          major: user.major || 'Not specified',
          department: user.department || 'Not specified',
          year: user.year || 'Not specified',
          skills: Array.isArray(user.skills) ? user.skills : typeof user.skills === 'string' ? JSON.parse(user.skills) : [],
          resumeUrl: user.resume_url || null
        }));

        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle search
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = users.filter(user =>
      user.displayName.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, users]);

  // Process resume with Tesseract and Gemini
  useEffect(() => {
    if (selectedUser && selectedUser.resumeUrl && isDetailsOpen) {
      const processResume = async () => {
        setOcrLoading(true);
        setOcrError(null);
        setResumeFeedback(null);
        setResumeScore(null);

        try {
          let text = '';

          // Determine if the resume is a PDF or an image
          const isPdf = selectedUser.resumeUrl.toLowerCase().endsWith('.pdf');

          if (isPdf) {
            // Handle PDF: Extract images and process with Tesseract
            const response = await fetch(selectedUser.resumeUrl, {
              headers: { 'Accept': 'application/pdf' },
              mode: 'cors',
              credentials: 'same-origin' // Adjust based on your setup
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch PDF: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            // Process first page only (extend for multiple pages if needed)
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 }); // Increase scale for better OCR

            // Render PDF page to canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;

            // Extract text from rendered canvas
            const { data: { text: ocrText } } = await Tesseract.recognize(
              canvas.toDataURL('image/png'),
              'eng',
              {
                logger: (m) => console.log(m),
              }
            );

            text = ocrText;
          } else {
            // Handle image directly
            const { data: { text: ocrText } } = await Tesseract.recognize(
              selectedUser.resumeUrl,
              'eng',
              {
                logger: (m) => console.log(m),
              }
            );

            text = ocrText;
          }

          if (!text) {
            throw new Error('No text extracted from resume');
          }

          // Send extracted text to Gemini AI
          if (!GEMINI_API_KEY) {
            console.error('Gemini API Key is missing');
            throw new Error('Gemini API Key is not configured. Please check your .env file and restart the server.');
          }

          const prompt = `Analyze the following resume text and provide detailed feedback on its quality, structure, and content. Highlight strengths, weaknesses, and suggestions for improvement. Also, assign a score from 0 to 100 based on its overall effectiveness. Return ONLY the raw JSON response (no markdown formatting) with fields "feedback" (string) and "score" (number).

Resume text:
${text}`;

          const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }]
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error Details:', {
              status: response.status,
              statusText: response.statusText,
              body: errorText
            });
            throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
          }

          const result = await response.json();
          const generatedText = result.candidates[0].content.parts[0].text;

          // Clean up the text (remove markdown code blocks if present)
          const cleanText = generatedText.replace(/```json\n?|\n?```/g, '').trim();

          // Parse the JSON response from Gemini
          let feedbackData;
          try {
            feedbackData = JSON.parse(cleanText);
          } catch (e) {
            console.error('Failed to parse text:', generatedText);
            throw new Error('Invalid JSON response from Gemini AI');
          }

          setResumeFeedback(feedbackData.feedback);
          setResumeScore(feedbackData.score);
        } catch (err) {
          console.error('Error processing resume:', err);
          setOcrError(err.message);
        } finally {
          setOcrLoading(false);
        }
      };

      processResume();
    }
  }, [selectedUser, isDetailsOpen]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
      setResumeFeedback(null);
      setResumeScore(null);
      setOcrError(null);
    }, 300);
  };

  const socialLinks = selectedUser ? [
    { label: "GitHub Profile", icon: Github, href: selectedUser.githubUrl || "#", available: !!selectedUser.githubUrl },
    { label: "LinkedIn Profile", icon: Linkedin, href: selectedUser.linkedinUrl || "#", available: !!selectedUser.linkedinUrl },
    { label: "Portfolio Website", icon: Globe, href: selectedUser.portfolioUrl || "#", available: !!selectedUser.portfolioUrl }
  ] : [];

  const technicalSkills = selectedUser && selectedUser.skills.length > 0 ?
    selectedUser.skills.slice(0, 5).map((skill, index) => ({
      skill,
      level: 90 - (index * 5),
      color: ["bg-yellow-500", "bg-blue-500", "bg-green-500", "bg-green-600", "bg-purple-500"][index] || "bg-gray-500"
    })) :
    [{ skill: "No skills added", level: 0, color: "bg-gray-300" }];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Users</h2>
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

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col">
      {/* Header and Search */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Users</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Browse through the list of all registered users</p>
        <div className="mt-3 sm:mt-4 relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 sm:p-3 pl-8 sm:pl-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden">
        <div className="space-y-4">
          {currentUsers.map((user) => (
            <div
              key={user.uid}
              className="bg-white rounded-xl shadow-md border-l-4 border-l-blue-600 p-5 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <AvatarWithFallback
                      src={user.avatar}
                      alt={user.displayName}
                      name={user.displayName}
                      className="w-full h-full rounded-full object-cover"
                      textSize="text-xl"
                    />
                  </div>
                  {/* Status indicator */}
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.emailVerified ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-gray-900 truncate">{user.displayName}</h3>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold ${user.role === 'Admin' ? 'bg-red-100 text-red-700' :
                      user.role === 'Volunteer' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                      {user.role}
                    </span>
                    {user.emailVerified && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-600 font-medium truncate">
                    📍 {user.college}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleViewDetails(user)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Full Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="flex-1 overflow-auto hidden md:block">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#101010] sticky top-0 z-20 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">User Profile</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Education</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Skills</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentUsers.map((user, index) => (
                  <tr
                    key={user.uid}
                    className="hover:bg-blue-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                            <AvatarWithFallback
                              src={user.avatar}
                              alt=""
                              name={user.displayName}
                              className="h-10 w-10 rounded-full object-cover"
                              textSize="text-sm"
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{user.displayName}</div>
                          <div className="text-xs text-gray-500">Joined {formatDate(user.createdAt).split(',')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{user.email}</div>
                      {user.emailVerified ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${user.role === 'Admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'Volunteer' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{user.college}</div>
                      <div className="text-xs">{user.major || 'Major not set'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {user.skills.length > 0 ? (
                          user.skills.slice(0, 2).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs italic">No skills</span>
                        )}
                        {user.skills.length > 2 && (
                          <span className="px-2 py-0.5 rounded text-xs bg-gray-50 text-gray-500">
                            +{user.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-lg text-xs font-bold transition-all transform hover:scale-105 shadow-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pb-8">
          <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            Showing <span className="font-bold text-gray-900">{indexOfFirstUser + 1}</span> to <span className="font-bold text-gray-900">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of <span className="font-bold text-gray-900">{filteredUsers.length}</span> users
          </div>
          <div className="flex items-center space-x-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all duration-200 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex space-x-1 px-2 border-x border-gray-100">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-200 ${currentPage === index + 1
                    ? 'bg-black text-white shadow-md transform scale-105'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-all duration-200 ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Details Panel */}
      {isDetailsOpen && (
        <>
          <div
            className="fixed inset-0 bg-gray-800 bg-opacity-50 backdrop-blur-md z-40 transition-all duration-300 ease-in-out"
            onClick={handleCloseDetails}
          />

          <div
            className={`fixed top-0 right-0 h-full w-full bg-white shadow-2xl transform transition-all duration-300 ease-in-out overflow-y-auto z-50
              ${isDetailsOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
          >
            {selectedUser && (
              <>
                <div className="relative">
                  {/* Detailed Panel Hero Header */}
                  <div className="h-40 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 relative rounded-t-2xl">
                    <button
                      onClick={handleCloseDetails}
                      className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm z-20"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute -bottom-12 left-6 sm:left-10">
                      <div className="w-32 h-32 rounded-full p-1.5 bg-white shadow-xl">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                          <AvatarWithFallback
                            src={selectedUser.avatar}
                            alt={selectedUser.displayName}
                            name={selectedUser.displayName}
                            className="w-full h-full object-cover"
                            textSize="text-4xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Content */}
                  <div className="pt-16 pb-8 px-6 sm:px-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
                      <div>
                        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                          {selectedUser.displayName}
                          {selectedUser.emailVerified && (
                            <span className="text-blue-500" title="Verified">
                              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            </span>
                          )}
                        </h2>
                        <p className="text-lg text-gray-500 font-medium mt-1">{selectedUser.bio || "No bio provided"}</p>

                        <div className="flex flex-wrap text-sm text-gray-600 mt-3 gap-y-2 gap-x-6">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{selectedUser.email}</span>
                          </div>
                          {selectedUser.phoneNumber && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-green-500" />
                              <span className="font-medium">{selectedUser.phoneNumber}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">Joined {formatDate(selectedUser.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-4 py-2 rounded-lg font-bold text-sm ${selectedUser.role === 'Admin' ? 'bg-red-100 text-red-700' :
                          selectedUser.role === 'Volunteer' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                          {selectedUser.role}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-blue-500" />
                                Academic & Personal
                              </h3>
                            </div>
                            <div className="p-4 space-y-4">
                              <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-sm font-medium text-gray-500">College</span>
                                <span className="text-sm font-bold text-gray-900 text-right">{selectedUser.college}</span>
                              </div>
                              <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-sm font-medium text-gray-500">Major</span>
                                <span className="text-sm font-bold text-gray-900 text-right">{selectedUser.major}</span>
                              </div>
                              <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-sm font-medium text-gray-500">Department</span>
                                <span className="text-sm font-bold text-gray-900 text-right">{selectedUser.department}</span>
                              </div>
                              <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-sm font-medium text-gray-500">Year</span>
                                <span className="text-sm font-bold text-gray-900 text-right">{selectedUser.year}</span>
                              </div>
                              <div className="flex justify-between pt-2">
                                <span className="text-sm font-medium text-gray-500">Volunteering</span>
                                <span className="text-sm font-bold text-green-600 text-right">{selectedUser.volunteeringHours} Hours</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-500" />
                                Key Milestones
                              </h3>
                            </div>
                            <div className="p-4 space-y-4">
                              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <span className="text-sm font-medium text-gray-500">Joined</span>
                                <span className="text-sm font-bold text-gray-900">{formatDate(selectedUser.createdAt)}</span>
                              </div>
                              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <span className="text-sm font-medium text-gray-500">Last Updated</span>
                                <span className="text-sm font-bold text-gray-900">{formatDate(selectedUser.updatedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-green-500" />
                                Social Presence
                              </h3>
                            </div>
                            <div className="p-4 space-y-3">
                              {socialLinks.map((link, index) => {
                                const IconComponent = link.icon;
                                return (
                                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                                        <IconComponent className="w-4 h-4 text-gray-600" />
                                      </div>
                                      <span className="text-sm font-bold text-gray-700">{link.label}</span>
                                    </div>
                                    {link.available ? (
                                      <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200 hover:bg-blue-50 px-3 py-1 rounded-full transition-all"
                                      >
                                        Visit
                                      </a>
                                    ) : (
                                      <span className="text-gray-400 text-xs italic">Not Connected</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Download className="w-5 h-5 text-amber-500" />
                                Resume Analysis
                              </h3>
                            </div>
                            <div className="p-4">
                              {selectedUser.resumeUrl ? (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <span className="text-sm font-bold text-blue-900">Resume File</span>
                                    <div className="flex items-center space-x-2">
                                      <a
                                        href={selectedUser.resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white text-blue-600 rounded-md hover:scale-105 transition-transform shadow-sm"
                                        title="View"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </a>
                                      <a
                                        href={selectedUser.resumeUrl}
                                        download
                                        className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:scale-105 transition-all shadow-sm"
                                        title="Download"
                                      >
                                        <Download className="w-4 h-4" />
                                      </a>
                                    </div>
                                  </div>

                                  <div className="border-t border-gray-100 pt-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">AI Evaluation</h4>
                                    {ocrLoading ? (
                                      <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                                        <p className="text-xs font-medium text-gray-500">Analyzing resume content...</p>
                                      </div>
                                    ) : ocrError ? (
                                      <div className="text-center py-6 bg-red-50 rounded-xl border border-red-100">
                                        <X className="w-6 h-6 text-red-500 mx-auto mb-2" />
                                        <p className="text-xs text-red-600 font-medium max-w-xs mx-auto">{ocrError}</p>
                                      </div>
                                    ) : resumeFeedback && resumeScore !== null ? (
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl text-white shadow-lg">
                                          <span className="text-sm font-bold opacity-80">Overall Score</span>
                                          <div className="flex items-end gap-1">
                                            <span className="text-3xl font-black text-white">{resumeScore}</span>
                                            <span className="text-sm font-medium mb-1 opacity-60">/100</span>
                                          </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                          <div className="text-xs font-bold text-gray-400 uppercase mb-2">Detailed Feedback</div>
                                          <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none prose-p:my-1">
                                            <ReactMarkdown>{resumeFeedback}</ReactMarkdown>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-sm text-gray-400 italic">No analysis available yet</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Download className="w-6 h-6 text-gray-400" />
                                  </div>
                                  <p className="text-gray-500 text-sm font-medium">No resume uploaded</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            Technical Skills
                          </h3>
                        </div>
                        <div className="p-4 space-y-4">
                          {selectedUser.skills.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {technicalSkills.map((item, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-gray-700">{item.skill}</span>
                                    <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{item.level}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${item.color} transition-all duration-500 ease-out`}
                                      style={{ width: `${item.level}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                              <p className="text-gray-500 text-sm font-medium">No technical skills added yet</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Achievements
                          </h3>
                        </div>
                        <div className="p-8 text-center bg-gray-50">
                          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm font-medium">No achievements to display</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-pink-500" />
                            Activity Timeline
                          </h3>
                        </div>
                        <div className="p-8 text-center bg-gray-50">
                          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm font-medium">No recent activity</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AllUserList;