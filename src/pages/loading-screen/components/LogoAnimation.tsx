import React from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';

interface LogoAnimationProps {
  isCompleted: boolean;
}

const LogoAnimation: React.FC<LogoAnimationProps> = ({ isCompleted }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Main Logo Container */}
      <div className={`relative transition-all duration-1000 ${isCompleted ? 'scale-110' : 'scale-100'}`}>
        {/* Background Glow */}
        <div className={`absolute inset-0 w-24 h-24 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl blur-xl opacity-50 ${isCompleted ? 'animate-pulse' : ''}`}></div>
        
        {/* Logo Background */}
        <div className={`relative w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isCompleted ? 'shadow-orange-500/50' : ''
        }`}>
          {/* Book Icon with Animation */}
          <BookOpen className={`w-10 h-10 text-white transition-all duration-700 ${
            isCompleted ? 'rotate-12 scale-110' : 'animate-pulse'
          }`} />
          
          {/* Success Checkmark */}
          {isCompleted && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Orbital Elements */}
      <div className="absolute inset-0 w-32 h-32">
        {/* Orbital Ring 1 */}
        <div className="absolute inset-0 border-2 border-orange-400/30 rounded-full animate-spin" style={{ animationDuration: '20s' }}>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-orange-400 rounded-full"></div>
        </div>
        
        {/* Orbital Ring 2 */}
        <div className="absolute inset-2 border border-orange-300/20 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
          <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1 w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
        </div>
        
        {/* Orbital Ring 3 */}
        <div className="absolute inset-4 border border-orange-200/15 rounded-full animate-spin" style={{ animationDuration: '25s' }}>
          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-1 h-1 bg-orange-200 rounded-full"></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 w-40 h-40">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className={`absolute w-1 h-1 bg-orange-${300 + (index % 3) * 100} rounded-full animate-ping`}
            style={{
              top: `${20 + (index * 10)}%`,
              left: `${15 + (index * 12)}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>

      {/* Pulsing Background Circle */}
      <div className="absolute inset-0 w-36 h-36 border border-orange-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
    </div>
  );
};

export default LogoAnimation;