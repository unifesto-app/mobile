/**
 * Deep Linking API
 * Handles conversion of web slugs to mobile app IDs
 */

import { supabase } from '../../config/supabase';

/**
 * Get event ID from slug
 */
export async function getEventIdFromSlug(slug: string): Promise<string | null> {
  try {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('events')
      .select('id')
      .eq('slug', slug)
      .single();

    if (error) {
      return null;
    }

    return data?.id || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get organization ID from slug
 */
export async function getOrganizationIdFromSlug(slug: string): Promise<string | null> {
  try {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single();

    if (error) {
      return null;
    }

    return data?.id || null;
  } catch (error) {
    return null;
  }
}
