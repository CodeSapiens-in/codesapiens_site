import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Upload, Trash2, Save, Loader2, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { BACKEND_URL } from '../config';

const AdminHallOfFame = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [fixingStorage, setFixingStorage] = useState(false);

    // Form state
    const [studentName, setStudentName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('hall_of_fame')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEntries(data || []);
        } catch (err) {
            console.error('Error fetching entries:', err);
            setError('Failed to load Hall of Fame entries.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('File size must be less than 5MB.');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
    };

    // Backend API URL for Hall of Fame uploads
    // const BACKEND_URL = 'http://localhost:3001';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select an image.');
            return;
        }

        try {
            setUploading(true);
            setError(null);
            setSuccess(null);

            // Create FormData and send to backend
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('studentName', studentName);
            formData.append('description', description);

            const response = await fetch(`${BACKEND_URL}/upload-hall-of-fame`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to upload image.');
            }

            // Update local state with the new entry
            if (result.entry) {
                setEntries([result.entry, ...entries]);
            } else {
                // Fallback: refetch all entries
                await fetchEntries();
            }

            setStudentName('');
            setDescription('');
            setSelectedFile(null);
            setPreviewUrl(null);
            setSuccess('Entry added successfully!');

        } catch (err) {
            console.error('Error submitting entry:', err);
            setError(err.message || 'Failed to add entry.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;

        try {
            const { error } = await supabase
                .from('hall_of_fame')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setEntries(entries.filter(e => e.id !== id));
        } catch (err) {
            console.error('Error deleting entry:', err);
            setError('Failed to delete entry.');
        }
    };

    const toggleActive = async (entry) => {
        try {
            const { error } = await supabase
                .from('hall_of_fame')
                .update({ is_active: !entry.is_active })
                .eq('id', entry.id);

            if (error) throw error;

            setEntries(entries.map(e =>
                e.id === entry.id ? { ...e, is_active: !e.is_active } : e
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to update status.');
        }
    };

    const fixStorage = async () => {
        try {
            setFixingStorage(true);
            setError(null);
            setSuccess(null);

            const { data, error } = await supabase.storage.createBucket('user-uploads', {
                public: true
            });

            if (error) {
                if (error.message.includes('already exists')) {
                    setSuccess('Storage bucket already exists. You should be good to go!');
                } else {
                    throw error;
                }
            } else {
                setSuccess('Storage bucket created successfully! You can now upload images.');
            }
        } catch (err) {
            console.error('Error fixing storage:', err);
            setError('Failed to create storage bucket: ' + err.message);
        } finally {
            setFixingStorage(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hall of Fame</h1>
                    <p className="text-gray-600 mt-1">Showcase outstanding students on the landing page.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center">
                            <XCircle className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-red-700">{error}</p>
                        </div>
                        {error.includes('Bucket not found') && (
                            <button
                                onClick={fixStorage}
                                disabled={fixingStorage}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                {fixingStorage ? 'Fixing...' : 'Fix Storage Bucket'}
                            </button>
                        )}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <p className="text-green-700">{success}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Entry</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                                    <input
                                        type="text"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Achievement or quote..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="space-y-1 text-center">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="mx-auto h-32 object-cover rounded-md" />
                                            ) : (
                                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            )}
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                    {previewUrl ? 'Change photo' : 'Upload a photo'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                                    {uploading ? 'Uploading...' : 'Add to Hall of Fame'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Entries List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">Current Entries</h2>
                            </div>
                            {loading ? (
                                <div className="p-8 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                                </div>
                            ) : entries.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No entries yet. Add one to get started!
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {entries.map((entry) => (
                                        <li key={entry.id} className="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                                            <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                <img src={entry.image_url} alt={entry.student_name} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{entry.student_name || 'Unnamed Student'}</p>
                                                <p className="text-sm text-gray-500 truncate">{entry.description}</p>
                                                <p className="text-xs text-gray-400 mt-1">Added {new Date(entry.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => toggleActive(entry)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${entry.is_active
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {entry.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminHallOfFame;
