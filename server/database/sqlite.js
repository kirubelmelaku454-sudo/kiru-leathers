const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { buildInitialThread, parseThreadJson, appendThreadEntry } = require('./messageHelpers');
const { DEFAULT_ABOUT_CONTENT, DEFAULT_CONTACT_CONTENT, DEFAULT_LOOKBOOK_ITEMS, DEFAULT_SITE_CONTENT } = require('./defaultSiteContent');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'kiru_atelier.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency & foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize Relational Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    phone TEXT,
    city TEXT,
    address TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT,
    price REAL NOT NULL,
    description TEXT,
    stock INTEGER DEFAULT 10,
    rating REAL DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    is_new INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    images_json TEXT,
    colors_json TEXT,
    sizes_json TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    customer_city TEXT,
    delivery_zone_id TEXT,
    delivery_zone_name TEXT,
    subtotal REAL NOT NULL,
    discount REAL DEFAULT 0,
    shipping REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'ETB',
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'Pending Verification',
    status TEXT NOT NULL DEFAULT 'Processing',
    tracking_number TEXT,
    transfer_bank TEXT,
    transfer_transaction_id TEXT,
    transfer_receipt_url TEXT,
    rejection_reason TEXT,
    notifications_json TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    color_name TEXT,
    color_hex TEXT,
    size TEXT,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    customization_json TEXT,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    date TEXT,
    verified INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS customer_messages (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    inquiry_type TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    reply TEXT,
    reply_date TEXT,
    replied_by TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ai_conversations (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    user_message TEXT,
    assistant_response TEXT,
    language TEXT DEFAULT 'en',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_content (
    section_key TEXT PRIMARY KEY,
    content_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// Safe column migrations
try { db.exec('ALTER TABLE customer_messages ADD COLUMN reply TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE customer_messages ADD COLUMN reply_date TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE customer_messages ADD COLUMN replied_by TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE customer_messages ADD COLUMN user_id TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE customer_messages ADD COLUMN thread_json TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE orders ADD COLUMN courier_name TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE orders ADD COLUMN courier_phone TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE orders ADD COLUMN vehicle_plate TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE orders ADD COLUMN delivery_note TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE reviews ADD COLUMN image_url TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN loyalty_points INTEGER DEFAULT 0'); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN loyalty_tier TEXT DEFAULT 'Classic Member'"); } catch (e) {}

// Auto-migration from existing JSON files if tables are empty
const migrateFromJsonIfEmpty = () => {
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (usersCount === 0) {
    const usersJsonPath = path.join(dataDir, 'users.json');
    if (fs.existsSync(usersJsonPath)) {
      try {
        const users = JSON.parse(fs.readFileSync(usersJsonPath, 'utf-8'));
        const insertUser = db.prepare(`
          INSERT OR IGNORE INTO users (id, name, email, password_hash, role, phone, city, address, created_at)
          VALUES (@id, @name, @email, @passwordHash, @role, @phone, @city, @address, @createdAt)
        `);
        const insertMany = db.transaction((list) => {
          for (const u of list) insertUser.run(u);
        });
        insertMany(users);
        console.log(`📥 Migrated ${users.length} users into SQLite`);
      } catch (e) {
        console.error('Error migrating users:', e.message);
      }
    }
  }

  const productsJsonPath = path.join(dataDir, 'products.json');
  if (fs.existsSync(productsJsonPath)) {
    try {
      const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));
      const upsertProduct = db.prepare(`
        INSERT INTO products (
          id, name, category, category_label, price, description, stock,
          rating, reviews_count, is_new, featured, is_hidden, images_json, colors_json, sizes_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          category = excluded.category,
          category_label = excluded.category_label,
          price = excluded.price,
          description = excluded.description,
          stock = excluded.stock,
          images_json = excluded.images_json,
          colors_json = excluded.colors_json,
          sizes_json = excluded.sizes_json,
          rating = excluded.rating,
          featured = excluded.featured,
          is_hidden = excluded.is_hidden
      `);
      const insertReview = db.prepare(`
        INSERT OR IGNORE INTO reviews (id, product_id, author, rating, comment, date, verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction((prods) => {
        for (const p of prods) {
          upsertProduct.run(
            p.id,
            p.name,
            p.category,
            p.categoryLabel || (p.category.charAt(0).toUpperCase() + p.category.slice(1)),
            p.price,
            p.description || '',
            p.stock !== undefined ? p.stock : 10,
            p.rating || 5.0,
            p.reviewsCount || (p.reviews ? p.reviews.length : 0),
            p.isNew ? 1 : 0,
            p.featured ? 1 : 0,
            p.hidden || p.is_hidden ? 1 : 0,
            JSON.stringify(p.images || []),
            JSON.stringify(p.colors || []),
            JSON.stringify(p.sizes || []),
            p.created_at || new Date().toISOString()
          );

          if (Array.isArray(p.reviews)) {
            for (const r of p.reviews) {
              insertReview.run(
                r.id || `rev_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                p.id,
                r.author || 'Anonymous',
                r.rating || 5,
                r.comment || '',
                r.date || 'Recently',
                r.verified ? 1 : 0,
                new Date().toISOString()
              );
            }
          }
        }
      });
      insertMany(products);
      console.log(`📥 Synced ${products.length} products into SQLite`);
    } catch (e) {
      console.error('Error migrating products:', e.message);
    }
  }

  const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  if (ordersCount === 0) {
    const ordersJsonPath = path.join(dataDir, 'orders.json');
    if (fs.existsSync(ordersJsonPath)) {
      try {
        const orders = JSON.parse(fs.readFileSync(ordersJsonPath, 'utf-8'));
        const insertOrder = db.prepare(`
          INSERT OR IGNORE INTO orders (
            id, user_id, customer_name, customer_email, customer_phone, customer_address, customer_city,
            delivery_zone_id, delivery_zone_name, subtotal, discount, shipping, total_amount,
            currency, payment_method, payment_status, status, tracking_number, transfer_bank,
            transfer_transaction_id, transfer_receipt_url, rejection_reason, notifications_json, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertItem = db.prepare(`
          INSERT INTO order_items (
            id, order_id, product_id, product_name, color_name, color_hex, size, quantity, unit_price, customization_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertMany = db.transaction((orderList) => {
          for (const o of orderList) {
            insertOrder.run(
              o.id,
              o.userId || null,
              o.customer?.fullName || 'Collector',
              o.customer?.email || '',
              o.customer?.phone || '',
              o.customer?.address || '',
              o.customer?.city || 'Addis Ababa',
              o.deliveryZoneId || o.customer?.deliveryZoneId || 'aa-bole',
              o.deliveryZoneName || o.customer?.deliveryZoneName || 'Bole & Central Addis',
              o.subtotal || 0,
              o.discount || 0,
              o.shipping || 0,
              o.totalAmount || 0,
              o.currency || 'ETB',
              o.paymentMethod || 'mobile_transfer',
              o.paymentStatus || 'Approved',
              o.status || 'Processing',
              o.trackingNumber || `TRK-${o.id}`,
              o.transferDetails?.bank || null,
              o.transferDetails?.transactionId || null,
              o.transferDetails?.receiptImage || null,
              o.rejectionReason || null,
              JSON.stringify(o.notifications || []),
              o.createdAt || new Date().toISOString()
            );

            if (Array.isArray(o.items)) {
              for (let i = 0; i < o.items.length; i++) {
                const item = o.items[i];
                insertItem.run(
                  `item_${o.id}_${i}`,
                  o.id,
                  item.product?.id || 'prod_gen',
                  item.product?.name || 'Leather Piece',
                  item.color?.name || 'Artisan Tan',
                  item.color?.hex || '#8B4513',
                  item.size || 'Standard',
                  item.quantity || 1,
                  item.product?.price || 0,
                  JSON.stringify(item.customization || null)
                );
              }
            }
          }
        });
        insertMany(orders);
        console.log(`📥 Migrated ${orders.length} orders into SQLite`);
      } catch (e) {
        console.error('Error migrating orders:', e.message);
      }
    }
  }

  const messagesCount = db.prepare('SELECT COUNT(*) as count FROM customer_messages').get().count;
  if (messagesCount === 0) {
    const messagesJsonPath = path.join(dataDir, 'messages.json');
    if (fs.existsSync(messagesJsonPath)) {
      try {
        const messages = JSON.parse(fs.readFileSync(messagesJsonPath, 'utf-8'));
        const insertMsg = db.prepare(`
          INSERT OR IGNORE INTO customer_messages (id, full_name, email, phone, inquiry_type, message, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertMany = db.transaction((list) => {
          for (const m of list) {
            insertMsg.run(
              m.id,
              m.fullName || '',
              m.email || '',
              m.phone || '',
              m.inquiryType || 'bespoke',
              m.message || '',
              m.status || 'new',
              m.createdAt || new Date().toISOString()
            );
          }
        });
        insertMany(messages);
        console.log(`📥 Migrated ${messages.length} customer messages into SQLite`);
      } catch (e) {
        console.error('Error migrating messages:', e.message);
      }
    }
  }
};

migrateFromJsonIfEmpty();

// --- DATA ACCESS LAYER (DAL) ---
const sqliteDb = {
  raw: db,

  // Products
  getProducts: () => {
    const rows = db.prepare('SELECT * FROM products ORDER BY featured DESC, created_at DESC, rowid DESC').all();
    const reviewsStmt = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY rowid DESC');

    return rows.map((r) => {
      const reviews = reviewsStmt.all(r.id).map((rev) => ({
        id: rev.id,
        author: rev.author,
        rating: rev.rating,
        date: rev.date,
        comment: rev.comment,
        verified: rev.verified === 1
      }));

      return {
        id: r.id,
        name: r.name,
        category: r.category,
        categoryLabel: r.category_label,
        price: r.price,
        description: r.description,
        stock: r.stock,
        rating: r.rating,
        reviewsCount: r.reviews_count,
        isNew: r.is_new === 1,
        featured: r.featured === 1,
      hidden: r.is_hidden === 1,
      is_hidden: r.is_hidden === 1,
        images: JSON.parse(r.images_json || '[]'),
        colors: JSON.parse(r.colors_json || '[]'),
        sizes: JSON.parse(r.sizes_json || '[]'),
        reviews
      };
    });
  },

  getProductById: (id) => {
    const r = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!r) return null;
    const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY rowid DESC').all(id).map((rev) => ({
      id: rev.id,
      author: rev.author,
      rating: rev.rating,
      date: rev.date,
      comment: rev.comment,
      verified: rev.verified === 1,
      imageUrl: rev.image_url || undefined
    }));
    return {
      id: r.id,
      name: r.name,
      category: r.category,
      categoryLabel: r.category_label,
      price: r.price,
      description: r.description,
      stock: r.stock,
      rating: r.rating,
      reviewsCount: r.reviews_count,
      isNew: r.is_new === 1,
      featured: r.featured === 1,
      hidden: r.is_hidden === 1,
      is_hidden: r.is_hidden === 1,
      images: JSON.parse(r.images_json || '[]'),
      colors: JSON.parse(r.colors_json || '[]'),
      sizes: JSON.parse(r.sizes_json || '[]'),
      reviews
    };
  },

  saveProduct: (p) => {
    const stmt = db.prepare(`
      INSERT INTO products (
        id, name, category, category_label, price, description, stock,
        rating, reviews_count, is_new, featured, images_json, colors_json, sizes_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      p.id,
      p.name,
      p.category,
      p.categoryLabel || p.category.toUpperCase(),
      p.price,
      p.description || '',
      p.stock !== undefined ? p.stock : 10,
      p.rating || 5.0,
      p.reviewsCount || 0,
      p.isNew ? 1 : 0,
      p.featured ? 1 : 0,
      JSON.stringify(p.images || []),
      JSON.stringify(p.colors || []),
      JSON.stringify(p.sizes || []),
      new Date().toISOString()
    );
    return sqliteDb.getProductById(p.id);
  },

  updateProduct: (id, updates) => {
    const existing = sqliteDb.getProductById(id);
    if (!existing) return null;

    const merged = { ...existing, ...updates };
    const stmt = db.prepare(`
      UPDATE products SET
        name = ?, category = ?, category_label = ?, price = ?, description = ?,
        stock = ?, rating = ?, reviews_count = ?, is_new = ?, featured = ?, is_hidden = ?,
        images_json = ?, colors_json = ?, sizes_json = ?
      WHERE id = ?
    `);
    const isHiddenVal = merged.hidden !== undefined ? (merged.hidden ? 1 : 0) : (merged.is_hidden ? 1 : 0);
    stmt.run(
      merged.name,
      merged.category,
      merged.categoryLabel,
      merged.price,
      merged.description,
      merged.stock,
      merged.rating,
      merged.reviewsCount,
      merged.isNew ? 1 : 0,
      merged.featured ? 1 : 0,
      isHiddenVal,
      JSON.stringify(merged.images || []),
      JSON.stringify(merged.colors || []),
      JSON.stringify(merged.sizes || []),
      id
    );
    return sqliteDb.getProductById(id);
  },

  deleteProduct: (id) => {
    const res = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return res.changes > 0;
  },

  addReview: (productId, review) => {
    const reviewId = review.id || `rev_${Date.now()}`;
    db.prepare(`
      INSERT INTO reviews (id, product_id, author, rating, comment, date, verified, image_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reviewId,
      productId,
      review.author || 'Artisan Collector',
      review.rating || 5,
      review.comment || '',
      review.date || 'Just now',
      review.verified ? 1 : 0,
      review.imageUrl || null,
      new Date().toISOString()
    );

    // Recalculate average rating & reviews count
    const stats = db.prepare('SELECT COUNT(*) as count, AVG(rating) as avgRating FROM reviews WHERE product_id = ?').get(productId);
    db.prepare('UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?').run(
      Number(stats.avgRating.toFixed(1)),
      stats.count,
      productId
    );

    return sqliteDb.getProductById(productId);
  },

  // Orders
  getOrders: () => {
    const rows = db.prepare('SELECT * FROM orders ORDER BY rowid DESC').all();
    const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

    return rows.map((r) => {
      const items = itemsStmt.all(r.id).map((it) => ({
        product: {
          id: it.product_id,
          name: it.product_name,
          price: it.unit_price,
          category: 'jackets',
          description: '',
          images: []
        },
        color: { name: it.color_name, hex: it.color_hex },
        size: it.size,
        quantity: it.quantity,
        customization: it.customization_json ? JSON.parse(it.customization_json) : undefined
      }));

      return {
        id: r.id,
        userId: r.user_id,
        customer: {
          fullName: r.customer_name,
          email: r.customer_email,
          phone: r.customer_phone,
          address: r.customer_address,
          city: r.customer_city,
          deliveryZoneId: r.delivery_zone_id,
          deliveryZoneName: r.delivery_zone_name,
          paymentMethod: r.payment_method
        },
        items,
        subtotal: r.subtotal,
        discount: r.discount,
        shipping: r.shipping,
        totalAmount: r.total_amount,
        currency: r.currency,
        paymentMethod: r.payment_method,
        paymentStatus: r.payment_status,
        rejectionReason: r.rejection_reason || undefined,
        transferDetails: r.transfer_transaction_id
          ? {
              bank: r.transfer_bank || 'CBE',
              transactionId: r.transfer_transaction_id,
              receiptImage: r.transfer_receipt_url,
              submittedAt: r.created_at
            }
          : undefined,
        deliveryZoneId: r.delivery_zone_id,
        deliveryZoneName: r.delivery_zone_name,
        notifications: JSON.parse(r.notifications_json || '[]'),
        courier: r.courier_name ? {
          name: r.courier_name,
          phone: r.courier_phone || '',
          vehiclePlate: r.vehicle_plate || '',
          deliveryNote: r.delivery_note || ''
        } : undefined,
        status: r.status,
        createdAt: r.created_at,
        trackingNumber: r.tracking_number
      };
    });
  },

  getOrderById: (id) => {
    const r = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!r) return null;
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id).map((it) => ({
      product: {
        id: it.product_id,
        name: it.product_name,
        price: it.unit_price,
        category: 'jackets',
        description: '',
        images: []
      },
      color: { name: it.color_name, hex: it.color_hex },
      size: it.size,
      quantity: it.quantity,
      customization: it.customization_json ? JSON.parse(it.customization_json) : undefined
    }));

    return {
      id: r.id,
      userId: r.user_id,
      customer: {
        fullName: r.customer_name,
        email: r.customer_email,
        phone: r.customer_phone,
        address: r.customer_address,
        city: r.customer_city,
        deliveryZoneId: r.delivery_zone_id,
        deliveryZoneName: r.delivery_zone_name,
        paymentMethod: r.payment_method
      },
      items,
      subtotal: r.subtotal,
      discount: r.discount,
      shipping: r.shipping,
      totalAmount: r.total_amount,
      currency: r.currency,
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status,
      rejectionReason: r.rejection_reason || undefined,
      transferDetails: r.transfer_transaction_id
        ? {
            bank: r.transfer_bank || 'CBE',
            transactionId: r.transfer_transaction_id,
            receiptImage: r.transfer_receipt_url,
            submittedAt: r.created_at
          }
        : undefined,
      deliveryZoneId: r.delivery_zone_id,
      deliveryZoneName: r.delivery_zone_name,
      notifications: JSON.parse(r.notifications_json || '[]'),
      courier: r.courier_name ? {
        name: r.courier_name,
        phone: r.courier_phone || '',
        vehiclePlate: r.vehicle_plate || '',
        deliveryNote: r.delivery_note || ''
      } : undefined,
      status: r.status,
      createdAt: r.created_at,
      trackingNumber: r.tracking_number
    };
  },

  saveOrder: (order) => {
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id, user_id, customer_name, customer_email, customer_phone, customer_address, customer_city,
        delivery_zone_id, delivery_zone_name, subtotal, discount, shipping, total_amount,
        currency, payment_method, payment_status, status, tracking_number, transfer_bank,
        transfer_transaction_id, transfer_receipt_url, rejection_reason, notifications_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, product_name, color_name, color_hex, size, quantity, unit_price, customization_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const saveTransaction = db.transaction(() => {
      insertOrder.run(
        order.id,
        order.userId || null,
        order.customer?.fullName || 'Collector',
        order.customer?.email || '',
        order.customer?.phone || '',
        order.customer?.address || '',
        order.customer?.city || 'Addis Ababa',
        order.deliveryZoneId || order.customer?.deliveryZoneId || 'aa-bole',
        order.deliveryZoneName || order.customer?.deliveryZoneName || 'Bole & Central Addis',
        order.subtotal || 0,
        order.discount || 0,
        order.shipping || 0,
        order.totalAmount || 0,
        order.currency || 'ETB',
        order.paymentMethod || 'mobile_transfer',
        order.paymentStatus || 'Pending Verification',
        order.status || 'Processing',
        order.trackingNumber || `TRK-${order.id}`,
        order.transferDetails?.bank || null,
        order.transferDetails?.transactionId || null,
        order.transferDetails?.receiptImage || null,
        order.rejectionReason || null,
        JSON.stringify(order.notifications || []),
        order.createdAt || new Date().toISOString()
      );

      if (Array.isArray(order.items)) {
        for (let i = 0; i < order.items.length; i++) {
          const item = order.items[i];
          insertItem.run(
            `item_${order.id}_${i}_${Date.now()}`,
            order.id,
            item.product?.id || 'prod_gen',
            item.product?.name || 'Handcrafted Leather Piece',
            item.color?.name || 'Artisan Tan',
            item.color?.hex || '#8B4513',
            item.size || 'Standard',
            item.quantity || 1,
            item.product?.price || 0,
            JSON.stringify(item.customization || null)
          );
        }
      }
    });

    saveTransaction();
    return sqliteDb.getOrderById(order.id);
  },

  updateOrder: (id, updates) => {
    const existing = sqliteDb.getOrderById(id);
    if (!existing) return null;

    const merged = { ...existing, ...updates };
    db.prepare(`
      UPDATE orders SET
        payment_status = ?,
        status = ?,
        rejection_reason = ?,
        transfer_bank = ?,
        transfer_transaction_id = ?,
        transfer_receipt_url = ?,
        notifications_json = ?,
        courier_name = ?,
        courier_phone = ?,
        vehicle_plate = ?,
        delivery_note = ?
      WHERE id = ?
    `).run(
      merged.paymentStatus,
      merged.status,
      merged.rejectionReason || null,
      merged.transferDetails?.bank || null,
      merged.transferDetails?.transactionId || null,
      merged.transferDetails?.receiptImage || null,
      JSON.stringify(merged.notifications || []),
      merged.courier?.name || null,
      merged.courier?.phone || null,
      merged.courier?.vehiclePlate || null,
      merged.courier?.deliveryNote || null,
      id
    );

    return sqliteDb.getOrderById(id);
  },

  // Users
  getUsers: () => {
    return db.prepare('SELECT id, name, email, password_hash as passwordHash, role, phone, city, address, loyalty_points as loyaltyPoints, loyalty_tier as loyaltyTier, created_at as createdAt FROM users').all();
  },

  findUserByEmail: (email) => {
    return db.prepare('SELECT id, name, email, password_hash as passwordHash, role, phone, city, address, loyalty_points as loyaltyPoints, loyalty_tier as loyaltyTier, created_at as createdAt FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  },

  findUserById: (id) => {
    return db.prepare('SELECT id, name, email, password_hash as passwordHash, role, phone, city, address, loyalty_points as loyaltyPoints, loyalty_tier as loyaltyTier, created_at as createdAt FROM users WHERE id = ?').get(id);
  },

  addLoyaltyPoints: (userId, pointsToAdd) => {
    if (!userId || !pointsToAdd) return null;
    const user = sqliteDb.findUserById(userId);
    if (!user) return null;
    const currentPoints = user.loyaltyPoints || 0;
    const newPoints = currentPoints + Math.max(0, pointsToAdd);
    let newTier = 'Classic Member';
    if (newPoints >= 1500) {
      newTier = 'Royal Collector';
    } else if (newPoints >= 500) {
      newTier = 'Artisan Circle';
    }
    db.prepare('UPDATE users SET loyalty_points = ?, loyalty_tier = ? WHERE id = ?').run(newPoints, newTier, userId);
    return sqliteDb.findUserById(userId);
  },

  saveUser: (user) => {
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, phone, city, address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      user.name,
      user.email,
      user.passwordHash,
      user.role || 'customer',
      user.phone || '',
      user.city || 'Addis Ababa',
      user.address || '',
      user.createdAt || new Date().toISOString()
    );
    return sqliteDb.findUserById(user.id);
  },

  updateUser: (id, updates) => {
    const existing = sqliteDb.findUserById(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates };

    db.prepare(`
      UPDATE users SET
        name = ?, phone = ?, city = ?, address = ?
      WHERE id = ?
    `).run(
      merged.name,
      merged.phone || '',
      merged.city || '',
      merged.address || '',
      id
    );
    return sqliteDb.findUserById(id);
  },

  // Messages
  getMessageById: (id) => {
    const row = db.prepare('SELECT id, user_id as userId, full_name as fullName, email, phone, inquiry_type as inquiryType, message, status, reply, reply_date as replyDate, replied_by as repliedBy, thread_json as threadJson, created_at as createdAt FROM customer_messages WHERE id = ?').get(id);
    if (!row) return null;
    const thread = parseThreadJson(row.threadJson, row);
    const { threadJson, ...rest } = row;
    return { ...rest, userId: row.userId || undefined, thread };
  },

  getMessages: () => {
    const rows = db.prepare('SELECT id, user_id as userId, full_name as fullName, email, phone, inquiry_type as inquiryType, message, status, reply, reply_date as replyDate, replied_by as repliedBy, thread_json as threadJson, created_at as createdAt FROM customer_messages ORDER BY rowid DESC').all();
    return rows.map((row) => {
      const thread = parseThreadJson(row.threadJson, row);
      const { threadJson, ...rest } = row;
      return { ...rest, userId: row.userId || undefined, thread };
    });
  },

  saveMessage: (msg) => {
    const createdAt = msg.createdAt || new Date().toISOString();
    const thread = Array.isArray(msg.thread) && msg.thread.length > 0
      ? msg.thread
      : buildInitialThread({ id: msg.id, fullName: msg.fullName, message: msg.message, createdAt });
    db.prepare(`
      INSERT INTO customer_messages (id, user_id, full_name, email, phone, inquiry_type, message, status, reply, reply_date, replied_by, thread_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      msg.id,
      msg.userId || null,
      msg.fullName,
      msg.email,
      msg.phone || '',
      msg.inquiryType || 'bespoke',
      msg.message,
      msg.status || 'new',
      msg.reply || null,
      msg.replyDate || null,
      msg.repliedBy || null,
      JSON.stringify(thread),
      createdAt
    );
    return sqliteDb.getMessageById(msg.id);
  },

  replyMessage: (id, replyText, repliedBy = 'Kiru Atelier Master Artisan') => {
    const existing = sqliteDb.getMessageById(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const updatedThread = appendThreadEntry(existing.thread, {
      id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderRole: 'admin',
      senderName: repliedBy,
      text: replyText,
      createdAt: now
    });
    db.prepare(`
      UPDATE customer_messages
      SET reply = ?, reply_date = ?, replied_by = ?, status = 'replied', thread_json = ?
      WHERE id = ?
    `).run(replyText, now, repliedBy, JSON.stringify(updatedThread), id);
    return sqliteDb.getMessageById(id);
  },

  customerReplyMessage: (id, replyText, customerName) => {
    const existing = sqliteDb.getMessageById(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const updatedThread = appendThreadEntry(existing.thread, {
      id: `crep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderRole: 'customer',
      senderName: customerName || existing.fullName || 'Collector',
      text: replyText,
      createdAt: now
    });
    db.prepare(`
      UPDATE customer_messages
      SET status = 'new', thread_json = ?
      WHERE id = ?
    `).run(JSON.stringify(updatedThread), id);
    return sqliteDb.getMessageById(id);
  },

  updateMessage: (id, updates) => {
    if (updates.status) {
      db.prepare('UPDATE customer_messages SET status = ? WHERE id = ?').run(updates.status, id);
    }
    if (updates.reply) {
      db.prepare('UPDATE customer_messages SET reply = ?, reply_date = ?, replied_by = ? WHERE id = ?').run(
        updates.reply,
        updates.replyDate || new Date().toISOString(),
        updates.repliedBy || 'Kiru Atelier Master Artisan',
        id
      );
    }
    return sqliteDb.getMessageById(id);
  },

  // AI Conversations Logger
  saveAiConversation: (sessionId, userMessage, assistantResponse, language = 'en') => {
    const id = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    db.prepare(`
      INSERT INTO ai_conversations (id, session_id, user_message, assistant_response, language, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      sessionId,
      userMessage,
      assistantResponse,
      language,
      new Date().toISOString()
    );
    return id;
  },

  // Site Content (About & Contact CMS)
  getSiteContent: (sectionKey) => {
    const validKey = sectionKey === 'contact' ? 'contact' : 'about';
    const defaultContent = DEFAULT_SITE_CONTENT[validKey] || {};
    try {
      const row = db.prepare('SELECT content_json FROM site_content WHERE section_key = ?').get(validKey);
      if (!row) return defaultContent;
      const parsed = JSON.parse(row.content_json || '{}');
      return { ...defaultContent, ...parsed };
    } catch (err) {
      console.warn('SQLite getSiteContent warning:', err.message);
      return defaultContent;
    }
  },

  getAllSiteContent: () => {
    return {
      about: sqliteDb.getSiteContent('about'),
      contact: sqliteDb.getSiteContent('contact')
    };
  },

  saveSiteContent: (sectionKey, content) => {
    const validKey = sectionKey === 'contact' ? 'contact' : 'about';
    const existing = sqliteDb.getSiteContent(validKey);
    const merged = { ...existing, ...(content || {}) };
    const jsonStr = JSON.stringify(merged);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO site_content (section_key, content_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(section_key) DO UPDATE SET
        content_json = excluded.content_json,
        updated_at = excluded.updated_at
    `).run(validKey, jsonStr, now);

    return sqliteDb.getSiteContent(validKey);
  },

  getLookbookItems: () => {
    try {
      const row = db.prepare('SELECT content_json FROM site_content WHERE section_key = ?').get('lookbook');
      if (!row) return DEFAULT_LOOKBOOK_ITEMS;
      const parsed = JSON.parse(row.content_json || '[]');
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LOOKBOOK_ITEMS;
    } catch (err) {
      console.warn('SQLite getLookbookItems warning:', err.message);
      return DEFAULT_LOOKBOOK_ITEMS;
    }
  },

  saveLookbookItems: (items) => {
    const jsonStr = JSON.stringify(items || []);
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO site_content (section_key, content_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(section_key) DO UPDATE SET
        content_json = excluded.content_json,
        updated_at = excluded.updated_at
    `).run('lookbook', jsonStr, now);
    return sqliteDb.getLookbookItems();
  }
};

module.exports = sqliteDb;
