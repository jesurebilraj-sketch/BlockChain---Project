const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('./env');

let sequelize;

if (config.DATABASE_URL && config.DATABASE_URL.trim() !== '') {
  // PostgreSQL connection
  sequelize = new Sequelize(config.DATABASE_URL, {
    dialect: 'postgres',
    logging: config.NODE_ENV === 'test' ? false : console.log,
    dialectOptions: config.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  });
} else {
  // SQLite fallback with persistent file storage
  const storagePath = config.DATABASE_STORAGE;
  const storageDir = path.dirname(storagePath);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false // Keep logs clean
  });
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};

