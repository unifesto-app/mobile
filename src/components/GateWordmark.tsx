import React from 'react';
import { View, DimensionValue, Image } from 'react-native';

interface GateWordmarkProps {
  width?: DimensionValue;
  height?: DimensionValue;
}

export default function GateWordmark({ width = 120, height = 34 }: GateWordmarkProps) {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={require('../../assets/GateWordmark.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
}
