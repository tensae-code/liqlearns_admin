import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Headphones, FileDown, Lock, Trophy, Clock } from 'lucide-react';
import { lmsService, LessonWithContent } from '../../../services/lmsService';
import { useAuth } from '../../../contexts/AuthContext';

interface LessonPlayerProps {
  lessonId: string;
  onBack: () => void;
  onNextLesson?: () => void;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ lessonId, onBack, onNextLesson }) => {
  const { user } = useAuth();
  const [lesson, setLesson] = useState<LessonWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!user?.id || !lessonId) return;

    let isMounted = true;

    const loadLesson = async () => {
      try {
        setLoading(true);
        setError(null);

        const lessonData = await lmsService.getLessonDetails(lessonId, user.id);
        
        if (isMounted) {
          if (!lessonData) {
            setError('Lesson not found');
            return;
          }

          if (!lessonData.isUnlocked) {
            setError('This lesson is locked. Complete the previous lesson first.');
            return;
          }

          setLesson(lessonData);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error loading lesson:', err);
          setError(err.message || 'Failed to load lesson');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLesson();

    return () => {
      isMounted = false;
    };
  }, [lessonId, user?.id]);

  // Track time spent and update progress
  useEffect(() => {
    if (!user?.id || !lessonId || !lesson) return;

    const interval = setInterval(async () => {
      const timeSpentMinutes = Math.floor((Date.now() - startTime) / 60000);
      
      try {
        await lmsService.updateLessonProgress(user.id, lessonId, {
          progressPercentage: Math.min(
            (currentContentIndex / (lesson.content.length || 1)) * 100,
            95 // Keep at 95% until quiz/assignment completed
          ),
          timeSpentMinutes
        });
      } catch (err) {
        console.error('Error updating progress:', err);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user?.id, lessonId, lesson, currentContentIndex, startTime]);

  const handleNextContent = () => {
    if (!lesson) return;

    if (currentContentIndex < lesson.content.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else if (lesson.quizQuestions.length > 0) {
      setShowQuiz(true);
    } else {
      handleCompleteLesson();
    }
  };

  const handlePreviousContent = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
    }
  };

  const handleQuizSubmit = async () => {
    if (!lesson || !user?.id) return;

    let score = 0;
    const totalPoints = lesson.quizQuestions.reduce((sum, q) => sum + q.points, 0);

    lesson.quizQuestions.forEach((question) => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        score += question.points;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);

    try {
      await lmsService.submitQuizAttempt(user.id, lessonId, {
        score,
        totalPoints,
        answers: quizAnswers,
        timeTakenSeconds
      });

      // If passed, lesson will be marked complete automatically
      if ((score / totalPoints) * 100 >= 70) {
        setTimeout(() => {
          handleCompleteLesson();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error submitting quiz:', err);
      setError(err.message);
    }
  };

  const handleCompleteLesson = async () => {
    if (!user?.id || !lessonId) return;

    try {
      await lmsService.markLessonComplete(user.id, lessonId);
      
      // Check for next lesson
      const nextLesson = await lmsService.getNextLesson(lessonId);
      
      if (nextLesson?.isUnlocked && onNextLesson) {
        onNextLesson();
      } else {
        onBack();
      }
    } catch (err: any) {
      console.error('Error completing lesson:', err);
      setError(err.message);
    }
  };

  const renderContentBlock = () => {
    if (!lesson || lesson.content.length === 0) {
      return <p className="text-gray-600 text-center py-8">No content available</p>;
    }

    const currentContent = lesson.content[currentContentIndex];

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{currentContent.title}</h3>
          <span className="text-sm text-gray-600">
            {currentContentIndex + 1} / {lesson.content.length}
          </span>
        </div>

        {currentContent.contentType === 'video' && (
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
            {!videoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
                <div className="w-full h-full animate-pulse">
                  <div className="bg-gray-700 dark:bg-gray-800 w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                </div>
              </div>
            )}
            <video
              className="w-full h-full"
              controls
              onLoadedData={() => setVideoReady(true)}
              onLoadStart={() => setVideoReady(false)}
              onError={() => setVideoReady(true)}
              preload="metadata"
            >
              <source src={currentContent.contentUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {currentContent.contentType === 'audio' && (
          <div className="bg-gray-100 rounded-lg p-8 mb-4 flex items-center justify-center">
            <Headphones className="w-12 h-12 text-gray-600 mr-4" />
            <p className="text-gray-700">Audio: {currentContent.contentUrl}</p>
          </div>
        )}

        {currentContent.contentType === 'text' && (
          <div className="prose max-w-none mb-4">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {currentContent.contentText}
            </p>
          </div>
        )}

        {currentContent.contentType === 'pdf' && (
          <div className="bg-gray-100 rounded-lg p-8 mb-4 flex items-center justify-center">
            <FileDown className="w-12 h-12 text-gray-600 mr-4" />
            <div>
              <p className="text-gray-700 font-medium mb-2">PDF Document</p>
              <a 
                href={currentContent.contentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 underline"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePreviousContent}
            disabled={currentContentIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={handleNextContent}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            {currentContentIndex === lesson.content.length - 1 ? (
              lesson.quizQuestions.length > 0 ? 'Take Quiz' : 'Complete Lesson'
            ) : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!lesson) return null;

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Lesson Quiz</h3>
          <p className="text-gray-600">Answer all questions to complete this lesson</p>
        </div>

        {quizSubmitted ? (
          <div className="text-center py-8">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              (quizScore / lesson.quizQuestions.reduce((sum, q) => sum + q.points, 0)) * 100 >= 70
                ? 'bg-green-100' :'bg-red-100'
            }`}>
              <Trophy className={`w-10 h-10 ${
                (quizScore / lesson.quizQuestions.reduce((sum, q) => sum + q.points, 0)) * 100 >= 70
                  ? 'text-green-600' :'text-red-600'
              }`} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Score: {quizScore} / {lesson.quizQuestions.reduce((sum, q) => sum + q.points, 0)}
            </h3>
            <p className="text-gray-600 mb-6">
              {(quizScore / lesson.quizQuestions.reduce((sum, q) => sum + q.points, 0)) * 100 >= 70
                ? 'Great job! You passed the quiz.' :'You need 70% to pass. Try again!'}
            </p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Lessons
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {lesson.quizQuestions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium mb-3">{question.questionText}</p>
                    <div className="space-y-2">
                      {question.options && Array.isArray(question.options) && question.options.map((option: string, optIndex: number) => (
                        <label key={optIndex} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={quizAnswers[question.id] === option}
                            onChange={(e) => setQuizAnswers({ ...quizAnswers, [question.id]: e.target.value })}
                            className="w-4 h-4 text-orange-500"
                          />
                          <span className="text-gray-800">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setShowQuiz(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Content
              </button>
              <button
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length !== lesson.quizQuestions.length}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <Lock className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Lesson not available'}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Lessons
          </button>
          {lesson.studentProgress?.isCompleted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-gray-600">{lesson.description}</p>
        )}

        <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {lesson.estimatedDurationMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            +{lesson.xpReward} XP
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium text-gray-900">
              {lesson.studentProgress?.progressPercentage || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${lesson.studentProgress?.progressPercentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content or Quiz */}
      {showQuiz ? renderQuiz() : renderContentBlock()}

      {/* Assignments Section */}
      {lesson.assignments.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Assignments</h3>
          <div className="space-y-3">
            {lesson.assignments.map((assignment) => (
              <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{assignment.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                    {assignment.dueDate && (
                      <p className="text-xs text-gray-500">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                    Submit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlayer;