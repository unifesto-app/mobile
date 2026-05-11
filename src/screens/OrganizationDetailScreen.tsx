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
import { useRoute, useNavigation } from '@react-navigation/native';
import { Building2, Calendar, MapPin, Globe, Mail, Phone, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Footer from '../components/Footer';
import { colors, spacing, typography, borderRadius, shadows, brandGradient } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { getOrganizationById, getOrganizationEvents, Organization } from '../lib/api/organizations';
import { Event } from '../lib/api/events';

const ORG_TYPE_LABELS: Record<string, string> = {
  university: 'University',
  college: 'College',
  club: 'Club',
  community: 'Community',
  company: 'Company',
  other: 'Organization',
};

export default function OrganizationDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { organizationId } = route.params;
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadOrganizationData();
  }, [organizationId]);
  
  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      const [orgData, eventsData] = await Promise.all([
        getOrganizationById(organizationId),
        getOrganizationEvents(organizationId, 1, 20),
      ]);
      
      setOrganization(orgData);
      setEvents(eventsData?.events || []);
    } catch (error) {
      console.error('[OrganizationDetail] Error loading data:', error);
      // Set empty arrays on error to show empty state
      setEvents([]);
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
      <ScrollView showsVerticalScrollIndicator={false}>
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

          {/* Events Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Events ({events.length})</Text>
            </View>
            {events.length > 0 ? (
              <View style={styles.eventsGrid}>
                {events.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.eventCard}
                    onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                    activeOpacity={0.9}
                  >
                    <View style={styles.eventHeader}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {event.category}
                        </Text>
                      </View>
                      {event.is_trending && (
                        <View style={styles.trendingBadge}>
                          <Text style={styles.trendingBadgeText}>🔥</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.eventOrganizer} numberOfLines={1}>
                      {organization.name}
                    </Text>
                    <View style={styles.eventMeta}>
                      <View style={styles.eventMetaItem}>
                        <Calendar size={12} color={colors.textMuted} strokeWidth={2} />
                        <Text style={styles.eventMetaText}>
                          {new Date(event.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      </View>
                      {event.max_attendees && (
                        <View style={styles.eventMetaItem}>
                          <Users size={12} color={colors.textMuted} strokeWidth={2} />
                          <Text style={styles.eventMetaText}>{event.max_attendees}</Text>
                        </View>
                      )}
                    </View>
                    {event.is_free && (
                      <View style={styles.freeBadge}>
                        <Text style={styles.freeBadgeText}>Free</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
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
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    position: 'relative',
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
  },
  categoryBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
  },
  trendingBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  trendingBadgeText: {
    fontSize: typography.fontSize.xs,
  },
  eventTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginBottom: spacing[2],
    fontFamily: typography.fontFamily.primary,
  },
  eventOrganizer: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing[3],
  },
  eventMeta: {
    flexDirection: 'row',
    gap: spacing[4],
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
});
