import { makeAuthenticatedRequest } from './helpers';

export const getReferral = async () => {
  const response = await makeAuthenticatedRequest('/referral');
  if (!response?.ok) return null;
  return response.json();
};

export const applyReferralCode = async (code: string) => {
  const response = await makeAuthenticatedRequest('/referral/apply', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  if (!response?.ok) {
    const error = await response?.json();
    throw new Error(error?.message || 'Failed to apply referral code');
  }
  return response.json();
};
