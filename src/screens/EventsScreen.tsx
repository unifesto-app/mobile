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
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { Calendar, MapPin, Search, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Skeleton from '../components/Skeleton';
import { spacing, typography, borderRadius, shadows } from '../theme';
import { getEvents, Event, getEventCardPrice } from '../lib/api/events';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getFontFamily } from '../theme/fontHelpers';

// Common event categories
const CATEGORIES = [
  'All',
  'Technology',
  'Music',
  'Sports',
  'Arts',
  'Business',
  'Food',
  'Education',
  'Health',
  'Entertainment',
];

export default function EventsScreen() {
  const { colors } = useTheme();
  
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
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    marginTop: spacing[1],
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
    alignSelf: 'flex-start',
  },
  clearFilterText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: getFontFamily('semibold'),
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
  categoriesContainer: {
    marginBottom: spacing[4],
  },
  categoriesScroll: {
    paddingHorizontal: spacing[6],
    gap: spacing[2],
  },
  categoryChipActive: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  categoryChipTextActive: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: '#000000',
  },
  categoryChipInactive: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  categoryChipTextInactive: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('semibold'),
    color: colors.textSecondary,
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
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
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
  freeBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  freeBadgeText: {
    fontSize: typography.fontSize.xs,
    color: '#22c55e',
    fontFamily: getFontFamily('bold'),
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.borderMuted,
  },
  organizerText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: getFontFamily('medium'),
    marginRight: spacing[2],
  },
  priceText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
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

  const router = useRouter();
  const { category: paramCategory, search: paramSearch } = useLocalSearchParams<{ category?: string; search?: string }>();
  const headerHeight = useHeaderHeight();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(paramSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(paramCategory || 'All');
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

      const filters: any = { status: 'PUBLISHED' };
      
      if (selectedCategory !== 'All') {
        filters.category = selectedCategory;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await getEvents({ page: pageNum, limit: 20, ...filters });
      
      if (response) {
        const eventData = response.events || response.data || [];
        if (refresh || pageNum === 1) {
          setEvents(eventData);
        } else {
          setEvents(prev => [...prev, ...eventData]);
        }
        
        // Check if there are more items
        setHasMore(eventData.length === 20);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, searchQuery]);

  // Initial load
  useEffect(() => {
    setPage(1);
    loadEvents(1);
  }, [selectedCategory]);

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
      <Skeleton width="100%" height={200} borderRadius={0} />
      <View style={styles.eventContent}>
        <View style={{ flexDirection: 'row', gap: spacing[2], marginBottom: spacing[3] }}>
          <Skeleton width={80} height={24} borderRadius={borderRadius.md} />
          <Skeleton width={50} height={24} borderRadius={borderRadius.md} />
        </View>
        <Skeleton width="90%" height={24} borderRadius={borderRadius.md} style={{ marginBottom: spacing[2] }} />
        <Skeleton width="100%" height={16} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[1] }} />
        <Skeleton width="80%" height={16} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[4] }} />
        <View style={{ gap: spacing[2], marginBottom: spacing[4] }}>
          <Skeleton width={120} height={14} borderRadius={borderRadius.sm} />
          <Skeleton width={150} height={14} borderRadius={borderRadius.sm} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.borderMuted }}>
          <Skeleton width={100} height={14} borderRadius={borderRadius.sm} />
          <Skeleton width={60} height={14} borderRadius={borderRadius.sm} />
        </View>
      </View>
    </View>
  );

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => router.push(`/event/${item.slug || item.id}`)}
      activeOpacity={0.9}
    >
      {/* Event Image */}
      {item.coverImageUrl ? (
        <Image
          source={{ uri: item.coverImageUrl }}
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
      
      <View style={styles.eventContent}>
        {/* Category and Free Badge */}
        <View style={styles.badgesContainer}>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          )}
          {item.isFree && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>Free</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.eventTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        {item.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.eventMeta}>
          <View style={styles.detailRow}>
            <Calendar size={14} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.detailText}>
              {new Date(item.startDateTime).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
          
          {(item.venueName || item.city) && (
            <View style={styles.detailRow}>
              <MapPin size={14} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.venueName || item.city}
              </Text>
            </View>
          )}
        </View>
        
        {/* Footer with organizer and price */}
        <View style={styles.eventFooter}>
          <Text style={styles.organizerText} numberOfLines={1}>
            {item.space?.name || 'Organizer'}
          </Text>
          <Text style={styles.priceText}>
            {getEventCardPrice(item)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GradientText style={styles.headerLabel}>
          DISCOVER
        </GradientText>
        <Text style={styles.headerTitle}>All Events</Text>
        {selectedCategory !== 'All' && (
          <TouchableOpacity
            onPress={() => setSelectedCategory('All')}
            style={styles.clearFilterButton}
          >
            <Text style={styles.clearFilterText}>
              Viewing: {selectedCategory}
            </Text>
            <X size={16} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.8}
            >
              {selectedCategory === category ? (
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.categoryChipActive}
                >
                  <Text style={styles.categoryChipTextActive}>{category}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.categoryChipInactive}>
                  <Text style={styles.categoryChipTextInactive}>{category}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
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
              tintColor={colors.primary}
              colors={[colors.primary]}
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
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try different keywords' : 'Try selecting a different category'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

