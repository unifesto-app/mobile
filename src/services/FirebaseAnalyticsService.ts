/**
 * Firebase Analytics Service - Centralized wrapper for Firebase Analytics
 * 
 * This service provides a clean interface for:
 * - Event tracking
 * - User properties
 * - Screen tracking
 * - Custom parameters
 * 
 * Note: Firebase Analytics requires a development build and will not work in Expo Go
 */

// Lazy load Firebase to prevent crashes in Expo Go
let analytics: any = null;

try {
  analytics = require('@react-native-firebase/analytics').default;
} catch (error) {
  // Firebase Analytics not available in Expo Go
}

class FirebaseAnalyticsService {
  private isAvailable = false;

  constructor() {
    this.isAvailable = analytics !== null;
  }

  /**
   * Check if Firebase Analytics is available (not in Expo Go)
   */
  private checkAvailability(): boolean {
    if (!this.isAvailable) {
      return false;
    }
    return true;
  }

  /**
   * Log a custom event
   * @param eventName - Name of the event (max 40 characters)
   * @param params - Optional parameters (max 25 parameters, 100 characters per value)
   */
  async logEvent(eventName: string, params?: Record<string, any>): Promise<void> {
    if (!this.checkAvailability()) return;

    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
    }
  }

  /**
   * Log screen view
   * @param screenName - Name of the screen
   * @param screenClass - Optional screen class name
   */
  async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    if (!this.checkAvailability()) return;

    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
    } catch (error) {
    }
  }

  /**
   * Set user ID for analytics
   * @param userId - Unique user identifier
   */
  async setUserId(userId: string | null): Promise<void> {
    if (!this.checkAvailability()) return;

    try {
      await analytics().setUserId(userId);
    } catch (error) {
    }
  }

  /**
   * Set user property
   * @param name - Property name (max 24 characters)
   * @param value - Property value (max 36 characters)
   */
  async setUserProperty(name: string, value: string | null): Promise<void> {
    if (!this.checkAvailability()) return;

    try {
      await analytics().setUserProperty(name, value);
    } catch (error) {
    }
  }

  /**
   * Set multiple user properties at once
   * @param properties - Object with property name-value pairs
   */
  async setUserProperties(properties: Record<string, string | null>): Promise<void> {
    if (!this.checkAvailability()) return;

    try {
      const promises = Object.entries(properties).map(([name, value]) =>
        analytics().setUserProperty(name, value)
      );
      await Promise.all(promises);
    } catch (error) {
    }
  }

  /**
   * Enable or disable analytics collection
   * @param enabled - true to enable, false to disable
   */
  async setAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
    if (!this.checkAvailability()) return;

    try {
      await analytics().setAnalyticsCollectionEnabled(enabled);
    } catch (error) {
    }
  }

  /**
   * Reset analytics data (clears user ID and properties)
   */
  async resetAnalyticsData(): Promise<void> {
    if (!this.checkAvailability()) return;

    try {
      await analytics().resetAnalyticsData();
    } catch (error) {
    }
  }

  // ============================================
  // Predefined Events (Google Analytics Standard)
  // ============================================

  /**
   * Log login event
   * @param method - Login method (e.g., 'google', 'email', 'phone')
   */
  async logLogin(method: string): Promise<void> {
    await this.logEvent('login', { method });
  }

  /**
   * Log sign up event
   * @param method - Sign up method (e.g., 'google', 'email', 'phone')
   */
  async logSignUp(method: string): Promise<void> {
    await this.logEvent('sign_up', { method });
  }

  /**
   * Log search event
   * @param searchTerm - What the user searched for
   */
  async logSearch(searchTerm: string): Promise<void> {
    await this.logEvent('search', { search_term: searchTerm });
  }

  /**
   * Log select content event
   * @param contentType - Type of content (e.g., 'event', 'article')
   * @param itemId - ID of the selected item
   */
  async logSelectContent(contentType: string, itemId: string): Promise<void> {
    await this.logEvent('select_content', {
      content_type: contentType,
      item_id: itemId,
    });
  }

  /**
   * Log share event
   * @param contentType - Type of content being shared
   * @param itemId - ID of the shared item
   * @param method - Share method (e.g., 'facebook', 'twitter')
   */
  async logShare(contentType: string, itemId: string, method: string): Promise<void> {
    await this.logEvent('share', {
      content_type: contentType,
      item_id: itemId,
      method,
    });
  }

  /**
   * Log tutorial begin event
   */
  async logTutorialBegin(): Promise<void> {
    await this.logEvent('tutorial_begin');
  }

  /**
   * Log tutorial complete event
   */
  async logTutorialComplete(): Promise<void> {
    await this.logEvent('tutorial_complete');
  }

  // ============================================
  // E-commerce Events
  // ============================================

  /**
   * Log view item event
   * @param itemId - Item ID
   * @param itemName - Item name
   * @param itemCategory - Item category
   * @param price - Item price
   */
  async logViewItem(
    itemId: string,
    itemName: string,
    itemCategory?: string,
    price?: number
  ): Promise<void> {
    await this.logEvent('view_item', {
      item_id: itemId,
      item_name: itemName,
      item_category: itemCategory,
      price,
    });
  }

  /**
   * Log add to cart event
   * @param itemId - Item ID
   * @param itemName - Item name
   * @param price - Item price
   * @param quantity - Quantity added
   */
  async logAddToCart(
    itemId: string,
    itemName: string,
    price: number,
    quantity: number = 1
  ): Promise<void> {
    await this.logEvent('add_to_cart', {
      item_id: itemId,
      item_name: itemName,
      price,
      quantity,
      value: price * quantity,
    });
  }

  /**
   * Log begin checkout event
   * @param value - Total value of items
   * @param currency - Currency code (e.g., 'USD', 'INR')
   */
  async logBeginCheckout(value: number, currency: string = 'INR'): Promise<void> {
    await this.logEvent('begin_checkout', {
      value,
      currency,
    });
  }

  /**
   * Log purchase event
   * @param transactionId - Unique transaction ID
   * @param value - Total purchase value
   * @param currency - Currency code
   * @param items - Array of purchased items
   */
  async logPurchase(
    transactionId: string,
    value: number,
    currency: string = 'INR',
    items?: Array<{ item_id: string; item_name: string; price: number; quantity: number }>
  ): Promise<void> {
    await this.logEvent('purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
    });
  }

  /**
   * Log refund event
   * @param transactionId - Transaction ID being refunded
   * @param value - Refund amount
   * @param currency - Currency code
   */
  async logRefund(
    transactionId: string,
    value: number,
    currency: string = 'INR'
  ): Promise<void> {
    await this.logEvent('refund', {
      transaction_id: transactionId,
      value,
      currency,
    });
  }
}

// Export singleton instance
export default new FirebaseAnalyticsService();
