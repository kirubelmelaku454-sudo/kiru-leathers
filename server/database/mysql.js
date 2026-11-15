const mysql = require('mysql2/promise');
const { buildInitialThread, parseThreadJson, appendThreadEntry } = require('./messageHelpers');
const { DEFAULT_ABOUT_CONTENT, DEFAULT_CONTACT_CONTENT, DEFAULT_LOOKBOOK_ITEMS, DEFAULT_SITE_CONTENT } = require('./defaultSiteContent');

let pool = null;

const initMySQL = async () => {
  if (pool) return pool;

  const host = process.env.MYSQL_HOST || process.env.MYSQLHOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || process.env.MYSQLPORT || '3306', 10);
  const user = process.env.MYSQL_USER || process.env.MYSQLUSER || 'root';
  const password = process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || '';
  const database = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'kiru_atelier';

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Verify connection & run safe idempotent schema migrations
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(64) PRIMARY KEY,
        product_id VARCHAR(64) NOT NULL,
        author VARCHAR(255) NOT NULL,
        rating INT NOT NULL DEFAULT 5,
        comment TEXT,
        date VARCHAR(64),
        verified TINYINT(1) DEFAULT 1,
        created_at VARCHAR(64) NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS site_content (
        section_key VARCHAR(64) PRIMARY KEY,
        content_json LONGTEXT NOT NULL,
        updated_at VARCHAR(64) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const alterStatements = [
      'ALTER TABLE products ADD COLUMN is_hidden TINYINT(1) DEFAULT 0',
      'ALTER TABLE customer_messages ADD COLUMN reply TEXT',
      'ALTER TABLE customer_messages ADD COLUMN reply_date VARCHAR(64)',
      'ALTER TABLE customer_messages ADD COLUMN replied_by VARCHAR(255)',
      'ALTER TABLE customer_messages ADD COLUMN user_id VARCHAR(64)',
      'ALTER TABLE customer_messages ADD COLUMN thread_json LONGTEXT',
      'ALTER TABLE orders ADD COLUMN courier_name VARCHAR(255)',
      'ALTER TABLE orders ADD COLUMN courier_phone VARCHAR(64)',
      'ALTER TABLE orders ADD COLUMN vehicle_plate VARCHAR(64)',
      'ALTER TABLE orders ADD COLUMN delivery_note TEXT',
      'ALTER TABLE reviews ADD COLUMN image_url TEXT',
      'ALTER TABLE users ADD COLUMN loyalty_points INT DEFAULT 0',
      "ALTER TABLE users ADD COLUMN loyalty_tier VARCHAR(64) DEFAULT 'Classic Member'"
    ];
    for (const sql of alterStatements) {
      try {
        await conn.query(sql);
      } catch (err) {
        // Ignore duplicate column (ER_DUP_FIELDNAME 1060)
        if (err.errno !== 1060) {
          console.warn('MySQL schema check notice:', err.message);
        }
      }
    }
  } finally {
    conn.release();
  }
  return pool;
};

// Helpers to format product and order records
const parseProduct = (row, reviews = []) => {
  if (!row) return null;
  return {
    ...row,
    price: Number(row.price),
    stock: row.stock !== null && row.stock !== undefined ? Number(row.stock) : 10,
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : 5.0,
    reviewsCount: Number(row.reviews_count || reviews.length || 0),
    isNew: Boolean(row.is_new),
    featured: Boolean(row.featured),
    hidden: Boolean(row.is_hidden),
    is_hidden: Boolean(row.is_hidden),
    categoryLabel: row.category_label,
    images: row.images_json ? JSON.parse(row.images_json) : [],
    colors: row.colors_json ? JSON.parse(row.colors_json) : [],
    sizes: row.sizes_json ? JSON.parse(row.sizes_json) : [],
    reviews
  };
};

const parseOrder = (row, items = []) => {
  if (!row) return null;
  const formattedItems = items.map(i => {
    const colorObj = {
      name: i.color_name || 'Artisan Tan',
      hex: i.color_hex || '#8B4513'
    };
    return {
      id: i.id,
      product: {
        id: i.product_id,
        name: i.product_name,
        price: Number(i.unit_price),
        category: 'jackets',
        description: '',
        images: []
      },
      color: colorObj,
      selectedColor: i.color_name ? colorObj : undefined,
      size: i.size || 'Standard',
      selectedSize: i.size || undefined,
      quantity: Number(i.quantity || 1),
      customization: i.customization_json ? JSON.parse(i.customization_json) : undefined
    };
  });

  return {
    id: row.id,
    userId: row.user_id || undefined,
    customer: {
      fullName: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
      address: row.customer_address,
      city: row.customer_city,
      deliveryZoneId: row.delivery_zone_id,
      deliveryZoneName: row.delivery_zone_name,
      paymentMethod: row.payment_method
    },
    items: formattedItems,
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    shipping: Number(row.shipping || 0),
    totalAmount: Number(row.total_amount || 0),
    currency: row.currency,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.status,
    trackingNumber: row.tracking_number,
    deliveryZoneId: row.delivery_zone_id || undefined,
    deliveryZoneName: row.delivery_zone_name || undefined,
    transferDetails: (row.transfer_bank || row.transfer_transaction_id || row.transfer_receipt_url) ? {
      bank: row.transfer_bank || 'CBE',
      transactionId: row.transfer_transaction_id,
      receiptImage: row.transfer_receipt_url,
      receiptUrl: row.transfer_receipt_url,
      submittedAt: row.created_at
    } : undefined,
    rejectionReason: row.rejection_reason || undefined,
    notifications: row.notifications_json ? JSON.parse(row.notifications_json) : [],
    createdAt: row.created_at
  };
};

// Database Methods
const getProducts = async () => {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY featured DESC, created_at DESC');
  let reviewRows = [];
  try {
    const [revs] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    reviewRows = revs;
  } catch {
    reviewRows = [];
  }
  return rows.map(row => {
    const prodReviews = reviewRows
      .filter(r => r.product_id === row.id)
      .map(rev => ({
        id: rev.id,
        author: rev.author,
        rating: Number(rev.rating),
        date: rev.date || 'Recently',
        comment: rev.comment || '',
        verified: Boolean(rev.verified)
      }));
    return parseProduct(row, prodReviews);
  });
};

const getProductById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  if (!rows[0]) return null;
  let prodReviews = [];
  try {
    const [revs] = await pool.query('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [id]);
    prodReviews = revs.map(rev => ({
      id: rev.id,
      author: rev.author,
      rating: Number(rev.rating),
      date: rev.date || 'Recently',
      comment: rev.comment || '',
      verified: Boolean(rev.verified)
    }));
  } catch {
    prodReviews = [];
  }
  return parseProduct(rows[0], prodReviews);
};

const saveProduct = async (p) => {
  const isHidden = p.hidden !== undefined ? (p.hidden ? 1 : 0) : (p.is_hidden ? 1 : 0);
  const query = `
    INSERT INTO products (
      id, name, category, category_label, price, description, stock, rating,
      reviews_count, is_new, featured, is_hidden, images_json, colors_json, sizes_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name), category = VALUES(category), category_label = VALUES(category_label),
      price = VALUES(price), description = VALUES(description), stock = VALUES(stock),
      rating = VALUES(rating), reviews_count = VALUES(reviews_count), is_new = VALUES(is_new),
      featured = VALUES(featured), is_hidden = VALUES(is_hidden), images_json = VALUES(images_json), colors_json = VALUES(colors_json),
      sizes_json = VALUES(sizes_json)
  `;
  await pool.query(query, [
    p.id,
    p.name,
    p.category,
    p.categoryLabel || (p.category || 'general').toUpperCase(),
    Number(p.price),
    p.description || null,
    p.stock !== undefined ? Number(p.stock) : 10,
    p.rating !== undefined ? Number(p.rating) : 5.0,
    p.reviewsCount || 0,
    p.isNew ? 1 : 0,
    p.featured ? 1 : 0,
    isHidden,
    JSON.stringify(p.images || []),
    JSON.stringify(p.colors || []),
    JSON.stringify(p.sizes || []),
    p.createdAt || new Date().toISOString()
  ]);
  return getProductById(p.id);
};

const updateProduct = async (id, updates) => {
  const p = await getProductById(id);
  if (!p) return null;
  const merged = { ...p, ...updates };
  return saveProduct(merged);
};

const deleteProduct = async (id) => {
  const [res] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return res.affectedRows > 0;
};

const addReview = async (productId, review) => {
  const revId = review.id || `rev-${Date.now()}`;
  await pool.query(
    'INSERT IGNORE INTO reviews (id, product_id, author, rating, comment, date, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      revId,
      productId,
      review.author || 'Anonymous Collector',
      Number(review.rating || 5),
      review.comment || '',
      review.date || 'Just now',
      review.verified === false ? 0 : 1,
      new Date().toISOString()
    ]
  );

  const [stats] = await pool.query(
    'SELECT COUNT(*) as count, AVG(rating) as avgRating FROM reviews WHERE product_id = ?',
    [productId]
  );
  if (stats[0] && stats[0].count > 0) {
    await pool.query(
      'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
      [Number(Number(stats[0].avgRating).toFixed(1)), stats[0].count, productId]
    );
  }
  return getProductById(productId);
};

const getOrders = async () => {
  const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  const [items] = await pool.query('SELECT * FROM order_items');
  return orders.map(o => {
    const oItems = items.filter(i => i.order_id === o.id);
    return parseOrder(o, oItems);
  });
};

const getOrderById = async (id) => {
  const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
  if (!orders[0]) return null;
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
  return parseOrder(orders[0], items);
};

const saveOrder = async (order) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const insertOrderSql = `
      INSERT INTO orders (
        id, user_id, customer_name, customer_email, customer_phone, customer_address,
        customer_city, delivery_zone_id, delivery_zone_name, subtotal, discount,
        shipping, total_amount, currency, payment_method, payment_status, status,
        tracking_number, transfer_bank, transfer_transaction_id, transfer_receipt_url,
        rejection_reason, notifications_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        payment_status = VALUES(payment_status),
        status = VALUES(status),
        rejection_reason = VALUES(rejection_reason),
        transfer_bank = VALUES(transfer_bank),
        transfer_transaction_id = VALUES(transfer_transaction_id),
        transfer_receipt_url = VALUES(transfer_receipt_url),
        notifications_json = VALUES(notifications_json)
    `;

    const receipt = order.transferDetails?.receiptImage || order.transferDetails?.receiptUrl || null;
    await conn.query(insertOrderSql, [
      order.id,
      order.userId || null,
      order.customer?.fullName || null,
      order.customer?.email || null,
      order.customer?.phone || null,
      order.customer?.address || null,
      order.customer?.city || null,
      order.deliveryZoneId || order.customer?.deliveryZoneId || null,
      order.deliveryZoneName || order.customer?.deliveryZoneName || null,
      Number(order.subtotal || 0),
      Number(order.discount || 0),
      Number(order.shipping || 0),
      Number(order.totalAmount || 0),
      order.currency || 'ETB',
      order.paymentMethod || 'card',
      order.paymentStatus || 'Pending Verification',
      order.status || 'Processing',
      order.trackingNumber || null,
      order.transferDetails?.bank || null,
      order.transferDetails?.transactionId || null,
      receipt,
      order.rejectionReason || null,
      JSON.stringify(order.notifications || []),
      order.createdAt || new Date().toISOString()
    ]);

    if (Array.isArray(order.items) && order.items.length > 0) {
      const [existingCountRows] = await conn.query(
        'SELECT COUNT(*) as cnt FROM order_items WHERE order_id = ?',
        [order.id]
      );
      if (existingCountRows[0].cnt === 0) {
        for (let idx = 0; idx < order.items.length; idx++) {
          const item = order.items[idx];
          const itemId = item.id || `item_${order.id}_${idx}_${Date.now()}`;
          const colorObj = item.color || item.selectedColor;
          await conn.query(`
            INSERT INTO order_items (
              id, order_id, product_id, product_name, color_name, color_hex,
              size, quantity, unit_price, customization_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)
          `, [
            itemId,
            order.id,
            item.product?.id || 'prod_unknown',
            item.product?.name || 'Leather Piece',
            colorObj?.name || null,
            colorObj?.hex || null,
            item.size || item.selectedSize || null,
            Number(item.quantity || 1),
            Number(item.product?.price || 0),
            JSON.stringify(item.customization || null)
          ]);
        }
      }
    }

    await conn.commit();
    return getOrderById(order.id);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const updateOrder = async (id, updates) => {
  const current = await getOrderById(id);
  if (!current) return null;
  const merged = { ...current, ...updates };
  return saveOrder(merged);
};

const mapUserRow = (r) => {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    password: r.password_hash,
    passwordHash: r.password_hash,
    role: r.role,
    phone: r.phone || '',
    city: r.city || 'Addis Ababa',
    address: r.address || '',
    createdAt: r.created_at
  };
};

const getUsers = async () => {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows.map(mapUserRow);
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
  return mapUserRow(rows[0]);
};

const findUserById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return mapUserRow(rows[0]);
};

const saveUser = async (user) => {
  const passHash = user.passwordHash || user.password || '';
  await pool.query(`
    INSERT INTO users (id, name, email, password_hash, role, phone, city, address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name), phone = VALUES(phone), city = VALUES(city), address = VALUES(address), role = VALUES(role)
  `, [
    user.id,
    user.name,
    user.email,
    passHash,
    user.role || 'customer',
    user.phone || null,
    user.city || 'Addis Ababa',
    user.address || null,
    user.createdAt || new Date().toISOString()
  ]);
  return findUserById(user.id);
};

const updateUser = async (id, updates) => {
  const user = await findUserById(id);
  if (!user) return null;
  const merged = { ...user, ...updates };
  return saveUser(merged);
};

const parseMessage = (r) => {
  if (!r) return null;
  const base = {
    id: r.id,
    userId: r.user_id || undefined,
    fullName: r.full_name || r.name || '',
    name: r.name || r.full_name || '',
    email: r.email || '',
    phone: r.phone || '',
    inquiryType: r.inquiry_type || r.subject || 'bespoke',
    subject: r.subject || r.inquiry_type || 'bespoke',
    message: r.message || '',
    status: r.status || 'new',
    reply: r.reply || undefined,
    replyDate: r.reply_date || undefined,
    repliedBy: r.replied_by || undefined,
    createdAt: r.created_at
  };
  base.thread = parseThreadJson(r.thread_json, base);
  return base;
};

const getMessageById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM customer_messages WHERE id = ?', [id]);
  return parseMessage(rows[0]);
};

const getMessages = async () => {
  const [rows] = await pool.query('SELECT * FROM customer_messages ORDER BY created_at DESC');
  return rows.map(parseMessage);
};

const saveMessage = async (msg) => {
  const id = msg.id || `msg-${Date.now()}`;
  const fullName = msg.fullName || msg.name || 'Collector';
  const inquiryType = msg.inquiryType || msg.subject || 'bespoke';
  const createdAt = msg.createdAt || new Date().toISOString();
  const thread = Array.isArray(msg.thread) && msg.thread.length > 0
    ? msg.thread
    : buildInitialThread({ id, fullName, message: msg.message || '', createdAt });

  await pool.query(
    'INSERT INTO customer_messages (id, user_id, name, email, phone, subject, message, status, reply, reply_date, replied_by, thread_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      msg.userId || null,
      fullName,
      msg.email || '',
      msg.phone || null,
      inquiryType,
      msg.message || '',
      msg.status || 'new',
      msg.reply || null,
      msg.replyDate || null,
      msg.repliedBy || null,
      JSON.stringify(thread),
      createdAt
    ]
  );
  return getMessageById(id);
};

const replyMessage = async (id, replyText, repliedBy = 'Kiru Atelier Master Artisan') => {
  const existing = await getMessageById(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const updatedThread = appendThreadEntry(existing.thread, {
    id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    senderRole: 'admin',
    senderName: repliedBy,
    text: replyText,
    createdAt: now
  });
  await pool.query(
    'UPDATE customer_messages SET reply = ?, reply_date = ?, replied_by = ?, status = ?, thread_json = ? WHERE id = ?',
    [replyText, now, repliedBy, 'replied', JSON.stringify(updatedThread), id]
  );
  return getMessageById(id);
};

const customerReplyMessage = async (id, replyText, customerName) => {
  const existing = await getMessageById(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const updatedThread = appendThreadEntry(existing.thread, {
    id: `crep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    senderRole: 'customer',
    senderName: customerName || existing.fullName || 'Collector',
    text: replyText,
    createdAt: now
  });
  await pool.query(
    'UPDATE customer_messages SET status = ?, thread_json = ? WHERE id = ?',
    ['new', JSON.stringify(updatedThread), id]
  );
  return getMessageById(id);
};

const updateMessage = async (id, updates) => {
  if (updates.status) {
    await pool.query('UPDATE customer_messages SET status = ? WHERE id = ?', [updates.status, id]);
  }
  if (updates.reply) {
    await pool.query(
      'UPDATE customer_messages SET reply = ?, reply_date = ?, replied_by = ? WHERE id = ?',
      [
        updates.reply,
        updates.replyDate || new Date().toISOString(),
        updates.repliedBy || 'Kiru Atelier Master Artisan',
        id
      ]
    );
  }
  const [rows] = await pool.query('SELECT * FROM customer_messages WHERE id = ?', [id]);
  return parseMessage(rows[0]);
};

const saveAiConversation = async (sessionId, userMsg, assistantResp, lang = 'en') => {
  try {
    const id = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await pool.query(
      'INSERT INTO ai_conversations (id, session_id, prompt, response, intent, lang, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, sessionId, userMsg, assistantResp, 'concierge_chat', lang, new Date().toISOString()]
    );
  } catch (err) {
    console.error('MySQL AI conv save error:', err.message);
  }
};

const getSiteContent = async (sectionKey) => {
  const validKey = sectionKey === 'contact' ? 'contact' : 'about';
  const defaultContent = DEFAULT_SITE_CONTENT[validKey] || {};
  try {
    const [rows] = await pool.query('SELECT content_json FROM site_content WHERE section_key = ?', [validKey]);
    if (!rows || rows.length === 0) {
      return defaultContent;
    }
    const parsed = JSON.parse(rows[0].content_json || '{}');
    return { ...defaultContent, ...parsed };
  } catch (err) {
    console.warn('MySQL getSiteContent warning:', err.message);
    return defaultContent;
  }
};

const getAllSiteContent = async () => {
  const about = await getSiteContent('about');
  const contact = await getSiteContent('contact');
  return { about, contact };
};

const saveSiteContent = async (sectionKey, content) => {
  const validKey = sectionKey === 'contact' ? 'contact' : 'about';
  const existing = await getSiteContent(validKey);
  const merged = { ...existing, ...(content || {}) };
  const jsonStr = JSON.stringify(merged);
  const now = new Date().toISOString();

  await pool.query(`
    INSERT INTO site_content (section_key, content_json, updated_at)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      content_json = VALUES(content_json),
      updated_at = VALUES(updated_at)
  `, [validKey, jsonStr, now]);

  return getSiteContent(validKey);
};

const getLookbookItems = async () => {
  try {
    const [rows] = await pool.query('SELECT content_json FROM site_content WHERE section_key = ?', ['lookbook']);
    if (!rows || rows.length === 0) {
      return DEFAULT_LOOKBOOK_ITEMS;
    }
    const parsed = JSON.parse(rows[0].content_json || '[]');
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LOOKBOOK_ITEMS;
  } catch (err) {
    console.warn('MySQL getLookbookItems warning:', err.message);
    return DEFAULT_LOOKBOOK_ITEMS;
  }
};

const saveLookbookItems = async (items) => {
  const jsonStr = JSON.stringify(items || []);
  const now = new Date().toISOString();
  await pool.query(`
    INSERT INTO site_content (section_key, content_json, updated_at)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      content_json = VALUES(content_json),
      updated_at = VALUES(updated_at)
  `, ['lookbook', jsonStr, now]);
  return getLookbookItems();
};

module.exports = {
  initMySQL,
  getProducts,
  getProductById,
  saveProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getOrders,
  getOrderById,
  saveOrder,
  updateOrder,
  getUsers,
  findUserByEmail,
  findUserById,
  saveUser,
  updateUser,
  getMessages,
  getMessageById,
  saveMessage,
  replyMessage,
  customerReplyMessage,
  updateMessage,
  saveAiConversation,
  getSiteContent,
  getAllSiteContent,
  saveSiteContent,
  getLookbookItems,
  saveLookbookItems
};
