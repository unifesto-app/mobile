import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Buildings, Calendar, Users } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Skeleton from '../components/Skeleton';
import { spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { useTheme } from '../context/ThemeContext';
import { getSpaceById, getSpaceEvents, getSubSpaces, joinSpace, leaveSpace, Space } from '../lib/api/spaces';
import { Event, getEventCardPrice } from '../lib/api/events';
import { useAuth } from '../context/AuthContext';

interface SpaceDetailScreenProps {
  route: { params: { spaceId: string } };
  onMembershipChange?: (isMember: boolean) => void;
  initialSpace?: Space | null;
}

export default function SpaceDetailScreen({ route, onMembershipChange, initialSpace }: SpaceDetailScreenProps) {
  const router = useRouter();
  const { spaceId } = route.params;
  const { user, token } = useAuth();
  const { colors } = useTheme();
  
  const [space, setOrganization] = useState<Space | null>(initialSpace || null);
  const [parentSpace, setParentOrg] = useState<Space | null>(null);
  const [subSpaces, setSubOrgs] = useState<Space[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);
  
  useEffect(() => {
    loadSpaceData();
  }, [spaceId]);
  
  const loadSpaceData = async () => {
    try {
      setLoading(true);
      const orgData = initialSpace || await getSpaceById(spaceId, token || undefined);
      
      if (!orgData) {
        setLoading(false);
        return;
      }
      
      setOrganization(orgData);
      
      // Check if user is already a member
      const memberStatus = !!orgData.userRole;
      setIsMember(memberStatus);
      
      // Notify parent component of membership status
      if (onMembershipChange) {
        onMembershipChange(memberStatus);
      }
      
      // Load events, parent org (if sub-org), and sub-orgs (if parent) in parallel
      const promises: Promise<any>[] = [
        getSpaceEvents(spaceId, 1, 20),
      ];
      
      // If this org has a parent, load the parent
      if (orgData.parent_org_id) {
        promises.push(getSpaceById(orgData.parent_org_id));
      } else {
        promises.push(Promise.resolve(null));
      }
      
      // Load sub-spaces
      promises.push(getSubSpaces(spaceId).catch(() => ({ spaces: [] })));
      
      const [eventsData, parentSpaceData, subSpacesData] = await Promise.all(promises);
      
      setEvents(eventsData?.events || []);
      setParentOrg(parentSpaceData);
      setSubOrgs(subSpacesData?.spaces || []);
    } catch (error) {
      console.error('Error loading space:', error);
      setEvents([]);
      setSubOrgs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!user || !token) {
      Alert.alert('Login Required', 'Please login to join spaces', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (!space) return;

    try {
      setJoiningLoading(true);
      
      if (isMember) {
        // Leave space
        await leaveSpace(token, spaceId);
        console.log('[Space] Left space, setting isMember to false');
        setIsMember(false);
        if (onMembershipChange) onMembershipChange(false);
        Alert.alert('Success', `You have left ${space.name}`);
      } else {
        // Join space
        await joinSpace(token, spaceId);
        setIsMember(true);
        if (onMembershipChange) onMembershipChange(true);
        Alert.alert('Success', `You have joined ${space.name}`);
      }
      
      // Reload space data to get updated member count
      await loadSpaceData();
    } catch (error: any) {
      console.error('Error joining/leaving space:', error);
      Alert.alert('Error', error.message || 'Failed to update membership');
    } finally {
      setJoiningLoading(false);
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Banner Skeleton */}
          <Skeleton width="100%" height={300} borderRadius={0} />
          
          <View style={styles.headerSection}>
            {/* Logo and Title Skeleton */}
            <View style={styles.logoAndTitle}>
              <Skeleton width={72} height={72} borderRadius={borderRadius.xl} />
              <View style={styles.titleSection}>
                <Skeleton width="80%" height={28} borderRadius={borderRadius.md} style={{ marginBottom: spacing[2] }} />
                <Skeleton width="60%" height={16} borderRadius={borderRadius.sm} />
              </View>
            </View>
          </View>
            
          {/* Description Skeleton */}
          <View style={styles.section}>
            <Skeleton width="100%" height={16} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
            <Skeleton width="95%" height={16} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
            <Skeleton width="90%" height={16} borderRadius={borderRadius.sm} />
          </View>
            
          {/* Events Section Skeleton */}
          <View style={styles.section}>
            <Skeleton width={150} height={24} borderRadius={borderRadius.md} style={{ marginBottom: spacing[4] }} />
            <View style={styles.eventsList}>
              {[1, 2].map((i) => (
                <View key={i} style={styles.eventCard}>
                  <Skeleton width={120} height={120} borderRadius={0} />
                  <View style={styles.eventContent}>
                    <Skeleton width="90%" height={18} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
                    <Skeleton width="60%" height={14} borderRadius={borderRadius.sm} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
  
  if (!space) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Buildings size={48} color={colors.textMuted} />
        <Text style={[styles.errorText, { color: colors.textMuted }]}>Space not found</Text>
      </View>
    );
  }

  // Calculate stats
  const memberCount = space.member_count || space._count?.userRoles || 0;
  const eventCount = space.event_count || space._count?.events || events.length;
  const upcomingCount = events.filter((e) => e.status === 'PUBLISHED').length;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner - 4:3 aspect ratio */}
        <View style={[styles.bannerSection, { backgroundColor: colors.backgroundSecondary }]}>
          {(space.banner_url || space.bannerUrl) ? (
            <Image
              source={{ uri: (space.banner_url || space.bannerUrl) as string }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={brandGradient}
              start={brandGradientStart}
              end={brandGradientEnd}
              style={styles.bannerImage}
            />
          )}
        </View>

        {/* Logo and Title Section - Below banner */}
        <View style={styles.headerSection}>
          <View style={styles.logoAndTitle}>
            {(space.logoUrl || space.logo_url) ? (
              <View style={[styles.logoContainer, { backgroundColor: colors.card }]}>
                <Image
                  source={{ uri: (space.logoUrl || space.logo_url) as string }}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <LinearGradient
                colors={brandGradient}
                start={brandGradientStart}
                end={brandGradientEnd}
                style={styles.logoContainer}
              >
                <Text style={[styles.logoText, { color: colors.text }]}>
                  {space.name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            
            <View style={styles.titleSection}>
              <Text style={[styles.spaceName, { color: colors.text }]}>{space.name}</Text>
              
              <View style={styles.metaRow}>
                {space.city && (
                  <>
                    <Text style={[styles.metaText, { color: colors.textMuted }]}>
                      {space.city}{space.state ? `, ${space.state}` : ''}
                    </Text>
                    <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
                  </>
                )}
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  {space.visibility === 'PUBLIC' ? 'Public' : 'Private'} Space
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* About Section */}
        {space.description && (
          <View style={styles.section}>
            <Text style={[styles.descriptionText, { color: colors.text }]}>{space.description}</Text>
          </View>
        )}

        {/* Organisers (creator + co-organisers) */}
        {(() => {
          const organiserList: { id: string; name: string; avatarUrl: string | null; roleLabel: string }[] = [];

          if (space.creator) {
            organiserList.push({
              id: space.creator.id,
              name: space.creator.fullName || space.creator.username || 'Organiser',
              avatarUrl: space.creator.avatarUrl,
              roleLabel: 'Organiser',
            });
          }

          (space.organisers || []).forEach((member) => {
            if (organiserList.some((o) => o.id === member.user.id)) return;
            organiserList.push({
              id: member.user.id,
              name: member.user.fullName || member.user.username || 'Organiser',
              avatarUrl: member.user.avatarUrl,
              roleLabel: member.role?.name || 'Co-Organiser',
            });
          });

          if (organiserList.length === 0) return null;

          return (
            <View style={styles.section}>
              <Text style={[styles.organiserTitle, { color: colors.text }]}>Organisers</Text>
              <View style={{ gap: spacing[2] }}>
                {organiserList.map((organiser) => (
                  <View
                    key={organiser.id}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: colors.card, padding: spacing[4], borderRadius: borderRadius.xl }}
                  >
                    {organiser.avatarUrl ? (
                      <Image
                        source={{ uri: organiser.avatarUrl }}
                        style={{ width: 44, height: 44, borderRadius: 22 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>{organiser.name[0].toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{organiser.name}</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{organiser.roleLabel}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })()}

        {/* Parent Space */}
        {parentSpace && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Part of</Text>
            <TouchableOpacity
              style={[styles.relatedCard, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/space/${parentSpace.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.relatedCardContent}>
                {(parentSpace.logo_url || parentSpace.logoUrl) ? (
                  <Image
                    source={{ uri: (parentSpace.logo_url || parentSpace.logoUrl) as string }}
                    style={[styles.relatedCardLogo, { backgroundColor: colors.primary }]}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={brandGradient}
                    start={brandGradientStart}
                    end={brandGradientEnd}
                    style={styles.relatedCardLogo}
                  >
                    <Text style={[styles.relatedCardLogoText, { color: colors.text }]}>
                      {parentSpace.name.charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                )}
                <View style={styles.relatedCardText}>
                  <Text style={[styles.relatedCardName, { color: colors.text }]}>{parentSpace.name}</Text>
                  {parentSpace.type && (
                    <Text style={[styles.relatedCardType, { color: colors.textMuted }]}>{parentSpace.type}</Text>
                  )}
                </View>
              </View>
              <ArrowRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Sub-Spaces */}
        {subSpaces.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sub-Spaces</Text>
              <Text style={[styles.sectionCount, { color: colors.textMuted }]}>{subSpaces.length}</Text>
            </View>
            <View style={styles.subSpacesList}>
              {subSpaces.map((subSpace) => (
                <TouchableOpacity
                  key={subSpace.id}
                  style={[styles.relatedCard, { backgroundColor: colors.card }]}
                  onPress={() => router.push(`/space/${subSpace.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.relatedCardContent}>
                    {(subSpace.logo_url || subSpace.logoUrl) ? (
                      <Image
                        source={{ uri: (subSpace.logo_url || subSpace.logoUrl) as string }}
                        style={[styles.relatedCardLogo, { backgroundColor: colors.primary }]}
                        resizeMode="cover"
                      />
                    ) : (
                      <LinearGradient
                        colors={brandGradient}
                        start={brandGradientStart}
                        end={brandGradientEnd}
                        style={styles.relatedCardLogo}
                      >
                        <Text style={[styles.relatedCardLogoText, { color: colors.text }]}>
                          {subSpace.name.charAt(0).toUpperCase()}
                        </Text>
                      </LinearGradient>
                    )}
                    <View style={styles.relatedCardText}>
                      <Text style={[styles.relatedCardName, { color: colors.text }]} numberOfLines={1}>
                        {subSpace.name}
                      </Text>
                      {subSpace.type && (
                        <Text style={[styles.relatedCardType, { color: colors.textMuted }]}>{subSpace.type}</Text>
                      )}
                    </View>
                  </View>
                  <ArrowRight size={20} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Events Section */}
        {events.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Events</Text>
              <Text style={[styles.sectionCount, { color: colors.textMuted }]}>{events.length}</Text>
            </View>
            <View style={styles.eventsList}>
              {events.map((event) => {
                const imageUrl = event.coverImageUrl;
                const eventDate = new Date(event.startDateTime);
                const formattedDate = eventDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
                
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={[styles.eventCard, { backgroundColor: colors.card }]}
                    onPress={() => router.push(`/event/${event.id}`)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.eventImageContainer}>
                      {imageUrl ? (
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.eventImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <LinearGradient
                          colors={brandGradient}
                          start={brandGradientStart}
                          end={brandGradientEnd}
                          style={styles.eventImage}
                        />
                      )}
                    </View>
                    
                    <View style={styles.eventContent}>
                      <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
                        {event.title}
                      </Text>
                      
                      <View style={styles.eventMetaRow}>
                        <View style={styles.eventMetaItem}>
                          <Calendar size={14} color={colors.textMuted} />
                          <Text style={[styles.eventMetaText, { color: colors.textMuted }]}>{formattedDate}</Text>
                        </View>
                        <Text style={[styles.eventPrice, { color: colors.primary }]}>
                          {getEventCardPrice(event)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Join Button - shown only for non-members */}
      {!isMember && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          overflow: 'hidden',
        }}>
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.95)']}
            locations={[0, 0.3, 1]}
            style={{
              paddingHorizontal: spacing[6],
              paddingBottom: spacing[8],
              paddingTop: spacing[8],
            }}
          >
            <TouchableOpacity onPress={handleJoinLeave} disabled={joiningLoading} activeOpacity={0.85}>
              <LinearGradient
                colors={brandGradient}
                start={brandGradientStart}
                end={brandGradientEnd}
                style={{
                  borderRadius: borderRadius.full,
                  paddingVertical: spacing[4],
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: joiningLoading ? 0.7 : 1,
                }}
              >
                <Text style={{ color: colors.text, fontSize: typography.fontSize.base, fontFamily: getFontFamily('bold') }}>
                  {joiningLoading ? 'Joining...' : `Join ${space.name}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('medium'),
  },
  scrollContent: {
    paddingBottom: spacing[24], // Extra padding for floating button
  },
  
  // Banner Section
  bannerSection: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  
  // Header Section (Logo + Title)
  headerSection: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
  },
  logoAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.md,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
  },
  titleSection: {
    flex: 1,
    gap: spacing[2],
  },
  spaceName: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    lineHeight: typography.fontSize['2xl'] * 1.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('normal'),
  },
  metaDot: {
    fontSize: typography.fontSize.sm,
  },
  
  // Section
  section: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
  },
  organiserTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    paddingBottom: spacing[2]
  },
  sectionCount: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  
  // Related Cards (Parent/Sub-spaces)
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  relatedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  relatedCardLogo: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  relatedCardLogoText: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
  },
  relatedCardText: {
    flex: 1,
    gap: spacing[1],
  },
  relatedCardName: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
  },
  relatedCardType: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('normal'),
  },
  subSpacesList: {
    gap: 0,
  },
  
  // Events
  eventsList: {
    gap: spacing[4],
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  eventImageContainer: {
    width: 160,
    aspectRatio: 4 / 3,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventContent: {
    flex: 1,
    padding: spacing[4],
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    lineHeight: typography.fontSize.base * 1.3,
    marginBottom: spacing[2],
  },
  eventMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  eventMetaText: {
    fontSize: typography.fontSize.xs,
    fontFamily: getFontFamily('normal'),
  },
  eventPrice: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
  },
  
  // Floating Join Button
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    paddingBottom: spacing[6],
    backgroundColor: 'transparent',
  },
  joinButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.lg,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
  },
  joinButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
  },
});
