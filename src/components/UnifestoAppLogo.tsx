import React from 'react';
import { View, DimensionValue, Image } from 'react-native';

interface UnifestoAppLogoProps {
  width?: DimensionValue;
  height?: DimensionValue;
}

export default function UnifestoAppLogo({ width = 160, height = 90 }: UnifestoAppLogoProps) {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={require('../../assets/UnifestoAppLogo.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
}
