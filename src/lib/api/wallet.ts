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
    throw error;
  }
}

// ============================================================================
// REDEEM CODE APIs
// ============================================================================

/**
 * Apply a redeem code
 */
export async function applyRedeemCode(
  code: string
): Promise<{ message: string; coin_amount: number; new_balance: number }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/wallet/redeem`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ code }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: `HTTP ${response.status}: ${responseText || 'Unknown error'}` };
      }
      
      throw new Error(errorData.message || errorData.error || `Failed to apply redeem code (${response.status})`);
    }

    return JSON.parse(responseText);
  } catch (error: any) {
    throw error;
  }
}

/**
 * Get referral reward amount setting
 */
export async function getReferralRewardAmount(): Promise<number> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/wallet/settings/referral-reward`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return 25; // Default fallback
    }

    const data = await response.json();
    return data.referral_reward_amount || 25;
  } catch (error) {
    return 25; // Default fallback
  }
}
