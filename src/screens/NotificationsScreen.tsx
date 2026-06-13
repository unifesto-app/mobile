import React, { useState } from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Bell, Calendar, Gift, Ticket, Users, Megaphone, CheckCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassyButton from '../components/GlassyButton';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import useAnalyticsScreenTracking from '../hooks/useAnalyticsScreenTracking';

type NotificationType = 'event' | 'ticket' | 'referral' | 'social' | 'promo';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'event',
    title: 'Event Starting Soon',
    message: 'Tech Conference 2024 starts in 2 hours. Get ready!',
    time: '2h ago',
    read: false,
  },
  {
    id: '2',
    type: 'ticket',
    title: 'Ticket Confirmed',
    message: 'Your ticket for Music Festival has been confirmed.',
    time: '5h ago',
    read: false,
  },
  {
    id: '3',
    type: 'referral',
    title: 'Referral Reward',
    message: 'You earned ₹100 from your referral! Check your wallet.',
    time: '1d ago',
    read: true,
  },
  {
    id: '4',
    type: 'social',
    title: 'New Follower',
    message: 'John Doe started following you.',
    time: '2d ago',
    read: true,
  },
  {
    id: '5',
    type: 'promo',
    title: 'Special Offer',
    message: 'Get 20% off on your next event registration!',
    time: '3d ago',
    read: true,
  },
  {
    id: '6',
    type: 'event',
    title: 'New Event Alert',
    message: 'A new event "Startup Meetup" is happening near you.',
    time: '4d ago',
    read: true,
  },
];

const HEADER_TOP_OFFSET = 30;

export default function NotificationsScreen() {
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: HEADER_TOP_OFFSET + 20,
    paddingBottom: 100,
    paddingHorizontal: spacing[6],
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingHorizontal: spacing[1],
  },
  unreadText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('semibold'),
    color: colors.text,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  markAllText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('semibold'),
    color: colors.primary,
  },
  notificationsList: {
    gap: spacing[3],
  },
  notificationCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing[4],
    ...shadows.lg,
  },
  notificationCardUnread: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  notificationContent: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  notificationText: {
    flex: 1,
    gap: spacing[1],
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  notificationTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('semibold'),
    color: colors.text,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificationMessage: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('normal'),
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  notificationTime: {
    fontSize: typography.fontSize.xs,
    fontFamily: getFontFamily('normal'),
    color: colors.textMuted,
    marginTop: spacing[1],
  },
  // Empty State
  emptyContainer: {
    paddingTop: HEADER_TOP_OFFSET + 150,
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[8],
    alignItems: 'center',
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
  },
  emptyTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  emptyDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
});

  const headerHeight = useHeaderHeight();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  useAnalyticsScreenTracking('Notifications');

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'event':
        return <Calendar size={16} color="#10b981" strokeWidth={2} />;
      case 'ticket':
        return <Ticket size={16} color={colors.primary} strokeWidth={2} />;
      case 'referral':
        return <Gift size={16} color="#f59e0b" strokeWidth={2} />;
      case 'social':
        return <Users size={16} color="#ec4899" strokeWidth={2} />;
      case 'promo':
        return <Megaphone size={16} color="#8b5cf6" strokeWidth={2} />;
      default:
        return <Bell size={16} color={colors.primary} strokeWidth={2} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.emptyContainer, { paddingTop: headerHeight + 20 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressViewOffset={HEADER_TOP_OFFSET}
            />
          }
        >
          <LinearGradient
            colors={brandGradient}
            start={brandGradientStart}
            end={brandGradientEnd}
            style={styles.emptyIcon}
          >
            <Bell size={48} color={colors.text} strokeWidth={2} />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyDescription}>
            You're all caught up! Check back later for updates.
          </Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 20 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressViewOffset={HEADER_TOP_OFFSET}
          />
        }
      >
        {/* Header with Mark All as Read */}
        {unreadCount > 0 && (
          <View style={styles.headerSection}>
            <Text style={styles.unreadText}>{unreadCount} unread</Text>
            <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7}>
              <View style={styles.markAllButton}>
                <CheckCheck size={16} color={colors.primary} strokeWidth={2} />
                <Text style={styles.markAllText}>Mark all as read</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        <View style={styles.notificationsList}>
          {notifications.map((notification, index) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.notificationCardUnread,
              ]}
              onPress={() => markAsRead(notification.id)}
              activeOpacity={0.7}
            >
              <View style={styles.notificationContent}>
                <GlassyButton size={40} variant="dark" shape="square" disabled>
                  {getNotificationIcon(notification.type)}
                </GlassyButton>
                <View style={styles.notificationText}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

