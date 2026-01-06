import { Trophy, Target, Zap } from 'lucide-react';

interface QuestProgressTrackerProps {
  currentProgress: number;
  targetProgress: number;
  questTitle: string;
  progressLabel?: string;
}

export default function QuestProgressTracker({ 
  currentProgress, 
  targetProgress, 
  questTitle,
  progressLabel = 'Progress'
}: QuestProgressTrackerProps) {
  const progressPercentage = Math.min((currentProgress / targetProgress) * 100, 100);
  const isComplete = currentProgress >= targetProgress;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-500" />
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{questTitle}</h4>
        </div>
        {isComplete && (
          <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
            <Trophy className="h-3 w-3" />
            Complete
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{progressLabel}</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {currentProgress} / {targetProgress}
          </span>
        </div>

        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-full ${
              isComplete
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' :'bg-gradient-to-r from-orange-500 to-yellow-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage > 10 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="h-3 w-3 text-white animate-pulse" />
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          {isComplete ? '🎉 Quest complete!' : `${(100 - progressPercentage).toFixed(0)}% remaining`}
        </p>
      </div>
    </div>
  );
}