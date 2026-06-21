import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Ticket, Calendar, MapPin, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomHeader from '../../src/components/CustomHeader';
import GradientText from '../../src/components/GradientText';
import Skeleton from '../../src/components/Skeleton';
import { spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../../src/theme';
import { getFontFamily } from '../../src/theme/fontHelpers';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { getProfile, Profile } from '../../src/lib/api/profile';
import { getMyRegisteredEvents, Event } from '../../src/lib/api/events';
import { getUserSpaces, Space } from '../../src/lib/api/spaces';

// Space needed to clear the transparent gradient header
const HEADER_TOP_OFFSET = 150;

export default function HomeTab() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userTickets, setUserTickets] = useState<Event[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);

  // Create styles with current theme colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingTop: HEADER_TOP_OFFSET,
      paddingBottom: 100,
    },
    welcomeSection: {
      paddingHorizontal: spacing[6],
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
    guestCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius['2xl'],
      padding: spacing[5],
      marginTop: spacing[6],
      ...shadows.lg,
    },
    guestCardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[4],
    },
    guestIconGradient: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    guestCardContent: {
      flex: 1,
    },
    guestCardTitle: {
      fontSize: typography.fontSize.lg,
      color: colors.text,
      fontFamily: getFontFamily('bold'),
      marginBottom: spacing[1],
    },
    guestCardDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    },
    guestArrowButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(52, 145, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    newHereContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    newHereText: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      fontFamily: getFontFamily('normal'),
    },
    newHereLink: {
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      fontFamily: getFontFamily('bold'),
    },
    section: {
      marginBottom: spacing[12],
    },
    sectionHeaderClickable: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: spacing[6],
      marginBottom: spacing[6],
    },
    sectionTitle: {
      fontSize: typography.fontSize['2xl'],
      color: colors.text,
      fontFamily: typography.fontFamily.primary,
    },
    sectionArrow: {
      fontSize: typography.fontSize['2xl'],
      color: colors.primary,
      fontFamily: typography.fontFamily.primary,
      marginLeft: spacing[2],
    },
    horizontalScroll: {
      paddingHorizontal: spacing[6],
      gap: spacing[4],
      paddingBottom: spacing[3],
    },
    spacesGrid: {
      paddingHorizontal: spacing[6],
      gap: spacing[3],
    },
    spacesRow: {
      flexDirection: 'row',
      gap: spacing[3],
    },
    ticketCard: {
      width: 280,
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 0.5,
      borderColor: colors.borderMuted,
      ...shadows.lg,
      overflow: 'visible',
      position: 'relative',
    },
    ticketImageContainer: {
      width: '100%',
      aspectRatio: 4/3,
      overflow: 'hidden',
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
    },
    ticketCoverImage: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ticketTitle: {
      fontSize: typography.fontSize.base,
      color: colors.text,
      lineHeight: typography.fontSize.base * 1.3,
      fontFamily: getFontFamily('semibold'),
    },
    ticketInfo: {
      gap: spacing[2],
    },
    ticketInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    ticketInfoText: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      fontFamily: getFontFamily('normal'),
    },
    dashedLineContainer: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      height: 0,
    },
    dashedLine: {
      display: 'none',
    },
    ticketBottom: {
      paddingHorizontal: spacing[4],
      paddingTop: spacing[3],
      paddingBottom: spacing[4],
    },
    ticketBottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
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
      fontSize: typography.fontSize.xs,
      color: colors.primary,
      fontFamily: 'Courier',
    },
    cutoutCenter: {
      position: 'absolute',
      top: -30,
      left: '50%',
      marginLeft: -20,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.background,
      zIndex: 10,
    },
    emptyTicketsState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing[8],
      paddingHorizontal: spacing[6],
      gap: spacing[3],
      backgroundColor: colors.card,
      borderRadius: borderRadius['2xl'],
      marginHorizontal: spacing[6],
      borderWidth: 1,
      borderColor: colors.borderMuted,
    },
    emptyTicketsText: {
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
    },
    browseEventsButton: {
      marginTop: spacing[2],
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      backgroundColor: 'rgba(52, 145, 255, 0.15)',
      borderRadius: borderRadius.lg,
    },
    browseEventsButtonText: {
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      fontFamily: getFontFamily('bold'),
    },
    spaceCard: {
      width: 280,
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 0.5,
      borderColor: colors.borderMuted,
      ...shadows.md,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
    },
    spaceImageContainer: {
      width: 105,
      aspectRatio: 4/3,
      backgroundColor: colors.background,
      flexShrink: 0,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      margin: spacing[3],
    },
    spaceImage: {
      width: '100%',
      height: '100%',
    },
    spaceImagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    spaceImagePlaceholderText: {
      fontSize: typography.fontSize['4xl'],
      fontFamily: getFontFamily('bold'),
      color: colors.text,
    },
    spaceContent: {
      flex: 1,
      paddingRight: spacing[3],
      paddingVertical: spacing[3],
      gap: spacing[2],
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    spaceName: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      fontFamily: getFontFamily('semibold'),
      lineHeight: typography.fontSize.sm * 1.3,
      textAlign: 'left',
    },
    spaceLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
    },
    spaceLocation: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
      textAlign: 'left',
    },
    spaceTypeContainer: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(52, 145, 255, 0.15)',
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.md,
    },
    spaceType: {
      fontSize: typography.fontSize.xs,
      color: colors.primary,
      fontFamily: getFontFamily('semibold'),
      textTransform: 'capitalize',
    },
    emptySpacesState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing[8],
      paddingHorizontal: spacing[6],
      gap: spacing[3],
      backgroundColor: colors.card,
      borderRadius: borderRadius['2xl'],
      marginHorizontal: spacing[6],
      borderWidth: 1,
      borderColor: colors.borderMuted,
    },
    emptySpacesText: {
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
    },
    browseSpacesButton: {
      marginTop: spacing[2],
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      backgroundColor: 'rgba(52, 145, 255, 0.15)',
      borderRadius: borderRadius.lg,
    },
    browseSpacesButtonText: {
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      fontFamily: getFontFamily('bold'),
    },
  });

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

  // Load user tickets
  const loadUserTickets = useCallback(async () => {
    if (!user) {
      setUserTickets([]);
      return;
    }

    try {
      setIsLoadingTickets(true);
      const response = await getMyRegisteredEvents(1, 5);
      
      if (response && (response.data || response.events)) {
        // Filter for upcoming events only
        const now = new Date();
        const registrations = response.data || response.events || [];
        const upcomingTickets = registrations
          .map((reg: any) => reg.event ? { ...reg.event, qrCode: reg.qrCode, registrationId: reg.id, ticketType: reg.ticketType, ticketCode: reg.tickets?.[0]?.ticketCode } : reg)
          .filter((event: any) => event && event.startDateTime && new Date(event.startDateTime) >= now);
        setUserTickets(upcomingTickets.slice(0, 5));
      } else {
        setUserTickets([]);
      }
    } catch (error) {
      setUserTickets([]);
    } finally {
      setIsLoadingTickets(false);
    }
  }, [user]);

  // Load spaces - only user's spaces if logged in
  const loadSpaces = useCallback(async () => {
    if (!user || !token) {
      setSpaces([]);
      setIsLoadingSpaces(false);
      return;
    }

    try {
      setIsLoadingSpaces(true);
      const userSpaces = await getUserSpaces(token);
      
      if (userSpaces && userSpaces.length > 0) {
        setSpaces(userSpaces.slice(0, 10));
      } else {
        setSpaces([]);
      }
    } catch (error) {
      console.error('Failed to load user spaces:', error);
      setSpaces([]);
    } finally {
      setIsLoadingSpaces(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadProfile();
    loadUserTickets();
    loadSpaces();
  }, [loadProfile, loadUserTickets, loadSpaces]);

  // Reload when user changes
  useEffect(() => {
    if (user) {
      setIsLoadingProfile(true);
      loadProfile();
    }
  }, [user, loadProfile]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadProfile(), loadUserTickets(), loadSpaces()]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [loadProfile, loadUserTickets, loadSpaces]);

  const getDisplayName = () => {
    // Guest user
    if (!user) {
      return 'Guest';
    }
    
    // Check profile data first
    if (profile?.fullName) {
      // Return first name only
      return profile.fullName.split(' ')[0];
    }
    if (profile?.username) {
      return profile.username;
    }
    
    // Fallback to user data from auth
    if (user.fullName) {
      return user.fullName.split(' ')[0];
    }
    if (user.username) {
      return user.username;
    }
    
    // Fallback to mobile number (last 4 digits)
    if (user.mobileNumber) {
      return `User ${user.mobileNumber.slice(-4)}`;
    }
    
    return 'User';
  };

  const renderTicketCard = (event: any) => {
    const eventDate = new Date(event.startDateTime);
    const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const venue = event.venueName || event.city || 'TBA';
    const typeLabel = event.type === 'IN_PERSON' ? 'In Person' : event.type === 'ONLINE' ? 'Online' : event.category || 'Event';

    return (
      <TouchableOpacity
        key={event.registrationId || event.id}
        style={styles.ticketCard}
        onPress={() => router.push({ 
          pathname: '/ticket/[id]', 
          params: { 
            id: event.id, 
            ticket: JSON.stringify(event)
          } 
        })}
        activeOpacity={0.9}
      >
        {/* Center cutout at top of card */}
        <View style={styles.cutoutCenter} />
        
        {/* Cover Image */}
        <View style={styles.ticketImageContainer}>
          {event.coverImageUrl ? (
            <Image source={{ uri: event.coverImageUrl }} style={styles.ticketCoverImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={brandGradient} start={brandGradientStart} end={brandGradientEnd} style={styles.ticketCoverImage}>
              <Text style={{ fontSize: 32, color: '#fff', fontFamily: getFontFamily('bold') }}>{event.title?.[0] || 'E'}</Text>
            </LinearGradient>
          )}
          {/* Bottom gradient dissolve */}
          <LinearGradient
            colors={['transparent', colors.card]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 }}
          />
        </View>

        {/* Bottom Section */}
        <View style={styles.ticketBottom}>
          <Text style={styles.ticketTitle} numberOfLines={2}>{event.title}</Text>
          <View style={{ gap: 6, marginTop: 8 }}>
            <View style={styles.ticketInfoRow}>
              <Calendar size={12} color={colors.primary} strokeWidth={2} />
              <Text style={styles.ticketInfoText}>{formattedDate} · {formattedTime}</Text>
            </View>
            <View style={styles.ticketInfoRow}>
              <MapPin size={12} color={colors.primary} strokeWidth={2} />
              <Text style={styles.ticketInfoText} numberOfLines={1}>{venue}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletonTicketCard = () => (
    <View style={styles.ticketCard}>
      <View style={styles.cutoutCenter} />
      <View style={styles.ticketImageContainer}>
        <Skeleton width={280} height={210} borderRadius={0} />
      </View>
      <View style={styles.ticketBottom}>
        <Skeleton width={240} height={16} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[3] }} />
        <Skeleton width={180} height={12} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
        <Skeleton width={150} height={12} borderRadius={borderRadius.sm} />
      </View>
    </View>
  );

  const renderSpaceCard = (space: Space) => {
    return (
      <TouchableOpacity
        key={space.id}
        style={styles.spaceCard}
        onPress={() => router.push(`/space/${space.id}`)}
        activeOpacity={0.9}
      >
        {/* Left - Image 4:3 */}
        <View style={styles.spaceImageContainer}>
          {(space.logoUrl || space.logo_url) ? (
            <Image source={{ uri: (space.logoUrl || space.logo_url) as string }} style={styles.spaceImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={brandGradient} start={brandGradientStart} end={brandGradientEnd} style={[styles.spaceImage, { alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={styles.spaceImagePlaceholderText}>{space.name.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
          )}
        </View>
        {/* Right - Content */}
        <View style={styles.spaceContent}>
          <Text style={styles.spaceName} numberOfLines={2}>{space.name}</Text>
          {space.city && (
            <View style={styles.spaceLocationRow}>
              <MapPin size={11} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.spaceLocation} numberOfLines={1}>{space.city}{space.state ? `, ${space.state}` : ''}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletonSpaceCard = () => (
    <View style={styles.spaceCard}>
      <Skeleton width={140} height={140} borderRadius={borderRadius.lg} />
      <View style={styles.spaceContent}>
        <Skeleton width="90%" height={16} borderRadius={borderRadius.sm} />
        <Skeleton width="70%" height={12} borderRadius={borderRadius.sm} style={{ marginTop: spacing[2] }} />
        <Skeleton width={60} height={20} borderRadius={borderRadius.md} style={{ marginTop: spacing[2] }} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
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
                style={styles.guestCard}
                onPress={() => router.push('/login')}
                activeOpacity={0.8}
              >
                <View style={styles.guestCardRow}>
                  <LinearGradient
                    colors={brandGradient}
                    start={brandGradientStart}
                    end={brandGradientEnd}
                    style={styles.guestIconGradient}
                  >
                    <User size={24} color={colors.text} strokeWidth={2} />
                  </LinearGradient>

                  <View style={styles.guestCardContent}>
                    <Text style={styles.guestCardTitle}>Sign in to Unlock</Text>
                    <Text style={styles.guestCardDescription}>
                      Events, Tickets, Wallet & Profile
                    </Text>
                  </View>

                  <View style={styles.guestArrowButton}>
                    <ArrowRight size={20} color={colors.primary} strokeWidth={2.5} />
                  </View>
                </View>
              </TouchableOpacity>

              {/* New Here Link */}
              <View style={styles.newHereContainer}>
                <Text style={styles.newHereText}>New here? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.newHereLink}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Profile Completion Banner */}
          {user && !profile?.username && (
            <TouchableOpacity
              style={styles.guestCard}
              onPress={() => router.push('/account')}
              activeOpacity={0.8}
            >
              <View style={styles.guestCardRow}>
                <LinearGradient
                  colors={brandGradient}
                  start={brandGradientStart}
                  end={brandGradientEnd}
                  style={styles.guestIconGradient}
                >
                  <User size={24} color={colors.text} strokeWidth={2} />
                </LinearGradient>
                <View style={styles.guestCardContent}>
                  <Text style={styles.guestCardTitle}>Set Your Username</Text>
                  <Text style={styles.guestCardDescription}>
                    Choose a username in Account Settings
                  </Text>
                </View>
                <View style={styles.guestArrowButton}>
                  <ArrowRight size={20} color={colors.primary} strokeWidth={2.5} />
                </View>
              </View>
            </TouchableOpacity>
          )}
          {user && !!profile?.username && !profile?.fullName && (
            <TouchableOpacity
              style={styles.guestCard}
              onPress={() => router.push('/edit-profile')}
              activeOpacity={0.8}
            >
              <View style={styles.guestCardRow}>
                <LinearGradient
                  colors={brandGradient}
                  start={brandGradientStart}
                  end={brandGradientEnd}
                  style={styles.guestIconGradient}
                >
                  <User size={24} color={colors.text} strokeWidth={2} />
                </LinearGradient>
                <View style={styles.guestCardContent}>
                  <Text style={styles.guestCardTitle}>Complete Your Profile</Text>
                  <Text style={styles.guestCardDescription}>
                    Add your name and details
                  </Text>
                </View>
                <View style={styles.guestArrowButton}>
                  <ArrowRight size={20} color={colors.primary} strokeWidth={2.5} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Your Tickets Section - Only if user is logged in */}
        {user && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeaderClickable}
              onPress={() => router.push('/tickets')}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Your Tickets</Text>
              <Text style={styles.sectionArrow}> {'>'}</Text>
            </TouchableOpacity>
            {isLoadingTickets ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {[1, 2, 3].map((i) => (
                  <View key={`skeleton-ticket-${i}`}>
                    {renderSkeletonTicketCard()}
                  </View>
                ))}
              </ScrollView>
            ) : userTickets.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {userTickets.map(renderTicketCard)}
              </ScrollView>
            ) : (
              <View style={styles.emptyTicketsState}>
                <Ticket size={48} color={colors.textMuted} strokeWidth={1.5} />
                <Text style={styles.emptyTicketsText}>No upcoming tickets</Text>
                <TouchableOpacity
                  style={styles.browseEventsButton}
                  onPress={() => router.push('/events')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.browseEventsButtonText}>Browse Events</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Your Spaces Section - Only if user is logged in */}
        {user && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeaderClickable}
              onPress={() => router.push('/spaces')}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Your Spaces</Text>
              <Text style={styles.sectionArrow}> {'>'}</Text>
            </TouchableOpacity>
            {isLoadingSpaces ? (
              <View style={styles.spacesGrid}>
                {[0, 1].map((rowIndex) => (
                  <ScrollView
                    key={`skeleton-row-${rowIndex}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.spacesRow}
                  >
                    {[1, 2, 3].map((i) => (
                      <View key={`skeleton-space-${rowIndex}-${i}`}>
                        {renderSkeletonSpaceCard()}
                      </View>
                    ))}
                  </ScrollView>
                ))}
              </View>
            ) : spaces.length > 0 ? (
              <View style={styles.spacesGrid}>
                {/* First Row */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.spacesRow}
                >
                  {spaces.slice(0, Math.ceil(spaces.length / 2)).map(renderSpaceCard)}
                </ScrollView>
                {/* Second Row - only if there are more than half */}
                {spaces.length > Math.ceil(spaces.length / 2) && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.spacesRow}
                  >
                    {spaces.slice(Math.ceil(spaces.length / 2)).map(renderSpaceCard)}
                  </ScrollView>
                )}
              </View>
            ) : (
              <View style={styles.emptySpacesState}>
                <MapPin size={48} color={colors.textMuted} strokeWidth={1.5} />
                <Text style={styles.emptySpacesText}>No spaces available</Text>
                <TouchableOpacity
                  style={styles.browseSpacesButton}
                  onPress={() => router.push('/spaces')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.browseSpacesButtonText}>Browse Spaces</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

