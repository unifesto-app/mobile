/**
 * Razorpay WebView Integration
 * Expo-compatible implementation using WebView
 */

export interface RazorpayOptions {
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  keyId: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Generate HTML for Razorpay checkout — opens Razorpay's own checkout
 * immediately on load, no custom intermediate page.
 */
export function generateRazorpayHTML(options: RazorpayOptions): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(255,255,255,0.15);
      border-top: 3px solid #3491ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error {
      color: #ff6b6b;
      margin-top: 16px;
      font-size: 14px;
      text-align: center;
      display: none;
      padding: 0 24px;
    }
    .error.show { display: block; }
    .retry {
      margin-top: 16px;
      background: #3491ff;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      display: none;
    }
    .retry.show { display: block; }
    .wrap { text-align: center; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="spinner" id="spinner"></div>
    <div class="error" id="error"></div>
    <button class="retry" id="retry" onclick="openRazorpay()">Retry Payment</button>
  </div>

  <script>
    function sendMessage(type, data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, data }));
      }
    }

    function showError(message) {
      document.getElementById('spinner').style.display = 'none';
      const errorEl = document.getElementById('error');
      errorEl.textContent = message;
      errorEl.classList.add('show');
      document.getElementById('retry').classList.add('show');
    }

    function openRazorpay() {
      document.getElementById('spinner').style.display = 'block';
      document.getElementById('error').classList.remove('show');
      document.getElementById('retry').classList.remove('show');

      const options = {
        key: '${options.keyId}',
        amount: ${options.amount},
        currency: '${options.currency}',
        name: '${options.name}',
        description: '${options.description}',
        image: '${options.image || 'https://unifesto.app/logo.png'}',
        order_id: '${options.orderId}',
        prefill: {
          name: '${options.prefill.name}',
          email: '${options.prefill.email}',
          contact: '${options.prefill.contact}'
        },
        theme: {
          color: '#3491ff'
        },
        handler: function(response) {
          sendMessage('success', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
        },
        modal: {
          ondismiss: function() {
            sendMessage('dismiss', { message: 'Payment cancelled by user' });
          }
        }
      };

      try {
        const rzp = new Razorpay(options);

        rzp.on('payment.failed', function(response) {
          sendMessage('error', {
            code: response.error.code,
            description: response.error.description,
            source: response.error.source,
            step: response.error.step,
            reason: response.error.reason,
            metadata: response.error.metadata
          });
        });

        rzp.open();
      } catch (error) {
        showError('Failed to initialize payment. Please try again.');
        sendMessage('error', { message: error.message || 'Failed to open Razorpay' });
      }
    }

    // Open Razorpay checkout immediately — no intermediate landing page
    window.addEventListener('load', function() {
      setTimeout(openRazorpay, 200);
    });
  </script>
</body>
</html>
  `;
}

/**
 * Parse Razorpay response from WebView message
 */
export function parseRazorpayMessage(message: string): {
  type: 'success' | 'error' | 'dismiss';
  data: any;
} | null {
  try {
    const parsed = JSON.parse(message);
    return parsed;
  } catch (error) {
    return null;
  }
}
