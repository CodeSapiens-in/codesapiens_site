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

            // Update user's last_feedback_at
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
                className="absolute inset-0 bg-[#2B2929]/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Popup */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 relative z-10 overflow-hidden"
            >
                {/* Header */}
                <div className="bg-[#101010] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <MessageSquare className="w-5 h-5 text-[#00C6F7]" />
                        <h3 className="font-bold text-lg">Your Feedback Matters</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 mb-4 text-sm">
                        We'd love to hear your thoughts! Help us improve your experience.
                    </p>
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell us what you think..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C6F7]/20 focus:border-[#00C6F7] outline-none transition-all resize-none h-32 text-gray-800 placeholder:text-gray-400 mb-4"
                        />
                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="w-full bg-[#101010] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#2B2929] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
