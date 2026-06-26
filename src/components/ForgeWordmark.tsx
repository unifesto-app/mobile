import React from 'react';
import { View, DimensionValue, Image } from 'react-native';

interface ForgeWordmarkProps {
  width?: DimensionValue;
  height?: DimensionValue;
}

export default function ForgeWordmark({ width = 120, height = 34 }: ForgeWordmarkProps) {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={require('../../assets/ForgeWordmark.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
}
