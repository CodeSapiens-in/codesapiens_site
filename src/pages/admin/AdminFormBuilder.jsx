import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Plus,
    Trash2,
    GripVertical,
    CheckSquare,
    AlignLeft,
    Circle,
    ChevronDown,
    X,
    Copy,
    Save,
    Eye,
    Settings,
    ArrowLeft,
    Edit2,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-hot-toast';

// --- Sortable Item Component ---
function SortableItem({ id, children }) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-6">
            {children(attributes, listeners, isDragging)}
        </div>
    );
}

const QUESTION_TYPES = [
    { id: 'short_answer', label: 'Short Answer', icon: AlignLeft },
    { id: 'paragraph', label: 'Paragraph', icon: AlignLeft },
    { id: 'multiple_choice', label: 'Multiple Choice', icon: Circle },
    { id: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
    { id: 'dropdown', label: 'Dropdown', icon: ChevronDown },
];

const FormPreview = ({ title, description, questions }) => {
    return (
        <div className="max-w-3xl mx-auto px-4 pb-20">
            <div className="bg-white border-[3px] border-black p-8 px-10 mb-8 shadow-[8px_8px_0px_0px_#1E1E1E] relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#0061FE]"></div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-[#1E1E1E]">
                    {title || "UNTITLED FORM"}
                </h1>
                <p className="text-lg font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {description || "No description provided."}
                </p>
            </div>

            <div className="space-y-6">
                {questions.map((q) => (
                    <div key={q.id} className="bg-white border-[3px] border-black p-6 md:p-8 shadow-[4px_4px_0px_0px_#1E1E1E]">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-[#1E1E1E] flex items-start gap-1">
                                {q.title}
                                {q.required && <span className="text-red-500 text-lg ml-1">*</span>}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {q.type === 'short_answer' && (
                                <input
                                    type="text"
                                    className="w-full md:w-3/4 bg-gray-50 border-b-[2px] border-gray-300 focus:border-black focus:outline-none py-2 px-1 transition-colors"
                                    placeholder="Your answer"
                                />
                            )}
                            {q.type === 'paragraph' && (
                                <textarea
                                    className="w-full bg-gray-50 border-b-[2px] border-gray-300 focus:border-black focus:outline-none py-2 px-1 transition-colors resize-none h-24"
                                    placeholder="Your answer"
                                />
                            )}
                            {q.type === 'multiple_choice' && (
                                <div className="space-y-2">
                                    {q.options?.map((option, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center w-5 h-5">
                                                <input type="radio" name={q.id} className="peer appearance-none w-5 h-5 rounded-full border-[2px] border-gray-400 checked:border-[#0061FE] checked:border-[6px] transition-all" />
                                            </div>
                                            <span className="text-gray-700 font-medium group-hover:text-black transition-colors">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                            {q.type === 'checkbox' && (
                                <div className="space-y-2">
                                    {q.options?.map((option, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center w-5 h-5">
                                                <input type="checkbox" className="peer appearance-none w-5 h-5 border-[2px] border-gray-400 checked:bg-[#0061FE] checked:border-black transition-all" />
                                                <CheckSquare size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                            </div>
                                            <span className="text-gray-700 font-medium group-hover:text-black transition-colors">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                            {q.type === 'dropdown' && (
                                <div className="relative w-full md:w-1/2">
                                    <select className="w-full appearance-none bg-white border-[2px] border-black px-4 py-3 font-medium focus:shadow-[4px_4px_0px_0px_#C2E812] focus:outline-none cursor-pointer">
                                        <option value="" disabled selected>Choose an option</option>
                                        {q.options?.map((option, idx) => (
                                            <option key={idx} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black">
                                        <ChevronDown size={20} strokeWidth={3} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-between items-center">
                <button className="bg-[#0061FE] text-white px-8 py-3 font-black uppercase tracking-wider border-[2px] border-black shadow-[4px_4px_0px_0px_black] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_black] active:translate-y-2 active:shadow-none transition-all">
                    Submit Form
                </button>
                <button className="text-gray-500 font-bold uppercase tracking-wider text-sm hover:text-black transition-colors">
                    Clear Form
                </button>
            </div>
        </div>
    )
}

export default function AdminFormBuilder() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL
    const [isPreview, setIsPreview] = useState(false);
    const [formTitle, setFormTitle] = useState('UNTITLED FORM');
    const [formDescription, setFormDescription] = useState('Describe your chaos...');
    const [questions, setQuestions] = useState([
        {
            id: 'q1',
            type: 'multiple_choice',
            title: 'New Question',
            required: false,
            options: ['Option 1'],
        }
    ]);
    const [activeId, setActiveId] = useState(null);
    const [selectedQuestionId, setSelectedQuestionId] = useState('q1');
    const [formId, setFormId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchForm(id);
        }
    }, [id]);

    const fetchForm = async (programId) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .eq('id', programId)
                .single();

            if (error) throw error;

            setFormTitle(data.title);
            setFormDescription(data.description || '');
            setQuestions(data.questions || []);
            setFormId(data.id);
            // Reset selection to NONE or firstQ
            setSelectedQuestionId(null);
        } catch (error) {
            console.error('Error fetching form:', error);
            toast.error('Failed to load form');
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleSave = async () => {
        if (!formTitle.trim()) {
            toast.error('Please enter a form title');
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('You must be logged in');
                return;
            }

            let result;
            if (formId) {
                // Update existing
                result = await supabase
                    .from('programs')
                    .update({
                        title: formTitle,
                        description: formDescription,
                        questions: questions,
                        updated_at: new Date()
                    })
                    .eq('id', formId)
                    .select()
                    .single();
            } else {
                // Create new
                result = await supabase
                    .from('programs')
                    .insert({
                        title: formTitle,
                        description: formDescription,
                        questions: questions,
                        is_active: true,
                        created_by: user.id
                    })
                    .select()
                    .single();
            }

            if (result.error) throw result.error;

            setFormId(result.data.id);
            toast.success(formId ? 'Form updated successfully!' : 'Form saved successfully!');
            // navigate('/admin'); // Optional: stay on page to allow editing/viewing submissions
        } catch (err) {
            console.error('Error saving form:', err);
            toast.error('Failed to save form');
        } finally {
            setSaving(false);
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {

        if (active.id !== over.id) {
            setQuestions((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }

        setActiveId(null);
    };

    const addQuestion = () => {
        const newId = `q${Date.now()} `;
        const newQuestion = {
            id: newId,
            type: 'multiple_choice',
            title: 'New Question',
            required: false,
            options: ['Option 1'],
        };
        setQuestions([...questions, newQuestion]);
        setSelectedQuestionId(newId);
    };

    const updateQuestion = (id, field, value) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    const deleteQuestion = (id) => {
        if (questions.length === 1) return;

        setQuestions(questions.filter(q => q.id !== id));
        if (selectedQuestionId === id) {
            setSelectedQuestionId(null);
        }
    };

    const duplicateQuestion = (question) => {
        const newId = `q${Date.now()} `;
        const newQuestion = { ...question, id: newId };
        const index = questions.findIndex(q => q.id === question.id);
        const newQuestions = [...questions];
        newQuestions.splice(index + 1, 0, newQuestion);
        setQuestions(newQuestions);
        setSelectedQuestionId(newId);
    }

    const addOption = (questionId) => {
        setQuestions(questions.map(q =>
            q.id === questionId ? { ...q, options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1} `] } : q
        ));
    };

    const updateOption = (questionId, index, value) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                const newOptions = [...(q.options || [])];
                newOptions[index] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const removeOption = (questionId, index) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                const newOptions = [...(q.options || [])];
                newOptions.splice(index, 1);
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };


    return (
        <AdminLayout>
            <div className="min-h-screen bg-[#F7F5F2] font-sans text-[#1E1E1E] pb-32">

                {/* --- Top Navbar --- */}
                <div className="bg-[#1E1E1E] text-white border-b-[3px] border-black sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-[0px_4px_0px_0px_#C2E812]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/ admin / programs / ${formId}/submissions`)}
                            className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 border-2 border-transparent hover:border-white font-bold uppercase text-sm tracking-wider hover:bg-white/20 transition-all rounded"
                            disabled={!formId} // Only enable if form is saved/has ID
                        >
                            <Users size={16} /> Submissions
                        </button >
                        <div className="flex items-center bg-[#1E1E1E] rounded-full p-1 border border-white/20">
                            <button onClick={() => isPreview ? setIsPreview(false) : navigate('/admin')} className="hover:text-[#C2E812] transition-colors">
                                <ArrowLeft size={24} strokeWidth={3} />
                            </button>
                            <div className="h-8 w-[2px] bg-[#333]"></div>
                            <h1 className="text-xl font-black tracking-tighter italic">FORM<span className="text-[#C2E812]">BUILDER</span>_v1.0</h1>
                        </div>
                    </div >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsPreview(!isPreview)}
                            className={`hidden md:flex items-center gap-2 px-4 py-2 font-bold transition-colors ${isPreview ? 'text-[#C2E812]' : 'hover:text-[#C2E812]'}`}
                        >
                            {isPreview ? <Edit2 size={20} strokeWidth={2.5} /> : <Eye size={20} strokeWidth={2.5} />}
                            <span className="uppercase text-sm tracking-widest">{isPreview ? 'Edit Form' : 'Preview'}</span>
                        </button>
                        {!isPreview && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-[#C2E812] text-black px-6 py-2 border-2 border-transparent hover:border-white font-black uppercase tracking-wider hover:bg-[#b0d110] transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
                                {saving ? 'Saving...' : 'Save Form'}
                            </button>
                        )}
                    </div>
                </div >

                <div className="mt-12">

                    {isPreview ? (
                        <FormPreview
                            title={formTitle}
                            description={formDescription}
                            questions={questions}
                        />
                    ) : (
                        <div className="max-w-4xl mx-auto px-4">
                            {/* --- Form Header --- */}
                            <div className="bg-white border-[3px] border-black p-8 px-10 mb-8 shadow-[8px_8px_0px_0px_#1E1E1E] relative">
                                <div className="absolute top-0 left-0 w-full h-2 bg-[#0061FE]"></div>

                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    className="w-full text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 focus:outline-none border-b-[3px] border-transparent focus:border-[#C2E812] bg-transparent placeholder-gray-300"
                                    placeholder="UNTITLED FORM"
                                />
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    className="w-full text-lg font-medium text-gray-600 focus:outline-none resize-none border-b-[2px] border-transparent focus:border-[#0061FE] bg-transparent placeholder-gray-400 leading-relaxed"
                                    placeholder="Enter form description here..."
                                    rows={1}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                />
                            </div>

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={questions}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-6">
                                        {questions.map((q) => (
                                            <SortableItem key={q.id} id={q.id}>
                                                {(attributes, listeners, isDragging) => (
                                                    <div
                                                        onClick={() => setSelectedQuestionId(q.id)}
                                                        className={`
                                                    p-6 md:p-8 relative transition-all duration-200 bg-white
                                                    border-[3px] border-black
                                                    ${selectedQuestionId === q.id ? 'shadow-[8px_8px_0px_0px_#0061FE] scale-[1.01]' : 'shadow-[4px_4px_0px_0px_#1E1E1E]'}
                                                    ${isDragging ? 'shadow-[12px_12px_0px_0px_#C2E812] z-50 rotate-1' : ''}
                                                `}
                                                    >
                                                        {/* Drag Handle */}
                                                        <div
                                                            {...attributes}
                                                            {...listeners}
                                                            className="absolute top-0 right-0 left-0 h-6 flex justify-center cursor-move hover:bg-gray-50 group"
                                                        >
                                                            <div className="w-16 h-1 mt-2 bg-gray-300 rounded-full group-hover:bg-[#0061FE] transition-colors"></div>
                                                        </div>

                                                        <div className="flex flex-col md:flex-row gap-6 mb-6 mt-4">
                                                            <div className="flex-grow">
                                                                <input
                                                                    type="text"
                                                                    value={q.title}
                                                                    onChange={(e) => updateQuestion(q.id, 'title', e.target.value)}
                                                                    className={`w-full text-xl font-bold p-3 bg-gray-50 border-b-[3px] ${selectedQuestionId === q.id ? 'border-[#0061FE] bg-[#F0F7FF]' : 'border-gray-200'} focus:outline-none focus:border-[#C2E812] transition-colors placeholder-gray-400`}
                                                                    placeholder="Question Title"
                                                                />
                                                            </div>

                                                            {selectedQuestionId === q.id && (
                                                                <div className="w-full md:w-64 flex-shrink-0">
                                                                    <div className="relative">
                                                                        <select
                                                                            value={q.type}
                                                                            onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                                                            className="w-full appearance-none bg-white border-[2px] border-black px-4 py-3 font-bold text-sm focus:shadow-[4px_4px_0px_0px_#C2E812] focus:outline-none cursor-pointer transition-shadow"
                                                                        >
                                                                            {QUESTION_TYPES.map(type => (
                                                                                <option key={type.id} value={type.id}>
                                                                                    {type.label.toUpperCase()}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black">
                                                                            <ChevronDown size={20} strokeWidth={3} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Question Content Area */}
                                                        <div className="mb-6">
                                                            {(q.type === 'short_answer' || q.type === 'paragraph') && (
                                                                <div className="border-b-[2px] border-dashed border-gray-300 py-3 w-3/4 text-gray-400 font-medium italic">
                                                                    {q.type === 'short_answer' ? 'Short answer text goes here...' : 'Long paragraph text goes here...'}
                                                                </div>
                                                            )}

                                                            {(q.type === 'multiple_choice' || q.type === 'checkbox' || q.type === 'dropdown') && (
                                                                <div className="space-y-3 pl-2">
                                                                    {q.options?.map((option, idx) => (
                                                                        <div key={idx} className="flex items-center gap-3 group/option">
                                                                            {q.type === 'multiple_choice' && <div className="w-5 h-5 rounded-full border-[2px] border-black opacity-40" />}
                                                                            {q.type === 'checkbox' && <div className="w-5 h-5 rounded-none border-[2px] border-black opacity-40" />}
                                                                            {q.type === 'dropdown' && <span className="text-black font-black font-mono">{idx + 1}.</span>}

                                                                            <input
                                                                                type="text"
                                                                                value={option}
                                                                                onChange={(e) => updateOption(q.id, idx, e.target.value)}
                                                                                className="flex-grow font-medium text-gray-700 hover:text-black focus:text-black border-b border-transparent hover:border-gray-200 focus:border-black focus:outline-none py-1 bg-transparent transition-all"
                                                                            />

                                                                            {selectedQuestionId === q.id && q.options.length > 1 && (
                                                                                <button
                                                                                    onClick={() => removeOption(q.id, idx)}
                                                                                    className="opacity-0 group-hover/option:opacity-100 p-1 hover:bg-red-50 text-red-500 rounded transition-all"
                                                                                >
                                                                                    <X size={18} strokeWidth={3} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ))}

                                                                    {selectedQuestionId === q.id && (
                                                                        <button
                                                                            onClick={() => addOption(q.id)}
                                                                            className="flex items-center gap-2 mt-3 text-sm font-bold text-[#0061FE] hover:text-[#004bc2] hover:underline decoration-2 underline-offset-4"
                                                                        >
                                                                            <Plus size={16} strokeWidth={4} />
                                                                            ADD OPTION
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Footer Actions */}
                                                        {selectedQuestionId === q.id && (
                                                            <div className="border-t-[2px] border-gray-100 pt-4 flex flex-wrap justify-end items-center gap-4">
                                                                <div className="flex items-center gap-2 mr-auto">
                                                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                                                        <div className="relative">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={q.required}
                                                                                onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                                                                                className="peer sr-only"
                                                                            />
                                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0061FE]"></div>
                                                                        </div>
                                                                        <span className="text-sm font-bold uppercase tracking-wide text-gray-500">Required</span>
                                                                    </label>
                                                                </div>

                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); duplicateQuestion(q); }}
                                                                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                                                                    title="Duplicate"
                                                                >
                                                                    <Copy size={20} strokeWidth={2.5} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}
                                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={20} strokeWidth={2.5} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </SortableItem>
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    )}

                    <div className="h-32"></div> {/* Spacer */}

                </div>

                {/* Floating Sidebar (Desktop) - Only show in Edit Mode */}
                {
                    !isPreview && (
                        <div className="fixed right-8 bottom-8 md:right-12 md:bottom-12 md:top-auto md:translate-y-0 flex flex-col gap-4 z-50">
                            <button
                                onClick={addQuestion}
                                className="w-16 h-16 bg-[#C2E812] text-black border-[3px] border-black rounded-full shadow-[6px_6px_0px_0px_#1E1E1E] flex items-center justify-center hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#1E1E1E] active:translate-y-0 active:shadow-[2px_2px_0px_0px_black] transition-all"
                                title="Add Question"
                            >
                                <Plus size={32} strokeWidth={4} />
                            </button>
                        </div>
                    )
                }

            </div >
        </AdminLayout >
    );
}
