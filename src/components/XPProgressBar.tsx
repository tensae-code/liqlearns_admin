import React from 'react';
import { Trophy, Zap } from 'lucide-react';

interface XPProgressBarProps {
  currentXP: number;
  targetXP: number;
  currentLevel: number;
}

export default function XPProgressBar({ currentXP, targetXP, currentLevel }: XPProgressBarProps) {
  const progress = Math.min((currentXP / targetXP) * 100, 100);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-2 rounded-lg">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Level {currentLevel}</h3>
            <p className="text-sm text-gray-500">Keep learning to level up!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
          <Zap className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-semibold text-yellow-700">{currentXP} XP</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress to Level {currentLevel + 1}</span>
          <span className="font-semibold text-gray-900">{currentXP} / {targetXP} XP</span>
        </div>
        
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse" />
          </div>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          {targetXP - currentXP} XP needed to reach next level
        </p>
      </div>
    </div>
  );
}