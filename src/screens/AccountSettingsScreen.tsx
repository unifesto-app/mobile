import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { ChevronRight, Trash2, X } from 'lucide-react-native';
import { UnIcon } from '@unifesto/unicon/react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as AuthAPI from '../lib/api/auth';
import Skeleton from '../components/Skeleton';
import {
  spacing,
  typography,
  borderRadius,
  shadows,
} from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const { user, token, logout } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthAPI.User | null>(null);
  const [identities, setIdentities] = useState<AuthAPI.UserIdentity[]>([]);
  
  // Username modal state
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user || !token) {
      router.back();
      return;
    }

    try {
      setLoading(true);
      const [userProfile, userIdentities] = await Promise.all([
        AuthAPI.getCurrentUser(token),
        AuthAPI.getUserIdentities(token),
      ]);
      setProfile(userProfile);
      setIdentities(userIdentities);
      setUsername(userProfile.username || '');
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load account settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!token) return;

    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setUsernameError('Username cannot be empty');
      return;
    }

    if (trimmedUsername === profile?.username) {
      setShowUsernameModal(false);
      return;
    }

    try {
      setCheckingUsername(true);
      setUsernameError('');

      // Check availability
      const { available } = await AuthAPI.checkUsernameAvailability(trimmedUsername);
      
      if (!available) {
        setUsernameError('Username is already taken');
        setCheckingUsername(false);
        return;
      }

      // Update username
      const updatedProfile = await AuthAPI.updateUserProfile(token, {
        username: trimmedUsername,
      });

      setProfile(updatedProfile);
      setUsernameError('');
      setShowUsernameModal(false);
      Alert.alert('Success', 'Username updated successfully');
    } catch (error: any) {
      console.error('Failed to update username:', error);
      setUsernameError(error.message || 'Failed to update username');
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    setUsernameError('');
    
    // Clear existing timeout
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }

    // Don't check if empty
    if (!text.trim()) {
      return;
    }

    // Set new timeout to check username after 1 second of no typing
    const timeout = setTimeout(async () => {
      if (text.trim() === profile?.username) {
        return;
      }
      
      try {
        setCheckingUsername(true);
        const { available } = await AuthAPI.checkUsernameAvailability(text.trim());
        
        if (!available) {
          setUsernameError('Username is already taken');
        }
      } catch (error: any) {
        setUsernameError(error.message || 'Failed to check username');
      } finally {
        setCheckingUsername(false);
      }
    }, 1000);
    
    setUsernameCheckTimeout(timeout);
  };

  const openUsernameModal = () => {
    setUsername(profile?.username || '');
    setUsernameError('');
    setShowUsernameModal(true);
  };

  const closeUsernameModal = () => {
    setShowUsernameModal(false);
    setUsername(profile?.username || '');
    setUsernameError('');
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement delete account API call
              Alert.alert('Coming Soon', 'Account deletion will be available soon');
              // After successful deletion:
              // await logout();
              // router.replace('/login');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'GOOGLE':
        return 'Google';
      case 'APPLE':
        return 'Apple';
      case 'EMAIL':
        return 'Email';
      default:
        return provider;
    }
  };

  const getProviderIconName = (provider: string) => {
    switch (provider) {
      case 'GOOGLE':
        return 'google';
      case 'APPLE':
        return 'apple';
      case 'EMAIL':
        return 'mail';
      default:
        return 'mail';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: spacing[6],
      paddingBottom: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Section
    sectionSpacing: {
      marginBottom: spacing[6],
    },
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('normal'),
      color: colors.textMuted,
      marginBottom: spacing[3],
      paddingLeft: spacing[1],
    },
    // Card
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius['2xl'],
      overflow: 'hidden',
      ...shadows.lg,
    },
    // Menu Item
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
      fontSize: typography.fontSize.xs,
      fontFamily: getFontFamily('normal'),
      color: colors.textMuted,
      marginBottom: 2,
    },
    menuItemValue: {
      fontSize: typography.fontSize.base,
      fontFamily: getFontFamily('semibold'),
      color: colors.text,
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.borderMuted,
      marginLeft: 72,
      marginRight: spacing[5],
    },
    // Username Modal
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing[6],
      paddingTop: spacing[12],
      paddingBottom: spacing[4],
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: typography.fontSize.xl,
      fontFamily: getFontFamily('bold'),
      color: colors.text,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalContent: {
      padding: spacing[6],
      gap: spacing[4],
    },
    inputGroup: {
      gap: spacing[2],
    },
    inputLabel: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('semibold'),
      color: colors.text,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      fontSize: typography.fontSize.base,
      fontFamily: getFontFamily('semibold'),
      color: colors.text,
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      fontSize: typography.fontSize.xs,
      fontFamily: getFontFamily('normal'),
      color: colors.error,
    },
    checkingText: {
      fontSize: typography.fontSize.xs,
      fontFamily: getFontFamily('normal'),
      color: colors.primary,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing[3],
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing[2],
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontSize: typography.fontSize.base,
      fontFamily: getFontFamily('bold'),
      color: '#ffffff',
    },
    // Linked Accounts
    linkedAccountItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
      gap: spacing[3],
    },
    linkedAccountIcon: {
      width: 32,
      height: 32,
    },
    linkedAccountInfo: {
      flex: 1,
    },
    linkedAccountEmail: {
      fontSize: typography.fontSize.base,
      fontFamily: getFontFamily('semibold'),
      color: colors.text,
    },
    verifiedIcon: {
      marginLeft: spacing[2],
    },
    // Danger Zone
    dangerCard: {
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      borderRadius: borderRadius['2xl'],
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.2)',
      padding: spacing[5],
      ...shadows.lg,
    },
    dangerTitle: {
      fontSize: typography.fontSize.base,
      fontFamily: getFontFamily('bold'),
      color: colors.error,
      marginBottom: spacing[2],
    },
    dangerDescription: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('normal'),
      color: colors.textSecondary,
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
      marginBottom: spacing[4],
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      paddingVertical: spacing[3],
      borderRadius: borderRadius.lg,
      backgroundColor: colors.error,
    },
    deleteButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('bold'),
      color: '#ffffff',
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 20 }]}
        >
          {/* Account Information Skeleton */}
          <View style={styles.sectionSpacing}>
            <Skeleton width={130} height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[3] }} />
            <View style={styles.card}>
              {[1, 2].map((i) => (
                <View key={i}>
                  <View style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                      <Skeleton width={36} height={36} borderRadius={borderRadius.md} />
                      <Skeleton width={120} height={16} borderRadius={borderRadius.md} />
                    </View>
                    <Skeleton width={16} height={16} borderRadius={borderRadius.sm} />
                  </View>
                  {i < 2 && <View style={styles.menuDivider} />}
                </View>
              ))}
            </View>
          </View>

          {/* Linked Accounts Skeleton */}
          <View style={styles.sectionSpacing}>
            <Skeleton width={110} height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[3] }} />
            <View style={styles.card}>
              {[1, 2].map((i) => (
                <View key={i}>
                  <View style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                      <Skeleton width={32} height={32} borderRadius={borderRadius.md} />
                      <View style={{ flex: 1 }}>
                        <Skeleton width={80} height={16} borderRadius={borderRadius.md} style={{ marginBottom: spacing[1] }} />
                        <Skeleton width={150} height={13} borderRadius={borderRadius.md} />
                      </View>
                    </View>
                    <Skeleton width={20} height={20} borderRadius={10} />
                  </View>
                  {i < 2 && <View style={styles.menuDivider} />}
                </View>
              ))}
            </View>
          </View>

          {/* Danger Zone Skeleton */}
          <View style={styles.sectionSpacing}>
            <Skeleton width={90} height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[3] }} />
            <View style={styles.dangerCard}>
              <Skeleton width={120} height={16} borderRadius={borderRadius.md} style={{ marginBottom: spacing[2] }} />
              <Skeleton width="100%" height={40} borderRadius={borderRadius.md} style={{ marginBottom: spacing[4] }} />
              <Skeleton width="100%" height={40} borderRadius={borderRadius.lg} />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Account Information */}
        <View style={styles.sectionSpacing}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.card}>
            {/* Username */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={openUsernameModal}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <UnIcon name="at" size={32} />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemValue}>
                    {profile?.username ? `@${profile.username}` : 'Not set'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Phone Number */}
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <UnIcon name="phone" size={32} />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemValue}>
                    {profile?.mobileNumber || 'Not set'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Linked Accounts */}
        <View style={styles.sectionSpacing}>
          <Text style={styles.sectionTitle}>Linked Accounts</Text>
          <View style={styles.card}>
            {identities.length > 0 ? (
              identities.map((identity, index) => (
                <React.Fragment key={identity.id}>
                  <View style={styles.linkedAccountItem}>
                    <UnIcon 
                      name={getProviderIconName(identity.provider)} 
                      size={32}
                    />
                    <View style={styles.linkedAccountInfo}>
                      {identity.email && (
                        <Text style={styles.linkedAccountEmail}>{identity.email}</Text>
                      )}
                    </View>
                    {identity.emailVerified && (
                      <UnIcon 
                        name="verified-green" 
                        size={20}
                        style={styles.verifiedIcon}
                      />
                    )}
                  </View>
                  {index < identities.length - 1 && <View style={styles.menuDivider} />}
                </React.Fragment>
              ))
            ) : (
              <View style={styles.menuItem}>
                <Text style={styles.menuItemValue}>No linked accounts</Text>
              </View>
            )}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.sectionSpacing}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>Delete Account</Text>
            <Text style={styles.dangerDescription}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
            >
              <Trash2 size={16} color="#ffffff" strokeWidth={2} />
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Username Edit Modal */}
      <Modal
        visible={showUsernameModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeUsernameModal}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Username</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={closeUsernameModal}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={[styles.input, usernameError ? styles.inputError : null]}
                value={username}
                onChangeText={handleUsernameChange}
                placeholder="Enter username"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                spellCheck={false}
                keyboardType="ascii-capable"
                autoFocus
              />
              {usernameError ? (
                <Text style={styles.errorText}>{usernameError}</Text>
              ) : checkingUsername ? (
                <Text style={styles.checkingText}>Checking availability...</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (checkingUsername || !!usernameError || !username.trim()) && styles.saveButtonDisabled
              ]}
              onPress={handleSaveUsername}
              disabled={checkingUsername || !!usernameError || !username.trim()}
              activeOpacity={0.8}
            >
              {checkingUsername ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
