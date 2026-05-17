import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import {
  Camera,
  Image as ImageIcon,
  Eye,
  ExternalLink,
  RefreshCw,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import GlassyButton from '../components/GlassyButton';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

type PermStatus = 'granted' | 'denied' | 'undetermined';

type PermItem = {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
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
  const [perms, setPerms] = useState<PermItem[]>([
    {
      key: 'camera',
      label: 'Camera',
      description: 'Scan QR tickets and capture profile photos',
      icon: <Camera size={16} color="#3491ff" strokeWidth={2} />,
      status: 'undetermined',
    },
    {
      key: 'mediaLibrary',
      label: 'Photo Library',
      description: 'Upload images for your profile',
      icon: <ImageIcon size={16} color="#ec4899" strokeWidth={2} />,
      status: 'undetermined',
    },
  ]);
  const [checking, setChecking] = useState(true);

  const checkPermissions = useCallback(async () => {
    setChecking(true);

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
    setChecking(false);
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const openSettings = () => Linking.openSettings();

  const visiblePerms = perms.filter((p) => !p.iosOnly || Platform.OS === 'ios');

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Permission rows */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>App Permissions</Text>
          <View style={styles.card}>
            {visiblePerms.map((perm, index) => (
              <View key={perm.key}>
                <View style={styles.row}>
                  <GlassyButton size={36} variant="dark" shape="square" disabled>
                    {perm.icon}
                  </GlassyButton>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{perm.label}</Text>
                    <Text style={styles.rowDesc}>{perm.description}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <View style={[styles.dot, { backgroundColor: STATUS_COLOR[perm.status] }]} />
                    <Text style={[styles.statusText, { color: STATUS_COLOR[perm.status] }]}>
                      {STATUS_LABEL[perm.status]}
                    </Text>
                  </View>
                </View>
                {index < visiblePerms.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={checkPermissions}
              activeOpacity={0.8}
            >
              <RefreshCw
                size={15}
                color={colors.primary}
                strokeWidth={2}
                style={checking ? { opacity: 0.4 } : undefined}
              />
              <Text style={styles.actionBtnText}>
                {checking ? 'Checking…' : 'Refresh'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={openSettings}
              activeOpacity={0.8}
            >
              <ExternalLink size={15} color="#000000" strokeWidth={2} />
              <Text style={styles.actionBtnTextPrimary}>Open Settings</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            To change a permission tap "Open Settings" and adjust it under Unifesto's app permissions.
          </Text>
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
  // Matches ProfileScreen card — borderless, deep shadow
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
  rowText: { flex: 1 },
  rowLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('semibold'),
    color: colors.text,
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: getFontFamily('normal'),
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
  // Inset divider
  divider: {
    height: 1,
    backgroundColor: colors.borderMuted,
    marginLeft: 72,
    marginRight: spacing[4],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: 'rgba(52,145,255,0.08)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(52,145,255,0.2)',
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionBtnText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.primary,
  },
  actionBtnTextPrimary: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: '#000000',
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
