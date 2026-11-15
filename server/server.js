const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const db = require('./db');
const { generateToken, verifyAuth, verifyAdmin, optionalAuth } = require('./middleware/auth');
const notifier = require('./services/notifier');
const payments = require('./services/payments');
const aiConcierge = require('./services/aiConcierge');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static file serving for uploaded receipts & product assets
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `upload-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Database is initialized before binding HTTP listener at bottom of file

// --- REAL-TIME BROADCAST ENGINE (Server-Sent Events) ---
const sseClients = new Set();

app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const client = { res, id: Date.now() };
  sseClients.add(client);

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    sseClients.delete(client);
  });
});

const broadcastEvent = (eventType, payload) => {
  const message = `data: ${JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
};

// Connect broadcaster with notifier
notifier.setBroadcaster(broadcastEvent);

// --- CONCURRENCY PROTECTION QUEUE ---
let orderProcessingQueue = Promise.resolve();
const processInQueue = (taskFn) => {
  return new Promise((resolve, reject) => {
    orderProcessingQueue = orderProcessingQueue
      .then(() => taskFn().then(resolve).catch(reject))
      .catch(() => taskFn().then(resolve).catch(reject));
  });
};

// ==========================================
// 1. AUTHENTICATION & USER MANAGEMENT
// ==========================================

// Register New Customer / Admin
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, city, address, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name,
      email: email.trim().toLowerCase(),
      passwordHash,
      role: role === 'admin' ? 'admin' : 'customer',
      phone: phone || '',
      city: city || 'Addis Ababa',
      address: address || '',
      createdAt: new Date().toISOString()
    };

    await db.saveUser(newUser);
    const token = generateToken(newUser);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      city: newUser.city,
      address: newUser.address
    };

    res.status(201).json({
      message: 'Account registered successfully',
      user: safeUser,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering account' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await db.findUserByEmail(String(email).trim());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const storedHash = user.passwordHash || user.password || '';
    const isMatch = storedHash.startsWith('$2')
      ? await bcrypt.compare(password, storedHash)
      : false;
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      address: user.address
    };

    res.json({
      message: 'Logged in successfully',
      user: safeUser,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Public Auth Config (Google OAuth Client ID availability)
app.get('/api/auth/config', (req, res) => {
  const googleClientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  res.json({
    googleClientId,
    googleOAuthConfigured: Boolean(googleClientId)
  });
});

// Real Google Authentication (verifies ID token or OAuth access token directly with Google)
app.post('/api/auth/google', async (req, res) => {
  try {
    const googleClientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim();
    if (!googleClientId) {
      return res.status(503).json({
        message: 'Real Google Sign-In is not configured yet. Please add a valid GOOGLE_CLIENT_ID to server/.env and restart the server.'
      });
    }

    const { credential, accessToken } = req.body || {};
    if (!credential && !accessToken) {
      return res.status(400).json({ message: 'Verified Google OAuth token is required.' });
    }

    let verifiedEmail = '';
    let verifiedName = '';

    if (credential) {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(String(credential))}`
      );
      if (!verifyRes.ok) {
        return res.status(401).json({ message: 'Invalid or expired Google credential.' });
      }
      const info = await verifyRes.json();
      const emailVerified = info.email_verified === true || info.email_verified === 'true';
      if (info.aud !== googleClientId || !emailVerified || !info.email) {
        return res.status(401).json({ message: 'Google account verification failed.' });
      }
      verifiedEmail = String(info.email).trim().toLowerCase();
      verifiedName = info.name || info.given_name || verifiedEmail.split('@')[0];
    } else if (accessToken) {
      const tokenInfoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(String(accessToken))}`
      );
      if (!tokenInfoRes.ok) {
        return res.status(401).json({ message: 'Invalid or expired Google access token.' });
      }
      const tokenInfo = await tokenInfoRes.json();
      if (![tokenInfo.aud, tokenInfo.azp, tokenInfo.issued_to].includes(googleClientId)) {
        return res.status(401).json({ message: 'Google OAuth token client mismatch.' });
      }

      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!profileRes.ok) {
        return res.status(401).json({ message: 'Unable to verify Google profile information.' });
      }
      const profile = await profileRes.json();
      const emailVerified = profile.email_verified === true || profile.email_verified === 'true';
      if (!emailVerified || !profile.email) {
        return res.status(401).json({ message: 'Google account email must be verified.' });
      }
      verifiedEmail = String(profile.email).trim().toLowerCase();
      verifiedName = profile.name || profile.given_name || verifiedEmail.split('@')[0];
    }

    let user = await db.findUserByEmail(verifiedEmail);
    const isSeededAdmin =
      verifiedEmail === 'admin@kiruleathers.com' ||
      verifiedEmail === 'kirubelmelaku454@gmail.com';

    if (!user) {
      const newUser = {
        id: `usr_g_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: verifiedName || 'Google Collector',
        email: verifiedEmail,
        passwordHash: 'google_oauth_provider',
        role: isSeededAdmin ? 'admin' : 'customer',
        phone: '',
        city: 'Addis Ababa',
        address: '',
        createdAt: new Date().toISOString()
      };
      await db.saveUser(newUser);
      user = newUser;
    } else if (isSeededAdmin && user.role !== 'admin') {
      user.role = 'admin';
      await db.updateUser(user.id, { role: 'admin' }).catch(() => {});
    }

    const token = generateToken(user);
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      city: user.city || 'Addis Ababa',
      address: user.address || ''
    };

    res.json({
      message: 'Google authentication successful',
      user: safeUser,
      token
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Error processing Google authentication' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', verifyAuth, async (req, res) => {
  const user = await db.findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    city: user.city,
    address: user.address
  });
});

// Update Profile
app.put('/api/auth/profile', verifyAuth, async (req, res) => {
  try {
    const { name, phone, city, address } = req.body;
    const updated = await db.updateUser(req.user.id, { name, phone, city, address });
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        city: updated.city,
        address: updated.address
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// ==========================================
// 2. FILE UPLOADS (Receipts & Product Images)
// ==========================================
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: 'File uploaded successfully',
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

// ==========================================
// 3. PRODUCTS CATALOG
// ==========================================

// Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error reading products' });
  }
});

// Add New Product
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = {
      id: req.body.id || `prod-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : 10,
      isNew: true,
      ...req.body
    };
    await db.saveProduct(newProduct);
    broadcastEvent('PRODUCT_ADDED', { product: newProduct });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error saving product' });
  }
});

// Update Product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }
    broadcastEvent('PRODUCT_UPDATED', { product: updated });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Update Product Stock
app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { stock } = req.body;
    const updated = await db.updateProduct(req.params.id, { stock: Number(stock) });
    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }
    broadcastEvent('PRODUCT_UPDATED', { product: updated });
    res.json({ message: 'Stock updated successfully', product: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock' });
  }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    broadcastEvent('PRODUCT_DELETED', { id: req.params.id });
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Submit Customer Review
app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const products = await db.getProducts();
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = {
      id: `rev-${Date.now()}`,
      author: req.body.author || 'Anonymous Client',
      rating: req.body.rating || 5,
      date: 'Just now',
      comment: req.body.comment || '',
      verified: true
    };

    const updatedProduct = await db.addReview(product.id, review);
    const resultProduct = updatedProduct && updatedProduct.id ? updatedProduct : product;
    broadcastEvent('PRODUCT_REVIEW_ADDED', { productId: product.id, product: resultProduct });
    res.status(201).json({ message: 'Review recorded', product: resultProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error saving review' });
  }
});

// ==========================================
// 4. ORDERS & CHECKOUT ENGINE
// ==========================================

// Get All Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error reading orders' });
  }
});

// Check Duplicate Transaction ID
app.post('/api/payments/check-transaction', async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId || !transactionId.trim()) {
      return res.status(400).json({ available: false, message: 'Transaction ID is required' });
    }

    const cleanTx = transactionId.trim().toUpperCase();
    const orders = await db.getOrders();

    const existing = orders.find(
      (o) =>
        o.transferDetails?.transactionId &&
        o.transferDetails.transactionId.trim().toUpperCase() === cleanTx &&
        o.paymentStatus !== 'Rejected'
    );

    if (existing) {
      return res.json({
        available: false,
        message: 'ይህ የግብይት ቁጥር (Transaction ID) ከዚህ በፊት ሌላ ትዕዛዝ ላይ ጥቅም ላይ ውሏል! ደረሰኝን ለሁለተኛ ጊዜ መጠቀም በጥብቅ የተከለከለ ነው።'
      });
    }

    res.json({ available: true, message: 'Transaction ID valid and ready for submission.' });
  } catch (error) {
    res.status(500).json({ message: 'Error checking transaction' });
  }
});

// Create Order (Concurrency Protection, Inventory Deduction, Notifications)
app.post('/api/orders', (req, res) => {
  processInQueue(async () => {
    const orders = await db.getOrders();
    const products = await db.getProducts();
    const isMobileTransfer = req.body.paymentMethod === 'mobile_transfer' || !!req.body.transferDetails?.transactionId;

    if (isMobileTransfer) {
      const txId = (req.body.transferDetails?.transactionId || '').trim().toUpperCase();
      if (!txId) {
        return res.status(400).json({ message: 'የባንክ/ቴሌብር የግብይት ቁጥር (Transaction ID) ማስገባት ግዴታ ነው!' });
      }

      const duplicateOrder = orders.find(
        (o) =>
          o.transferDetails?.transactionId &&
          o.transferDetails.transactionId.trim().toUpperCase() === txId &&
          o.paymentStatus !== 'Rejected'
      );

      if (duplicateOrder) {
        return res.status(400).json({
          code: 'DUPLICATE_TRANSACTION',
          message: 'ይህ የግብይት ቁጥር (Transaction ID) አስቀድሞ ለትዕዛዝ ' + duplicateOrder.id + ' ጥቅም ላይ ውሏል! እባክዎ አዲስ እና ትክክለኛ የከፈሉበትን ደረሰኝ ያስገቡ።'
        });
      }
    }

    // Verify stock
    const items = req.body.items || [];
    for (const item of items) {
      const productId = item.product?.id || item.productId || item.id;
      const product = products.find((p) => p.id === productId);
      if (product) {
        const curStock = (product.stock !== undefined && product.stock !== null) ? Number(product.stock) : 10;
        const requestedQty = Number(item.quantity || 1);
        if (curStock < requestedQty) {
          return res.status(400).json({
            code: 'INSUFFICIENT_STOCK',
            message: `ይቅርታ፣ "${product.name}" በክምችት ውስጥ የቀረው ${curStock} ብቻ ስለሆነ ${requestedQty} ማዘዝ አይቻልም! እባክዎ ብዛቱን አስተካክለው ይሞክሩ።`
          });
        }
      }
    }

    // Deduct stock in real-time
    for (const item of items) {
      const productId = item.product?.id || item.productId || item.id;
      const product = products.find((p) => p.id === productId);
      if (product) {
        const curStock = (product.stock !== undefined && product.stock !== null) ? Number(product.stock) : 10;
        const qty = Number(item.quantity || 1);
        const newStock = Math.max(0, curStock - qty);
        product.stock = newStock;
        await db.updateProduct(product.id, { stock: newStock });
      }
    }

    const orderId = req.body.id || `KL-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      id: orderId,
      userId: req.body.userId || null,
      customer: req.body.customer || {},
      items: req.body.items || [],
      subtotal: req.body.subtotal || 0,
      discount: req.body.discount || 0,
      shipping: req.body.shipping || 0,
      totalAmount: req.body.totalAmount || 0,
      currency: req.body.currency || 'USD',
      paymentMethod: req.body.paymentMethod || 'card',
      paymentStatus: isMobileTransfer ? 'Pending Verification' : 'Approved',
      transferDetails: req.body.transferDetails || undefined,
      deliveryZoneId: req.body.deliveryZoneId || undefined,
      deliveryZoneName: req.body.deliveryZoneName || undefined,
      status: isMobileTransfer ? 'Payment Verification' : (req.body.status || 'Processing'),
      createdAt: new Date().toISOString(),
      trackingNumber: req.body.trackingNumber || `TRK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      notifications: []
    };

    // Automated order confirmation notification
    const notif = await notifier.notifyOrderPlaced(newOrder);
    newOrder.notifications.push(notif);

    await db.saveOrder(newOrder);

    // Award Collector Circle Loyalty Points if customer is signed in
    if (newOrder.userId) {
      try {
        const points = Math.max(1, Math.floor((newOrder.totalAmount || 0) / 50));
        await db.addLoyaltyPoints(newOrder.userId, points);
      } catch (err) {
        console.warn('Loyalty points attribution notice:', err.message);
      }
    }

    const updatedProducts = await db.getProducts();

    // Broadcast instant zero-latency push to all open Admin Dashboards & clients
    broadcastEvent('NEW_ORDER', { order: newOrder, products: updatedProducts });
    broadcastEvent('PRODUCTS_UPDATED', { products: updatedProducts });

    return res.status(201).json({
      message: 'Order placed successfully!',
      order: newOrder,
      updatedProducts
    });
  }).catch((error) => {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error saving order' });
  });
});

// Admin Approve/Reject Payment
app.post('/api/orders/:id/verify-payment', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { action, reason } = req.body;
    if (action === 'approve') {
      order.paymentStatus = 'Approved';
      order.status = 'In Atelier';
      order.rejectionReason = undefined;
      const notif = await notifier.notifyPaymentVerified(order);
      order.notifications = order.notifications || [];
      order.notifications.push(notif);
    } else if (action === 'reject') {
      order.paymentStatus = 'Rejected';
      order.status = 'Payment Rejected';
      order.rejectionReason = reason || 'የደረሰኝ ወይም የሂሳብ ቁጥር ማረጋገጫ አልተገኘም። እባክዎ ትክክለኛ ክፍያ ፈጽመው ያረጋግጡ።';
      const notif = notifier.createNotification(
        'payment_rejected',
        'Payment Slip Rejected',
        `Your payment submission could not be verified. Reason: ${order.rejectionReason}`,
        'sms'
      );
      order.notifications = order.notifications || [];
      order.notifications.push(notif);
    } else {
      return res.status(400).json({ message: 'Invalid action. Must be approve or reject.' });
    }

    await db.updateOrder(order.id, order);
    broadcastEvent('ORDER_PAYMENT_VERIFIED', { order, action });
    res.json({ message: `Payment ${action}d successfully`, order });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

// Update Order Status (Logistics & Craftsmanship Stages)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const newStatus = req.body.status || order.status;
    order.status = newStatus;

    // Trigger SMS/Email notification on status change
    const notif = await notifier.notifyStatusUpdate(order, newStatus);
    order.notifications = order.notifications || [];
    order.notifications.push(notif);

    await db.updateOrder(order.id, order);
    broadcastEvent('ORDER_STATUS_UPDATED', { order });
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// ==========================================
// 5. PAYMENT GATEWAY INTEGRATIONS (Chapa & Telebirr)
// ==========================================

// Initialize Chapa Checkout
app.post('/api/payments/chapa/initialize', async (req, res) => {
  try {
    const { amount, currency, email, firstName, lastName, tx_ref, callback_url, return_url } = req.body;
    const result = await payments.initializeChapa({
      amount,
      currency: currency || 'ETB',
      email,
      firstName,
      lastName,
      tx_ref: tx_ref || `chapa_${Date.now()}`,
      callback_url,
      return_url
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify Chapa Transaction & Auto-Approve Order
app.get('/api/payments/chapa/verify/:tx_ref', async (req, res) => {
  try {
    const tx_ref = req.params.tx_ref;
    const result = await payments.verifyChapa(tx_ref);

    // If verified, update the order in DB to Approved and In Atelier
    if (result && (result.status === 'success' || result.data?.status === 'success')) {
      const order = await db.getOrderById(tx_ref);
      if (order && order.paymentStatus !== 'Approved') {
        order.paymentStatus = 'Approved';
        order.status = 'In Atelier';
        order.rejectionReason = undefined;
        await db.updateOrder(order.id, order);
        await notifier.notifyPaymentVerified(order);
        broadcastEvent('ORDER_PAYMENT_VERIFIED', { order, action: 'approve' });
        broadcastEvent('ORDER_STATUS_UPDATED', { order });
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Courier Dispatch & Logistics Handover Endpoint
app.post('/api/orders/:id/dispatch-courier', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { courierName, courierPhone, vehiclePlate, deliveryNote } = req.body;
    order.status = 'Shipped';
    order.courier = {
      name: courierName || 'Artisan White-Glove Dispatch',
      phone: courierPhone || '+251911234567',
      vehiclePlate: vehiclePlate || '',
      deliveryNote: deliveryNote || ''
    };

    await db.updateOrder(order.id, order);
    const notif = await notifier.notifyCourierDispatched(order, order.courier);
    order.notifications = order.notifications || [];
    order.notifications.push(notif);

    broadcastEvent('ORDER_STATUS_UPDATED', { order });
    res.json({ message: 'Courier successfully dispatched and customer notified!', order });
  } catch (err) {
    console.error('Dispatch error:', err);
    res.status(500).json({ message: 'Error dispatching courier' });
  }
});

// Product Reviews Submission with Verified Buyer Check
app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const productId = req.params.id;
    const { author, rating, comment, imageUrl, userId } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    let isVerifiedBuyer = false;
    if (userId) {
      const orders = await db.getOrders();
      const userOrders = orders.filter((o) => o.userId === userId);
      isVerifiedBuyer = userOrders.some(
        (o) => Array.isArray(o.items) && o.items.some((it) => it.product?.id === productId)
      );
    }

    const review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      author: author || 'Collector',
      rating: Number(rating) || 5,
      comment,
      imageUrl: imageUrl || undefined,
      verified: isVerifiedBuyer,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updatedProduct = await db.addReview(productId, review);
    const allProducts = await db.getProducts();
    broadcastEvent('PRODUCTS_UPDATED', { products: allProducts });

    res.status(201).json({ message: 'Review added successfully', product: updatedProduct });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Error submitting review' });
  }
});

// Quick Restock Endpoint
app.post('/api/products/:id/restock', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const qty = Number(req.body.quantity) || 10;
    const newStock = (product.stock || 0) + qty;
    const updated = await db.updateProduct(product.id, { stock: newStock });
    const allProducts = await db.getProducts();
    broadcastEvent('PRODUCTS_UPDATED', { products: allProducts });
    res.json({ message: `Restocked ${qty} units`, product: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error restocking product' });
  }
});

// Initialize Telebirr Prompt
app.post('/api/payments/telebirr/initialize', (req, res) => {
  const { amount, orderId, phone } = req.body;
  const result = payments.initializeTelebirr({ amount, orderId, phone });
  res.json(result);
});

// Chapa Interactive Demo Gateway (High fidelity checkout UI for local testing)
app.get('/api/payments/chapa/demo-checkout', (req, res) => {
  const { tx_ref, amount, currency } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chapa Checkout | Kiru Leathers Atelier</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-stone-950 text-stone-100 flex items-center justify-center min-h-screen p-4 font-sans">
      <div class="max-w-md w-full bg-stone-900 border border-amber-600/30 rounded-2xl p-6 shadow-2xl">
        <div class="text-center pb-5 border-b border-stone-800">
          <div class="inline-block p-3 rounded-full bg-amber-500/10 border border-amber-500/30 mb-2">
            <span class="text-2xl font-serif font-bold text-amber-400">CHAPA</span>
          </div>
          <h2 class="text-lg font-bold text-white">Chapa Secure Payment Gateway</h2>
          <p class="text-xs text-stone-400 mt-1">Order Ref: <code class="text-amber-400 font-mono">${tx_ref || 'KL-ORDER'}</code></p>
        </div>
        <div class="py-5 space-y-4">
          <div class="bg-stone-800/60 p-4 rounded-xl flex justify-between items-center">
            <span class="text-xs uppercase tracking-wider text-stone-400">Total Payable</span>
            <span class="text-2xl font-serif font-bold text-amber-300 font-mono">${currency || 'ETB'} ${Number(amount || 0).toLocaleString()}</span>
          </div>
          <div class="space-y-2">
            <label class="block text-xs uppercase font-mono text-stone-400">Choose Payment Channel</label>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <button class="p-3 rounded-xl border border-amber-500 bg-amber-500/10 text-amber-300 font-medium">📱 Telebirr</button>
              <button class="p-3 rounded-xl border border-stone-700 bg-stone-800 text-stone-300">🏦 CBE Birr</button>
              <button class="p-3 rounded-xl border border-stone-700 bg-stone-800 text-stone-300">💳 Visa / Mastercard</button>
              <button class="p-3 rounded-xl border border-stone-700 bg-stone-800 text-stone-300">⚡ Awash Bank</button>
            </div>
          </div>
        </div>
        <div class="pt-4 border-t border-stone-800">
          <button onclick="approvePayment()" class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-bold uppercase text-xs tracking-widest rounded-xl transition shadow-lg">
            ✓ Complete & Authorize Payment
          </button>
          <a href="http://localhost:5173" class="block text-center mt-3 text-xs text-stone-400 hover:text-white">Cancel and Return to Atelier</a>
        </div>
      </div>
      <script>
        async function approvePayment() {
          try {
            await fetch('/api/payments/chapa/verify/${tx_ref}');
            window.location.href = 'http://localhost:5173/?chapa_verified=true&tx_ref=${tx_ref}';
          } catch {
            window.location.href = 'http://localhost:5173';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Chapa Webhook endpoint
app.post('/api/payments/chapa/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-chapa-signature'];
    const valid = payments.verifyWebhookSignature(signature, req.body);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    const { tx_ref, status } = req.body;
    if (status === 'success' && tx_ref) {
      const orders = await db.getOrders();
      const matchedOrder = orders.find(
        (o) => o.id === tx_ref || (o.transferDetails && o.transferDetails.transactionId === tx_ref)
      );
      if (matchedOrder) {
        matchedOrder.paymentStatus = 'Approved';
        matchedOrder.status = 'In Atelier';
        await db.updateOrder(matchedOrder.id, matchedOrder);
        await notifier.notifyPaymentVerified(matchedOrder);
      }
    }
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ message: 'Webhook processing error' });
  }
});

// ==========================================
// 6. ADMIN ANALYTICS & INSIGHTS
// ==========================================
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const orders = await db.getOrders();
    const products = await db.getProducts();

    // Financial Metrics
    let revenueEtb = 0;
    let revenueUsd = 0;
    let pendingVerificationCount = 0;
    let inAtelierCount = 0;
    let completedCount = 0;

    const monthlyTrends = {};

    orders.forEach((o) => {
      if (o.paymentStatus === 'Approved') {
        if (o.currency === 'ETB') revenueEtb += Number(o.totalAmount || 0);
        else revenueUsd += Number(o.totalAmount || 0);
      }

      if (o.status === 'Payment Verification' || o.paymentStatus === 'Pending Verification') {
        pendingVerificationCount++;
      } else if (o.status === 'In Atelier' || o.status === 'Processing') {
        inAtelierCount++;
      } else if (o.status === 'Delivered') {
        completedCount++;
      }

      // Group by month
      const monthKey = o.createdAt ? o.createdAt.substring(0, 7) : '2026-11';
      monthlyTrends[monthKey] = (monthlyTrends[monthKey] || 0) + Number(o.totalAmount || 0);
    });

    // Top Selling Products & Inventory Health
    const productSalesMap = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const pId = item.product?.id;
        if (pId) {
          productSalesMap[pId] = (productSalesMap[pId] || 0) + (item.quantity || 1);
        }
      });
    });

    const inventoryHealth = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock !== undefined ? p.stock : 10,
      unitsSold: productSalesMap[p.id] || 0,
      status: (p.stock || 0) <= 2 ? 'Low Stock' : 'Healthy'
    }));

    res.json({
      totalOrders: orders.length,
      revenueEtb,
      revenueUsd,
      pendingVerificationCount,
      inAtelierCount,
      completedCount,
      monthlyTrends,
      inventoryHealth
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error compiling analytics' });
  }
});

// ==========================================
// 7. CUSTOMER INQUIRIES & MESSAGES
// ==========================================
app.get('/api/messages', async (req, res) => {
  try {
    let messages = await db.getMessages();
    if (req.query.email) {
      const qEmail = req.query.email.toLowerCase().trim();
      messages = messages.filter(m => (m.email || '').toLowerCase() === qEmail);
    }
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error reading customer messages' });
  }
});

app.post('/api/messages/:id/reply', verifyAdmin, async (req, res) => {
  try {
    const { reply, repliedBy = 'Kiru Atelier Master Artisan' } = req.body;
    if (!reply || !reply.trim()) {
      return res.status(400).json({ message: 'Reply content cannot be empty' });
    }
    const updated = await db.replyMessage(req.params.id, reply.trim(), repliedBy);
    if (!updated) {
      return res.status(404).json({ message: 'Message not found' });
    }
    broadcastEvent('MESSAGE_REPLIED', { message: updated });
    res.json({ message: 'Reply dispatched successfully', data: updated });
  } catch (error) {
    console.error('Error replying to customer message:', error);
    res.status(500).json({ message: 'Error saving reply' });
  }
});

app.post('/api/messages', verifyAuth, async (req, res) => {
  try {
    const text = String(req.body.message || '').trim();
    if (!text) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const userRecord = await db.findUserById(req.user.id);
    const authName = (userRecord?.name || req.user.name || req.body.fullName || 'Collector').trim();
    const authEmail = (userRecord?.email || req.user.email || '').trim().toLowerCase();
    const authPhone = (userRecord?.phone || req.body.phone || '').trim();

    const newMsg = {
      id: req.body.id || `msg-${Date.now()}`,
      userId: req.user.id,
      fullName: authName,
      email: authEmail,
      phone: authPhone,
      inquiryType: req.body.inquiryType || 'bespoke',
      message: text,
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    const saved = await db.saveMessage(newMsg);
    broadcastEvent('NEW_MESSAGE', { message: saved });
    res.status(201).json({ message: 'Message sent', data: saved });
  } catch (error) {
    console.error('Error saving customer message:', error);
    res.status(500).json({ message: 'Error saving customer message' });
  }
});

app.post('/api/messages/:id/customer-reply', verifyAuth, async (req, res) => {
  try {
    const { reply } = req.body || {};
    if (!reply || !String(reply).trim()) {
      return res.status(400).json({ message: 'Reply content cannot be empty' });
    }

    const existing = await db.getMessageById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Message thread not found' });
    }

    const ownsById = existing.userId && existing.userId === req.user.id;
    const ownsByEmail =
      existing.email &&
      req.user.email &&
      existing.email.toLowerCase() === req.user.email.toLowerCase();

    if (!ownsById && !ownsByEmail && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only reply to your own inquiries.' });
    }

    const userRecord = await db.findUserById(req.user.id);
    const updated = await db.customerReplyMessage(
      req.params.id,
      String(reply).trim(),
      userRecord?.name || req.user.name || existing.fullName
    );
    broadcastEvent('MESSAGE_REPLIED', { message: updated });
    res.json({ message: 'Customer reply sent to atelier', data: updated });
  } catch (error) {
    console.error('Error saving customer follow-up reply:', error);
    res.status(500).json({ message: 'Error saving customer reply' });
  }
});

app.patch('/api/messages/:id/status', verifyAdmin, async (req, res) => {
  try {
    const updated = await db.updateMessage(req.params.id, { status: req.body.status });
    if (!updated) {
      return res.status(404).json({ message: 'Message not found' });
    }
    broadcastEvent('MESSAGE_STATUS_UPDATED', { message: updated });
    res.json({ message: 'Message status updated', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating message status' });
  }
});

// ==========================================
// 7.5. SITE CONTENT CMS (About & Contact Pages)
// ==========================================
app.get('/api/content', async (req, res) => {
  try {
    const content = await db.getAllSiteContent();
    res.json(content);
  } catch (error) {
    console.error('Error fetching site content:', error);
    res.status(500).json({ message: 'Error retrieving site content' });
  }
});

app.get('/api/content/:section', async (req, res) => {
  try {
    const validSection = req.params.section === 'contact' ? 'contact' : 'about';
    const content = await db.getSiteContent(validSection);
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving section content' });
  }
});

app.put('/api/content/:section', verifyAdmin, async (req, res) => {
  try {
    const validSection = req.params.section === 'contact' ? 'contact' : 'about';
    const updated = await db.saveSiteContent(validSection, req.body);
    broadcastEvent('CONTENT_UPDATED', { section: validSection, content: updated });
    res.json({ message: `${validSection} content updated successfully`, section: validSection, content: updated });
  } catch (error) {
    console.error('Error saving site content:', error);
    res.status(500).json({ message: 'Error updating site content' });
  }
});

// ==========================================
// 7B. LOOKBOOK VIDEO MANAGEMENT CMS
// ==========================================
app.get('/api/lookbook', async (req, res) => {
  try {
    const items = await db.getLookbookItems();
    res.json(items);
  } catch (error) {
    console.error('Error fetching lookbook items:', error);
    res.status(500).json({ message: 'Error retrieving lookbook items' });
  }
});

app.post('/api/lookbook', verifyAdmin, async (req, res) => {
  try {
    const newItem = req.body;
    if (!newItem || !newItem.title) {
      return res.status(400).json({ message: 'Title is required for lookbook item' });
    }
    const currentItems = await db.getLookbookItems();
    const itemToAdd = {
      id: newItem.id || `lb-${Date.now()}`,
      title: String(newItem.title).trim(),
      location: newItem.location ? String(newItem.location).trim() : 'Addis Ababa Atelier',
      category: newItem.category || 'all',
      description: newItem.description ? String(newItem.description).trim() : '',
      image: newItem.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      videoUrl: newItem.videoUrl || '',
      hotspot: newItem.hotspot || undefined,
      isHidden: Boolean(newItem.isHidden),
      orderIndex: currentItems.length + 1
    };
    const updatedList = [itemToAdd, ...currentItems];
    await db.saveLookbookItems(updatedList);
    broadcastEvent('LOOKBOOK_UPDATED', { items: updatedList, item: itemToAdd, action: 'add' });
    res.status(201).json({ message: 'Lookbook video added successfully', item: itemToAdd, items: updatedList });
  } catch (error) {
    console.error('Error adding lookbook item:', error);
    res.status(500).json({ message: 'Error adding lookbook item' });
  }
});

app.put('/api/lookbook/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const currentItems = await db.getLookbookItems();
    const exists = currentItems.some(item => item.id === id);
    if (!exists) {
      return res.status(404).json({ message: 'Lookbook item not found' });
    }
    const updatedList = currentItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updates,
          id // enforce immutable ID
        };
      }
      return item;
    });
    await db.saveLookbookItems(updatedList);
    broadcastEvent('LOOKBOOK_UPDATED', { items: updatedList, id, action: 'update' });
    res.json({ message: 'Lookbook video updated successfully', items: updatedList });
  } catch (error) {
    console.error('Error updating lookbook item:', error);
    res.status(500).json({ message: 'Error updating lookbook item' });
  }
});

app.delete('/api/lookbook/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const currentItems = await db.getLookbookItems();
    const updatedList = currentItems.filter(item => item.id !== id);
    await db.saveLookbookItems(updatedList);
    broadcastEvent('LOOKBOOK_UPDATED', { items: updatedList, id, action: 'delete' });
    res.json({ message: 'Lookbook video removed successfully', items: updatedList });
  } catch (error) {
    console.error('Error deleting lookbook item:', error);
    res.status(500).json({ message: 'Error deleting lookbook item' });
  }
});

app.put('/api/lookbook', verifyAdmin, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items array is required' });
    }
    await db.saveLookbookItems(items);
    broadcastEvent('LOOKBOOK_UPDATED', { items, action: 'reorder' });
    res.json({ message: 'Lookbook videos updated successfully', items });
  } catch (error) {
    console.error('Error reordering lookbook items:', error);
    res.status(500).json({ message: 'Error reordering lookbook items' });
  }
});

// ==========================================
// 8. COUPONS & HEALTH
// ==========================================
app.post('/api/coupons/verify', (req, res) => {
  const { code, amount } = req.body;
  const coupons = {
    KIRU10: { percent: 0.1, label: '10% Artisan Privilege' },
    LUXURY50: { fixed: 50, min: 300, label: '$50 Bespoke Credit' },
    FIRSTORDER: { percent: 0.15, label: '15% First Collector Welcome' }
  };

  const c = coupons[(code || '').toUpperCase()];
  if (!c) {
    return res.status(400).json({ valid: false, message: 'Invalid coupon code' });
  }

  if (c.min && amount < c.min) {
    return res.status(400).json({ valid: false, message: `Minimum order $${c.min} required` });
  }

  res.json({ valid: true, coupon: c });
});

// ==========================================
// 9. AI ATELIER CONCIERGE ASSISTANT
// ==========================================
app.post('/api/ai/chat', optionalAuth, async (req, res) => {
  try {
    const { message, sessionId, lang } = req.body;
    const result = await aiConcierge.chat({
      message,
      sessionId: sessionId || (req.user ? req.user.id : 'guest'),
      lang: lang || 'en',
      user: req.user || null
    });
    res.json(result);
  } catch (err) {
    console.error('AI Concierge error:', err.message);
    res.status(500).json({
      reply: 'Our master concierge is momentarily occupied at the craftsman bench. Please inquire again in a moment.',
      suggestions: ['Track Order', 'Payment Options']
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'Kiru Leathers Atelier API',
    database: db.isMySQL()
      ? 'MySQL Database (localhost:3306 / kiru_atelier)'
      : db.isMongo()
      ? 'MongoDB Cluster'
      : 'SQLite Database (server/data/kiru_atelier.db)',
    connectedSseClients: sseClients.size,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 10. PRODUCTION STATIC ASSETS & SPA ROUTING
// ==========================================
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Universal Express 5 SPA catch-all middleware
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Initialize database engine first, then start server
const PORT = process.env.PORT || 5000;
db.initDatabase()
  .catch((err) => {
    console.warn('Database initialization notice (continuing with fallback):', err.message);
  })
  .finally(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Kiru Leathers Server running on http://0.0.0.0:${PORT}`);
    });
  });
