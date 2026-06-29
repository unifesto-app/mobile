import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, CheckCircle, XCircle, CaretDown } from 'phosphor-react-native';
import { UnIcon } from '@unifesto/unicon/react-native';
import { useTheme } from '../context/ThemeContext';
import { createSpaceRequest, getMySpaceRequests, SpaceRequest } from '../lib/api/spaces';
import { spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

const SPACE_TYPES = [
  { label: 'Regular', value: 'REGULAR' },
  { label: 'Super', value: 'SUPER' },
];

const CITIES = ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune', 'Kolkata', 'Other'];

export default function SpaceRequestScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [existingRequests, setExistingRequests] = useState<SpaceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('REGULAR');
  const [city, setCity] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const load = useCallback(async () => {
    try {
      const requests = await getMySpaceRequests();
      setExistingRequests(requests);
    } catch (e) {
      console.error('Failed to load requests', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a space name');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe your space');
      return;
    }
    setSubmitting(true);
    try {
      await createSpaceRequest({
        name: name.trim(),
        description: description.trim(),
        type,
        city: city || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
      });
      Alert.alert('Request Submitted', 'We\'ll review your request and get back to you within 2-3 business days.', [
        { text: 'OK', onPress: () => { load(); setName(''); setDescription(''); setCity(''); setWebsiteUrl(''); } }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingRequest = existingRequests.find(r => r.status === 'PENDING');

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingHorizontal: spacing[6], paddingTop: insets.top + spacing[6], paddingBottom: 120 },
    sectionSpacing: { marginBottom: spacing[6] },
    sectionTitle: { fontSize: typography.fontSize.sm, fontFamily: getFontFamily('normal'), color: colors.textMuted, marginBottom: spacing[3], paddingLeft: spacing[1] },
    card: { backgroundColor: colors.card, borderRadius: borderRadius['2xl'], overflow: 'hidden', ...shadows.lg },
    inputGroup: { paddingHorizontal: spacing[5], paddingVertical: spacing[4] },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
    iconWrapper: { width: 36, height: 36, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
    input: { flex: 1, fontSize: typography.fontSize.base, fontFamily: getFontFamily('semibold'), color: colors.text, backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
    textArea: { height: 80, textAlignVertical: 'top', paddingTop: spacing[2] },
    inputDivider: { height: 1, backgroundColor: colors.borderMuted, marginLeft: 72, marginRight: spacing[5] },
    typePills: { flex: 1, flexDirection: 'row', gap: spacing[2] },
    typePill: { flex: 1, paddingVertical: spacing[3], borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMuted },
    typePillActive: { backgroundColor: 'rgba(52,145,255,0.12)', borderColor: colors.primary },
    typePillText: { fontSize: typography.fontSize.sm, fontFamily: getFontFamily('semibold'), color: colors.textMuted },
    typePillTextActive: { color: colors.primary },
    typeLegend: { marginLeft: 72, marginRight: spacing[5], marginTop: spacing[2], gap: spacing[1] },
    typeLegendText: { fontSize: typography.fontSize.xs, fontFamily: getFontFamily('normal'), color: colors.textMuted },
    typeLegendLabel: { fontFamily: getFontFamily('semibold'), color: colors.text },
    dropdownButton: { flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing[4], paddingVertical: spacing[3], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dropdownButtonText: { fontSize: typography.fontSize.base, fontFamily: getFontFamily('semibold'), color: colors.text },
    dropdownPlaceholder: { color: colors.textMuted },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    dropdownModal: { width: '80%', backgroundColor: colors.card, borderRadius: borderRadius['2xl'], overflow: 'hidden', ...shadows.xl },
    dropdownOption: { paddingHorizontal: spacing[5], paddingVertical: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.borderMuted },
    dropdownOptionLast: { borderBottomWidth: 0 },
    dropdownOptionSelected: { backgroundColor: 'rgba(52, 145, 255, 0.1)' },
    dropdownOptionText: { fontSize: typography.fontSize.base, fontFamily: getFontFamily('semibold'), color: colors.text },
    dropdownOptionTextSelected: { color: colors.primary },
    submitBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.xl, paddingVertical: spacing[4], alignItems: 'center', marginTop: spacing[4] },
    submitBtnText: { color: '#fff', fontFamily: getFontFamily('bold'), fontSize: typography.fontSize.base },
    requestRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingHorizontal: spacing[5], paddingVertical: spacing[4] },
    requestName: { flex: 1, fontSize: typography.fontSize.sm, fontFamily: getFontFamily('semibold'), color: colors.text },
    requestDate: { flexShrink: 0, fontSize: typography.fontSize.xs, fontFamily: getFontFamily('normal'), color: colors.textMuted },
    statusBadge: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: spacing[1], paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: borderRadius.full },
    statusBadgeText: { fontSize: typography.fontSize.xs, fontFamily: getFontFamily('semibold') },
    pendingBlock: { alignItems: 'center', paddingVertical: spacing[8] },
    pendingTitle: { color: colors.text, fontFamily: getFontFamily('bold'), fontSize: typography.fontSize.lg, marginTop: spacing[3] },
    pendingText: { color: colors.textMuted, textAlign: 'center', marginTop: spacing[2], fontSize: typography.fontSize.sm, fontFamily: getFontFamily('normal'), lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm },
  });

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        {/* Pending state */}
        {pendingRequest && (
          <View style={styles.pendingBlock}>
            <Clock size={40} color="#f59e0b" weight="fill" />
            <Text style={styles.pendingTitle}>Request Under Review</Text>
            <Text style={styles.pendingText}>
              We'll review your request for "{pendingRequest.name}" within 2-3 business days.
            </Text>
          </View>
        )}

        {/* Form (hidden while a request is pending) */}
        {!pendingRequest && (
          <View style={styles.sectionSpacing}>
            <Text style={styles.sectionTitle}>New Request</Text>
            <View style={styles.card}>
              {/* Space Name */}
              <View style={styles.inputGroup}>
                <View style={styles.inputRow}>
                  <View style={styles.iconWrapper}>
                    <UnIcon name="profile" size={32} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Space name"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    maxLength={255}
                  />
                </View>
              </View>

              <View style={styles.inputDivider} />

              {/* Description */}
              <View style={styles.inputGroup}>
                <View style={styles.inputRow}>
                  <View style={styles.iconWrapper}>
                    <UnIcon name="file-text" size={32} />
                  </View>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your space"
                    placeholderTextColor={colors.textMuted}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    maxLength={2000}
                  />
                </View>
              </View>

              <View style={styles.inputDivider} />

              {/* Type (inline pills) */}
              <View style={styles.inputGroup}>
                <View style={styles.inputRow}>
                  <View style={styles.iconWrapper}>
                    <UnIcon name="list" size={32} />
                  </View>
                  <View style={styles.typePills}>
                    {SPACE_TYPES.map(t => {
                      const active = type === t.value;
                      return (
                        <TouchableOpacity
                          key={t.value}
                          style={[styles.typePill, active && styles.typePillActive]}
                          onPress={() => setType(t.value)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.typePillText, active && styles.typePillTextActive]}>
                            {t.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.typeLegend}>
                  <Text style={styles.typeLegendText}>
                    <Text style={styles.typeLegendLabel}>Regular</Text> means Community/Club/Startup
                  </Text>
                  <Text style={styles.typeLegendText}>
                    <Text style={styles.typeLegendLabel}>Super</Text> means University/College/Institution
                  </Text>
                </View>
              </View>

              <View style={styles.inputDivider} />

              {/* Location (dropdown) */}
              <View style={styles.inputGroup}>
                <View style={styles.inputRow}>
                  <View style={styles.iconWrapper}>
                    <UnIcon name="maps" size={32} />
                  </View>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowCityDropdown(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownButtonText, !city && styles.dropdownPlaceholder]}>
                      {city || 'Select city'}
                    </Text>
                    <CaretDown size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputDivider} />

              {/* Website */}
              <View style={styles.inputGroup}>
                <View style={styles.inputRow}>
                  <View style={styles.iconWrapper}>
                    <UnIcon name="globe" size={32} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Website (optional)"
                    placeholderTextColor={colors.textMuted}
                    value={websiteUrl}
                    onChangeText={setWebsiteUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Request</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Your Requests */}
        {existingRequests.length > 0 && (
          <View style={styles.sectionSpacing}>
            <Text style={styles.sectionTitle}>Your Requests</Text>
            <View style={styles.card}>
              {existingRequests.map((req, index) => {
                const isPending = req.status === 'PENDING';
                const isApproved = req.status === 'APPROVED';
                const color = isPending ? '#f59e0b' : isApproved ? '#22c55e' : '#ef4444';
                const label = isPending ? 'Pending' : isApproved ? 'Approved' : 'Rejected';
                const Icon = isPending ? Clock : isApproved ? CheckCircle : XCircle;
                return (
                  <React.Fragment key={req.id}>
                    <View style={styles.requestRow}>
                      <Text style={styles.requestName} numberOfLines={1}>{req.name}</Text>
                      <Text style={styles.requestDate}>{new Date(req.createdAt).toLocaleDateString()}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: color + '1A' }]}>
                        <Icon size={14} color={color} weight="fill" />
                        <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
                      </View>
                    </View>
                    {index < existingRequests.length - 1 && <View style={styles.inputDivider} />}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* City Dropdown Modal */}
      <Modal
        visible={showCityDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCityDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCityDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            {CITIES.map((option, index) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownOption,
                  index === CITIES.length - 1 && styles.dropdownOptionLast,
                  city === option && styles.dropdownOptionSelected,
                ]}
                onPress={() => {
                  setCity(option);
                  setShowCityDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    city === option && styles.dropdownOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
