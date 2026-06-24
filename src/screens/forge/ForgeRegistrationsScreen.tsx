import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Search, Download, Check, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getMyOrganiserSpaces, getSpaceEvents } from '../../lib/api/spaces';
import { getEventRegistrations, EventRegistration } from '../../lib/api/registrations';
import { Event } from '../../lib/api/events';
import { spacing, typography, borderRadius } from '../../theme';
import { getFontFamily } from '../../theme/fontHelpers';

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
        (spaces || []).map((s) => getSpaceEvents(s.id, 1, 50).catch(() => ({ events: [] })))
      );
      const map = new Map<string, Event>();
      results.flatMap((r) => r.events || []).forEach((e: Event) => map.set(e.id, e));
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
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const filtered = registrations.filter((r) =>
    getName(r).toLowerCase().includes(search.toLowerCase())
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: spacing[5], paddingTop: insets.top + spacing[3], paddingBottom: spacing[3] },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: typography.fontSize['2xl'], color: colors.text, fontFamily: getFontFamily('bold') },
    picker: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      marginTop: spacing[3],
    },
    pickerText: { flex: 1, fontSize: typography.fontSize.sm, color: colors.text, fontFamily: getFontFamily('semibold') },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing[3],
      marginHorizontal: spacing[5],
      marginBottom: spacing[3],
    },
    searchInput: { flex: 1, color: colors.text, fontFamily: getFontFamily('normal'), paddingVertical: spacing[3], fontSize: typography.fontSize.sm },
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
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontFamily: getFontFamily('bold'), fontSize: typography.fontSize.sm },
    rowContent: { flex: 1 },
    name: { fontSize: typography.fontSize.sm, color: colors.text, fontFamily: getFontFamily('semibold') },
    ticketType: { fontSize: typography.fontSize.xs, color: colors.textMuted, fontFamily: getFontFamily('normal'), marginTop: 2 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: spacing[2], paddingVertical: 3, borderRadius: borderRadius.md },
    statusText: { fontSize: 10, fontFamily: getFontFamily('bold') },
    emptyWrap: { alignItems: 'center', paddingVertical: spacing[12] },
    emptyText: { fontSize: typography.fontSize.base, color: colors.textMuted },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    // modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: colors.card, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, paddingBottom: insets.bottom + spacing[4], maxHeight: '70%' },
    modalTitle: { fontSize: typography.fontSize.lg, color: colors.text, fontFamily: getFontFamily('bold'), padding: spacing[5] },
    modalItem: { paddingVertical: spacing[3], paddingHorizontal: spacing[5], borderBottomWidth: 1, borderBottomColor: colors.borderMuted },
    modalItemText: { fontSize: typography.fontSize.sm, color: colors.text, fontFamily: getFontFamily('semibold') },
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
          <Text style={styles.headerTitle}>Registrations</Text>
          <TouchableOpacity onPress={() => Alert.alert('Coming soon', 'Export will be available soon.')}>
            <Download size={20} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.picker} activeOpacity={0.8} onPress={() => setPickerOpen(true)}>
          <Text style={styles.pickerText} numberOfLines={1}>
            {selectedEvent ? selectedEvent.title : 'Select an event'}
          </Text>
          <ChevronDown size={18} color={colors.textMuted} strokeWidth={2} />
        </TouchableOpacity>
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); if (selectedEvent) loadRegistrations(selectedEvent.id); }}
              tintColor={colors.primary}
            />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No registrations found.</Text>
            </View>
          ) : (
            filtered.map((r) => {
              const name = getName(r);
              const checkedIn = !!r.checkedInAt;
              return (
                <View key={r.id} style={styles.row}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(name)}</Text>
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.ticketType}>{r.ticketType?.name || 'RSVP'}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: checkedIn ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)' }]}>
                    {checkedIn ? (
                      <Check size={11} color="#22c55e" strokeWidth={3} />
                    ) : (
                      <X size={11} color={colors.textMuted} strokeWidth={3} />
                    )}
                    <Text style={[styles.statusText, { color: checkedIn ? '#22c55e' : colors.textMuted }]}>
                      {checkedIn ? 'Checked in' : 'Not in'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Event</Text>
            <ScrollView>
              {events.map((e) => (
                <TouchableOpacity
                  key={e.id}
                  style={styles.modalItem}
                  onPress={() => { setSelectedEvent(e); setPickerOpen(false); }}
                >
                  <Text style={styles.modalItemText} numberOfLines={1}>{e.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
