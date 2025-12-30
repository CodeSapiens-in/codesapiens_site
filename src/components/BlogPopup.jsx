import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { BookOpen, X } from 'lucide-react';

const BlogPopup = ({ onClose }) => {
    return createPortal(
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[99999] md:w-full md:max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
            <div className="bg-[#FF5018] p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-bold">New Insights!</span>
                </div>
                <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Explore Our Latest Blogs</h3>
                <p className="text-gray-600 mb-4 text-sm">Discover stories, tutorials, and updates from the community.</p>
                <a
                    href="/blogs"
                    className="block w-full text-center bg-[#2B2929] text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                    Read Now
                </a>
            </div>
        </motion.div>,
        document.body
    );
};

export default BlogPopup;
