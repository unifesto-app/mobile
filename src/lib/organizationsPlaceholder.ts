/**
 * Organizations Placeholder
 * Temporary placeholder until organizations API is implemented
 */

export const ORG_TYPE_LABELS: Record<string, string> = {
  university: 'University',
  college: 'College',
  club: 'Club',
  community: 'Community',
};

export interface Org {
  id: string;
  name: string;
  type: 'university' | 'college' | 'club' | 'community';
  description: string;
  parent_org_id?: string;
  logo_url?: string;
  website?: string;
}

// Placeholder functions - return empty data until API is implemented
export function getAllOrgs(): Org[] {
  console.warn('[Organizations] Using placeholder - Organizations API not yet implemented');
  return [];
}

export function getOrgById(id: string): Org | undefined {
  console.warn('[Organizations] Using placeholder - Organizations API not yet implemented');
  return undefined;
}

export function getSubOrgs(parentId: string): Org[] {
  console.warn('[Organizations] Using placeholder - Organizations API not yet implemented');
  return [];
}

export function getOrgsByType(type: string): Org[] {
  console.warn('[Organizations] Using placeholder - Organizations API not yet implemented');
  return [];
}

export function getEventsByOrgTree(orgId: string): any[] {
  console.warn('[Organizations] Using placeholder - Organizations API not yet implemented');
  return [];
}
