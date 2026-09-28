import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

// Auto-migrate tables on startup to avoid requiring a database reset
export const initDb = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          mobile VARCHAR(20) UNIQUE NOT NULL,
          role VARCHAR(20) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS otps (
          mobile VARCHAR(20) PRIMARY KEY,
          code VARCHAR(10) NOT NULL,
          expires_at TIMESTAMP NOT NULL
      );
    `);
    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};
