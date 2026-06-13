/**
 * Spaces API Service
 * Handles all space-related API calls to the backend
 */

import { Event } from './events';
import { makeAuthenticatedRequest, makePublicRequest } from './helpers';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.unifesto.app';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface Space {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type?: string | null;
  websiteUrl?: string | null;
  website_url?: string | null;
  logoUrl?: string | null;
  logo_url?: string | null;
  bannerUrl?: string | null;
  banner_url?: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  tags?: string[];
  visibility: 'PUBLIC' | 'PRIVATE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  coOrganiserLimit?: number;
  parent_org_id?: string | null;
  member_count?: number;
  event_count?: number;
  submittedAt?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    fullName: string | null;
    username: string | null;
  };
  _count?: {
    userRoles: number;
    discussions: number;
    events?: number;
  };
  userRoles?: SpaceMember[];
  userRole?: {
    id: string;
    userId: string;
    roleId: string;
    spaceId: string;
    role: {
      id: string;
      code: string;
      name: string;
      scope: string;
    };
  } | null;
}

export interface SpaceMember {
  id: string;
  user: {
    id: string;
    fullName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
  role: {
    id: string;
    code: string;
    name: string;
    scope: string;
  };
  createdAt: string;
}

export interface SpaceListResponse {
  spaces: Space[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    fullName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
  space: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface DiscussionReply {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    fullName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
}

export interface DiscussionListResponse {
  discussions: Discussion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// ============================================================================
// Public Space APIs (No authentication required)
// ============================================================================

/**
 * Get all public spaces with pagination, search, and filters
 */
export async function getAllSpaces(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  visibility?: string;
  city?: string;
  country?: string;
}): Promise<SpaceListResponse> {
  try {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
    });

    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.visibility) queryParams.append('visibility', params.visibility);
    if (params.city) queryParams.append('city', params.city);
    if (params.country) queryParams.append('country', params.country);

    const response = await fetch(
      `${API_URL}/spaces?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to fetch spaces');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get space by ID
 */
export async function getSpaceById(spaceId: string, accessToken?: string): Promise<Space> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    const response = await fetch(`${API_URL}/spaces/${spaceId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to fetch space');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get space by slug
 */
export async function getSpaceBySlug(slug: string): Promise<Space> {
  try {
    // Remove @ if present
    const cleanSlug = slug.replace(/^@/, '');
    
    const response = await fetch(`${API_URL}/spaces/slug/${cleanSlug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Space not found');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Search spaces
 */
export async function searchSpaces(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<SpaceListResponse> {
  return getAllSpaces({ page, limit, search: query, visibility: 'PUBLIC', status: 'ACTIVE' });
}

// ============================================================================
// Space Discussions APIs
// ============================================================================

/**
 * Get discussions for a space
 */
export async function getSpaceDiscussions(params: {
  spaceId: string;
  page?: number;
  limit?: number;
  status?: string;
}): Promise<DiscussionListResponse> {
  try {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
    });

    if (params.status) queryParams.append('status', params.status);

    const response = await fetch(
      `${API_URL}/discussions/space/${params.spaceId}?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to fetch discussions');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get discussion by ID
 */
export async function getDiscussionById(discussionId: string): Promise<Discussion> {
  try {
    const response = await fetch(`${API_URL}/discussions/${discussionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to fetch discussion');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get replies for a discussion
 */
export async function getDiscussionReplies(
  discussionId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ replies: DiscussionReply[]; pagination: any }> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_URL}/discussions/${discussionId}/replies?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to fetch replies');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// Authenticated Space APIs (Require access token)
// ============================================================================

/**
 * Create a discussion (authenticated)
 */
export async function createDiscussion(
  accessToken: string,
  data: {
    spaceId: string;
    title: string;
    content: string;
    status?: 'DRAFT' | 'PUBLISHED';
  }
): Promise<Discussion> {
  try {
    const response = await fetch(`${API_URL}/discussions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to create discussion');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Reply to a discussion (authenticated)
 */
export async function replyToDiscussion(
  accessToken: string,
  discussionId: string,
  content: string
): Promise<DiscussionReply> {
  try {
    const response = await fetch(`${API_URL}/discussions/${discussionId}/replies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to post reply');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get user's space memberships (authenticated)
 */
export async function getUserSpaces(accessToken: string): Promise<Space[]> {
  try {
    const response = await fetch(`${API_URL}/users/me/spaces`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to fetch user spaces');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get space's events
 */
export async function getSpaceEvents(
  spaceId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ events: Event[]; pagination: any }> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_URL}/events?spaceId=${spaceId}&${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to fetch space events');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get sub-spaces of a parent space
 */
export async function getSubSpaces(parentId: string): Promise<{ spaces: Space[] }> {
  try {
    const response = await fetch(
      `${API_URL}/spaces?parentId=${parentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to fetch sub-spaces');
    }

    const data: SpaceListResponse = await response.json();
    return { spaces: data.spaces };
  } catch (error) {
    throw error;
  }
}

/**
 * Join a space (authenticated)
 */
export async function joinSpace(
  accessToken: string,
  spaceId: string
): Promise<{ message: string; membership: any }> {
  try {
    const response = await fetch(`${API_URL}/spaces/${spaceId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to join space');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Leave a space (authenticated)
 */
export async function leaveSpace(
  accessToken: string,
  spaceId: string
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_URL}/spaces/${spaceId}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to leave space');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format space slug for display (add @ prefix)
 */
export function formatSpaceSlug(slug: string): string {
  return slug.startsWith('@') ? slug : `@${slug}`;
}

/**
 * Get space visibility badge color
 */
export function getVisibilityColor(visibility: string): string {
  return visibility === 'PUBLIC' ? '#10b981' : '#8b5cf6';
}

/**
 * Get space status badge color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: '#f59e0b',
    APPROVED: '#3b82f6',
    REJECTED: '#ef4444',
    ACTIVE: '#10b981',
    INACTIVE: '#6b7280',
    SUSPENDED: '#f97316',
    ARCHIVED: '#64748b',
  };
  return colors[status] || '#6b7280';
}

/**
 * Check if space is accessible (public or user is member)
 */
export function isSpaceAccessible(space: Space, userSpaces?: Space[]): boolean {
  if (space.visibility === 'PUBLIC' && space.status === 'ACTIVE') {
    return true;
  }
  
  if (userSpaces) {
    return userSpaces.some(s => s.id === space.id);
  }
  
  return false;
}


