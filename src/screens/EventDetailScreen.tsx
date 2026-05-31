import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Share,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Users, Tag, ChevronRight, ExternalLink, Share2, LogIn } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getEventById, isRegisteredForEvent, Event, getEventDisplayPrice } from '../lib/api/events';
import { getEventAdditionalInfo, AgendaItem, Speaker, Prize, Faq } from '../lib/api/additional-info';
import { getEventTickets, Ticket, formatEventPrice } from '../lib/api/tickets';
import { useAuth } from '../context/AuthContext';

type TabType = 'overview' | 'agenda' | 'speakers' | 'rewards' | 'faq';

interface EventDetailScreenProps {
  route: { params: { eventId: string } };
}

export default function EventDetailScreen({ route }: EventDetailScreenProps) {
  const router = useRouter();
  const { eventId } = route.params;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasShownLoginPrompt, setHasShownLoginPrompt] = useState(false);
  
  // Additional info state
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  
  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEventById(eventId);
        if (eventData) {
          setEvent(eventData);
          
          // Load tickets only if user is authenticated
          if (user) {
            const ticketsData = await getEventTickets(eventData.id);
            setTickets(ticketsData.tickets || []);
          }
          
          // Load additional info (public data)
          const additionalInfo = await getEventAdditionalInfo(eventData.id);
          setAgenda(additionalInfo.agenda);
          setSpeakers(additionalInfo.speakers);
          setPrizes(additionalInfo.prizes);
          setFaqs(additionalInfo.faqs);
          
          // Check if user is registered
          if (user) {
            const registered = await isRegisteredForEvent(eventId);
            setIsRegistered(registered);
          }
        }
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvent();
  }, [eventId, user]);

  // Show login modal automatically if user is not authenticated (only once)
  useEffect(() => {
    if (!loading && !user && !hasShownLoginPrompt) {
      // Small delay to ensure the screen is fully loaded
      const timer = setTimeout(() => {
        setShowLoginModal(true);
        setHasShownLoginPrompt(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loading, user, hasShownLoginPrompt]);
  
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0062ff" />
        <Text style={styles.loadingText}>Loading event...</Text>
      </View>
    );
  }
  
  if (!event) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const isFree = tickets.length === 0 || tickets.every(t => t.price === 0);
  const isCompleted = event.status === 'completed' || event.status === 'cancelled';
  const hasSpots = event.max_attendees ? event.max_attendees > 0 : true;
  const priceDisplay = formatEventPrice(tickets);

  const handleRegister = () => {
    if (!user) {
      // User is not authenticated, show sign-in prompt
      Alert.alert(
        'Sign In Required',
        'Please sign in to register for this event and access all features.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: () => setShowLoginModal(true),
          },
        ]
      );
    } else if (isRegistered) {
      // User is already registered
      Alert.alert(
        'Already Registered',
        'You are already registered for this event. Check your registrations for more details.',
        [{ text: 'OK' }]
      );
    } else if (!hasSpots) {
      // Event is sold out
      Alert.alert(
        'Event Full',
        'Sorry, this event has reached maximum capacity.',
        [{ text: 'OK' }]
      );
    } else {
      // User is authenticated, proceed to registration
      router.push({ pathname: '/event-registration', params: { eventId: event.id } });
    }
  };

  const handleShare = async () => {
    try {
      const eventUrl = `https://www.unifesto.app/events/${event.slug || event.id}`;
      
      const shareMessage = Platform.OS === 'ios'
        ? `Check out this event: ${event.title}\n\n📅 ${new Date(event.start_date).toLocaleDateString()}\n📍 ${event.location || event.city}\n${isFree ? '🎉 Free Event!' : `💰 ${priceDisplay}`}\n\nRegister now on Unifesto!`
        : `Check out this event: ${event.title}\n\n📅 ${new Date(event.start_date).toLocaleDateString()}\n📍 ${event.location || event.city}\n${isFree ? '🎉 Free Event!' : `💰 ${priceDisplay}`}\n\n${eventUrl}\n\nRegister now on Unifesto!`;
      
      const result = await Share.share({
        message: shareMessage,
        title: event.title,
        ...(Platform.OS === 'ios' && { url: eventUrl }),
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.descriptionText}>
              {event.description || event.short_description || 'Join us for an amazing event filled with learning, networking, and fun.'}
            </Text>
          </View>
        );

      case 'agenda':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Event Schedule</Text>
            {agenda.length > 0 ? (
              <View style={styles.agendaList}>
                {agenda.map((item) => (
                  <View key={item.id} style={styles.agendaItem}>
                    <View style={styles.agendaTimeContainer}>
                      <Clock size={16} color={colors.primary} strokeWidth={2} />
                      <Text style={styles.agendaTime}>
                        {new Date(item.start_time).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                        {item.end_time && ` - ${new Date(item.end_time).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}`}
                      </Text>
                    </View>
                    <View style={styles.agendaContent}>
                      <Text style={styles.agendaTitle}>{item.title}</Text>
                      {item.description && (
                        <Text style={styles.agendaDescription}>{item.description}</Text>
                      )}
                      {item.location && (
                        <View style={styles.agendaLocation}>
                          <MapPin size={12} color={colors.textMuted} strokeWidth={2} />
                          <Text style={styles.agendaLocationText}>{item.location}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Schedule will be announced soon</Text>
            )}
          </View>
        );

      case 'speakers':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Featured Speakers</Text>
            {speakers.length > 0 ? (
              <View style={styles.speakersList}>
                {speakers.map((speaker) => (
                  <View key={speaker.id} style={styles.speakerCard}>
                    {speaker.profile_image_url ? (
                      <Image
                        source={{ uri: speaker.profile_image_url }}
                        style={styles.speakerImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.speakerImagePlaceholder}>
                        <Text style={styles.speakerInitial}>
                          {speaker.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.speakerInfo}>
                      <Text style={styles.speakerName}>{speaker.name}</Text>
                      {speaker.title && (
                        <Text style={styles.speakerTitle}>{speaker.title}</Text>
                      )}
                      {speaker.bio && (
                        <Text style={styles.speakerBio} numberOfLines={3}>{speaker.bio}</Text>
                      )}
                      {speaker.is_featured && (
                        <View style={styles.featuredBadge}>
                          <Text style={styles.featuredText}>Featured Speaker</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Speakers will be announced soon</Text>
            )}
          </View>
        );

      case 'rewards':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Prizes & Incentives</Text>
            {prizes.length > 0 ? (
              <View style={styles.prizesList}>
                {prizes.map((prize) => (
                  <View key={prize.id} style={styles.prizeCard}>
                    <View style={styles.prizeIcon}>
                      <Text style={styles.prizeEmoji}>
                        {prize.position === 1 ? '🥇' : 
                         prize.position === 2 ? '🥈' : 
                         prize.position === 3 ? '🥉' : '🏆'}
                      </Text>
                    </View>
                    <View style={styles.prizeInfo}>
                      {prize.position && (
                        <Text style={styles.prizePosition}>
                          {prize.position === 1 ? '1st Place' : 
                           prize.position === 2 ? '2nd Place' : 
                           prize.position === 3 ? '3rd Place' : 
                           `#${prize.position}`}
                        </Text>
                      )}
                      <Text style={styles.prizeName}>{prize.name}</Text>
                      {prize.description && (
                        <Text style={styles.prizeDescription}>{prize.description}</Text>
                      )}
                      {prize.value && (
                        <Text style={styles.prizeValue}>{prize.value}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Rewards will be announced soon</Text>
            )}
          </View>
        );

      case 'faq':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqs.length > 0 ? (
              <View style={styles.faqList}>
                {faqs.map((faq) => (
                  <View key={faq.id} style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    {faq.category && (
                      <View style={styles.faqCategoryBadge}>
                        <Text style={styles.faqCategoryText}>{faq.category}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>FAQs will be announced soon</Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {event.banner_url || event.thumbnail_url || event.image_url ? (
            <Image
              source={{ uri: event.banner_url || event.thumbnail_url || event.image_url }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={['#3491ff', '#0062ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroImage}
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.9)']}
            style={styles.heroGradient}
          />
          
          {/* Share Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <View style={styles.shareButtonInner}>
              <Share2 size={20} color={colors.text} strokeWidth={2} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Organization Info */}
          {event.organization && (
            <TouchableOpacity
              style={styles.parentEventCard}
              onPress={() => router.push(`/organization/${event.organization_id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.parentEventContent}>
                <Text style={styles.parentEventLabel}>ORGANIZED BY</Text>
                <Text style={styles.parentEventTitle}>{event.organization.name}</Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          )}

          {/* Title & Category */}
          <View style={styles.titleSection}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            <GradientText style={styles.eventTitle}>{event.title}</GradientText>
            <Text style={styles.organizerText}>{event.organization?.name || 'Event Organizer'}</Text>
          </View>

          {/* Event Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Calendar size={20} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>
                  {new Date(event.start_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Clock size={20} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>
                  {new Date(event.start_date).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <MapPin size={20} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{event.location || event.venue || event.city || 'TBA'}</Text>
              </View>
            </View>

            {event.max_attendees && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Users size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Capacity</Text>
                  <Text style={styles.infoValue}>{event.max_attendees} attendees</Text>
                </View>
              </View>
            )}
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScroll}
            >
              {[
                { id: 'overview', label: 'Overview', show: true },
                { id: 'agenda', label: 'Agenda', show: agenda.length > 0 },
                { id: 'speakers', label: 'Speakers', show: speakers.length > 0 },
                { id: 'rewards', label: 'Prizes', show: prizes.length > 0 },
                { id: 'faq', label: 'FAQ', show: faqs.length > 0 },
              ].filter(tab => tab.show).map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    activeTab === tab.id && styles.tabActive,
                  ]}
                  onPress={() => setActiveTab(tab.id as TabType)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.id && styles.tabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tab Content */}
          {renderTabContent()}

          {/* Footer */}
          <Footer />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      {!isCompleted && (
        <View style={styles.bottomCTA}>
          <View style={styles.ctaInfo}>
            <Text style={styles.ctaLabel}>Price</Text>
            <Text style={styles.ctaPrice}>
              {priceDisplay}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.ctaButton} 
            activeOpacity={0.8}
            onPress={handleRegister}
          >
            <LinearGradient
              colors={['#3491ff', '#0062ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButtonGradient}
            >
              {!user && (
                <LogIn size={16} color={colors.text} strokeWidth={2} style={{ marginRight: spacing[2] }} />
              )}
              <Text style={styles.ctaButtonText}>
                {!user ? 'Sign In to Register' : isRegistered ? 'Already Registered' : isFree ? 'Register Free' : 'Register Now'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Login Modal */}
      <LoginModal 
        visible={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={async () => {
          setShowLoginModal(false);
          // Reload tickets after successful login
          if (event) {
            const ticketsData = await getEventTickets(event.id);
            setTickets(ticketsData.tickets || []);
            const registered = await isRegisteredForEvent(eventId);
            setIsRegistered(registered);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    textAlign: 'center',
  },
  backText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  heroContainer: {
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  shareButton: {
    position: 'absolute',
    top: spacing[6],
    right: spacing[6],
    zIndex: 10,
  },
  shareButtonInner: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.lg,
  },
  content: {
    padding: spacing[8],
    paddingBottom: 120,
  },
  titleSection: {
    marginBottom: spacing[8],
  },
  categoryBadge: {
    backgroundColor: 'rgba(52, 145, 255, 0.15)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  eventTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[3],
    lineHeight: typography.fontSize['3xl'] * 1.2,
  },
  organizerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[8],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: spacing[5],
    ...shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing[1],
    fontFamily: typography.fontFamily.bold,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  tabsContainer: {
    marginBottom: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  tabsScroll: {
    gap: spacing[1],
  },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.text,
  },
  tabContent: {
    gap: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[4],
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  scheduleItem: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  scheduleTime: {
    alignItems: 'center',
    width: 20,
  },
  scheduleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: spacing[1],
  },
  scheduleDotActive: {
    backgroundColor: colors.primary,
  },
  scheduleLine: {
    width: 1,
    flex: 1,
    backgroundColor: colors.borderMuted,
    marginTop: spacing[1],
  },
  scheduleContent: {
    flex: 1,
    paddingBottom: spacing[2],
  },
  scheduleTimeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing[1],
  },
  scheduleTitleText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing[1],
  },
  scheduleSpeakerText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  speakerCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: spacing[4],
  },
  speakerAvatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerAvatarText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.background,
  },
  speakerInfo: {
    flex: 1,
  },
  speakerName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[1],
  },
  speakerTitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  speakerOrg: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing[3],
  },
  speakerBio: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    overflow: 'hidden',
  },
  rewardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
  },
  rewardContent: {
    flex: 1,
    paddingLeft: spacing[4],
  },
  rewardPosition: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing[2],
  },
  rewardPrize: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[2],
  },
  rewardDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(52, 145, 255, 0.3)',
    paddingHorizontal: spacing[8],
    paddingBottom: spacing[6],
    paddingTop: spacing[4],
    gap: spacing[4],
  },
  ctaInfo: {
    flex: 1,
  },
  ctaLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing[1],
  },
  ctaPrice: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
  },
  ctaButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  ctaButtonText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  parentEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  parentEventContent: {
    flex: 1,
  },
  parentEventLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing[1],
  },
  parentEventTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[1],
  },
  parentEventDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  collaboratorsSection: {
    marginBottom: spacing[6],
  },
  collaboratorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  collaboratorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: spacing[2],
    maxWidth: '48%',
  },
  collaboratorAvatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collaboratorAvatarText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.background,
  },
  collaboratorName: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  urgencyBar: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: spacing[2],
  },
  urgencyText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  urgencyTextNormal: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  urgencyProgress: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  urgencyProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  urgencyDeadline: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  subEventsSection: {
    marginTop: spacing[6],
  },
  subEventCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    position: 'relative',
  },
  subEventHeader: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  subEventBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  subEventTime: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  subEventCategoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  subEventCategory: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.background,
  },
  subEventTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[1],
  },
  subEventOrganizer: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  subEventDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
    marginBottom: spacing[3],
  },
  subEventFooter: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  subEventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  subEventInfoText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  subEventChevron: {
    position: 'absolute',
    right: spacing[5],
    top: '50%',
    marginTop: -10,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing[8],
  },
  speakerSocial: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  socialText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bold,
  },
  // Agenda styles
  agendaList: {
    gap: spacing[3],
  },
  agendaItem: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: spacing[3],
  },
  agendaTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  agendaTime: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  agendaContent: {
    gap: spacing[2],
  },
  agendaTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  agendaDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  agendaLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  agendaLocationText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  // Speakers styles
  speakersList: {
    gap: spacing[4],
  },
  speakerImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
  },
  speakerImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerInitial: {
    fontSize: typography.fontSize.xl,
    color: colors.background,
    fontFamily: typography.fontFamily.bold,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    marginTop: spacing[2],
  },
  featuredText: {
    fontSize: typography.fontSize.xs,
    color: '#FFC107',
    fontFamily: typography.fontFamily.bold,
  },
  // Prizes styles
  prizesList: {
    gap: spacing[4],
  },
  prizeCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
    flexDirection: 'row',
    gap: spacing[4],
  },
  prizeIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prizeEmoji: {
    fontSize: 28,
  },
  prizeInfo: {
    flex: 1,
    gap: spacing[2],
  },
  prizePosition: {
    fontSize: typography.fontSize.xs,
    color: '#FFC107',
    fontFamily: typography.fontFamily.bold,
  },
  prizeName: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  prizeDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  prizeValue: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  // FAQ styles
  faqList: {
    gap: spacing[3],
  },
  faqItem: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: spacing[2],
  },
  faqQuestion: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing[2],
  },
  faqAnswer: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  faqCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    marginTop: spacing[2],
  },
  faqCategoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
  },
});
