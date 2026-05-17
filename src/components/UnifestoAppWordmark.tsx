import React from 'react';
import { View, DimensionValue, Image } from 'react-native';

interface UnifestoAppWordmarkProps {
  width?: DimensionValue;
  height?: DimensionValue;
}

export default function UnifestoAppWordmark({ width = 122, height = 40 }: UnifestoAppWordmarkProps) {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={require('../../assets/UnifestoAppWordmark.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
}
