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
 * Generate HTML for Razorpay checkout
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
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 8px;
      color: #1a1a1a;
    }
    .amount {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
      margin: 16px 0;
    }
    .description {
      color: #666;
      margin-bottom: 24px;
      font-size: 14px;
    }
    .button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transition: transform 0.2s;
    }
    .button:active {
      transform: scale(0.98);
    }
    .spinner {
      display: none;
      width: 40px;
      height: 40px;
      margin: 20px auto;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .loading .spinner {
      display: block;
    }
    .loading .button {
      display: none;
    }
    .error {
      color: #e53e3e;
      margin-top: 16px;
      font-size: 14px;
      display: none;
    }
    .error.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container" id="container">
    <div class="logo">💳</div>
    <h1>${options.name}</h1>
    <div class="amount">₹${(options.amount / 100).toFixed(2)}</div>
    <div class="description">${options.description}</div>
    <button class="button" onclick="openRazorpay()">Pay Now</button>
    <div class="spinner"></div>
    <div class="error" id="error"></div>
  </div>

  <script>
    function sendMessage(type, data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, data }));
      }
    }

    function showError(message) {
      const errorEl = document.getElementById('error');
      errorEl.textContent = message;
      errorEl.classList.add('show');
      document.getElementById('container').classList.remove('loading');
    }

    function openRazorpay() {
      document.getElementById('container').classList.add('loading');
      document.getElementById('error').classList.remove('show');

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
          color: '#667eea'
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

    // Auto-open on load (optional)
    // setTimeout(() => openRazorpay(), 500);
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
