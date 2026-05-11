import { supabase } from '../../config/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.unifesto.app';

/**
 * Get authorization headers with access token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

// ============================================================================
// WALLET PASSCODE APIs
// ============================================================================

/**
 * Request OTP for wallet passcode change
 */
export async function requestWalletOtp(email: string): Promise<{ message: string }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/auth/wallet/request-otp`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to request OTP');
    }

    return await response.json();
  } catch (error) {
    console.error('Error requesting wallet OTP:', error);
    throw error;
  }
}

/**
 * Verify OTP for wallet passcode change
 */
export async function verifyWalletOtp(
  email: string,
  otp: string
): Promise<{ message: string; token: string }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/auth/wallet/verify-otp`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify OTP');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying wallet OTP:', error);
    throw error;
  }
}

/**
 * Set wallet passcode (requires verified OTP token)
 */
export async function setWalletPasscode(
  passcode: string,
  otpToken: string
): Promise<{ message: string }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/auth/wallet/set-passcode`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ passcode, otp_token: otpToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to set passcode');
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting wallet passcode:', error);
    throw error;
  }
}

/**
 * Verify wallet passcode
 */
export async function verifyWalletPasscode(
  passcode: string
): Promise<{ valid: boolean; message: string }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/auth/wallet/verify-passcode`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ passcode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify passcode');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying wallet passcode:', error);
    throw error;
  }
}

/**
 * Check if user has wallet passcode set
 */
export async function hasWalletPasscode(): Promise<{ hasPasscode: boolean }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/auth/wallet/has-passcode`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check passcode status');
    }

    const data = await response.json();
    // Backend returns has_passcode (snake_case), convert to camelCase
    return { hasPasscode: data.has_passcode };
  } catch (error) {
    console.error('Error checking wallet passcode:', error);
    throw error;
  }
}

// ============================================================================
// WALLET BALANCE & TRANSACTIONS APIs
// ============================================================================

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface WalletStats {
  balance: number;
  currency: string;
  total_earned: number;
  total_spent: number;
  total_transactions: number;
}

export interface Transaction {
  id: string;
  type: 'earned' | 'spent' | 'refund' | 'referral_bonus' | 'event_reward' | 'purchase';
  amount: number;
  balance_after: number;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(): Promise<WalletBalance> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/wallet`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get wallet balance');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    throw error;
  }
}

/**
 * Get wallet statistics
 */
export async function getWalletStats(): Promise<WalletStats> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/wallet/stats`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get wallet stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting wallet stats:', error);
    throw error;
  }
}

/**
 * Get transaction history
 */
export async function getTransactions(
  limit: number = 50,
  offset: number = 0
): Promise<{ transactions: Transaction[]; count: number }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(
      `${API_URL}/wallet/transactions?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get transactions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
}

// ============================================================================
// REFERRAL APIs
// ============================================================================

export interface ReferralInfo {
  code: string;
  link: string;
  total_referrals: number;
  total_rewards: number;
  pending_referrals: number;
  completed_referrals: number;
}

export interface ReferralHistoryItem {
  id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'rewarded';
  reward_amount: number;
  rewarded_at: string | null;
  created_at: string;
}

/**
 * Get referral code and stats
 */
export async function getReferralInfo(): Promise<ReferralInfo> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/wallet/referral`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get referral info');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting referral info:', error);
    throw error;
  }
}

/**
 * Apply a referral code
 */
export async function applyReferralCode(
  referralCode: string
): Promise<{ message: string; referral: ReferralHistoryItem }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/wallet/referral/apply`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ referralCode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to apply referral code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error applying referral code:', error);
    throw error;
  }
}

/**
 * Get referral history
 */
export async function getReferralHistory(): Promise<{
  referrals: ReferralHistoryItem[];
  count: number;
}> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/wallet/referral/history`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get referral history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting referral history:', error);
    throw error;
  }
}
