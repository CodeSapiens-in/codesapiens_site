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
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf'; // Use specific import for pdfjs-dist

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
  const GEMINI_API_KEY = 'AIzaSyD-q7Ky0_NIz7x1mjp458yNRVZYVw0HEbk';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  // Configure pdf.js worker to match version 3.11.174
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

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
          const prompt = `Analyze the following resume text and provide detailed feedback on its quality, structure, and content. Highlight strengths, weaknesses, and suggestions for improvement. Also, assign a score from 0 to 100 based on its overall effectiveness. Return the response in JSON format with fields "feedback" (string) and "score" (number).

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
            throw new Error(`Gemini API error: ${response.statusText}`);
          }

          const result = await response.json();
          const generatedText = result.candidates[0].content.parts[0].text;

          // Parse the JSON response from Gemini
          let feedbackData;
          try {
            feedbackData = JSON.parse(generatedText);
          } catch (e) {
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
      <div className="flex-1 block md:hidden">
        <div className="space-y-4">
          {currentUsers.map((user) => (
            <div 
              key={user.uid}
              className="bg-white rounded-lg shadow-sm border p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{user.displayName}</h3>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                      {user.role}
                    </span>
                    <span className="inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                      {user.college}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      Skills: {user.skills.length > 0 ? user.skills.slice(0, 2).join(', ') + (user.skills.length > 2 ? '...' : '') : 'No skills'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => handleViewDetails(user)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="flex-1 overflow-auto hidden md:block">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="block sm:hidden">
            <div className="divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <div key={user.uid} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.displayName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {user.displayName?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{user.displayName}</h3>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Details
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-900 truncate ml-2">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">College:</span>
                      <span className="text-gray-900 truncate ml-2">{user.college}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Skills:</span>
                      <span className="text-gray-900 truncate ml-2">
                        {user.skills.length > 0 ? user.skills.slice(0, 2).join(', ') + (user.skills.length > 2 ? '...' : '') : 'No skills'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-20">
                <tr>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user, index) => (
                  <tr 
                    key={user.uid} 
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-200`}
                  >
                    <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 text-center">{user.displayName}</td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center">{user.email}</td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center">{user.role}</td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center">{user.college}</td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center">
                      {user.skills.length > 0 ? user.skills.slice(0, 3).join(', ') + (user.skills.length > 3 ? '...' : '') : 'No skills'}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-center">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                      >
                        More Details
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
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} transition-colors duration-200`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    currentPage === index + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  } transition-colors duration-200 border border-gray-200`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} transition-colors duration-200`}
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
                <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate pr-2">
                    {selectedUser.displayName}'s Profile
                  </h2>
                  <button
                    onClick={handleCloseDetails}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0"
                    title="Close"
                  >
                    <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {selectedUser.avatar ? (
                        <img 
                          src={selectedUser.avatar} 
                          alt={selectedUser.displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-2xl sm:text-3xl">
                          {selectedUser.displayName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedUser.displayName}</h3>
                        {selectedUser.emailVerified && (
                          <span className="text-green-500 text-sm bg-green-50 px-2 py-1 rounded-full w-fit">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">{selectedUser.bio}</p>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{selectedUser.email}</span>
                        </div>
                        {selectedUser.phoneNumber && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>{selectedUser.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-3 sm:p-4 border-b flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Account Information</h3>
                    </div>
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between py-2">
                        <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">Account Created</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between py-2">
                        <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">Profile Updated</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedUser.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-3 sm:p-4 border-b">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Personal Information</h3>
                    </div>
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between py-2">
                        <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">College</span>
                        <span className="text-sm text-gray-900">{selectedUser.college}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between py-2">
                        <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">Role</span>
                        <span className="text-sm text-gray-900">{selectedUser.role}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between py-2">
                        <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">Major</span>
                        <span className="text-sm text-gray-900">{selectedUser.major}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between py-2">
                        <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">Department</span>
                        <span className="text-sm text-gray-900">{selectedUser.department}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between py-2">
                        <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">Graduating Year</span>
                        <span className="text-sm text-gray-900">{selectedUser.year}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between py-2">
                        <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">Volunteering Hours</span>
                        <span className="text-sm text-gray-900">{selectedUser.volunteeringHours}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-3 sm:p-4 border-b">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Social Links</h3>
                    </div>
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
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
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors duration-200"
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

                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-3 sm:p-4 border-b">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <Download className="w-5 h-5" />
                        <span>Resume</span>
                      </h3>
                    </div>
                    <div className="p-3 sm:p-4">
                      {selectedUser.resumeUrl ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Resume:</span>
                            <div className="flex items-center space-x-2">
                              <a
                                href={selectedUser.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Resume</span>
                              </a>
                              <a
                                href={selectedUser.resumeUrl}
                                download
                                className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </a>
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Resume Feedback</h4>
                            {ocrLoading ? (
                              <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Processing resume...</p>
                              </div>
                            ) : ocrError ? (
                              <div className="text-center">
                                <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <p className="text-sm text-red-600">{ocrError}</p>
                              </div>
                            ) : resumeFeedback && resumeScore !== null ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-600">Score:</span>
                                  <span className="text-sm font-bold text-gray-900">{resumeScore}/100</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-600">Feedback:</span>
                                  <p className="text-sm text-gray-700 mt-1">{resumeFeedback}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No feedback available</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 sm:py-8">
                          <Download className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                          <p className="text-gray-500 text-sm">No resume uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-3 sm:p-4 border-b">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Technical Skills</h3>
                    </div>
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                      {selectedUser.skills.length > 0 ? (
                        technicalSkills.map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">{item.skill}</span>
                              <span className="text-sm text-gray-500">{item.level}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                                style={{ width: `${item.level}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 sm:py-8">
                          <p className="text-gray-500 text-sm">No technical skills added yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-3 sm:p-4 border-b">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Achievements</h3>
                    </div>
                    <div className="p-3 sm:p-4 text-center">
                      <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <p className="text-gray-500 text-sm">No achievements available</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-3 sm:p-4 border-b">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Activity Timeline</h3>
                    </div>
                    <div className="p-3 sm:p-4 text-center">
                      <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <p className="text-gray-500 text-sm">No activity available</p>
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