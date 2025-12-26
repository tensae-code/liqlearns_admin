import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const requirements = useMemo((): PasswordRequirement[] => {
    return [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Contains number', met: /\d/.test(password) },
      { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ];
  }, [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(req => req.met).length;
    const percentage = (metCount / requirements.length) * 100;
    
    if (percentage === 0) return { label: '', color: 'bg-gray-200', percentage: 0 };
    if (percentage <= 40) return { label: 'Weak', color: 'bg-red-500', percentage };
    if (percentage <= 60) return { label: 'Fair', color: 'bg-orange-500', percentage };
    if (percentage <= 80) return { label: 'Good', color: 'bg-yellow-500', percentage };
    return { label: 'Strong', color: 'bg-green-500', percentage };
  }, [requirements]);

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
        {password && (
          <p className="text-sm font-medium text-gray-700">
            Password Strength: <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span>
          </p>
        )}
      </div>

      {/* Requirements List */}
      {password && (
        <div className="space-y-2">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2">
              {req.met ? (
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              <span className={`text-xs ${req.met ? 'text-green-700' : 'text-gray-600'}`}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;