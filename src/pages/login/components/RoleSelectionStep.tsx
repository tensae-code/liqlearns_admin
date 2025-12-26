import React from 'react';
import { Users, BookOpen, Headphones, Shield } from 'lucide-react';
import Icon from '../../../components/AppIcon';


interface RoleSelectionStepProps {
  selectedRole: string;
  onRoleSelect: (role: string) => void;
}

const RoleSelectionStep: React.FC<RoleSelectionStepProps> = ({ selectedRole, onRoleSelect }) => {
  const roles = [
    {
      id: 'student',
      title: 'Student',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      icon: Users,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'support',
      title: 'Support',
      icon: Headphones,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'admin',
      title: 'Admin',
      icon: Shield,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h3>
        <p className="text-gray-600">Select how you want to join LiqLearns</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className={`p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-xl scale-105'
                  : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-lg'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${role.color} flex items-center justify-center mb-3`}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-base font-bold text-gray-900 text-center break-words max-w-full px-2">{role.title}</h4>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelectionStep;