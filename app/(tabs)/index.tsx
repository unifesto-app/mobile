import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, TextInput, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Calendar, GridFour, MagnifyingGlass, MapPin, Sparkle, Ticket, TrendUp, User, X } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomHeader from '../../src/components/CustomHeader';
import GradientText from '../../src/components/GradientText';
import Skeleton from '../../src/components/Skeleton';
import { spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../../src/theme';
import { getFontFamily } from '../../src/theme/fontHelpers';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { getProfile, Profile } from '../../src/lib/api/profile';
import { getMyRegisteredEvents, Event, getEvents, getEventCardPrice, getCategories, getFeaturedEvents, getTrendingEvents } from '../../src/lib/api/events';
import { getUserSpaces, Space, getAllSpaces } from '../../src/lib/api/spaces';

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
  const [allSpaces, setAllSpaces] = useState<Space[]>([]);
  const [isLoadingAllSpaces, setIsLoadingAllSpaces] = useState(true);
  
  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  
  // Events state
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'trending' | 'featured' | 'upcoming'>('upcoming');
  
  // Search state
  const searchInputRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'events' | 'spaces'>('events');
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [spaceSearchResults, setSpaceSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    welcomeTextRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      flexWrap: 'wrap',
      marginBottom: spacing[2],
    },
    welcomeText: {
      fontSize: typography.fontSize['3xl'],
      color: colors.textSecondary,
      fontFamily: typography.fontFamily.primary,
    },
    welcomeUser: {
      fontSize: typography.fontSize['3xl'],
      fontFamily: typography.fontFamily.primary,
      letterSpacing: -0.5,
    },
    timeBasedWish: {
      fontSize: typography.fontSize.lg,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
      marginTop: spacing[1],
    },
    skeletonName: {
      marginTop: 0,
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
      width: 240,
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
      fontSize: typography.fontSize.sm,
      color: colors.text,
      lineHeight: typography.fontSize.sm * 1.3,
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
      paddingHorizontal: spacing[3],
      paddingTop: spacing[2],
      paddingBottom: spacing[3],
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
      top: -20,
      left: '50%',
      marginLeft: -15,
      width: 40,
      height: 40,
      borderRadius: 20,
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
      width: 240,
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
      width: 90,
      aspectRatio: 4/3,
      backgroundColor: colors.background,
      flexShrink: 0,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      margin: spacing[2],
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
      fontSize: typography.fontSize['3xl'],
      fontFamily: getFontFamily('bold'),
      color: colors.text,
    },
    spaceContent: {
      flex: 1,
      paddingRight: spacing[2],
      paddingVertical: spacing[2],
      gap: spacing[1],
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    spaceName: {
      fontSize: typography.fontSize.xs,
      color: colors.text,
      fontFamily: getFontFamily('semibold'),
      lineHeight: typography.fontSize.xs * 1.3,
      textAlign: 'left',
    },
    spaceLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[0.5],
    },
    spaceLocation: {
      fontSize: 10,
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
    // Space Stack List (Vertical) for Explore Spaces
    spaceStackList: {
      paddingHorizontal: spacing[6],
    },
    spaceStackItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing[4],
      gap: spacing[4],
    },
    spaceDivider: {
      height: 1,
      backgroundColor: colors.borderMuted,
      marginLeft: spacing[6] + 64 + spacing[4], // indent to align with text
    },
    spaceStackLogoContainer: {
      width: 64,
      height: 64,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      flexShrink: 0,
    },
    spaceStackLogo: {
      width: '100%',
      height: '100%',
    },
    spaceStackLogoPlaceholder: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    spaceStackLogoText: {
      fontSize: typography.fontSize['2xl'],
      fontFamily: getFontFamily('bold'),
      color: colors.text,
    },
    spaceStackContent: {
      flex: 1,
      gap: spacing[2],
    },
    spaceStackName: {
      fontSize: typography.fontSize.lg,
      color: colors.text,
      fontFamily: getFontFamily('bold'),
      lineHeight: typography.fontSize.lg * 1.3,
    },
    spaceStackMetaText: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
    },
    spaceStackStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    spaceStackStatDot: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
    },
    spaceStackStatText: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
    },
    // Search Section
    searchSection: {
      paddingHorizontal: spacing[6],
      marginBottom: spacing[8],
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: borderRadius['2xl'],
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      borderWidth: 1,
      borderColor: colors.borderMuted,
      gap: spacing[3],
      ...shadows.md,
    },
    searchPlaceholder: {
      flex: 1,
      fontSize: typography.fontSize.base,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
      paddingVertical: spacing[1],
    },
    searchInput: {
      flex: 1,
      fontSize: typography.fontSize.base,
      color: colors.text,
      fontFamily: getFontFamily('normal'),
      paddingVertical: spacing[1],
    },
    // Modal Styles
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      paddingTop: Platform.OS === 'ios' ? 50 : 20,
      paddingHorizontal: spacing[4],
      paddingBottom: spacing[3],
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderMuted,
    },
    modalHeaderTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing[3],
    },
    modalBackButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalHeaderTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      flex: 1,
      marginLeft: spacing[2],
    },
    modalTitle: {
      fontSize: typography.fontSize['2xl'],
      fontFamily: getFontFamily('bold'),
      color: colors.text,
    },
    modalToggle: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: 3,
    },
    modalToggleButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: borderRadius.md,
    },
    modalToggleButtonActive: {
      backgroundColor: colors.primary,
    },
    modalToggleText: {
      fontFamily: getFontFamily('semibold'),
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
    },
    modalToggleTextActive: {
      color: '#fff',
    },
    modalSearchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      borderWidth: 1,
      borderColor: colors.borderMuted,
      gap: spacing[3],
    },
    modalContent: {
      flex: 1,
    },
    searchResultsContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchResultsList: {
      paddingBottom: spacing[6],
    },
    searchResultCard: {
      flexDirection: 'row',
      padding: spacing[4],
      paddingHorizontal: spacing[6],
      gap: spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: colors.borderMuted,
      backgroundColor: colors.background,
    },
    searchResultImageContainer: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
    },
    searchResultImage: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.backgroundSecondary,
    },
    searchResultImagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchResultImageText: {
      fontSize: typography.fontSize.xl,
      fontFamily: getFontFamily('bold'),
      color: colors.text,
    },
    searchResultContent: {
      flex: 1,
      justifyContent: 'space-between',
    },
    searchResultTitle: {
      fontSize: typography.fontSize.base,
      fontFamily: getFontFamily('semibold'),
      color: colors.text,
      marginBottom: spacing[1],
      lineHeight: typography.fontSize.base * 1.3,
    },
    searchResultOrganizer: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      marginBottom: spacing[2],
    },
    searchResultMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    searchResultMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
    },
    searchResultMetaText: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
    },
    searchResultPrice: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('bold'),
      color: colors.primary,
    },
    searchResultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: colors.borderMuted,
    },
    searchResultsCount: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('semibold'),
      color: colors.text,
    },
    viewAllSearchText: {
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      fontFamily: getFontFamily('bold'),
    },
    searchEmptyState: {
      padding: spacing[12],
      alignItems: 'center',
      gap: spacing[3],
    },
    searchEmptyTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: getFontFamily('bold'),
      color: colors.text,
    },
    searchEmptyText: {
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
    },
    // Categories Section
    categoriesScrollContainer: {
      paddingHorizontal: spacing[6],
    },
    categoriesContainer: {
      gap: spacing[3],
    },
    categoryRow: {
      flexDirection: 'row',
      gap: spacing[3],
    },
    categoryCard: {
      width: 200,
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: borderRadius['2xl'],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderMuted,
      padding: spacing[3],
      gap: spacing[3],
      ...shadows.lg,
    },
    categoryImageContainer: {
      width: 80,
      aspectRatio: 4 / 3,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
    },
    categoryImage: {
      width: '100%',
      height: '100%',
    },
    categoryInfo: {
      flex: 1,
      justifyContent: 'center',
      gap: spacing[1],
    },
    categoryName: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('bold'),
      color: colors.text,
    },
    categoryMetaText: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: spacing[6],
      marginBottom: spacing[6],
    },
    // Filter Section
    filterSection: {
      marginBottom: spacing[6],
    },
    filterScrollContainer: {
      paddingHorizontal: spacing[6],
      gap: spacing[3],
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      borderRadius: borderRadius.lg,
      backgroundColor: colors.card,
    },
    filterButtonActive: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    filterButtonText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      fontFamily: getFontFamily('semibold'),
    },
    filterButtonTextActive: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      fontFamily: getFontFamily('semibold'),
    },
    filterButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      borderRadius: borderRadius.lg,
    },
    // Featured Events
    featuredEventCard: {
      width: 320,
      borderRadius: borderRadius['2xl'],
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
      backgroundColor: colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featuredEventImageText: {
      fontSize: typography.fontSize.xl,
      fontFamily: getFontFamily('bold'),
      color: colors.text,
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
      justifyContent: 'space-between',
      gap: spacing[2],
      flexWrap: 'wrap',
    },
    featuredEventBottom: {
      gap: spacing[2],
    },
    featuredEventPriceBadge: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.md,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    featuredEventPriceBadgeText: {
      fontSize: typography.fontSize.xs,
      color: colors.text,
      fontFamily: getFontFamily('bold'),
    },
    featuredEventTitle: {
      fontSize: typography.fontSize.lg,
      color: '#ffffff',
      marginBottom: spacing[1],
      fontFamily: typography.fontFamily.primary,
    },
    featuredEventMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
      flexWrap: 'wrap',
    },
    featuredEventMetaText: {
      fontSize: typography.fontSize.xs,
      color: 'rgba(255,255,255,0.8)',
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
      color: colors.text,
      fontFamily: getFontFamily('bold'),
    },
    emptyState: {
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[8],
      alignItems: 'center',
      gap: spacing[2],
    },
    emptyStateText: {
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
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

  // Load all spaces for Explore section
  const loadAllSpaces = useCallback(async () => {
    try {
      setIsLoadingAllSpaces(true);
      const response = await getAllSpaces({ page: 1, limit: 4 });
      setAllSpaces(response.spaces);
    } catch (error) {
      console.error('Failed to load all spaces:', error);
      setAllSpaces([]);
    } finally {
      setIsLoadingAllSpaces(false);
    }
  }, []);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch { setCategories([]); }
  }, []);

  // Load events data
  const loadEvents = useCallback(async () => {
    try {
      setIsLoadingEvents(true);

      const [featured, trending, upcoming] = await Promise.all([
        getFeaturedEvents(10),
        getTrendingEvents(10),
        getEvents({ page: 1, limit: 10 }),
      ]);

      setFeaturedEvents(featured);
      setTrendingEvents(trending);
      setUpcomingEvents(upcoming?.data || upcoming?.events || []);
    } catch (error) {
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
    loadUserTickets();
    loadSpaces();
    loadAllSpaces();
    loadCategories();
    loadEvents();
  }, [loadProfile, loadUserTickets, loadSpaces, loadAllSpaces, loadCategories, loadEvents]);
  
  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
      await Promise.all([loadProfile(), loadUserTickets(), loadSpaces(), loadAllSpaces(), loadEvents()]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [loadProfile, loadUserTickets, loadSpaces, loadAllSpaces, loadEvents]);

  // Search handlers
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({ pathname: '/events', params: { search: searchQuery } });
    }
  };

  const handleSearchChange = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim().length === 0) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    if (query.trim().length < 2) {
      return;
    }

    setIsSearching(true);
    setSearchLoading(true);
    setSpaceSearchResults([]);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await getEvents({ page: 1, limit: 10, search: query });
        setSearchResults(response?.events || response?.data || []);
        try {
          const spaceResp = await getAllSpaces({ search: query, limit: 10 });
          setSpaceSearchResults(spaceResp?.spaces || []);
        } catch { setSpaceSearchResults([]); }
      } catch (error) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const openSearchModal = () => {
    setShowSearchModal(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    clearSearch();
  };

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

  const getTimeBasedWish = () => {
    const hour = new Date().getHours();
    
    if (hour >= 0 && hour < 4) {
      return 'Burning the midnight oil?';
    } else if (hour >= 4 && hour < 6) {
      return 'Early bird catches the worm!';
    } else if (hour >= 6 && hour < 12) {
      return 'Good morning! Ready to explore?';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon! What\'s happening today?';
    } else if (hour >= 17 && hour < 21) {
      return 'Good evening! Time to unwind?';
    } else {
      return 'Good night! Looking for late events?';
    }
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
              <Text style={{ fontSize: 28, color: '#fff', fontFamily: getFontFamily('bold') }}>{event.title?.[0] || 'E'}</Text>
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
          <View style={{ gap: 4, marginTop: 6 }}>
            <View style={styles.ticketInfoRow}>
              <Calendar size={11} color={colors.primary} />
              <Text style={styles.ticketInfoText}>{formattedDate} · {formattedTime}</Text>
            </View>
            <View style={styles.ticketInfoRow}>
              <MapPin size={11} color={colors.primary} />
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
        <Skeleton width={240} height={180} borderRadius={0} />
      </View>
      <View style={styles.ticketBottom}>
        <Skeleton width={200} height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
        <Skeleton width={150} height={10} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
        <Skeleton width={120} height={10} borderRadius={borderRadius.sm} />
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
              <MapPin size={9} color={colors.textMuted} />
              <Text style={styles.spaceLocation} numberOfLines={1}>{space.city}{space.state ? `, ${space.state}` : ''}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletonSpaceCard = () => (
    <View style={styles.spaceCard}>
      <Skeleton width={120} height={120} borderRadius={borderRadius.lg} />
      <View style={styles.spaceContent}>
        <Skeleton width="90%" height={14} borderRadius={borderRadius.sm} />
        <Skeleton width="70%" height={10} borderRadius={borderRadius.sm} style={{ marginTop: spacing[1] }} />
      </View>
    </View>
  );

  const renderSkeletonSpaceStack = (index: number) => (
    <View key={`skeleton-space-${index}`}>
      <View style={styles.spaceStackItem}>
        <Skeleton width={64} height={64} borderRadius={borderRadius.lg} />
        <View style={styles.spaceStackContent}>
          <Skeleton width="80%" height={20} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
          <Skeleton width="60%" height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
          <Skeleton width="90%" height={14} borderRadius={borderRadius.sm} />
        </View>
      </View>
      {index < 3 && <View style={styles.spaceDivider} />}
    </View>
  );

  const renderSearchResult = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.searchResultCard}
      onPress={() => {
        closeSearchModal();
        router.push(`/event/${event.slug || event.id}`);
      }}
      activeOpacity={0.9}
    >
      <View style={styles.searchResultImageContainer}>
        {event.coverImageUrl ? (
          <Image
            source={{ uri: event.coverImageUrl }}
            style={styles.searchResultImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.searchResultImagePlaceholder}>
            <Text style={styles.searchResultImageText}>
              {event.category?.charAt(0) || 'E'}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.searchResultContent}>
        <Text style={styles.searchResultTitle} numberOfLines={2}>
          {event.title}
        </Text>
        {event.space?.name && (
          <Text style={styles.searchResultOrganizer} numberOfLines={1}>
            {event.space.name}
          </Text>
        )}
        <View style={styles.searchResultMeta}>
          <View style={styles.searchResultMetaItem}>
            <Calendar size={12} color={colors.textMuted} />
            <Text style={styles.searchResultMetaText}>
              {new Date(event.startDateTime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <Text style={styles.searchResultPrice}>
            {getEventCardPrice(event)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => router.push({ pathname: '/events', params: { category: category.name } })}
      activeOpacity={0.9}
    >
      {/* Category Image/Photo Area - Left Side */}
      <View style={styles.categoryImageContainer}>
        <LinearGradient
          colors={brandGradient}
          start={brandGradientStart}
          end={brandGradientEnd}
          style={styles.categoryImage}
        />
      </View>
      
      {/* Category Info Section - Right Side */}
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName} numberOfLines={2}>{category.name}</Text>
        <Text style={styles.categoryMetaText}>
          {category.event_count || 0} events
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSpace = (space: Space, index: number, totalSpaces: number) => (
    <View key={space.id}>
      <TouchableOpacity
        style={styles.spaceStackItem}
        onPress={() => router.push(`/space/${space.id}`)}
        activeOpacity={0.7}
      >
        {/* Left side - Logo */}
        <View style={styles.spaceStackLogoContainer}>
          {(space.logoUrl || space.logo_url) ? (
            <Image 
              source={{ uri: (space.logoUrl || space.logo_url) as string }} 
              style={styles.spaceStackLogo} 
              resizeMode="cover" 
            />
          ) : (
            <LinearGradient
              colors={brandGradient}
              start={brandGradientStart}
              end={brandGradientEnd}
              style={styles.spaceStackLogoPlaceholder}
            >
              <Text style={styles.spaceStackLogoText}>
                {space.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          )}
        </View>
        
        {/* Right side - Info */}
        <View style={styles.spaceStackContent}>
          <Text style={styles.spaceStackName} numberOfLines={2}>
            {space.name}
          </Text>
          
          {space.description && (
            <Text style={styles.spaceStackMetaText} numberOfLines={1}>
              {space.description}
            </Text>
          )}
          
          <View style={styles.spaceStackStats}>
            {space.city && (
              <>
                <Text style={styles.spaceStackStatText}>
                  {space.city}{space.state ? `, ${space.state}` : ''}
                </Text>
                <Text style={styles.spaceStackStatDot}>•</Text>
              </>
            )}
            <Text style={styles.spaceStackStatText}>
              {space.member_count || space._count?.userRoles || 0} members
            </Text>
            <Text style={styles.spaceStackStatDot}>•</Text>
            <Text style={styles.spaceStackStatText}>
              {space.event_count || space._count?.events || 0} events
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {/* Divider - don't show after last item */}
      {index < totalSpaces - 1 && <View style={styles.spaceDivider} />}
    </View>
  );

  const renderSkeletonEventCard = () => (
    <View style={styles.featuredEventCard}>
      <Skeleton width="100%" height={200} borderRadius={borderRadius['2xl']} />
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
      onPress={() => router.push(`/event/${event.slug || event.id}`)}
      activeOpacity={0.9}
    >
      {event.coverImageUrl ? (
        <Image
          source={{ uri: event.coverImageUrl }}
          style={styles.featuredEventImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.featuredEventImagePlaceholder}>
          <Text style={styles.featuredEventImageText}>
            {event.category || event.type || 'Event'}
          </Text>
        </View>
      )}
      <LinearGradient
        colors={['transparent', colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.featuredEventGradient}
      />
      <View style={styles.featuredEventContent}>
        {/* Price badge at top right */}
        <View style={styles.featuredEventBadgesTop}>
          <View style={styles.featuredEventPriceBadge}>
            <Text style={styles.featuredEventPriceBadgeText}>
              {getEventCardPrice(event)}
            </Text>
          </View>
        </View>

        {/* Title and info at bottom */}
        <View style={styles.featuredEventBottom}>
          <Text style={styles.featuredEventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.featuredEventMeta}>
            <Text style={styles.featuredEventMetaText}>
              {new Date(event.startDateTime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            {event.category && (
              <>
                <Text style={styles.featuredEventMetaText}>•</Text>
                <Text style={styles.featuredEventMetaText}>
                  {event.category}
                </Text>
              </>
            )}
            {event.space?.name && (
              <>
                <Text style={styles.featuredEventMetaText}>•</Text>
                <Text style={styles.featuredEventMetaText} numberOfLines={1}>
                  {event.space.name}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTrendingEvent = (event: any) => (
    <TouchableOpacity
      key={event.id}
      style={styles.featuredEventCard}
      onPress={() => router.push(`/event/${event.slug || event.id}`)}
      activeOpacity={0.9}
    >
      {event.coverImageUrl ? (
        <Image
          source={{ uri: event.coverImageUrl }}
          style={styles.featuredEventImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.featuredEventImagePlaceholder}>
          <Text style={styles.featuredEventImageText}>
            {event.category || event.type || 'Event'}
          </Text>
        </View>
      )}
      <LinearGradient
        colors={['transparent', colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.featuredEventGradient}
      />
      <View style={styles.featuredEventContent}>
        {/* Badges at top */}
        <View style={styles.featuredEventBadgesTop}>
          <View style={styles.trendingBadgeOnImage}>
            <TrendUp size={8} color={colors.text}  weight="bold" />
            <Text style={styles.trendingBadgeText}>Trending</Text>
          </View>
          <View style={styles.featuredEventPriceBadge}>
            <Text style={styles.featuredEventPriceBadgeText}>
              {getEventCardPrice(event)}
            </Text>
          </View>
        </View>

        {/* Title and info at bottom */}
        <View style={styles.featuredEventBottom}>
          <Text style={styles.featuredEventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.featuredEventMeta}>
            <Text style={styles.featuredEventMetaText}>
              {new Date(event.startDateTime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            {event.category && (
              <>
                <Text style={styles.featuredEventMetaText}>•</Text>
                <Text style={styles.featuredEventMetaText}>
                  {event.category}
                </Text>
              </>
            )}
            {event.space?.name && (
              <>
                <Text style={styles.featuredEventMetaText}>•</Text>
                <Text style={styles.featuredEventMetaText} numberOfLines={1}>
                  {event.space.name}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
            {isLoadingProfile ? (
              <>
                <View style={styles.welcomeTextRow}>
                  <Text style={styles.welcomeText}>Welcome,</Text>
                  <Skeleton
                    width={150}
                    height={typography.fontSize['2xl'] * 1.2}
                    borderRadius={borderRadius.md}
                    style={styles.skeletonName}
                  />
                </View>
                <Skeleton
                  width={250}
                  height={typography.fontSize.base * 1.2}
                  borderRadius={borderRadius.md}
                  style={{ marginTop: spacing[2] }}
                />
              </>
            ) : (
              <>
                <View style={styles.welcomeTextRow}>
                  <Text style={styles.welcomeText}>Welcome, </Text>
                  <GradientText style={styles.welcomeUser}>{getDisplayName()}</GradientText>
                </View>
                <Text style={styles.timeBasedWish}>{getTimeBasedWish()}</Text>
              </>
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
                    <User size={24} color={colors.text} />
                  </LinearGradient>

                  <View style={styles.guestCardContent}>
                    <Text style={styles.guestCardTitle}>Get Started to unlock</Text>
                    <Text style={styles.guestCardDescription}>
                      Events, Tickets, Wallet & Profile
                    </Text>
                  </View>

                  <View style={styles.guestArrowButton}>
                    <ArrowRight size={20} color={colors.primary}  weight="bold" />
                  </View>
                </View>
              </TouchableOpacity>
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
                  <User size={24} color={colors.text} />
                </LinearGradient>
                <View style={styles.guestCardContent}>
                  <Text style={styles.guestCardTitle}>Set Your Username</Text>
                  <Text style={styles.guestCardDescription}>
                    Choose a username in Account Settings
                  </Text>
                </View>
                <View style={styles.guestArrowButton}>
                  <ArrowRight size={20} color={colors.primary}  weight="bold" />
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
                  <User size={24} color={colors.text} />
                </LinearGradient>
                <View style={styles.guestCardContent}>
                  <Text style={styles.guestCardTitle}>Complete Your Profile</Text>
                  <Text style={styles.guestCardDescription}>
                    Add your name and details
                  </Text>
                </View>
                <View style={styles.guestArrowButton}>
                  <ArrowRight size={20} color={colors.primary}  weight="bold" />
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Section */}
        <TouchableOpacity 
          style={styles.searchSection}
          onPress={openSearchModal}
          activeOpacity={0.7}
        >
          <View style={styles.searchContainer}>
            <MagnifyingGlass size={20} color={colors.textMuted} />
            <Text style={styles.searchPlaceholder}>Search events & spaces</Text>
          </View>
        </TouchableOpacity>

        {/* Search Modal */}
        <Modal
          visible={showSearchModal}
          animationType="slide"
          onRequestClose={closeSearchModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTop}>
                <TouchableOpacity onPress={closeSearchModal} style={styles.modalBackButton}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.modalHeaderTitle}>
                  <Text style={styles.modalTitle}>Search</Text>
                  <View style={styles.modalToggle}>
                    <TouchableOpacity
                      style={[styles.modalToggleButton, searchType === 'events' && styles.modalToggleButtonActive]}
                      onPress={() => setSearchType('events')}
                    >
                      <Text style={[styles.modalToggleText, searchType === 'events' && styles.modalToggleTextActive]}>
                        Events
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalToggleButton, searchType === 'spaces' && styles.modalToggleButtonActive]}
                      onPress={() => setSearchType('spaces')}
                    >
                      <Text style={[styles.modalToggleText, searchType === 'spaces' && styles.modalToggleTextActive]}>
                        Spaces
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.modalSearchContainer}>
                <MagnifyingGlass size={20} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${searchType}...`}
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  ref={searchInputRef}
                  autoFocus
                />
                {searchQuery !== '' && (
                  <TouchableOpacity onPress={clearSearch}>
                    <X size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView style={styles.modalContent}>
              {isSearching && (
                <View style={styles.searchResultsContainer}>
                  {searchLoading ? (
                    <View style={styles.searchResultsList}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <View key={`skeleton-${i}`} style={styles.searchResultCard}>
                          <View style={styles.searchResultImageContainer}>
                            <Skeleton width={80} height={80} borderRadius={borderRadius.lg} />
                          </View>
                          <View style={styles.searchResultContent}>
                            <Skeleton width="80%" height={20} borderRadius={borderRadius.md} style={{ marginBottom: spacing[2] }} />
                            <Skeleton width="50%" height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[3] }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Skeleton width={100} height={14} borderRadius={borderRadius.sm} />
                              <Skeleton width={60} height={14} borderRadius={borderRadius.sm} />
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : searchType === 'spaces' ? (
                    spaceSearchResults.length > 0 ? (
                      <View style={styles.searchResultsList}>
                        {spaceSearchResults.map((space: any) => (
                          <TouchableOpacity
                            key={space.id}
                            style={styles.searchResultCard}
                            onPress={() => { closeSearchModal(); router.push(`/space/${space.id}`); }}
                          >
                            <View style={[styles.searchResultImageContainer, { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }]}>
                              <Text style={{ fontSize: 28, color: '#fff', fontFamily: getFontFamily('bold') }}>{space.name?.[0]?.toUpperCase()}</Text>
                            </View>
                            <View style={styles.searchResultContent}>
                              <Text style={styles.searchResultTitle}>{space.name}</Text>
                              <Text style={styles.searchResultOrganizer}>{space.city || ''}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : isSearching ? (
                      <View style={styles.searchEmptyState}>
                        <Text style={styles.searchEmptyTitle}>No spaces found</Text>
                      </View>
                    ) : null
                  ) : (searchResults?.length ?? 0) > 0 ? (
                    <>
                      <View style={styles.searchResultsHeader}>
                        <Text style={styles.searchResultsCount}>
                          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                        </Text>
                        <TouchableOpacity onPress={() => {
                          closeSearchModal();
                          router.push({ pathname: '/events', params: { search: searchQuery } });
                        }}>
                          <Text style={styles.viewAllSearchText}>View All</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.searchResultsList}>
                        {searchResults.map(renderSearchResult)}
                      </View>
                    </>
                  ) : (
                    <View style={styles.searchEmptyState}>
                      <MagnifyingGlass size={48} color={colors.textMuted} />
                      <Text style={styles.searchEmptyTitle}>No results found</Text>
                      <Text style={styles.searchEmptyText}>
                        Try different keywords or find your vibe
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>

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
                <Ticket size={48} color={colors.textMuted} />
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
                <MapPin size={48} color={colors.textMuted} />
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

        {/* Find Your Vibe Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Find Your Vibe</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContainer}
          >
            <View style={styles.categoriesContainer}>
              {/* First Row */}
              <View style={styles.categoryRow}>
                {categories.slice(0, 3).map(renderCategory)}
              </View>
              {/* Second Row */}
              <View style={styles.categoryRow}>
                {categories.slice(3, 6).map(renderCategory)}
              </View>
              {/* Third Row */}
              <View style={styles.categoryRow}>
                {categories.slice(6, 9).map(renderCategory)}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Events Section with Filters */}
        <View style={styles.section}>
          {/* Section Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Events</Text>
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContainer}
            >
              {activeFilter === 'upcoming' ? (
                <TouchableOpacity
                  onPress={() => setActiveFilter('upcoming')}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={brandGradient}
                    start={brandGradientStart}
                    end={brandGradientEnd}
                    style={styles.filterButtonGradient}
                  >
                    <Calendar size={14} color={colors.text} />
                    <Text style={styles.filterButtonTextActive}>Upcoming</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setActiveFilter('upcoming')}
                  activeOpacity={0.7}
                >
                  <Calendar size={14} color={colors.text} />
                  <Text style={styles.filterButtonText}>Upcoming</Text>
                </TouchableOpacity>
              )}

              {activeFilter === 'trending' ? (
                <TouchableOpacity
                  onPress={() => setActiveFilter('trending')}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={brandGradient}
                    start={brandGradientStart}
                    end={brandGradientEnd}
                    style={styles.filterButtonGradient}
                  >
                    <TrendUp size={14} color={colors.text} />
                    <Text style={styles.filterButtonTextActive}>Trending</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setActiveFilter('trending')}
                  activeOpacity={0.7}
                >
                  <TrendUp size={14} color={colors.text} />
                  <Text style={styles.filterButtonText}>Trending</Text>
                </TouchableOpacity>
              )}

              {activeFilter === 'featured' ? (
                <TouchableOpacity
                  onPress={() => setActiveFilter('featured')}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={brandGradient}
                    start={brandGradientStart}
                    end={brandGradientEnd}
                    style={styles.filterButtonGradient}
                  >
                    <GridFour size={14} color={colors.text} />
                    <Text style={styles.filterButtonTextActive}>Featured</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setActiveFilter('featured')}
                  activeOpacity={0.7}
                >
                  <GridFour size={14} color={colors.text} />
                  <Text style={styles.filterButtonText}>Featured</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Filtered Events */}
          {isLoadingEvents ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {[1, 2, 3].map((i) => (
                <View key={`skeleton-${i}`}>
                  {renderSkeletonEventCard()}
                </View>
              ))}
            </ScrollView>
          ) : (
            <>
              {activeFilter === 'upcoming' && (
                (upcomingEvents?.length || 0) > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                  >
                    {upcomingEvents?.map(renderFeaturedEvent)}
                    {featuredEvents?.map(renderFeaturedEvent)}
                    {trendingEvents?.map(renderTrendingEvent)}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyState}>
                    <Calendar size={48} color={colors.textMuted} />
                    <Text style={styles.emptyStateText}>No upcoming events</Text>
                  </View>
                )
              )}

              {activeFilter === 'trending' && (
                (trendingEvents?.length || 0) > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                  >
                    {trendingEvents.map(renderTrendingEvent)}
                    {featuredEvents.map(renderFeaturedEvent)}
                    {upcomingEvents.map(renderFeaturedEvent)}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyState}>
                    <TrendUp size={48} color={colors.textMuted} />
                    <Text style={styles.emptyStateText}>No trending events</Text>
                  </View>
                )
              )}

              {activeFilter === 'featured' && (
                (featuredEvents?.length || 0) > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                  >
                    {featuredEvents?.map(renderFeaturedEvent)}
                    {trendingEvents?.map(renderTrendingEvent)}
                    {upcomingEvents?.map(renderFeaturedEvent)}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyState}>
                    <GridFour size={48} color={colors.textMuted} />
                    <Text style={styles.emptyStateText}>No featured events</Text>
                  </View>
                )
              )}
            </>
          )}
        </View>

        {/* Explore Spaces Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeaderClickable}
            onPress={() => router.push('/spaces')}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>Explore Spaces</Text>
            <Text style={styles.sectionArrow}> {'>'}</Text>
          </TouchableOpacity>
          {isLoadingAllSpaces ? (
            <View style={styles.spaceStackList}>
              {[1, 2, 3, 4].map((i) => renderSkeletonSpaceStack(i))}
            </View>
          ) : allSpaces.length > 0 ? (
            <View style={styles.spaceStackList}>
              {allSpaces.map((space, index) => renderSpace(space, index, allSpaces.length))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MapPin size={48} color={colors.textMuted} />
              <Text style={styles.emptyStateText}>No spaces available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

