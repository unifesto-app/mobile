import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Building2, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Skeleton from '../components/Skeleton';
import Footer from '../components/Footer';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { getAllOrganizations, Organization } from '../lib/api/organizations';

const ORG_TYPE_LABELS: Record<string, string> = {
  university: 'University',
  college: 'College',
  club: 'Club',
  community: 'Community',
  company: 'Company',
  other: 'Organization',
};

const TYPE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'university', label: 'Universities' },
  { key: 'club', label: 'Clubs' },
  { key: 'college', label: 'Colleges' },
  { key: 'community', label: 'Communities' },
];

export default function OrganizationsListScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load organizations
  useEffect(() => {
    loadOrganizations(1, true);
  }, []);

  const loadOrganizations = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await getAllOrganizations(pageNum, 20);
      
      if (reset) {
        setOrganizations(response.organizations || []);
      } else {
        setOrganizations(prev => [...prev, ...(response.organizations || [])]);
      }
      
      // Check if there are more items
      setHasMore((response.organizations || []).length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('[OrganizationsList] Error loading organizations:', error);
      if (reset) {
        setOrganizations([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadOrganizations(1, true);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      loadOrganizations(page + 1, false);
    }
  };

  // Filter by type first
  const orgsByType =
    selectedType === 'all'
      ? organizations
      : organizations.filter((org) => org.type === selectedType);

  // Then filter by search query
  const filteredOrgs = orgsByType.filter((org) => {
    if (searchQuery === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(query) ||
      (org.description && org.description.toLowerCase().includes(query))
    );
  });

  const getTypeLabel = (type: string) => {
    return ORG_TYPE_LABELS[type as keyof typeof ORG_TYPE_LABELS] || type;
  };

  const renderSkeletonCard = () => (
    <View style={styles.orgCard}>
      <Skeleton width="100%" height={120} borderRadius={borderRadius.xl} style={{ marginBottom: spacing[4] }} />
      <View style={{ padding: spacing[5] }}>
        <Skeleton width={80} height={16} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[3] }} />
        <Skeleton width="70%" height={24} borderRadius={borderRadius.md} style={{ marginBottom: spacing[2] }} />
        <Skeleton width="50%" height={14} borderRadius={borderRadius.sm} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <GradientText style={styles.headerTitle}>Organizations</GradientText>
            <Text style={styles.headerSubtitle}>
              Discover clubs, communities, and organizations
            </Text>
          </View>

          {/* Skeleton Cards */}
          <View style={styles.orgsList}>
            {[1, 2, 3, 4].map((i) => (
              <View key={`skeleton-${i}`}>
                {renderSkeletonCard()}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <GradientText style={styles.headerTitle}>Organizations</GradientText>
          <Text style={styles.headerSubtitle}>
            Discover clubs, communities, and organizations
          </Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.textMuted} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search organizations..."
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

          {/* Type Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {TYPE_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  selectedType === filter.key && styles.filterChipActive,
                ]}
                onPress={() => setSelectedType(filter.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedType === filter.key && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Organizations List */}
        <View style={styles.orgsList}>
          <Text style={styles.resultsCount}>
            {filteredOrgs.length} organization{filteredOrgs.length !== 1 ? 's' : ''} found
          </Text>

          {filteredOrgs.length === 0 ? (
            <View style={styles.emptyState}>
              <Building2 size={64} color={colors.textMuted} strokeWidth={1.5} />
              <Text style={styles.emptyStateTitle}>No organizations found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery || selectedType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Organizations will appear here'}
              </Text>
            </View>
          ) : (
            filteredOrgs.map((org) => (
              <TouchableOpacity
                key={org.id}
                style={styles.orgCard}
                onPress={() =>
                  navigation.navigate('OrganizationDetail', { organizationId: org.id })
                }
                activeOpacity={0.9}
              >
                {/* Banner Image or Gradient Header */}
                {org.banner_url ? (
                  <Image
                    source={{ uri: org.banner_url }}
                    style={styles.orgCardHeader}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={['#3491ff', '#0062ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.orgCardHeader}
                  />
                )}
                <LinearGradient
                  colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
                  style={styles.orgCardGradient}
                />

                {/* Content on image */}
                <View style={styles.orgCardContent}>
                  {/* Badge at top */}
                  <View style={styles.orgTypeBadge}>
                    <Text style={styles.orgTypeBadgeText}>
                      {getTypeLabel(org.type || 'other')}
                    </Text>
                  </View>

                  {/* Name with logo at bottom */}
                  <View style={styles.orgCardBottom}>
                    <View style={styles.orgNameRow}>
                      {/* Logo Circle */}
                      {org.logo_url ? (
                        <View style={styles.orgLogoContainer}>
                          <Image
                            source={{ uri: org.logo_url }}
                            style={styles.orgLogo}
                            resizeMode="cover"
                          />
                        </View>
                      ) : (
                        <View style={[styles.orgLogoContainer, styles.orgLogoPlaceholder]}>
                          <Text style={styles.orgLogoText}>
                            {org.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      
                      {/* Name and Address */}
                      <View style={styles.orgTextContainer}>
                        <Text style={styles.orgName} numberOfLines={2}>
                          {org.name}
                        </Text>
                        <Text style={styles.orgFooterText} numberOfLines={1}>
                          {org.city
                            ? `${org.city}${org.state ? `, ${org.state}` : ''}`
                            : 'Location not specified'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          
          {/* Loading More Indicator */}
          {loadingMore && (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('normal'),
    color: colors.textMuted,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    marginBottom: spacing[2],
    fontFamily: typography.fontFamily.primary,
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
  filtersScroll: {
    gap: spacing[2],
  },
  filterChip: {
    paddingHorizontal: spacing[4],
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
  filterText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: getFontFamily('bold'),
  },
  filterTextActive: {
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
  },
  orgsList: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  resultsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[4],
    fontFamily: getFontFamily('bold'),
  },
  orgCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.md,
  },
  orgCardHeader: {
    aspectRatio: 4 / 3,
    width: '100%',
  },
  orgCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  orgCardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing[5],
    justifyContent: 'space-between',
  },
  orgCardBottom: {
    gap: spacing[2],
  },
  orgNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  orgTextContainer: {
    flex: 1,
    gap: spacing[1],
  },
  orgLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: spacing[2],
  },
  orgLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  orgLogoPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgLogoText: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  orgTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  orgTypeBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
  },
  orgName: {
    fontSize: typography.fontSize.xl,
    color: colors.text,
    lineHeight: typography.fontSize.xl * 1.3,
    fontFamily: typography.fontFamily.primary,
  },
  orgFooterText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[16],
    gap: spacing[4],
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
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
    fontFamily: getFontFamily('medium'),
  },
});
