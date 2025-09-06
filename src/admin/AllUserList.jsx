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
  Search
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AllUserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
          skills: Array.isArray(user.skills) ? user.skills : typeof user.skills === 'string' ? JSON.parse(user.skills) : []
        }));

        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
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
  }, [searchQuery, users]);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    // Add small delay before clearing selectedUser to allow animation to complete
    setTimeout(() => setSelectedUser(null), 300);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
      {/* Header and Search */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
        <p className="text-gray-600 mt-2">Browse through the list of all registered users</p>
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* User Table */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-20">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <tr 
                  key={user.uid} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-200`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{user.displayName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{user.college}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {user.skills.length > 0 ? user.skills.slice(0, 3).join(', ') + (user.skills.length > 3 ? '...' : '') : 'No skills'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
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

      {/* Details Panel */}
      {isDetailsOpen && (
        <>
          {/* Overlay - Fixed with better visibility */}
          <div 
            className="fixed inset-0 bg-gray-800 bg-opacity-50 backdrop-blur-md z-40 transition-all duration-300 ease-in-out"
            onClick={handleCloseDetails}
          />
          
          {/* Details Panel - Full Page */}
          <div 
            className={`fixed top-0 right-0 h-full w-full bg-white shadow-2xl transform transition-all duration-300 ease-in-out overflow-y-auto z-50
              ${isDetailsOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
          >
            {selectedUser && (
              <>
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedUser.displayName}'s Profile</h2>
                  <button
                    onClick={handleCloseDetails}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    title="Close"
                  >
                    <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* User Info */}
                  <div className="flex flex-col items-start space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      {selectedUser.avatar ? (
                        <img 
                          src={selectedUser.avatar} 
                          alt={selectedUser.displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-2xl">
                          {selectedUser.displayName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{selectedUser.displayName}</h3>
                        {selectedUser.emailVerified && (
                          <span className="text-green-500 text-sm bg-green-50 px-2 py-1 rounded-full">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-base text-gray-600 mb-4">{selectedUser.bio}</p>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{selectedUser.email}</span>
                        </div>
                        {selectedUser.phoneNumber && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{selectedUser.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-600">College</span>
                        <span className="text-sm text-gray-900">{selectedUser.college}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-600">Role</span>
                        <span className="text-sm text-gray-900">{selectedUser.role}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-600">Volunteering Hours</span>
                        <span className="text-sm text-gray-900">{selectedUser.volunteeringHours}</span>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
                    </div>
                    <div className="p-4 space-y-4">
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

                  {/* Technical Skills */}
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-semibold text-gray-900">Technical Skills</h3>
                    </div>
                    <div className="p-4 space-y-4">
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
                        <div className="text-center py-8">
                          <p className="text-gray-500">No technical skills added yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Placeholder for Achievements and Activity */}
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                    </div>
                    <div className="p-4 text-center">
                      <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No achievements available</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
                    </div>
                    <div className="p-4 text-center">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No activity available</p>
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