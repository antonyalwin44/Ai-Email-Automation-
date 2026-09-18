const mysql = require('mysql2/promise');
require('dotenv').config();

const isRemote = process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1';

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
  ...(isRemote || process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
});

// Test the connection on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully!');
    connection.release();
  } catch (error) {
    console.error('⚠️ Database connection failed:', error.message);
    console.error('👉 Tip: On Render/cloud hosting, ensure DB_HOST points to a cloud MySQL instance (e.g. TiDB Cloud/Aiven/Railway), not localhost.');
  }
}

testConnection();

module.exports = pool;
