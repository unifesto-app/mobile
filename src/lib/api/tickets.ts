/**
 * Tickets API Client for Mobile App
 * Handles ticket fetching for event registration (authenticated)
 */

import { makeAuthenticatedRequest } from './helpers';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export type TicketType = 'individual' | 'group';
export type PriceType = 'per_person' | 'per_group';
export type TicketVisibility = 'public' | 'private' | 'draft';
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'email' 
  | 'phone' 
  | 'number' 
  | 'dropdown' 
  | 'multi_select' 
  | 'radio' 
  | 'date' 
  | 'file' 
  | 'checkbox' 
  | 'url' 
  | 'country' 
  | 'id_proof_type' 
  | 'id_proof_upload';

export interface Ticket {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  type: TicketType;
  price_type: PriceType;
  price: number;
  currency: string;
  group_size?: number;
  allow_partial_group: boolean;
  require_all_member_details: boolean;
  group_leader_required: boolean;
  quantity_available: number;
  quantity_sold: number;
  min_purchase: number;
  max_purchase: number;
  sales_start?: string;
  sales_end?: string;
  visibility: TicketVisibility;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CustomField {
  id: string;
  event_id: string;
  label: string;
  field_type: FieldType;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  is_required: boolean;
  validation_rules?: Record<string, any>;
  options_json?: Array<{ label: string; value: string }>;
  applies_to_ticket_ids?: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

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
 * Get tickets for an event (authenticated)
 * Only returns public tickets for published events
 */
export async function getEventTickets(eventId: string): Promise<{ tickets: Ticket[] }> {
  try {
    const response = await makeAuthenticatedRequest(`/events/${eventId}/tickets`);
    
    if (!response?.ok) {
      return { tickets: [] };
    }

    const data = await response.json();
    
    // Filter to only show public tickets
    const publicTickets = (data.tickets || []).filter((ticket: Ticket) => 
      ticket.visibility === 'public' && 
      ticket.quantity_available > ticket.quantity_sold
    );
    
    return { tickets: publicTickets };
  } catch (error) {
    console.error('Error fetching event tickets:', error);
    return { tickets: [] };
  }
}

/**
 * Get custom fields for an event (authenticated)
 * Returns all custom fields for the event
 */
export async function getEventCustomFields(eventId: string): Promise<{ fields: CustomField[] }> {
  try {
    const response = await makeAuthenticatedRequest(`/events/${eventId}/custom-fields`);
    
    if (!response?.ok) {
      return { fields: [] };
    }

    const data = await response.json();
    
    return { fields: data.fields || [] };
  } catch (error) {
    console.error('Error fetching event custom fields:', error);
    return { fields: [] };
  }
}

/**
 * Get custom fields applicable to a specific ticket
 */
export function getFieldsForTicket(fields: CustomField[], ticketId: string): CustomField[] {
  return fields.filter(field => {
    // If applies_to_ticket_ids is null or empty, field applies to all tickets
    if (!field.applies_to_ticket_ids || field.applies_to_ticket_ids.length === 0) {
      return true;
    }
    // Otherwise, check if this ticket is in the list
    return field.applies_to_ticket_ids.includes(ticketId);
  });
}

/**
 * Check if tickets are available for sale
 */
export function isTicketAvailable(ticket: Ticket): boolean {
  const now = new Date();
  
  // Check if sold out
  if (ticket.quantity_sold >= ticket.quantity_available) {
    return false;
  }
  
  // Check sales period
  if (ticket.sales_start && new Date(ticket.sales_start) > now) {
    return false;
  }
  
  if (ticket.sales_end && new Date(ticket.sales_end) < now) {
    return false;
  }
  
  return true;
}

/**
 * Get the minimum ticket price for an event
 * Returns null if all tickets are free, otherwise returns the lowest price
 */
export function getMinimumTicketPrice(tickets: Ticket[]): { price: number; currency: string } | null {
  if (!tickets || tickets.length === 0) {
    return null;
  }

  // Filter out free tickets and get the minimum price
  const paidTickets = tickets.filter(ticket => ticket.price > 0);
  
  if (paidTickets.length === 0) {
    return null; // All tickets are free
  }

  // Find the ticket with minimum price
  const minTicket = paidTickets.reduce((min, ticket) => 
    ticket.price < min.price ? ticket : min
  );

  return {
    price: minTicket.price,
    currency: minTicket.currency,
  };
}

/**
 * Format price display for events
 * Returns "Free" if all tickets are free, otherwise "Starting from ₹X"
 */
export function formatEventPrice(tickets: Ticket[]): string {
  const minPrice = getMinimumTicketPrice(tickets);
  
  if (!minPrice) {
    return 'Free';
  }

  const currencySymbol = CURRENCY_SYMBOLS[minPrice.currency] || minPrice.currency;
  return `Starting from ${currencySymbol}${minPrice.price}`;
}

/**
 * Calculate ticket price based on quantity
 */
export function calculateTicketPrice(ticket: Ticket, quantity: number): number {
  if (ticket.price_type === 'per_person') {
    return ticket.price * quantity;
  } else {
    // per_group pricing
    return ticket.price;
  }
}
