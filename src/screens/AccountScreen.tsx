import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Trash2,
  Edit2,
  Check,
  X,
  User,
  Mail,
  Phone,
  CalendarDays,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  deleteAccount,
  Profile,
} from '../lib/api/profile';
import GradientText from '../components/GradientText';
import GradientButton from '../components/GradientButton';
import Skeleton from '../components/Skeleton';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  brandGradient,
  brandGradientStart,
  brandGradientEnd,
} from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

const HEADER_TOP_OFFSET = 50;

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

  const handleSaveProfile = async () => {
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

  const handleCancelEdit = () => {
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
          await uploadAvatar(result.assets[0].uri);
          const updatedProfile = await getProfile();
          if (updatedProfile) {
            setProfile(updatedProfile);
            Alert.alert('Success', 'Avatar updated successfully');
          }
        } catch (error: any) {
          Alert.alert('Error', error.message || 'Failed to upload avatar');
        } finally {
          setAvatarLoading(false);
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleDeleteAvatar = () => {
    Alert.alert('Remove Photo', 'Remove your profile picture?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setAvatarLoading(true);
          try {
            await deleteAvatar();
            const updatedProfile = await getProfile();
            if (updatedProfile) setProfile(updatedProfile);
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to remove avatar');
          } finally {
            setAvatarLoading(false);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your profile, tickets, wallet, and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            try {
              const result = await deleteAccount();
              if (result.success) {
                await signOut();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete account');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'An error occurred');
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  // ─── Skeleton ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.headerSection}>
            <Skeleton width={160} height={36} borderRadius={borderRadius.md} style={{ marginBottom: spacing[2] }} />
            <Skeleton width={220} height={16} borderRadius={borderRadius.sm} />
          </View>

          {/* Avatar skeleton */}
          <View style={styles.section}>
            <View style={styles.avatarRow}>
              <Skeleton width={80} height={80} borderRadius={40} />
              <View style={{ flex: 1, gap: spacing[2] }}>
                <Skeleton width={120} height={18} borderRadius={borderRadius.sm} />
                <Skeleton width={80} height={13} borderRadius={borderRadius.sm} />
                <Skeleton width={100} height={28} borderRadius={borderRadius.lg} style={{ marginTop: spacing[1] }} />
              </View>
            </View>
          </View>

          {/* Personal card skeleton */}
          <View style={styles.section}>
            <View style={styles.card}>
              {[1, 2, 3].map((i) => (
                <View key={i}>
                  <View style={styles.infoRow}>
                    <Skeleton width={34} height={34} borderRadius={borderRadius.sm} />
                    <View style={{ flex: 1, gap: spacing[1] }}>
                      <Skeleton width={70} height={11} borderRadius={borderRadius.sm} />
                      <Skeleton width={140} height={15} borderRadius={borderRadius.sm} />
                    </View>
                  </View>
                  {i < 3 && <View style={styles.rowDivider} />}
                </View>
              ))}
            </View>
          </View>

          {/* Contact card skeleton */}
          <View style={styles.section}>
            <View style={styles.card}>
              {[1, 2].map((i) => (
                <View key={i}>
                  <View style={styles.infoRow}>
                    <Skeleton width={34} height={34} borderRadius={borderRadius.sm} />
                    <View style={{ flex: 1, gap: spacing[1] }}>
                      <Skeleton width={50} height={11} borderRadius={borderRadius.sm} />
                      <Skeleton width={180} height={15} borderRadius={borderRadius.sm} />
                    </View>
                  </View>
                  {i < 2 && <View style={styles.rowDivider} />}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Real Content ─────────────────────────────────────────────────────────
  const isEditing = !!editingSection;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <GradientText style={styles.headerTitle}>Edit Profile</GradientText>
          <Text style={styles.headerSubtitle}>Update your personal information</Text>
        </View>

        {/* ── Avatar ── */}
        <View style={styles.section}>
          <View style={styles.avatarRow}>
            <TouchableOpacity
              onPress={handlePickImage}
              activeOpacity={0.85}
              style={styles.avatarContainer}
              disabled={avatarLoading}
            >
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={brandGradient}
                  start={brandGradientStart}
                  end={brandGradientEnd}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(profile?.name || editedUser.name || 'U')}
                  </Text>
                </LinearGradient>
              )}
              {/* Camera badge */}
              <View style={styles.cameraBadge}>
                <Camera size={14} color="#ffffff" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>

            <View style={styles.avatarMeta}>
              <Text style={styles.avatarName}>{profile?.name || 'Your Name'}</Text>
              {profile?.username ? (
                <Text style={styles.avatarUsername}>@{profile.username}</Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[2] }}>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={handlePickImage}
                  activeOpacity={0.8}
                >
                  <Camera size={13} color={colors.primary} strokeWidth={2} />
                  <Text style={styles.photoButtonText}>Change Photo</Text>
                </TouchableOpacity>
                {profile?.avatar_url && (
                  <TouchableOpacity
                    style={[styles.photoButton, styles.photoButtonDanger]}
                    onPress={handleDeleteAvatar}
                    activeOpacity={0.8}
                  >
                    <Trash2 size={13} color="#ef4444" strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* ── Error ── */}
        {saveError ? (
          <View style={styles.section}>
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{saveError}</Text>
            </View>
          </View>
        ) : null}

        {/* ── Personal Information ── */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Personal Information</Text>
              {!isEditing ? (
                <TouchableOpacity onPress={() => setEditingSection('personal')} activeOpacity={0.7}>
                  <Edit2 size={17} color={colors.primary} strokeWidth={2} />
                </TouchableOpacity>
              ) : null}
            </View>

            {editingSection === 'personal' ? (
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editedUser.name}
                    onChangeText={(t) => setEditedUser({ ...editedUser, name: t })}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <TextInput
                    style={styles.input}
                    value={editedUser.username}
                    onChangeText={(t) => setEditedUser({ ...editedUser, username: t })}
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
                    onChangeText={(t) => setEditedUser({ ...editedUser, bio: t })}
                    placeholder="Tell us about yourself"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                  />
                </View>
                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelEdit} activeOpacity={0.7}>
                    <X size={15} color={colors.textSecondary} strokeWidth={2} />
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <GradientButton
                    onPress={handleSaveProfile}
                    loading={saveLoading}
                    disabled={saveLoading}
                    style={{ flex: 1 }}
                  >
                    Save Changes
                  </GradientButton>
                </View>
              </View>
            ) : (
              <>
                <InfoRow icon={<User size={15} color={colors.primary} strokeWidth={2} />} label="Full Name" value={profile?.name || 'Not set'} />
                <View style={styles.rowDivider} />
                <InfoRow icon={<User size={15} color={colors.primary} strokeWidth={2} />} label="Username" value={profile?.username ? `@${profile.username}` : 'Not set'} />
                <View style={styles.rowDivider} />
                <InfoRow icon={<User size={15} color={colors.textMuted} strokeWidth={2} />} label="Bio" value={profile?.bio || 'Not set'} />
              </>
            )}
          </View>
        </View>

        {/* ── Contact Information ── */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Contact Information</Text>
              {!isEditing ? (
                <TouchableOpacity onPress={() => setEditingSection('contact')} activeOpacity={0.7}>
                  <Edit2 size={17} color={colors.primary} strokeWidth={2} />
                </TouchableOpacity>
              ) : null}
            </View>

            {editingSection === 'contact' ? (
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={styles.phoneRow}>
                    <View style={styles.countryCode}>
                      <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      value={editedUser.phone}
                      onChangeText={(t) => setEditedUser({ ...editedUser, phone: t.replace(/\D/g, '') })}
                      placeholder="10-digit number"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>
                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelEdit} activeOpacity={0.7}>
                    <X size={15} color={colors.textSecondary} strokeWidth={2} />
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <GradientButton
                    onPress={handleSaveProfile}
                    loading={saveLoading}
                    disabled={saveLoading}
                    style={{ flex: 1 }}
                  >
                    Save Changes
                  </GradientButton>
                </View>
              </View>
            ) : (
              <>
                <InfoRow icon={<Mail size={15} color={colors.primary} strokeWidth={2} />} label="Email" value={profile?.email || user?.email || 'Not set'} />
                <View style={styles.rowDivider} />
                <InfoRow
                  icon={<Phone size={15} color="#10b981" strokeWidth={2} />}
                  label="Phone"
                  value={
                    editedUser.phone
                      ? `+91 ${editedUser.phone}`
                      : 'Not set'
                  }
                />
              </>
            )}
          </View>
        </View>

        {/* ── Account Details ── */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Account Details</Text>
            </View>
            <InfoRow
              icon={<CalendarDays size={15} color="#f59e0b" strokeWidth={2} />}
              label="Member Since"
              value={
                user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : 'January 2024'
              }
            />
          </View>
        </View>

        {/* ── Danger Zone ── */}
        <View style={styles.section}>
          <View style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <Text style={styles.dangerDesc}>
              Permanently delete your account, data, tickets, and wallet. This cannot be undone.
            </Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDeleteAccount}
              disabled={deleteLoading}
              activeOpacity={0.8}
            >
              <Trash2 size={16} color="#ffffff" strokeWidth={2} />
              <Text style={styles.deleteBtnText}>
                {deleteLoading ? 'Deleting…' : 'Delete Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  headerSection: {
    paddingHorizontal: spacing[6],
    paddingTop: HEADER_TOP_OFFSET,
    paddingBottom: spacing[6],
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[1],
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
  },

  section: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[5],
  },

  // Avatar
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing[5],
    ...shadows.md,
  },
  avatarContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: '#000000',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  avatarMeta: { flex: 1 },
  avatarName: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  avatarUsername: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.primary,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: 'rgba(52,145,255,0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(52,145,255,0.25)',
  },
  photoButtonText: {
    fontSize: typography.fontSize.xs,
    fontFamily: getFontFamily('bold'),
    color: colors.primary,
  },
  photoButtonDanger: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.2)',
  },

  // Error
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: '#ef4444',
    fontFamily: getFontFamily('medium'),
  },

  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    overflow: 'hidden',
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[4],
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(52,145,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.primary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontFamily: getFontFamily('medium'),
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.borderMuted,
    marginHorizontal: spacing[5],
  },

  // Edit form
  editForm: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[5],
    gap: spacing[4],
  },
  inputGroup: {},
  inputLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: getFontFamily('medium'),
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontFamily: getFontFamily('medium'),
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  countryCode: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  countryCodeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: getFontFamily('medium'),
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
    alignItems: 'center',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  cancelBtnText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: getFontFamily('medium'),
  },

  // Danger zone
  dangerCard: {
    backgroundColor: 'rgba(239,68,68,0.05)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    padding: spacing[6],
    gap: spacing[4],
  },
  dangerTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: '#ef4444',
  },
  dangerDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    alignSelf: 'flex-start',
    backgroundColor: '#ef4444',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
  },
  deleteBtnText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: '#ffffff',
  },
});
