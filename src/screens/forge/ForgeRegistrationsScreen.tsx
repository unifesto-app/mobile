import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronDown,
  Search,
  Download,
  Check,
  X,
  CalendarDays,
  Users,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import ForgeWordmark from '../../components/ForgeWordmark';
import { getMyOrganiserSpaces, getSpaceEvents } from '../../lib/api/spaces';
import {
  getEventRegistrations,
  EventRegistration,
} from '../../lib/api/registrations';
import { Event } from '../../lib/api/events';
import { spacing, typography, borderRadius } from '../../theme';
import { getFontFamily } from '../../theme/fontHelpers';

const AVATAR_COLORS = [
  '#3491ff',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
];

export default function ForgeRegistrationsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const spaces = await getMyOrganiserSpaces();
      const results = await Promise.all(
        (spaces || []).map((s) =>
          getSpaceEvents(s.id, 1, 50).catch(() => ({ events: [] }))
        )
      );
      const map = new Map<string, Event>();
      results
        .flatMap((r) => r.events || [])
        .forEach((e: Event) => map.set(e.id, e));
      const list = Array.from(map.values());
      setEvents(list);
      if (list.length > 0) setSelectedEvent(list[0]);
    } catch (e) {
      console.error('Failed to load events', e);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const loadRegistrations = useCallback(async (eventId: string) => {
    setLoadingRegs(true);
    try {
      const res = await getEventRegistrations(eventId, 1, 100);
      const data = res?.data || res?.registrations || res || [];
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load registrations', e);
      setRegistrations([]);
    } finally {
      setLoadingRegs(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (selectedEvent) loadRegistrations(selectedEvent.id);
  }, [selectedEvent, loadRegistrations]);

  const getName = (r: EventRegistration) =>
    r.user?.fullName || r.attendees?.[0]?.name || r.user?.username || 'Guest';

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const avatarColor = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  const filtered = registrations.filter((r) =>
    getName(r).toLowerCase().includes(search.toLowerCase())
  );

  const total = registrations.length;
  const checkedInCount = registrations.filter((r) => !!r.checkedInAt).length;
  const pendingCount = total - checkedInCount;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: spacing[5],
      paddingTop: insets.top + spacing[4],
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
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
    picker: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: borderRadius.xl,
      padding: spacing[4],
      marginTop: spacing[5],
    },
    pickerIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: 'rgba(52, 145, 255, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickerTextWrap: { flex: 1 },
    pickerLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('bold'),
      letterSpacing: 1,
      marginBottom: 2,
    },
    pickerText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      fontFamily: getFontFamily('semibold'),
    },
    summaryRow: {
      flexDirection: 'row',
      gap: spacing[2],
      marginTop: spacing[4],
    },
    summaryChip: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing[3],
      alignItems: 'center',
      gap: 2,
    },
    summaryValue: {
      fontSize: typography.fontSize.xl,
      fontFamily: getFontFamily('bold'),
    },
    summaryLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing[4],
      marginHorizontal: spacing[5],
      marginTop: spacing[4],
      marginBottom: spacing[2],
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontFamily: getFontFamily('normal'),
      paddingVertical: spacing[3],
      fontSize: typography.fontSize.sm,
    },
    sectionLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('bold'),
      letterSpacing: 1.5,
      marginHorizontal: spacing[5],
      marginTop: spacing[3],
      marginBottom: spacing[2],
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
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: '#fff',
      fontFamily: getFontFamily('bold'),
      fontSize: typography.fontSize.sm,
    },
    rowContent: { flex: 1 },
    name: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      fontFamily: getFontFamily('semibold'),
    },
    ticketType: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
      marginTop: 2,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: spacing[2],
      paddingVertical: 4,
      borderRadius: borderRadius.full,
    },
    statusText: { fontSize: 10, fontFamily: getFontFamily('bold') },
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
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    // modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: borderRadius['2xl'],
      borderTopRightRadius: borderRadius['2xl'],
      paddingBottom: insets.bottom + spacing[4],
      maxHeight: '70%',
    },
    modalTitle: {
      fontSize: typography.fontSize.lg,
      color: colors.text,
      fontFamily: getFontFamily('bold'),
      padding: spacing[5],
    },
    modalItem: {
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[5],
      borderBottomWidth: 1,
      borderBottomColor: colors.borderMuted,
    },
    modalItemText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      fontFamily: getFontFamily('semibold'),
    },
  });

  if (loadingEvents) {
    return (
      <View style={[styles.container, styles.loadingWrap]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <ForgeWordmark width={120} height={34} />
            <Text style={styles.headerSubtitle}>Attendees & check-ins</Text>
          </View>
          <TouchableOpacity
            style={styles.headerIcon}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert('Coming soon', 'Export will be available soon.')
            }
          >
            <Download size={20} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.picker}
          activeOpacity={0.85}
          onPress={() => setPickerOpen(true)}
        >
          <View style={styles.pickerIcon}>
            <CalendarDays size={18} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.pickerTextWrap}>
            <Text style={styles.pickerLabel}>EVENT</Text>
            <Text style={styles.pickerText} numberOfLines={1}>
              {selectedEvent ? selectedEvent.title : 'Select an event'}
            </Text>
          </View>
          <ChevronDown size={18} color={colors.textMuted} strokeWidth={2} />
        </TouchableOpacity>

        {selectedEvent ? (
          <View style={styles.summaryRow}>
            <View style={styles.summaryChip}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {total}
              </Text>
              <Text style={styles.summaryLabel}>Registered</Text>
            </View>
            <View style={styles.summaryChip}>
              <Text style={[styles.summaryValue, { color: '#22c55e' }]}>
                {checkedInCount}
              </Text>
              <Text style={styles.summaryLabel}>Checked in</Text>
            </View>
            <View style={styles.summaryChip}>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {pendingCount}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.searchBar}>
        <Search size={16} color={colors.textMuted} strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loadingRegs ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                if (selectedEvent) loadRegistrations(selectedEvent.id);
              }}
              tintColor={colors.primary}
            />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Users size={30} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.emptyTitle}>No attendees</Text>
              <Text style={styles.emptyText}>
                {search
                  ? 'No attendees match your search.'
                  : 'Registrations for this event will appear here.'}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionLabel}>
                {filtered.length} ATTENDEE{filtered.length !== 1 ? 'S' : ''}
              </Text>
              {filtered.map((r) => {
                const name = getName(r);
                const checkedIn = !!r.checkedInAt;
                return (
                  <View key={r.id} style={styles.row}>
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: avatarColor(name) },
                      ]}
                    >
                      <Text style={styles.avatarText}>{getInitials(name)}</Text>
                    </View>
                    <View style={styles.rowContent}>
                      <Text style={styles.name}>{name}</Text>
                      <Text style={styles.ticketType}>
                        {r.ticketType?.name || 'RSVP'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: checkedIn
                            ? 'rgba(34,197,94,0.15)'
                            : 'rgba(148,163,184,0.15)',
                        },
                      ]}
                    >
                      {checkedIn ? (
                        <Check size={11} color="#22c55e" strokeWidth={3} />
                      ) : (
                        <X size={11} color={colors.textMuted} strokeWidth={3} />
                      )}
                      <Text
                        style={[
                          styles.statusText,
                          { color: checkedIn ? '#22c55e' : colors.textMuted },
                        ]}
                      >
                        {checkedIn ? 'Checked in' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      )}

      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerOpen(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Event</Text>
            <ScrollView>
              {events.map((e) => (
                <TouchableOpacity
                  key={e.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedEvent(e);
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.modalItemText} numberOfLines={1}>
                    {e.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
