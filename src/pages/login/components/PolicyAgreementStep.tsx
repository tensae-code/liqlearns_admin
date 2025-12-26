import React from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import { FileText, Shield, Lock } from 'lucide-react';

interface PolicyAgreementStepProps {
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
}

const PolicyAgreementStep: React.FC<PolicyAgreementStepProps> = ({ 
  accepted, 
  onAcceptChange 
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Terms & Policies</h3>
        <p className="text-gray-600">Please review and accept our policies to continue</p>
      </div>

      {/* Policy Cards */}
      <div className="space-y-4">
        {/* Terms of Service */}
        <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Terms of Service</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                By using our platform, you agree to our terms and conditions. This includes
                proper usage of the platform, respect for other users, and compliance with
                all applicable laws and regulations.
              </p>
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sm text-orange-600 hover:text-orange-700 underline"
              >
                Read full Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Privacy Policy</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                We are committed to protecting your personal information. Learn about how we
                collect, use, and protect your data, and your rights regarding your information.
              </p>
              <a 
                href="/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sm text-purple-600 hover:text-purple-700 underline"
              >
                Read full Privacy Policy
              </a>
            </div>
          </div>
        </div>

        {/* Data Protection */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Data Protection</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Your data security is our priority. We use industry-standard encryption and
                security measures to protect your personal information at all times.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acceptance Checkbox */}
      <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={accepted}
            onChange={(e) => onAcceptChange(e.target.checked)}
            className="mt-1"
          />
          <div className="flex-1">
            <span className="text-sm text-gray-900 leading-relaxed">
              I have read and agree to the{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline font-medium">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline font-medium">
                Privacy Policy
              </a>
              . I understand that my data will be processed according to these policies.
            </span>
          </div>
        </label>
      </div>

      {!accepted && (
        <p className="text-sm text-red-600 text-center">
          You must accept the terms and policies to continue
        </p>
      )}
    </div>
  );
};

export default PolicyAgreementStep;