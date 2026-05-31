import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import CustomHeader from '../../src/components/CustomHeader';
import { colors, spacing, typography } from '../../src/theme';
import { getFontFamily } from '../../src/theme/fontHelpers';

export default function WalletTab() {
  return (
    <View style={styles.container}>
      <CustomHeader />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Wallet</Text>
        <Text style={styles.subtitle}>Your tickets and transactions</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[6],
    paddingTop: 180, // Space for header
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('normal'),
    color: colors.textSecondary,
  },
});
