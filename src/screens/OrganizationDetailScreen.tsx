import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, Calendar, MapPin, Globe, Mail, Phone, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Footer from '../components/Footer';
import { colors, spacing, typography, borderRadius, shadows, brandGradient } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { getOrganizationById, getOrganizationEvents, getSubOrganizations, Organization } from '../lib/api/organizations';
import { Event, getEventCardPrice } from '../lib/api/events';

const ORG_TYPE_LABELS: Record<string, string> = {
  university: 'University',
  college: 'College',
  club: 'Club',
  community: 'Community',
  company: 'Company',
  other: 'Organization',
};

interface OrganizationDetailScreenProps {
  route: { params: { organizationId: string } };
}

export default function OrganizationDetailScreen({ route }: OrganizationDetailScreenProps) {
  const router = useRouter();
  const { organizationId } = route.params;
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [parentOrg, setParentOrg] = useState<Organization | null>(null);
  const [subOrgs, setSubOrgs] = useState<Organization[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadOrganizationData();
  }, [organizationId]);
  
  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      const orgData = await getOrganizationById(organizationId);
      
      if (!orgData) {
        setLoading(false);
        return;
      }
      
      setOrganization(orgData);
      
      // Load events, parent org (if sub-org), and sub-orgs (if parent) in parallel
      const promises: Promise<any>[] = [
        getOrganizationEvents(organizationId, 1, 20),
      ];
      
      // If this org has a parent, load the parent
      if (orgData.parent_org_id) {
        promises.push(getOrganizationById(orgData.parent_org_id));
      } else {
        promises.push(Promise.resolve(null));
      }
      
      // Load sub-organizations
      promises.push(getSubOrganizations(organizationId));
      
      const [eventsData, parentOrgData, subOrgsData] = await Promise.all(promises);
      
      setEvents(eventsData?.events || []);
      setParentOrg(parentOrgData);
      setSubOrgs(subOrgsData?.organizations || []);
    } catch (error) {
      console.error('Error loading organization:', error);
      setEvents([]);
      setSubOrgs([]);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading organization...</Text>
      </View>
    );
  }
  
  if (!organization) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Building2 size={48} color={colors.textMuted} strokeWidth={1.5} />
        <Text style={styles.errorText}>Organization not found</Text>
      </View>
    );
  }

  // Calculate stats
  const upcomingCount = events.filter((e) => e.status === 'published').length;
  const totalAttendees = events.reduce((sum, e) => sum + (e.max_attendees || 0), 0);
  
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 0 }}>
        {/* Hero Section - Banner only */}
        {organization.banner_url ? (
          <Image
            source={{ uri: organization.banner_url }}
            style={styles.heroContainer}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={brandGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroContainer}
          />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
          style={styles.heroGradient}
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Logo Circle - Overlapping hero */}
          <View style={styles.logoWrapper}>
            {organization.logo_url ? (
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: organization.logo_url }}
                  style={styles.logo}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={[styles.logoContainer, styles.logoPlaceholder]}>
                <Text style={styles.logoText}>
                  {organization.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {ORG_TYPE_LABELS[organization.type || 'other'] || 'Organization'}
              </Text>
            </View>
            <GradientText style={styles.orgTitle}>{organization.name}</GradientText>
            {organization.is_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{events.length}</Text>
              <Text style={styles.statLabel}>Events Hosted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{upcomingCount}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalAttendees.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Capacity</Text>
            </View>
          </View>

          {/* About Section */}
          {organization.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>{organization.description}</Text>
            </View>
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Building2 size={20} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>
                  {ORG_TYPE_LABELS[organization.type || 'other'] || 'Organization'}
                </Text>
              </View>
            </View>

            {organization.city && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <MapPin size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>
                    {organization.city}{organization.state ? `, ${organization.state}` : ''}
                    {organization.country ? `, ${organization.country}` : ''}
                  </Text>
                </View>
              </View>
            )}

            {organization.email && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Mail size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{organization.email}</Text>
                </View>
              </View>
            )}

            {organization.phone && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Phone size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{organization.phone}</Text>
                </View>
              </View>
            )}

            {organization.website && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Globe size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Website</Text>
                  <Text style={styles.infoValue}>{organization.website}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Parent Organization (if this is a sub-org) */}
          {parentOrg && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Part of</Text>
              <TouchableOpacity
                style={styles.parentOrgCard}
                onPress={() => router.push(`/organization/${parentOrg.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.parentOrgContent}>
                  {parentOrg.logo_url ? (
                    <Image
                      source={{ uri: parentOrg.logo_url }}
                      style={styles.parentOrgLogo}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.parentOrgLogo, styles.parentOrgLogoPlaceholder]}>
                      <Text style={styles.parentOrgLogoText}>
                        {parentOrg.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.parentOrgInfo}>
                    <Text style={styles.parentOrgName}>{parentOrg.name}</Text>
                    <Text style={styles.parentOrgType}>
                      {ORG_TYPE_LABELS[parentOrg.type || 'other'] || 'Organization'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.parentOrgArrow}>→</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sub-Organizations (if this is a parent org) */}
          {subOrgs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Sub-Organizations ({subOrgs.length})
              </Text>
              <View style={styles.subOrgsGrid}>
                {subOrgs.map((subOrg) => (
                  <TouchableOpacity
                    key={subOrg.id}
                    style={styles.subOrgCard}
                    onPress={() => router.push(`/organization/${subOrg.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.subOrgContent}>
                      {subOrg.logo_url ? (
                        <Image
                          source={{ uri: subOrg.logo_url }}
                          style={styles.subOrgLogo}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.subOrgLogo, styles.subOrgLogoPlaceholder]}>
                          <Text style={styles.subOrgLogoText}>
                            {subOrg.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.subOrgInfo}>
                        <Text style={styles.subOrgName} numberOfLines={1}>{subOrg.name}</Text>
                        <Text style={styles.subOrgType}>
                          {ORG_TYPE_LABELS[subOrg.type || 'other'] || 'Organization'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Events Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Events ({events.length})</Text>
            </View>
            {events.length > 0 ? (
              <View style={styles.eventsGrid}>
                {events.map((event) => {
                  const imageUrl = event.banner_url || event.thumbnail_url || event.image_url;
                  const eventDate = new Date(event.start_date);
                  const formattedDate = eventDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  
                  return (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.eventCard}
                      onPress={() => router.push(`/event/${event.id}`)}
                      activeOpacity={0.9}
                    >
                      {/* Event Image/Poster */}
                      {imageUrl ? (
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.eventImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <LinearGradient
                          colors={['#667eea', '#764ba2']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.eventImage}
                        />
                      )}
                      
                      {/* Badges on image */}
                      <View style={styles.eventImageBadges}>
                        {event.is_trending && (
                          <View style={styles.trendingBadge}>
                            <Text style={styles.trendingBadgeText}>🔥 Trending</Text>
                          </View>
                        )}
                        {event.is_featured && (
                          <View style={styles.featuredBadge}>
                            <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Event Details */}
                      <View style={styles.eventDetails}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>
                            {event.category || 'Event'}
                          </Text>
                        </View>
                        
                        <Text style={styles.eventTitle} numberOfLines={2}>
                          {event.title}
                        </Text>
                        
                        <View style={styles.eventMeta}>
                          <View style={styles.eventMetaItem}>
                            <Calendar size={14} color={colors.textMuted} strokeWidth={2} />
                            <Text style={styles.eventMetaText}>{formattedDate}</Text>
                          </View>
                          {event.max_attendees && (
                            <View style={styles.eventMetaItem}>
                              <Users size={14} color={colors.textMuted} strokeWidth={2} />
                              <Text style={styles.eventMetaText}>{event.max_attendees}</Text>
                            </View>
                          )}
                        </View>
                        
                        {/* Footer with price */}
                        <View style={styles.eventFooter}>
                          <Text style={styles.eventPrice}>
                            {getEventCardPrice(event)}
                          </Text>
                          <View style={styles.viewButton}>
                            <Text style={styles.viewButtonText}>View →</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No events from this organization yet.</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <Footer />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('normal'),
    color: colors.textMuted,
  },
  errorText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('medium'),
    color: colors.textMuted,
  },
  heroContainer: {
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  content: {
    padding: spacing[8],
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: spacing[6],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 4,
    borderColor: colors.background,
    padding: spacing[2],
    ...shadows.lg,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  logoPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: getFontFamily('bold'),
    color: '#000000',
  },
  titleSection: {
    marginBottom: spacing[6],
  },
  typeBadge: {
    backgroundColor: 'rgba(52, 145, 255, 0.15)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
  },
  typeBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
  },
  orgTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.primary,
    lineHeight: typography.fontSize['3xl'] * 1.2,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(52, 145, 255, 0.15)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
  },
  verifiedText: {
    fontSize: typography.fontSize.xs,
    fontFamily: getFontFamily('medium'),
    color: colors.primary,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[8],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderMuted,
    marginHorizontal: spacing[2],
  },
  section: {
    marginBottom: spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[4],
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[8],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: spacing[5],
    ...shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing[1],
    fontFamily: getFontFamily('bold'),
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  eventsGrid: {
    gap: spacing[4],
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    overflow: 'hidden',
    ...shadows.md,
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  eventImageBadges: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    gap: spacing[2],
  },
  eventDetails: {
    padding: spacing[4],
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  categoryBadge: {
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
    alignSelf: 'flex-start',
    marginBottom: spacing[3],
  },
  categoryBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
  },
  trendingBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  trendingBadgeText: {
    fontSize: typography.fontSize.xs,
    color: '#ffd700',
    fontFamily: getFontFamily('bold'),
  },
  featuredBadge: {
    backgroundColor: 'rgba(52, 145, 255, 0.15)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
  },
  featuredBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
  },
  eventTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginBottom: spacing[3],
    fontFamily: typography.fontFamily.primary,
    lineHeight: typography.fontSize.base * 1.4,
  },
  eventOrganizer: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing[3],
  },
  eventMeta: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  eventMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.borderMuted,
  },
  eventPrice: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  viewButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  viewButtonText: {
    fontSize: typography.fontSize.xs,
    fontFamily: getFontFamily('bold'),
    color: '#000000',
  },
  freeBadge: {
    position: 'absolute',
    top: spacing[5],
    right: spacing[5],
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  freeBadgeText: {
    fontSize: typography.fontSize.xs,
    color: '#22c55e',
    fontFamily: getFontFamily('bold'),
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[12],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  // Parent Organization styles
  parentOrgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.sm,
  },
  parentOrgContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  parentOrgLogo: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  parentOrgLogoPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentOrgLogoText: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
    color: '#000000',
  },
  parentOrgInfo: {
    flex: 1,
  },
  parentOrgName: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  parentOrgType: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  parentOrgArrow: {
    fontSize: typography.fontSize.xl,
    color: colors.textMuted,
  },
  // Sub-Organizations styles
  subOrgsGrid: {
    gap: spacing[3],
  },
  subOrgCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  subOrgContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  subOrgLogo: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  subOrgLogoPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subOrgLogoText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: '#000000',
  },
  subOrgInfo: {
    flex: 1,
  },
  subOrgName: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  subOrgType: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
});
