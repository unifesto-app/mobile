import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp, Building2, Calendar, MapPin, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { getEvents, getEventCardPrice } from '../lib/api/events';
import {
  ALL_CATEGORIES,
  STATUS_TABS,
  DATE_FILTERS,
  PRICE_FILTERS
} from '../lib/constants';

const HEADER_TOP_OFFSET = Platform.OS === 'ios' ? 150 : 130;

export default function DiscoverScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState<'all' | 'free' | 'paid'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load events with filters
  React.useEffect(() => {
    loadEvents();
  }, [searchQuery, selectedCategory, selectedStatus, selectedDate, selectedPrice]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (searchQuery) filters.search = searchQuery;
      if (selectedCategory !== 'All') filters.category = selectedCategory;
      if (selectedPrice === 'free') filters.is_free = true;
      if (selectedPrice === 'paid') filters.is_free = false;

      const response = await getEvents(1, 50, filters);
      let filtered = response.events;

      // Client-side filtering for date range
      if (selectedDate !== 'all') {
        const now = new Date();
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.start_date);
          if (selectedDate === 'today') {
            return eventDate.toDateString() === now.toDateString();
          } else if (selectedDate === 'week') {
            const weekEnd = new Date(now);
            weekEnd.setDate(now.getDate() + 7);
            return eventDate >= now && eventDate <= weekEnd;
          } else if (selectedDate === 'upcoming') {
            return eventDate >= now;
          }
          return true;
        });
      }

      setEvents(filtered);
    } catch (error) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = events;

  const hasFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    selectedStatus !== 'all' ||
    selectedDate !== 'all' ||
    selectedPrice !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('all');
    setSelectedDate('all');
    setSelectedPrice('all');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <GradientText style={styles.headerTitle}>Discover</GradientText>
          <Text style={styles.headerSubtitle}>
            Search for events, organizations, and more
          </Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.textMuted} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events, organizations..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>

          {/* Organizations Button */}
          <TouchableOpacity
            style={styles.organizationsButton}
            onPress={() => navigation.navigate('OrganizationsList')}
            activeOpacity={0.9}
          >
            <View style={styles.organizationsIconContainer}>
              <Building2 size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.organizationsContent}>
              <Text style={styles.organizationsTitle}>Organizations</Text>
              <Text style={styles.organizationsSubtitle}>
                Explore clubs, communities & universities
              </Text>
            </View>
          </TouchableOpacity>

          {/* Filter Toggle Button */}
          <View style={styles.filterToggleRow}>
            <TouchableOpacity
              style={styles.filterToggleButton}
              onPress={() => setShowFilters(!showFilters)}
              activeOpacity={0.7}
            >
              <SlidersHorizontal size={18} color={colors.primary} strokeWidth={2} />
              <Text style={styles.filterToggleText}>
                Filters {hasFilters && `(${(selectedCategory !== 'All' ? 1 : 0) +
                  (selectedStatus !== 'all' ? 1 : 0) +
                  (selectedDate !== 'all' ? 1 : 0) +
                  (selectedPrice !== 'all' ? 1 : 0)
                  })`}
              </Text>
              {showFilters ? (
                <ChevronUp size={18} color={colors.textMuted} strokeWidth={2} />
              ) : (
                <ChevronDown size={18} color={colors.textMuted} strokeWidth={2} />
              )}
            </TouchableOpacity>
            {hasFilters && (
              <TouchableOpacity onPress={clearAllFilters} activeOpacity={0.7}>
                <Text style={styles.clearAllText}>Clear all ×</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Collapsible Filters */}
          {showFilters && (
            <View style={styles.filtersContainer}>
              {/* Status Tabs */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>STATUS</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterScroll}
                >
                  {STATUS_TABS.map((tab) => (
                    <TouchableOpacity
                      key={tab.id}
                      style={[
                        styles.filterChip,
                        selectedStatus === tab.id && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedStatus(tab.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedStatus === tab.id && styles.filterChipTextActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>CATEGORY</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterScroll}
                >
                  {ALL_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.filterChip,
                        selectedCategory === category && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedCategory(category)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedCategory === category && styles.filterChipTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Date & Price Filters */}
              <View style={styles.filterRow}>
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>DATE</Text>
                  <View style={styles.filterChipsWrap}>
                    {DATE_FILTERS.map((filter) => (
                      <TouchableOpacity
                        key={filter.id}
                        style={[
                          styles.filterChipSmall,
                          selectedDate === filter.id && styles.filterChipActive,
                        ]}
                        onPress={() => setSelectedDate(filter.id)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.filterChipTextSmall,
                            selectedDate === filter.id && styles.filterChipTextActive,
                          ]}
                        >
                          {filter.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>PRICE</Text>
                  <View style={styles.filterChipsWrap}>
                    {PRICE_FILTERS.map((filter) => (
                      <TouchableOpacity
                        key={filter.id}
                        style={[
                          styles.filterChipSmall,
                          selectedPrice === filter.id && styles.filterChipActive,
                        ]}
                        onPress={() => setSelectedPrice(filter.id as 'all' | 'free' | 'paid')}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.filterChipTextSmall,
                            selectedPrice === filter.id && styles.filterChipTextActive,
                          ]}
                        >
                          {filter.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          {filteredResults.length > 0 ? (
            <>
              <Text style={styles.resultsCount}>
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
              </Text>
              {filteredResults.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.resultCard}
                  onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                  activeOpacity={0.9}
                >
                  {/* Event Image */}
                  <View style={styles.eventImageContainer}>
                    {event.image_url || event.banner_url || event.thumbnail_url ? (
                      <Image
                        source={{ uri: event.image_url || event.banner_url || event.thumbnail_url }}
                        style={styles.eventImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <LinearGradient
                        colors={['#3491ff', '#0062ff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.eventImagePlaceholder}
                      >
                        <Text style={styles.eventImagePlaceholderText}>
                          {event.category?.charAt(0) || 'E'}
                        </Text>
                      </LinearGradient>
                    )}
                    {/* Category Badge on Image */}
                    <View style={styles.categoryBadgeOnImage}>
                      <Text style={styles.categoryBadgeText}>{event.category}</Text>
                    </View>
                  </View>

                  {/* Event Content */}
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>

                    {event.organization?.name && (
                      <Text style={styles.eventOrganizer} numberOfLines={1}>
                        {event.organization.name}
                      </Text>
                    )}

                    {/* Event Meta Info */}
                    <View style={styles.eventMeta}>
                      {(event.location || event.venue || event.city) && (
                        <View style={styles.eventMetaItem}>
                          <MapPin size={14} color={colors.textMuted} strokeWidth={2} />
                          <Text style={styles.eventMetaText} numberOfLines={1}>
                            {event.location || event.venue || event.city}
                          </Text>
                        </View>
                      )}

                      {event.max_attendees && (
                        <View style={styles.eventMetaItem}>
                          <Users size={14} color={colors.textMuted} strokeWidth={2} />
                          <Text style={styles.eventMetaText}>{event.max_attendees}</Text>
                        </View>
                      )}
                    </View>

                    {/* Event Footer */}
                    <View style={styles.eventFooter}>
                      <View style={styles.eventMetaItem}>
                        <Calendar size={14} color={colors.textMuted} strokeWidth={2} />
                        <Text style={styles.eventMetaText}>
                          {new Date(event.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      </View>
                      <Text style={styles.eventPrice}>
                        {getEventCardPrice(event)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Search size={64} color={colors.textMuted} strokeWidth={1.5} />
              <Text style={styles.emptyStateTitle}>No results found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  searchHeader: {
    paddingHorizontal: spacing[6],
    paddingTop: HEADER_TOP_OFFSET,
    paddingBottom: spacing[6],
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[2],
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[6],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: spacing[3],
    marginBottom: spacing[5],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  organizationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[5],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: spacing[3],
    ...shadows.sm,
  },
  organizationsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizationsContent: {
    flex: 1,
  },
  organizationsTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[1],
  },
  organizationsSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  filterToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
  },
  filterToggleText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  clearAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
  },
  filtersContainer: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.borderMuted,
  },
  filterSection: {
    marginBottom: spacing[4],
  },
  filterLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing[2],
  },
  filterScroll: {
    gap: spacing[2],
  },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  filterChipActive: {
    backgroundColor: 'rgba(52, 145, 255, 0.15)',
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bold,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  filterGroup: {
    flex: 1,
  },
  filterChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  filterChipSmall: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  filterChipTextSmall: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bold,
  },
  resultsContainer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  resultsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[4],
    fontFamily: typography.fontFamily.bold,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    overflow: 'hidden',
    ...shadows.md,
  },
  eventImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventImagePlaceholderText: {
    fontSize: typography.fontSize['4xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  categoryBadgeOnImage: {
    position: 'absolute',
    top: spacing[3],
    left: spacing[3],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
  },
  eventContent: {
    padding: spacing[4],
  },
  eventTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[1],
    lineHeight: typography.fontSize.lg * 1.3,
  },
  eventOrganizer: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing[2],
  },
  eventMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[3],
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
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[16],
    gap: spacing[4],
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
