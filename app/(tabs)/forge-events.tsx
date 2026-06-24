import React from 'react';
import { View, StyleSheet } from 'react-native';
import ForgeEventsScreen from '../../src/screens/forge/ForgeEventsScreen';
import CustomHeader from '../../src/components/CustomHeader';

export default function ForgeEventsTab() {
  return (
    <View style={styles.container}>
      <ForgeEventsScreen />
      <CustomHeader />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
