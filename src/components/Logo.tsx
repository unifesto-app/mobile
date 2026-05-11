import React from 'react';
import { View, Text, StyleSheet, TextStyle, StyleProp, Image, ViewStyle, Platform } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { gradientTextColors, typography, spacing } from '../theme';

interface LogoProps {
  size?: number;
  style?: StyleProp<TextStyle>;
  showIcon?: boolean;
  iconSize?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function Logo({ 
  size = 48, 
  style, 
  showIcon = false, 
  iconSize = 32,
  containerStyle 
}: LogoProps) {
  const logoText = Platform.OS === 'android' ? ' unifesto' : 'unifesto';
  
  if (showIcon) {
    return (
      <View style={[styles.container, containerStyle]}>
        <Image
          source={require('../../assets/app-icon-transparent.png')}
          style={[styles.icon, { width: iconSize, height: iconSize }]}
          resizeMode="contain"
        />
        <MaskedView
          maskElement={
            <Text
              style={[
                styles.logo,
                {
                  fontSize: size,
                  lineHeight: size * 1.5,
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                },
                style,
              ]}
            >
              {logoText}
            </Text>
          }
        >
          <LinearGradient
            colors={[gradientTextColors.start, gradientTextColors.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text
              style={[
                styles.logo,
                {
                  fontSize: size,
                  lineHeight: size * 1.5,
                  opacity: 0,
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                },
                style,
              ]}
            >
              {logoText}
            </Text>
          </LinearGradient>
        </MaskedView>
      </View>
    );
  }

  return (
    <MaskedView
      maskElement={
        <Text
          style={[
            styles.logo,
            {
              fontSize: size,
              lineHeight: size * 1.5,
              paddingHorizontal: 8,
              paddingVertical: 6,
            },
            style,
          ]}
        >
          {logoText}
        </Text>
      }
    >
      <LinearGradient
        colors={[gradientTextColors.start, gradientTextColors.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text
          style={[
            styles.logo,
            {
              fontSize: size,
              lineHeight: size * 1.5,
              opacity: 0,
              paddingHorizontal: 8,
              paddingVertical: 6,
            },
            style,
          ]}
        >
          {logoText}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  icon: {
    marginRight: spacing[1],
  },
  logo: {
    fontFamily: typography.fontFamily.logo,
    backgroundColor: 'transparent',
    
  },
});
