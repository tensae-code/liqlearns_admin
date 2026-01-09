import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { LoginFormData, LoginFormErrors, LoginState } from '../types';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { rateLimitService } from '../../../services/rateLimitService';

interface LoginFormProps {
  className?: string;
}

const LoginForm = ({ className = '' }: LoginFormProps) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<LoginFormErrors>({});
  
  const [loginState, setLoginState] = useState<LoginState>({
    isLoading: false,
    showPassword: false,
    rememberMe: false
  });

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit before attempting login
    const rateLimitCheck = await rateLimitService.checkLoginRateLimit(formData.username);
    
    if (!rateLimitCheck.allowed) {
      const resetMinutes = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 60000);
      setErrors({
        general: `Too many failed login attempts. Please try again in ${resetMinutes} minutes.`
      });
      return;
    }

    setLoginState(prev => ({ ...prev, isLoading: true }));
    setErrors({});

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.username,
        password: formData.password,
      });

      if (error) {
        // Log failed attempt
        await rateLimitService.logLoginAttempt(formData.username, false);
        throw error;
      }

      // Log successful attempt
      await rateLimitService.logLoginAttempt(formData.username, true);
      
      navigate('/role-based-dashboard-hub');
    } catch (err: any) {
      const errorMessage = err?.message || 'An error occurred during login';
      setErrors({
        general: errorMessage
      });
      console.error('Login error:', err);
    } finally {
      setLoginState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const togglePasswordVisibility = () => {
    setLoginState(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }));
  };

  const handleRememberMeChange = (checked: boolean) => {
    setLoginState(prev => ({
      ...prev,
      rememberMe: checked
    }));
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setForgotPasswordError('Please enter a valid email address');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');

    try {
      const resetRedirectUrl =
        import.meta.env.VITE_SUPABASE_RESET_REDIRECT_URL ||
        `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: resetRedirectUrl
      });

      if (error) throw error;

      setForgotPasswordSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordSuccess(false);
        setForgotPasswordEmail('');
      }, 3000);
    } catch (error: any) {
      setForgotPasswordError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <>
      {!showForgotPassword ? (
        <form onSubmit={handleLogin} className={`space-y-6 ${className}`}>
          {/* General Error Message */}
          {errors.general && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-error" aria-hidden="true" />
                <p className="font-body text-sm text-error">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Username Field - Changed to email type for better validation */}
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.username}
            onChange={handleInputChange('username')}
            error={errors.username}
            disabled={loginState.isLoading}
            required
            className="w-full"
            autoComplete="email"
          />

          {/* Password Field */}
          <div className="relative">
            <Input
              label="Password"
              type={loginState.showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              disabled={loginState.isLoading}
              required
              className="w-full pr-12"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors duration-200"
              disabled={loginState.isLoading}
              aria-label={loginState.showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon 
                name={loginState.showPassword ? 'EyeOff' : 'Eye'} 
                size={18}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <Checkbox
              label="Remember me"
              checked={loginState.rememberMe}
              onChange={(e) => handleRememberMeChange(e.target.checked)}
              disabled={loginState.isLoading}
              className="text-sm"
            />
            
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setForgotPasswordError('');
                setForgotPasswordSuccess(false);
              }}
              className="font-body text-sm text-primary hover:text-primary/80 transition-colors duration-200"
              disabled={loginState.isLoading}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button with Loading State */}
          <Button
            type="submit"
            variant="default"
            size="lg"
            fullWidth
            loading={loginState.isLoading}
            disabled={loginState.isLoading}
            className="mt-8"
          >
            Sign In
          </Button>
        </form>
      ) : (
        <div className={`space-y-6 ${className}`}>
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h3>
            <p className="text-gray-600 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {forgotPasswordError && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-error" aria-hidden="true" />
                <p className="font-body text-sm text-error">{forgotPasswordError}</p>
              </div>
            </div>
          )}

          {forgotPasswordSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={16} className="text-green-600" aria-hidden="true" />
                <p className="font-body text-sm text-green-700">
                  Password reset link sent! Check your email inbox.
                </p>
              </div>
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={forgotPasswordEmail}
            onChange={(e) => {
              setForgotPasswordEmail(e.target.value);
              setForgotPasswordError('');
            }}
            error={forgotPasswordError}
            disabled={forgotPasswordLoading}
            required
            className="w-full"
          />

          <Button
            type="button"
            variant="default"
            size="lg"
            fullWidth
            loading={forgotPasswordLoading}
            disabled={forgotPasswordLoading || forgotPasswordSuccess}
            onClick={handleForgotPassword}
          >
            Send Reset Link
          </Button>

          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(false);
              setForgotPasswordEmail('');
              setForgotPasswordError('');
              setForgotPasswordSuccess(false);
            }}
            className="w-full text-center font-body text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            disabled={forgotPasswordLoading}
          >
            Back to Login
          </button>
        </div>
      )}
    </>
  );
};

export default LoginForm;