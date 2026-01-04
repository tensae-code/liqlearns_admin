import React, { useEffect, useState } from 'react';
import { Award, Coins, Zap } from 'lucide-react';

interface QuestReward {
  xp: number;
  gold: number;
  questName: string;
}

interface QuestRewardFeedbackProps {
  reward: QuestReward;
  onClose: () => void;
}

export default function QuestRewardFeedback({ reward, onClose }: QuestRewardFeedbackProps) {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setShow(true);
    setTimeout(() => setAnimate(true), 100);
    
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => {
      setShow(false);
      onClose();
    }, 300);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className={`bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border-4 border-green-400 pointer-events-auto transition-all duration-300 ${
        animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
      }`}>
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-green-400 to-emerald-600 w-20 h-20 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Award className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Quest Name */}
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Quest Complete! 🎉
        </h3>
        <p className="text-center text-gray-600 mb-6">
          {reward.questName}
        </p>

        {/* Rewards Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* XP Reward */}
          <div className={`bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-200 transition-all duration-500 ${
            animate ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}>
            <div className="flex items-center justify-center mb-2">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                +{reward.xp}
              </div>
              <div className="text-sm text-gray-600 font-medium">XP Earned</div>
            </div>
          </div>

          {/* Gold Reward */}
          <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200 transition-all duration-500 delay-150 ${
            animate ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}>
            <div className="flex items-center justify-center mb-2">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-2 rounded-lg">
                <Coins className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
                +{reward.gold}
              </div>
              <div className="text-sm text-gray-600 font-medium">Gold Earned</div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Awesome!
        </button>

        {/* Confetti Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-[confetti_2s_ease-out_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                top: '-10px'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}