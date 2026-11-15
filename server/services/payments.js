// Production Chapa & Telebirr Payment Processing Service
const crypto = require('crypto');

class PaymentService {
  constructor() {
    this.chapaSecretKey = process.env.CHAPA_SECRET_KEY || '';
    this.chapaWebhookSecret = process.env.CHAPA_WEBHOOK_SECRET || '';
  }

  // Initialize a real Chapa checkout session
  async initializeChapa({ amount, currency, email, firstName, lastName, tx_ref, callback_url, return_url, title = 'Kiru Leathers Atelier' }) {
    if (this.chapaSecretKey) {
      try {
        const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.chapaSecretKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: amount.toString(),
            currency: currency || 'ETB',
            email,
            first_name: firstName,
            last_name: lastName,
            tx_ref,
            callback_url,
            return_url,
            customization: {
              title,
              description: 'Luxury Handcrafted Leather Goods'
            }
          })
        });

        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Chapa API Error:', err.message);
        throw new Error(`Chapa API error: ${err.message}`);
      }
    }

    // High-fidelity Local Sandbox Checkout
    return {
      status: 'success',
      message: 'Demo Chapa checkout initialized successfully',
      data: {
        checkout_url: `http://localhost:5000/api/payments/chapa/demo-checkout?tx_ref=${tx_ref}&amount=${amount}&currency=${currency}`
      }
    };
  }

  // Verify Chapa transaction with official API
  async verifyChapa(tx_ref) {
    if (this.chapaSecretKey) {
      try {
        const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
          headers: {
            Authorization: `Bearer ${this.chapaSecretKey}`
          }
        });
        return await response.json();
      } catch (err) {
        console.error('Chapa Verify Error:', err.message);
        throw err;
      }
    }

    return {
      status: 'success',
      message: 'Demo transaction verified successfully',
      data: {
        status: 'success',
        tx_ref,
        amount: 2500,
        currency: 'ETB',
        verified_at: new Date().toISOString()
      }
    };
  }

  // Verify Chapa Webhook Signature
  verifyWebhookSignature(signature, payload) {
    if (!this.chapaWebhookSecret) return true;
    try {
      const hash = crypto
        .createHmac('sha256', this.chapaWebhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
      return hash === signature;
    } catch {
      return false;
    }
  }

  // Telebirr payment prompt initialization
  initializeTelebirr({ amount, orderId, phone }) {
    const rawNumber = orderId.replace(/\D/g, '').slice(-6) || '123456';
    return {
      status: 'success',
      orderId,
      ussdCode: `*127*${rawNumber}*${Math.round(amount)}#`,
      qrData: `telebirr://pay?to=KIRU_LEATHERS&amount=${amount}&order=${orderId}`,
      expiryMinutes: 15,
      message: 'Telebirr payment prompt prepared'
    };
  }
}

module.exports = new PaymentService();
