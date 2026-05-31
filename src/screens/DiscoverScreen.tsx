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
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, TrendingUp, ArrowRight, Users, Search, X, MapPin, Grid, Heart, Ticket, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Skeleton from '../components/Skeleton';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import { colors, spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { useAuth } from '../context/AuthContext';
import { getProfile, Profile } from '../lib/api/profile';
import { getEvents, getFeaturedEvents, getTrendingEvents, Event, getEventCardPrice, getMyRegisteredEvents } from '../lib/api/events';
import { getAllOrganizations, Organization } from '../lib/api/organizations';
import useAnalyticsScreenTracking from '../hooks/useAnalyticsScreenTracking';

// Space needed to clear the transparent gradient header
const HEADER_TOP_OFFSET = Platform.OS === 'ios' ? 150 : 130;

export default function DiscoverScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [followingOrgs, setFollowingOrgs] = useState<Organization[]>([]);
  const [followingOrgEvents, setFollowingOrgEvents] = useState<Event[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userTickets, setUserTickets] = useState<Event[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Mock data for cities and categories
  const cities = [
    { id: '1', name: 'Mumbai', count: 45 },
    { id: '2', name: 'Delhi', count: 38 },
    { id: '3', name: 'Bangalore', count: 52 },
    { id: '4', name: 'Hyderabad', count: 28 },
    { id: '5', name: 'Pune', count: 31 },
  ];

  const categories = [
    { id: '1', name: 'Technology' },
    { id: '2', name: 'Music' },
    { id: '3', name: 'Sports' },
    { id: '4', name: 'Arts' },
    { id: '5', name: 'Business' },
    { id: '6', name: 'Food' },
  ];

  useAnalyticsScreenTracking('Discover');

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

  // Load organizations
  const loadOrganizations = useCallback(async () => {
    try {
      setIsLoadingOrgs(true);
      const response = await getAllOrganizations(1, 4);
      setOrganizations(response.organizations);
      
      // If user is logged in, load following organizations (mock for now)
      if (user) {
        // TODO: Replace with actual API call to get user's following organizations
        const followingResponse = await getAllOrganizations(1, 3);
        setFollowingOrgs(followingResponse.organizations.slice(0, 3));
        
        // Load events from following organizations
        if (followingResponse.organizations.length > 0) {
          const eventsResponse = await getEvents(1, 3);
          setFollowingOrgEvents(eventsResponse.events.slice(0, 3));
        }
      }
    } catch (error) {
      setOrganizations([]);
      setFollowingOrgs([]);
      setFollowingOrgEvents([]);
    } finally {
      setIsLoadingOrgs(false);
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
      
      if (response && response.events) {
        // Filter for upcoming events only
        const now = new Date();
        const upcomingTickets = response.events.filter(event => {
          const eventDate = new Date(event.start_date);
          return eventDate >= now;
        });
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

  // Initial load
  useEffect(() => {
    loadProfile();
    loadEvents();
    loadOrganizations();
    loadUserTickets();
  }, [loadProfile, loadEvents, loadOrganizations, loadUserTickets]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadProfile(), loadEvents(), loadOrganizations(), loadUserTickets()]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [loadProfile, loadEvents, loadOrganizations, loadUserTickets]);

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to Events screen with search query
      router.push({ pathname: '/events', params: { search: searchQuery } });
    }
  };

  // Search handler with debounce
  const handleSearchChange = useCallback(async (query: string) => {
    setSearchQuery(query);
    
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

    try {
      // Debounce search
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Search events
      const response = await getEvents(1, 10, { search: query });
      setSearchResults(response.events);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

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
      onPress={() => router.push(`/event/${event.id}`)}
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
      onPress={() => router.push(`/event/${event.id}`)}
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

  const renderOrganization = (org: Organization) => (
    <TouchableOpacity
      key={org.id}
      style={styles.orgCard}
      onPress={() => router.push(`/organization/${org.id}`)}
      activeOpacity={0.9}
    >
      {/* Organization logo/background */}
      {org.logo_url ? (
        <Image source={{ uri: org.logo_url }} style={styles.orgBackgroundImage} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0.1)']}
          style={styles.orgGradientBackground}
        >
          <View style={styles.orgLogoPlaceholder}>
            <Text style={styles.orgLogoText}>{org.name.charAt(0).toUpperCase()}</Text>
          </View>
        </LinearGradient>
      )}
      
      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
        style={styles.orgGradientOverlay}
      />
      
      {/* Organization content at bottom */}
      <View style={styles.orgCardContent}>
        <View style={styles.orgCardBottom}>
          <Text style={styles.orgName} numberOfLines={2}>
            {org.name}
          </Text>
          {org.type && (
            <View style={styles.orgCardMeta}>
              <View style={styles.orgCardMetaItem}>
                <Users size={12} color={colors.textMuted} strokeWidth={2} />
                <Text style={styles.orgCardMetaText}>{org.type}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCity = (city: any) => (
    <TouchableOpacity
      key={city.id}
      style={styles.cityCard}
      onPress={() => router.push({ pathname: '/events', params: { city: city.name } })}
      activeOpacity={0.9}
    >
      {/* City gradient background */}
      <LinearGradient
        colors={brandGradient}
        start={brandGradientStart}
        end={brandGradientEnd}
        style={styles.cityGradientBackground}
      />
      
      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
        style={styles.cityGradientOverlay}
      />
      
      {/* City content at bottom */}
      <View style={styles.cityCardContent}>
        <View style={styles.cityCardBottom}>
          <Text style={styles.cityCardName}>{city.name}</Text>
          <View style={styles.cityCardMeta}>
            <View style={styles.cityCardMetaItem}>
              <Calendar size={12} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.cityCardMetaText}>{city.count} events</Text>
            </View>
          </View>
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
      {/* Category gradient background */}
      <LinearGradient
        colors={brandGradient}
        start={brandGradientStart}
        end={brandGradientEnd}
        style={styles.categoryGradientBackground}
      />
      
      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
        style={styles.categoryGradientOverlay}
      />
      
      {/* Category content at bottom */}
      <View style={styles.categoryCardContent}>
        <View style={styles.categoryCardBottom}>
          <Text style={styles.categoryName}>{category.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSearchResult = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.searchResultCard}
      onPress={() => {
        clearSearch();
        router.push(`/event/${event.id}`);
      }}
      activeOpacity={0.9}
    >
      <View style={styles.searchResultImageContainer}>
        {event.image_url || event.banner_url || event.thumbnail_url ? (
          <Image
            source={{ uri: event.image_url || event.banner_url || event.thumbnail_url }}
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
        {event.organization?.name && (
          <Text style={styles.searchResultOrganizer} numberOfLines={1}>
            {event.organization.name}
          </Text>
        )}
        <View style={styles.searchResultMeta}>
          <View style={styles.searchResultMetaItem}>
            <Calendar size={12} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.searchResultMetaText}>
              {new Date(event.start_date).toLocaleDateString('en-US', {
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

  const renderTicketCard = (event: Event) => {
    const eventDate = new Date(event.start_date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return (
      <TouchableOpacity
        key={event.id}
        style={styles.ticketCard}
        onPress={() => router.push(`/event/${event.id}`)}
        activeOpacity={0.9}
      >
        {/* Top Section */}
        <View style={styles.ticketTop}>
          <View style={styles.ticketMainContent}>
            <View style={styles.ticketImage}>
              <Text style={styles.ticketImagePlaceholder}>
                {(event.category || 'E').charAt(0)}
              </Text>
            </View>
            <View style={styles.ticketTextContent}>
              <Text style={styles.ticketTitle} numberOfLines={2}>
                {event.title}
              </Text>
              <View style={styles.ticketInfo}>
                <View style={styles.ticketInfoRow}>
                  <Calendar size={12} color={colors.primary} strokeWidth={2} />
                  <Text style={styles.ticketInfoText}>{formattedDate}</Text>
                </View>
                <View style={styles.ticketInfoRow}>
                  <Clock size={12} color={colors.primary} strokeWidth={2} />
                  <Text style={styles.ticketInfoText}>{formattedTime}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Dashed Line */}
        <View style={styles.dashedLineContainer}>
          <View style={styles.dashedLine} />
        </View>

        {/* Bottom Section */}
        <View style={styles.ticketBottom}>
          <View style={styles.ticketBottomRow}>
            <View>
              <Text style={styles.ticketLabel}>CATEGORY</Text>
              <Text style={styles.ticketValue}>{event.category || 'Event'}</Text>
            </View>
            <View style={styles.ticketCodeContainer}>
              <Text style={styles.ticketLabel}>EVENT ID</Text>
              <Text style={styles.ticketCode}>#{event.id.substring(0, 8).toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Left Cutout */}
        <View style={styles.cutoutLeft} />
        {/* Right Cutout */}
        <View style={styles.cutoutRight} />
      </TouchableOpacity>
    );
  };

  const renderSkeletonTicketCard = () => (
    <View style={styles.ticketCard}>
      <View style={styles.ticketTop}>
        <View style={styles.ticketMainContent}>
          <Skeleton width={70} height={70} borderRadius={borderRadius.md} />
          <View style={{ flex: 1, gap: spacing[3] }}>
            <Skeleton width="90%" height={16} borderRadius={borderRadius.sm} />
            <Skeleton width="70%" height={12} borderRadius={borderRadius.sm} />
            <Skeleton width="60%" height={12} borderRadius={borderRadius.sm} />
          </View>
        </View>
      </View>
      <View style={styles.dashedLineContainer}>
        <View style={styles.dashedLine} />
      </View>
      <View style={styles.ticketBottom}>
        <View style={styles.ticketBottomRow}>
          <Skeleton width={80} height={12} borderRadius={borderRadius.sm} />
          <Skeleton width={100} height={12} borderRadius={borderRadius.sm} />
        </View>
      </View>
      <View style={styles.cutoutLeft} />
      <View style={styles.cutoutRight} />
    </View>
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
                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <Text style={styles.signUpPromptLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.textMuted} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Results */}
          {isSearching && (
            <View style={styles.searchResultsContainer}>
              {searchLoading ? (
                <View style={styles.searchLoadingContainer}>
                  <Text style={styles.searchLoadingText}>Searching...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                <>
                  <View style={styles.searchResultsHeader}>
                    <Text style={styles.searchResultsCount}>
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </Text>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/events', params: { search: searchQuery } })}>
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
                    Try different keywords or browse categories
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Your Tickets Section - Show right after search, only if user is logged in */}
        {user && !isSearching && (
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

        {/* Only show content sections when not searching */}
        {!isSearching && (
          <>
            {/* Cities Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Explore Cities</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.citiesScrollContainer}
              >
                <View style={styles.citiesContainer}>
                  {/* First Row */}
                  <View style={styles.cityRow}>
                    {cities.slice(0, 3).map(renderCity)}
                  </View>
                  {/* Second Row */}
                  <View style={styles.cityRow}>
                    {cities.slice(3, 5).map(renderCity)}
                  </View>
                </View>
              </ScrollView>
            </View>

            {/* Categories Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Browse Categories</Text>
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
                </View>
              </ScrollView>
            </View>

            {/* Following Organizations - Only show if user is logged in */}
            {user && followingOrgs.length > 0 && (
              <View style={styles.section}>
                <TouchableOpacity 
                  style={styles.sectionHeaderClickable}
                  onPress={() => router.push('/organizations')}
                  activeOpacity={0.7}
                >
                  <View style={styles.sectionTitleWithIcon}>
                    <Heart size={20} color={colors.primary} strokeWidth={2} fill={colors.primary} />
                    <Text style={styles.sectionTitle}>Following</Text>
                    <Text style={styles.sectionArrow}> {'>'}</Text>
                  </View>
                </TouchableOpacity>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {followingOrgs.map(renderOrganization)}
                </ScrollView>
              </View>
            )}

            {/* Events from Following Organizations */}
            {user && followingOrgEvents.length > 0 && (
              <View style={styles.section}>
                <TouchableOpacity 
                  style={styles.sectionHeaderClickable}
                  onPress={() => router.push('/events')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionTitle}>From Organizations You Follow</Text>
                  <Text style={styles.sectionArrow}> {'>'}</Text>
                </TouchableOpacity>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {followingOrgEvents.map(renderFeaturedEvent)}
                </ScrollView>
              </View>
            )}

            {/* Featured Events */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.sectionHeaderClickable}
                onPress={() => router.push('/events')}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>Featured Events</Text>
                <Text style={styles.sectionArrow}> {'>'}</Text>
              </TouchableOpacity>
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
              <TouchableOpacity 
                style={styles.sectionHeaderClickable}
                onPress={() => router.push('/events')}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>Trending Now</Text>
                <Text style={styles.sectionArrow}> {'>'}</Text>
              </TouchableOpacity>
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

            {/* Organizations Section */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.sectionHeaderClickable}
                onPress={() => router.push('/organizations')}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>Organizations</Text>
                <Text style={styles.sectionArrow}> {'>'}</Text>
              </TouchableOpacity>
          {isLoadingOrgs ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {[1, 2, 3, 4].map((i) => (
                <View key={`skeleton-org-${i}`}>
                  {renderSkeletonOrgCard()}
                </View>
              ))}
            </ScrollView>
          ) : organizations.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {organizations.map(renderOrganization)}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No organizations available</Text>
            </View>
          )}
            </View>

            {/* Upcoming Events */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.sectionHeaderClickable}
                onPress={() => router.push('/events')}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>Coming Up</Text>
                <Text style={styles.sectionArrow}> {'>'}</Text>
              </TouchableOpacity>
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
                  onPress={() => router.push(`/event/${event.id}`)}
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
          </>
        )}

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
    borderRadius: borderRadius['2xl'],
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
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
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
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: getFontFamily('normal'),
    paddingVertical: spacing[1],
  },
  // Organization Cards
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
    aspectRatio: 4 / 3,
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.lg,
  },
  categoryGradientBackground: {
    width: '100%',
    height: '100%',
  },
  categoryGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  categoryCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[4],
  },
  categoryCardBottom: {
    gap: spacing[1],
  },
  categoryName: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  // Section Title with Icon
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  // Search Results
  searchResultsContainer: {
    marginTop: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    overflow: 'hidden',
    ...shadows.lg,
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
    maxHeight: 500,
  },
  searchResultCard: {
    flexDirection: 'row',
    padding: spacing[4],
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
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
  // Ticket Cards
  ticketCard: {
    width: 300,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 0.5,
    borderColor: colors.primary,
    ...shadows.lg,
    marginRight: spacing[4],
  },
  ticketTop: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[4],
  },
  ticketMainContent: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  ticketImage: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketImagePlaceholder: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: '#000000',
  },
  ticketTextContent: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginBottom: spacing[3],
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
    paddingHorizontal: spacing[3],
  },
  dashedLine: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  ticketBottom: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[5],
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
});
