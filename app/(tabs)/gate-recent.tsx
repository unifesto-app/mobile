import React from 'react';
import { View, StyleSheet } from 'react-native';
import GateRecentScreen from '../../src/screens/gate/GateRecentScreen';
import CustomHeader from '../../src/components/CustomHeader';

export default function GateRecentTab() {
  return (
    <View style={styles.container}>
      <GateRecentScreen />
      <CustomHeader />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
