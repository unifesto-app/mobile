import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Minus, 
  Plus, 
  CheckCircle,
  CreditCard,
  Smartphone,
  Building2,
  Clock
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import RegistrationTimer from '../components/RegistrationTimer';
import StepIndicator from '../components/StepIndicator';
import AttendeeForm from '../components/AttendeeForm';
import RazorpayWebView from '../components/RazorpayWebView';
import { verifyPayment, createRegistration } from '../lib/api/registrations';
import { getWallet } from '../lib/api/wallet';
import { spacing, typography, borderRadius } from '../theme';
import { getEventById, getEventBySlug, Event } from '../lib/api/events';
import { getEventTickets, getEventCustomFields, getFieldsForTicket, Ticket, CustomField, calculateTicketPrice, isTicketAvailable } from '../lib/api/tickets';
import CustomFieldInput from '../components/CustomFieldInput';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useRegistrationPayment } from '../hooks/useRegistrationPayment';

type StepType = 'ticket' | 'details' | 'review' | 'payment';

interface AttendeeInfo {
  name: string;
  email: string;
  mobile: string;
  gender: string;
  customFields?: Record<string, any>; // Custom field answers
}

const REGISTRATION_TIME_LIMIT = 15 * 60; // 15 minutes in seconds

export default function EventRegistrationScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  
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
  // Expired State
  expiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  expiredIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  expiredTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  expiredText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  backButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  backButtonGradient: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  backButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[12],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
  },
  // Timer
  timerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  timerLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  timerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  timerWarning: {
    color: colors.error,
  },
  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  statusDotWarning: {
    backgroundColor: colors.error,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  // Content
  scrollView: {
    flex: 1,
  },
  eventInfo: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
  },
  eventSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase',
    marginBottom: spacing[2],
  },
  eventTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[3],
  },
  eventDetails: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    paddingHorizontal: spacing[6],
    marginBottom: spacing[8],
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepContent: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: 'rgba(52, 145, 255, 0.2)',
    borderColor: colors.primary,
  },
  stepNumber: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.textMuted,
  },
  stepNumberActive: {
    color: '#000000',
  },
  stepNumberCompleted: {
    color: colors.primary,
  },
  stepLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  stepConnector: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  stepConnectorCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  // Step Content
  stepContentContainer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[6],
  },
  // Ticket Selection
  ticketOptions: {
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  ticketOption: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing[5],
  },
  ticketOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(52, 145, 255, 0.05)',
  },
  ticketOptionContent: {
    gap: spacing[3],
  },
  ticketOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ticketOptionInfo: {
    flex: 1,
  },
  ticketOptionName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[1],
  },
  ticketOptionDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  ticketOptionPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[2],
  },
  priceText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  priceSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  // Quantity Selector
  quantityContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing[5],
  },
  quantityLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing[4],
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.3,
  },
  quantityValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    minWidth: 64,
    textAlign: 'center',
  },
  quantityHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  // Attendee Details
  attendeeForm: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing[5],
    marginBottom: spacing[6],
  },
  attendeeNumber: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing[5],
  },
  formRow: {
    marginBottom: spacing[4],
  },
  formField: {
    flex: 1,
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing[2],
  },
  required: {
    color: colors.error,
  },
  formInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  genderOption: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  genderOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(52, 145, 255, 0.05)',
  },
  genderOptionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.textSecondary,
  },
  genderOptionTextSelected: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  // Review
  reviewSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  reviewSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing[3],
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  reviewLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  reviewValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  attendeeReview: {
    paddingBottom: spacing[4],
    marginBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  attendeeReviewTitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing[2],
  },
  attendeeReviewGrid: {
    gap: spacing[2],
  },
  attendeeReviewItem: {
    flexDirection: 'row',
  },
  attendeeReviewLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    width: 80,
  },
  attendeeReviewValue: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    flex: 1,
  },
  totalSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing[4],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  // Payment
  freeEventContainer: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  freeEventIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  freeEventTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[2],
  },
  freeEventText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  paymentAmount: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  paymentAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentAmountLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  paymentAmountValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  paymentMethods: {
    gap: spacing[4],
  },
  paymentMethodsTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing[2],
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing[4],
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  paymentMethodName: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  // Navigation
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.borderMuted,
    backgroundColor: colors.background,
    gap: spacing[4],
  },
  backNavButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  backNavButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  navigationSpacer: {
    flex: 1,
  },
  nextButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    opacity: 0.3,
  },
  nextButtonGradient: {
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[3],
  },
  nextButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  submitButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[3],
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  // New styles for ticket updates
  emptyTickets: {
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyTicketsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  ticketOptionDisabled: {
    opacity: 0.5,
  },
  groupBadge: {
    backgroundColor: 'rgba(52, 145, 255, 0.15)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  groupBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  unavailableText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing[1],
    fontFamily: typography.fontFamily.bold,
  },
  lowStockText: {
    fontSize: typography.fontSize.xs,
    color: '#ff9800',
    marginTop: spacing[1],
    fontFamily: typography.fontFamily.bold,
  },
  radioButtonDisabled: {
    opacity: 0.3,
  },
  attendeeCount: {
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.primary,
  },
  loadingMoreText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
  },
  // Custom Fields
  customFieldsSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing[5],
    marginBottom: spacing[6],
  },
  customFieldsTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing[4],
  },
});

  const router = useRouter();
  const params = useLocalSearchParams<{ eventId: string }>();
  const eventId = params.eventId;
  
  // Event state
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load event data and tickets
  useEffect(() => {
    const loadEventData = async () => {
      try {
        setLoading(true);
        const [eventData, fieldsData] = await Promise.all([
          getEventBySlug(eventId).catch(() => getEventById(eventId)),
          getEventCustomFields(eventId).catch(() => ({ fields: [] })),
        ]);
        
        setEvent(eventData);
        // Use ticketTypes from event data directly
        if (eventData?.ticketTypes && eventData.ticketTypes.length > 0) {
          setTickets((eventData.ticketTypes.map((tt: any) => ({
            id: tt.id,
            event_id: eventData.id,
            name: tt.name,
            description: tt.description || '',
            type: 'individual',
            price_type: 'per_person',
            price: parseFloat(tt.price) || 0,
            currency: tt.currency || 'INR',
            allow_partial_group: false,
            require_all_member_details: false,
            group_leader_required: false,
            quantity_available: (tt.totalQuantity || 0) - (tt.soldCount || 0),
            quantity_sold: tt.soldCount || 0,
            min_purchase: 1,
            max_purchase: tt.perUserLimit || 10,
            visibility: 'public',
            display_order: tt.order || 0,
          }))) as any);
        }
        setCustomFields(fieldsData.fields || []);
      } catch (error) {
        console.error('Error loading event data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEventData();
  }, [eventId]);
  
  // Timer state
  const [timerExpired, setTimerExpired] = useState(false);

  // Registration flow state
  const [step, setStep] = useState<StepType>('ticket');

  // Ticket selection
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Attendee details
  const [walletBalance, setWalletBalance] = useState(0);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [razorpayVisible, setRazorpayVisible] = useState(false);
  const [razorpayOptions, setRazorpayOptions] = useState<any>(null);
  const [pendingRegistrationId, setPendingRegistrationId] = useState<string>('');
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([{
    name: '',
    email: '',
    mobile: '',
    gender: '',
    customFields: {},
  }]);

  // Payment hook
  const { processRegistration, loading: paymentLoading, error: paymentError } = useRegistrationPayment();

  const CURRENCY_SYMBOLS: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        {/* Header Skeleton */}
        <View style={styles.header}>
          <View style={[styles.headerBackButton, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]} />
          <View style={{ width: 150, height: 20, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 4 }} />
        </View>

        {/* Timer Skeleton */}
        <View style={[styles.timerContainer, { paddingVertical: spacing[3] }]}>
          <View style={{ width: '100%', height: 20, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 4 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Event Info Skeleton */}
          <View style={styles.eventInfo}>
            <View style={{ width: 120, height: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 4, marginBottom: spacing[2] }} />
            <View style={{ width: '80%', height: 32, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 4, marginBottom: spacing[3] }} />
            <View style={{ width: 180, height: 14, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 4 }} />
          </View>

          {/* Step Indicator Skeleton */}
          <View style={styles.stepIndicator}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.stepItem}>
                <View style={styles.stepContent}>
                  <View style={[styles.stepCircle, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]} />
                  <View style={{ width: 60, height: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 4 }} />
                </View>
              </View>
            ))}
          </View>

          {/* Content Skeleton */}
          <View style={styles.stepContentContainer}>
            <View style={{ width: 150, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 4, marginBottom: spacing[6] }} />
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: borderRadius.xl,
                  padding: spacing[5],
                  marginBottom: spacing[4],
                  height: 120,
                }}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }
  
  if (!event) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  if (tickets.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: spacing[6] }]}>
        <Text style={styles.errorText}>No tickets available</Text>
        <Text style={[styles.errorText, { fontSize: typography.fontSize.sm, marginTop: spacing[2] }]}>
          This event doesn't have any tickets configured yet.
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { marginTop: spacing[6] }]}
          onPress={() => router.back()}
        >
          <LinearGradient
            colors={['#3491ff', '#0062ff']}
            style={styles.backButtonGradient}
          >
            <Text style={styles.backButtonText}>Back to Event</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle back button press with confirmation
  const handleBackPress = () => {
    Alert.alert(
      'Cancel Registration?',
      'Are you sure you want to cancel? Your progress will be lost.',
      [
        {
          text: 'Continue Registration',
          style: 'cancel',
        },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ],
      { cancelable: true }
    );
  };

  // Handle ticket selection
  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);

    if (ticket.type === 'group') {
      const initialGroupSize = ticket.group_size || 5;
      setQuantity(initialGroupSize);
      setAttendees(Array(initialGroupSize).fill(null).map(() => ({
        name: '',
        email: '',
        mobile: '',
        gender: '',
        customFields: {},
      })));
    } else {
      setQuantity(1);
      setAttendees([{
        name: '',
        email: '',
        mobile: '',
        gender: '',
        customFields: {},
      }]);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (!selectedTicket) return;

    const minQty = selectedTicket.type === 'group' ? (selectedTicket.group_size || 5) : selectedTicket.min_purchase;
    const maxQty = Math.min(
      selectedTicket.max_purchase,
      selectedTicket.quantity_available - selectedTicket.quantity_sold
    );

    if (newQuantity < minQty || newQuantity > maxQty) {
      return;
    }

    setQuantity(newQuantity);
    const newAttendees = Array(newQuantity).fill(null).map((_, i) =>
      attendees[i] || {
        name: '',
        email: '',
        mobile: '',
        gender: '',
        customFields: {},
      }
    );
    setAttendees(newAttendees);
  };

  // Handle attendee info change
  const fillFromProfile = (index: number) => {
    if (!user) return;
    const newAttendees = [...attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      name: user.fullName || '',
      email: (user as any).email || '',
      mobile: (user.mobileNumber || '').replace(/^\+91/, '').replace(/^\+/, ''),
    };
    setAttendees(newAttendees);
  };

  const handleAttendeeChange = (index: number, field: keyof AttendeeInfo, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };

  // Handle custom field change
  const handleCustomFieldChange = (attendeeIndex: number, fieldId: string, value: any) => {
    const newAttendees = [...attendees];
    newAttendees[attendeeIndex] = {
      ...newAttendees[attendeeIndex],
      customFields: {
        ...newAttendees[attendeeIndex].customFields,
        [fieldId]: value,
      },
    };
    setAttendees(newAttendees);
  };

  // Validate attendee info
  const validateAttendees = () => {
    if (!selectedTicket) return false;

    // Get applicable custom fields for this ticket
    const applicableFields = getFieldsForTicket(customFields, selectedTicket.id);

    return attendees.every(attendee => {
      // Validate basic fields
      const basicValid =
        attendee.name.trim() !== '' &&
        attendee.email.trim() !== '' &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email) &&
        attendee.mobile.trim() !== '' &&
        /^[0-9]{10}$/.test(attendee.mobile) &&
        attendee.gender !== '';

      if (!basicValid) return false;

      // Validate required custom fields
      const customFieldsValid = applicableFields
        .filter(field => field.is_required)
        .every(field => {
          const value = attendee.customFields?.[field.id];
          if (field.field_type === 'checkbox') {
            return value === true;
          }
          if (field.field_type === 'multi_select') {
            return Array.isArray(value) && value.length > 0;
          }
          return value !== undefined && value !== null && value !== '';
        });

      return customFieldsValid;
    });
  };

  // Calculate total price
  const calculateTotal = () => {
    if (!selectedTicket) return 0;
    const base = calculateTicketPrice(selectedTicket, quantity);
    if (base === 0) return 0;
    return Math.round(base * 1.04 * 100) / 100;
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    if (!selectedTicket) return '₹';
    return CURRENCY_SYMBOLS[selectedTicket.currency] || selectedTicket.currency;
  };

  // Handle step navigation
  const isFreeTicket = (ticket: Ticket | null) => !ticket || ticket.price === 0;

  const goToNextStep = () => {
    if (step === 'ticket' && selectedTicket) {
      // Skip details and review for free tickets — go straight to payment
      if (isFreeTicket(selectedTicket)) {
        setStep('payment');
        getWallet().then(w => { if (w) setWalletBalance(w.balance); }).catch(() => {});
      } else {
        setStep('details');
      }
    } else if (step === 'details' && validateAttendees()) {
      setStep('review');
    } else if (step === 'review') {
      setStep('payment');
      getWallet().then(w => { if (w) setWalletBalance(w.balance); }).catch(() => {});
    }
  };

  const goToPreviousStep = () => {
    if (step === 'details') setStep('ticket');
    else if (step === 'review') setStep('details');
    else if (step === 'payment') setStep('review');
  };

  const handleSubmit = async () => {
    if (!selectedTicket || !event) return;
    try {
      setLoading(true);
      const finalAmount = Math.max(0, calculateTotal() - coinsToUse);
      const orderResponse = await createRegistration(event.id, {
        ticketTypeId: selectedTicket.id,
        quantity,
        coinsToUse: coinsToUse > 0 ? coinsToUse : undefined,
        formResponses: attendees[0] ? {
          name: attendees[0].name,
          email: attendees[0].email,
          mobile: attendees[0].mobile,
          gender: attendees[0].gender,
        } : undefined,
      });
      // Free ticket or fully covered by coins — go to success
      if (!orderResponse.razorpayOrderId || finalAmount === 0) {
        navigateToSuccess();
        return;
      }
      // Paid ticket — show Razorpay
      setPendingRegistrationId(orderResponse.registrationId || '');
      setRazorpayOptions({
        orderId: orderResponse.razorpayOrderId,
        amount: orderResponse.amount,
        currency: orderResponse.currency || 'INR',
        name: 'Unifesto',
        description: event.title,
        image: event.coverImageUrl || undefined,
        prefill: {
          name: attendees[0]?.name || user?.fullName || '',
          email: attendees[0]?.email || '',
          contact: attendees[0]?.mobile || user?.mobileNumber || '',
        },
        keyId: orderResponse.razorpayKeyId,
      });
      setRazorpayVisible(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Error', error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };


  const navigateToSuccess = () => {
    router.replace({
      pathname: '/registration-success',
      params: {
        eventId: event?.id || '',
        eventTitle: event?.title || '',
        ticketName: selectedTicket?.name || '',
        quantity: quantity.toString(),
        total: calculateTotal().toString(),
        currency: getCurrencySymbol(),
      }
    });
  };

  const handlePaymentSuccess = async (paymentResponse: any) => {
    setRazorpayVisible(false);
    try {
      await verifyPayment(event?.id || '', {
        registrationId: pendingRegistrationId,
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature,
      });
      navigateToSuccess();
    } catch (error: any) {
      Alert.alert('Payment Verification Failed', error?.message || 'Please contact support');
    }
  };

  if (timerExpired) {
    return (
      <View style={styles.container}>
        <View style={styles.expiredContainer}>
          <View style={styles.expiredIcon}>
            <Clock size={32} color={colors.error} strokeWidth={2} />
          </View>
          <Text style={styles.expiredTitle}>Registration Time Expired</Text>
          <Text style={styles.expiredText}>
            Your registration session has expired. Please start a new registration.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <LinearGradient
              colors={['#3491ff', '#0062ff']}
              style={styles.backButtonGradient}
            >
              <Text style={styles.backButtonText}>Back to Event</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={handleBackPress}
        >
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Registration</Text>
      </View>

      {/* Timer Bar */}
      <RegistrationTimer
        initialSeconds={REGISTRATION_TIME_LIMIT}
        onExpire={() => setTimerExpired(true)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventSubtitle}>Event Registration</Text>
          <GradientText style={styles.eventTitle}>{event.title}</GradientText>
          <Text style={styles.eventDetails}>
            {new Date(event.startDateTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })} · {event.venueName || event.city || 'TBA'}
          </Text>
        </View>

        {/* Step Indicator */}
        <StepIndicator
          steps={[
            { id: 'ticket', label: 'Select Ticket' },
            { id: 'details', label: 'Attendee Details' },
            { id: 'review', label: 'Review' },
            { id: 'payment', label: 'Payment' },
          ]}
          currentStep={
            step === 'ticket' ? 1 :
            step === 'details' ? 2 :
            step === 'review' ? 3 :
            step === 'payment' ? 4 : 1
          }
        />

        {/* Step Content */}
        <View style={styles.stepContentContainer}>
          {/* Step 1: Ticket Selection */}
          {step === 'ticket' && (
            <View>
              <Text style={styles.sectionTitle}>Select Your Ticket</Text>
              {tickets.length === 0 ? (
                <View style={styles.emptyTickets}>
                  <Text style={styles.emptyTicketsText}>No tickets available for this event</Text>
                </View>
              ) : (
                <View style={styles.ticketOptions}>
                  {tickets.map((ticket) => {
                    const available = isTicketAvailable(ticket);
                    const spotsLeft = ticket.quantity_available - ticket.quantity_sold;
                    const currencySymbol = CURRENCY_SYMBOLS[ticket.currency] || ticket.currency;
                    
                    return (
                      <TouchableOpacity
                        key={ticket.id}
                        style={[
                          styles.ticketOption,
                          selectedTicket?.id === ticket.id && styles.ticketOptionSelected,
                          !available && styles.ticketOptionDisabled,
                        ]}
                        onPress={() => available && handleTicketSelect(ticket)}
                        disabled={!available}
                      >
                        <View style={styles.ticketOptionContent}>
                          <View style={styles.ticketOptionHeader}>
                            <View style={styles.ticketOptionInfo}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
                                <Text style={styles.ticketOptionName}>{ticket.name}</Text>
                                {ticket.type === 'group' && (
                                  <View style={styles.groupBadge}>
                                    <Text style={styles.groupBadgeText}>Group</Text>
                                  </View>
                                )}
                              </View>
                              {ticket.description && (
                                <Text style={styles.ticketOptionDescription}>{ticket.description}</Text>
                              )}
                              {!available && (
                                <Text style={styles.unavailableText}>
                                  {spotsLeft === 0 ? 'Sold Out' : 'Not Available'}
                                </Text>
                              )}
                              {available && spotsLeft <= 10 && (
                                <Text style={styles.lowStockText}>
                                  Only {spotsLeft} left!
                                </Text>
                              )}
                            </View>
                            <View
                              style={[
                                styles.radioButton,
                                selectedTicket?.id === ticket.id && styles.radioButtonSelected,
                                !available && styles.radioButtonDisabled,
                              ]}
                            >
                              {selectedTicket?.id === ticket.id && (
                                <View style={styles.radioButtonInner} />
                              )}
                            </View>
                          </View>
                          <View style={styles.ticketOptionPrice}>
                            <Text style={styles.priceText}>
                              {ticket.price === 0 ? 'Free' : `${currencySymbol}${ticket.price}`}
                            </Text>
                            {ticket.price_type === 'per_person' && (
                              <Text style={styles.priceSubtext}>per person</Text>
                            )}
                            {ticket.price_type === 'per_group' && (
                              <Text style={styles.priceSubtext}>per group</Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Quantity Selector */}
              {selectedTicket && (
                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityLabel}>
                    {selectedTicket.type === 'group' ? 'Number of Attendees' : 'Number of Tickets'}
                  </Text>
                  <View style={styles.quantitySelector}>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        quantity <= (selectedTicket.type === 'group' ? (selectedTicket.group_size || 5) : selectedTicket.min_purchase) && styles.quantityButtonDisabled,
                      ]}
                      onPress={() => {
                        const minQty = selectedTicket.type === 'group' ? (selectedTicket.group_size || 5) : selectedTicket.min_purchase;
                        handleQuantityChange(Math.max(minQty, quantity - 1));
                      }}
                      disabled={quantity <= (selectedTicket.type === 'group' ? (selectedTicket.group_size || 5) : selectedTicket.min_purchase)}
                    >
                      <Minus size={20} color={colors.text} strokeWidth={2} />
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{quantity}</Text>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        quantity >= Math.min(selectedTicket.max_purchase, selectedTicket.quantity_available - selectedTicket.quantity_sold) && styles.quantityButtonDisabled,
                      ]}
                      onPress={() => {
                        const maxQty = Math.min(selectedTicket.max_purchase, selectedTicket.quantity_available - selectedTicket.quantity_sold);
                        handleQuantityChange(Math.min(maxQty, quantity + 1));
                      }}
                      disabled={quantity >= Math.min(selectedTicket.max_purchase, selectedTicket.quantity_available - selectedTicket.quantity_sold)}
                    >
                      <Plus size={20} color={colors.text} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.quantityHint}>
                    {selectedTicket.type === 'group' 
                      ? `Min: ${selectedTicket.group_size || 5}, Max: ${Math.min(selectedTicket.max_purchase, selectedTicket.quantity_available - selectedTicket.quantity_sold)}`
                      : `Min: ${selectedTicket.min_purchase}, Max: ${Math.min(selectedTicket.max_purchase, selectedTicket.quantity_available - selectedTicket.quantity_sold)}`
                    }
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Step 2: Attendee Details */}
          {step === 'details' && (
            <View>
              <Text style={styles.sectionTitle}>
                Attendee Information
                {attendees.length > 1 && (
                  <Text style={styles.attendeeCount}> ({attendees.length} people)</Text>
                )}
              </Text>

              {attendees.map((attendee, index) => {
                // Get custom fields applicable to the selected ticket
                const applicableFields = selectedTicket 
                  ? getFieldsForTicket(customFields, selectedTicket.id)
                  : [];

                return (
                  <View key={index}>
                    <AttendeeForm
                      attendee={attendee}
                      index={index}
                      onChange={handleAttendeeChange}
                onFillFromProfile={() => fillFromProfile(index)}
                      showTitle={attendees.length > 1}
                    />

                    {/* Custom Fields */}
                    {applicableFields.length > 0 && (
                      <View style={styles.customFieldsSection}>
                        <Text style={styles.customFieldsTitle}>Additional Information</Text>
                        {applicableFields.map((field) => (
                          <CustomFieldInput
                            key={field.id}
                            field={field}
                            value={attendee.customFields?.[field.id]}
                            onChange={(value) => handleCustomFieldChange(index, field.id, value)}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <View>
              <Text style={styles.sectionTitle}>Review Your Registration</Text>

              {/* Event Details */}
              <View style={styles.reviewSection}>
                <Text style={styles.reviewSectionTitle}>Event Details</Text>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Event:</Text>
                  <Text style={styles.reviewValue}>{event.title}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Date:</Text>
                  <Text style={styles.reviewValue}>
                    {new Date(event.startDateTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Location:</Text>
                  <Text style={styles.reviewValue}>{event.venueName || event.city || 'TBA'}</Text>
                </View>
              </View>

              {/* Ticket Details */}
              <View style={styles.reviewSection}>
                <Text style={styles.reviewSectionTitle}>Ticket Details</Text>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Ticket Type:</Text>
                  <Text style={styles.reviewValue}>{selectedTicket?.name}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Quantity:</Text>
                  <Text style={styles.reviewValue}>{quantity} {quantity === 1 ? 'ticket' : 'tickets'}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Attendees:</Text>
                  <Text style={styles.reviewValue}>{attendees.length} {attendees.length === 1 ? 'person' : 'people'}</Text>
                </View>
              </View>

              {/* Attendee List */}
              <View style={styles.reviewSection}>
                <Text style={styles.reviewSectionTitle}>Attendee Information</Text>
                {attendees.map((attendee, index) => {
                  // Get custom fields for display
                  const applicableFields = selectedTicket 
                    ? getFieldsForTicket(customFields, selectedTicket.id)
                    : [];

                  return (
                    <View key={index} style={styles.attendeeReview}>
                      <Text style={styles.attendeeReviewTitle}>Attendee {index + 1}</Text>
                      <View style={styles.attendeeReviewGrid}>
                        <View style={styles.attendeeReviewItem}>
                          <Text style={styles.attendeeReviewLabel}>Name:</Text>
                          <Text style={styles.attendeeReviewValue}>{attendee.name}</Text>
                        </View>
                        <View style={styles.attendeeReviewItem}>
                          <Text style={styles.attendeeReviewLabel}>Email:</Text>
                          <Text style={styles.attendeeReviewValue}>{attendee.email}</Text>
                        </View>
                        <View style={styles.attendeeReviewItem}>
                          <Text style={styles.attendeeReviewLabel}>Mobile:</Text>
                          <Text style={styles.attendeeReviewValue}>{attendee.mobile}</Text>
                        </View>
                        <View style={styles.attendeeReviewItem}>
                          <Text style={styles.attendeeReviewLabel}>Gender:</Text>
                          <Text style={styles.attendeeReviewValue}>{attendee.gender}</Text>
                        </View>

                        {/* Custom Fields */}
                        {applicableFields.map((field) => {
                          const value = attendee.customFields?.[field.id];
                          let displayValue = value;

                          // Format display value based on field type
                          if (field.field_type === 'checkbox') {
                            displayValue = value ? 'Yes' : 'No';
                          } else if (field.field_type === 'multi_select' && Array.isArray(value)) {
                            displayValue = value.join(', ');
                          } else if (field.field_type === 'dropdown' || field.field_type === 'radio') {
                            const option = field.options_json?.find(opt => opt.value === value);
                            displayValue = option?.label || value;
                          }

                          return (
                            <View key={field.id} style={styles.attendeeReviewItem}>
                              <Text style={styles.attendeeReviewLabel}>{field.label}:</Text>
                              <Text style={styles.attendeeReviewValue}>
                                {displayValue || '-'}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Total */}
              <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>
                    {calculateTotal() === 0 ? 'Free' : `${getCurrencySymbol()}${calculateTotal()}`}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Step 4: Payment */}
          {step === 'payment' && (
            <View>
              <Text style={styles.sectionTitle}>Payment</Text>

              {calculateTotal() === 0 ? (
                <View style={styles.freeEventContainer}>
                  <View style={styles.freeEventIcon}>
                    <CheckCircle size={32} color={colors.primary} strokeWidth={2} />
                  </View>
                  <Text style={styles.freeEventTitle}>Free Event</Text>
                  <Text style={styles.freeEventText}>
                    No payment required. Click confirm to complete your registration.
                  </Text>
                </View>
              ) : (
                <View>
                  {/* Price Breakdown */}
                  <View style={styles.paymentAmount}>
                    <View style={styles.paymentAmountRow}>
                      <Text style={styles.paymentAmountLabel}>Ticket Price</Text>
                      <Text style={styles.paymentAmountValue}>{getCurrencySymbol()}{(parseFloat(selectedTicket?.price as any || '0') * quantity).toFixed(2)}</Text>
                    </View>
                    <View style={styles.paymentAmountRow}>
                      <Text style={styles.paymentAmountLabel}>Processing Fee</Text>
                      <Text style={styles.paymentAmountValue}>{getCurrencySymbol()}{(parseFloat(selectedTicket?.price as any || '0') * quantity * 0.04).toFixed(2)}</Text>
                    </View>
                    {coinsToUse > 0 && (
                      <View style={styles.paymentAmountRow}>
                        <Text style={[styles.paymentAmountLabel, { color: colors.primary }]}>Coins Discount</Text>
                        <Text style={[styles.paymentAmountValue, { color: colors.primary }]}>-{getCurrencySymbol()}{coinsToUse.toFixed(2)}</Text>
                      </View>
                    )}
                    <View style={[styles.paymentAmountRow, { borderTopWidth: 1, borderTopColor: colors.borderMuted, paddingTop: 8, marginTop: 4 }]}>
                      <Text style={[styles.paymentAmountLabel, { fontWeight: '700' }]}>Total</Text>
                      <Text style={[styles.paymentAmountValue, { color: colors.primary, fontWeight: '700', fontSize: typography.fontSize.xl }]}>
                        {getCurrencySymbol()}{Math.max(0, calculateTotal() - coinsToUse).toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Wallet Coins */}
                  {walletBalance > 0 && (
                    <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginTop: 12, borderWidth: 1, borderColor: colors.borderMuted }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <View>
                          <Text style={{ color: colors.text, fontFamily: 'bold', fontSize: 14, fontWeight: '600' }}>Pocket Balance</Text>
                          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{walletBalance} coins available (1 coin = {getCurrencySymbol()}1)</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          {coinsToUse > 0 && (
                            <TouchableOpacity
                              onPress={() => setCoinsToUse(0)}
                              style={{ backgroundColor: colors.backgroundSecondary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}
                            >
                              <Text style={{ color: colors.error, fontSize: 12, fontWeight: '600' }}>Remove</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={() => setCoinsToUse(Math.min(walletBalance, Math.floor(calculateTotal())))}
                            style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}
                          >
                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                              {coinsToUse > 0 ? 'Max' : 'Apply'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      {coinsToUse > 0 && (
                        <Text style={{ color: colors.primary, fontSize: 12 }}>Saving {getCurrencySymbol()}{coinsToUse} with coins</Text>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {step !== 'ticket' && (
          <TouchableOpacity style={styles.backNavButton} onPress={goToPreviousStep}>
            <Text style={styles.backNavButtonText}>← Back</Text>
          </TouchableOpacity>
        )}

        <View style={styles.navigationSpacer} />

        {step !== 'payment' ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              ((step === 'ticket' && !selectedTicket) ||
                (step === 'details' && !validateAttendees())) &&
                styles.nextButtonDisabled,
            ]}
            onPress={goToNextStep}
            disabled={
              (step === 'ticket' && !selectedTicket) ||
              (step === 'details' && !validateAttendees())
            }
          >
            <LinearGradient
              colors={['#3491ff', '#0062ff']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>Continue →</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.submitButton, paymentLoading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={paymentLoading}
          >
            <LinearGradient
              colors={['#3491ff', '#0062ff']}
              style={styles.submitButtonGradient}
            >
              {paymentLoading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {calculateTotal() === 0 ? 'Confirm Registration' : 'Proceed to Payment'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
      </KeyboardAvoidingView>
      {razorpayOptions && (
        <RazorpayWebView
          visible={razorpayVisible}
          options={razorpayOptions}
          onSuccess={handlePaymentSuccess}
          onError={(e) => { setRazorpayVisible(false); Alert.alert('Payment Failed', e?.message || 'Payment failed'); }}
          onDismiss={() => setRazorpayVisible(false)}
        />
      )}
    </View>
  );
}
