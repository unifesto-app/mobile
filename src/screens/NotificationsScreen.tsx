import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { Bell, Mail, Calendar, Tag, Users, Megaphone } from 'lucide-react-native';
import GlassyButton from '../components/GlassyButton';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

type NotifState = {
  pushEnabled: boolean;
  emailEnabled: boolean;
  eventReminders: boolean;
  newEvents: boolean;
  referralUpdates: boolean;
  promotions: boolean;
};

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState<NotifState>({
    pushEnabled: true,
    emailEnabled: true,
    eventReminders: true,
    newEvents: true,
    referralUpdates: true,
    promotions: false,
  });

  const toggle = (key: keyof NotifState) =>
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  const SwitchRow = ({
    icon,
    label,
    description,
    value,
    onToggle,
    isLast = false,
  }: {
    icon: React.ReactNode;
    label: string;
    description?: string;
    value: boolean;
    onToggle: () => void;
    isLast?: boolean;
  }) => (
    <>
      <View style={styles.row}>
        <GlassyButton size={36} variant="dark" shape="square" disabled>
          {icon}
        </GlassyButton>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          {description ? <Text style={styles.rowDesc}>{description}</Text> : null}
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={'#ffffff'}
          ios_backgroundColor={colors.border}
        />
      </View>
      {!isLast && <View style={styles.divider} />}
    </>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* General */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>General</Text>
          <View style={styles.card}>
            <SwitchRow
              icon={<Bell size={16} color="#8b5cf6" strokeWidth={2} />}
              label="Push Notifications"
              value={notifs.pushEnabled}
              onToggle={() => toggle('pushEnabled')}
            />
            <SwitchRow
              icon={<Mail size={16} color={colors.primary} strokeWidth={2} />}
              label="Email Notifications"
              value={notifs.emailEnabled}
              onToggle={() => toggle('emailEnabled')}
              isLast
            />
          </View>
        </View>

        {/* Events */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Events</Text>
          <View style={styles.card}>
            <SwitchRow
              icon={<Calendar size={16} color="#10b981" strokeWidth={2} />}
              label="Event Reminders"
              value={notifs.eventReminders}
              onToggle={() => toggle('eventReminders')}
            />
            <SwitchRow
              icon={<Megaphone size={16} color="#f59e0b" strokeWidth={2} />}
              label="New Events"
              value={notifs.newEvents}
              onToggle={() => toggle('newEvents')}
              isLast
            />
          </View>
        </View>

        {/* Social & Rewards */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Social & Rewards</Text>
          <View style={styles.card}>
            <SwitchRow
              icon={<Users size={16} color="#ec4899" strokeWidth={2} />}
              label="Referral Updates"
              value={notifs.referralUpdates}
              onToggle={() => toggle('referralUpdates')}
            />
            <SwitchRow
              icon={<Tag size={16} color="#f59e0b" strokeWidth={2} />}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: spacing[6],
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[6],
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: getFontFamily('bold'),
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing[3],
    paddingLeft: spacing[1],
  },
  // Matches ProfileScreen card style — no border
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('semibold'),
    color: colors.text,
  },
  rowDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: getFontFamily('normal'),
    marginTop: 2,
  },
  // Inset divider matching ProfileScreen menuDivider
  divider: {
    height: 1,
    backgroundColor: colors.borderMuted,
    marginLeft: 72, // 36 icon + 12 gap + 16 paddingLeft + 8 extra
    marginRight: spacing[4],
  },
});
