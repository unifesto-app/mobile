import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, TrendingUp, Clock, ArrowRight, Users, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Skeleton from '../components/Skeleton';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { useAuth } from '../context/AuthContext';
import { getProfile, Profile } from '../lib/api/profile';
import { getEvents, getFeaturedEvents, getTrendingEvents, Event, getEventCardPrice } from '../lib/api/events';

// Space needed to clear the transparent gradient header
const HEADER_TOP_OFFSET = Platform.OS === 'ios' ? 150 : 130;

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Load profile data
  const loadProfile = useCallback(async () => {
    if (user) {
      try {
        const userProfile = await getProfile();
        if (userProfile) {
          setProfile(userProfile);
        }
      } catch (error) {
      } finally {
        setIsLoadingProfile(false);
      }
    } else {
      setIsLoadingProfile(false);
    }
  }, [user]);

  // Load events data
  const loadEvents = useCallback(async () => {
    try {
      setIsLoadingEvents(true);

      // Load featured events
      const featured = await getFeaturedEvents(3);
      setFeaturedEvents(featured);

      // Load trending events (ongoing only)
      const trending = await getTrendingEvents(3);
      setTrendingEvents(trending);

      // Load upcoming events
      const upcoming = await getEvents(1, 3);
      setUpcomingEvents(upcoming.events);
    } catch (error) {
      // Set empty arrays on error
      setFeaturedEvents([]);
      setTrendingEvents([]);
      setUpcomingEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadProfile();
    loadEvents();
  }, [loadProfile, loadEvents]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadProfile(), loadEvents()]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [loadProfile, loadEvents]);

  const getDisplayName = () => {
    // Guest user
    if (!user) {
      return 'Guest';
    }
    if (profile?.name) {
      // Return first name only
      return profile.name.split(' ')[0];
    }
    if (profile?.username) {
      return profile.username;
    }
    return 'User';
  };

  const renderSkeletonEventCard = () => (
    <View style={styles.featuredEventCard}>
      <Skeleton width="100%" height={200} borderRadius={borderRadius.xl} />
      <View style={{ position: 'absolute', bottom: spacing[4], left: spacing[4], right: spacing[4] }}>
        <Skeleton width={80} height={16} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
        <Skeleton width="90%" height={20} borderRadius={borderRadius.md} style={{ marginBottom: spacing[2] }} />
        <View style={{ flexDirection: 'row', gap: spacing[3], marginBottom: spacing[2] }}>
          <Skeleton width={80} height={14} borderRadius={borderRadius.sm} />
          <Skeleton width={60} height={14} borderRadius={borderRadius.sm} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Skeleton width={100} height={14} borderRadius={borderRadius.sm} />
          <Skeleton width={50} height={14} borderRadius={borderRadius.sm} />
        </View>
      </View>
    </View>
  );

  const renderFeaturedEvent = (event: any) => (
    <TouchableOpacity
      key={event.id}
      style={styles.featuredEventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      activeOpacity={0.9}
    >
      {event.image_url || event.banner_url || event.thumbnail_url ? (
        <Image
          source={{ uri: event.image_url || event.banner_url || event.thumbnail_url }}
          style={styles.featuredEventImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.featuredEventImagePlaceholder}>
          <Text style={styles.featuredEventImageText}>{event.category}</Text>
        </View>
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
        style={styles.featuredEventGradient}
      />
      <View style={styles.featuredEventContent}>
        {/* Badges at top */}
        <View style={styles.featuredEventBadgesTop}>
          <View style={styles.featuredEventBadge}>
            <Text style={styles.featuredEventBadgeText}>{event.category}</Text>
          </View>
        </View>

        {/* Title and info at bottom */}
        <View style={styles.featuredEventBottom}>
          <Text style={styles.featuredEventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.featuredEventMeta}>
            <View style={styles.featuredEventMetaItem}>
              <Calendar size={12} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.featuredEventMetaText}>
                {new Date(event.start_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.featuredEventMetaItem}>
              <Users size={12} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.featuredEventMetaText}>{event.max_attendees || 'TBA'}</Text>
            </View>
          </View>
          <View style={styles.featuredEventFooter}>
            <Text style={styles.featuredEventOrganizer}>{event.organization?.name || 'Organizer'}</Text>
            <Text style={styles.featuredEventPrice}>
              {getEventCardPrice(event)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTrendingEvent = (event: any) => (
    <TouchableOpacity
      key={event.id}
      style={styles.featuredEventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      activeOpacity={0.9}
    >
      {event.image_url || event.banner_url || event.thumbnail_url ? (
        <Image
          source={{ uri: event.image_url || event.banner_url || event.thumbnail_url }}
          style={styles.featuredEventImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.featuredEventImagePlaceholder}>
          <Text style={styles.featuredEventImageText}>{event.category}</Text>
        </View>
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
        style={styles.featuredEventGradient}
      />
      <View style={styles.featuredEventContent}>
        {/* Trending Badge at top */}
        <View style={styles.featuredEventBadgesTop}>
          <View style={styles.trendingBadgeOnImage}>
            <TrendingUp size={8} color="#000000" strokeWidth={2.5} />
            <Text style={styles.trendingBadgeText}>Trending</Text>
          </View>
        </View>

        {/* Title and info at bottom */}
        <View style={styles.featuredEventBottom}>
          <Text style={styles.featuredEventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.featuredEventMeta}>
            <View style={styles.featuredEventMetaItem}>
              <Calendar size={12} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.featuredEventMetaText}>
                {new Date(event.start_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.featuredEventMetaItem}>
              <Users size={12} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.featuredEventMetaText}>{event.max_attendees || 'TBA'}</Text>
            </View>
          </View>
          <View style={styles.featuredEventFooter}>
            <Text style={styles.featuredEventOrganizer}>{event.organization?.name || 'Organizer'}</Text>
            <Text style={styles.featuredEventPrice}>
              {getEventCardPrice(event)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressViewOffset={HEADER_TOP_OFFSET}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            {isLoadingProfile ? (
              <Skeleton
                width={200}
                height={typography.fontSize['4xl'] * 1.2}
                borderRadius={borderRadius.md}
                style={styles.skeletonName}
              />
            ) : (
              <GradientText style={styles.welcomeUser}>{getDisplayName()}</GradientText>
            )}
          </View>

          {/* Guest Sign-In Prompt */}
          {!user && (
            <View style={styles.guestSection}>
              <TouchableOpacity
                style={styles.guestSignInPrompt}
                onPress={() => setShowLoginModal(true)}
                activeOpacity={0.8}
              >
                <View style={styles.guestSignInContent}>
                  <Text style={styles.guestSignInTitle}>Sign in to unlock more features</Text>
                  <Text style={styles.guestSignInDescription}>
                    Access Events, Tickets, Wallet & Profile
                  </Text>
                </View>
                <ArrowRight size={20} color={colors.primary} strokeWidth={2} />
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signUpPrompt}>
                <Text style={styles.signUpPromptText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.signUpPromptLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Attending Events - Tickets Section */}
        {/* TODO: Implement actual user tickets from registrations */}
        {/* Temporarily hidden until ticket system is implemented */}

        {/* Featured Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Events</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Discover')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={14} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {isLoadingEvents ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {[1, 2, 3].map((i) => (
                <View key={`skeleton-featured-${i}`}>
                  {renderSkeletonEventCard()}
                </View>
              ))}
            </ScrollView>
          ) : featuredEvents.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {featuredEvents.map(renderFeaturedEvent)}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No featured events available</Text>
            </View>
          )}
        </View>

        {/* Trending Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Discover')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={14} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {isLoadingEvents ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {[1, 2, 3].map((i) => (
                <View key={`skeleton-trending-${i}`}>
                  {renderSkeletonEventCard()}
                </View>
              ))}
            </ScrollView>
          ) : trendingEvents.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {trendingEvents.map(renderTrendingEvent)}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No trending events available</Text>
            </View>
          )}
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Coming Up</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Discover')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={14} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {isLoadingEvents ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {[1, 2, 3].map((i) => (
                <View key={`skeleton-upcoming-${i}`}>
                  {renderSkeletonEventCard()}
                </View>
              ))}
            </ScrollView>
          ) : upcomingEvents.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {upcomingEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.featuredEventCard}
                  onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                  activeOpacity={0.9}
                >
                  {event.image_url || event.banner_url || event.thumbnail_url ? (
                    <Image
                      source={{ uri: event.image_url || event.banner_url || event.thumbnail_url }}
                      style={styles.featuredEventImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.featuredEventImagePlaceholder}>
                      <Text style={styles.featuredEventImageText}>{event.category}</Text>
                    </View>
                  )}
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
                    style={styles.featuredEventGradient}
                  />
                  <View style={styles.featuredEventContent}>
                    {/* Badges at top */}
                    <View style={styles.featuredEventBadgesTop}>
                      <View style={styles.featuredEventBadge}>
                        <Text style={styles.featuredEventBadgeText}>{event.category}</Text>
                      </View>
                    </View>

                    {/* Title and info at bottom */}
                    <View style={styles.featuredEventBottom}>
                      <Text style={styles.featuredEventTitle} numberOfLines={2}>
                        {event.title}
                      </Text>
                      <View style={styles.featuredEventMeta}>
                        <View style={styles.featuredEventMetaItem}>
                          <Calendar size={12} color={colors.textMuted} strokeWidth={2} />
                          <Text style={styles.featuredEventMetaText}>
                            {new Date(event.start_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        </View>
                        <View style={styles.featuredEventMetaItem}>
                          <Users size={12} color={colors.textMuted} strokeWidth={2} />
                          <Text style={styles.featuredEventMetaText}>{event.max_attendees || 'TBA'}</Text>
                        </View>
                      </View>
                      <View style={styles.featuredEventFooter}>
                        <Text style={styles.featuredEventOrganizer}>{event.organization?.name || 'Organizer'}</Text>
                        <Text style={styles.featuredEventPrice}>
                          {getEventCardPrice(event)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No upcoming events available</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>

      {/* Login Modal */}
      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          loadProfile();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Welcome Section
  welcomeSection: {
    paddingHorizontal: spacing[6],
    paddingTop: HEADER_TOP_OFFSET,
    paddingBottom: spacing[8],
  },
  welcomeContent: {
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[1],
  },
  welcomeUser: {
    fontSize: typography.fontSize['4xl'],
    fontFamily: typography.fontFamily.primary,
    letterSpacing: -1,
  },
  skeletonName: {
    marginTop: spacing[1],
  },
  guestSection: {
    gap: spacing[4],
  },
  guestSignInPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginTop: spacing[6],
    ...shadows.md,
  },
  guestSignInContent: {
    flex: 1,
    marginRight: spacing[4],
  },
  guestSignInTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
    marginBottom: spacing[1],
  },
  guestSignInDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  signUpPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpPromptText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  signUpPromptLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
  },
  section: {
    marginBottom: spacing[12],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[6],
    marginBottom: spacing[6],
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: getFontFamily('bold'),
    letterSpacing: typography.letterSpacing.widest,
    marginBottom: spacing[2],
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
  },
  horizontalScroll: {
    paddingHorizontal: spacing[6],
    gap: spacing[4],
    paddingBottom: spacing[3],
  },
  // Attending Events - Ticket Design
  ticketWrapper: {
    width: 320,
  },
  ticketContainer: {
    position: 'relative',
    marginHorizontal: 16,
  },
  ticketCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 0.5,
    borderColor: colors.primary,
    ...shadows.lg,
  },
  ticketTop: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[5],
  },
  ticketMainContent: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  ticketImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketImagePlaceholder: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: getFontFamily('bold'),
    color: '#000000',
  },
  ticketTextContent: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: typography.fontSize.xl,
    color: colors.text,
    marginBottom: spacing[2],
    lineHeight: typography.fontSize.xl * 1.3,
    fontFamily: typography.fontFamily.primary,
  },
  ticketOrganizer: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[3],
  },
  ticketInfo: {
    gap: spacing[3],
  },
  ticketInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  ticketInfoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: getFontFamily('bold'),
  },
  dashedLineContainer: {
    paddingHorizontal: spacing[4],
  },
  dashedLine: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  ticketBottom: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[5],
    paddingBottom: spacing[6],
  },
  ticketBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  ticketBottomLeft: {
    flex: 1,
  },
  ticketId: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
    marginBottom: spacing[2],
  },
  categoryBadge: {
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
  },
  qrPlaceholder: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCode: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  cutout: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    top: '50%',
    marginTop: -12,
  },
  ticketLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: getFontFamily('bold'),
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing[1],
  },
  ticketValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
  },
  ticketCodeContainer: {
    alignItems: 'flex-end',
  },
  ticketCode: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: 'Courier',
  },
  cutoutLeft: {
    position: 'absolute',
    left: -13,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.primary,
  },
  cutoutRight: {
    position: 'absolute',
    right: -13,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderLeftWidth: 1,
    borderLeftColor: colors.primary,
  },
  // Featured Events
  featuredEventCard: {
    width: 320,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.lg,
  },
  featuredEventImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.backgroundSecondary,
  },
  featuredEventImagePlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredEventImageText: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: '#000000',
  },
  featuredEventGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  featuredEventContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing[4],
    justifyContent: 'space-between',
  },
  featuredEventBadgesTop: {
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  featuredEventBottom: {
    gap: spacing[2],
  },
  featuredEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  featuredEventBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featuredEventBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
  },
  urgencyBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  urgencyBadgeText: {
    fontSize: typography.fontSize.xs,
    color: '#ff6b6b',
    fontFamily: getFontFamily('bold'),
  },
  featuredEventTitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
    marginBottom: spacing[1],
    fontFamily: typography.fontFamily.primary,
  },
  featuredEventDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[3],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  featuredEventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  featuredEventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  featuredEventMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  featuredEventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredEventOrganizer: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    flex: 1,
  },
  featuredEventPrice: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.primary,
  },
  // Trending Events
  trendingEventCard: {
    width: 280,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.lg,
  },
  trendingEventImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  trendingEventImagePlaceholder: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingEventImageText: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: '#000000',
  },
  trendingEventContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[5],
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
  },
  trendingBadgeOnImage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
  },
  trendingBadgeText: {
    fontSize: typography.fontSize.xs,
    color: '#000000',
    fontFamily: getFontFamily('bold'),
  },
  trendingEventTitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
    marginBottom: spacing[2],
    fontFamily: typography.fontFamily.primary,
  },
  trendingEventDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[3],
  },
  trendingEventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingEventAttendees: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: getFontFamily('bold'),
  },
  trendingEventDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  // Upcoming Events
  upcomingEventsList: {
    paddingHorizontal: spacing[6],
    gap: spacing[4],
  },
  upcomingEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: spacing[4],
    ...shadows.sm,
  },
  upcomingEventContent: {
    flex: 1,
  },
  upcomingEventTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginBottom: spacing[1],
    fontFamily: typography.fontFamily.primary,
  },
  upcomingEventOrganizer: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing[2],
  },
  upcomingEventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flexWrap: 'wrap',
  },
  upcomingEventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  upcomingEventMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  upcomingEventBadge: {
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
  },
  upcomingEventBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
  },
  // View All Button
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  // Hyderabad Events
  hyderabadEventCard: {
    width: 280,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.md,
  },
  hyderabadEventImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.backgroundSecondary,
  },
  hyderabadEventContent: {
    padding: spacing[5],
    gap: spacing[2],
  },
  hyderabadEventTitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  hyderabadEventDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[3],
  },
  hyderabadEventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hyderabadEventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  hyderabadEventDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
  },
  emptyState: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[8],
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
});
