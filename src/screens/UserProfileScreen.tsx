import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import { Grid, Ticket, Calendar, MapPin, Clock } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as AuthAPI from '../lib/api/auth';
import { getMyRegisteredEvents } from '../lib/api/events';
import { getWallet } from '../lib/api/wallet';
import {
  spacing,
  typography,
  borderRadius,
  brandGradient,
  brandGradientStart,
  brandGradientEnd,
} from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import Skeleton from '../components/Skeleton';

type TabType = 'events' | 'tickets';

export default function UserProfileScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<AuthAPI.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [events, setEvents] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadProfile();
    loadData();
  }, []);

  const loadProfile = async () => {
    if (!user || !token) { router.back(); return; }
    try {
      setLoading(true);
      const userProfile = await AuthAPI.getCurrentUser(token);
      setProfile(userProfile);
    } catch (e) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [registrationsResp, walletResp] = await Promise.all([
        getMyRegisteredEvents(1, 50),
        getWallet().catch(() => null),
      ]);

      const registrations = registrationsResp?.data || registrationsResp?.events || [];
      const allEvents = registrations.map((r: any) => r.event ? { ...r.event, registrationId: r.id } : r).filter((e: any) => e?.id);
      
      const now = new Date();
      const upcomingEvents = allEvents.filter((e: any) => new Date(e.startDateTime) >= now);
      const pastEvents = allEvents.filter((e: any) => new Date(e.startDateTime) < now);

      setEvents(upcomingEvents);
      setTickets(pastEvents);
      setWalletBalance(walletResp?.balance || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: 100 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerSection: { paddingHorizontal: spacing[6], paddingTop: spacing[4], paddingBottom: spacing[4] },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[5] },
    avatar: { width: 90, height: 90, borderRadius: 45, overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    avatarGradient: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: typography.fontSize['3xl'], fontFamily: getFontFamily('bold'), color: '#000000' },
    statsContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statNumber: { fontSize: typography.fontSize.xl, fontFamily: getFontFamily('bold'), color: colors.text },
    statLabel: { fontSize: typography.fontSize.xs, fontFamily: getFontFamily('normal'), color: colors.textMuted, marginTop: spacing[1] },
    profileInfo: { paddingHorizontal: spacing[6], paddingTop: spacing[4], gap: spacing[2] },
    displayName: { fontSize: typography.fontSize.xl, fontFamily: getFontFamily('bold'), color: colors.text },
    username: { fontSize: typography.fontSize.sm, fontFamily: getFontFamily('normal'), color: colors.textMuted },
    bio: { fontSize: typography.fontSize.base, fontFamily: getFontFamily('normal'), color: colors.text, lineHeight: typography.lineHeight.relaxed * typography.fontSize.base, marginTop: spacing[2] },
    tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.borderMuted, marginTop: spacing[6] },
    tab: { flex: 1, paddingVertical: spacing[4], alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: colors.primary },
    tabIcon: { marginBottom: spacing[1] },
    tabText: { fontSize: typography.fontSize.xs, fontFamily: getFontFamily('semibold'), color: colors.textMuted },
    tabTextActive: { color: colors.primary },
    contentSection: { paddingHorizontal: spacing[4], paddingTop: spacing[4] },
    emptyState: { alignItems: 'center', paddingVertical: spacing[12] },
    emptyStateText: { fontSize: typography.fontSize.base, fontFamily: getFontFamily('normal'), color: colors.textMuted, marginTop: spacing[3] },
    eventCard: {
      backgroundColor: colors.card, borderRadius: borderRadius.xl,
      marginBottom: spacing[4], overflow: 'hidden',
      borderWidth: 1, borderColor: colors.borderMuted,
    },
    eventImage: { width: '100%', aspectRatio: 4/3, backgroundColor: colors.backgroundSecondary },
    eventImagePlaceholder: { width: '100%', aspectRatio: 4/3, alignItems: 'center', justifyContent: 'center' },
    eventContent: { padding: spacing[4], gap: spacing[2] },
    eventTitle: { fontSize: typography.fontSize.base, fontFamily: getFontFamily('semibold'), color: colors.text },
    eventMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
    eventMetaText: { fontSize: typography.fontSize.xs, color: colors.textMuted },
    ticketCard: {
      backgroundColor: colors.card, borderRadius: borderRadius.xl,
      marginBottom: spacing[4], overflow: 'hidden',
      borderWidth: 0.5, borderColor: colors.primary,
      flexDirection: 'row',
    },
    ticketLeft: { width: 80, backgroundColor: colors.backgroundSecondary },
    ticketLeftImage: { width: '100%', height: '100%' },
    ticketLeftPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    ticketContent: { flex: 1, padding: spacing[4], gap: spacing[2] },
    ticketTitle: { fontSize: typography.fontSize.sm, fontFamily: getFontFamily('semibold'), color: colors.text },
    ticketMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
    ticketMetaText: { fontSize: typography.fontSize.xs, color: colors.textMuted },
    ticketBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(52,145,255,0.1)', paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: borderRadius.sm },
    ticketBadgeText: { fontSize: typography.fontSize.xs, color: colors.primary, fontFamily: getFontFamily('semibold') },
  });

  const renderEvent = (event: any) => (
    <TouchableOpacity
      key={event.registrationId || event.id}
      style={styles.eventCard}
      onPress={() => router.push(`/event/${event.slug || event.id}`)}
      activeOpacity={0.8}
    >
      {event.coverImageUrl ? (
        <Image source={{ uri: event.coverImageUrl }} style={styles.eventImage} resizeMode="cover" />
      ) : (
        <LinearGradient colors={brandGradient} start={brandGradientStart} end={brandGradientEnd} style={styles.eventImagePlaceholder}>
          <Text style={{ fontSize: 32, color: '#fff', fontFamily: getFontFamily('bold') }}>{event.title?.[0] || 'E'}</Text>
        </LinearGradient>
      )}
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
        <View style={styles.eventMeta}>
          <Calendar size={12} color={colors.primary} strokeWidth={2} />
          <Text style={styles.eventMetaText}>
            {new Date(event.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
          {(event.venueName || event.city) && (
            <>
              <Text style={styles.eventMetaText}>•</Text>
              <MapPin size={12} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.eventMetaText} numberOfLines={1}>{event.venueName || event.city}</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTicket = (event: any) => (
    <TouchableOpacity
      key={event.registrationId || event.id}
      style={styles.ticketCard}
      onPress={() => router.push(`/event/${event.slug || event.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.ticketLeft}>
        {event.coverImageUrl ? (
          <Image source={{ uri: event.coverImageUrl }} style={styles.ticketLeftImage} resizeMode="cover" />
        ) : (
          <LinearGradient colors={brandGradient} start={brandGradientStart} end={brandGradientEnd} style={styles.ticketLeftPlaceholder}>
            <Text style={{ fontSize: 24, color: '#fff', fontFamily: getFontFamily('bold') }}>{event.title?.[0] || 'E'}</Text>
          </LinearGradient>
        )}
      </View>
      <View style={styles.ticketContent}>
        <View style={styles.ticketBadge}>
          <Text style={styles.ticketBadgeText}>Attended</Text>
        </View>
        <Text style={styles.ticketTitle} numberOfLines={2}>{event.title}</Text>
        <View style={styles.ticketMeta}>
          <Clock size={11} color={colors.textMuted} strokeWidth={2} />
          <Text style={styles.ticketMetaText}>
            {new Date(event.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const displayName = profile?.fullName || 'User';
  const username = profile?.username;
  const bio = profile?.bio;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 20 }]}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <LinearGradient colors={brandGradient} start={brandGradientStart} end={brandGradientEnd} style={styles.avatarGradient}>
                  <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
                </LinearGradient>
              )}
            </View>
            <View style={styles.statsContainer}>
              {loadingData ? (
                <>
                  <View style={styles.statItem}><Skeleton width={40} height={24} borderRadius={4} /><Text style={styles.statLabel}>Events</Text></View>
                  <View style={styles.statItem}><Skeleton width={40} height={24} borderRadius={4} /><Text style={styles.statLabel}>Tickets</Text></View>
                  <View style={styles.statItem}><Skeleton width={40} height={24} borderRadius={4} /><Text style={styles.statLabel}>Coins</Text></View>
                </>
              ) : (
                <>
                  <View style={styles.statItem}><Text style={styles.statNumber}>{events.length}</Text><Text style={styles.statLabel}>Events</Text></View>
                  <View style={styles.statItem}><Text style={styles.statNumber}>{tickets.length}</Text><Text style={styles.statLabel}>Past</Text></View>
                  <View style={styles.statItem}><Text style={styles.statNumber}>{walletBalance}</Text><Text style={styles.statLabel}>Coins</Text></View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.displayName}>{displayName}</Text>
          {username && <Text style={styles.username}>@{username}</Text>}
          {bio && <Text style={styles.bio}>{bio}</Text>}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === 'events' && styles.tabActive]} onPress={() => setActiveTab('events')} activeOpacity={0.7}>
            <Grid size={20} color={activeTab === 'events' ? colors.primary : colors.textMuted} strokeWidth={2} style={styles.tabIcon} />
            <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'tickets' && styles.tabActive]} onPress={() => setActiveTab('tickets')} activeOpacity={0.7}>
            <Ticket size={20} color={activeTab === 'tickets' ? colors.primary : colors.textMuted} strokeWidth={2} style={styles.tabIcon} />
            <Text style={[styles.tabText, activeTab === 'tickets' && styles.tabTextActive]}>Past</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          {loadingData ? (
            <View style={{ gap: spacing[4] }}>
              {[1,2,3].map(i => <Skeleton key={i} width="100%" height={200} borderRadius={borderRadius.xl} />)}
            </View>
          ) : activeTab === 'events' ? (
            events.length > 0 ? events.map(renderEvent) : (
              <View style={styles.emptyState}>
                <Grid size={64} color={colors.textMuted} strokeWidth={1} />
                <Text style={styles.emptyStateText}>No upcoming events</Text>
              </View>
            )
          ) : (
            tickets.length > 0 ? tickets.map(renderTicket) : (
              <View style={styles.emptyState}>
                <Ticket size={64} color={colors.textMuted} strokeWidth={1} />
                <Text style={styles.emptyStateText}>No past events</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
}
