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
import { Plus, Calendar, MapPin, CalendarX } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import ForgeWordmark from '../../components/ForgeWordmark';
import { getMyOrganiserSpaces, getSpaceEvents } from '../../lib/api/spaces';
import { Event } from '../../lib/api/events';
import { spacing, typography, borderRadius } from '../../theme';
import { getFontFamily } from '../../theme/fontHelpers';

type Filter = 'upcoming' | 'past' | 'drafts';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#6b7280',
  PUBLISHED: '#10b981',
  ONGOING: '#3491ff',
  COMPLETED: '#64748b',
  CANCELLED: '#ef4444',
};

export default function ForgeEventsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('upcoming');

  const load = useCallback(async () => {
    try {
      const spaces = await getMyOrganiserSpaces();
      const results = await Promise.all(
        (spaces || []).map((s) =>
          getSpaceEvents(s.id, 1, 50).catch(() => ({ events: [] }))
        )
      );
      const all = results.flatMap((r) => r.events || []);
      // de-dup by id
      const map = new Map<string, Event>();
      all.forEach((e: Event) => map.set(e.id, e));
      setEvents(Array.from(map.values()));
    } catch (e) {
      console.error('Failed to load forge events', e);
      setEvents([]);
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

  const now = new Date();
  const filtered = events.filter((e) => {
    if (filter === 'drafts') return e.status === 'DRAFT';
    const start = e.startDateTime ? new Date(e.startDateTime) : null;
    if (filter === 'upcoming')
      return e.status !== 'DRAFT' && (!start || start >= now);
    return e.status !== 'DRAFT' && start && start < now; // past
  });

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return d;
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      paddingHorizontal: spacing[5],
      paddingTop: insets.top + spacing[4],
      paddingBottom: 120,
    },
    wordmark: { width: 120, height: 34, marginBottom: spacing[1] },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
      marginBottom: spacing[4],
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing[2],
      marginBottom: spacing[5],
    },
    filterBtn: {
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.06)',
    },
    filterBtnActive: { backgroundColor: colors.primary },
    filterText: {
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
      fontFamily: getFontFamily('semibold'),
      textTransform: 'capitalize',
    },
    filterTextActive: { color: '#fff' },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      overflow: 'hidden',
      marginBottom: spacing[4],
    },
    cover: { height: 140, width: '100%', justifyContent: 'flex-end' },
    coverImage: { width: '100%', height: '100%' },
    coverGradient: { ...StyleSheet.absoluteFillObject },
    badge: {
      position: 'absolute',
      top: spacing[3],
      right: spacing[3],
      paddingHorizontal: spacing[2],
      paddingVertical: 3,
      borderRadius: borderRadius.full,
    },
    badgeText: {
      fontSize: 10,
      color: '#fff',
      fontFamily: getFontFamily('bold'),
      letterSpacing: 0.5,
    },
    coverTitle: {
      position: 'absolute',
      left: spacing[4],
      right: spacing[4],
      bottom: spacing[3],
      fontSize: typography.fontSize.lg,
      color: '#fff',
      fontFamily: getFontFamily('bold'),
    },
    cardBody: { padding: spacing[4], gap: spacing[3] },
    chipsRow: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
      backgroundColor: 'rgba(255,255,255,0.08)',
      paddingHorizontal: spacing[2],
      paddingVertical: 4,
      borderRadius: borderRadius.full,
    },
    chipText: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('semibold'),
    },
    progressWrap: { gap: spacing[1] },
    progressLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
    },
    progressValue: {
      fontSize: typography.fontSize.xs,
      color: colors.primary,
      fontFamily: getFontFamily('bold'),
    },
    progressTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.08)',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: spacing[16],
      gap: spacing[3],
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
    },
    emptyText: {
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
      fontFamily: getFontFamily('normal'),
    },
    fab: {
      position: 'absolute',
      right: spacing[5],
      bottom: insets.bottom + spacing[6],
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

  const renderCard = (e: Event) => {
    const cover = e.coverImageUrl;
    const registered = e.registeredCount ?? 0;
    const capacity = e.capacity ?? 0;
    const pct = capacity > 0 ? Math.min(registered / capacity, 1) : 0;
    const statusColor = STATUS_COLORS[e.status] || '#6b7280';

    return (
      <TouchableOpacity
        key={e.id}
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push(`/event/${e.id}`)}
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
          <View style={[styles.badge, { backgroundColor: statusColor }]}>
            <Text style={styles.badgeText}>{e.status}</Text>
          </View>
          <Text style={styles.coverTitle} numberOfLines={2}>
            {e.title}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Calendar size={12} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.chipText}>{formatDate(e.startDateTime)}</Text>
            </View>
            {e.city ? (
              <View style={styles.chip}>
                <MapPin size={12} color={colors.textMuted} strokeWidth={2} />
                <Text style={styles.chipText}>{e.city}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.progressWrap}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Registered</Text>
              <Text style={styles.progressValue}>
                {registered}
                {capacity ? ` / ${capacity}` : ''}
              </Text>
            </View>
            {capacity > 0 ? (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
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
        <ForgeWordmark width={120} height={34} />
        <Text style={[styles.headerSubtitle, { marginTop: spacing[1] }]}>
          Manage your events
        </Text>

        <View style={styles.filterRow}>
          {(['upcoming', 'past', 'drafts'] as Filter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <CalendarX size={30} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No {filter} events</Text>
            <Text style={styles.emptyText}>
              {filter === 'drafts'
                ? 'Draft events you create will appear here.'
                : `You have no ${filter} events right now.`}
            </Text>
          </View>
        ) : (
          filtered.map(renderCard)
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() =>
          Alert.alert('Coming soon', 'Event creation will be available soon.')
        }
      >
        <Plus size={26} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}
