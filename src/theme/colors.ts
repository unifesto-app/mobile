// Unifesto Brand Colors - Matching main website design system

export const colors = {
  // Primary Brand Colors
  primary: '#3491ff',
  primaryBright: '#0062ff',
  primaryDark: '#0052d9',
  
  // Background
  background: '#000000',
  backgroundSecondary: '#0a0a0a',
  
  // Text
  text: '#ffffff',
  textMuted: '#94a3b8',
  textSecondary: '#64748b',
  
  // Borders & Dividers
  border: 'rgba(52, 145, 255, 0.3)',
  borderLight: 'rgba(255, 255, 255, 0.1)',
  borderMuted: 'rgba(255, 255, 255, 0.05)',
  
  // Cards & Surfaces
  card: '#0a0a0a',
  cardHover: 'rgba(255, 255, 255, 0.05)',
  
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3491ff',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.6)',
  
  // Gradients
  gradientStart: '#3491ff',
  gradientEnd: '#0062ff',
};

// Brand gradient for LinearGradient component
// Usage: <LinearGradient colors={brandGradient} start={brandGradientStart} end={brandGradientEnd}>
export const brandGradient: readonly [string, string] = ['#3491ff', '#0062ff'] as const;
export const brandGradientStart = { x: 0, y: 0 };
export const brandGradientEnd = { x: 1, y: 1 }; // 135deg equivalent

// Brand gradient for CSS (web/style strings)
export const brandGradientCSS = 'linear-gradient(135deg, #3491ff, #0062ff)';

// Gradient for text (use with special styling)
export const gradientTextColors = {
  start: '#3491ff',
  end: '#0062ff',
};
