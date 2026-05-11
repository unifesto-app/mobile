// Unifesto Typography System
// Main website uses Agrandir font and Sweet Apricot for logo

export const typography = {
  // Font Families - Only use fonts that exist
  fontFamily: {
    primary: 'Agrandir-Regular', // Regular weight
    bold: 'Agrandir-Bold', // Bold weight
    logo: 'SweetApricot', // Logo font
  },
  
  // Font Sizes
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
    '7xl': 56,
    '8xl': 64,
  },
  
  // Font Weights - DO NOT USE
  // React Native requires separate font files for each weight
  // Use fontFamily.bold instead of fontWeight
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};
