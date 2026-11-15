const mongoose = require('mongoose');
const sqlite = require('./database/sqlite');
const mysql = require('./database/mysql');

let isMongoConnected = false;
let isMySQLConnected = false;

const initDatabase = async () => {
  const dbType = (process.env.DB_TYPE || '').toLowerCase();

  // 1. MySQL on localhost:3306 or remote
  if (dbType === 'mysql' || (process.env.MYSQL_DATABASE && process.env.MYSQL_PASSWORD !== undefined)) {
    try {
      await mysql.initMySQL();
      isMySQLConnected = true;
      console.log(`🐬 Connected to Real MySQL Database on ${process.env.MYSQL_HOST || 'localhost'}:${process.env.MYSQL_PORT || 3306} (${process.env.MYSQL_DATABASE || 'kiru_atelier'})`);
      return;
    } catch (err) {
      console.warn('⚠️ MySQL connection failed, falling back to local SQLite database:', err.message);
      isMySQLConnected = false;
    }
  }

  // 2. MongoDB
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      isMongoConnected = true;
      console.log('🍃 Connected to MongoDB cluster successfully');
      return;
    } catch (err) {
      console.warn('⚠️ MongoDB connection failed, running with native SQLite database:', err.message);
      isMongoConnected = false;
    }
  }

  // 3. Native Embedded SQLite (Default & ultra-fast)
  console.log('🗄️ Connected to Real Relational SQLite Database: server/data/kiru_atelier.db (WAL Mode Enabled)');
};

const getEngine = () => {
  if (isMySQLConnected) return mysql;
  return sqlite;
};

const db = {
  initDatabase,
  isMongo: () => isMongoConnected,
  isMySQL: () => isMySQLConnected,
  sqlite: sqlite.raw,

  // Products
  getProducts: () => getEngine().getProducts(),
  getProductById: (id) => getEngine().getProductById(id),
  saveProduct: (p) => getEngine().saveProduct(p),
  updateProduct: (id, updates) => getEngine().updateProduct(id, updates),
  deleteProduct: (id) => getEngine().deleteProduct(id),
  addReview: (productId, review) => getEngine().addReview(productId, review),

  // Orders
  getOrders: () => getEngine().getOrders(),
  getOrderById: (id) => getEngine().getOrderById(id),
  saveOrder: (order) => getEngine().saveOrder(order),
  updateOrder: (id, updates) => getEngine().updateOrder(id, updates),

  // Users
  getUsers: () => getEngine().getUsers(),
  findUserByEmail: (email) => getEngine().findUserByEmail(email),
  findUserById: (id) => getEngine().findUserById(id),
  saveUser: (user) => getEngine().saveUser(user),
  updateUser: (id, updates) => getEngine().updateUser(id, updates),
  addLoyaltyPoints: (userId, points) => (getEngine().addLoyaltyPoints ? getEngine().addLoyaltyPoints(userId, points) : null),

  // Messages
  getMessages: () => getEngine().getMessages(),
  getMessageById: (id) => getEngine().getMessageById(id),
  saveMessage: (msg) => getEngine().saveMessage(msg),
  replyMessage: (id, reply, repliedBy) => getEngine().replyMessage(id, reply, repliedBy),
  customerReplyMessage: (id, reply, customerName) => getEngine().customerReplyMessage(id, reply, customerName),
  updateMessage: (id, updates) => getEngine().updateMessage(id, updates),

  // AI Conversations
  saveAiConversation: (sessionId, userMsg, assistantResp, lang) =>
    getEngine().saveAiConversation(sessionId, userMsg, assistantResp, lang),

  // Site Content (About & Contact CMS)
  getSiteContent: (sectionKey) => getEngine().getSiteContent(sectionKey),
  getAllSiteContent: () => getEngine().getAllSiteContent(),
  saveSiteContent: (sectionKey, content) => getEngine().saveSiteContent(sectionKey, content),

  // Lookbook Video Management
  getLookbookItems: () => getEngine().getLookbookItems(),
  saveLookbookItems: (items) => getEngine().saveLookbookItems(items)
};

module.exports = db;
