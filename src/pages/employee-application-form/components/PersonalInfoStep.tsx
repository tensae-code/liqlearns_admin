import React from 'react';
import { Phone, MapPin } from 'lucide-react';
import Input from '../../../components/ui/Input';

interface PersonalInfoStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ formData, updateFormData }) => {
  const handleFieldChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
        <p className="text-gray-600">Please provide your personal details</p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.fullName || ''}
            onChange={(e) => handleFieldChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            placeholder="your.email@example.com"
            required
          />
        </div>

        {/* Phone - Remove digit limiter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            placeholder="+251 911 123 456"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter your phone number with country code (any length accepted)
          </p>
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            value={formData.age || ''}
            onChange={(e) => handleFieldChange('age', e.target.value)}
            placeholder="25"
            min="18"
            max="100"
            required
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          Address
        </label>
        <textarea
          value={formData.address || ''}
          onChange={(e) => handleFieldChange('address', e.target.value)}
          placeholder="Addis Ababa, Ethiopia"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 resize-none"
        />
      </div>
    </div>
  );
};

export default PersonalInfoStep;