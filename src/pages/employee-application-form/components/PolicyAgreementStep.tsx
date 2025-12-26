import React from 'react';
import { Shield, CheckCircle, FileText } from 'lucide-react';

interface PolicyAgreementStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const PolicyAgreementStep: React.FC<PolicyAgreementStepProps> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display"' }}>
          Policy Agreement
        </h2>
        <p className="text-gray-600">Review and accept our policies</p>
      </div>

      {/* Policy Agreements */}
      <div className="space-y-4">
        {/* Terms of Service */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-orange-300 transition-all duration-200">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreedToTerms}
              onChange={(e) => updateFormData({ agreedToTerms: e.target.checked })}
              className="mt-1 w-5 h-5 rounded-lg border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-gray-900">Terms of Service</span>
              </div>
              <p className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-orange-600 hover:underline">
                  Terms of Service
                </a>{' '}
                including employment terms, responsibilities, and obligations.
              </p>
            </div>
          </label>
        </div>

        {/* Privacy Policy */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-orange-300 transition-all duration-200">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreedToPrivacy}
              onChange={(e) => updateFormData({ agreedToPrivacy: e.target.checked })}
              className="mt-1 w-5 h-5 rounded-lg border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-gray-900">Privacy Policy</span>
              </div>
              <p className="text-sm text-gray-600">
                I acknowledge the{' '}
                <a href="/privacy" target="_blank" className="text-orange-600 hover:underline">
                  Privacy Policy
                </a>{' '}
                and consent to data processing as described.
              </p>
            </div>
          </label>
        </div>

        {/* Code of Conduct */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-orange-300 transition-all duration-200">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreedToConduct}
              onChange={(e) => updateFormData({ agreedToConduct: e.target.checked })}
              className="mt-1 w-5 h-5 rounded-lg border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-gray-900">Code of Conduct</span>
              </div>
              <p className="text-sm text-gray-600">
                I agree to uphold the{' '}
                <a href="/conduct" target="_blank" className="text-orange-600 hover:underline">
                  Code of Conduct
                </a>{' '}
                and maintain professional standards.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Digital Signature */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Digital Signature *
        </label>
        <input
          type="text"
          value={formData.signature}
          onChange={(e) => updateFormData({ signature: e.target.value })}
          placeholder="Type your full name as electronic signature"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 font-serif text-xl"
          required
        />
        <p className="text-xs text-gray-500 mt-2">
          By typing your name, you are electronically signing this application.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> By submitting this application, you certify that all information provided is accurate and complete. False information may result in application rejection or termination.
        </p>
      </div>
    </div>
  );
};

export default PolicyAgreementStep;