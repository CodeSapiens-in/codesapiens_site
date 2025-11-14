import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Eye, Calendar, X, Loader2, ChevronDown } from 'lucide-react';

const UserMentorshipFormList = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user's mentorship submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setAuthChecking(true);
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error('[Frontend] : Auth error:', authError?.message);
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);

        // Fetch user data to get mentorship_request
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('mentorship_request')
          .eq('uid', user.id)
          .single();

        if (userError) {
          console.error('[Frontend] : Error fetching user data:', userError.message);
          setError(userError.message);
          return;
        }

        if (!userData || !userData.mentorship_request) {
          setSubmissions([]);
          return;
        }

        // Parse the JSONB mentorship_request array
        let parsedRequests = [];
        try {
          if (Array.isArray(userData.mentorship_request)) {
            parsedRequests = userData.mentorship_request;
          } else if (typeof userData.mentorship_request === 'string') {
            parsedRequests = JSON.parse(userData.mentorship_request);
          }
        } catch (parseError) {
          console.error('[Frontend] : Error parsing mentorship requests:', parseError.message);
          setError('Failed to parse mentorship requests.');
          return;
        }

        // Sort by created_at (newest first)
        parsedRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setSubmissions(parsedRequests);
      } catch (err) {
        setError(err.message);
        console.error('[Frontend] : Error fetching submissions:', err.message);
      } finally {
        setLoading(false);
        setAuthChecking(false);
      }
    };

    fetchSubmissions();
  }, []);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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
          <p className="text-gray-600 mb-4">Please log in to view your submissions.</p>
          <button
            onClick={() => (window.location.href = '/login')}
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
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Mentorship Submissions</h1>
        
        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-600 mb-4">Your mentorship requests will appear here once you submit the form.</p>
            <a
              href="/mentorship-form"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Submit a Request
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">{formatDate(submission.created_at)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Mentorship Request #{index + 1}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Domain: {submission.domain || 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Skills to Develop: {submission.skillsToDevelop?.join(', ') || 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Topics Interested: {submission.topicsInterested?.join(', ') || 'Not specified'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleExpand(index)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                  >
                    <span className="text-sm font-medium">
                      {expandedIndex === index ? 'Hide' : 'View'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Details - Expandable */}
                {expandedIndex === index && (
                  <div className="p-6 bg-gray-50">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Full Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1"><strong>Domain:</strong></p>
                            <p className="text-gray-900">{submission.domain || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1"><strong>Skills to Develop:</strong></p>
                            <p className="text-gray-900">{submission.skillsToDevelop?.join(', ') || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1"><strong>Topics Interested In:</strong></p>
                            <p className="text-gray-900">{submission.topicsInterested?.join(', ') || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1"><strong>Expectations:</strong></p>
                            <p className="text-gray-900">{submission.expectations || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1"><strong>Previous Projects:</strong></p>
                            <p className="text-gray-900">{submission.previousProjects || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1"><strong>Reason for Mentorship:</strong></p>
                            <p className="text-gray-900">{submission.reasonForMentorship || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1"><strong>Submission Time:</strong></p>
                            <p className="text-gray-900">{formatDate(submission.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMentorshipFormList;