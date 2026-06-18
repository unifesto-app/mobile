import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, TrendingUp, Users, Search, X, Grid, Heart, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Skeleton from '../components/Skeleton';
import { spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getEvents, getFeaturedEvents, getTrendingEvents, getCategories, Event, getEventCardPrice } from '../lib/api/events';
import { getAllSpaces, Space } from '../lib/api/spaces';
import useAnalyticsScreenTracking from '../hooks/useAnalyticsScreenTracking';

// Space needed to clear the transparent gradient header
const HEADER_TOP_OFFSET = Platform.OS === 'ios' ? 150 : 130;

export default function DiscoverScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, activeTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const searchInputRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'events' | 'spaces'>('events');
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [spaceSearchResults, setSpaceSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'trending' | 'featured' | 'upcoming' | 'saved'>('all');
  
  // Ref for search debounce timeout
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real event categories
  const [categories, setCategories] = useState<any[]>([]);

  useAnalyticsScreenTracking('Discover');

  // Load events data
  const loadEvents = useCallback(async () => {
    try {
      setIsLoadingEvents(true);

      // Load all event types
      const [featured, trending, upcoming] = await Promise.all([
        getFeaturedEvents(10),
        getTrendingEvents(10),
        getEvents({ page: 1, limit: 10 }),
      ]);

      setFeaturedEvents(featured);
      setTrendingEvents(trending);
      setUpcomingEvents(upcoming?.data || upcoming?.events || []);
      
      // TODO: Load saved events from user's saved list
    } catch (error) {
      setFeaturedEvents([]);
      setTrendingEvents([]);
      setUpcomingEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch { setCategories([]); }
  }, []);

  // Load spaces
  const loadSpaces = useCallback(async () => {
    try {
      setIsLoadingOrgs(true);
      const response = await getAllSpaces({ page: 1, limit: 4 });
      setSpaces(response.spaces);
    } catch (error) {
      console.error('Failed to load spaces:', error);
      setSpaces([]);
    } finally {
      setIsLoadingOrgs(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadEvents();
    loadSpaces();
    loadCategories();
  }, [loadEvents, loadSpaces]);
  
  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Note: Removed useFocusEffect that was clearing search on focus
  // as it was causing the search field to clear while typing

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadEvents(), loadSpaces()]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [loadEvents, loadSpaces]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to Events screen with search query
      router.push({ pathname: '/events', params: { search: searchQuery } });
    }
  };

  // Search handler with debounce
  const handleSearchChange = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    // Clear existing timeout
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

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Search events
        const response = await getEvents({ page: 1, limit: 10, search: query });
        // Handle both response shapes
        setSearchResults(response?.events || response?.data || []);
        // Also search spaces
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

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: spacing[12],
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[6],
    marginBottom: spacing[6],
  },
  sectionHeaderClickable: {
    flexDirection: 'row',
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
  sectionArrow: {
    fontSize: typography.fontSize['2xl'],
    color: colors.primary,
    fontFamily: typography.fontFamily.primary,
    marginLeft: spacing[2],
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
    color: colors.error,
    fontFamily: getFontFamily('bold'),
  },
  featuredEventTitle: {
    fontSize: typography.fontSize.lg,
    color: '#ffffff',
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
    gap: spacing[1],
    flexWrap: 'wrap',
  },
  featuredEventMetaText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  featuredEventFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  featuredEventPrice: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.primary,
  },
  // Trending Events
  trendingEventCard: {
    width: 280,
    borderRadius: borderRadius['2xl'],
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
    color: colors.text,
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
    color: colors.text,
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
    borderRadius: borderRadius['2xl'],
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
    gap: spacing[2],
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing[1],
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
  // Space Cards
  orgCard: {
    width: 320,
    aspectRatio: 4 / 3,
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMuted,
    marginRight: spacing[4],
    ...shadows.lg,
  },
  orgBackgroundImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  orgGradientBackground: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgLogoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgLogoText: {
    fontSize: typography.fontSize['4xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  orgGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  orgCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[5],
  },
  orgCardBottom: {
    gap: spacing[2],
  },
  orgName: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  orgCardMeta: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  orgCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  orgCardMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: getFontFamily('normal'),
  },
  orgType: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  // Space Stack List (Vertical)
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
  spaceStackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
    marginBottom: spacing[1],
  },
  spaceStackMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceStackMetaDot: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
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
  // Cities Section
  citiesScrollContainer: {
    paddingHorizontal: spacing[6],
  },
  citiesContainer: {
    gap: spacing[3],
  },
  cityRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  cityCard: {
    width: 200,
    aspectRatio: 4 / 3,
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.lg,
  },
  cityGradientBackground: {
    width: '100%',
    height: '100%',
  },
  cityGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  cityCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[4],
  },
  cityCardBottom: {
    gap: spacing[1],
  },
  cityCardName: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  cityCardMeta: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  cityCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  cityCardMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: getFontFamily('normal'),
  },
  cityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityContent: {
    flex: 1,
  },
  cityName: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('semibold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  cityCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
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
  // Section Title with Icon
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  // Search Results
  searchResultsContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchLoadingContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },
  searchLoadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontFamily: getFontFamily('normal'),
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
});

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

  const renderSkeletonOrgCard = () => (
    <View style={styles.orgCard}>
      <Skeleton width="100%" height={200} borderRadius={borderRadius['2xl']} />
      <View style={{ position: 'absolute', bottom: spacing[5], left: spacing[5], right: spacing[5] }}>
        <Skeleton width="80%" height={20} borderRadius={borderRadius.md} style={{ marginBottom: spacing[2] }} />
        <Skeleton width="50%" height={12} borderRadius={borderRadius.sm} />
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
            <TrendingUp size={8} color={colors.text} strokeWidth={2.5} />
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

  const renderSpace = (space: Space, index: number) => (
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
      {index < spaces.length - 1 && <View style={styles.spaceDivider} />}
    </View>
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

  const renderSearchResult = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.searchResultCard}
      onPress={() => {
        // Close modal before navigating
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
            <Calendar size={12} color={colors.textMuted} strokeWidth={2} />
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

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: HEADER_TOP_OFFSET }}
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
        {/* Search Section - Opens Modal */}
        <TouchableOpacity 
          style={styles.searchSection}
          onPress={openSearchModal}
          activeOpacity={0.7}
        >
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.searchPlaceholder}>Search events...</Text>
          </View>
        </TouchableOpacity>

        {/* Search Modal */}
        <Modal
          visible={showSearchModal}
          animationType="slide"
          onRequestClose={closeSearchModal}
        >
          <View style={styles.modalContainer}>
            {/* Stack Header */}
            <View style={styles.modalHeader}>
              {/* Header Top Row */}
              <View style={styles.modalHeaderTop}>
                <TouchableOpacity onPress={closeSearchModal} style={styles.modalBackButton}>
                  <X size={24} color={colors.text} strokeWidth={2} />
                </TouchableOpacity>
                <View style={styles.modalHeaderTitle}>
                  <Text style={styles.modalTitle}>Search</Text>
                  {/* Toggle next to title */}
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

              {/* Search Input */}
              <View style={styles.modalSearchContainer}>
                <Search size={20} color={colors.textMuted} strokeWidth={2} />
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
                    <X size={20} color={colors.textMuted} strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Search Results in Modal */}
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
                      <Search size={48} color={colors.textMuted} strokeWidth={1.5} />
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

        {/* Content sections - always show, no conditional */}
        <>
          {/* Filter Buttons */}
          <View style={styles.filterSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContainer}
              >
                {activeFilter === 'all' ? (
                  <TouchableOpacity
                    onPress={() => setActiveFilter('all')}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={brandGradient}
                      start={brandGradientStart}
                      end={brandGradientEnd}
                      style={styles.filterButtonGradient}
                    >
                      <Sparkles size={14} color={colors.text} strokeWidth={2} />
                      <Text style={styles.filterButtonTextActive}>All Events</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setActiveFilter('all')}
                    activeOpacity={0.7}
                  >
                    <Sparkles size={14} color={colors.text} strokeWidth={2} />
                    <Text style={styles.filterButtonText}>All Events</Text>
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
                      <TrendingUp size={14} color={colors.text} strokeWidth={2} />
                      <Text style={styles.filterButtonTextActive}>Trending</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setActiveFilter('trending')}
                    activeOpacity={0.7}
                  >
                    <TrendingUp size={14} color={colors.text} strokeWidth={2} />
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
                      <Grid size={14} color={colors.text} strokeWidth={2} />
                      <Text style={styles.filterButtonTextActive}>Featured</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setActiveFilter('featured')}
                    activeOpacity={0.7}
                  >
                    <Grid size={14} color={colors.text} strokeWidth={2} />
                    <Text style={styles.filterButtonText}>Featured</Text>
                  </TouchableOpacity>
                )}

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
                      <Calendar size={14} color={colors.text} strokeWidth={2} />
                      <Text style={styles.filterButtonTextActive}>Upcoming</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setActiveFilter('upcoming')}
                    activeOpacity={0.7}
                  >
                    <Calendar size={14} color={colors.text} strokeWidth={2} />
                    <Text style={styles.filterButtonText}>Upcoming</Text>
                  </TouchableOpacity>
                )}

                {user && (
                  )}
                </>
              )}
            </View>

            {/* Categories Section */}
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

            {/* Spaces Section */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.sectionHeaderClickable}
                onPress={() => router.push('/spaces')}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>Explore Spaces</Text>
                <Text style={styles.sectionArrow}> {'>'}</Text>
              </TouchableOpacity>
              {isLoadingOrgs ? (
                <View style={styles.spaceStackList}>
                  {[1, 2, 3, 4].map((i) => (
                    <View key={`skeleton-space-${i}`}>
                      <View style={styles.spaceStackItem}>
                        <Skeleton width={64} height={64} borderRadius={borderRadius.lg} />
                        <View style={styles.spaceStackContent}>
                          <Skeleton width="80%" height={20} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
                          <Skeleton width="60%" height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
                          <Skeleton width="90%" height={14} borderRadius={borderRadius.sm} />
                        </View>
                      </View>
                      {i < 4 && <View style={styles.spaceDivider} />}
                    </View>
                  ))}
                </View>
              ) : spaces.length > 0 ? (
                <View style={styles.spaceStackList}>
                  {spaces.map((space, index) => renderSpace(space, index))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No spaces available</Text>
                </View>
              )}
            </View>
          </>
      </ScrollView>
    </View>
  );
}
