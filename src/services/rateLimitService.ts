import { supabase } from '../lib/supabase';

interface RateLimitResult {
  allowed: boolean;
  resetTime: number;
}

interface LoginAttempt {
  identifier: string;
  success: boolean;
  timestamp: number;
}

class RateLimitService {
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private attempts: Map<string, LoginAttempt[]> = new Map();

  async checkLoginRateLimit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Filter out old attempts
    const recentAttempts = userAttempts.filter(
      attempt => now - attempt.timestamp < this.windowMs
    );
    
    // Count failed attempts
    const failedAttempts = recentAttempts.filter(a => !a.success).length;
    
    if (failedAttempts >= this.maxAttempts) {
      const oldestFailedAttempt = recentAttempts.find(a => !a.success);
      const resetTime = oldestFailedAttempt 
        ? oldestFailedAttempt.timestamp + this.windowMs 
        : now + this.windowMs;
      
      return {
        allowed: false,
        resetTime
      };
    }
    
    return {
      allowed: true,
      resetTime: now + this.windowMs
    };
  }

  async logLoginAttempt(identifier: string, success: boolean): Promise<void> {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Add new attempt
    userAttempts.push({
      identifier,
      success,
      timestamp: now
    });
    
    // Clean old attempts
    const recentAttempts = userAttempts.filter(
      attempt => now - attempt.timestamp < this.windowMs
    );
    
    this.attempts.set(identifier, recentAttempts);
    
    // Log to database for audit trail
    try {
      await supabase.from('security_audit_logs').insert({
        event_type: 'login_attempt',
        success,
        event_description: success 
          ? `Successful login for ${identifier}` 
          : `Failed login attempt for ${identifier}`,
        ip_address: 'unknown', // Client-side can't reliably get real IP
        user_agent: navigator.userAgent
      });
    } catch (err) {
      console.error('Error logging login attempt:', err);
    }
  }

  clearAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const rateLimitService = new RateLimitService();