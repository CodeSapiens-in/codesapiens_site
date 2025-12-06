import React from 'react';
import { Clock, Calendar, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BlogCard = ({ blog, variant = 'default' }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getReadTime = (content) => {
        if (!content) return '1 min';
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} min`;
    };

    const getExcerpt = (content, maxLength = 120) => {
        if (blog.excerpt) return blog.excerpt;
        const text = content?.replace(/<[^>]*>/g, '') || '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    if (variant === 'featured') {
        return (
            <article
                onClick={() => navigate(`/blog/${blog.slug}`)}
                className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
                <div className="grid md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="relative h-64 md:h-full overflow-hidden">
                        {blog.cover_image ? (
                            <img
                                src={blog.cover_image}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-6xl font-bold opacity-30">
                                    {blog.title?.charAt(0) || 'B'}
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4 w-fit">
                            Featured
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {blog.title}
                        </h2>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                            {getExcerpt(blog.content, 200)}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {getReadTime(blog.content)} read
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(blog.published_at)}
                            </span>
                        </div>
                        <div className="mt-4 flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                            Read More
                            <ChevronRight className="w-5 h-5 ml-1" />
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    if (variant === 'compact') {
        return (
            <article
                onClick={() => navigate(`/blog/${blog.slug}`)}
                className="group flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
            >
                {blog.cover_image && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                            src={blog.cover_image}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {blog.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getReadTime(blog.content)}
                        </span>
                        <span>{formatDate(blog.published_at)}</span>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
            </article>
        );
    }

    // Default card
    return (
        <article
            onClick={() => navigate(`/blog/${blog.slug}`)}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer flex flex-col h-full"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                {blog.cover_image ? (
                    <img
                        src={blog.cover_image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold opacity-30">
                            {blog.title?.charAt(0) || 'B'}
                        </span>
                    </div>
                )}
                <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                        {getReadTime(blog.content)} read
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {blog.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                    {getExcerpt(blog.content)}
                </p>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(blog.published_at)}</span>
                    </div>
                    <span className="flex items-center text-blue-600 font-medium group-hover:gap-1 transition-all">
                        Read
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                    </span>
                </div>
            </div>
        </article>
    );
};

export default BlogCard;
