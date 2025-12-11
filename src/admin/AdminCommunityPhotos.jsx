import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Upload, Trash2, Loader2, Image as ImageIcon, CheckCircle, XCircle, Users, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { BACKEND_URL } from '../config';

const AdminCommunityPhotos = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form state
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [participants, setParticipants] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Backend API URL
    // const BACKEND_URL = 'http://localhost:3001';

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('community_photos')
                .select('*')
                .order('order_number', { ascending: true });

            if (error) throw error;
            setEntries(data || []);
        } catch (err) {
            console.error('Error fetching entries:', err);
            setError('Failed to load community photos.');
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

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB.');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select an image.');
            return;
        }

        if (!title.trim()) {
            setError('Please enter a title.');
            return;
        }

        try {
            setUploading(true);
            setError(null);
            setSuccess(null);

            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('title', title);
            formData.append('date', date);
            formData.append('description', description);
            formData.append('participants', participants || '0');
            formData.append('orderNumber', orderNumber || '0');

            const response = await fetch(`${BACKEND_URL}/upload-community-photo`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to upload image.');
            }

            if (result.entry) {
                setEntries([...entries, result.entry].sort((a, b) => a.order_number - b.order_number));
            } else {
                await fetchEntries();
            }

            // Reset form
            setTitle('');
            setDate('');
            setDescription('');
            setParticipants('');
            setOrderNumber('');
            setSelectedFile(null);
            setPreviewUrl(null);
            setSuccess('Photo added successfully!');

        } catch (err) {
            console.error('Error submitting entry:', err);
            setError(err.message || 'Failed to add photo.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this photo?')) return;

        try {
            const { error } = await supabase
                .from('community_photos')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setEntries(entries.filter(e => e.id !== id));
            setSuccess('Photo deleted successfully!');
        } catch (err) {
            console.error('Error deleting entry:', err);
            setError('Failed to delete photo.');
        }
    };

    const toggleActive = async (entry) => {
        try {
            const { error } = await supabase
                .from('community_photos')
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

    const moveOrder = async (entry, direction) => {
        const currentIndex = entries.findIndex(e => e.id === entry.id);
        if (direction === 'up' && currentIndex === 0) return;
        if (direction === 'down' && currentIndex === entries.length - 1) return;

        const newEntries = [...entries];
        const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        // Swap order numbers
        const tempOrder = newEntries[currentIndex].order_number;
        newEntries[currentIndex].order_number = newEntries[swapIndex].order_number;
        newEntries[swapIndex].order_number = tempOrder;

        // Swap positions in array
        [newEntries[currentIndex], newEntries[swapIndex]] = [newEntries[swapIndex], newEntries[currentIndex]];

        setEntries(newEntries);

        // Update in database
        try {
            const response = await fetch(`${BACKEND_URL}/update-community-photo-order`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updates: [
                        { id: newEntries[currentIndex].id, order_number: newEntries[currentIndex].order_number },
                        { id: newEntries[swapIndex].id, order_number: newEntries[swapIndex].order_number }
                    ]
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update order');
            }
        } catch (err) {
            console.error('Error updating order:', err);
            setError('Failed to update order.');
            await fetchEntries(); // Refresh to get correct order
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Community Photos</h1>
                    <p className="text-gray-600 mt-1">Manage event photos displayed on the landing page.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center">
                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                        <p className="text-red-700">{error}</p>
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Photo</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. August Meetup 2025"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="text"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. August 2025"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Brief description of the event..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                                        <input
                                            type="number"
                                            value={participants}
                                            onChange={(e) => setParticipants(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Order #</label>
                                        <input
                                            type="number"
                                            value={orderNumber}
                                            onChange={(e) => setOrderNumber(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo *</label>
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
                                    {uploading ? 'Uploading...' : 'Add Photo'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Entries List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">Current Photos</h2>
                                <p className="text-sm text-gray-500 mt-1">Drag to reorder or use arrows. Lower order numbers appear first.</p>
                            </div>
                            {loading ? (
                                <div className="p-8 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                                </div>
                            ) : entries.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No photos yet. Add one to get started!
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {entries.map((entry, index) => (
                                        <li key={entry.id} className="p-4 sm:p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                                            {/* Order controls */}
                                            <div className="flex flex-col space-y-1">
                                                <button
                                                    onClick={() => moveOrder(entry, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                >
                                                    <ArrowUp className="w-4 h-4" />
                                                </button>
                                                <span className="text-xs text-gray-500 text-center">{entry.order_number}</span>
                                                <button
                                                    onClick={() => moveOrder(entry, 'down')}
                                                    disabled={index === entries.length - 1}
                                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                >
                                                    <ArrowDown className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Image thumbnail */}
                                            <div className="h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                <img src={entry.image_url} alt={entry.title} className="h-full w-full object-cover" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{entry.title}</p>
                                                <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                                    {entry.date && (
                                                        <span className="flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {entry.date}
                                                        </span>
                                                    )}
                                                    {entry.participants > 0 && (
                                                        <span className="flex items-center">
                                                            <Users className="w-3 h-3 mr-1" />
                                                            {entry.participants} participants
                                                        </span>
                                                    )}
                                                </div>
                                                {entry.description && (
                                                    <p className="text-sm text-gray-500 truncate mt-1">{entry.description}</p>
                                                )}
                                            </div>

                                            {/* Actions */}
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

export default AdminCommunityPhotos;
