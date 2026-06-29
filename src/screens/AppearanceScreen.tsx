import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Check, Monitor, Moon, Palette, Sun } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassyButton from '../components/GlassyButton';
import { useTheme } from '../context/ThemeContext';
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

export default function AppearanceScreen() {
  const { theme, setTheme, colors } = useTheme();

  const THEMES = [
    {
      key: 'dark' as const,
      label: 'Dark',
      description: 'Easy on the eyes, always on',
      icon: <Moon size={16} color={theme === 'dark' ? colors.primary : colors.textMuted} />,
      active: theme === 'dark',
      disabled: false,
    },
    {
      key: 'light' as const,
      label: 'Light',
      description: 'Bright and clean',
      icon: <Sun size={16} color={false ? colors.primary : colors.textMuted} />,
      active: false,
      disabled: false,
    },
    {
      key: 'system' as const,
      label: 'System Default',
      description: 'Follow system settings',
      icon: <Monitor size={16} color={false ? colors.primary : colors.textMuted} />,
      active: false,
      disabled: false,
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingTop: spacing[6],
      paddingBottom: 100,
    },
    section: {
      paddingHorizontal: spacing[6],
      marginBottom: spacing[6],
    },
    sectionLabel: {
      fontSize: typography.fontSize.xs,
      fontFamily: getFontFamily('bold'),
      color: colors.textMuted,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: spacing[3],
      paddingLeft: spacing[1],
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius['2xl'],
      overflow: 'hidden',
      ...shadows.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      gap: spacing[3],
    },
    rowDisabled: {
      opacity: 0.45,
    },
    rowText: { flex: 1 },
    rowLabel: {
      fontSize: typography.fontSize.base,
      fontFamily: getFontFamily('semibold'),
      color: colors.text,
      marginBottom: 2,
    },
    rowLabelDisabled: {
      color: colors.textMuted,
    },
    rowDesc: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
    },
    rowDescDisabled: {
      color: colors.textMuted,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderMuted,
      marginLeft: 72,
      marginRight: spacing[4],
    },
    checkCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing[3],
      backgroundColor: 'rgba(52,145,255,0.05)',
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: 'rgba(52,145,255,0.15)',
      padding: spacing[5],
    },
    infoText: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      fontFamily: getFontFamily('normal'),
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Theme</Text>
          <View style={styles.card}>
            {THEMES.map((theme, index) => (
              <View key={theme.key}>
                <TouchableOpacity
                  style={[styles.row, theme.disabled && styles.rowDisabled]}
                  activeOpacity={theme.disabled ? 1 : 0.7}
                  disabled={theme.disabled}
                  onPress={() => !theme.disabled && setTheme(theme.key)}
                >
                  <GlassyButton size={36} variant="dark" shape="square" disabled>
                    {theme.icon}
                  </GlassyButton>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowLabel, theme.disabled && styles.rowLabelDisabled]}>
                      {theme.label}
                    </Text>
                    <Text style={[styles.rowDesc, theme.disabled && styles.rowDescDisabled]}>
                      {theme.description}
                    </Text>
                  </View>
                  {theme.active && (
                    <LinearGradient
                      colors={brandGradient}
                      start={brandGradientStart}
                      end={brandGradientEnd}
                      style={styles.checkCircle}
                    >
                      <Check size={12} color="#000"  weight="bold" />
                    </LinearGradient>
                  )}
                </TouchableOpacity>
                {index < THEMES.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Palette size={18} color={colors.primary} />
            <Text style={styles.infoText}>
              Switch between light and dark themes, or follow your system settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
