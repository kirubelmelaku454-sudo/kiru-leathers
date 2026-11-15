#!/usr/bin/env node
/**
 * Kiru Leathers Atelier — Localhost Database Setup Wizard
 * Sets up MySQL 'kiru_atelier' database on localhost port 3306
 *
 * Usage:
 *   node server/database/setup-localhost-db.js
 *   node server/database/setup-localhost-db.js <mysql_password>
 *   node server/database/setup-localhost-db.js <mysql_user> <mysql_password>
 */

const fs = require('fs');
const path = require('path');
const mysql = require('../node_modules/mysql2/promise');

const user = process.argv[2] && !process.argv[3] ? 'root' : (process.argv[2] || 'root');
const password = process.argv[3] || (process.argv[2] && process.argv[2] !== 'root' ? process.argv[2] : '');

async function setup() {
  console.log('\n======================================================');
  console.log('🏛️  KIRU LEATHERS ATELIER — LOCALHOST DATABASE CREATOR');
  console.log('======================================================');
  console.log(`🔌 Target: MySQL on localhost:3306`);
  console.log(`👤 User:   ${user}`);
  console.log(`🔑 Password provided: ${password ? 'Yes' : 'No (empty/none)'}`);

  const sqlFilePath = path.join(__dirname, 'kiru_atelier_mysql.sql');
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`❌ SQL dump file not found at: ${sqlFilePath}`);
    process.exit(1);
  }

  try {
    // 1. Connect to MySQL server without selecting a DB
    console.log('\n⏳ Connecting to localhost MySQL server...');
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user,
      password,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server successfully!');

    // 2. Read SQL file
    console.log('⏳ Reading and importing server/database/kiru_atelier_mysql.sql...');
    const sqlDump = fs.readFileSync(sqlFilePath, 'utf8');

    // 3. Execute SQL Dump
    await conn.query(sqlDump);
    console.log('🎉 Database `kiru_atelier` and all tables created and populated successfully!');

    // 4. Verify counts
    const [userRows] = await conn.query('SELECT count(*) as total FROM kiru_atelier.users');
    const [prodRows] = await conn.query('SELECT count(*) as total FROM kiru_atelier.products');
    const [orderRows] = await conn.query('SELECT count(*) as total FROM kiru_atelier.orders');

    console.log('\n📊 Database Status on localhost:');
    console.log(` • Users:    ${userRows[0].total} records`);
    console.log(` • Products: ${prodRows[0].total} records`);
    console.log(` • Orders:   ${orderRows[0].total} records`);

    await conn.end();

    // 5. Update or create server/.env
    const envPath = path.join(__dirname, '../.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const mysqlConfig = `
# Localhost MySQL Database Configuration
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=${user}
MYSQL_PASSWORD=${password}
MYSQL_DATABASE=kiru_atelier
`;

    if (!envContent.includes('DB_TYPE=mysql')) {
      fs.appendFileSync(envPath, '\n' + mysqlConfig);
      console.log('📝 Saved MySQL configuration to server/.env');
    }

    console.log('\n🚀 Success! Your real database is now running on MySQL localhost:3306.');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Could not connect or create database:');
    console.error(err.message);
    console.log('\n💡 If your MySQL root requires a password, run:');
    console.log('   node server/database/setup-localhost-db.js <your_mysql_password>');
    console.log('\n💡 Or import manually using terminal:');
    console.log(`   mysql -u ${user} -p < "${sqlFilePath}"`);
    console.log('\n💡 Or in MySQL Workbench / phpMyAdmin:');
    console.log(`   Open the file: ${sqlFilePath} and click Execute/Run.\n`);
    process.exit(1);
  }
}

setup();
