/**
 * App Tracking Transparency Service
 * 
 * Handles requesting user permission for tracking on iOS 14.5+
 * Required by Apple for apps that collect data for tracking purposes
 */

import { Platform } from 'react-native';
import * as Tracking from 'expo-tracking-transparency';

class AppTrackingService {
  /**
   * Check if tracking permission is available (iOS 14.5+)
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' && parseInt(String(Platform.Version), 10) >= 14;
  }

  /**
   * Get current tracking permission status
   * @returns Promise<string> - 'granted', 'denied', 'undetermined', or 'restricted'
   */
  async getTrackingStatus(): Promise<string> {
    if (!this.isAvailable()) {
      // On Android or older iOS, tracking is allowed by default
      return 'granted';
    }

    try {
      const { status } = await Tracking.getTrackingPermissionsAsync();
      return status;
    } catch (error) {
      return 'undetermined';
    }
  }

  /**
   * Request tracking permission from user
   * Shows the iOS tracking permission dialog
   * @returns Promise<boolean> - true if permission granted
   */
  async requestTrackingPermission(): Promise<boolean> {
    if (!this.isAvailable()) {
      // On Android or older iOS, tracking is allowed by default
      return true;
    }

    try {
      const { status } = await Tracking.requestTrackingPermissionsAsync();
      
      if (status === 'granted') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if we should request tracking permission
   * Only request if status is 'undetermined'
   * @returns Promise<boolean> - true if we should request
   */
  async shouldRequestPermission(): Promise<boolean> {
    const status = await this.getTrackingStatus();
    return status === 'undetermined';
  }
}

// Export singleton instance
export default new AppTrackingService();
