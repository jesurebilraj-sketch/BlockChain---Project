const config = require('../config/env');

const logger = {
  info: (msg, meta = '') => {
    if (config.NODE_ENV !== 'test') {
      console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, meta ? meta : '');
    }
  },
  warn: (msg, meta = '') => {
    if (config.NODE_ENV !== 'test') {
      console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, meta ? meta : '');
    }
  },
  error: (msg, meta = '') => {
    if (config.NODE_ENV !== 'test') {
      console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, meta ? meta : '');
    }
  },
  consensus: (msg, meta = '') => {
    if (config.NODE_ENV !== 'test') {
      console.log(`[FBA-CONSENSUS] [${new Date().toISOString()}] ${msg}`, meta ? meta : '');
    }
  }
};

module.exports = logger;

