import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, Calendar, Loader2, Type, List, CheckSquare } from 'lucide-react';

const AdminWeekEditor = () => {
    const navigate = useNavigate();
    const { programId, weekId } = useParams();
    const isEditing = !!weekId;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        week_number: '',
        title: '',
        description: '', // This will be stored in content.description
        submission_open_date: '',
        submission_close_date: '',
        is_submission_open: true
    });

    const [fields, setFields] = useState([]);

    useEffect(() => {
        if (isEditing) {
            fetchWeekData();
        } else {
            // If creating, fetch program to get next week number
            fetchNextWeekNumber();
        }
    }, [programId, weekId]);

    const fetchNextWeekNumber = async () => {
        try {
            const { data, error } = await supabase
                .from('mentorship_weeks')
                .select('week_number')
                .eq('program_id', programId)
                .order('week_number', { ascending: false })
                .limit(1);

            if (error) throw error;
            const nextNum = data && data.length > 0 ? data[0].week_number + 1 : 1;
            setFormData(prev => ({ ...prev, week_number: nextNum }));
        } catch (err) {
            console.error('Error fetching next week number:', err);
        }
    };

    const fetchWeekData = async () => {
        try {
            setFetching(true);
            const { data: week, error } = await supabase
                .from('mentorship_weeks')
                .select('*')
                .eq('id', weekId)
                .single();

            if (error) throw error;

            const formatDate = (dateStr) => dateStr ? new Date(dateStr).toISOString().slice(0, 16) : '';

            // Parse content
            let contentObj = {};
            if (typeof week.content === 'string') {
                // Handle legacy string content
                contentObj = { description: week.content, fields: [] };
            } else {
                contentObj = week.content || { description: '', fields: [] };
            }

            setFormData({
                week_number: week.week_number,
                title: week.title,
                description: contentObj.description || '',
                submission_open_date: formatDate(week.submission_open_date),
                submission_close_date: formatDate(week.submission_close_date),
                is_submission_open: week.is_submission_open
            });

            setFields(contentObj.fields || []);

        } catch (err) {
            console.error('Error fetching week data:', err);
            setError('Failed to load week details.');
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- Field Builder Logic ---

    const addField = () => {
        const newField = {
            id: `field_${Date.now()}`,
            label: '',
            type: 'text', // text, textarea, number, url, email, boolean
            required: false
        };
        setFields([...fields, newField]);
    };

    const updateField = (index, key, value) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setFields(newFields);
    };

    const removeField = (index) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const contentPayload = {
                description: formData.description,
                fields: fields
            };

            const weekData = {
                program_id: programId, // Only needed for insert, ignored on update usually but safe to include
                week_number: parseInt(formData.week_number),
                title: formData.title,
                content: contentPayload,
                submission_open_date: formData.submission_open_date ? new Date(formData.submission_open_date).toISOString() : null,
                submission_close_date: formData.submission_close_date ? new Date(formData.submission_close_date).toISOString() : null,
                is_submission_open: formData.is_submission_open
            };

            if (isEditing) {
                const { error } = await supabase
                    .from('mentorship_weeks')
                    .update(weekData)
                    .eq('id', weekId);
                if (error) throw error;
            } else {
                // Ensure program_id is set for new weeks
                weekData.program_id = programId;
                const { error } = await supabase
                    .from('mentorship_weeks')
                    .insert(weekData);
                if (error) throw error;
            }

            // Navigate back to manager
            // We need to know the program ID to navigate back. 
            // If editing, we might not have it in params if we came from a direct link, but we fetched it.
            // Actually, for simplicity, let's assume we always have programId in URL or we can fetch it.
            // The route structure I planned is /admin/mentorship/program/:programId/week/create
            // and /admin/mentorship/week/:weekId/edit.
            // If editing, we need to fetch programId from the week data if not in URL.

            // Let's just use history back or navigate to a safe place.
            // Ideally we should navigate to /admin/mentorship/manage/:programId

            if (programId) {
                navigate(`/admin/mentorship/manage/${programId}`);
            } else {
                // Fallback if we edited and didn't have programId in URL (fetched week has it)
                // We'll just go back one step
                navigate(-1);
            }

        } catch (err) {
            console.error('Error saving week:', err);
            setError(err.message || 'Failed to save week.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditing ? 'Edit Week' : 'Create Week'}
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            Week Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Week Number</label>
                                <input
                                    type="number"
                                    name="week_number"
                                    value={formData.week_number}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. React Hooks"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Instructions</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="General instructions for this week's task..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Submission Opens</label>
                                <input
                                    type="datetime-local"
                                    name="submission_open_date"
                                    value={formData.submission_open_date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Submission Closes</label>
                                <input
                                    type="datetime-local"
                                    name="submission_close_date"
                                    value={formData.submission_close_date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_submission_open"
                                    checked={formData.is_submission_open}
                                    onChange={handleInputChange}
                                    id="is_submission_open"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_submission_open" className="ml-2 block text-sm text-gray-900">
                                    Submissions Open
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Field Builder */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <List className="w-5 h-5 mr-2 text-blue-600" />
                                Submission Form Builder
                            </h2>
                            <button
                                type="button"
                                onClick={addField}
                                className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Field
                            </button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeField(index)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove Field"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        <div className="md:col-span-6">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Question / Label</label>
                                            <input
                                                type="text"
                                                value={field.label}
                                                onChange={(e) => updateField(index, 'label', e.target.value)}
                                                placeholder="e.g. Project URL"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Input Type</label>
                                            <select
                                                value={field.type}
                                                onChange={(e) => updateField(index, 'type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                            >
                                                <option value="text">Short Text</option>
                                                <option value="textarea">Long Text (Textarea)</option>
                                                <option value="number">Number</option>
                                                <option value="url">URL</option>
                                                <option value="email">Email</option>
                                                <option value="date">Date</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-3 flex items-center pb-2">
                                            <input
                                                type="checkbox"
                                                checked={field.required}
                                                onChange={(e) => updateField(index, 'required', e.target.checked)}
                                                id={`required_${index}`}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`required_${index}`} className="ml-2 block text-sm text-gray-700">
                                                Required
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {fields.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                    <Type className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No fields added. Click "Add Field" to customize the submission form.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                            {isEditing ? 'Update Week' : 'Create Week'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminWeekEditor;
