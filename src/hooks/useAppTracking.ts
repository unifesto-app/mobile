/**
 * App Tracking Hook
 * 
 * Handles App Tracking Transparency (ATT) permission request on app launch.
 * This hook ensures ATT permission is requested BEFORE any tracking SDKs are initialized.
 * 
 * Usage:
 * const { trackingPermissionGranted, isReady } = useAppTracking();
 * 
 * - isReady: false while requesting permission, true after user responds
 * - trackingPermissionGranted: true if user granted permission or on Android
 */

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AppTrackingService from '../services/AppTrackingService';

interface UseAppTrackingResult {
  trackingPermissionGranted: boolean;
  isReady: boolean;
  trackingStatus: string;
}

export const useAppTracking = (): UseAppTrackingResult => {
  const [trackingPermissionGranted, setTrackingPermissionGranted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState('undetermined');

  useEffect(() => {
    const requestTrackingPermission = async () => {
      try {
        // On Android, tracking is allowed by default (no ATT requirement)
        if (Platform.OS !== 'ios') {
          setTrackingPermissionGranted(true);
          setTrackingStatus('granted');
          setIsReady(true);
          return;
        }

        // Check current tracking status
        const currentStatus = await AppTrackingService.getTrackingStatus();
        setTrackingStatus(currentStatus);

        // If status is undetermined, request permission
        if (currentStatus === 'undetermined') {
          const granted = await AppTrackingService.requestTrackingPermission();
          setTrackingPermissionGranted(granted);
          setTrackingStatus(granted ? 'granted' : 'denied');
        } else {
          // User already responded to ATT prompt
          const granted = currentStatus === 'granted';
          setTrackingPermissionGranted(granted);
        }
      } catch (error) {
        // On error, assume tracking is not granted
        setTrackingPermissionGranted(false);
        setTrackingStatus('error');
      } finally {
        // Mark as ready regardless of permission result
        setIsReady(true);
      }
    };

    requestTrackingPermission();
  }, []);

  return {
    trackingPermissionGranted,
    isReady,
    trackingStatus,
  };
};
