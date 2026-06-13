import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { 
  CheckCircle, 
  Copy, 
  Mail, 
  Smartphone, 
  Calendar, 
  Smile,
  ArrowRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../theme';
import { getEventById } from '../lib/api/events';

export default function RegistrationSuccessScreen() {
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    textAlign: 'center',
  },
  // Hero Section
  heroSection: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[16],
    paddingBottom: spacing[8],
  },
  heroContent: {
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: spacing[6],
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Add bounce animation effect
    transform: [{ scale: 1 }],
  },
  successTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  successSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Content
  contentContainer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  // Registration Card
  registrationCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing[6],
    marginBottom: spacing[6],
    ...shadows.md,
  },
  // QR Section
  qrSection: {
    alignItems: 'center',
    paddingBottom: spacing[6],
    marginBottom: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  qrSectionTitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing[3],
  },
  qrCodeContainer: {
    padding: spacing[3],
    backgroundColor: colors.text,
    borderRadius: borderRadius.xl,
    marginBottom: spacing[3],
  },
  qrCode: {
    width: 160,
    height: 160,
  },
  qrHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  // Registration ID
  registrationIdSection: {
    marginBottom: spacing[6],
    paddingBottom: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  registrationIdTitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing[2],
  },
  registrationIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing[3],
  },
  registrationIdText: {
    fontSize: typography.fontSize.base,
    fontFamily: 'Courier',
    color: colors.text,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
  },
  copyButtonText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  // Event Details
  eventDetailsSection: {
    gap: spacing[2],
  },
  eventDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDetailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  eventDetailValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  // Next Steps
  nextStepsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing[5],
    marginBottom: spacing[6],
  },
  nextStepsTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[3],
  },
  nextStepsList: {
    gap: spacing[3],
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  nextStepIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[1],
  },
  nextStepText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    paddingTop: spacing[1],
  },
  // Action Buttons
  actionButtons: {
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  secondaryButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  primaryButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    gap: spacing[2],
  },
  primaryButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  // Additional Actions
  additionalActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  additionalAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  additionalActionText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  // Summary Card
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing[5],
    marginBottom: spacing[6],
  },
  summaryTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[3],
  },
  summaryContent: {
    gap: spacing[2],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
});

  const router = useRouter();
  const params = useLocalSearchParams();
  const eventId = typeof params.eventId === 'string' ? params.eventId : '';
  const registrationDataStr = typeof params.registrationData === 'string' ? params.registrationData : '';
  
  // Parse registration data if it's a JSON string
  let registrationData: any = null;
  try {
    if (registrationDataStr) {
      registrationData = JSON.parse(registrationDataStr);
    }
  } catch (error) {
    console.error('Failed to parse registration data:', error);
  }
  
  // Event state
  const [event, setEvent] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  
  // Load event data
  React.useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }
      try {
        const eventData = await getEventById(eventId);
        setEvent(eventData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [eventId]);

  // Prevent back navigation
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Return true to prevent default back behavior
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  // Generate mock registration ID
  const registrationId = 'REG' + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  // Generate QR code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${registrationId}`;

  const copyToClipboard = async (text: string) => {
    try {
      // In a real app, you'd use Clipboard from @react-native-clipboard/clipboard
      // For now, just show an alert or toast
    } catch (error) {
    }
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Loading...</Text>
      </View>
    );
  }
  
  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  const nextSteps = [
    {
      icon: Mail,
      text: 'Check your email for confirmation',
    },
    {
      icon: Smartphone,
      text: 'Save the QR code or screenshot',
    },
    {
      icon: Calendar,
      text: 'Add event to your calendar',
    },
    {
      icon: Smile,
      text: 'Get ready for an amazing experience!',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['rgba(52, 145, 255, 0.1)', 'transparent']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            {/* Success Animation */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIcon}>
                <CheckCircle size={32} color="#000000" strokeWidth={2.5} />
              </View>
            </View>

            <GradientText style={styles.successTitle}>
              Registration Successful!
            </GradientText>
            <Text style={styles.successSubtitle}>
              You're all set for {event.title}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Registration Details Card */}
          <View style={styles.registrationCard}>
            {/* QR Code Section */}
            <View style={styles.qrSection}>
              <Text style={styles.qrSectionTitle}>Your Entry Pass</Text>
              <View style={styles.qrCodeContainer}>
                <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} />
              </View>
              <Text style={styles.qrHint}>
                Show this QR code at the event entrance
              </Text>
            </View>

            {/* Registration ID */}
            <View style={styles.registrationIdSection}>
              <Text style={styles.registrationIdTitle}>Registration ID</Text>
              <View style={styles.registrationIdContainer}>
                <Text style={styles.registrationIdText}>{registrationId}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(registrationId)}
                >
                  <Copy size={16} color={colors.text} strokeWidth={2} />
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Event Details */}
            <View style={styles.eventDetailsSection}>
              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailLabel}>Event:</Text>
                <Text style={styles.eventDetailValue}>{event.title}</Text>
              </View>
              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailLabel}>Date:</Text>
                <Text style={styles.eventDetailValue}>{event.date}</Text>
              </View>
              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailLabel}>Time:</Text>
                <Text style={styles.eventDetailValue}>{event.time}</Text>
              </View>
              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailLabel}>Location:</Text>
                <Text style={styles.eventDetailValue}>{event.location}</Text>
              </View>
            </View>
          </View>

          {/* Next Steps */}
          <View style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>What's Next?</Text>
            <View style={styles.nextStepsList}>
              {nextSteps.map((step, index) => (
                <View key={index} style={styles.nextStepItem}>
                  <View style={styles.nextStepIcon}>
                    <step.icon size={16} color="#000000" strokeWidth={2} />
                  </View>
                  <Text style={styles.nextStepText}>{step.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push(`/event/${event.id}`)}
            >
              <Text style={styles.secondaryButtonText}>Back to Event</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <LinearGradient
                colors={['#3491ff', '#0062ff']}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Explore More Events</Text>
                <ArrowRight size={16} color="#000000" strokeWidth={2} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Additional Actions */}
          <View style={styles.additionalActions}>
            <TouchableOpacity
              style={styles.additionalAction}
              onPress={() => {
                // Add to calendar functionality
              }}
            >
              <Calendar size={20} color={colors.primary} strokeWidth={2} />
              <Text style={styles.additionalActionText}>Add to Calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.additionalAction}
              onPress={() => {
                // Share functionality
              }}
            >
              <ArrowRight
                size={20}
                color={colors.primary}
                strokeWidth={2}
                style={{ transform: [{ rotate: '-45deg' }] }}
              />
              <Text style={styles.additionalActionText}>Share Event</Text>
            </TouchableOpacity>
          </View>

          {/* Registration Summary */}
          {registrationData && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Registration Summary</Text>
              <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Ticket Type:</Text>
                  <Text style={styles.summaryValue}>{registrationData.ticket?.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Attendees:</Text>
                  <Text style={styles.summaryValue}>
                    {registrationData.attendees?.length} {registrationData.attendees?.length === 1 ? 'person' : 'people'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Amount:</Text>
                  <Text style={styles.summaryValue}>
                    {registrationData.total === 0 ? 'Free' : `₹${registrationData.total}`}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
}

