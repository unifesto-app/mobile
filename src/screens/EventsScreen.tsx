import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, MapPin, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Skeleton from '../components/Skeleton';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getEvents, Event } from '../lib/api/events';
import { useAuth } from '../context/AuthContext';

const STATUS_TABS = [
  { key: 'all', label: 'All Events' },
  { key: 'featured', label: 'Featured' },
  { key: 'upcoming', label: 'Upcoming' },
];

export default function EventsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load events from API
  const loadEvents = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const filters: any = { status: 'published' };
      
      if (selectedStatus === 'featured') {
        filters.is_featured = true;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await getEvents(pageNum, 20, filters);
      
      if (response) {
        if (refresh || pageNum === 1) {
          setEvents(response.events);
        } else {
          setEvents(prev => [...prev, ...response.events]);
        }
        
        // Check if there are more items
        setHasMore(response.events.length === 20);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [selectedStatus, searchQuery]);

  // Initial load
  useEffect(() => {
    setPage(1);
    loadEvents(1);
  }, [selectedStatus]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        setPage(1);
        loadEvents(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setPage(1);
    loadEvents(1, true);
  }, [loadEvents]);

  // Load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      loadEvents(page + 1, false);
    }
  };

  const renderSkeletonCard = () => (
    <View style={styles.eventCard}>
      <Skeleton width="100%" height={200} borderRadius={borderRadius.xl} />
      <View style={styles.eventDetails}>
        <Skeleton width={80} height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
        <Skeleton width="90%" height={20} borderRadius={borderRadius.md} style={{ marginBottom: spacing[2] }} />
        <Skeleton width="100%" height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[1] }} />
        <Skeleton width="80%" height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[4] }} />
        <View style={{ flexDirection: 'row', gap: spacing[4] }}>
          <Skeleton width={100} height={14} borderRadius={borderRadius.sm} />
          <Skeleton width={100} height={14} borderRadius={borderRadius.sm} />
        </View>
      </View>
    </View>
  );

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      activeOpacity={0.9}
    >
      {/* Event Image */}
      {item.thumbnail_url || item.banner_url || item.image_url ? (
        <Image
          source={{ uri: item.thumbnail_url || item.banner_url || item.image_url }}
          style={styles.eventImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.eventImagePlaceholder}>
          <LinearGradient
            colors={['#3491ff', '#0062ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.eventImageGradient}
          />
        </View>
      )}
      
      {/* Status Badges */}
      <View style={styles.badgesContainer}>
        {item.is_featured && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Featured</Text>
          </View>
        )}
        {item.is_free && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Free</Text>
          </View>
        )}
      </View>
      
      <View style={styles.eventDetails}>
        <Text style={styles.eventCategory}>{item.category}</Text>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.short_description || item.description}
        </Text>
        
        <View style={styles.eventMeta}>
          <View style={styles.detailRow}>
            <Calendar size={14} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.detailText}>
              {new Date(item.start_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={14} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.location || item.city || 'TBA'}
            </Text>
          </View>
        </View>
        
        {item.is_free && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>Free</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GradientText style={styles.headerLabel}>
          WHAT'S HAPPENING
        </GradientText>
        <Text style={styles.headerTitle}>Explore Events</Text>
        <Text style={styles.headerSubtitle}>in Hyderabad</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Quick search..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Status Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          {STATUS_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setSelectedStatus(tab.key)}
              activeOpacity={0.8}
            >
              {selectedStatus === tab.key ? (
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tabActive}
                >
                  <Text style={styles.tabTextActive}>{tab.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactive}>
                  <Text style={styles.tabTextInactive}>{tab.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Events List */}
      {loading && events.length === 0 ? (
        <FlatList
          data={[1, 2, 3, 4]}
          renderItem={renderSkeletonCard}
          keyExtractor={(item) => `skeleton-${item}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0062ff"
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Calendar size={64} color={colors.borderLight} strokeWidth={1.5} />
              <Text style={styles.emptyText}>No events found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[12],
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
  },
  eventImageTop: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
  },
  headerLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: typography.letterSpacing.widest,
    marginBottom: spacing[2],
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textMuted,
    marginTop: spacing[1],
  },
  searchContainer: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  tabsContainer: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.full,
    padding: spacing[1],
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  tabActive: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  tabTextActive: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  tabInactive: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  tabTextInactive: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginBottom: spacing[4],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.md,
  },
  eventImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.backgroundSecondary,
  },
  statusBadgeAbsolute: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
  },
  statusPublished: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusUpcoming: {
    backgroundColor: 'rgba(52, 145, 255, 0.2)',
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    textTransform: 'capitalize',
  },
  eventContent: {
    padding: spacing[4],
  },
  eventTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[2],
  },
  eventDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[3],
    lineHeight: typography.lineHeight.snug * typography.fontSize.sm,
  },
  eventDetails: {
    gap: spacing[2],
  },
  eventImagePlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing[4],
  },
  eventImageGradient: {
    width: '100%',
    height: '100%',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  statusBadge: {
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  eventCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing[2],
  },
  eventMeta: {
    gap: spacing[2],
    marginTop: spacing[2],
  },
  freeBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  freeBadgeText: {
    fontSize: typography.fontSize.xs,
    color: '#22c55e',
    fontFamily: typography.fontFamily.bold,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  detailText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[16],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textMuted,
    marginTop: spacing[4],
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[6],
    gap: spacing[3],
  },
  loadingMoreText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
  },
});
