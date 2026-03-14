import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

const FeedbackPopup = ({ onClose, userId }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('feedback')
                .insert([
                    { user_id: userId, message: message.trim() }
                ]);

            if (error) throw error;

            const { error: updateError } = await supabase
                .from('users')
                .update({ last_feedback_at: new Date().toISOString() })
                .eq('uid', userId);

            if (updateError) console.error('Error updating user feedback timestamp:', updateError);

            toast.success('Thank you for your feedback!');
            onClose();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">

            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#0A0A0F]/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Popup */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="bg-[#0D0D2B]/95 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-[0_8px_48px_rgba(0,198,247,0.2)] border border-[#00C6F7]/25 relative z-10 overflow-hidden"
            >
                {/* Top shimmer line */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00C6F7] to-[#A855F7]" />

                {/* Ambient glows */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#A855F7] rounded-full blur-[70px] opacity-15 pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#00C6F7] rounded-full blur-[70px] opacity-10 pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-[#00C6F7]/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00C6F7]/20 to-[#A855F7]/20 border border-[#00C6F7]/30 flex items-center justify-center shadow-[0_0_10px_rgba(0,198,247,0.2)]">
                            <MessageSquare className="w-4 h-4 text-[#00C6F7]" />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-base leading-none">Your Feedback Matters</h3>
                            <p className="text-[10px] text-[#00C6F7] font-bold uppercase tracking-widest mt-0.5">Help us improve</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-white hover:bg-[#00C6F7]/10 p-1.5 rounded-full transition-all border border-transparent hover:border-[#00C6F7]/30"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="relative z-10 p-6">
                    <p className="text-gray-500 mb-5 text-sm font-light leading-relaxed">
                        We'd love to hear your thoughts! Your input directly shapes the
                        <span className="text-[#00C6F7] font-medium"> CodeSapiens</span> experience.
                    </p>
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell us what you think..."
                            className="w-full p-4 bg-[#0A0A0F] border border-[#00C6F7]/20 hover:border-[#00C6F7]/40 rounded-xl focus:ring-2 focus:ring-[#00C6F7]/30 focus:border-[#00C6F7]/60 outline-none transition-all resize-none h-32 text-gray-200 placeholder:text-gray-700 mb-5 text-sm font-light shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]"
                        />

                        {/* Char count hint */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-1.5">
                                {['🚀 Feature', '🐛 Bug', '💡 Idea', '🙏 Thanks'].map((tag, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setMessage(prev => prev ? prev : tag.split(' ')[1] + ': ')}
                                        className="text-[10px] px-2 py-1 rounded-md bg-[#0A0A0F] border border-[#00C6F7]/15 text-gray-600 hover:text-[#00C6F7] hover:border-[#00C6F7]/40 transition-all font-bold"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${message.length > 450 ? 'text-[#A855F7]' : 'text-gray-700'}`}>
                                {message.length}/500
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="w-full bg-gradient-to-r from-[#00C6F7] to-[#A855F7] text-black py-3.5 rounded-xl font-black flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(0,198,247,0.25)] text-sm uppercase tracking-widest"
                        >
                            {loading ? (
                                <span className="animate-pulse">Sending...</span>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Submit Feedback
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default FeedbackPopup;