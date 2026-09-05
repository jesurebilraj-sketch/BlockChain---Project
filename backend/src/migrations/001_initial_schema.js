/**
 * Migration: 001_initial_schema.js
 * Reproducible database schema initialization for PDSChain.
 */

const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

async function up() {
  logger.info('Running database migration: 001_initial_schema...');
  await sequelize.sync({ alter: true });
  logger.info('Migration 001_initial_schema applied successfully.');
}

async function down() {
  logger.info('Rolling back database migration: 001_initial_schema...');
  await sequelize.drop();
  logger.info('Migration 001_initial_schema rolled back.');
}

module.exports = {
  up,
  down
};

