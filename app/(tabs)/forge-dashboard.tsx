import React from 'react';
import { View, StyleSheet } from 'react-native';
import ForgeDashboardScreen from '../../src/screens/forge/ForgeDashboardScreen';
import CustomHeader from '../../src/components/CustomHeader';

export default function ForgeDashboardTab() {
  return (
    <View style={styles.container}>
      <ForgeDashboardScreen />
      <CustomHeader />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
