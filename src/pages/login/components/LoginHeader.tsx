import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { Home } from 'lucide-react';

interface LoginHeaderProps {
  className?: string;
}

const LoginHeader = ({ className = '' }: LoginHeaderProps) => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    // Primary navigation method using React Router
    try {
      navigate('/', { replace: true });
    } catch (error) {
      // Fallback navigation method if React Router fails
      console.error('Navigation error:', error);
      window.location.href = '/';
    }
  };

  return (
    <div className={`text-center mb-8 ${className}`}>
      {/* Home/Close Button - Enhanced visibility and functionality */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleHomeClick}
          type="button"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer z-10"
          aria-label="Go to home page"
        >
          <Home className="w-5 h-5" />
          <span className="font-semibold">Home</span>
        </button>
      </div>

      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
          <Icon name="GraduationCap" size={40} color="white" />
        </div>
      </div>

      {/* Title and Description */}
      <h1 className="font-heading text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
        LiqLearns
      </h1>
      <p className="font-body text-gray-700 text-lg font-semibold">
        Interactive Tutorial Hub
      </p>
      <div className="mt-4 flex items-center justify-center space-x-2">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-orange-400"></div>
        <p className="font-caption text-sm text-gray-500">
          Learn · Play · Thrive
        </p>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-orange-400"></div>
      </div>
    </div>
  );
};

export default LoginHeader;