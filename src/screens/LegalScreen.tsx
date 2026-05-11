import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

const LEGAL_LINKS = [
  {
    id: 'terms',
    title: 'Terms of Service',
    description: 'Read our terms and conditions',
    icon: FileText,
    url: 'https://www.unifesto.app/terms',
  },
  {
    id: 'refund',
    title: 'Refund Policy',
    description: 'Learn about our refund process',
    icon: FileText,
    url: 'https://www.unifesto.app/refund',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    description: 'Learn how we protect your data',
    icon: Shield,
    url: 'https://www.unifesto.app/privacy',
  },
];

export default function LegalScreen() {
  const navigation = useNavigation<any>();

  const handleOpenLink = (url: string, title: string) => {
    Linking.openURL(url).catch(() => {
      console.error('Failed to open URL:', url);
    });
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
        <Text style={styles.headerTitle}>Legal</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Shield size={24} color={colors.primary} strokeWidth={2} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Your Privacy Matters</Text>
            <Text style={styles.infoText}>
              We're committed to protecting your privacy and being transparent about how we use your data.
            </Text>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.card}>
          {LEGAL_LINKS.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.legalItem}
                  onPress={() => handleOpenLink(item.url, item.title)}
                  activeOpacity={0.7}
                >
                  <View style={styles.legalLeft}>
                    <View style={styles.legalIcon}>
                      <Icon size={20} color={colors.textSecondary} strokeWidth={2} />
                    </View>
                    <View style={styles.legalContent}>
                      <Text style={styles.legalTitle}>{item.title}</Text>
                      <Text style={styles.legalDescription}>{item.description}</Text>
                    </View>
                  </View>
                  <ExternalLink size={18} color={colors.textMuted} strokeWidth={2} />
                </TouchableOpacity>
                {index < LEGAL_LINKS.length - 1 && (
                  <View style={styles.legalDivider} />
                )}
              </View>
            );
          })}
        </View>

        {/* App Info */}
        <View style={styles.appInfoCard}>
          <Text style={styles.appInfoTitle}>Unifesto</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          <Text style={styles.appInfoCopyright}>
            © 2026 Unifesto. All rights reserved.
          </Text>
        </View>

        {/* Contact Card */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactText}>
            If you have questions about our legal policies, please contact us at:
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:legal@unifesto.app')}
            activeOpacity={0.7}
          >
            <Text style={styles.contactEmail}>legal@unifesto.app</Text>
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
  infoCard: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[5],
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(52, 145, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.1)',
    marginBottom: spacing[6],
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    marginBottom: spacing[6],
    ...shadows.md,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
  },
  legalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
    paddingRight: spacing[3],
  },
  legalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalContent: {
    flex: 1,
  },
  legalTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  legalDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  legalDivider: {
    height: 1,
    backgroundColor: colors.borderMuted,
    marginVertical: spacing[2],
  },
  appInfoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    marginBottom: spacing[6],
    ...shadows.sm,
  },
  appInfoTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  appInfoVersion: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  appInfoCopyright: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  contactCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.sm,
  },
  contactTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[2],
  },
  contactText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[3],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  contactEmail: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.primary,
  },
});
