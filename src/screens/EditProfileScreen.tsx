import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { UnIcon } from '@unifesto/unicon/react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Skeleton from '../components/Skeleton';
import * as AuthAPI from '../lib/api/auth';
import {
  spacing,
  typography,
  borderRadius,
  shadows,
  brandGradient,
  brandGradientStart,
  brandGradientEnd,
} from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

export default function EditProfileScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthAPI.User | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Auto-save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user || !token) {
      router.back();
      return;
    }

    try {
      setLoading(true);
      const userProfile = await AuthAPI.getCurrentUser(token);
      setProfile(userProfile);
      
      // Populate form
      setFullName(userProfile.fullName || '');
      setBio(userProfile.bio || '');
      setGender(userProfile.gender || '');
      setLinkedinUrl(userProfile.linkedinUrl || '');
      setInstagramUrl(userProfile.instagramUrl || '');
      setGithubUrl(userProfile.githubUrl || '');
      setWebsiteUrl(userProfile.websiteUrl || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!token || isSaving) return;

    try {
      setIsSaving(true);

      // Upload avatar if changed
      if (avatarUri) {
        await AuthAPI.uploadAvatar(token, avatarUri);
        setAvatarUri(null); // Clear after upload
      }

      // Update profile
      await AuthAPI.updateUserProfile(token, {
        fullName: fullName.trim() || undefined,
        bio: bio.trim() || undefined,
        gender: gender || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
      });
    } catch (error: any) {
      console.error('Failed to auto-save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerAutoSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1000); // Save 1 second after user stops typing
  };

  useEffect(() => {
    if (!loading && profile) {
      triggerAutoSave();
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [fullName, bio, gender, linkedinUrl, instagramUrl, githubUrl, websiteUrl]);

  useEffect(() => {
    if (avatarUri) {
      autoSave();
    }
  }, [avatarUri]);

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
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
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
    // Avatar Section
    avatarSection: {
      alignItems: 'center',
      marginBottom: spacing[8],
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: spacing[3],
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarGradient: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: typography.fontSize['3xl'],
      fontFamily: getFontFamily('bold'),
      color: '#000000',
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.background,
    },
    changePhotoText: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('semibold'),
      color: colors.primary,
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
    // Input Group
    inputGroup: {
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
    },
    inputLabel: {
      fontSize: typography.fontSize.xs,
      fontFamily: getFontFamily('normal'),
      color: colors.textMuted,
      marginBottom: spacing[2],
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    input: {
      flex: 1,
      fontSize: typography.fontSize.base,
      fontFamily: getFontFamily('semibold'),
      color: colors.text,
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    textArea: {
      minHeight: 60,
      textAlignVertical: 'top',
      fontFamily: getFontFamily('bold'),
      paddingTop: spacing[2],
    },
    inputDivider: {
      height: 1,
      backgroundColor: colors.borderMuted,
      marginLeft: 72,
      marginRight: spacing[5],
    },
    // Hint
    hint: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
      textAlign: 'center',
      paddingHorizontal: spacing[6],
      marginTop: spacing[4],
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 20 }]}
        >
          {/* Avatar Skeleton */}
          <View style={styles.avatarSection}>
            <Skeleton width={100} height={100} borderRadius={50} style={{ marginBottom: spacing[3] }} />
            <Skeleton width={90} height={14} borderRadius={borderRadius.sm} />
          </View>

          {/* Basic Information Skeleton */}
          <View style={styles.sectionSpacing}>
            <Skeleton width={130} height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[3] }} />
            <View style={styles.card}>
              {[1, 2].map((i) => (
                <View key={i}>
                  <View style={styles.inputGroup}>
                    <Skeleton width={70} height={12} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
                    <View style={styles.inputRow}>
                      <Skeleton width={36} height={36} borderRadius={borderRadius.md} />
                      <Skeleton width={150} height={18} borderRadius={borderRadius.md} />
                    </View>
                  </View>
                  {i < 2 && <View style={styles.inputDivider} />}
                </View>
              ))}
            </View>
          </View>

          {/* Social Links Skeleton */}
          <View style={styles.sectionSpacing}>
            <Skeleton width={90} height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[3] }} />
            <View style={styles.card}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i}>
                  <View style={styles.inputGroup}>
                    <Skeleton width={60} height={12} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
                    <View style={styles.inputRow}>
                      <Skeleton width={36} height={36} borderRadius={borderRadius.md} />
                      <Skeleton width={120} height={18} borderRadius={borderRadius.md} />
                    </View>
                  </View>
                  {i < 4 && <View style={styles.inputDivider} />}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  const displayName = fullName || profile?.fullName || 'User';
  const currentAvatarUrl = avatarUri || profile?.avatarUrl;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              {currentAvatarUrl ? (
                <Image source={{ uri: currentAvatarUrl }} style={styles.avatarImage} />
              ) : (
                <LinearGradient
                  colors={brandGradient}
                  start={brandGradientStart}
                  end={brandGradientEnd}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(displayName)}
                  </Text>
                </LinearGradient>
              )}
            </View>
            <View style={styles.cameraBadge}>
              <Camera size={16} color="#ffffff" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.sectionSpacing}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <View style={styles.inputRow}>
                <View style={styles.iconWrapper}>
                  <UnIcon name="profile" size={32} />
                </View>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="..."
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputDivider} />

            {/* Bio */}
            <View style={styles.inputGroup}>
              <View style={styles.inputRow}>
                <View style={styles.iconWrapper}>
                  <UnIcon name="file-text" size={32} />
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Say about yourself"
                  placeholderTextColor={colors.textMuted}
                  multiline
                />
              </View>
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 8, marginLeft: 4 }}>Gender</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: 4 }}>
                {[
                  { label: 'Male', value: 'MALE' },
                  { label: 'Female', value: 'FEMALE' },
                  { label: 'Other', value: 'NON_BINARY' },
                  { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setGender(gender === option.value ? '' : option.value)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: gender === option.value ? 'rgba(52, 145, 255, 0.1)' : colors.backgroundSecondary,
                      borderWidth: 1,
                      borderColor: gender === option.value ? colors.primary : colors.borderMuted,
                    }}
                  >
                    <Text style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: gender === option.value ? colors.primary : colors.textSecondary,
                    }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.sectionSpacing}>
          <Text style={styles.sectionTitle}>Social Links</Text>
          <View style={styles.card}>
            {/* LinkedIn */}
            <View style={styles.inputGroup}>
              <View style={styles.inputRow}>
                <View style={styles.iconWrapper}>
                  <UnIcon name="linkedin" size={32} />
                </View>
                <TextInput
                  style={styles.input}
                  value={linkedinUrl}
                  onChangeText={setLinkedinUrl}
                  placeholder="https://www.linkedin.com/in/..."
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>
            </View>

            <View style={styles.inputDivider} />

            {/* Instagram */}
            <View style={styles.inputGroup}>
              <View style={styles.inputRow}>
                <View style={styles.iconWrapper}>
                  <UnIcon name="instagram" size={32} />
                </View>
                <TextInput
                  style={styles.input}
                  value={instagramUrl}
                  onChangeText={setInstagramUrl}
                  placeholder="https://www.instagram.com/..."
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>
            </View>

            <View style={styles.inputDivider} />

            {/* GitHub */}
            <View style={styles.inputGroup}>
              <View style={styles.inputRow}>
                <View style={styles.iconWrapper}>
                  <UnIcon name="github" size={32} />
                </View>
                <TextInput
                  style={styles.input}
                  value={githubUrl}
                  onChangeText={setGithubUrl}
                  placeholder="https://www.github.com/..."
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>
            </View>

            <View style={styles.inputDivider} />

            {/* Website */}
            <View style={styles.inputGroup}>
              <View style={styles.inputRow}>
                <View style={styles.iconWrapper}>
                  <UnIcon name="globe" size={32} />
                </View>
                <TextInput
                  style={styles.input}
                  value={websiteUrl}
                  onChangeText={setWebsiteUrl}
                  placeholder="https://www.example.com/..."
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Hint */}
        <Text style={styles.hint}>
          You can edit your username in Account Settings. Changes are saved automatically.
        </Text>
      </ScrollView>
    </View>
  );
}
