const mysql = require('mysql2/promise');
require('dotenv').config();

const isRemote = Boolean(process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'email_automation',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:30',
  ssl: (isRemote || process.env.DB_SSL === 'true') ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined,
});

// Test the connection on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Database connected successfully! (Host: ${process.env.DB_HOST || 'localhost'})`);
    connection.release();
  } catch (error) {
    console.error('⚠️ Database connection failed:', error.message);
    console.error(`👉 Current DB_HOST is: "${process.env.DB_HOST}". If on Render, verify your TiDB credentials in the Environment tab.`);
  }
}

testConnection();

module.exports = pool;
