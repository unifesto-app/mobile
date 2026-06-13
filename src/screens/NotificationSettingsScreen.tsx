import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { UnIcon, IconName } from '@unifesto/unicon/react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import useAnalyticsScreenTracking from '../hooks/useAnalyticsScreenTracking';

type NotifState = {
  pushEnabled: boolean;
  emailEnabled: boolean;
  eventReminders: boolean;
  newEvents: boolean;
  referralUpdates: boolean;
  promotions: boolean;
};

export default function NotificationSettingsScreen() {
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();
  const [notifs, setNotifs] = useState<NotifState>({
    pushEnabled: true,
    emailEnabled: true,
    eventReminders: true,
    newEvents: true,
    referralUpdates: true,
    promotions: false,
  });

  useAnalyticsScreenTracking('NotificationSettings');

  const toggle = (key: keyof NotifState) =>
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  const SwitchRow = ({
    iconName,
    label,
    description,
    value,
    onToggle,
    isLast = false,
  }: {
    iconName: IconName;
    label: string;
    description?: string;
    value: boolean;
    onToggle: () => void;
    isLast?: boolean;
  }) => (
    <>
      <View style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <View style={styles.iconContainer}>
            <UnIcon name={iconName} size={32} />
          </View>
          <View style={styles.menuItemTextContainer}>
            <Text style={styles.menuItemLabel}>{label}</Text>
            {description ? <Text style={styles.menuItemDesc}>{description}</Text> : null}
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={'#ffffff'}
          ios_backgroundColor={colors.border}
        />
      </View>
      {!isLast && <View style={styles.menuDivider} />}
    </>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 100,
      paddingHorizontal: spacing[6],
    },
    section: {
      marginBottom: spacing[6],
    },
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('normal'),
      color: colors.textMuted,
      marginBottom: spacing[3],
      paddingLeft: spacing[1],
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius['2xl'],
      overflow: 'hidden',
      ...shadows.lg,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      flex: 1,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuItemTextContainer: {
      flex: 1,
    },
    menuItemLabel: {
      fontSize: typography.fontSize.base,
      fontFamily: getFontFamily('semibold'),
      color: colors.text,
    },
    menuItemDesc: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
      marginTop: 2,
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.borderMuted,
      marginLeft: 72,
      marginRight: spacing[5],
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 20 }]}
      >
        {/* General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.card}>
            <SwitchRow
              iconName="notification"
              label="Push Notifications"
              value={notifs.pushEnabled}
              onToggle={() => toggle('pushEnabled')}
            />
            <SwitchRow
              iconName="mail"
              label="Email Notifications"
              value={notifs.emailEnabled}
              onToggle={() => toggle('emailEnabled')}
              isLast
            />
          </View>
        </View>

        {/* Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events</Text>
          <View style={styles.card}>
            <SwitchRow
              iconName="calendar"
              label="Event Reminders"
              value={notifs.eventReminders}
              onToggle={() => toggle('eventReminders')}
            />
            <SwitchRow
              iconName="megaphone"
              label="New Events"
              value={notifs.newEvents}
              onToggle={() => toggle('newEvents')}
              isLast
            />
          </View>
        </View>

        {/* Social & Rewards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social & Rewards</Text>
          <View style={styles.card}>
            <SwitchRow
              iconName="profile"
              label="Referral Updates"
              value={notifs.referralUpdates}
              onToggle={() => toggle('referralUpdates')}
            />
            <SwitchRow
              iconName="tag"
              label="Promotions"
              value={notifs.promotions}
              onToggle={() => toggle('promotions')}
              isLast
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
