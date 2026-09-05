const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend root if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  DATABASE_STORAGE: process.env.DATABASE_STORAGE 
    ? path.resolve(__dirname, '../../', process.env.DATABASE_STORAGE)
    : path.resolve(__dirname, '../../../database/pdschain.sqlite'),
  JWT_SECRET: process.env.JWT_SECRET || 'pdschain_dev_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  BLOCKCHAIN_DIFFICULTY: parseInt(process.env.BLOCKCHAIN_DIFFICULTY, 10) || 2,
  VALIDATOR_COUNT: parseInt(process.env.VALIDATOR_COUNT, 10) || 12,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};

