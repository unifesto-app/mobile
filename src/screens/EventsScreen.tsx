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
import { getEvents, Event, getEventCardPrice, getCategories } from '../lib/api/events';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getFontFamily } from '../theme/fontHelpers';

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
    paddingTop: spacing[24],
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    gap: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  eventImageContainer: {
    width: 120,
    aspectRatio: 4 / 3,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.backgroundSecondary,
  },
  eventImage: {
    width: '100%',
    height: '100%',
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
    flex: 1,
    gap: spacing[2],
  },
  eventTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[1],
    lineHeight: typography.fontSize.base * 1.3,
  },
  eventDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing[2],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  eventImageGradient: {
    width: '100%',
    height: '100%',
  },
  badgesContainer: {
    position: 'absolute',
    bottom: spacing[2],
    left: spacing[2],
    right: spacing[2],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
  },
  freeBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[1],
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    flexWrap: 'wrap',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  detailText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
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
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const categoryScrollRef = React.useRef<ScrollView>(null);
  const categoryRefs = React.useRef<{ [key: string]: { x: number; width: number } }>({});
  const [layoutReady, setLayoutReady] = useState(false);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const cats = await getCategories();
      // Add "All" at the beginning
      setCategories([{ id: 'all', name: 'All', event_count: 0 }, ...cats]);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([{ id: 'all', name: 'All', event_count: 0 }]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Handle category selection with auto-scroll
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    
    // Scroll to selected category with a slight delay
    setTimeout(() => {
      const categoryInfo = categoryRefs.current[categoryName];
      if (categoryInfo) {
        const scrollX = Math.max(0, categoryInfo.x - 24); // 24px padding from left
        categoryScrollRef.current?.scrollTo({ x: scrollX, animated: true });
      }
    }, 100);
  };

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
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    setPage(1);
    loadEvents(1);
  }, [selectedCategory]);

  // Handle category parameter from navigation and auto-scroll
  useEffect(() => {
    if (paramCategory && categories.length > 0 && layoutReady) {
      // Only set if different to avoid loops
      if (paramCategory !== selectedCategory) {
        setSelectedCategory(paramCategory);
      }
      
      // Auto-scroll to the selected category
      setTimeout(() => {
        const categoryInfo = categoryRefs.current[paramCategory];
        if (categoryInfo) {
          const scrollX = Math.max(0, categoryInfo.x - 24); // 24px padding from left
          categoryScrollRef.current?.scrollTo({ x: scrollX, animated: true });
        }
      }, 100);
    }
  }, [paramCategory, categories, layoutReady]);

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
      <Skeleton width={120} height={90} borderRadius={borderRadius.lg} />
      <View style={styles.eventContent}>
        <Skeleton width="90%" height={18} borderRadius={borderRadius.md} style={{ marginBottom: spacing[2] }} />
        <View style={{ gap: spacing[1], marginBottom: spacing[2] }}>
          <Skeleton width={100} height={12} borderRadius={borderRadius.sm} />
          <Skeleton width={120} height={12} borderRadius={borderRadius.sm} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Skeleton width={80} height={12} borderRadius={borderRadius.sm} />
          <Skeleton width={50} height={12} borderRadius={borderRadius.sm} />
        </View>
      </View>
    </View>
  );

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => router.push(`/event/${item.slug || item.id}`)}
      activeOpacity={0.7}
    >
      {/* Event Image - Left Side */}
      <View style={styles.eventImageContainer}>
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
      </View>
      
      {/* Event Content - Right Side */}
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.eventMeta}>
          <Text style={styles.detailText}>
            {new Date(item.startDateTime).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          
          {(item.venueName || item.city) && (
            <>
              <Text style={styles.detailText}>•</Text>
              <Text style={styles.detailText} numberOfLines={1}>
                {item.venueName || item.city}
              </Text>
            </>
          )}
          
          {item.category && (
            <>
              <Text style={styles.detailText}>•</Text>
              <Text style={styles.detailText}>
                {item.category}
              </Text>
            </>
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
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {loadingCategories ? (
            // Show skeleton loaders while categories are loading
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton 
                  key={`cat-skeleton-${i}`} 
                  width={80} 
                  height={32} 
                  borderRadius={borderRadius.full} 
                />
              ))}
            </>
          ) : (
            categories.map((category, index) => (
              <View
                key={category.id}
                onLayout={(event) => {
                  const { x, width } = event.nativeEvent.layout;
                  categoryRefs.current[category.name] = { x, width };
                  
                  // Mark layout as ready when all categories are measured
                  if (index === categories.length - 1) {
                    setLayoutReady(true);
                  }
                }}
              >
                <TouchableOpacity
                  onPress={() => handleCategorySelect(category.name)}
                  activeOpacity={0.8}
                >
                  {selectedCategory === category.name ? (
                    <LinearGradient
                      colors={[colors.gradientStart, colors.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.categoryChipActive}
                    >
                      <Text style={styles.categoryChipTextActive}>{category.name}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.categoryChipInactive}>
                      <Text style={styles.categoryChipTextInactive}>{category.name}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
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

