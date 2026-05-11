// Unifesto Design System - Mobile Theme
// Matching the main website's design tokens and visual language

import { colors, brandGradient, brandGradientStart, brandGradientEnd, brandGradientCSS, gradientTextColors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';
import { getFontFamily, getTextStyle } from './fontHelpers';
import { buttonStyles, blueGradientColors, standardGradientConfig } from './buttonStyles';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  brandGradient,
  brandGradientStart,
  brandGradientEnd,
  brandGradientCSS,
  gradientTextColors,
  buttonStyles,
  blueGradientColors,
  standardGradientConfig,
};

export { 
  colors, 
  typography, 
  spacing, 
  borderRadius, 
  shadows, 
  brandGradient,
  brandGradientStart,
  brandGradientEnd,
  brandGradientCSS,
  gradientTextColors,
  getFontFamily,
  getTextStyle,
  buttonStyles,
  blueGradientColors,
  standardGradientConfig,
};

export default theme;
