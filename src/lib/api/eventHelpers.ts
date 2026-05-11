/**
 * Event Helper Functions
 * Utilities to work with Event data from API
 */

import { Event } from './events';

/**
 * Format event date for display
 */
export function formatEventDate(event: Event): string {
  const startDate = new Date(event.start_date);
  return startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format event time for display
 */
export function formatEventTime(event: Event): string {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  
  const startTime = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const endTime = endDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return `${startTime} – ${endTime}`;
}

/**
 * Get event location display string
 */
export function getEventLocation(event: Event): string {
  if (event.event_type === 'online') {
    return 'Online Event';
  }
  
  if (event.venue) {
    return event.venue;
  }
  
  if (event.city && event.state) {
    return `${event.city}, ${event.state}`;
  }
  
  if (event.city) {
    return event.city;
  }
  
  if (event.location) {
    return event.location;
  }
  
  return 'Location TBA';
}

/**
 * Get event organizer name
 */
export function getEventOrganizer(event: Event): string {
  return event.organization?.name || 'Organizer';
}

/**
 * Format event price for display
 */
export function formatEventPrice(event: Event): string {
  if (event.is_free) {
    return 'Free';
  }
  
  const currency = event.currency || '₹';
  const price = event.price || 0;
  
  return `${currency}${price}`;
}

/**
 * Check if event is ongoing
 */
export function isEventOngoing(event: Event): boolean {
  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  
  return startDate <= now && endDate >= now;
}

/**
 * Check if event is upcoming
 */
export function isEventUpcoming(event: Event): boolean {
  const now = new Date();
  const startDate = new Date(event.start_date);
  
  return startDate > now;
}

/**
 * Check if event is past
 */
export function isEventPast(event: Event): boolean {
  const now = new Date();
  const endDate = new Date(event.end_date);
  
  return endDate < now;
}

/**
 * Get event status badge text
 */
export function getEventStatusBadge(event: Event): string | null {
  if (isEventOngoing(event)) {
    return 'Ongoing';
  }
  
  if (isEventUpcoming(event)) {
    return 'Upcoming';
  }
  
  if (isEventPast(event)) {
    return 'Past';
  }
  
  return null;
}

/**
 * Get short date format (e.g., "Mar 16")
 */
export function getShortDate(event: Event): string {
  const startDate = new Date(event.start_date);
  return startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
