import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, Clock, Ticket } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../theme';
import { getMyRegisteredEvents } from '../lib/api/events';
import { getFontFamily } from '../theme/fontHelpers';

const HEADER_TOP_OFFSET = Platform.OS === 'ios' ? 150 : 100;

const TABS = ['Upcoming', 'Past'];

export default function TicketsScreen() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  useEffect(() => {
    setPage(1);
    loadTickets(1, true);
  }, [activeTab]);

  const loadTickets = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Get user's registered events
      const response = await getMyRegisteredEvents(pageNum, 20);

      // If API returns null (error or not implemented), show empty state
      if (!response) {
        if (reset) {
          setTickets([]);
        }
        setHasMore(false);
        return;
      }

      const allEvents = response?.events || [];

      // Filter based on active tab
      const now = new Date();
      const filtered = allEvents.filter(event => {
        const eventDate = new Date(event.start_date);
        if (activeTab === 'Upcoming') {
          return eventDate >= now;
        } else {
          return eventDate < now;
        }
      });

      if (reset) {
        setTickets(filtered);
      } else {
        setTickets(prev => [...prev, ...filtered]);
      }

      // Check if there are more items
      setHasMore(allEvents.length === 20);
      setPage(pageNum);
    } catch (error) {
      // Set empty array on error - show "no tickets" instead of error
      if (reset) {
        setTickets([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      loadTickets(page + 1, false);
    }
  };

  const renderTicket = (ticket: any) => (
    <TouchableOpacity
      key={ticket.id}
      style={styles.ticketCard}
      onPress={() => navigation.navigate('TicketDetail', { ticket })}
      activeOpacity={0.9}
    >
      {/* Top Section */}
      <View style={styles.ticketTop}>
        <View style={styles.ticketMainContent}>
          <View style={styles.ticketImage}>
            <Text style={styles.ticketImagePlaceholder}>
              {(ticket.category || 'E').charAt(0)}
            </Text>
          </View>
          <View style={styles.ticketTextContent}>
            <Text style={styles.ticketTitle} numberOfLines={1}>
              {ticket.title}
            </Text>
            <View style={styles.ticketInfo}>
              <View style={styles.ticketInfoRow}>
                <Calendar size={14} color={colors.primary} strokeWidth={2} />
                <Text style={styles.ticketInfoText}>{ticket.date}</Text>
              </View>
              <View style={styles.ticketInfoRow}>
                <Clock size={14} color={colors.primary} strokeWidth={2} />
                <Text style={styles.ticketInfoText}>{ticket.time}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Dashed Line */}
      <View style={styles.dashedLineContainer}>
        <View style={styles.dashedLine} />
      </View>

      {/* Bottom Section */}
      <View style={styles.ticketBottom}>
        <View style={styles.ticketBottomRow}>
          <View>
            <Text style={styles.ticketLabel}>CATEGORY</Text>
            <Text style={styles.ticketValue}>{ticket.category}</Text>
          </View>
          <View style={styles.ticketCodeContainer}>
            <Text style={styles.ticketLabel}>TICKET ID</Text>
            <Text style={styles.ticketCode}>#{ticket.id.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Left Cutout */}
      <View style={styles.cutoutLeft} />
      {/* Right Cutout */}
      <View style={styles.cutoutRight} />
    </TouchableOpacity>
  );

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.guestContainer}
        >
          <View style={styles.guestContent}>
            <LinearGradient
              colors={brandGradient}
              start={brandGradientStart}
              end={brandGradientEnd}
              style={styles.guestIcon}
            >
              <Ticket size={48} color={colors.text} strokeWidth={2} />
            </LinearGradient>

            <GradientText style={styles.guestTitle}>Sign in to view your tickets</GradientText>
            <Text style={styles.guestDescription}>
              Create an account or sign in to register for events and manage your tickets
            </Text>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => setShowLoginModal(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={brandGradient}
                start={brandGradientStart}
                end={brandGradientEnd}
                style={styles.signInButtonGradient}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Discover')}
              activeOpacity={0.8}
            >
              <Text style={styles.browseButtonText}>Browse Events</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Login Modal */}
        <LoginModal
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
        if (isCloseToBottom) {
          handleLoadMore();
        }
      }}
      scrollEventThrottle={400}
    >
      {/* Header */}
      <View style={styles.header}>
        <GradientText style={styles.headerTitle}>My Tickets</GradientText>
        <Text style={styles.headerSubtitle}>
          View and manage your event tickets
        </Text>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tickets List */}
      <View style={styles.ticketsListContent}>
        {tickets.length > 0 ? (
          <>
            {tickets.map(renderTicket)}
            {loadingMore && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ticket size={64} color={colors.textMuted} strokeWidth={1.5} />
            <Text style={styles.emptyStateTitle}>No tickets yet</Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'Upcoming'
                ? 'Register for events to see your tickets here'
                : 'Your past event tickets will appear here'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: HEADER_TOP_OFFSET,
    paddingBottom: spacing[6],
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    marginBottom: spacing[2],
    fontFamily: typography.fontFamily.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[6],
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing[1],
    gap: spacing[2],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: 'rgba(52, 145, 255, 0.15)',
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bold,
  },
  tabTextActive: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  ticketsListContent: {
    padding: spacing[6],
    gap: spacing[6],
  },
  ticketCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 0.5,
    borderColor: colors.primary,
    ...shadows.lg,
    marginBottom: spacing[4],
  },
  ticketTop: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[5],
  },
  ticketMainContent: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  ticketImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketImagePlaceholder: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  ticketTextContent: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: typography.fontSize.xl,
    color: colors.text,
    marginBottom: spacing[4],
    lineHeight: typography.fontSize.xl * 1.3,
    fontFamily: typography.fontFamily.primary,
  },
  ticketInfo: {
    gap: spacing[3],
  },
  ticketInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  ticketInfoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bold,
  },
  dashedLineContainer: {
    paddingHorizontal: spacing[4],
  },
  dashedLine: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  ticketBottom: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[5],
    paddingBottom: spacing[6],
  },
  ticketBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  ticketLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing[1],
  },
  ticketValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  ticketCodeContainer: {
    alignItems: 'flex-end',
  },
  ticketCode: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: 'Courier',
  },
  cutoutLeft: {
    position: 'absolute',
    left: -13,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.primary,
  },
  cutoutRight: {
    position: 'absolute',
    right: -13,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderLeftWidth: 1,
    borderLeftColor: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[16],
    gap: spacing[4],
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing[8],
  },
  // Guest User Styles
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[12],
  },
  guestContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  guestIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[8],
  },
  guestTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('medium'),
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  guestDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing[8],
  },
  signInButton: {
    width: '100%',
    marginBottom: spacing[4],
  },
  signInButtonGradient: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  browseButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
  },
  browseButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('medium'),
    color: colors.primary,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[6],
    gap: spacing[3],
  },
  loadingMoreText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontFamily: getFontFamily('medium'),
  },
});
