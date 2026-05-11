/**
 * OneSignal Service - Centralized wrapper for all OneSignal SDK interactions
 * 
 * This service provides a clean interface for:
 * - SDK initialization
 * - User identity management (login/logout)
 * - Email and SMS subscriptions
 * - User tags management
 * - Notification permissions
 * - Logging configuration
 * 
 * Note: OneSignal requires a development build and will not work in Expo Go
 */

import Constants from 'expo-constants';

// Get OneSignal App ID from environment variables
const ONESIGNAL_APP_ID = Constants.expoConfig?.extra?.EXPO_PUBLIC_ONESIGNAL_APP_ID || 
                         process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || 
                         '041e596b-0d7e-43f5-87a2-6fe4785ac44c';

// Lazy load OneSignal to prevent crashes in Expo Go
let OneSignal: any = null;
let LogLevel: any = null;

try {
  const onesignalModule = require('react-native-onesignal');
  OneSignal = onesignalModule.OneSignal;
  LogLevel = onesignalModule.LogLevel;
} catch (error) {
  // OneSignal not available in Expo Go
}

class OneSignalService {
  private isInitialized = false;
  private isAvailable = false;

  constructor() {
    this.isAvailable = OneSignal !== null;
  }

  /**
   * Check if OneSignal is available (not in Expo Go)
   */
  private checkAvailability(): boolean {
    if (!this.isAvailable) {
      return false;
    }
    return true;
  }

  /**
   * Initialize OneSignal SDK
   * Should be called once at app startup
   */
  initialize(): void {
    if (!this.checkAvailability()) return;

    if (this.isInitialized) {
      console.warn('OneSignal already initialized');
      return;
    }

    try {
      // Set log level for debugging (use LogLevel.None in production)
      if (__DEV__ && LogLevel) {
        OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      }

      // Initialize OneSignal with App ID
      OneSignal.initialize(ONESIGNAL_APP_ID);

      // Disable in-app messages by default (can be enabled later if needed)
      OneSignal.InAppMessages.paused(true);

      this.isInitialized = true;

      // Setup push subscription observer
      this.setupPushSubscriptionObserver();
    } catch (error) {
      console.error('OneSignal initialization error:', error);
    }
  }

  /**
   * Setup push subscription observer
   */
  private setupPushSubscriptionObserver(): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.User.pushSubscription.addEventListener('change', (subscription: any) => {
        const previousId = subscription.previous.id;
        const currentId = subscription.current.id;

        // Log subscription changes for debugging
        if ((!previousId || previousId === '') && currentId && currentId !== '') {
        }
      });
    } catch (error) {
      console.error('Error setting up push subscription observer:', error);
    }
  }

  /**
   * Request notification permission from user
   * @returns Promise<boolean> - true if permission granted
   */
  async requestPermission(): Promise<boolean> {
    if (!this.checkAvailability()) return false;

    try {
      const granted = await OneSignal.Notifications.requestPermission(true);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Check if user has granted notification permission
   * @returns boolean - true if permission granted
   */
  hasPermission(): boolean {
    if (!this.checkAvailability()) return false;

    try {
      return OneSignal.Notifications.hasPermission();
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }

  /**
   * Login user with external ID
   * Call this after user logs in to your app
   * @param externalId - Your app's user ID
   */
  login(externalId: string): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.login(externalId);
    } catch (error) {
      console.error('Error logging in OneSignal user:', error);
    }
  }

  /**
   * Logout current user
   * Call this when user logs out of your app
   */
  logout(): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.logout();
    } catch (error) {
      console.error('Error logging out OneSignal user:', error);
    }
  }

  /**
   * Add email to current user
   * @param email - User's email address
   */
  setEmail(email: string): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.User.addEmail(email);
    } catch (error) {
      console.error('Error setting OneSignal email:', error);
    }
  }

  /**
   * Remove email from current user
   * @param email - Email address to remove
   */
  removeEmail(email: string): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.User.removeEmail(email);
    } catch (error) {
      console.error('Error removing OneSignal email:', error);
    }
  }

  /**
   * Add SMS number to current user
   * @param smsNumber - User's phone number (E.164 format recommended)
   */
  setSMS(smsNumber: string): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.User.addSms(smsNumber);
    } catch (error) {
      console.error('Error setting OneSignal SMS:', error);
    }
  }

  /**
   * Remove SMS number from current user
   * @param smsNumber - Phone number to remove
   */
  removeSMS(smsNumber: string): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.User.removeSms(smsNumber);
    } catch (error) {
      console.error('Error removing OneSignal SMS:', error);
    }
  }

  /**
   * Add tags to current user for segmentation
   * @param tags - Object with key-value pairs
   */
  setTags(tags: Record<string, string>): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.User.addTags(tags);
    } catch (error) {
      console.error('Error setting OneSignal tags:', error);
    }
  }

  /**
   * Remove tags from current user
   * @param tagKeys - Array of tag keys to remove
   */
  removeTags(tagKeys: string[]): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.User.removeTags(tagKeys);
    } catch (error) {
      console.error('Error removing OneSignal tags:', error);
    }
  }

  /**
   * Get current push subscription ID
   * @returns string | null - Push subscription ID or null if not subscribed
   */
  getPushSubscriptionId(): string | null {
    if (!this.checkAvailability()) return null;

    try {
      return OneSignal.User.pushSubscription.id || null;
    } catch (error) {
      console.error('Error getting push subscription ID:', error);
      return null;
    }
  }

  /**
   * Opt user in to push notifications
   */
  optInToPush(): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.User.pushSubscription.optIn();
    } catch (error) {
      console.error('Error opting in to push:', error);
    }
  }

  /**
   * Opt user out of push notifications
   */
  optOutOfPush(): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.User.pushSubscription.optOut();
    } catch (error) {
      console.error('Error opting out of push:', error);
    }
  }

  /**
   * Add notification click listener
   * @param handler - Function to call when notification is clicked
   */
  addNotificationClickListener(handler: (event: any) => void): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.Notifications.addEventListener('click', handler);
    } catch (error) {
      console.error('Error adding notification click listener:', error);
    }
  }

  /**
   * Add notification foreground will display listener
   * @param handler - Function to call when notification is received in foreground
   */
  addNotificationForegroundListener(handler: (event: any) => void): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.Notifications.addEventListener('foregroundWillDisplay', handler);
    } catch (error) {
      console.error('Error adding notification foreground listener:', error);
    }
  }

  /**
   * Add permission change listener
   * @param handler - Function to call when permission changes
   */
  addPermissionChangeListener(handler: (granted: boolean) => void): void {
    if (!this.checkAvailability()) return;

    try {
      OneSignal.Notifications.addEventListener('permissionChange', handler);
    } catch (error) {
      console.error('Error adding permission change listener:', error);
    }
  }
}

// Export singleton instance
export default new OneSignalService();
