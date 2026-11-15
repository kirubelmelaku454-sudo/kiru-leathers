// Notification Service (SMS, Email, Push/SSE)
const fs = require('fs');

class NotifierService {
  constructor() {
    this.broadcastEvent = null;
  }

  setBroadcaster(broadcaster) {
    this.broadcastEvent = broadcaster;
  }

  // Generate automated order status notification
  createNotification(type, title, message, channel = 'system') {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      channel
    };
  }

  // Send Order Placed alerts
  async notifyOrderPlaced(order) {
    const notif = this.createNotification(
      'order_placed',
      'Order Confirmation Received',
      `Thank you for ordering with Kiru Leathers. Your order #${order.id} for ${order.currency} ${order.totalAmount} has been registered and is being reviewed.`,
      'sms'
    );

    console.log(`📱 [SMS DISPATCH to ${order.customer.phone || 'customer'}] Order #${order.id} registered! Total: ${order.currency} ${order.totalAmount}`);
    console.log(`✉️ [EMAIL DISPATCH to ${order.customer.email}] Order Confirmation & Invoice for #${order.id}`);
    this.dispatchTelegramAlert(`👑 <b>New Kiru Leathers Commission #${order.id}</b>\n• Customer: ${order.customer?.fullName || 'Collector'}\n• Phone: ${order.customer?.phone || 'N/A'}\n• Total: <b>${order.currency} ${order.totalAmount}</b>\n• Items: ${Array.isArray(order.items) ? order.items.map(it => it.product?.name).join(', ') : '1 item'}`);

    if (this.broadcastEvent) {
      this.broadcastEvent('NEW_ORDER', order);
      this.broadcastEvent('NOTIFICATION', notif);
    }

    return notif;
  }

  // Send Payment Verified / Atelier Start alert
  async notifyPaymentVerified(order) {
    const notif = this.createNotification(
      'payment_verified',
      'Payment Approved & Atelier Production Started',
      `Payment of ${order.currency} ${order.totalAmount} has been approved. Our Master Artisans have commenced crafting your bespoke leather goods.`,
      'sms'
    );

    console.log(`📱 [SMS DISPATCH to ${order.customer.phone}] Payment verified for Order #${order.id}. Production in progress.`);
    console.log(`✉️ [EMAIL DISPATCH to ${order.customer.email}] Official Receipt & Craftsmanship Timeline for Order #${order.id}`);
    this.dispatchTelegramAlert(`💳 <b>Payment Verified for Order #${order.id}</b>\n• Amount: <b>${order.currency} ${order.totalAmount}</b>\n• Status: <i>In Atelier Workshop</i>`);

    if (this.broadcastEvent) {
      this.broadcastEvent('PAYMENT_VERIFIED', order);
      this.broadcastEvent('NOTIFICATION', notif);
    }

    return notif;
  }

  // Send Status update alert
  async notifyStatusUpdate(order, newStatus) {
    let title = `Order Status: ${newStatus}`;
    let message = `Your order #${order.id} status has been updated to "${newStatus}".`;

    if (newStatus === 'In Atelier') {
      title = 'Handcrafting in Atelier';
      message = `Your leather goods are currently undergoing precision hand-cutting and saddle stitching in our Addis Ababa workshop.`;
    } else if (newStatus === 'Shipped') {
      title = 'Dispatched for Delivery';
      message = `Your package has left our atelier! Tracking number: ${order.trackingNumber || 'KL-' + Date.now().toString().slice(-6)}.`;
    } else if (newStatus === 'Delivered') {
      title = 'Delivered & Handed Over';
      message = `Your Kiru Leathers order has been successfully delivered. We hope you cherish your handmade heirloom piece!`;
    }

    const notif = this.createNotification(
      'status_update',
      title,
      message,
      'sms'
    );

    console.log(`📱 [SMS DISPATCH to ${order.customer.phone}] ${title}: ${message}`);

    if (this.broadcastEvent) {
      this.broadcastEvent('ORDER_UPDATED', order);
      this.broadcastEvent('NOTIFICATION', notif);
    }

    return notif;
  }

  // Send Courier Dispatched Alert (Logistics & White-Glove Handover)
  async notifyCourierDispatched(order, courier) {
    const title = 'Courier Dispatched • አድራሽ ተመድቧል';
    const message = `ክቡር ${order.customer?.fullName || 'ደንበኛ'}፣ የኪሩ ሌዘር ትዕዛዝ #${order.id} በአድራሽ ${courier.name} (ስልክ: ${courier.phone}${courier.vehiclePlate ? ', ሰሌዳ: ' + courier.vehiclePlate : ''}) ተልኳል።\nYour heirloom leather commission has been handed to our white-glove courier. Tracking: ${order.trackingNumber}`;

    const notif = this.createNotification(
      'courier_dispatched',
      title,
      message,
      'sms'
    );

    console.log(`🚚 [COURIER DISPATCH SMS to ${order.customer.phone}] ${message}`);
    this.dispatchTelegramAlert(`🚚 <b>Courier Dispatched for Order #${order.id}</b>\n• Customer: ${order.customer.fullName} (${order.customer.phone})\n• Courier: ${courier.name} (${courier.phone})\n• Destination: ${order.customer.address}, ${order.customer.city}\n• Plate: ${courier.vehiclePlate || 'N/A'}`);

    if (this.broadcastEvent) {
      this.broadcastEvent('ORDER_UPDATED', order);
      this.broadcastEvent('NOTIFICATION', notif);
    }

    return notif;
  }

  // Dispatch alert to Telegram channel or bot
  async dispatchTelegramAlert(text) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
        });
      } catch (err) {
        console.warn('Telegram dispatch warning:', err.message);
      }
    } else {
      console.log(`💬 [TELEGRAM BOT CONCIERGE]:\n${text.replace(/<[^>]*>/g, '')}`);
    }
  }
}

module.exports = new NotifierService();
