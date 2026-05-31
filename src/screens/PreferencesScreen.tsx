import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Bell,
  Mail,
  Settings,
  ChevronLeft,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import OneSignalService from '../services/OneSignalService';
import { supabase } from '../config/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.unifesto.app';

export default function PreferencesScreen() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Load preferences from backend
      const response = await fetch(`${API_URL}/auth/preferences`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const prefs = data.preferences;
        
        setPushNotifications(prefs.push_notifications ?? true);
        setEmailNotifications(prefs.email_notifications ?? true);
        setEventReminders(prefs.event_reminders ?? true);
        setMarketingEmails(prefs.marketing_emails ?? false);
      }
      
      // Check if user has granted notification permissions
      const hasPermission = OneSignalService.hasPermission();
      if (!hasPermission) {
        setPushNotifications(false);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (preferences: any) => {
    try {
      if (!supabase) {
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }

      await fetch(`${API_URL}/auth/preferences`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences');
    }
  };

  const handlePushNotificationsToggle = async (value: boolean) => {
    if (value) {
      // Request permission if enabling
      const granted = await OneSignalService.requestPermission();
      if (granted) {
        setPushNotifications(true);
        OneSignalService.optInToPush();
        OneSignalService.setTags({ push_notifications: 'true' });
        savePreferences({ push_notifications: true });
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive push notifications.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Disable push notifications
      setPushNotifications(false);
      OneSignalService.optOutOfPush();
      OneSignalService.setTags({ push_notifications: 'false' });
      savePreferences({ push_notifications: false });
    }
  };

  const handleEventRemindersToggle = (value: boolean) => {
    setEventReminders(value);
    OneSignalService.setTags({ event_reminders: value ? 'true' : 'false' });
    savePreferences({ event_reminders: value });
  };

  const handleEmailNotificationsToggle = (value: boolean) => {
    setEmailNotifications(value);
    OneSignalService.setTags({ email_notifications: value ? 'true' : 'false' });
    savePreferences({ email_notifications: value });
  };

  const handleMarketingEmailsToggle = (value: boolean) => {
    setMarketingEmails(value);
    OneSignalService.setTags({ marketing_emails: value ? 'true' : 'false' });
    savePreferences({ marketing_emails: value });
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={colors.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceLeft}>
                <View style={styles.preferenceIcon}>
                  <Bell size={20} color={colors.textSecondary} strokeWidth={2} />
                </View>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceLabel}>Push Notifications</Text>
                  <Text style={styles.preferenceDescription}>
                    Get notified about events and updates
                  </Text>
                </View>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={handlePushNotificationsToggle}
                trackColor={{ false: colors.borderMuted, true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.preferenceDivider} />

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceLeft}>
                <View style={styles.preferenceIcon}>
                  <Bell size={20} color={colors.textSecondary} strokeWidth={2} />
                </View>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceLabel}>Event Reminders</Text>
                  <Text style={styles.preferenceDescription}>
                    Get reminded before events start
                  </Text>
                </View>
              </View>
              <Switch
                value={eventReminders}
                onValueChange={handleEventRemindersToggle}
                trackColor={{ false: colors.borderMuted, true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Email Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Mail size={20} color={colors.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Email</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceLeft}>
                <View style={styles.preferenceIcon}>
                  <Mail size={20} color={colors.textSecondary} strokeWidth={2} />
                </View>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceLabel}>Email Notifications</Text>
                  <Text style={styles.preferenceDescription}>
                    Receive updates via email
                  </Text>
                </View>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={handleEmailNotificationsToggle}
                trackColor={{ false: colors.borderMuted, true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.preferenceDivider} />

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceLeft}>
                <View style={styles.preferenceIcon}>
                  <Mail size={20} color={colors.textSecondary} strokeWidth={2} />
                </View>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceLabel}>Marketing Emails</Text>
                  <Text style={styles.preferenceDescription}>
                    Receive promotional content and offers
                  </Text>
                </View>
              </View>
              <Switch
                value={marketingEmails}
                onValueChange={handleMarketingEmailsToggle}
                trackColor={{ false: colors.borderMuted, true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Settings size={20} color={colors.primary} strokeWidth={2} />
          <Text style={styles.infoText}>
            Your preferences are saved automatically. You can change them anytime.
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[12],
    paddingBottom: spacing[4],
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: spacing[6],
    paddingTop: spacing[4],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.md,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
    paddingRight: spacing[3],
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  preferenceDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
  preferenceDivider: {
    height: 1,
    backgroundColor: colors.borderMuted,
    marginVertical: spacing[3],
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(52, 145, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.1)',
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});
