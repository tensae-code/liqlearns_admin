import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
// STRIPE INTEGRATION REMOVED: Commented out Stripe customer creation import
// import { createStripeCustomer } from '../services/stripeService';

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name: string;
  phone?: string;
  role: 'student' | 'teacher' | 'support' | 'admin' | 'ceo';
  account_status: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, options?: any) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  sendTwoFactorCode: (phone: string) => Promise<{ error: any }>;
  verifyTwoFactorCode: (phone: string, code: string) => Promise<{ error: any; verified?: boolean }>;
  sendEmailOTP: (email: string) => Promise<{ error: any }>;
  verifyEmailOTP: (email: string, code: string) => Promise<{ error: any; verified?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session with error handling for invalid refresh tokens
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        // CRITICAL FIX: Handle invalid refresh token errors
        if (error) {
          console.error('Session restoration error:', error);
          
          // If it's a refresh token error, clear all auth data
          if (error.message?.includes('refresh') || error.message?.includes('Refresh Token')) {
            console.log('🔄 Clearing invalid session data...');
            
            // Clear all Supabase-related localStorage items
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('sb-')) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Clear sessionStorage
            const sessionKeysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i);
              if (key && key.startsWith('sb-')) {
                sessionKeysToRemove.push(key);
              }
            }
            sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
            
            console.log('✅ Invalid session cleared - user needs to login again');
          }
          
          // Set user to null regardless of error type
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          fetchUserProfile(session.user.id);
        }
        setLoading(false);
      })
      .catch((err) => {
        // Catch any unexpected errors
        console.error('Unexpected session error:', err);
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        // CRITICAL FIX: Handle TOKEN_REFRESHED events with errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('🔄 Token refresh failed - clearing session');
          setUser(null);
          setUserProfile(null);
          
          // Clear storage
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sb-')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        } else if (session?.user) {
          setUser(session.user);
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) return { error };
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, options?: any) => {
    try {
      setError(null);
      
      // Sign up with Supabase Auth - metadata will be used by trigger
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options?.data // This includes sponsor_name now
        }
      });

      if (error) throw error;
      if (!data.user) {
        throw new Error('User not returned after sign up.');
      }

      const profilePayload = {
        user_id: data.user.id,
        email,
        full_name: options?.data?.full_name,
        username: options?.data?.username,
        phone: options?.data?.phone,
        role: options?.data?.role,
        sponsor_name: options?.data?.sponsor_name,
        date_of_birth: options?.data?.date_of_birth,
        address: options?.data?.address,
        country: options?.data?.country,
        state: options?.data?.state,
        city: options?.data?.city
      };

      const { data: profileData, error: profileError } = await supabase.functions.invoke(
        'create-user-profile',
        {
          body: profilePayload
        }
      );

      if (profileError) {
        throw profileError;
      }

      if (profileData?.error) {
        throw new Error(profileData.error);
      }

      // STRIPE INTEGRATION REMOVED: Stripe customer creation code removed
      // User profiles are now created automatically by database triggers
      // No manual profile creation needed to avoid trigger conflicts

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message);
      return { data: null, error };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // CRITICAL FIX: Clear local state FIRST before calling Supabase signOut
      setUser(null);
      setUserProfile(null);
      
      // Call Supabase signOut to clear server-side session
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
      }
      
      // CRITICAL FIX: Force clear all Supabase-related localStorage items
      // This prevents auto-login issues when navigating after logout
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Also clear sessionStorage
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('sb-')) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      console.log('✅ Logout successful - all session data cleared');
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if there's an error, clear local state to ensure user is logged out
      setUser(null);
      setUserProfile(null);
    }
  };

  const sendTwoFactorCode = async (phone: string) => {
    try {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // FIXED: Explicitly set verified to false when inserting
      const { error } = await supabase
        .from('two_factor_codes')
        .insert({
          user_id: user?.id,
          code,
          phone,
          verified: false,  // Explicitly set to false (trigger will also ensure this)
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now
        });
      
      if (error) return { error };
      
      // Send SMS via Twilio Edge Function with improved error handling
      try {
        const { data, error: functionError } = await supabase.functions.invoke('send-twilio-sms', {
          body: {
            to: phone,
            message: `Your LiqLearns verification code is: ${code}. This code will expire in 10 minutes.`
          }
        });
        
        // Check for function invocation error
        if (functionError) {
          console.error('Twilio Edge Function error:', {
            name: functionError?.name,
            message: functionError?.message,
            context: functionError?.context,
          });
          console.log('2FA Code (SMS delivery failed):', code);
          // Don't return error - code is saved in DB and user can try again
        } 
        // Check response data structure
        else if (data) {
          if (data.success) {
            console.log('SMS sent successfully:', {
              messageSid: data.messageSid,
              status: data.status,
            });
          } else {
            console.error('SMS sending failed:', {
              error: data.error,
              details: data.details,
            });
            console.log('2FA Code (SMS delivery failed):', code);
          }
        } 
        // No data returned
        else {
          console.warn('Twilio function returned no data');
          console.log('2FA Code (no response data):', code);
        }
      } catch (smsError: any) {
        console.error('Failed to invoke Twilio function:', {
          name: smsError?.name,
          message: smsError?.message,
          stack: smsError?.stack,
        });
        console.log('2FA Code (SMS invocation failed):', code);
        // Don't return error - code is saved in DB and user can still proceed
      }
      
      // Always return success if code was saved to DB
      return { error: null };
    } catch (error: any) {
      console.error('Error in sendTwoFactorCode:', error);
      return { error };
    }
  };

  const verifyTwoFactorCode = async (phone: string, code: string) => {
    try {
      const { data, error } = await supabase
        .from('two_factor_codes')
        .select('*')
        .eq('phone', phone)
        .eq('code', code)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error || !data) {
        return { error: new Error('Invalid or expired code'), verified: false };
      }
      
      // Mark code as verified
      await supabase
        .from('two_factor_codes')
        .update({ verified: true })
        .eq('id', data.id);
      
      return { error: null, verified: true };
    } catch (error: any) {
      return { error, verified: false };
    }
  };

  const sendEmailOTP = async (email: string) => {
    try {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store code in database
      const { error } = await supabase
        .from('email_verifications')
        .insert({
          user_id: user?.id,
          email,
          code,
          verified: false,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        });
      
      if (error) return { error };
      
      // Send email via Edge Function
      try {
        const { data, error: functionError } = await supabase.functions.invoke('send-email-otp', {
          body: {
            to: email,
            code: code
          }
        });
        
        if (functionError) {
          console.error('Email Edge Function error:', {
            name: functionError?.name,
            message: functionError?.message,
            context: functionError?.context,
          });
          console.log('Email OTP Code (email delivery failed):', code);
        } else if (data) {
          if (data.success) {
            console.log('Email sent successfully:', {
              message: data.message
            });
          } else {
            console.error('Email sending failed:', {
              error: data.error,
              details: data.details,
            });
            console.log('Email OTP Code (email delivery failed):', code);
          }
        } else {
          console.warn('Email function returned no data');
          console.log('Email OTP Code (no response data):', code);
        }
      } catch (emailError: any) {
        console.error('Failed to invoke email function:', {
          name: emailError?.name,
          message: emailError?.message,
          stack: emailError?.stack,
        });
        console.log('Email OTP Code (email invocation failed):', code);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Error in sendEmailOTP:', error);
      return { error };
    }
  };

  const verifyEmailOTP = async (email: string, code: string) => {
    try {
      // Check if code has exceeded max attempts (3)
      const { data: existingCode, error: checkError } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('verified', false)
        .single();
      
      if (checkError || !existingCode) {
        return { error: new Error('Invalid or expired code'), verified: false };
      }
      
      // Check expiration
      if (new Date() > new Date(existingCode.expires_at)) {
        return { error: new Error('Code has expired'), verified: false };
      }
      
      // Check max attempts
      if (existingCode.attempts >= 3) {
        return { error: new Error('Maximum attempts exceeded'), verified: false };
      }
      
      // Verify code matches
      const { data, error } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error || !data) {
        // Increment attempts
        await supabase
          .from('email_verifications')
          .update({ attempts: existingCode.attempts + 1 })
          .eq('id', existingCode.id);
        
        return { error: new Error('Invalid code'), verified: false };
      }
      
      // Mark code as verified
      await supabase
        .from('email_verifications')
        .update({ verified: true })
        .eq('id', data.id);
      
      return { error: null, verified: true };
    } catch (error: any) {
      return { error, verified: false };
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    sendTwoFactorCode,
    verifyTwoFactorCode,
    sendEmailOTP,
    verifyEmailOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};