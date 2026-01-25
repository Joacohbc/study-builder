import React from 'react';

const ProgressBar = ({ current, total, percentage, label = "Progreso" }) => {
    const calculatedPercentage = total > 0 ? Math.round((current / total) * 100) : percentage !== undefined ? percentage : 0;

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1 gap-1">
                <span>{label}</span>
                <span>{calculatedPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-indigo-600 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${calculatedPercentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;
