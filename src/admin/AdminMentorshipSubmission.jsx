import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient"; // Adjust path to your Supabase client
import { Loader2, X, Mail, Info } from "lucide-react";

// Helper component for consistent detail rows
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between py-2">
    <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">{label}</span>
    <span className="text-sm text-gray-900 max-w-md break-words">
      {value || "Not specified"}
    </span>
  </div>
);

const AdminMentorshipSubmission = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users with mentorship requests from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("users")
          .select("uid, email, display_name, mentorship_request")
          .not("mentorship_request", "is", null);

        if (error) {
          console.error("[Frontend] : Error fetching users:", error);
          setError(error.message || "Failed to fetch mentorship submissions.");
          return;
        }

        // Transform data to create a flat list of submissions
        const transformedSubmissions = data.flatMap((user) =>
          Array.isArray(user.mentorship_request)
            ? user.mentorship_request.map((request) => ({
                uid: user.uid,
                displayName: user.display_name || "User",
                email: user.email || "",
                mentorshipRequest: request,
              }))
            : []
        );

        setSubmissions(transformedSubmissions);
        setFilteredSubmissions(transformedSubmissions);
      } catch (err) {
        console.error("[Frontend] : Error fetching users:", err);
        setError(err.message || "Failed to fetch mentorship submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle search
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = submissions.filter(
      (submission) =>
        submission.displayName.toLowerCase().includes(lowerQuery) ||
        submission.email.toLowerCase().includes(lowerQuery) ||
        submission.mentorshipRequest.domain?.toLowerCase().includes(lowerQuery) ||
        submission.mentorshipRequest.skillsToDevelop?.some((skill) =>
          skill.toLowerCase().includes(lowerQuery)
        ) ||
        submission.mentorshipRequest.topicsInterested?.some((topic) =>
          topic.toLowerCase().includes(lowerQuery)
        )
    );
    setFilteredSubmissions(filtered);
  }, [searchQuery, submissions]);

  // Handle view details
  const handleViewDetails = useCallback((submission) => {
    // Find all submissions for the same user
    const userSubmissions = submissions.filter((s) => s.uid === submission.uid);
    setSelectedUser({
      uid: submission.uid,
      displayName: submission.displayName,
      email: submission.email,
      mentorshipRequests: userSubmissions.map((s) => s.mentorshipRequest),
    });
    setIsDetailsOpen(true);
    document.body.style.overflow = "hidden"; // Prevent body scroll
  }, [submissions]);

  // Handle close details
  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
    setTimeout(() => setSelectedUser(null), 300);
    document.body.style.overflow = "unset"; // Restore body scroll
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") handleCloseDetails();
    };
    if (isDetailsOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isDetailsOpen, handleCloseDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading mentorship submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Submissions
          </h2>
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
    <>
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col relative z-0">
        {/* Header and Search */}
        <div className="mb-6 sm:mb-8 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Mentorship Submissions
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Browse through all mentorship request submissions
          </p>
          <div className="mt-3 sm:mt-4 relative">
            <input
              type="text"
              placeholder="Search by name, email, domain, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 sm:p-3 pl-8 sm:pl-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="flex-1 block md:hidden">
          <div className="space-y-4">
            {filteredSubmissions.map((submission, index) => (
              <div key={`${submission.uid}-${index}`} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {submission.displayName?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {submission.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{submission.email}</p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(submission.mentorshipRequest.created_at).toLocaleString()}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {submission.mentorshipRequest.domain || "Not specified"}
                      </span>
                      <span className="inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                        {submission.mentorshipRequest.skillsToDevelop?.slice(0, 2).join(", ") ||
                          "No skills"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleViewDetails(submission)}
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-20">
                <tr>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission, index) => (
                  <tr
                    key={`${submission.uid}-${index}`}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition-colors duration-200`}
                  >
                    <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 text-center">
                      {submission.displayName}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center">
                      {submission.email}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center">
                      {new Date(submission.mentorshipRequest.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center">
                      {submission.mentorshipRequest.domain || "Not specified"}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center">
                      {submission.mentorshipRequest.skillsToDevelop?.slice(0, 3).join(", ") ||
                        "No skills"}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-center">
                      <button
                        onClick={() => handleViewDetails(submission)}
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

      {/* Full-Screen Details Modal */}
      {isDetailsOpen && selectedUser && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-800 bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={handleCloseDetails}
          />

          {/* Modal Content */}
          <div
            className={`fixed inset-0 z-50 transition-all duration-300 ease-out overflow-y-auto ${
              isDetailsOpen
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              className={`min-h-full bg-white ${
                isDetailsOpen
                  ? "translate-y-0"
                  : "translate-y-full md:translate-y-0 md:scale-95"
              }`}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate pr-2">
                  {selectedUser.displayName}'s Mentorship Requests
                </h2>
                <button
                  onClick={handleCloseDetails}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  title="Close"
                >
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* User Info */}
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-2xl sm:text-3xl">
                      {selectedUser.displayName?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {selectedUser.displayName}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 mt-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{selectedUser.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mentorship Requests */}
                {selectedUser.mentorshipRequests.map((request, index) => (
                  <div key={`${selectedUser.uid}-${index}`} className="bg-gray-50 rounded-lg border">
                    <div className="p-3 sm:p-4 border-b border-gray-200">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Mentorship Request #{index + 1} (Submitted: {new Date(request.created_at).toLocaleString()})
                      </h3>
                    </div>
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                      <DetailRow
                        label="Reason for Mentorship"
                        value={request.reasonForMentorship}
                      />
                      <DetailRow
                        label="Skills to Develop"
                        value={request.skillsToDevelop?.join(", ")}
                      />
                      <DetailRow
                        label="Domain"
                        value={request.domain}
                      />
                      <DetailRow
                        label="Topics Interested In"
                        value={request.topicsInterested?.join(", ")}
                      />
                      <DetailRow
                        label="Expectations"
                        value={request.expectations}
                      />
                      <DetailRow
                        label="Previous Projects"
                        value={request.previousProjects}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AdminMentorshipSubmission;