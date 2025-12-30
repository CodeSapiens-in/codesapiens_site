import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const AnalyticsStatCard = ({ title, value, icon: Icon, change, changeType, color, delay = 0 }) => {
    const isPositive = changeType === 'positive';
    const isNegative = changeType === 'negative';
    const isNeutral = changeType === 'neutral';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>

            {change && (
                <div className="mt-4 flex items-center text-xs font-medium">
                    <span
                        className={`flex items-center ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
                            }`}
                    >
                        {isPositive && <ArrowUp className="w-3 h-3 mr-1" />}
                        {isNegative && <ArrowDown className="w-3 h-3 mr-1" />}
                        {isNeutral && <Minus className="w-3 h-3 mr-1" />}
                        {change}
                    </span>
                    <span className="text-gray-400 ml-2">vs last period</span>
                </div>
            )}
        </motion.div>
    );
};

export default AnalyticsStatCard;
