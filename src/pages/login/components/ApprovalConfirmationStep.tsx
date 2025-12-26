import React from 'react';
import { CheckCircle, Clock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ApprovalConfirmationStepProps {
  role: string;
  email: string;
}

const ApprovalConfirmationStep: React.FC<ApprovalConfirmationStepProps> = ({ role, email }) => {
  const navigate = useNavigate();
  const isStudent = role === 'student';

  return (
    <div className="space-y-8 py-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-green-600 mb-6">
          {isStudent ? (
            <CheckCircle className="w-10 h-10 text-white" />
          ) : (
            <Clock className="w-10 h-10 text-white" />
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {isStudent ? 'Account Created Successfully!' : 'Application Submitted!'}
        </h3>
        
        <p className="text-gray-600 max-w-md mx-auto">
          {isStudent
            ? 'Your account is ready. Click the button below to sign in and start your learning journey!' :'Your application has been submitted for CEO review. We will notify you once approved.'}
        </p>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 border border-orange-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">
              {isStudent ? 'Ready to Sign In' : 'Next Steps'}
            </h4>
            <p className="text-sm text-gray-700">
              {isStudent
                ? `Your account has been created successfully. Click the "Sign In" button below to access your account.`
                : `You will receive an email at ${email} once your application is reviewed. This typically takes 2-3 business days.`}
            </p>
          </div>
        </div>
      </div>

      {!isStudent && (
        <div className="bg-blue-50 rounded-3xl p-6 border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3">While You Wait</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <span>Prepare any additional documents that may be required</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <span>Check your email regularly for updates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <span>Review our platform guidelines and policies</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApprovalConfirmationStep;