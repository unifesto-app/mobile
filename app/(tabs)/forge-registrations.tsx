import React from 'react';
import { View, StyleSheet } from 'react-native';
import ForgeRegistrationsScreen from '../../src/screens/forge/ForgeRegistrationsScreen';
import CustomHeader from '../../src/components/CustomHeader';

export default function ForgeRegistrationsTab() {
  return (
    <View style={styles.container}>
      <ForgeRegistrationsScreen />
      <CustomHeader />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
