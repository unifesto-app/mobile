/**
 * Additional Info API Client for Mobile App
 * Handles agenda, speakers, prizes, and FAQ for event details
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// ==========================================
// TYPES
// ==========================================

export interface AgendaItem {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  speaker_ids?: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Speaker {
  id: string;
  event_id: string;
  name: string;
  title?: string;
  bio?: string;
  profile_image_url?: string;
  email?: string;
  phone?: string;
  social_links?: Record<string, string>;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Prize {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  value?: string;
  prize_type?: 'cash' | 'trophy' | 'certificate' | 'product' | 'other';
  position?: number;
  quantity: number;
  image_url?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Faq {
  id: string;
  event_id: string;
  question: string;
  answer: string;
  category?: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdditionalInfo {
  agenda: AgendaItem[];
  speakers: Speaker[];
  prizes: Prize[];
  faqs: Faq[];
}

// ==========================================
// HELPER FUNCTION
// ==========================================

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ==========================================
// PUBLIC API (No auth required)
// ==========================================

export async function getEventAgenda(eventId: string): Promise<AgendaItem[]> {
  try {
    const response = await fetchWithTimeout(`${API_URL}/public/events/${eventId}/agenda`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch agenda');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching agenda:', error);
    return [];
  }
}

export async function getEventSpeakers(eventId: string): Promise<Speaker[]> {
  try {
    const response = await fetchWithTimeout(`${API_URL}/public/events/${eventId}/speakers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch speakers');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching speakers:', error);
    return [];
  }
}

export async function getEventPrizes(eventId: string): Promise<Prize[]> {
  try {
    const response = await fetchWithTimeout(`${API_URL}/public/events/${eventId}/prizes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch prizes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching prizes:', error);
    return [];
  }
}

export async function getEventFaqs(eventId: string): Promise<Faq[]> {
  try {
    const response = await fetchWithTimeout(`${API_URL}/public/events/${eventId}/faq`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch FAQs');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
}

export async function getEventAdditionalInfo(eventId: string): Promise<AdditionalInfo> {
  try {
    const [agenda, speakers, prizes, faqs] = await Promise.all([
      getEventAgenda(eventId),
      getEventSpeakers(eventId),
      getEventPrizes(eventId),
      getEventFaqs(eventId),
    ]);

    return {
      agenda,
      speakers,
      prizes,
      faqs,
    };
  } catch (error) {
    console.error('Error fetching additional info:', error);
    return {
      agenda: [],
      speakers: [],
      prizes: [],
      faqs: [],
    };
  }
}
