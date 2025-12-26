import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, CheckCircle, Clock, FileText, Briefcase, Calendar, Shield, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoginHeader from '../login/components/LoginHeader';

// Step Components
import PersonalInfoStep from './components/PersonalInfoStep';
import ProfessionalQualificationsStep from './components/ProfessionalQualificationsStep';
import AvailabilityStep from './components/AvailabilityStep';
import ExperienceStep from './components/ExperienceStep';
import ScenarioQuestionsStep from './components/ScenarioQuestionsStep';
import PolicyAgreementStep from './components/PolicyAgreementStep';
import ReviewSubmitStep from './components/ReviewSubmitStep';



const EmployeeApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: '',
    email: '',
    phone: '',
    age: '',
    address: '',
    
    // Step 2: Professional Qualifications
    selectedRole: 'tutor',
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
    
    // Step 7: Review & Submit
    additionalNotes: '',
  });

  const steps = [
    { number: 1, title: 'Personal Info', icon: FileText },
    { number: 2, title: 'Qualifications', icon: Briefcase },
    { number: 3, title: 'Availability', icon: Calendar },
    { number: 4, title: 'Experience', icon: Clock },
    { number: 5, title: 'Scenarios', icon: CheckCircle },
    { number: 6, title: 'Policies', icon: Shield },
    { number: 7, title: 'Review', icon: Send },
  ];

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Insert application into role_approval_requests
      const { error } = await supabase
        .from('role_approval_requests')
        .insert({
          user_id: user?.id,
          requested_role: formData.selectedRole,
          form_data: formData,
          status: 'pending',
        });

      if (error) throw error;

      // Show success message
      alert('Application submitted successfully! The CEO will review your application.');
      navigate('/role-based-dashboard-hub');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      alert(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
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
      case 7:
        return <ReviewSubmitStep formData={formData} />;
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
      case 7:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 overflow-x-hidden">
          <LoginHeader />
          <div className="mt-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Employee Application
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Complete your application for {formData.selectedRole || 'teacher'} role
            </p>
          </div>
        </div>

        {/* Progress Indicator - Fixed overflow */}
        <div className="mb-8 overflow-x-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          
          {/* Step indicators - Made responsive to prevent overflow */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  index + 1 === currentStep
                    ? 'bg-orange-500 text-white'
                    : index + 1 < currentStep
                    ? 'bg-green-500 text-white' :'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}. {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card with iOS-style Design */}
        <div className="min-h-[500px]">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :'bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 shadow-md hover:shadow-lg'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {currentStep < 7 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                isStepValid()
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
              className={`flex items-center space-x-2 px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                isStepValid() && !isSubmitting
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500">
          All applications are reviewed by the CEO. You'll receive a notification once your application is processed.
        </p>
      </div>
    </div>
  );
};

export default EmployeeApplicationForm;