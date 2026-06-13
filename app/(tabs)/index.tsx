import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomHeader from '../../src/components/CustomHeader';
import DiscoverScreen from '../../src/screens/DiscoverScreen';
import { useTheme } from '../../src/context/ThemeContext';

export default function DiscoverTab() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CustomHeader />
      <DiscoverScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});