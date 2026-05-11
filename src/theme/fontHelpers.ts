// Font Weight Helper for React Native
// Since React Native requires separate font files for each weight,
// we map fontWeight values to the appropriate fontFamily

import { typography } from './typography';

/**
 * Get the appropriate fontFamily based on desired fontWeight
 * Only 'primary' (regular) and 'bold' are available
 * 
 * @example
 * // Instead of:
 * // { fontFamily: typography.fontFamily.primary, fontWeight: '700' }
 * // Use:
 * // { fontFamily: getFontFamily('bold') }
 */
export function getFontFamily(weight: 'primary' | 'bold' | 'normal' | '400' | '500' | '600' | '700' | 'medium' | 'semibold'): string {
  switch (weight) {
    case 'bold':
    case '700':
    case '600':
    case 'semibold':
      return typography.fontFamily.bold;
    case 'primary':
    case 'normal':
    case '400':
    case '500':
    case 'medium':
    default:
      return typography.fontFamily.primary;
  }
}

/**
 * Create text style with proper font weight
 * This combines fontSize and fontWeight into the correct fontFamily
 * 
 * @example
 * const styles = StyleSheet.create({
 *   title: {
 *     ...getTextStyle('2xl', 'bold'),
 *     color: colors.text,
 *   }
 * });
 */
export function getTextStyle(
  size: keyof typeof typography.fontSize,
  weight: 'primary' | 'bold' | 'normal' | '400' | '500' | '600' | '700' | 'medium' | 'semibold' = 'normal'
) {
  return {
    fontSize: typography.fontSize[size],
    fontFamily: getFontFamily(weight),
  };
}
