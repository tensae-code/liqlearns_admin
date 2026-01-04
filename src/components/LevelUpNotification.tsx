import React, { useEffect, useState } from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';

interface LevelUpNotificationProps {
  newLevel: number;
  onClose: () => void;
}

export default function LevelUpNotification({ newLevel, onClose }: LevelUpNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`fixed top-20 right-4 z-50 transition-all duration-300 ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-2xl p-6 max-w-sm border-4 border-yellow-400 relative overflow-hidden">
        {/* Sparkles Animation */}
        <div className="absolute inset-0 pointer-events-none">
          <Sparkles className="absolute top-4 left-4 h-6 w-6 text-yellow-300 animate-pulse" />
          <Sparkles className="absolute top-8 right-6 h-4 w-4 text-yellow-300 animate-ping" />
          <Sparkles className="absolute bottom-6 left-8 h-5 w-5 text-yellow-300 animate-bounce" />
          <Sparkles className="absolute bottom-4 right-4 h-4 w-4 text-yellow-300 animate-pulse" />
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
        >
          <X className="h-4 w-4 text-white" />
        </button>

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
            <Trophy className="h-10 w-10 text-purple-600" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">
            Level Up! 🎉
          </h3>
          
          <p className="text-white/90 text-lg mb-1">
            You've reached
          </p>
          
          <div className="text-5xl font-extrabold text-yellow-300 mb-3 drop-shadow-lg">
            Level {newLevel}
          </div>
          
          <p className="text-white/80 text-sm">
            Keep learning to unlock more rewards!
          </p>
        </div>

        {/* Progress Bar Animation */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full bg-yellow-400 animate-[progress_5s_linear]" />
        </div>
      </div>
    </div>
  );
}