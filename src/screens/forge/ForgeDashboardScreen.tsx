import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  Users,
  Calendar,
  CalendarClock,
  Ticket,
  BarChart3,
  Hammer,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import ForgeWordmark from '../../components/ForgeWordmark';
import { getMyOrganiserSpaces, Space } from '../../lib/api/spaces';
import { spacing, typography, borderRadius } from '../../theme';
import { getFontFamily } from '../../theme/fontHelpers';

export default function ForgeDashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await getMyOrganiserSpaces();
      setSpaces(result || []);
    } catch (e) {
      console.error('Failed to load organiser spaces', e);
      setSpaces([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      paddingHorizontal: spacing[5],
      paddingTop: insets.top + spacing[4],
      paddingBottom: 120,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing[6],
    },
    wordmark: { width: 120, height: 34 },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
      marginTop: spacing[1],
    },
    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(52, 145, 255, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('bold'),
      letterSpacing: 1.5,
      marginBottom: spacing[2],
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      overflow: 'hidden',
      marginBottom: spacing[4],
    },
    cover: { height: 120, width: '100%', justifyContent: 'flex-end' },
    coverImage: { width: '100%', height: '100%' },
    coverGradient: { ...StyleSheet.absoluteFillObject },
    coverContent: {
      position: 'absolute',
      left: spacing[4],
      right: spacing[4],
      bottom: spacing[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    logo: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    logoImg: { width: '100%', height: '100%' },
    logoText: {
      fontSize: typography.fontSize.lg,
      color: '#fff',
      fontFamily: getFontFamily('bold'),
    },
    coverNameWrap: { flex: 1 },
    spaceName: {
      fontSize: typography.fontSize.lg,
      color: '#fff',
      fontFamily: getFontFamily('bold'),
    },
    chipsRow: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[1] },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
      backgroundColor: 'rgba(255,255,255,0.16)',
      paddingHorizontal: spacing[2],
      paddingVertical: 3,
      borderRadius: borderRadius.full,
    },
    chipText: {
      fontSize: typography.fontSize.xs,
      color: '#fff',
      fontFamily: getFontFamily('semibold'),
    },
    actionsRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.borderMuted,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[1],
      paddingVertical: spacing[3],
    },
    actionDivider: { width: 1, backgroundColor: colors.borderMuted },
    actionText: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('semibold'),
    },
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: spacing[16],
      gap: spacing[4],
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: 'rgba(52, 145, 255, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: {
      fontSize: typography.fontSize.lg,
      color: colors.text,
      fontFamily: getFontFamily('bold'),
      textAlign: 'center',
    },
    emptyText: {
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
      fontFamily: getFontFamily('normal'),
      maxWidth: 260,
      lineHeight: typography.fontSize.sm * 1.5,
    },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      backgroundColor: colors.primary,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.full,
      marginTop: spacing[2],
    },
    ctaText: {
      color: '#fff',
      fontFamily: getFontFamily('bold'),
      fontSize: typography.fontSize.sm,
    },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

  const renderCard = (space: Space) => {
    const logo = space.logoUrl || space.logo_url;
    const cover = space.bannerUrl || space.banner_url;
    const members = space.member_count ?? space._count?.userRoles ?? 0;
    const events = space.event_count ?? space._count?.events ?? 0;

    return (
      <View key={space.id} style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/space/${space.id}`)}
        >
          <View style={styles.cover}>
            {cover ? (
              <>
                <Image source={{ uri: cover }} style={styles.coverImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={styles.coverGradient}
                />
              </>
            ) : (
              <LinearGradient
                colors={['rgba(52,145,255,0.55)', 'rgba(0,98,255,0.85)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.coverGradient}
              />
            )}
            <View style={styles.coverContent}>
              <View style={styles.logo}>
                {logo ? (
                  <Image source={{ uri: logo }} style={styles.logoImg} />
                ) : (
                  <Text style={styles.logoText}>{getInitials(space.name)}</Text>
                )}
              </View>
              <View style={styles.coverNameWrap}>
                <Text style={styles.spaceName} numberOfLines={1}>
                  {space.name}
                </Text>
                <View style={styles.chipsRow}>
                  <View style={styles.chip}>
                    <Users size={11} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.chipText}>{members}</Text>
                  </View>
                  <View style={styles.chip}>
                    <Calendar size={11} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.chipText}>{events}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/forge-events')}
          >
            <CalendarClock size={15} color={colors.primary} strokeWidth={2} />
            <Text style={styles.actionText}>Events</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/forge-registrations')}
          >
            <Ticket size={15} color={colors.primary} strokeWidth={2} />
            <Text style={styles.actionText}>Registrations</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert('Coming soon', 'Analytics will be available soon.')
            }
          >
            <BarChart3 size={15} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingWrap]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <ForgeWordmark width={120} height={34} />
            <Text style={styles.headerSubtitle}>Your spaces</Text>
          </View>
          <View style={styles.headerIcon}>
            <Hammer size={20} color={colors.primary} strokeWidth={2} />
          </View>
        </View>

        {spaces.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Plus size={30} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No spaces yet</Text>
            <Text style={styles.emptyText}>
              Create a space to start hosting events, managing registrations,
              and growing your community.
            </Text>
            <TouchableOpacity
              style={styles.cta}
              activeOpacity={0.85}
              onPress={() =>
                Alert.alert(
                  'Coming soon',
                  'Space creation will be available soon.'
                )
              }
            >
              <Plus size={16} color="#fff" strokeWidth={2.5} />
              <Text style={styles.ctaText}>Create Space</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>MANAGED SPACES</Text>
            {spaces.map(renderCard)}
          </>
        )}
      </ScrollView>
    </View>
  );
}
