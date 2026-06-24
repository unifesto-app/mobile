import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Calendar, MapPin } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
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
        (spaces || []).map((s) => getSpaceEvents(s.id, 1, 50).catch(() => ({ events: [] })))
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
    if (filter === 'upcoming') return e.status !== 'DRAFT' && (!start || start >= now);
    return e.status !== 'DRAFT' && start && start < now; // past
  });

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return d;
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: spacing[5],
      paddingTop: insets.top + spacing[3],
      paddingBottom: spacing[3],
    },
    headerTitle: {
      fontSize: typography.fontSize['2xl'],
      color: colors.text,
      fontFamily: getFontFamily('bold'),
    },
    filterRow: { flexDirection: 'row', gap: spacing[2], paddingHorizontal: spacing[5], marginBottom: spacing[3] },
    filterBtn: {
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
      borderRadius: borderRadius.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderMuted,
    },
    filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { fontSize: typography.fontSize.sm, color: colors.textMuted, fontFamily: getFontFamily('semibold'), textTransform: 'capitalize' },
    filterTextActive: { color: '#fff' },
    scrollContent: { paddingHorizontal: spacing[5], paddingBottom: 120 },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      padding: spacing[4],
      marginBottom: spacing[3],
      gap: spacing[2],
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing[2] },
    eventTitle: {
      flex: 1,
      fontSize: typography.fontSize.base,
      color: colors.text,
      fontFamily: getFontFamily('semibold'),
    },
    badge: { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: borderRadius.md },
    badgeText: { fontSize: 10, color: '#fff', fontFamily: getFontFamily('bold') },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
    metaText: { fontSize: typography.fontSize.xs, color: colors.textMuted, fontFamily: getFontFamily('normal') },
    regText: { fontSize: typography.fontSize.xs, color: colors.primary, fontFamily: getFontFamily('semibold') },
    emptyWrap: { alignItems: 'center', paddingVertical: spacing[12] },
    emptyText: { fontSize: typography.fontSize.base, color: colors.textMuted },
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
    },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingWrap]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
      </View>
      <View style={styles.filterRow}>
        {(['upcoming', 'past', 'drafts'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No {filter} events.</Text>
          </View>
        ) : (
          filtered.map((e) => (
            <TouchableOpacity
              key={e.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(`/event/${e.id}`)}
            >
              <View style={styles.cardTop}>
                <Text style={styles.eventTitle} numberOfLines={2}>{e.title}</Text>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[e.status] || '#6b7280' }]}>
                  <Text style={styles.badgeText}>{e.status}</Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Calendar size={13} color={colors.textMuted} strokeWidth={2} />
                <Text style={styles.metaText}>{formatDate(e.startDateTime)}</Text>
              </View>
              {e.city ? (
                <View style={styles.metaRow}>
                  <MapPin size={13} color={colors.textMuted} strokeWidth={2} />
                  <Text style={styles.metaText}>{e.city}</Text>
                </View>
              ) : null}
              <Text style={styles.regText}>
                {e.registeredCount ?? 0}
                {e.capacity ? ` / ${e.capacity}` : ''} registered
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => Alert.alert('Coming soon', 'Event creation will be available soon.')}
      >
        <Plus size={26} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}
