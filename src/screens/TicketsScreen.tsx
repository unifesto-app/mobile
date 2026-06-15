import React, { useState, useEffect } from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
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
import { useRouter } from 'expo-router';
import { Calendar, Clock, Ticket } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../theme';
import { getMyRegisteredEvents } from '../lib/api/events';
import { getFontFamily } from '../theme/fontHelpers';


const HEADER_TOP_OFFSET = 120;

const TABS = ['Upcoming', 'Past'];

export default function TicketsScreen() {
  const { colors } = useTheme();
  
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
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 0.5,
    borderColor: colors.borderMuted,
    ...shadows.lg,
    overflow: 'visible',
    position: 'relative',
    marginBottom: spacing[4],
  },
  ticketImageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    overflow: 'hidden',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  ticketCoverImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketTop: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
  },
  ticketTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.fontSize.base * 1.3,
    fontFamily: getFontFamily('semibold'),
    marginBottom: spacing[2],
  },
  ticketInfo: {
    gap: spacing[2],
  },
  ticketInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  ticketInfoText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: getFontFamily('normal'),
  },
  cutoutCenter: {
    position: 'absolute',
    top: -25,
    left: '50%',
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background,
    zIndex: 10,
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

  const [activeTab, setActiveTab] = useState('Upcoming');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const router = useRouter();
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

      const allEvents = (response?.data || response?.events || []).map((r: any) => r.event ? { ...r.event, qrCode: r.qrCode, registrationId: r.id, status: r.status } : r);

      // Filter based on active tab
      const now = new Date();
      const filtered = allEvents.filter((event: any) => {
        const eventDate = new Date(event.startDateTime);
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

  const renderTicket = (event: any) => {
    const eventDate = new Date(event.startDateTime);
    const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const venue = event.venueName || event.city || 'TBA';

    return (
      <TouchableOpacity
        key={event.id}
        style={styles.ticketCard}
        onPress={() => router.push({ 
          pathname: '/ticket/[id]', 
          params: { 
            id: event.id, 
            ticket: JSON.stringify(event)
          } 
        })}
        activeOpacity={0.9}
      >
        {/* Center cutout at top of card */}
        <View style={styles.cutoutCenter} />
        
        {/* Cover Image */}
        <View style={styles.ticketImageContainer}>
          {event.coverImageUrl ? (
            <Image source={{ uri: event.coverImageUrl }} style={styles.ticketCoverImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={brandGradient} start={brandGradientStart} end={brandGradientEnd} style={styles.ticketCoverImage}>
              <Text style={{ fontSize: 32, color: '#fff', fontFamily: getFontFamily('bold') }}>{event.title?.[0] || 'E'}</Text>
            </LinearGradient>
          )}
          {/* Bottom gradient dissolve */}
          <LinearGradient
            colors={['transparent', colors.card]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 }}
          />
        </View>

        {/* Bottom Section */}
        <View style={styles.ticketTop}>
          <Text style={styles.ticketTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.ticketInfo}>
            <View style={styles.ticketInfoRow}>
              <Calendar size={12} color={colors.primary} strokeWidth={2} />
              <Text style={styles.ticketInfoText}>{formattedDate} · {formattedTime}</Text>
            </View>
            <View style={styles.ticketInfoRow}>
              <Clock size={12} color={colors.primary} strokeWidth={2} />
              <Text style={styles.ticketInfoText} numberOfLines={1}>{venue}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
              onPress={() => router.push('/login')}
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
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.8}
            >
              <Text style={styles.browseButtonText}>Browse Events</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : tickets.length > 0 ? (
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

