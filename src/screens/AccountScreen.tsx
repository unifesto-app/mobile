import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { 
  User, 
  Mail, 
  Phone, 
  Edit2,
  X,
  Check,
  Camera,
  Trash2,
  ChevronLeft,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, uploadAvatar, deleteAvatar, deleteAccount, Profile } from '../lib/api/profile';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

const MOCK_USER = {
  joinedDate: 'January 2024',
};

export default function AccountScreen() {
  const navigation = useNavigation<any>();
  const { user, session, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState({
    name: '',
    username: '',
    bio: '',
    phone: '',
  });
  const [saveError, setSaveError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (user && session) {
      const userProfile = await getProfile();
      if (userProfile) {
        setProfile(userProfile);
        const displayPhone = userProfile.phone?.startsWith('+91') 
          ? userProfile.phone.substring(3) 
          : userProfile.phone || '';
        setEditedUser({
          name: userProfile.name || '',
          username: userProfile.username || '',
          bio: userProfile.bio || '',
          phone: displayPhone,
        });
      }
    }
    setIsLoading(false);
  };

  const handleSaveProfile = async (section: string) => {
    setSaveError('');
    setSaveLoading(true);
    
    try {
      let phoneToSave = editedUser.phone.trim();
      if (phoneToSave && !phoneToSave.startsWith('+')) {
        phoneToSave = '+91' + phoneToSave;
      }
      
      const updated = await updateProfile({
        name: editedUser.name,
        username: editedUser.username,
        bio: editedUser.bio,
        phone: phoneToSave === '' ? undefined : phoneToSave,
      });

      if (updated) {
        setProfile(updated);
        const displayPhone = updated.phone?.startsWith('+91') 
          ? updated.phone.substring(3) 
          : updated.phone || '';
        setEditedUser({
          name: updated.name || '',
          username: updated.username || '',
          bio: updated.bio || '',
          phone: displayPhone,
        });
        setEditingSection(null);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        setSaveError('Failed to update profile');
      }
    } catch (error: any) {
      setSaveError(error.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = (section: string) => {
    if (profile) {
      const displayPhone = profile.phone?.startsWith('+91') 
        ? profile.phone.substring(3) 
        : profile.phone || '';
      setEditedUser({
        name: profile.name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        phone: displayPhone,
      });
    }
    setSaveError('');
    setEditingSection(null);
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload an avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarLoading(true);
        try {
          const avatarUrl = await uploadAvatar(result.assets[0].uri);
          if (avatarUrl) {
            const updatedProfile = await getProfile();
            if (updatedProfile) {
              setProfile(updatedProfile);
              Alert.alert('Success', 'Avatar updated successfully');
            }
          }
        } catch (error: any) {
          Alert.alert('Error', error.message || 'Failed to upload avatar');
        } finally {
          setAvatarLoading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleDeleteAvatar = async () => {
    Alert.alert(
      'Delete Avatar',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setAvatarLoading(true);
            try {
              await deleteAvatar();
              const updatedProfile = await getProfile();
              if (updatedProfile) {
                setProfile(updatedProfile);
                Alert.alert('Success', 'Avatar removed successfully');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete avatar');
            } finally {
              setAvatarLoading(false);
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and will delete:\n\n• Your profile and personal information\n• All your event registrations\n• Your wallet and transaction history\n• All your tickets and QR codes\n\nYou will be immediately signed out.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            try {
              const result = await deleteAccount();
              
              if (result.success) {
                // Sign out the user
                await signOut();
                
                // Show success message
                Alert.alert(
                  'Account Deleted',
                  'Your account has been permanently deleted. We\'re sorry to see you go.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Navigation will be handled by auth state change
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Error',
                  result.error || 'Failed to delete account. Please try again or contact support.'
                );
              }
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'An unexpected error occurred. Please try again.'
              );
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading account...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Account</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={['#3491ff', '#0062ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {getInitials(profile?.name || editedUser.name || 'U')}
                </Text>
              </LinearGradient>
            )}
            
            {editingSection === 'avatar' && (
              <>
                {avatarLoading ? (
                  <View style={styles.avatarLoadingOverlay}>
                    <View style={styles.avatarLoadingContainer}>
                      <ActivityIndicator size="large" color="#ffffff" />
                      <Text style={styles.avatarLoadingText}>Uploading...</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.avatarEditOverlay}
                      onPress={handlePickImage}
                      activeOpacity={0.9}
                    >
                      <View style={styles.avatarEditContent}>
                        <Camera size={16} color="#ffffff" strokeWidth={2.5} />
                        <Text style={styles.avatarEditText}>
                          {profile?.avatar_url ? 'Change' : 'Upload'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    
                    {profile?.avatar_url && (
                      <TouchableOpacity
                        style={styles.avatarDeleteButton}
                        onPress={handleDeleteAvatar}
                        activeOpacity={0.8}
                      >
                        <Trash2 size={16} color="#ffffff" strokeWidth={2.5} />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </>
            )}
          </View>

          {editingSection === 'avatar' ? (
            <TouchableOpacity
              style={styles.cancelAvatarButton}
              onPress={() => setEditingSection(null)}
              activeOpacity={0.7}
            >
              <X size={16} color={colors.textSecondary} strokeWidth={2} />
              <Text style={styles.cancelAvatarText}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => setEditingSection('avatar')}
              activeOpacity={0.7}
            >
              <Camera size={16} color={colors.primary} strokeWidth={2} />
              <Text style={styles.editAvatarText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Form */}
        {saveError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{saveError}</Text>
          </View>
        )}

        {/* Personal Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {editingSection !== 'personal' && (
              <TouchableOpacity
                onPress={() => setEditingSection('personal')}
                activeOpacity={0.7}
              >
                <Edit2 size={18} color={colors.primary} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>

          {editingSection === 'personal' ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedUser.name}
                  onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={editedUser.username}
                  onChangeText={(text) => setEditedUser({ ...editedUser, username: text })}
                  placeholder="Choose a unique username"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editedUser.bio}
                  onChangeText={(text) => setEditedUser({ ...editedUser, bio: text })}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => handleCancelEdit('personal')}
                  activeOpacity={0.7}
                >
                  <X size={18} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttonPrimaryContainer}
                  onPress={() => handleSaveProfile('personal')}
                  disabled={saveLoading}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#3491ff', '#0062ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonPrimaryGradient}
                  >
                    {saveLoading ? (
                      <ActivityIndicator color="#000000" size="small" />
                    ) : (
                      <>
                        <Check size={18} color="#000000" strokeWidth={2} />
                        <Text style={styles.buttonPrimaryText}>Save</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>{profile?.name || 'Not set'}</Text>
                </View>
              </View>

              {profile?.username && (
                <View style={styles.infoItem}>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Username</Text>
                    <Text style={styles.infoValue}>@{profile.username}</Text>
                  </View>
                </View>
              )}

              {(profile?.bio || editedUser.bio) && (
                <View style={styles.infoItem}>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Bio</Text>
                    <Text style={styles.infoValue}>{profile?.bio || editedUser.bio}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Contact Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {editingSection !== 'contact' && (
              <TouchableOpacity
                onPress={() => setEditingSection('contact')}
                activeOpacity={0.7}
              >
                <Edit2 size={18} color={colors.primary} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>

          {editingSection === 'contact' ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.countryCodeText}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    value={editedUser.phone}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/\D/g, '');
                      setEditedUser({ ...editedUser, phone: cleaned });
                    }}
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => handleCancelEdit('contact')}
                  activeOpacity={0.7}
                >
                  <X size={18} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttonPrimaryContainer}
                  onPress={() => handleSaveProfile('contact')}
                  disabled={saveLoading}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#3491ff', '#0062ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonPrimaryGradient}
                  >
                    {saveLoading ? (
                      <ActivityIndicator color="#000000" size="small" />
                    ) : (
                      <>
                        <Check size={18} color="#000000" strokeWidth={2} />
                        <Text style={styles.buttonPrimaryText}>Save</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{profile?.email || user?.email}</Text>
                </View>
              </View>

              {editedUser.phone && (
                <View style={styles.infoItem}>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>
                      {editedUser.phone.startsWith('+91') ? editedUser.phone : `+91${editedUser.phone}`}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Account Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : MOCK_USER.joinedDate}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delete Account Section */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
          <Text style={styles.dangerZoneDescription}>
            Once you delete your account, there is no going back. Please be certain.
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={deleteLoading}
            activeOpacity={0.7}
          >
            {deleteLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Trash2 size={18} color="#ffffff" strokeWidth={2} />
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </>
            )}
          </TouchableOpacity>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
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
    paddingBottom: spacing[10],
    gap: spacing[4],
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: spacing[4],
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundSecondary,
  },
  avatarText: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarEditContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  avatarEditText: {
    fontSize: typography.fontSize.xs,
    fontFamily: getFontFamily('bold'),
    color: '#ffffff',
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLoadingContainer: {
    alignItems: 'center',
    gap: spacing[2],
  },
  avatarLoadingText: {
    fontSize: typography.fontSize.xs,
    fontFamily: getFontFamily('bold'),
    color: '#ffffff',
    marginTop: spacing[1],
  },
  avatarDeleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    ...shadows.lg,
  },
  editAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  editAvatarText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.primary,
  },
  cancelAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  cancelAvatarText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
  },
  editForm: {
    gap: spacing[4],
  },
  inputGroup: {
    gap: spacing[2],
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: borderRadius.lg,
    paddingLeft: spacing[3],
  },
  countryCodeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
    paddingRight: spacing[2],
    borderRightWidth: 1,
    borderRightColor: colors.borderMuted,
  },
  phoneInput: {
    flex: 1,
    padding: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.full,
  },
  buttonPrimaryContainer: {
    flex: 1,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  buttonPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  buttonPrimaryText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: '#000000',
  },
  buttonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  buttonSecondaryText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.textSecondary,
  },
  infoSection: {
    gap: spacing[3],
  },
  infoItem: {
    paddingVertical: spacing[1],
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing[1],
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  dangerZone: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginTop: spacing[4],
  },
  dangerZoneTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: '#ef4444',
    marginBottom: spacing[2],
  },
  dangerZoneDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    marginBottom: spacing[4],
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: '#ef4444',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: '#ffffff',
  },
});
