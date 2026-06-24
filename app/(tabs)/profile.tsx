import React from 'react';
import { View, StyleSheet } from 'react-native';
import ProfileScreen from '../../src/screens/ProfileScreen';
import { useTheme } from '../../src/context/ThemeContext';

export default function ProfileTab() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ProfileScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
