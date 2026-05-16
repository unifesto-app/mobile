import { Event } from './events';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type?: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  parent_org_id?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationListResponse {
  organizations: Organization[];
  total: number;
  page: number;
  limit: number;
}

export interface OrganizationEventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

// Fallback empty data
const EMPTY_ORGANIZATION_LIST: OrganizationListResponse = {
  organizations: [],
  total: 0,
  page: 1,
  limit: 20,
};

const EMPTY_EVENTS_LIST: OrganizationEventsResponse = {
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
 * Get all organizations with pagination and search
 */
export async function getAllOrganizations(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<OrganizationListResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await fetchWithTimeout(
      `${API_URL}/public/organizations?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      10000
    );

    if (!response.ok) {
      return EMPTY_ORGANIZATION_LIST;
    }

    const data = await response.json();
    return data || EMPTY_ORGANIZATION_LIST;
  } catch (error) {
    if (error instanceof Error) {
    } else {
    }
    return EMPTY_ORGANIZATION_LIST;
  }
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  try {
    const response = await fetchWithTimeout(
      `${API_URL}/public/organizations/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      10000
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.organization || null;
  } catch (error) {
    if (error instanceof Error) {
    }
    return null;
  }
}

/**
 * Get organization's events
 */
export async function getOrganizationEvents(
  organizationId: string,
  page: number = 1,
  limit: number = 20
): Promise<OrganizationEventsResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetchWithTimeout(
      `${API_URL}/public/organizations/${organizationId}/events?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      10000
    );

    if (!response.ok) {
      return EMPTY_EVENTS_LIST;
    }

    const data = await response.json();
    return data || EMPTY_EVENTS_LIST;
  } catch (error) {
    if (error instanceof Error) {
    }
    return EMPTY_EVENTS_LIST;
  }
}

/**
 * Get sub-organizations of a parent organization
 */
export async function getSubOrganizations(parentId: string): Promise<{ organizations: Organization[] }> {
  try {
    const response = await fetchWithTimeout(
      `${API_URL}/public/organizations/${parentId}/sub-orgs`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      10000
    );

    if (!response.ok) {
      return { organizations: [] };
    }

    const data = await response.json();
    return data || { organizations: [] };
  } catch (error) {
    console.error('Error fetching sub-organizations:', error);
    return { organizations: [] };
  }
}

/**
 * Search organizations
 */
export async function searchOrganizations(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<OrganizationListResponse> {
  return getAllOrganizations(page, limit, query);
}
