import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const BreadCrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Don't show breadcrumbs on home page
    if (pathnames.length === 0) {
        return null;
    }

    // Format breadcrumb text (capitalize, remove dashes)
    const formatText = (text) => {
        // Check if it looks like an ID (long alphanumeric)
        if (text.length > 20 && /\d/.test(text)) {
            return text.substring(0, 8) + '...';
        }
        return text
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className="w-full px-6 lg:px-8 py-2 border-t border-zinc-100 bg-white/50 backdrop-blur-sm">
            <ol className="flex items-center space-x-2 text-sm text-zinc-500">
                <li>
                    <Link
                        to="/"
                        className="flex items-center hover:text-indigo-600 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>

                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;

                    return (
                        <li key={to} className="flex items-center space-x-2">
                            <ChevronRight className="w-4 h-4 text-zinc-400" />
                            {isLast ? (
                                <span className="font-medium text-zinc-800" aria-current="page">
                                    {formatText(value)}
                                </span>
                            ) : (
                                <Link
                                    to={to}
                                    className="hover:text-indigo-600 transition-colors"
                                >
                                    {formatText(value)}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default BreadCrumbs;
