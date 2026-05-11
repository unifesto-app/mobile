/**
 * App Constants
 * Shared constants used across the mobile app
 */

export const ALL_CATEGORIES = [
  'All',
  'Hackathon',
  'Ideathon',
  'Cultural',
  'MUN',
  'Film & Arts',
  'Entrepreneurship',
  'Science & Tech',
  'Workshop',
  'Sports',
];

export const STATUS_TABS = [
  { key: 'all', label: 'All Events' },
  { key: 'trending', label: 'Trending' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'featured', label: 'Featured' },
];

export const DATE_FILTERS = [
  { key: 'all', label: 'Any time' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'upcoming', label: 'Upcoming' },
];

export const PRICE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
];

export const ORG_TYPE_LABELS: Record<string, string> = {
  university: 'University',
  college: 'College',
  club: 'Club',
  community: 'Community',
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  online: 'Online',
  offline: 'In-Person',
  hybrid: 'Hybrid',
};
