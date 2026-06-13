import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import * as ImagePicker from 'expo-image-picker';
import { UnIcon, IconName } from '@unifesto/unicon/react-native';
import { useTheme } from '../context/ThemeContext';
import {
  spacing,
  typography,
  borderRadius,
  shadows,
} from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

type PermStatus = 'granted' | 'denied' | 'undetermined';

type PermItem = {
  key: string;
  label: string;
  description: string;
  iconName: IconName;
  status: PermStatus;
  iosOnly?: boolean;
};

const STATUS_COLOR: Record<PermStatus, string> = {
  granted: '#10b981',
  denied: '#ef4444',
  undetermined: '#f59e0b',
};
const STATUS_LABEL: Record<PermStatus, string> = {
  granted: 'Allowed',
  denied: 'Denied',
  undetermined: 'Not Set',
};

export default function PermissionsScreen() {
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();
  const [perms, setPerms] = useState<PermItem[]>([
    {
      key: 'camera',
      label: 'Camera',
      description: 'Scan QR tickets and capture profile photos',
      iconName: 'camera',
      status: 'undetermined',
    },
    {
      key: 'mediaLibrary',
      label: 'Photo Library',
      description: 'Upload images for your profile',
      iconName: 'photo',
      status: 'undetermined',
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const checkPermissions = useCallback(async () => {
    const camResult = await ImagePicker.getCameraPermissionsAsync();
    const camStatus: PermStatus =
      camResult.status === 'granted' ? 'granted'
        : camResult.status === 'denied' ? 'denied'
        : 'undetermined';

    const libResult = await ImagePicker.getMediaLibraryPermissionsAsync();
    const libStatus: PermStatus =
      libResult.status === 'granted' ? 'granted'
        : libResult.status === 'denied' ? 'denied'
        : 'undetermined';

    setPerms((prev) =>
      prev.map((p) => {
        if (p.key === 'camera') return { ...p, status: camStatus };
        if (p.key === 'mediaLibrary') return { ...p, status: libStatus };
        return p;
      })
    );
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkPermissions();
    setRefreshing(false);
  }, [checkPermissions]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const visiblePerms = perms.filter((p) => !p.iosOnly || Platform.OS === 'ios');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingTop: spacing[4],
      paddingBottom: 100,
      paddingHorizontal: spacing[6],
    },
    section: {
      marginBottom: spacing[6],
    },
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('normal'),
      color: colors.textMuted,
      marginBottom: spacing[3],
      paddingLeft: spacing[1],
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius['2xl'],
      overflow: 'hidden',
      ...shadows.lg,
    },
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
      fontSize: typography.fontSize.base,
      fontFamily: getFontFamily('semibold'),
      color: colors.text,
      marginBottom: 2,
    },
    menuItemDesc: {
      fontSize: typography.fontSize.xs,
      fontFamily: getFontFamily('normal'),
      color: colors.textMuted,
    },
    statusBadge: {
      alignItems: 'center',
      gap: 4,
      minWidth: 52,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 10,
      fontFamily: getFontFamily('bold'),
      textAlign: 'center',
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.borderMuted,
      marginLeft: 72,
      marginRight: spacing[5],
    },
    hint: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
      textAlign: 'center',
      paddingHorizontal: spacing[2],
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Permission rows */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Permissions</Text>
          <View style={styles.card}>
            {visiblePerms.map((perm, index) => (
              <View key={perm.key}>
                <View style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconContainer}>
                      <UnIcon name={perm.iconName} size={32} />
                    </View>
                    <View style={styles.menuItemTextContainer}>
                      <Text style={styles.menuItemLabel}>{perm.label}</Text>
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <View style={[styles.dot, { backgroundColor: STATUS_COLOR[perm.status] }]} />
                    <Text style={[styles.statusText, { color: STATUS_COLOR[perm.status] }]}>
                      {STATUS_LABEL[perm.status]}
                    </Text>
                  </View>
                </View>
                {index < visiblePerms.length - 1 && <View style={styles.menuDivider} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}