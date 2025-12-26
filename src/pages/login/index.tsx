import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoginForm from './components/LoginForm';
import LoginFooter from './components/LoginFooter';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

import GeneralQuestionsStep from './components/GeneralQuestionsStep';
import SubscriptionStep from './components/SubscriptionStep';
import PaymentStep from './components/PaymentStep';
import InvoiceRequestStep from './components/InvoiceRequestStep';

import PasswordStrengthIndicator from '../../components/ui/PasswordStrengthIndicator';
import PhoneInput from '../../components/ui/PhoneInput';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import EmployeeApplicationFormStep from './components/EmployeeApplicationFormStep';

import RoleSelectionStep from './components/RoleSelectionStep';
import LoginHeader from './components/LoginHeader';



const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [countryCode, setCountryCode] = useState('ET'); // Default to Ethiopia

  // Remove the auto-redirect useEffect - let login form handle navigation
  // This prevents premature navigation to loading screen

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex flex-col overflow-hidden">
      {/* Main Content - Fixed overflow */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        <div className="w-full max-w-md">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5" />
          
          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-orange-500/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Login Container */}
          <div className="relative">
            <div className="bg-white/80 backdrop-blur-lg border border-orange-100 rounded-3xl shadow-2xl">
              <div className="p-8">
                {/* Header Section */}
                <LoginHeader />
                
                {/* Toggle between Login and Signup */}
                {!showSignup ? (
                  <>
                    <LoginForm />
                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button
                          onClick={() => setShowSignup(true)}
                          className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                        >
                          Create Account
                        </button>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <SignupForm />
                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                          onClick={() => setShowSignup(false)}
                          className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </>
                )}
                
                {/* Footer Section */}
                <LoginFooter />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <LoginFooter />
    </div>
  );
};

// Add countryCodes array before SignupForm component
const countryCodes = [
  { code: 'ET', country: 'Ethiopia', flag: '🇪🇹', dialCode: '+251' },
  { code: 'US', country: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', country: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'CA', country: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'AU', country: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'DE', country: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'FR', country: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'IT', country: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'ES', country: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'IN', country: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'CN', country: 'China', flag: '🇨🇳', dialCode: '+86' },
  { code: 'JP', country: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'BR', country: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'MX', country: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
  { code: 'ZA', country: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { code: 'KE', country: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { code: 'NG', country: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'EG', country: 'Egypt', flag: '🇪🇬', dialCode: '+20' },
  { code: 'AE', country: 'UAE', flag: '🇦🇪', dialCode: '+971' },
  { code: 'SA', country: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' }
];

// Signup Form Component
const SignupForm = () => {
  const { signUp, sendTwoFactorCode, verifyTwoFactorCode, sendEmailOTP, verifyEmailOTP } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: 'student',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    country: 'ET',
    state: '',
    city: '',
    subscriptionPlan: 'free',
    policiesAccepted: '',
    sponsorName: '',
    applicationData: null as any,
    verificationType: 'phone\' as \'phone\' | \'email', // FIXED: Proper TypeScript type annotation
  });
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorVerified, setTwoFactorVerified] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [countryCode, setCountryCode] = useState('ET');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameAvailabilityStatus, setUsernameAvailabilityStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [emailAvailabilityStatus, setEmailAvailabilityStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [sponsorError, setSponsorError] = useState('');
  const [sponsorValidationStatus, setSponsorValidationStatus] = useState<'checking' | 'valid' | 'invalid' | null>(null);
  const [sponsorCheckTimeout, setSponsorCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [showInvoiceRequest, setShowInvoiceRequest] = useState(false);

  // Instagram-like username validation
  const validateUsername = (username: string): { isValid: boolean; error: string } => {
    // Remove any whitespace
    username = username.trim();
    
    // Must be between 3 and 30 characters
    if (username.length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters' };
    }
    if (username.length > 30) {
      return { isValid: false, error: 'Username must be 30 characters or less' };
    }
    
    // Can only contain alphanumeric characters, underscores, and periods
    const validPattern = /^[a-zA-Z0-9._]+$/;
    if (!validPattern.test(username)) {
      return { isValid: false, error: 'Username can only contain letters, numbers, periods, and underscores' };
    }
    
    // Cannot start or end with a period
    if (username.startsWith('.') || username.endsWith('.')) {
      return { isValid: false, error: 'Username cannot start or end with a period' };
    }
    
    // Cannot have consecutive periods
    if (username.includes('..')) {
      return { isValid: false, error: 'Username cannot have consecutive periods' };
    }
    
    // Must start with a letter or number
    if (!/^[a-zA-Z0-9]/.test(username)) {
      return { isValid: false, error: 'Username must start with a letter or number' };
    }
    
    return { isValid: true, error: '' };
  };

  // FIXED: Proper email availability check with database query
  const checkEmailAvailability = async (email: string) => {
    if (email.length < 5 || !email.includes('@')) {
      setEmailAvailabilityStatus(null);
      return;
    }

    setEmailAvailabilityStatus('checking');

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error) throw error;

      setEmailAvailabilityStatus(data ? 'taken' : 'available');
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailAvailabilityStatus(null);
    }
  };

  // FIXED: Proper username availability check with database query
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailabilityStatus(null);
      return;
    }

    setUsernameAvailabilityStatus('checking');

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (error) throw error;

      console.log('🟢 checkUsername', username, { exists: !!data, data });   // ← DEBUG LOG ADDED

      setUsernameAvailabilityStatus(data ? 'taken' : 'available');
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailabilityStatus(null);
    }
  };

  // FIXED: Enhanced sponsor username validation with updated eligible roles
  const checkSponsorUsername = async (sponsorName: string) => {
    if (sponsorName.length < 3) {
      setSponsorValidationStatus(null);
      setSponsorError('');
      return;
    }

    setSponsorValidationStatus('checking');
    setSponsorError('');

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username, role')
        .eq('username', sponsorName.toLowerCase())
        .maybeSingle();

      if (error) throw error;

      console.log('🟢 checkSponsor', sponsorName, { exists: !!data, allowed: data ? ['student', 'teacher', 'tutor', 'ceo'].includes(data.role.toLowerCase()) : false, data });   // ← DEBUG LOG ADDED

      if (data) {
        // UPDATED: Students can now also be sponsors - only admin and support cannot refer
        const eligibleRoles = ['student', 'teacher', 'tutor', 'ceo'];
        const ineligibleRoles = ['admin', 'support'];
        
        if (eligibleRoles.includes(data.role.toLowerCase())) {
          setSponsorValidationStatus('valid');
          setSponsorError('');
        } else if (ineligibleRoles.includes(data.role.toLowerCase())) {
          setSponsorValidationStatus('invalid');
          setSponsorError('This user cannot be a sponsor. Only Students, Teachers, Tutors, and CEOs can refer people.');
        } else {
          // Fallback for any unexpected role
          setSponsorValidationStatus('invalid');
          setSponsorError('This user role is not eligible to be a sponsor.');
        }
      } else {
        setSponsorValidationStatus('invalid');
        setSponsorError('Sponsor username not found. Please check the spelling.');
      }
    } catch (error) {
      console.error('Error checking sponsor username:', error);
      setSponsorValidationStatus(null);
      setSponsorError('Error validating sponsor username. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Special handling for username
    if (field === 'username') {
      const validation = validateUsername(value);
      setUsernameError(validation.error);

      // Clear existing timeout
      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout);
      }

      // Set new timeout for availability check (debounce)
      if (validation.isValid && value.length >= 3) {
        const timeout = setTimeout(() => {
          checkUsernameAvailability(value);
        }, 500);
        setUsernameCheckTimeout(timeout);
      } else {
        setUsernameAvailabilityStatus(null);
      }
    }

    // Special handling for email
    if (field === 'email') {
      // Clear existing timeout
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
      }

      // Set new timeout for availability check (debounce)
      if (value.length >= 5 && value.includes('@')) {
        const timeout = setTimeout(() => {
          checkEmailAvailability(value);
        }, 500);
        setEmailCheckTimeout(timeout);
      } else {
        setEmailAvailabilityStatus(null);
      }
    }
    
    // NEW: Special handling for sponsor name
    if (field === 'sponsorName') {
      // Clear existing timeout
      if (sponsorCheckTimeout) {
        clearTimeout(sponsorCheckTimeout);
      }

      // Set new timeout for validation check (debounce)
      if (value.length >= 3) {
        const timeout = setTimeout(() => {
          checkSponsorUsername(value);
        }, 500);
        setSponsorCheckTimeout(timeout);
      } else {
        setSponsorValidationStatus(null);
        setSponsorError('');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSendCode = async () => {
    if (formData.verificationType === 'phone') {
      if (!formData.phone) {
        setError('Please enter a phone number');
        return;
      }
      
      const selectedCountry = countryCodes.find(c => c.code === countryCode);
      const fullPhoneNumber = `${selectedCountry?.dialCode}${formData.phone}`;
      
      setLoading(true);
      const { error } = await sendTwoFactorCode(fullPhoneNumber);
      setLoading(false);
      
      if (error) {
        setError(error.message);
      } else {
        setShowVerificationInput(true);
      }
    } else {
      // Email verification
      if (!formData.email) {
        setError('Please enter an email address');
        return;
      }
      
      setLoading(true);
      const { error } = await sendEmailOTP(formData.email);
      setLoading(false);
      
      if (error) {
        setError(error.message);
      } else {
        setShowVerificationInput(true);
      }
    }
  };

  const handleVerifyCode = async () => {
    if (twoFactorCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    
    if (twoFactorVerified) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    if (formData.verificationType === 'phone') {
      const selectedCountry = countryCodes.find(c => c.code === countryCode);
      const fullPhoneNumber = `${selectedCountry?.dialCode}${formData.phone}`;
      
      const { error, verified } = await verifyTwoFactorCode(fullPhoneNumber, twoFactorCode);
      setLoading(false);
      
      if (error || !verified) {
        setError('Invalid or expired code. Please request a new code if needed.');
      } else {
        setTwoFactorVerified(true);
        setError('');
      }
    } else {
      // Email verification
      const { error, verified } = await verifyEmailOTP(formData.email, twoFactorCode);
      setLoading(false);
      
      if (error || !verified) {
        setError(error.message || 'Invalid or expired code. Please request a new code if needed.');
      } else {
        setTwoFactorVerified(true);
        setError('');
      }
    }
  };

  const handleApplicationComplete = (applicationData: any) => {
    setFormData(prev => ({
      ...prev,
      applicationData
    }));
    setStep(step + 1);
  };

  const handleNext = () => {
    // Validation for each step
    if (step === 1 && !formData.role) {
      setError('Please select a role');
      return;
    }
    if (step === 2) {
      if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword || !formData.fullName) {
        setError('All fields are required');
        return;
      }
      
      // Validate username
      const usernameValidation = validateUsername(formData.username);
      if (!usernameValidation.isValid) {
        setError(usernameValidation.error);
        return;
      }

      // Check username availability
      if (usernameAvailabilityStatus === 'taken') {
        setError('Username is already taken. Please choose another one.');
        return;
      }

      if (usernameAvailabilityStatus === 'checking') {
        setError('Please wait while we check username availability');
        return;
      }

      // Check email availability
      if (emailAvailabilityStatus === 'taken') {
        setError('Email is already registered. Please use another email.');
        return;
      }

      if (emailAvailabilityStatus === 'checking') {
        setError('Please wait while we check email availability');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      // NEW: Validate sponsor username is required
      if (!formData.sponsorName) {
        setError('Sponsor username is required');
        return;
      }

      // NEW: Check sponsor username validation status
      if (sponsorValidationStatus === 'checking') {
        setError('Please wait while we validate the sponsor username');
        return;
      }

      if (sponsorValidationStatus === 'invalid') {
        setError('Invalid sponsor username. Please provide a valid sponsor username.');
        return;
      }

      if (sponsorValidationStatus !== 'valid') {
        setError('Please provide a valid sponsor username');
        return;
      }
    }
    if (step === 3 && (!formData.dateOfBirth || !formData.address || !formData.country || !formData.city)) {
      setError('Please fill in all fields');
      return;
    }
    if (step === 3 && formData.country && formData.country !== 'ET' && !formData.state) {
      setError('Please select a state/province');
      return;
    }
    if (step === 4 && !twoFactorVerified) {
      setError('Please verify your identity first');
      return;
    }
    
    setError('');
    
    // Updated step navigation - account for payment step
    if (step === 4 && formData.role === 'student') {
      setStep(6); // Jump to subscription for students
    } else if (step === 6) {
      // After subscription, go to payment
      setStep(7);
    } else if (step === 7) {
      // After payment/invoice, go to policy
      setStep(8);
    } else {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    // Updated navigation for new steps
    if (step === 6 && formData.role === 'student') {
      setStep(4); // Skip application form for students going back
    } else if (step === 7) {
      setStep(6); // Back to subscription from payment
    } else if (step === 8) {
      setStep(7); // Back to payment from policy
    } else {
      setStep(step - 1);
    }
  };

  const handlePaymentSuccess = async () => {
    // Payment successful - move to policy agreement
    setStep(8);
  };

  const handlePaymentFailure = (error: string) => {
    setError(error);
    // Stay on payment step for retry
  };

  const handleRequestInvoice = () => {
    setShowInvoiceRequest(true);
  };

  const handleInvoiceSent = () => {
    // Invoice sent - move to policy agreement
    setShowInvoiceRequest(false);
    setStep(8);
  };

  const handleBackToPayment = () => {
    setShowInvoiceRequest(false);
  };

  const handleSubmit = async () => {
    if (!formData.policiesAccepted || formData.policiesAccepted !== 'true') {
      setError('You must accept the terms and policies to continue');
      return;
    }

    try {
      setLoading(true);
      
      // FIXED: Phone number from react-international-phone is already properly formatted with country code
      // Do NOT add dial code again - this was causing duplication like +251+14255423737
      // Use formData.phone directly as it already contains the full international format
      const fullPhoneNumber = formData.phone;
      
      // Prepare metadata for signup - INCLUDE sponsor_name
      const metadata = {
        full_name: formData.fullName,
        username: formData.username,
        phone: fullPhoneNumber,
        role: formData.role,
        date_of_birth: formData.dateOfBirth,
        address: formData.address,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        subscription_plan: formData.subscriptionPlan,
        sponsor_name: formData.sponsorName // NEW: Include sponsor name in metadata
      };

      // Sign up the user
      const { error: signupError, data } = await signUp(formData.email, formData.password, { data: metadata });
      
      if (signupError) throw signupError;

      // If non-student role, submit employee application
      if (formData.role !== 'student' && formData.applicationData) {
        const { error: appError } = await supabase
          .from('role_approval_requests')
          .insert({
            user_id: data?.user?.id,
            requested_role: formData.role,
            form_data: formData.applicationData,
            status: 'pending'
          });
        
        if (appError) throw appError;
      }

      // IMPORTANT: Account activation logic
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user has active subscription or pending invoice
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('has_active_subscription, stripe_subscription_id')
        .eq('id', user.id)
        .single();

      // For students with active subscription, allow immediate access
      if (studentProfile?.has_active_subscription) {
        // Update account status to active
        await supabase
          .from('user_profiles')
          .update({ account_status: 'active' })
          .eq('id', user.id);
      }

      setStep(9); // Show final confirmation at step 9
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Total steps calculation
  const totalSteps = formData.role === 'student' ? 9 : 10;
  const currentDisplayStep = step;

  return (
    <div className="space-y-6">
      {/* REDESIGNED: Two-Line Progress Indicator with Better Spacing */}
      <div className="mb-8">
        {/* First Row: Steps 1-4 */}
        <div className="flex items-center justify-between gap-2 mb-4">
          {Array.from({ length: Math.min(4, totalSteps) }).map((_, index) => {
            const stepNum = index + 1;
            const isActive = currentDisplayStep === stepNum;
            const isCompleted = currentDisplayStep > stepNum;
            
            return (
              <React.Fragment key={stepNum}>
                <div className="flex flex-col items-center min-w-0 flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-110 ring-4 ring-orange-200'
                        : isCompleted
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {stepNum}
                  </div>
                  <span className={`text-xs mt-1.5 whitespace-nowrap font-medium ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
                    Step {stepNum}
                  </span>
                </div>
                {stepNum < 4 && stepNum < totalSteps && (
                  <div className="flex-1 h-1 mx-1 bg-gray-200 rounded-full overflow-hidden min-w-[24px] max-w-[40px]">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${isCompleted ? 'bg-green-500 w-full' : 'w-0'}`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Second Row: Steps 5-8 (if applicable) */}
        {totalSteps > 4 && (
          <div className="flex items-center justify-between gap-2">
            {Array.from({ length: totalSteps - 4 }).map((_, index) => {
              const stepNum = index + 5;
              const isActive = currentDisplayStep === stepNum;
              const isCompleted = currentDisplayStep > stepNum;
              
              return (
                <React.Fragment key={stepNum}>
                  <div className="flex flex-col items-center min-w-0 flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-110 ring-4 ring-orange-200'
                          : isCompleted
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {stepNum}
                    </div>
                    <span className={`text-xs mt-1.5 whitespace-nowrap font-medium ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
                      Step {stepNum}
                    </span>
                  </div>
                  {stepNum < totalSteps && (
                    <div className="flex-1 h-1 mx-1 bg-gray-200 rounded-full overflow-hidden min-w-[24px] max-w-[40px]">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${isCompleted ? 'bg-green-500 w-full' : 'w-0'}`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Step 1: Role Selection */}
      {step === 1 && (
        <RoleSelectionStep
          selectedRole={formData.role}
          onRoleSelect={(role) => handleInputChange('role', role)}
        />
      )}

      {/* Step 2: Basic Info */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h3>
            <p className="text-gray-600">Create your account credentials</p>
          </div>
          
          <div className="relative">
            <Input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              autoComplete="off"
              className={`pr-10 ${usernameError || usernameAvailabilityStatus === 'taken' ? 'border-red-500 focus:ring-red-500' : usernameAvailabilityStatus === 'available' ? 'border-green-500 focus:ring-green-500' : ''}`}
            />
            
            {/* Username availability indicator - FIXED positioning */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              {usernameAvailabilityStatus === 'checking' && (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              )}
              {usernameAvailabilityStatus === 'available' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {usernameAvailabilityStatus === 'taken' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>

            {usernameError && (
              <p className="text-xs text-red-500 mt-1">{usernameError}</p>
            )}
            {usernameAvailabilityStatus === 'taken' && (
              <p className="text-xs text-red-500 mt-1">Username is already taken</p>
            )}
            {usernameAvailabilityStatus === 'available' && (
              <p className="text-xs text-green-500 mt-1">Username is available!</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              3-30 characters. Letters, numbers, periods, and underscores only.
            </p>
          </div>
          
          {/* Email with availability check - FIXED positioning */}
          <div className="relative">
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              autoComplete="email"
              className={`pr-10 ${emailAvailabilityStatus === 'taken' ? 'border-red-500 focus:ring-red-500' : emailAvailabilityStatus === 'available' ? 'border-green-500 focus:ring-green-500' : ''}`}
            />
            
            {/* Email availability indicator - FIXED positioning */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              {emailAvailabilityStatus === 'checking' && (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              )}
              {emailAvailabilityStatus === 'available' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {emailAvailabilityStatus === 'taken' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>

            {emailAvailabilityStatus === 'taken' && (
              <p className="text-xs text-red-500 mt-1">Email is already registered</p>
            )}
            {emailAvailabilityStatus === 'available' && (
              <p className="text-xs text-green-500 mt-1">Email is available!</p>
            )}
          </div>
          
          <Input
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            autoComplete="name"
            name="fullName"
          />
          
          <div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-3">
              <PasswordStrengthIndicator password={formData.password} />
            </div>
          </div>
          
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* UPDATED: Sponsor Name Field - FIXED positioning to match other fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sponsor/Referrer Username *
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter sponsor's username"
                value={formData.sponsorName}
                onChange={(e) => handleInputChange('sponsorName', e.target.value)}
                autoComplete="off"
                className={`pr-10 ${sponsorError || sponsorValidationStatus === 'invalid' ? 'border-red-500 focus:ring-red-500' : sponsorValidationStatus === 'valid' ? 'border-green-500 focus:ring-green-500' : ''}`}
                required
              />
              
              {/* Sponsor validation indicator - FIXED positioning */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                {sponsorValidationStatus === 'checking' && (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                )}
                {sponsorValidationStatus === 'valid' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {sponsorValidationStatus === 'invalid' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>

            {sponsorError && (
              <p className="text-xs text-red-500 mt-1">{sponsorError}</p>
            )}
            {sponsorValidationStatus === 'valid' && (
              <p className="text-xs text-green-500 mt-1">Sponsor username verified!</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Required: Enter the username of the person who referred you
            </p>
          </div>
        </div>
      )}

      {/* Step 3: General Questions */}
      {step === 3 && (
        <GeneralQuestionsStep
          formData={{
            address: formData.address,
            dateOfBirth: formData.dateOfBirth,
            country: formData.country,
            state: formData.state,
            city: formData.city
          }}
          onInputChange={handleInputChange}
        />
      )}

      {/* UPDATED: Step 4: Verification with Toggle */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification</h3>
            <p className="text-gray-600">Choose your preferred verification method</p>
          </div>

          {/* NEW: Verification Method Toggle */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => {
                handleInputChange('verificationType', 'phone');
                setShowVerificationInput(false);
                setTwoFactorCode('');
                setTwoFactorVerified(false);
                setError('');
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                formData.verificationType === 'phone' ?'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📱 Phone Verification
            </button>
            <button
              type="button"
              onClick={() => {
                handleInputChange('verificationType', 'email');
                setShowVerificationInput(false);
                setTwoFactorCode('');
                setTwoFactorVerified(false);
                setError('');
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                formData.verificationType === 'email' ?'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ✉️ Email Verification
            </button>
          </div>

          {!showVerificationInput ? (
            <div className="space-y-4">
              {formData.verificationType === 'phone' ? (
                <>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(value) => handleInputChange('phone', value)}
                    countryCode={countryCode}
                    onCountryCodeChange={setCountryCode}
                    required
                    placeholder="XXX XXX XXX"
                  />
                  <Button 
                    type="button" 
                    onClick={handleSendCode} 
                    variant="outline" 
                    fullWidth 
                    className="mt-2"
                    disabled={loading || !formData.phone}
                  >
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Using email from step 2</p>
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleSendCode} 
                    variant="outline" 
                    fullWidth 
                    className="mt-2"
                    disabled={loading || !formData.email}
                  >
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-Digit Code</label>
                <Input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setTwoFactorCode(value);
                    setError('');
                  }}
                  className="text-center text-2xl tracking-widest"
                  placeholder="000000"
                  disabled={twoFactorVerified}
                />
              </div>
              
              {twoFactorVerified && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{formData.verificationType === 'phone' ? 'Phone number' : 'Email'} verified successfully!</span>
                </div>
              )}
              
              <Button 
                type="button" 
                onClick={handleVerifyCode} 
                variant="default" 
                fullWidth 
                className="mt-2"
                disabled={loading || twoFactorCode.length !== 6 || twoFactorVerified}
              >
                {twoFactorVerified ? 'Verified ✓' : loading ? 'Verifying...' : 'Verify Code'}
              </Button>
              
              {!twoFactorVerified && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerificationInput(false);
                      setTwoFactorCode('');
                      setTwoFactorVerified(false);
                      setError('');
                    }}
                    className="text-sm text-orange-600 hover:text-orange-700 underline w-full text-center"
                  >
                    Change {formData.verificationType === 'phone' ? 'Phone Number' : 'Email Address'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setTwoFactorCode('');
                      setError('');
                      await handleSendCode();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 underline w-full text-center"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Resend Code'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 5: Employee Application Form (only for non-students) */}
      {step === 5 && formData.role !== 'student' && (
        <EmployeeApplicationFormStep
          role={formData.role}
          onApplicationComplete={handleApplicationComplete}
          initialData={{
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
          }}
        />
      )}

      {/* Step 6: Subscription */}
      {step === 6 && (
        <div className="space-y-6">
          <SubscriptionStep
            selectedPlan={formData.subscriptionPlan}
            onPlanSelect={(plan) => handleInputChange('subscriptionPlan', plan)}
          />
        </div>
      )}

      {/* Step 7: Payment or Invoice Request */}
      {step === 7 && (
        <>
          {!showInvoiceRequest ? (
            <PaymentStep
              selectedPlan={formData.subscriptionPlan}
              billingCycle={billingCycle}
              userEmail={formData.email}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
              onRequestInvoice={handleRequestInvoice}
            />
          ) : (
            <InvoiceRequestStep
              userEmail={formData.email}
              selectedPlan={formData.subscriptionPlan}
              billingCycle={billingCycle}
              onInvoiceSent={handleInvoiceSent}
              onBackToPayment={handleBackToPayment}
            />
          )}
        </>
      )}

      {/* Step 8: Policy Agreement */}
      {step === 8 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Terms and Policies</h3>
            <p className="text-gray-600">Review and accept our terms to continue</p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="policiesAccepted"
                checked={formData.policiesAccepted === 'true'}
                onChange={(e) => handleInputChange('policiesAccepted', e.target.checked ? 'true' : 'false')}
                className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="policiesAccepted" className="flex-1 text-sm text-gray-700 leading-relaxed">
                I agree to LiqLearns' <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">Terms of Service</a> and <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">Privacy Policy</a>. 
                I understand that by creating an account, I consent to receive communications and agree to the platform's usage policies.
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 9: Final Confirmation */}
      {step === 9 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Created Successfully!</h3>
            <p className="text-gray-600">
              {formData.role === 'student' && formData.subscriptionPlan !== 'free' 
                ? 'Your payment was processed. You can now access your dashboard.' :'Complete payment to activate your subscription.'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-purple-50 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Username</span>
              <span className="text-sm font-semibold text-gray-900">{formData.username}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Email</span>
              <span className="text-sm font-semibold text-gray-900">{formData.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-600">Role</span>
              <span className="text-sm font-semibold text-gray-900 capitalize">{formData.role}</span>
            </div>
            {formData.sponsorName && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-600">Referred By</span>
                <span className="text-sm font-semibold text-gray-900">{formData.sponsorName}</span>
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={async () => {
              // For students with active subscription, go to dashboard
              // Otherwise, redirect to login
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const { data: studentProfile } = await supabase
                  .from('student_profiles')
                  .select('has_active_subscription')
                  .eq('id', user.id)
                  .single();

                if (studentProfile?.has_active_subscription) {
                  window.location.href = '/role-based-dashboard-hub';
                } else {
                  window.location.href = '/login';
                }
              } else {
                window.location.href = '/login';
              }
            }}
            variant="default"
            fullWidth
          >
            {formData.role === 'student' && formData.subscriptionPlan !== 'free'
              ? 'Go to Dashboard' : 'Continue to Sign In'}
          </Button>
        </div>
      )}

      {/* Navigation Buttons */}
      {step < 9 && step !== 5 && !showInvoiceRequest && (
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={handlePrevious}
            disabled={step === 1}
            variant="outline"
          >
            ← Previous
          </Button>

          {step < 8 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={loading || (step === 4 && !twoFactorVerified) || (step === 2 && (usernameAvailabilityStatus === 'checking' || emailAvailabilityStatus === 'checking'))}
              variant="default"
            >
              Next →
            </Button>
          ) : step === 8 ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.policiesAccepted || formData.policiesAccepted !== 'true'}
              variant="default"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Login;