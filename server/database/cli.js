#!/usr/bin/env node
/**
 * Kiru Leathers Atelier — Database CLI & Inspector Tool
 * Usage:
 *   node server/database/cli.js           -> Overview of all tables & record counts
 *   node server/database/cli.js users     -> Show rows in users table
 *   node server/database/cli.js products  -> Show rows in products table
 *   node server/database/cli.js orders    -> Show rows in orders table
 *   node server/database/cli.js "SELECT id, name, price, stock FROM products LIMIT 5"
 */

const path = require('path');
const Database = require(path.join(__dirname, '../node_modules/better-sqlite3'));

const DB_PATH = path.join(__dirname, '../data/kiru_atelier.db');
const db = new Database(DB_PATH);

const args = process.argv.slice(2);

console.log('\n======================================================');
console.log('🏛️  KIRU LEATHERS ATELIER — REAL DATABASE INSPECTOR');
console.log(`📁 File Path: ${DB_PATH}`);
console.log('======================================================\n');

if (args.length === 0) {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all();
  console.log('📊 Active Relational Tables & Record Counts:');
  console.log('------------------------------------------------------');
  for (const t of tables) {
    const count = db.prepare(`SELECT count(*) as total FROM ${t.name}`).get();
    console.log(` • Table [${t.name.padEnd(20)}] -> ${count.total.toString().padStart(4)} records`);
  }
  console.log('------------------------------------------------------');
  console.log('\n💡 Quick Tips:');
  console.log(' - View specific table: node server/database/cli.js users');
  console.log(' - View products:       node server/database/cli.js products');
  console.log(' - View orders:         node server/database/cli.js orders');
  console.log(' - Run custom SQL:      node server/database/cli.js "SELECT id, name, price, stock FROM products LIMIT 5"');
  console.log(' - GUI viewer:          Open server/data/kiru_atelier.db in "DB Browser for SQLite" or VS Code "SQLite Viewer"\n');
  process.exit(0);
}

const target = args[0].trim();

if (target.toUpperCase().startsWith('SELECT') || target.toUpperCase().startsWith('PRAGMA')) {
  try {
    const rows = db.prepare(target).all();
    console.log(`🔍 Executed SQL: "${target}"`);
    console.table(rows);
  } catch (err) {
    console.error('❌ SQL Error:', err.message);
  }
} else {
  try {
    const limit = args[1] ? parseInt(args[1], 10) : 10;
    const rows = db.prepare(`SELECT * FROM ${target} LIMIT ${limit}`).all();
    console.log(`📋 Showing ${rows.length} records from table "${target}":`);
    console.table(rows);
  } catch (err) {
    console.error(`❌ Error querying table "${target}":`, err.message);
  }
}
