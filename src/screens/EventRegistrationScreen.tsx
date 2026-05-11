import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { 
  ArrowLeft, 
  Minus, 
  Plus, 
  CheckCircle,
  CreditCard,
  Smartphone,
  Building2,
  Users,
  Clock
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import RegistrationTimer from '../components/RegistrationTimer';
import StepIndicator from '../components/StepIndicator';
import AttendeeForm from '../components/AttendeeForm';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getEventById, Event } from '../lib/api/events';

type TicketType = 'individual' | 'group';
type PricingModel = 'perPerson' | 'perGroup';
type StepType = 'ticket' | 'details' | 'review' | 'payment';

interface TicketOption {
  id: string;
  name: string;
  type: TicketType;
  pricingModel: PricingModel;
  price: number;
  maxQuantity: number;
  description?: string;
}

interface AttendeeInfo {
  name: string;
  email: string;
  mobile: string;
  gender: string;
}

const REGISTRATION_TIME_LIMIT = 15 * 60; // 15 minutes in seconds

export default function EventRegistrationScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { eventId } = route.params;
  
  // Event state
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await getEventById(eventId);
        setEvent(eventData);
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [eventId]);
  
  // Timer state
  const [timerExpired, setTimerExpired] = useState(false);

  // Registration flow state
  const [step, setStep] = useState<StepType>('ticket');

  // Ticket selection
  const [selectedTicket, setSelectedTicket] = useState<TicketOption | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Attendee details
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([{
    name: '',
    email: '',
    mobile: '',
    gender: '',
  }]);

  // Mock ticket options
  const ticketOptions: TicketOption[] = event ? [
    {
      id: 'standard-individual',
      name: 'Standard Individual',
      type: 'individual',
      pricingModel: 'perPerson',
      price: event.price || 0,
      maxQuantity: 5,
      description: 'Single attendee registration'
    },
    {
      id: 'group-ticket',
      name: 'Group Registration',
      type: 'group',
      pricingModel: 'perPerson',
      price: event.price || 0,
      maxQuantity: 50,
      description: 'Register multiple people together (5-50 people)'
    },
  ] : [];
  
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
          onPress: () => navigation.goBack(),
        },
      ],
      { cancelable: true }
    );
  };

  // Handle ticket selection
  const handleTicketSelect = (ticket: TicketOption) => {
    setSelectedTicket(ticket);

    if (ticket.type === 'group') {
      const initialGroupSize = 5;
      setQuantity(initialGroupSize);
      setAttendees(Array(initialGroupSize).fill(null).map(() => ({
        name: '',
        email: '',
        mobile: '',
        gender: '',
      })));
    } else {
      setQuantity(1);
      setAttendees([{
        name: '',
        email: '',
        mobile: '',
        gender: '',
      }]);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (!selectedTicket) return;

    if (selectedTicket.type === 'group' && newQuantity < 5) {
      return;
    }

    setQuantity(newQuantity);
    const newAttendees = Array(newQuantity).fill(null).map((_, i) =>
      attendees[i] || {
        name: '',
        email: '',
        mobile: '',
        gender: '',
      }
    );
    setAttendees(newAttendees);
  };

  // Handle attendee info change
  const handleAttendeeChange = (index: number, field: keyof AttendeeInfo, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };

  // Validate attendee info
  const validateAttendees = () => {
    return attendees.every(attendee =>
      attendee.name.trim() !== '' &&
      attendee.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email) &&
      attendee.mobile.trim() !== '' &&
      /^[0-9]{10}$/.test(attendee.mobile) &&
      attendee.gender !== ''
    );
  };

  // Calculate total price
  const calculateTotal = () => {
    if (!selectedTicket) return 0;

    if (selectedTicket.pricingModel === 'perPerson') {
      return selectedTicket.price * quantity;
    } else {
      return selectedTicket.price;
    }
  };

  // Handle step navigation
  const goToNextStep = () => {
    if (step === 'ticket' && selectedTicket) {
      setStep('details');
    } else if (step === 'details' && validateAttendees()) {
      setStep('review');
    } else if (step === 'review') {
      setStep('payment');
    }
  };

  const goToPreviousStep = () => {
    if (step === 'details') setStep('ticket');
    else if (step === 'review') setStep('details');
    else if (step === 'payment') setStep('review');
  };

  const handleSubmit = () => {
    const registrationData = {
      event: event.id,
      ticket: selectedTicket,
      quantity,
      attendees,
      total: calculateTotal(),
    };

    
    // Navigate to success screen and reset navigation stack
    navigation.reset({
      index: 0,
      routes: [
        { name: 'MainApp' as never },
        { 
          name: 'RegistrationSuccess' as never, 
          params: { eventId: event.id, registrationData } as never 
        }
      ],
    });
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventSubtitle}>Event Registration</Text>
          <GradientText style={styles.eventTitle}>{event.title}</GradientText>
          <Text style={styles.eventDetails}>
            {new Date(event.start_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })} · {event.location || event.city || 'TBA'}
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
              <View style={styles.ticketOptions}>
                {ticketOptions.map((ticket) => (
                  <TouchableOpacity
                    key={ticket.id}
                    style={[
                      styles.ticketOption,
                      selectedTicket?.id === ticket.id && styles.ticketOptionSelected,
                    ]}
                    onPress={() => handleTicketSelect(ticket)}
                  >
                    <View style={styles.ticketOptionContent}>
                      <View style={styles.ticketOptionHeader}>
                        <View style={styles.ticketOptionInfo}>
                          <Text style={styles.ticketOptionName}>{ticket.name}</Text>
                          <Text style={styles.ticketOptionDescription}>{ticket.description}</Text>
                        </View>
                        <View
                          style={[
                            styles.radioButton,
                            selectedTicket?.id === ticket.id && styles.radioButtonSelected,
                          ]}
                        >
                          {selectedTicket?.id === ticket.id && (
                            <View style={styles.radioButtonInner} />
                          )}
                        </View>
                      </View>
                      <View style={styles.ticketOptionPrice}>
                        <Text style={styles.priceText}>
                          {ticket.price === 0 ? 'Free' : `₹${ticket.price}`}
                        </Text>
                        {ticket.pricingModel === 'perPerson' && ticket.type === 'individual' && (
                          <Text style={styles.priceSubtext}>per person</Text>
                        )}
                        {ticket.pricingModel === 'perGroup' && (
                          <Text style={styles.priceSubtext}>per group</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

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
                        quantity <= (selectedTicket.type === 'group' ? 5 : 1) && styles.quantityButtonDisabled,
                      ]}
                      onPress={() => handleQuantityChange(Math.max(selectedTicket.type === 'group' ? 5 : 1, quantity - 1))}
                      disabled={quantity <= (selectedTicket.type === 'group' ? 5 : 1)}
                    >
                      <Minus size={20} color={colors.text} strokeWidth={2} />
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{quantity}</Text>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        quantity >= selectedTicket.maxQuantity && styles.quantityButtonDisabled,
                      ]}
                      onPress={() => handleQuantityChange(Math.min(selectedTicket.maxQuantity, quantity + 1))}
                      disabled={quantity >= selectedTicket.maxQuantity}
                    >
                      <Plus size={20} color={colors.text} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.quantityHint}>
                    {selectedTicket.type === 'group' ? 'Min: 5, Max: 50' : `Max: ${selectedTicket.maxQuantity}`}
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

              {attendees.map((attendee, index) => (
                <AttendeeForm
                  key={index}
                  attendee={attendee}
                  index={index}
                  onChange={handleAttendeeChange}
                  showTitle={attendees.length > 1}
                />
              ))}
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
                    {new Date(event.start_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Location:</Text>
                  <Text style={styles.reviewValue}>{event.location || event.city || 'TBA'}</Text>
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
                {attendees.map((attendee, index) => (
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
                    </View>
                  </View>
                ))}
              </View>

              {/* Total */}
              <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>
                    {calculateTotal() === 0 ? 'Free' : `₹${calculateTotal()}`}
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
                  <View style={styles.paymentAmount}>
                    <View style={styles.paymentAmountRow}>
                      <Text style={styles.paymentAmountLabel}>Amount to Pay</Text>
                      <Text style={styles.paymentAmountValue}>₹{calculateTotal()}</Text>
                    </View>
                  </View>

                  <View style={styles.paymentMethods}>
                    <Text style={styles.paymentMethodsTitle}>Select Payment Method</Text>

                    {[
                      { id: 'upi', name: 'UPI', icon: Smartphone },
                      { id: 'card', name: 'Card', icon: CreditCard },
                      { id: 'netbanking', name: 'Net Banking', icon: Building2 },
                    ].map((method) => (
                      <TouchableOpacity key={method.id} style={styles.paymentMethod}>
                        <View style={styles.paymentMethodContent}>
                          <method.icon size={20} color={colors.text} strokeWidth={2} />
                          <Text style={styles.paymentMethodName}>{method.name}</Text>
                        </View>
                        <ArrowLeft
                          size={16}
                          color={colors.textMuted}
                          strokeWidth={2}
                          style={{ transform: [{ rotate: '180deg' }] }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
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
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <LinearGradient
              colors={['#3491ff', '#0062ff']}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>
                {calculateTotal() === 0 ? 'Confirm Registration' : 'Proceed to Payment'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepNumber: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.textMuted,
  },
  stepNumberActive: {
    color: '#000000',
  },
  stepNumberCompleted: {
    color: colors.text,
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
    fontSize: typography.fontSize['2xl'],
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
  attendeeCount: {
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
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
    fontSize: typography.fontSize['2xl'],
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
  submitButtonGradient: {
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[3],
  },
  submitButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
});