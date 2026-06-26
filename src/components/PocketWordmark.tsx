import React from 'react';
import { View, DimensionValue, Image } from 'react-native';

interface PocketWordmarkProps {
  width?: DimensionValue;
  height?: DimensionValue;
}

export default function PocketWordmark({ width = 120, height = 34 }: PocketWordmarkProps) {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={require('../../assets/PocketWordmark.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
}
