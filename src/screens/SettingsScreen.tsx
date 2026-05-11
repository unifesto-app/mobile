import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Lock, ChevronRight } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { useAuth } from '../context/AuthContext';
import { hasWalletPasscode } from '../lib/api/wallet';

const SETTINGS_ITEMS = [
  {
    id: 'wallet-passcode',
    title: 'Wallet Passcode',
    description: 'Change your wallet security passcode',
    icon: Lock,
    action: 'changePasscode',
  },
];

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const [hasPasscode, setHasPasscode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPasscodeExists();
  }, []);

  // Refresh passcode status when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkPasscodeExists();
    });

    return unsubscribe;
  }, [navigation]);

  // Refresh when route params change (triggered by ChangeWalletPasscodeScreen)
  useEffect(() => {
    if (route.params?.refresh) {
      checkPasscodeExists();
    }
  }, [route.params?.refresh]);

  const checkPasscodeExists = async () => {
    try {
      setLoading(true);
      const response = await hasWalletPasscode();
      setHasPasscode(response.hasPasscode);
    } catch (error) {
      console.error('Error checking passcode:', error);
      setHasPasscode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePasscode = () => {
    navigation.navigate('ChangeWalletPasscode', { hasExistingPasscode: hasPasscode });
  };

  const handleItemPress = (action: string) => {
    if (action === 'changePasscode') {
      handleChangePasscode();
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          {SETTINGS_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleItemPress(item.action)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIcon}>
                      <Icon size={20} color={colors.primary} strokeWidth={2} />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuDescription}>{item.description}</Text>
                      {item.id === 'wallet-passcode' && (
                        <Text style={styles.statusText}>
                          {loading ? 'Checking...' : hasPasscode ? 'Passcode set' : 'No passcode set'}
                        </Text>
                      )}
                    </View>
                  </View>
                  <ChevronRight size={20} color={colors.textMuted} strokeWidth={2} />
                </TouchableOpacity>
                {index < SETTINGS_ITEMS.length - 1 && (
                  <View style={styles.menuDivider} />
                )}
              </View>
            );
          })}
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
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.textMuted,
    marginBottom: spacing[4],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    backgroundColor: colors.card,
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
    paddingRight: spacing[2],
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('semibold'),
    color: colors.text,
    marginBottom: spacing[0.5],
  },
  menuDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginTop: spacing[1],
    fontFamily: getFontFamily('medium'),
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderMuted,
    marginVertical: spacing[3],
  },
});
