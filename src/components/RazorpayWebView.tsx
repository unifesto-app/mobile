import React, { useRef } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';
import { spacing, typography, borderRadius } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { useTheme } from '../context/ThemeContext';
import {
  generateRazorpayHTML,
  parseRazorpayMessage,
  type RazorpayOptions,
  type RazorpayResponse,
} from '../lib/razorpay-webview';

interface RazorpayWebViewProps {
  visible: boolean;
  options: RazorpayOptions;
  onSuccess: (response: RazorpayResponse) => void;
  onError: (error: any) => void;
  onDismiss: () => void;
}

export default function RazorpayWebView({
  visible,
  options,
  onSuccess,
  onError,
  onDismiss,
}: RazorpayWebViewProps) {
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[6],
      paddingTop: spacing[12],
      paddingBottom: spacing[4],
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontFamily: getFontFamily('bold'),
      color: colors.text,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    webview: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: spacing[4],
      fontSize: typography.fontSize.base,
      color: colors.textSecondary,
      fontFamily: getFontFamily('medium'),
    },
  });

  const webViewRef = useRef<WebView>(null);

  const handleMessage = (event: any) => {
    const message = parseRazorpayMessage(event.nativeEvent.data);
    
    if (!message) return;

    switch (message.type) {
      case 'success':
        onSuccess(message.data as RazorpayResponse);
        break;
      case 'error':
        onError(message.data);
        break;
      case 'dismiss':
        onDismiss();
        break;
    }
  };

  const html = generateRazorpayHTML(options);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complete Payment</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <X size={24} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ html }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading payment gateway...</Text>
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            onError({
              message: 'Failed to load payment gateway',
              description: nativeEvent.description,
            });
          }}
        />
      </View>
    </Modal>
  );
}
