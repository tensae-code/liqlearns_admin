import { supabase } from './supabase';

interface EdgeFunctionResponse<T = any> {
  data: T;
  error?: string;
}

/**
 * API client for calling Supabase Edge Functions
 */
export const apiClient = {
  /**
   * Call a Supabase Edge Function
   * @param path - The function path (e.g., '/check-username')
   * @param body - The request body
   */
  async post<T = any>(path: string, body: any): Promise<EdgeFunctionResponse<T>> {
    try {
      // Extract function name from path (e.g., '/functions/v1/check-username' -> 'check-username')
      const functionName = path.replace('/functions/v1/', '');
      
      // Log the request for debugging
      console.log(`🔵 Calling edge function: ${functionName}`, { body });
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
      });

      // Log the response for debugging
      console.log(`🟢 Edge function response: ${functionName}`, { data, error });

      if (error) {
        // Provide more detailed error information
        const errorMessage = error.message || error.toString() || 'Function call failed';
        console.error(`🔴 Edge function error: ${functionName}`, error);
        
        return {
          data: null as any,
          error: errorMessage,
        };
      }

      return {
        data: data || {},
      };
    } catch (err: any) {
      // Provide detailed error information including network errors
      const errorMessage = err.message || err.toString() || 'Network error';
      console.error('🔴 API Client Error:', {
        path,
        error: err,
        message: errorMessage,
        stack: err.stack
      });
      
      return {
        data: null as any,
        error: `Request failed: ${errorMessage}`,
      };
    }
  },
};