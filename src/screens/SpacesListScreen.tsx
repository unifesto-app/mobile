import React, { useState, useEffect, useCallback } from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, Building2, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Skeleton from '../components/Skeleton';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { getAllSpaces, Space } from '../lib/api/spaces';

const ORG_TYPE_LABELS: Record<string, string> = {
  university: 'University',
  college: 'College',
  club: 'Club',
  community: 'Community',
  company: 'Company',
  other: 'Space',
};

const TYPE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'university', label: 'Universities' },
  { key: 'club', label: 'Clubs' },
  { key: 'college', label: 'Colleges' },
  { key: 'community', label: 'Communities' },
];

export default function SpacesListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { type: paramType, search: paramSearch } = useLocalSearchParams<{ type?: string; search?: string }>();
  const [searchQuery, setSearchQuery] = useState(paramSearch || '');
  const [selectedType, setSelectedType] = useState(paramType || 'all');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const filterScrollRef = React.useRef<ScrollView>(null);
  const filterRefs = React.useRef<{ [key: string]: { x: number; width: number } }>({});
  const [layoutReady, setLayoutReady] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing[6],
      paddingTop: spacing[24],
      paddingBottom: spacing[4],
    },
    searchSection: {
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
      fontFamily: typography.fontFamily.primary,
    },
    filtersContainer: {
      marginBottom: spacing[4],
    },
    filtersScroll: {
      paddingHorizontal: spacing[6],
      gap: spacing[2],
    },
    filterChipActive: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.full,
    },
    filterChipTextActive: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('bold'),
      color: '#000000',
    },
    filterChipInactive: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderMuted,
    },
    filterChipTextInactive: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('semibold'),
      color: colors.textSecondary,
    },
    listContainer: {
      paddingHorizontal: spacing[6],
      paddingBottom: spacing[6],
    },
    spaceCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      marginBottom: spacing[4],
      borderWidth: 1,
      borderColor: colors.borderMuted,
      overflow: 'hidden',
      position: 'relative',
      ...shadows.md,
    },
    spaceCardHeader: {
      aspectRatio: 4 / 3,
      width: '100%',
    },
    spaceCardGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100%',
    },
    spaceCardContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: spacing[5],
      justifyContent: 'space-between',
    },
    spaceCardBottom: {
      gap: spacing[2],
    },
    spaceNameRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing[3],
    },
    spaceTextContainer: {
      flex: 1,
      gap: spacing[1],
    },
    spaceLogoContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      padding: spacing[2],
    },
    spaceLogo: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
    spaceLogoPlaceholder: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    spaceLogoText: {
      fontSize: typography.fontSize.xl,
      fontFamily: getFontFamily('bold'),
      color: colors.text,
    },
    spaceTypeBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    spaceTypeBadgeText: {
      fontSize: typography.fontSize.xs,
      color: colors.text,
      fontFamily: getFontFamily('bold'),
      textTransform: 'uppercase',
      letterSpacing: typography.letterSpacing.wider,
    },
    spaceName: {
      fontSize: typography.fontSize.xl,
      color: colors.text,
      lineHeight: typography.fontSize.xl * 1.3,
      fontFamily: typography.fontFamily.primary,
    },
    spaceFooterText: {
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

  // Handle filter selection with auto-scroll
  const handleTypeSelect = (typeKey: string) => {
    setSelectedType(typeKey);
    
    // Scroll to selected filter with a slight delay
    setTimeout(() => {
      const filterInfo = filterRefs.current[typeKey];
      if (filterInfo) {
        const scrollX = Math.max(0, filterInfo.x - 24); // 24px padding from left
        filterScrollRef.current?.scrollTo({ x: scrollX, animated: true });
      }
    }, 100);
  };

  // Load spaces from API
  const loadSpaces = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const filters: any = {};
      
      if (selectedType !== 'all') {
        filters.type = selectedType;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await getAllSpaces({ page: pageNum, limit: 20, ...filters });
      
      if (response) {
        const spaceData = response.spaces || [];
        if (refresh || pageNum === 1) {
          setSpaces(spaceData);
        } else {
          setSpaces(prev => [...prev, ...spaceData]);
        }
        
        // Check if there are more items
        setHasMore(spaceData.length === 20);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading spaces:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [selectedType, searchQuery]);

  // Initial load
  useEffect(() => {
    setPage(1);
    loadSpaces(1);
  }, [selectedType]);

  // Handle type parameter from navigation and auto-scroll
  useEffect(() => {
    if (paramType && layoutReady) {
      if (paramType !== selectedType) {
        setSelectedType(paramType);
      }
      
      // Auto-scroll to the selected filter
      setTimeout(() => {
        const filterInfo = filterRefs.current[paramType];
        if (filterInfo) {
          const scrollX = Math.max(0, filterInfo.x - 24);
          filterScrollRef.current?.scrollTo({ x: scrollX, animated: true });
        }
      }, 100);
    }
  }, [paramType, layoutReady]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        setPage(1);
        loadSpaces(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setPage(1);
    loadSpaces(1, true);
  }, [loadSpaces]);

  // Load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      loadSpaces(page + 1, false);
    }
  };

  const getTypeLabel = (type: string) => {
    return ORG_TYPE_LABELS[type as keyof typeof ORG_TYPE_LABELS] || type;
  };

  const renderSkeletonCard = () => (
    <View style={styles.spaceCard}>
      <Skeleton width="100%" height={200} borderRadius={0} />
      <View style={{ position: 'absolute', bottom: spacing[5], left: spacing[5], right: spacing[5] }}>
        <Skeleton width={80} height={16} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[3] }} />
        <View style={{ flexDirection: 'row', gap: spacing[3] }}>
          <Skeleton width={48} height={48} borderRadius={24} />
          <View style={{ flex: 1 }}>
            <Skeleton width="90%" height={20} borderRadius={borderRadius.md} style={{ marginBottom: spacing[2] }} />
            <Skeleton width="60%" height={14} borderRadius={borderRadius.sm} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderSpaceCard = ({ item }: { item: Space }) => (
    <TouchableOpacity
      style={styles.spaceCard}
      onPress={() => router.push(`/space/${item.id}`)}
      activeOpacity={0.9}
    >
      {/* Banner Image or Gradient Header */}
      {item.banner_url ? (
        <Image
          source={{ uri: item.banner_url }}
          style={styles.spaceCardHeader}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={['#3491ff', '#0062ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.spaceCardHeader}
        />
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
        style={styles.spaceCardGradient}
      />

      {/* Content on image */}
      <View style={styles.spaceCardContent}>
        {/* Badge at top */}
        <View style={styles.spaceTypeBadge}>
          <Text style={styles.spaceTypeBadgeText}>
            {getTypeLabel(item.type || 'other')}
          </Text>
        </View>

        {/* Name with logo at bottom */}
        <View style={styles.spaceCardBottom}>
          <View style={styles.spaceNameRow}>
            {/* Logo Circle */}
            {item.logo_url ? (
              <View style={styles.spaceLogoContainer}>
                <Image
                  source={{ uri: item.logo_url }}
                  style={styles.spaceLogo}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={[styles.spaceLogoContainer, styles.spaceLogoPlaceholder]}>
                <Text style={styles.spaceLogoText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            
            {/* Name and Address */}
            <View style={styles.spaceTextContainer}>
              <Text style={styles.spaceName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.spaceFooterText} numberOfLines={1}>
                {item.city
                  ? `${item.city}${item.state ? `, ${item.state}` : ''}`
                  : 'Location not specified'}
              </Text>
            </View>
          </View>
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
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search spaces..."
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

      {/* Type Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          ref={filterScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {TYPE_FILTERS.map((filter, index) => (
            <View
              key={filter.key}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                filterRefs.current[filter.key] = { x, width };
                
                // Mark layout as ready when all filters are measured
                if (index === TYPE_FILTERS.length - 1) {
                  setLayoutReady(true);
                }
              }}
            >
              <TouchableOpacity
                onPress={() => handleTypeSelect(filter.key)}
                activeOpacity={0.8}
              >
                {selectedType === filter.key ? (
                  <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.filterChipActive}
                  >
                    <Text style={styles.filterChipTextActive}>{filter.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.filterChipInactive}>
                    <Text style={styles.filterChipTextInactive}>{filter.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Spaces List */}
      {loading && spaces.length === 0 ? (
        <FlatList
          data={[1, 2, 3, 4]}
          renderItem={renderSkeletonCard}
          keyExtractor={(item) => `skeleton-${item}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={spaces}
          renderItem={renderSpaceCard}
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
              <Building2 size={64} color={colors.borderLight} strokeWidth={1.5} />
              <Text style={styles.emptyText}>No spaces found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try different keywords' : 'Try selecting a different type'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
