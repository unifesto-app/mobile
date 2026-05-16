import { supabase } from '../../config/supabase';
import { Session } from '@supabase/supabase-js';

/**
 * Get current session with proper error handling
 * Automatically signs out user if refresh token is invalid
 */
export async function getAuthSession(): Promise<Session | null> {
  try {
    if (!supabase) {
      return null;
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      
      // If refresh token is invalid or not found, sign out the user
      if (
        error.message?.includes('Refresh Token') ||
        error.message?.includes('Invalid Refresh Token') ||
        error.message?.includes('refresh_token_not_found')
      ) {
        await supabase.auth.signOut().catch(() => {
          // Silent error handling
        });
      }
      
      return null;
    }
    
    if (!session) {
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Make authenticated API request with automatic token refresh
 */
export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response | null> {
  try {
    const session = await getAuthSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    const headers = {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  } catch (error) {
    return null;
  }
}
