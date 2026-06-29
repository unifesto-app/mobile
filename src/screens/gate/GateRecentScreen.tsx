import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock } from 'phosphor-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getMyOrganiserSpaces, getSpaceEvents } from '../../lib/api/spaces';
import { getEventRegistrations, EventRegistration } from '../../lib/api/registrations';
import { Event } from '../../lib/api/events';
import { spacing, typography, borderRadius } from '../../theme';
import { getFontFamily } from '../../theme/fontHelpers';

const GATE_EVENT_KEY = '@gate_selected_event';
const GATE_ACCENT = '#22c55e';

interface HourGroup {
  label: string;
  items: EventRegistration[];
}

export default function GateRecentScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState<Event | null>(null);
  const [groups, setGroups] = useState<HourGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getName = (r: EventRegistration) =>
    r.user?.fullName || r.attendees?.[0]?.name || r.user?.username || 'Guest';

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const groupByHour = (regs: EventRegistration[]): HourGroup[] => {
    const checkedIn = regs
      .filter((r) => r.checkedInAt)
      .sort((a, b) => new Date(b.checkedInAt!).getTime() - new Date(a.checkedInAt!).getTime());
    const map = new Map<string, EventRegistration[]>();
    checkedIn.forEach((r) => {
      const d = new Date(r.checkedInAt!);
      const label = d.toLocaleString(undefined, { hour: '2-digit', minute: undefined as any, hour12: true, month: 'short', day: 'numeric' }).replace(/:\d+/, '');
      const key = d.toLocaleDateString() + ' ' + d.getHours();
      const display = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', ' +
        d.toLocaleTimeString(undefined, { hour: '2-digit', hour12: true }).replace(/:\d+/, '');
      if (!map.has(display)) map.set(display, []);
      map.get(display)!.push(r);
    });
    return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
  };

  const load = useCallback(async () => {
    try {
      const spaces = await getMyOrganiserSpaces();
      const results = await Promise.all(
        (spaces || []).map((s) => getSpaceEvents(s.id, 1, 50).catch(() => ({ events: [] })))
      );
      const map = new Map<string, Event>();
      results.flatMap((r) => r.events || []).forEach((e: Event) => map.set(e.id, e));
      const list = Array.from(map.values());

      const savedId = await AsyncStorage.getItem(GATE_EVENT_KEY);
      const current = (savedId ? list.find((e) => e.id === savedId) : null) || list[0] || null;
      setEvent(current);

      if (current) {
        const res = await getEventRegistrations(current.id, 1, 100, { checkedIn: true });
        const data = res?.data || res?.registrations || res || [];
        setGroups(groupByHour(Array.isArray(data) ? data : []));
      } else {
        setGroups([]);
      }
    } catch (e) {
      console.error('Failed to load recent check-ins', e);
      setGroups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: spacing[5], paddingTop: insets.top + spacing[3], paddingBottom: spacing[3] },
    headerTitle: { fontSize: typography.fontSize['2xl'], color: colors.text, fontFamily: getFontFamily('bold') },
    headerSubtitle: { fontSize: typography.fontSize.sm, color: colors.textMuted, fontFamily: getFontFamily('normal'), marginTop: 2 },
    groupLabel: {
      fontSize: typography.fontSize.xs,
      color: GATE_ACCENT,
      fontFamily: getFontFamily('bold'),
      paddingHorizontal: spacing[5],
      paddingTop: spacing[4],
      paddingBottom: spacing[2],
      textTransform: 'uppercase',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[5],
      borderBottomWidth: 1,
      borderBottomColor: colors.borderMuted,
    },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: GATE_ACCENT, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontFamily: getFontFamily('bold'), fontSize: typography.fontSize.sm },
    rowContent: { flex: 1 },
    name: { fontSize: typography.fontSize.sm, color: colors.text, fontFamily: getFontFamily('semibold') },
    ticketType: { fontSize: typography.fontSize.xs, color: colors.textMuted, fontFamily: getFontFamily('normal'), marginTop: 2 },
    time: { fontSize: typography.fontSize.xs, color: colors.textMuted, fontFamily: getFontFamily('normal') },
    emptyWrap: { alignItems: 'center', paddingVertical: spacing[12], gap: spacing[3] },
    emptyText: { fontSize: typography.fontSize.base, color: colors.textMuted },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingWrap]}>
        <ActivityIndicator color={GATE_ACCENT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Check-ins</Text>
        <Text style={styles.headerSubtitle} numberOfLines={1}>
          {event ? event.title : 'No event selected'}
        </Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={GATE_ACCENT} />
        }
      >
        {groups.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Clock size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No check-ins yet.</Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.label}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              {group.items.map((r) => {
                const name = getName(r);
                const time = r.checkedInAt
                  ? new Date(r.checkedInAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                  : '';
                return (
                  <View key={r.id} style={styles.row}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials(name)}</Text>
                    </View>
                    <View style={styles.rowContent}>
                      <Text style={styles.name}>{name}</Text>
                      <Text style={styles.ticketType}>{r.ticketType?.name || 'RSVP'}</Text>
                    </View>
                    <Text style={styles.time}>{time}</Text>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
