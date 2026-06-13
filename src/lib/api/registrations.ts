import { makeAuthenticatedRequest } from './helpers';

export interface AttendeeData {
  name: string;
  email: string;
  mobile: string;
  gender: string;
  customFields?: Record<string, any>;
}

export interface CreateRegistrationData {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  attendees?: AttendeeData[];
  formResponses?: Record<string, any>;
}

export const registerRSVP = async (eventId: string, data: {
  quantity: number;
  formResponses?: Record<string, any>;
}) => {
  const response = await makeAuthenticatedRequest(`/events/${eventId}/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response?.ok) {
    const error = await response?.json();
    throw new Error(error?.message || 'Registration failed');
  }
  return response.json();
};

export const createPaymentOrder = async (eventId: string, data: {
  ticketTypeId: string;
  quantity: number;
  coinsToUse?: number;
  formResponses?: Record<string, any>;
}) => {
  const response = await makeAuthenticatedRequest(`/events/${eventId}/register/create-order`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response?.ok) {
    const error = await response?.json();
    throw new Error(error?.message || 'Failed to create order');
  }
  return response.json();
};

export const createRegistration = createPaymentOrder; // Alias for backward compatibility

export const getRazorpayConfig = async () => {
  const response = await makeAuthenticatedRequest('/payments/razorpay/config');
  if (!response?.ok) {
    throw new Error('Failed to fetch Razorpay config');
  }
  return response.json();
};

export const verifyPayment = async (eventId: string, data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  registrationId: string;
}) => {
  const response = await makeAuthenticatedRequest(`/events/${eventId}/register/verify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response?.ok) {
    const error = await response?.json();
    throw new Error(error?.message || 'Payment verification failed');
  }
  return response.json();
};

export const cancelRegistration = async (eventId: string) => {
  const response = await makeAuthenticatedRequest(`/events/${eventId}/register`, {
    method: 'DELETE',
  });

  if (!response?.ok) {
    const error = await response?.json();
    throw new Error(error?.message || 'Cancellation failed');
  }
  return response.json();
};

export const getMyRegistrations = async (page = 1, limit = 20) => {
  const response = await makeAuthenticatedRequest(`/users/me/registrations?page=${page}&limit=${limit}`);
  if (!response?.ok) return null;
  return response.json();
};
