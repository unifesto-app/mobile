import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { gradientTextColors } from '../theme';

interface GradientTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export default function GradientText({ children, style }: GradientTextProps) {
  return (
    <MaskedView
      maskElement={
        <Text style={[{ backgroundColor: 'transparent' }, style]}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={[gradientTextColors.start, gradientTextColors.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
