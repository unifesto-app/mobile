import { supabase } from '../../config/supabase';
import { getAuthSession } from './helpers';

export interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  banner_url?: string;
  thumbnail_url?: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  registration_start?: string;
  registration_end?: string;
  location?: string;
  venue?: string;
  city?: string;
  state?: string;
  country?: string;
  event_type: 'online' | 'offline' | 'hybrid';
  category?: string;
  tags?: string[];
  max_attendees?: number;
  is_free: boolean;
  price?: number;
  currency?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  is_featured: boolean;
  is_trending: boolean;
  organization_id: string;
  organization?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface EventListResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  registration_data?: any;
  ticket_id?: string;
  created_at: string;
  updated_at: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Fallback empty data
const EMPTY_EVENT_LIST: EventListResponse = {
  events: [],
  total: 0,
  page: 1,
  limit: 20,
};

/**
 * Fetch with timeout for React Native
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Get all events with pagination and filters
 */
export async function getEvents(
  page: number = 1,
  limit: number = 20,
  filters?: {
    search?: string;
    category?: string;
    event_type?: string;
    city?: string;
    is_free?: boolean;
    is_featured?: boolean;
    is_trending?: boolean;
    organization_id?: string;
  }
): Promise<EventListResponse> {
  try {
    // Build query params
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    // Call backend API - no auth required for public events
    const response = await fetchWithTimeout(`${API_URL}/public/events?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }, 10000);

    if (!response.ok) {
      console.error('[API] Error fetching events:', response.status, response.statusText);
      return EMPTY_EVENT_LIST;
    }

    const data = await response.json();
    return data || EMPTY_EVENT_LIST;
  } catch (error) {
    if (error instanceof Error) {
      console.error('[API] Error fetching events:', error.message);
    } else {
      console.error('[API] Unknown error fetching events');
    }
    return EMPTY_EVENT_LIST;
  }
}

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  try {
    // Call backend API - no auth required for public events
    const response = await fetchWithTimeout(`${API_URL}/public/events/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }, 10000);

    if (!response.ok) {
      console.error('[API] Error fetching event:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data.event || null;
  } catch (error) {
    if (error instanceof Error) {
      console.error('[API] Error fetching event:', error.message);
    }
    return null;
  }
}

/**
 * Get event by slug
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const session = await getAuthSession();
    if (!session) return null;

    // Call backend API
    const response = await fetch(`${API_URL}/events/slug/${slug}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error fetching event:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.event || null;
  } catch (error) {
    console.error('Unexpected error in getEventBySlug:', error);
    return null;
  }
}

/**
 * Get featured events
 */
export async function getFeaturedEvents(limit: number = 10): Promise<Event[]> {
  try {
    // Call backend API - no auth required for public events
    const response = await fetchWithTimeout(`${API_URL}/public/events/featured?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }, 10000);

    if (!response.ok) {
      console.error('[API] Error fetching featured events:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    if (error instanceof Error) {
      console.error('[API] Error fetching featured events:', error.message);
    }
    return [];
  }
}

/**
 * Get trending events (ongoing only)
 */
export async function getTrendingEvents(limit: number = 10): Promise<Event[]> {
  try {
    // Call backend API - no auth required for public events
    const response = await fetchWithTimeout(`${API_URL}/public/events/trending?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }, 10000);

    if (!response.ok) {
      console.error('[API] Error fetching trending events:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    if (error instanceof Error) {
      console.error('[API] Error fetching trending events:', error.message);
    }
    return [];
  }
}

/**
 * Register for an event
 */
export async function registerForEvent(
  eventId: string,
  registrationData?: any
): Promise<EventRegistration | null> {
  try {
    const session = await getAuthSession();
    if (!session) throw new Error('No active session');

    // Call backend API
    const response = await fetch(`${API_URL}/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ registration_data: registrationData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to register for event');
    }

    const data = await response.json();
    return data.registration || null;
  } catch (error) {
    console.error('Unexpected error in registerForEvent:', error);
    throw error;
  }
}

/**
 * Cancel event registration
 */
export async function cancelEventRegistration(eventId: string): Promise<boolean> {
  try {
    const session = await getAuthSession();
    if (!session) throw new Error('No active session');

    // Call backend API
    const response = await fetch(`${API_URL}/events/${eventId}/register`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel registration');
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in cancelEventRegistration:', error);
    throw error;
  }
}

/**
 * Get user's registered events
 */
export async function getMyRegisteredEvents(
  page: number = 1,
  limit: number = 20
): Promise<EventListResponse | null> {
  try {
    const session = await getAuthSession();
    if (!session) return null;

    // Build query params
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Call backend API
    const response = await fetch(`${API_URL}/events/my-registrations?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Silently return null - endpoint may not be implemented yet
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Silently return null - endpoint may not be implemented yet
    return null;
  }
}

/**
 * Check if user is registered for an event
 */
export async function isRegisteredForEvent(eventId: string): Promise<boolean> {
  try {
    const session = await getAuthSession();
    if (!session) return false;

    // Call backend API
    const response = await fetch(`${API_URL}/events/${eventId}/registration-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.is_registered || false;
  } catch (error) {
    console.error('Unexpected error in isRegisteredForEvent:', error);
    return false;
  }
}

/**
 * Search events
 */
export async function searchEvents(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<EventListResponse | null> {
  try {
    const session = await getAuthSession();
    if (!session) return null;

    // Build query params
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    // Call backend API
    const response = await fetch(`${API_URL}/events/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error searching events:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Unexpected error in searchEvents:', error);
    return null;
  }
}
