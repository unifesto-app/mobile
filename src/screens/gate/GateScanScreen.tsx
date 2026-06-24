import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X, ChevronDown, ScanLine } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getMyOrganiserSpaces, getSpaceEvents } from '../../lib/api/spaces';
import { checkIn } from '../../lib/api/registrations';
import { Event } from '../../lib/api/events';
import { spacing, typography, borderRadius } from '../../theme';
import { getFontFamily } from '../../theme/fontHelpers';

const GATE_EVENT_KEY = '@gate_selected_event';
const GATE_ACCENT = '#22c55e';

interface ScanResult {
  valid: boolean;
  name?: string;
  ticketType?: string;
  message?: string;
}

export default function GateScanScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const lockRef = useRef(false);

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

      const savedId = await AsyncStorage.getItem(GATE_EVENT_KEY);
      const saved = savedId ? list.find((e) => e.id === savedId) : null;
      setSelectedEvent(saved || list[0] || null);
    } catch (e) {
      console.error('Failed to load gate events', e);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const selectEvent = async (e: Event) => {
    setSelectedEvent(e);
    await AsyncStorage.setItem(GATE_EVENT_KEY, e.id);
    setPickerOpen(false);
  };

  const handleScan = async ({ data }: { data: string }) => {
    if (lockRef.current || !selectedEvent || scanResult) return;
    lockRef.current = true;
    setProcessing(true);
    try {
      const res = await checkIn(selectedEvent.id, data);
      setScanResult({
        valid: true,
        name: res?.user?.fullName || res?.attendee?.name || res?.name || 'Attendee',
        ticketType: res?.ticketType?.name || res?.ticketTypeName || 'Ticket',
      });
    } catch (e: any) {
      setScanResult({ valid: false, message: e?.message || 'Invalid or already checked in' });
    } finally {
      setProcessing(false);
    }
  };

  const dismissResult = () => {
    setScanResult(null);
    lockRef.current = false;
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    topBar: {
      position: 'absolute',
      top: insets.top + spacing[2],
      left: spacing[5],
      right: spacing[5],
      zIndex: 10,
    },
    eventPicker: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderWidth: 1,
      borderColor: GATE_ACCENT,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
    },
    eventPickerText: { flex: 1, color: '#fff', fontFamily: getFontFamily('semibold'), fontSize: typography.fontSize.sm },
    centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
    centerText: { color: '#fff', fontSize: typography.fontSize.base, textAlign: 'center', fontFamily: getFontFamily('normal'), marginBottom: spacing[4] },
    permBtn: { backgroundColor: GATE_ACCENT, paddingVertical: spacing[3], paddingHorizontal: spacing[6], borderRadius: borderRadius.lg },
    permBtnText: { color: '#fff', fontFamily: getFontFamily('bold') },
    reticle: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 240,
      height: 240,
      marginLeft: -120,
      marginTop: -120,
      borderWidth: 3,
      borderColor: GATE_ACCENT,
      borderRadius: borderRadius.xl,
    },
    hint: {
      position: 'absolute',
      bottom: insets.bottom + spacing[10],
      left: 0, right: 0,
      alignItems: 'center',
      gap: spacing[2],
    },
    hintText: { color: 'rgba(255,255,255,0.8)', fontSize: typography.fontSize.sm, fontFamily: getFontFamily('normal') },
    // result overlay
    resultOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
    resultIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[5] },
    resultName: { color: '#fff', fontSize: typography.fontSize['2xl'], fontFamily: getFontFamily('bold'), textAlign: 'center' },
    resultSub: { color: 'rgba(255,255,255,0.8)', fontSize: typography.fontSize.base, fontFamily: getFontFamily('normal'), marginTop: spacing[2], textAlign: 'center' },
    resultBtn: { marginTop: spacing[8], backgroundColor: '#fff', paddingVertical: spacing[3], paddingHorizontal: spacing[8], borderRadius: borderRadius.lg },
    resultBtnText: { color: '#000', fontFamily: getFontFamily('bold'), fontSize: typography.fontSize.base },
    // event picker modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: colors.card, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, paddingBottom: insets.bottom + spacing[4], maxHeight: '70%' },
    modalTitle: { fontSize: typography.fontSize.lg, color: colors.text, fontFamily: getFontFamily('bold'), padding: spacing[5] },
    modalItem: { paddingVertical: spacing[3], paddingHorizontal: spacing[5], borderBottomWidth: 1, borderBottomColor: colors.borderMuted },
    modalItemText: { fontSize: typography.fontSize.sm, color: colors.text, fontFamily: getFontFamily('semibold') },
  });

  if (loadingEvents) {
    return (
      <View style={[styles.container, styles.centerWrap]}>
        <ActivityIndicator color={GATE_ACCENT} />
      </View>
    );
  }

  if (!permission?.granted) {
    return (
      <View style={[styles.container, styles.centerWrap]}>
        <Text style={styles.centerText}>Camera access is required to scan tickets.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.85}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Result overlay
  if (scanResult) {
    const bg = scanResult.valid ? GATE_ACCENT : '#ef4444';
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.resultOverlay}>
          <View style={[styles.resultIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            {scanResult.valid ? (
              <Check size={56} color="#fff" strokeWidth={3} />
            ) : (
              <X size={56} color="#fff" strokeWidth={3} />
            )}
          </View>
          {scanResult.valid ? (
            <>
              <Text style={styles.resultName}>{scanResult.name}</Text>
              <Text style={styles.resultSub}>{scanResult.ticketType}</Text>
            </>
          ) : (
            <Text style={styles.resultName}>{scanResult.message}</Text>
          )}
          <TouchableOpacity style={styles.resultBtn} onPress={dismissResult} activeOpacity={0.85}>
            <Text style={styles.resultBtnText}>Scan Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={processing ? undefined : handleScan}
      />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.eventPicker} activeOpacity={0.8} onPress={() => setPickerOpen(true)}>
          <Text style={styles.eventPickerText} numberOfLines={1}>
            {selectedEvent ? selectedEvent.title : 'Select Event'}
          </Text>
          <ChevronDown size={18} color={GATE_ACCENT} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.reticle} />

      <View style={styles.hint}>
        {processing ? (
          <ActivityIndicator color={GATE_ACCENT} />
        ) : (
          <>
            <ScanLine size={22} color={GATE_ACCENT} strokeWidth={2} />
            <Text style={styles.hintText}>
              {selectedEvent ? 'Point at a ticket QR code' : 'Select an event to start scanning'}
            </Text>
          </>
        )}
      </View>

      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Event</Text>
            <ScrollView>
              {events.map((e) => (
                <TouchableOpacity key={e.id} style={styles.modalItem} onPress={() => selectEvent(e)}>
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
