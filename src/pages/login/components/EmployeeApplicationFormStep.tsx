import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Clock, FileText, Briefcase, Calendar, Shield } from 'lucide-react';

// Import all step components from employee application form
import PersonalInfoStep from '../../employee-application-form/components/PersonalInfoStep';
import ProfessionalQualificationsStep from '../../employee-application-form/components/ProfessionalQualificationsStep';
import AvailabilityStep from '../../employee-application-form/components/AvailabilityStep';
import ExperienceStep from '../../employee-application-form/components/ExperienceStep';
import ScenarioQuestionsStep from '../../employee-application-form/components/ScenarioQuestionsStep';
import PolicyAgreementStep from '../../employee-application-form/components/PolicyAgreementStep';
import Icon from '../../../components/AppIcon';


interface EmployeeApplicationFormStepProps {
  role: string;
  onApplicationComplete: (applicationData: any) => void;
  initialData?: any;
}

const EmployeeApplicationFormStep: React.FC<EmployeeApplicationFormStepProps> = ({ 
  role, 
  onApplicationComplete,
  initialData 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    age: '',
    address: initialData?.address || '',
    
    // Step 2: Professional Qualifications
    selectedRole: role,
    qualifications: '',
    expertise: [],
    technicalSkills: [],
    managementExperience: '',
    
    // Step 3: Availability
    availability: {
      monday: { morning: false, afternoon: false, evening: false },
      tuesday: { morning: false, afternoon: false, evening: false },
      wednesday: { morning: false, afternoon: false, evening: false },
      thursday: { morning: false, afternoon: false, evening: false },
      friday: { morning: false, afternoon: false, evening: false },
      saturday: { morning: false, afternoon: false, evening: false },
      sunday: { morning: false, afternoon: false, evening: false },
    },
    hoursPerWeek: '',
    startDate: '',
    
    // Step 4: Experience
    previousExperience: '',
    portfolioUrl: '',
    references: [
      { name: '', relationship: '', contact: '' },
      { name: '', relationship: '', contact: '' },
    ],
    
    // Step 5: Scenario Questions
    scenarioAnswers: {
      tutorScenario: '',
      supportScenario: '',
      adminScenario: '',
    },
    
    // Step 6: Policy Agreement
    agreedToTerms: false,
    agreedToPrivacy: false,
    agreedToConduct: false,
    signature: '',
  });

  const steps = [
    { number: 1, title: 'Personal Info', icon: FileText },
    { number: 2, title: 'Qualifications', icon: Briefcase },
    { number: 3, title: 'Availability', icon: Calendar },
    { number: 4, title: 'Experience', icon: Clock },
    { number: 5, title: 'Scenarios', icon: CheckCircle },
    { number: 6, title: 'Policies', icon: Shield },
  ];

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - complete application
      onApplicationComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (updates: any) => {
    setFormData({ ...formData, ...updates });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <ProfessionalQualificationsStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <AvailabilityStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <ExperienceStep formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <ScenarioQuestionsStep formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <PolicyAgreementStep formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.phone && formData.age;
      case 2:
        return formData.qualifications && (
          (formData.selectedRole === 'tutor' && formData.expertise.length > 0) ||
          (formData.selectedRole === 'support' && formData.technicalSkills.length > 0) ||
          (formData.selectedRole === 'admin' && formData.managementExperience)
        );
      case 3:
        return formData.hoursPerWeek && formData.startDate;
      case 4:
        return formData.previousExperience;
      case 5:
        return formData.scenarioAnswers[`${formData.selectedRole}Scenario`];
      case 6:
        return formData.agreedToTerms && formData.agreedToPrivacy && formData.agreedToConduct && formData.signature;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Employee Application</h3>
        <p className="text-gray-600">Complete your application for {role} role</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg scale-110'
                        : isCompleted
                        ? 'bg-green-500 shadow-md'
                        : 'bg-white border-2 border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <span className={`mt-1 text-xs font-medium ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="min-h-[400px] bg-white rounded-2xl p-6 border border-gray-200">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-semibold transition-all duration-300 ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :'bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!isStepValid()}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-semibold transition-all duration-300 ${
            isStepValid()
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>{currentStep === 6 ? 'Complete Application' : 'Next'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EmployeeApplicationFormStep;