import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { CheckCircle, ArrowRight, Ticket } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../theme';
import { getEventById, getMyRegistrationForEvent } from '../lib/api/events';

export default function RegistrationSuccessScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const eventId = typeof params.eventId === 'string' ? params.eventId : '';
  const eventTitle = typeof params.eventTitle === 'string' ? params.eventTitle : '';
  const ticketName = typeof params.ticketName === 'string' ? params.ticketName : '';
  const total = typeof params.total === 'string' ? params.total : '0';
  const currency = typeof params.currency === 'string' ? params.currency : '₹';

  const [event, setEvent] = React.useState<any>(null);
  const [registration, setRegistration] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }
      try {
        const [eventData, regData] = await Promise.all([
          getEventById(eventId),
          getMyRegistrationForEvent(eventId),
        ]);
        setEvent(eventData);
        setRegistration(regData);
      } catch (error) {
        console.error('Failed to load success data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  // Prevent back navigation (success is a terminal screen)
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing[24] },
    errorText: { fontSize: typography.fontSize.base, color: colors.error, textAlign: 'center' },
    heroSection: { paddingHorizontal: spacing[6], paddingTop: spacing[16], paddingBottom: spacing[8] },
    heroContent: { alignItems: 'center' },
    successIconContainer: { marginBottom: spacing[6] },
    successIcon: {
      width: 64, height: 64, borderRadius: borderRadius.full,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    },
    successTitle: {
      fontSize: typography.fontSize['3xl'], fontFamily: typography.fontFamily.primary,
      textAlign: 'center', marginBottom: spacing[2],
    },
    successSubtitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
    contentContainer: { paddingHorizontal: spacing[6], paddingBottom: spacing[8] },
    summaryCard: {
      backgroundColor: colors.card, borderRadius: borderRadius.xl,
      borderWidth: 1, borderColor: colors.borderMuted, padding: spacing[5], marginBottom: spacing[6],
      ...shadows.md,
    },
    summaryTitle: {
      fontSize: typography.fontSize.base, fontFamily: typography.fontFamily.primary,
      color: colors.text, marginBottom: spacing[3],
    },
    summaryContent: { gap: spacing[2] },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { fontSize: typography.fontSize.sm, color: colors.textMuted },
    summaryValue: { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.bold, color: colors.text },
    actionButtons: { gap: spacing[3], marginBottom: spacing[6] },
    primaryButton: { borderRadius: borderRadius.full, overflow: 'hidden' },
    primaryButtonGradient: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      paddingVertical: spacing[3], paddingHorizontal: spacing[6], gap: spacing[2],
    },
    primaryButtonText: { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.bold, color: '#000000' },
    secondaryButton: {
      paddingVertical: spacing[3], paddingHorizontal: spacing[6], borderRadius: borderRadius.full,
      borderWidth: 1, borderColor: colors.borderMuted, alignItems: 'center',
    },
    secondaryButtonText: { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.bold, color: colors.text },
  });

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.errorText}>Loading...</Text>
      </View>
    );
  }

  const displayTitle = event?.title || eventTitle || 'Event';

  const handleViewTicket = () => {
    if (registration) {
      router.replace({
        pathname: '/ticket/[id]',
        params: {
          id: registration.id,
          ticket: JSON.stringify({
            ...(registration.event || event),
            qrCode: registration.qrCode,
            registrationId: registration.id,
            ticketType: registration.ticketType,
            ticketCode: registration.tickets?.[0]?.ticketCode,
          }),
        },
      });
    } else {
      router.replace('/tickets');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIcon}>
                <CheckCircle size={32} color="#000000" strokeWidth={2.5} />
              </View>
            </View>
            <GradientText style={styles.successTitle}>Registration Successful!</GradientText>
            <Text style={styles.successSubtitle}>You're all set for {displayTitle}</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Registration Summary</Text>
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Event:</Text>
                <Text style={styles.summaryValue}>{displayTitle}</Text>
              </View>
              {ticketName ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Ticket Type:</Text>
                  <Text style={styles.summaryValue}>{ticketName}</Text>
                </View>
              ) : null}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount Paid:</Text>
                <Text style={styles.summaryValue}>
                  {parseFloat(total) === 0 ? 'Free' : `${currency}${total}`}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleViewTicket}>
              <LinearGradient colors={['#3491ff', '#0062ff']} style={styles.primaryButtonGradient}>
                <Ticket size={16} color="#000000" strokeWidth={2} />
                <Text style={styles.primaryButtonText}>View My Ticket</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.secondaryButtonText}>Explore More Events</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}
