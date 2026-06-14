import { makeAuthenticatedRequest, makePublicRequest } from './helpers';

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  type: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  registrationType: 'RSVP' | 'TICKETED';
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  venueName: string | null;
  venueAddress: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  onlineUrl: string | null;
  capacity: number | null;
  registeredCount: number;
  waitlistEnabled: boolean;
  isFree: boolean;
  tags: string[];
  category: string | null;
  visibility: 'PUBLIC' | 'PRIVATE' | 'SPACE_ONLY';
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  spaceId: string;
  createdBy: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  space?: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  creator?: {
    id: string;
    fullName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
  ticketTypes?: TicketType[];
  speakers?: EventSpeaker[];
  agenda?: EventAgenda[];
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  totalQuantity: number;
  soldCount: number;
  perUserLimit: number;
  isVisible: boolean;
  isActive: boolean;
}

export interface EventSpeaker {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  designation: string | null;
  company: string | null;
  linkedinUrl: string | null;
  order: number;
}

export interface EventAgenda {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  speakerName: string | null;
  order: number;
}

export const getEvents = async (params?: {
  page?: number;
  limit?: number;
  city?: string;
  category?: string;
  search?: string;
  isFree?: boolean;
}) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.city) query.append('city', params.city);
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.isFree !== undefined) query.append('isFree', String(params.isFree));

  const response = await makePublicRequest(`/events?${query.toString()}`);
  if (!response?.ok) return null;
  return response.json();
};

export const getEventBySlug = async (slug: string) => {
  const response = await makePublicRequest(`/events/${slug}`);
  if (!response?.ok) return null;
  return response.json() as Promise<Event>;
};

export const getEventById = async (id: string) => {
  const response = await makePublicRequest(`/events/${id}`);
  if (!response?.ok) return null;
  return response.json() as Promise<Event>;
};

export const getMyRegistration = async (eventId: string) => {
  const response = await makeAuthenticatedRequest(`/events/${eventId}/my-registration`);
  if (!response?.ok) return null;
  return response.json();
};

/**
 * Helper function to get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  return symbols[currency] || currency;
}

/**
 * Get display price for an event card
 */
export function getEventCardPrice(event: { isFree?: boolean; ticketTypes?: TicketType[] }): string {
  // Check if event has ticket types data
  if (event.ticketTypes && event.ticketTypes.length > 0) {
    const minPrice = Math.min(...event.ticketTypes.map(t => parseFloat(t.price)));
    
    // If min price is 0, it's free
    if (minPrice === 0) {
      return 'Free';
    }
    
    const currency = event.ticketTypes[0].currency;
    const symbol = getCurrencySymbol(currency);
    return `Starting from ${symbol}${minPrice}`;
  }
  
  // Fall back to isFree flag
  if (event.isFree === true) {
    return 'Free';
  }
  if (event.isFree === false) {
    return 'Paid';
  }
  
  // Default
  return 'Free';
}

/**
 * Get display price for an event
 */
export function getEventDisplayPrice(event: Event): string {
  if (event.isFree) {
    return 'Free';
  }
  
  if (event.ticketTypes && event.ticketTypes.length > 0) {
    const minPrice = Math.min(...event.ticketTypes.map(t => parseFloat(t.price)));
    const currency = event.ticketTypes[0].currency;
    const symbol = getCurrencySymbol(currency);
    return `Starting from ${symbol}${minPrice}`;
  }
  
  return 'Free';
}


export const getMyRegisteredEvents = async (page = 1, limit = 20) => {
  const response = await makeAuthenticatedRequest(`/users/me/registrations?page=${page}&limit=${limit}`);
  if (!response?.ok) return null;
  return response.json();
};

export const getFeaturedEvents = async (limit = 10) => {
  const params = new URLSearchParams({ limit: String(limit), featured: 'true' });
  const response = await makePublicRequest(`/events?${params.toString()}`);
  if (!response?.ok) return [];
  const data = await response.json();
  return data.events || data.data || [];
};

export const getTrendingEvents = async (limit = 10) => {
  const params = new URLSearchParams({ limit: String(limit), trending: 'true' });
  const response = await makePublicRequest(`/events?${params.toString()}`);
  if (!response?.ok) return [];
  const data = await response.json();
  return data.events || data.data || [];
};


export const isRegisteredForEvent = async (eventId: string): Promise<boolean> => {
  const response = await makeAuthenticatedRequest(`/events/${eventId}/my-registration`);
  if (!response?.ok) return false;
  const data = await response.json();
  return !!data;
};

export const getCategories = async () => {
  const response = await makePublicRequest('/categories');
  if (!response?.ok) return [];
  return response.json();
};
