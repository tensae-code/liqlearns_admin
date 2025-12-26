import React from 'react';

interface LoadingProgressProps {
  progress: number;
  currentPhase: string;
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({ progress, currentPhase }) => {
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="w-full bg-gray-700/50 rounded-full h-3 backdrop-blur-sm border border-gray-600/30">
        <div 
          className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-300/50 to-orange-500/50 blur-sm"></div>
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="flex justify-between items-center">
        <span className="text-orange-300 text-sm font-medium">{currentPhase}</span>
        <span className="text-white font-bold text-lg">{progress}%</span>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center space-x-2">
        {[...Array(6)].map((_, index) => {
          const dotProgress = (index + 1) * (100 / 6);
          const isActive = progress >= dotProgress;
          const isCurrent = progress >= dotProgress - (100 / 6) && progress < dotProgress;
          
          return (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                isActive 
                  ? 'bg-orange-400 scale-110' 
                  : isCurrent 
                  ? 'bg-orange-500 scale-125 animate-pulse' :'bg-gray-600'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LoadingProgress;