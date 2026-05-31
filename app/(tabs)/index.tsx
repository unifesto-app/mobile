import React from 'react';
import { View } from 'react-native';
import CustomHeader from '../../src/components/CustomHeader';
import DiscoverScreen from '../../src/screens/DiscoverScreen';

export default function DiscoverTab() {
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader />
      <DiscoverScreen />
    </View>
  );
}