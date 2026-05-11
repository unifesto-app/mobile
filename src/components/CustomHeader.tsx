import React from 'react';
import { View, StyleSheet, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HeadphonesIcon, Wallet } from 'lucide-react-native';
import Logo from './Logo';
import { colors, spacing } from '../theme';

export default function CustomHeader() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo on the left */}
        <View style={styles.logoContainer}>
          <Logo size={Platform.OS === 'android' ? 32 : 36} showIcon={false} />
        </View>

        {/* Action buttons on the right */}
        <View style={styles.actionButtons}>
          {/* Wallet button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Wallet')}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Wallet size={20} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>

          {/* Support button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Support')}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <HeadphonesIcon size={20} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 58, 138, 0.6)',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    height: 64,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
  },
});
