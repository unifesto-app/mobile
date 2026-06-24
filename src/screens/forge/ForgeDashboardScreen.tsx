import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Users, Calendar, CalendarClock, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getMyOrganiserSpaces, Space } from '../../lib/api/spaces';
import { spacing, typography, borderRadius } from '../../theme';
import { getFontFamily } from '../../theme/fontHelpers';

export default function ForgeDashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await getMyOrganiserSpaces();
      setSpaces(result || []);
    } catch (e) {
      console.error('Failed to load organiser spaces', e);
      setSpaces([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: spacing[5],
      paddingTop: insets.top + spacing[3],
      paddingBottom: spacing[3],
    },
    headerTitle: {
      fontSize: typography.fontSize['2xl'],
      color: colors.text,
      fontFamily: getFontFamily('bold'),
    },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
      marginTop: 2,
    },
    scrollContent: { paddingHorizontal: spacing[5], paddingBottom: 120 },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      padding: spacing[4],
      marginBottom: spacing[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    logo: {
      width: 52,
      height: 52,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoImg: { width: '100%', height: '100%' },
    logoText: {
      fontSize: typography.fontSize.lg,
      color: '#fff',
      fontFamily: getFontFamily('bold'),
    },
    cardContent: { flex: 1, gap: spacing[1] },
    spaceName: {
      fontSize: typography.fontSize.base,
      color: colors.text,
      fontFamily: getFontFamily('semibold'),
    },
    statsRow: { flexDirection: 'row', gap: spacing[3], marginTop: 2 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
    statText: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
    },
    emptyWrap: { alignItems: 'center', paddingVertical: spacing[12], gap: spacing[4] },
    emptyText: {
      fontSize: typography.fontSize.base,
      color: colors.textMuted,
      textAlign: 'center',
    },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      backgroundColor: colors.primary,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[5],
      borderRadius: borderRadius.lg,
    },
    ctaText: { color: '#fff', fontFamily: getFontFamily('bold'), fontSize: typography.fontSize.sm },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

  const renderStats = (space: Space) => {
    const members = space.member_count ?? space._count?.userRoles ?? 0;
    const events = space.event_count ?? space._count?.events ?? 0;
    return (
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Users size={13} color={colors.textMuted} strokeWidth={2} />
          <Text style={styles.statText}>{members} members</Text>
        </View>
        <View style={styles.statItem}>
          <Calendar size={13} color={colors.textMuted} strokeWidth={2} />
          <Text style={styles.statText}>{events} events</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingWrap]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Spaces you manage</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {spaces.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>You don't manage any spaces yet.</Text>
            <TouchableOpacity
              style={styles.cta}
              activeOpacity={0.85}
              onPress={() => Alert.alert('Coming soon', 'Space creation will be available soon.')}
            >
              <Plus size={16} color="#fff" strokeWidth={2.5} />
              <Text style={styles.ctaText}>Create Space</Text>
            </TouchableOpacity>
          </View>
        ) : (
          spaces.map((space) => {
            const logo = space.logoUrl || space.logo_url;
            return (
              <TouchableOpacity
                key={space.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => router.push(`/space/${space.id}`)}
              >
                <View style={styles.logo}>
                  {logo ? (
                    <Image source={{ uri: logo }} style={styles.logoImg} />
                  ) : (
                    <Text style={styles.logoText}>{getInitials(space.name)}</Text>
                  )}
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.spaceName} numberOfLines={1}>{space.name}</Text>
                  {renderStats(space)}
                </View>
                <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
