import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle, Users, Search } from 'lucide-react-native';
import CustomHeader from '../../src/components/CustomHeader';
import { spacing, typography, borderRadius, shadows } from '../../src/theme';
import { getFontFamily } from '../../src/theme/fontHelpers';
import { useTheme } from '../../src/context/ThemeContext';

// Space needed to clear the transparent gradient header
const HEADER_TOP_OFFSET = 150;

export default function ChatTab() {
  const router = useRouter();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingTop: HEADER_TOP_OFFSET,
      paddingBottom: 100,
    },
    emptyStateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[12],
    },
    emptyStateIcon: {
      marginBottom: spacing[6],
    },
    emptyStateTitle: {
      fontSize: typography.fontSize['2xl'],
      color: colors.text,
      fontFamily: getFontFamily('bold'),
      marginBottom: spacing[3],
      textAlign: 'center',
    },
    emptyStateDescription: {
      fontSize: typography.fontSize.base,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
      marginBottom: spacing[6],
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      backgroundColor: colors.primary,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.lg,
      ...shadows.md,
    },
    actionButtonText: {
      fontSize: typography.fontSize.base,
      color: colors.text,
      fontFamily: getFontFamily('bold'),
    },
    featuresList: {
      marginTop: spacing[8],
      gap: spacing[4],
      width: '100%',
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      backgroundColor: colors.card,
      padding: spacing[4],
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderMuted,
    },
    featureIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(52, 145, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      fontFamily: getFontFamily('semibold'),
      marginBottom: spacing[1],
    },
    featureDescription: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
    },
  });

  return (
    <View style={styles.container}>
      <CustomHeader />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIcon}>
            <MessageCircle size={80} color={colors.primary} strokeWidth={1.5} />
          </View>

          <Text style={styles.emptyStateTitle}>Coming Soon</Text>
          
          <Text style={styles.emptyStateDescription}>
            Connect with fellow attendees, organizers, and community members. Chat feature will be available soon!
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <MessageCircle size={20} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Direct Messages</Text>
                <Text style={styles.featureDescription}>
                  Send private messages to other attendees
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Users size={20} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Group Chats</Text>
                <Text style={styles.featureDescription}>
                  Join event and space group conversations
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Search size={20} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Discover People</Text>
                <Text style={styles.featureDescription}>
                  Find and connect with people in your community
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
