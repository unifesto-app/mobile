import { supabase } from '../../config/supabase';

export interface Profile {
  id: string;
  name?: string;
  username?: string;
  avatar_url?: string | null;
  bio?: string;
  email?: string;
  phone?: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileDto {
  name?: string;
  username?: string;
  avatar_url?: string | null;
  bio?: string;
  phone?: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.unifesto.app';

/**
 * Get current user profile from backend API
 */
export async function getProfile(): Promise<Profile | null> {
  try {
    if (!supabase) {
      console.error('Supabase not configured');
      return null;
    }

    // Get current session with refresh
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      // If refresh token is invalid, sign out the user
      if (sessionError.message?.includes('Refresh Token')) {
        await supabase.auth.signOut();
      }
      return null;
    }
    
    if (!session) {
      console.error('No active session');
      return null;
    }

    // Call backend API
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error fetching profile:', response.statusText);
      return null;
    }

    const data = await response.json();

    // Merge id and email into profile
    return {
      ...data.profile,
      id: data.id,
      email: data.email,
    };
  } catch (error) {
    console.error('Unexpected error in getProfile:', error);
    return null;
  }
}

/**
 * Create profile if it doesn't exist (sync with backend)
 */
export async function createProfileIfNotExists(): Promise<Profile | null> {
  try {
    if (!supabase) {
      console.error('Supabase not configured');
      return null;
    }

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session');
      return null;
    }

    // Call backend API
    const response = await fetch(`${API_URL}/auth/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error creating profile:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.profile || null;
  } catch (error) {
    console.error('Unexpected error in createProfileIfNotExists:', error);
    return null;
  }
}

/**
 * Update user profile via backend API
 */
export async function updateProfile(
  updateDto: UpdateProfileDto
): Promise<Profile | null> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    // Call backend API
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateDto),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const data = await response.json();
    return data.profile || null;
  } catch (error) {
    console.error('Unexpected error in updateProfile:', error);
    throw error;
  }
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(uri: string): Promise<string | null> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    // Create form data
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('avatar', {
      uri,
      name: filename,
      type,
    } as any);

    // Call backend API
    const response = await fetch(`${API_URL}/auth/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload avatar');
    }

    const data = await response.json();
    return data.avatar_url || null;
  } catch (error) {
    console.error('Unexpected error in uploadAvatar:', error);
    throw error;
  }
}

/**
 * Delete avatar image
 */
export async function deleteAvatar(): Promise<boolean> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    // Call backend API
    const response = await fetch(`${API_URL}/auth/avatar`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete avatar');
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in deleteAvatar:', error);
    throw error;
  }
}

/**
 * Delete user account permanently
 * This will delete all user data and sign the user out
 */
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    // Call backend API to delete account
    const response = await fetch(`${API_URL}/auth/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete account');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error in deleteAccount:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to delete account' 
    };
  }
}
