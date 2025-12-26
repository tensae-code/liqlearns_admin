import React, { useState } from 'react';
import { Upload, Video } from 'lucide-react';

interface ScenarioQuestionsStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const ScenarioQuestionsStep: React.FC<ScenarioQuestionsStepProps> = ({ formData, updateFormData }) => {
  const scenarios = {
    tutor: {
      title: 'Teaching Scenario',
      question: 'A student is struggling to understand a core concept despite multiple explanations. How would you approach this situation to ensure they grasp the material?',
      field: 'tutorScenario',
    },
    support: {
      title: 'Technical Support Scenario',
      question: 'A user is experiencing a critical issue that you cannot immediately resolve. How would you handle the situation while maintaining excellent customer service?',
      field: 'supportScenario',
    },
    admin: {
      title: 'Administrative Scenario',
      question: 'You notice a process inefficiency that is affecting team productivity. How would you identify, propose, and implement improvements?',
      field: 'adminScenario',
    },
  };

  const currentScenario = scenarios[formData.selectedRole as keyof typeof scenarios];

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        alert('Video file size must be less than 50MB');
        return;
      }

      // Check file type
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid video file (MP4, WebM, OGG, or MOV)');
        return;
      }

      updateFormData({
        scenarioVideoFile: file,
        scenarioVideoFileName: file.name,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-xl font-bold text-gray-900 mb-2">Scenario Questions</h4>
        <p className="text-gray-600">Demonstrate your problem-solving abilities</p>
      </div>

      <div className="space-y-6">
        {/* Scenario Question */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-start space-x-3 mb-4">
            <Video className="w-6 h-6 text-orange-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{currentScenario.title}</h3>
              <p className="text-gray-700">{currentScenario.question}</p>
            </div>
          </div>
        </div>

        {/* Text Response */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Response *
          </label>
          <textarea
            value={formData.scenarioAnswers?.[currentScenario.field] || ''}
            onChange={(e) =>
              updateFormData({
                scenarioAnswers: {
                  ...formData.scenarioAnswers,
                  [currentScenario.field]: e.target.value,
                },
              })
            }
            placeholder="Provide a detailed response explaining your approach and reasoning..."
            rows={6}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 resize-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 100 words</p>
        </div>

        {/* Video Upload (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Response (Optional - Recommended)
          </label>
          <p className="text-xs text-gray-600 mb-3">
            Upload a short 1-minute video explaining your problem-solving approach for a stronger application
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-500 transition-colors">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
            />
            
            <label
              htmlFor="video-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
            >
              <Upload className="w-5 h-5" />
              Upload Video
            </label>
            
            <p className="text-xs text-gray-500 mt-3">
              MP4, WebM, OGG, or MOV • Max 1 minute • Max 50MB
            </p>
            
            {formData.scenarioVideoFileName && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-center gap-2">
                  <Video className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {formData.scenarioVideoFileName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateFormData({
                      scenarioVideoFile: null,
                      scenarioVideoFileName: null,
                    })
                  }
                  className="text-xs text-red-600 hover:text-red-700 mt-2"
                >
                  Remove video
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-800">
              <strong>💡 Pro Tip:</strong> Video responses significantly increase your chances of approval. 
              Show your personality, communication skills, and problem-solving approach!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioQuestionsStep;