/**
 * New Account/Edit Profile Screen
 * Allows users to edit their profile information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera,
  User,
  AtSign,
  FileText,
  Linkedin,
  Instagram,
  Github,
  Globe,
  Phone,
  CheckCircle,
} from 'lucide-react-native';
import { useAuth } from '../context/NewAuthContext';
import * as AuthAPI from '../lib/api/auth';
import GradientText from '../components/GradientText';
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

export default function NewAccountScreen() {
  const router = useRouter();
  const { user, accessToken, refreshSession } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<AuthAPI.User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    bio: '',
    linkedinUrl: '',
    instagramUrl: '',
    githubUrl: '',
    websiteUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!accessToken) {
      router.replace('/login');
      return;
    }

    try {
      const userProfile = await AuthAPI.getCurrentUser(accessToken);
      setProfile(userProfile);
      setFormData({
        username: userProfile.username || '',
        fullName: userProfile.fullName || '',
        bio: userProfile.bio || '',
        linkedinUrl: userProfile.linkedinUrl || '',
        instagramUrl: userProfile.instagramUrl || '',
        githubUrl: userProfile.githubUrl || '',
        websiteUrl: userProfile.websiteUrl || '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.username) {
      const usernameRegex = /^[a-z0-9_]{3,50}$/;
      if (!usernameRegex.test(formData.username)) {
        newErrors.username = 'Username must be 3-50 characters, lowercase letters, numbers, and underscores only';
      }
    }

    if (formData.fullName && formData.fullName.length > 255) {
      newErrors.fullName = 'Name must be less than 255 characters';
    }

    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = 'Bio must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!accessToken) return;

    setIsSaving(true);

    try {
      const updateData: any = {};
      if (formData.username !== profile?.username) updateData.username = formData.username;
      if (formData.fullName !== profile?.fullName) updateData.fullName = formData.fullName;
      if (formData.bio !== profile?.bio) updateData.bio = formData.bio;
      if (formData.linkedinUrl !== profile?.linkedinUrl) updateData.linkedinUrl = formData.linkedinUrl;
      if (formData.instagramUrl !== profile?.instagramUrl) updateData.instagramUrl = formData.instagramUrl;
      if (formData.githubUrl !== profile?.githubUrl) updateData.githubUrl = formData.githubUrl;
      if (formData.websiteUrl !== profile?.websiteUrl) updateData.websiteUrl = formData.websiteUrl;

      if (Object.keys(updateData).length === 0) {
        Alert.alert('No Changes', 'No changes to save');
        return;
      }

      const updatedProfile = await AuthAPI.updateUserProfile(accessToken, updateData);
      setProfile(updatedProfile);
      await refreshSession();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access to change your avatar');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUploadAvatar(result.assets[0].uri);
    }
  };

  const handleUploadAvatar = async (uri: string) => {
    if (!accessToken) return;

    setIsUploadingAvatar(true);

    try {
      const { avatarUrl } = await AuthAPI.uploadAvatar(accessToken, uri);
      setProfile(prev => prev ? { ...prev, avatarUrl } : null);
      await refreshSession();
      Alert.alert('Success', 'Avatar updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={brandGradient}
                start={brandGradientStart}
                end={brandGradientEnd}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {getInitials(formData.fullName || 'User')}
                </Text>
              </LinearGradient>
            )}
            {isUploadingAvatar && (
              <View style={styles.avatarLoading}>
                <ActivityIndicator size="small" color={colors.text} />
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.changeAvatarButton}
            onPress={handlePickImage}
            disabled={isUploadingAvatar}
            activeOpacity={0.7}
          >
            <Camera size={16} color={colors.primary} strokeWidth={2} />
            <Text style={styles.changeAvatarText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mobile Number</Text>
          <View style={styles.inputWrapper}>
            <Phone size={20} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.mobileText}>{profile?.mobileNumber}</Text>
            {profile?.mobileVerified && (
              <CheckCircle size={16} color="#10b981" strokeWidth={2} />
            )}
          </View>
          <Text style={styles.helperText}>
            Your mobile number is verified and cannot be changed
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Username</Text>
          <View style={[styles.inputWrapper, errors.username && styles.inputError]}>
            <AtSign size={20} color={colors.textMuted} strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor={colors.textMuted}
              value={formData.username}
              onChangeText={(text) => handleInputChange('username', text.toLowerCase())}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
          <Text style={styles.helperText}>
            Lowercase letters, numbers, and underscores only
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Name</Text>
          <View style={[styles.inputWrapper, errors.fullName && styles.inputError]}>
            <User size={20} color={colors.textMuted} strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor={colors.textMuted}
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              autoCapitalize="words"
            />
          </View>
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper, errors.bio && styles.inputError]}>
            <FileText size={20} color={colors.textMuted} strokeWidth={2} style={styles.textAreaIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about yourself"
              placeholderTextColor={colors.textMuted}
              value={formData.bio}
              onChangeText={(text) => handleInputChange('bio', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
          <Text style={styles.helperText}>
            {formData.bio.length}/1000 characters
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Links</Text>
          
          <View style={styles.inputWrapper}>
            <Linkedin size={20} color="#0077b5" strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder="LinkedIn URL"
              placeholderTextColor={colors.textMuted}
              value={formData.linkedinUrl}
              onChangeText={(text) => handleInputChange('linkedinUrl', text)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View style={[styles.inputWrapper, { marginTop: spacing[3] }]}>
            <Instagram size={20} color="#e4405f" strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder="Instagram URL"
              placeholderTextColor={colors.textMuted}
              value={formData.instagramUrl}
              onChangeText={(text) => handleInputChange('instagramUrl', text)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View style={[styles.inputWrapper, { marginTop: spacing[3] }]}>
            <Github size={20} color={colors.text} strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder="GitHub URL"
              placeholderTextColor={colors.textMuted}
              value={formData.githubUrl}
              onChangeText={(text) => handleInputChange('githubUrl', text)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View style={[styles.inputWrapper, { marginTop: spacing[3] }]}>
            <Globe size={20} color={colors.primary} strokeWidth={2} />
            <TextInput
              style={styles.input}
              placeholder="Website URL"
              placeholderTextColor={colors.textMuted}
              value={formData.websiteUrl}
              onChangeText={(text) => handleInputChange('websiteUrl', text)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingTop: Platform.OS === 'ios' ? spacing[12] : spacing[8],
    paddingBottom: spacing[4],
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  backButton: {
    padding: spacing[2],
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  saveButton: {
    padding: spacing[2],
    minWidth: 60,
    alignItems: 'flex-end',
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[6],
    paddingBottom: spacing[12],
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: spacing[4],
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  avatarText: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  changeAvatarText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('semibold'),
    color: colors.primary,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('semibold'),
    color: colors.text,
    marginBottom: spacing[3],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    ...shadows.sm,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: spacing[3],
  },
  textAreaIcon: {
    marginTop: spacing[1],
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginLeft: spacing[3],
    fontFamily: getFontFamily('normal'),
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  mobileText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginLeft: spacing[3],
    fontFamily: getFontFamily('semibold'),
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing[2],
    marginLeft: spacing[1],
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing[2],
    marginLeft: spacing[1],
  },
});
