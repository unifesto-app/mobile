/**
 * Hook for handling registration and payment flow
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import {
  createRegistration,
  verifyPayment,
  getRazorpayConfig,
  CreateRegistrationData,
} from '../lib/api/registrations';
import { openRazorpayCheckout } from '../lib/razorpay';

export function useRegistrationPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Process registration with payment
   */
  const processRegistration = async (
    registrationData: CreateRegistrationData,
    eventTitle: string,
    eventBanner?: string
  ) => {
    const eventId = registrationData.eventId;
    try {
      setLoading(true);
      setError(null);

      // Step 1: Create registration
      const registrationResponse = await createRegistration(eventId, {
        ticketTypeId: registrationData.ticketTypeId,
        quantity: registrationData.quantity,
        coinsToUse: (registrationData as any).coinsToUse,
        formResponses: (registrationData as any).formResponses,
      });

      // Step 2: Handle payment if required
      if (registrationResponse.requiresPayment && registrationResponse.razorpayOrder) {
        console.log('Payment required, opening Razorpay...');
        
        // Get Razorpay config
        const config = await getRazorpayConfig();

        // Open Razorpay checkout
        const paymentResponse = await openRazorpayCheckout({
          orderId: registrationResponse.razorpayOrder.orderId,
          amount: registrationResponse.razorpayOrder.amount,
          currency: registrationResponse.razorpayOrder.currency,
          name: 'Unifesto',
          description: eventTitle,
          image: eventBanner,
          prefill: {
            name: registrationData.attendees?.[0]?.name || '',
            email: registrationData.attendees?.[0]?.email || '',
            contact: registrationData.attendees?.[0]?.mobile || '',
          },
          keyId: config.keyId,
        });

        console.log('Payment successful, verifying...');

        // Step 3: Verify payment
        const verificationResponse = await verifyPayment(eventId, {
          registrationId: registrationResponse.registrations[0]?.id || '',
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
        });

        console.log('Payment verified successfully');

        return {
          success: true,
          registrations: registrationResponse.registrations,
          paymentId: verificationResponse.paymentId,
          requiresPayment: true,
        };
      } else {
        // Free event - no payment required
        console.log('Free event, registration complete');
        
        return {
          success: true,
          registrations: registrationResponse.registrations,
          paymentId: null,
          requiresPayment: false,
        };
      }
    } catch (err: any) {
      console.error('Registration/Payment error:', err);
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      
      // Show error alert
      Alert.alert('Registration Failed', errorMessage, [{ text: 'OK' }]);
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    processRegistration,
    loading,
    error,
  };
}
