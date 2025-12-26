import React from 'react';
import { CheckCircle, User, Briefcase, Calendar, FileText } from 'lucide-react';

interface ReviewSubmitStepProps {
  formData: any;
}

const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({ formData }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display"' }}>
          Review Your Application
        </h2>
        <p className="text-gray-600">Please review your information before submitting</p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Personal Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="ml-2 font-medium text-gray-900">{formData.fullName}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <span className="ml-2 font-medium text-gray-900">{formData.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <span className="ml-2 font-medium text-gray-900">{formData.phone}</span>
            </div>
            <div>
              <span className="text-gray-500">Age:</span>
              <span className="ml-2 font-medium text-gray-900">{formData.age}</span>
            </div>
          </div>
        </div>

        {/* Role & Qualifications */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Briefcase className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Role & Qualifications</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Applying for:</span>
              <span className="ml-2 font-medium text-gray-900 capitalize">{formData.selectedRole}</span>
            </div>
            <div>
              <span className="text-gray-500">Qualifications:</span>
              <p className="mt-1 text-gray-700">{formData.qualifications}</p>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Availability</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Hours/Week:</span>
              <span className="ml-2 font-medium text-gray-900">{formData.hoursPerWeek}</span>
            </div>
            <div>
              <span className="text-gray-500">Start Date:</span>
              <span className="ml-2 font-medium text-gray-900">{formData.startDate}</span>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Experience</h3>
          </div>
          <p className="text-sm text-gray-700">{formData.previousExperience}</p>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          placeholder="Any additional information you'd like to share..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 resize-none"
        />
      </div>

      {/* Confirmation Message */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
        <p className="text-sm text-blue-800">
          <strong>What happens next?</strong> Your application will be reviewed by the CEO. You'll receive a notification via email once a decision is made. This typically takes 3-5 business days.
        </p>
      </div>
    </div>
  );
};

export default ReviewSubmitStep;