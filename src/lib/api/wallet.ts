import { makeAuthenticatedRequest } from './helpers';

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: 'earned' | 'spent' | 'refund' | 'referral_bonus' | 'event_reward' | 'purchase';
  amount: number;
  balanceAfter: number;
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface ReferralInfo {
  code: string;
  link: string;
  totalReferrals: number;
  totalRewards: number;
  pendingReferrals: number;
  completedReferrals: number;
}

export const getWallet = async () => {
  const response = await makeAuthenticatedRequest('/wallet');
  if (!response?.ok) return null;
  return response.json();
};

export const getTransactions = async (page = 1, limit = 20) => {
  const response = await makeAuthenticatedRequest(`/wallet/transactions?page=${page}&limit=${limit}`);
  if (!response?.ok) return null;
  return response.json();
};

export const redeemCode = async (code: string) => {
  const response = await makeAuthenticatedRequest('/wallet/redeem', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  if (!response?.ok) {
    const error = await response?.json();
    throw new Error(error?.message || 'Failed to redeem code');
  }
  return response.json();
};


export const getWalletBalance = getWallet; // Alias for backward compatibility

export const applyRedeemCode = redeemCode; // Alias for backward compatibility

export const getReferralInfo = async (): Promise<ReferralInfo | null> => {
  const response = await makeAuthenticatedRequest('/referral');
  if (!response?.ok) return null;
  return response.json();
};

export const getReferralRewardAmount = async (): Promise<number> => {
  const response = await makeAuthenticatedRequest('/referral/reward-amount');
  if (!response?.ok) return 25; // Default fallback
  const data = await response.json();
  return data.amount || 25;
};
