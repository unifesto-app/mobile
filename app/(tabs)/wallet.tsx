import React from 'react';
import { View, StyleSheet } from 'react-native';
import WalletScreen from '../../src/screens/WalletScreen';
import { useTheme } from '../../src/context/ThemeContext';

export default function WalletTab() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });

  return (
    <View style={styles.container}>
      <WalletScreen />
    </View>
  );
}
