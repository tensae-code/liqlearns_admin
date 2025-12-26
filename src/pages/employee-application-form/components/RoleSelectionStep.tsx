import React from 'react';
import { Users, GraduationCap, Briefcase, Settings } from 'lucide-react';
import Icon from '../../../components/AppIcon';


interface RoleSelectionStepProps {
  selectedRole: string;
  onRoleSelect: (role: string) => void;
}

const RoleSelectionStep: React.FC<RoleSelectionStepProps> = ({ selectedRole, onRoleSelect }) => {
  const roles = [
    {
      id: 'teacher',
      // FIXED: Clear role description
      label: 'Teacher/Tutor',
      description: 'Teach courses and mentor students',
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'support',
      // FIXED: Clear role description
      label: 'Support Staff',
      description: 'Provide technical and customer support',
      icon: Users,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'admin',
      // FIXED: Clear role description
      label: 'Administrator',
      description: 'Manage platform operations and content',
      icon: Settings,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'ceo',
      // FIXED: Clear role description
      label: 'Executive Role',
      description: 'Strategic leadership and oversight',
      icon: Briefcase,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* FIXED: Clear section header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Your Role</h3>
        <p className="text-gray-600">Choose the position you're applying for</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          const Icon = role.icon;

          return (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                isSelected
                  ? 'border-orange-500 shadow-xl scale-105'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${role.color} ${
                  isSelected ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-300 rounded-2xl`}
              ></div>

              {/* Content */}
              <div className="relative flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    isSelected ? 'bg-white/20' : 'bg-gray-100'
                  } transition-colors`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isSelected ? 'text-white' : 'text-gray-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-bold text-lg mb-1 ${
                      isSelected ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {role.label}
                  </h4>
                  <p
                    className={`text-sm ${
                      isSelected ? 'text-white/80' : 'text-gray-600'
                    }`}
                  >
                    {role.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelectionStep;