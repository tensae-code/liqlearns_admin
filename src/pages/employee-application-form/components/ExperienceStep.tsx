import React from 'react';
import { Briefcase, Link as LinkIcon, Users } from 'lucide-react';

interface ExperienceStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const ExperienceStep: React.FC<ExperienceStepProps> = ({ formData, updateFormData }) => {
  const updateReference = (index: number, field: string, value: string) => {
    const newReferences = [...formData.references];
    newReferences[index] = { ...newReferences[index], [field]: value };
    updateFormData({ references: newReferences });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display"' }}>
          Experience & References
        </h2>
        <p className="text-gray-600">Share your professional background</p>
      </div>

      {/* Previous Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Briefcase className="w-4 h-4 inline mr-2" />
          Previous Experience *
        </label>
        <textarea
          value={formData.previousExperience}
          onChange={(e) => updateFormData({ previousExperience: e.target.value })}
          placeholder="Describe your relevant work experience, projects, and achievements..."
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 resize-none"
          required
        />
      </div>

      {/* Portfolio URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <LinkIcon className="w-4 h-4 inline mr-2" />
          Portfolio/LinkedIn URL (Optional)
        </label>
        <input
          type="url"
          value={formData.portfolioUrl}
          onChange={(e) => updateFormData({ portfolioUrl: e.target.value })}
          placeholder="https://linkedin.com/in/yourprofile"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
        />
      </div>

      {/* References */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Users className="w-4 h-4 inline mr-2" />
          Professional References (Optional)
        </label>
        <div className="space-y-4">
          {formData.references.map((ref: any, index: number) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <h4 className="font-medium text-gray-700">Reference {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={ref.name}
                  onChange={(e) => updateReference(index, 'name', e.target.value)}
                  placeholder="Full Name"
                  className="px-4 py-2 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                />
                <input
                  type="text"
                  value={ref.relationship}
                  onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                  placeholder="Relationship"
                  className="px-4 py-2 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                />
                <input
                  type="text"
                  value={ref.contact}
                  onChange={(e) => updateReference(index, 'contact', e.target.value)}
                  placeholder="Contact Info"
                  className="px-4 py-2 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceStep;