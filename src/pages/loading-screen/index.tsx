import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LogoAnimation from './components/LogoAnimation';
import LoadingProgress from './components/LoadingProgress';
import EducationalTips from './components/EducationalTips';

const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100 && user && userProfile) {
      setTimeout(() => {
        navigate('/role-based-dashboard-hub');
      }, 500);
    }
  }, [progress, user, userProfile, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <LogoAnimation />
        <LoadingProgress progress={progress} />
        <EducationalTips />
      </div>
    </div>
  );
};

export default LoadingScreen;