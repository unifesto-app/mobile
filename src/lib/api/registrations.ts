/**
 * Registrations API Client for Mobile App
 * Handles event registration and payment flow
 */

import { API_URL } from '../constants';
import { supabase } from '../../config/supabase';

export interface AttendeeData {
  name: string;
  email: string;
  mobile: string;
  gender: string;
  customFields?: Record<string, any>;
}

export interface CreateRegistrationData {
  eventId: string;
  ticketId: string;
  quantity: number;
  attendees: AttendeeData[];
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
}

export interface RegistrationResponse {
  registrations: any[];
  groupId: string | null;
  totalAmount: number;
  currency: string;
  razorpayOrder: {
    orderId: string;
    amount: number;
    currency: string;
    receipt: string;
  } | null;
  requiresPayment: boolean;
}

export interface VerifyPaymentData {
  registrationIds: string[];
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/**
 * Create event registration
 */
export async function createRegistration(
  data: CreateRegistrationData
): Promise<RegistrationResponse> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create registration');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating registration:', error);
    throw error;
  }
}

/**
 * Verify payment after Razorpay checkout
 */
export async function verifyPayment(data: VerifyPaymentData): Promise<any> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/registrations/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

/**
 * Get Razorpay configuration
 */
export async function getRazorpayConfig(): Promise<{ keyId: string }> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/registrations/razorpay-config`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Razorpay config');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Razorpay config:', error);
    throw error;
  }
}

/**
 * Get user's registrations
 */
export async function getUserRegistrations(eventId?: string): Promise<any> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const url = eventId
      ? `${API_URL}/registrations/my/event/${eventId}`
      : `${API_URL}/registrations/my`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch registrations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }
}

/**
 * Get registration by ID
 */
export async function getRegistration(registrationId: string): Promise<any> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/registrations/${registrationId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch registration');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching registration:', error);
    throw error;
  }
}

/**
 * Cancel registration
 */
export async function cancelRegistration(registrationId: string): Promise<any> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/registrations/${registrationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to cancel registration');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling registration:', error);
    throw error;
  }
}
