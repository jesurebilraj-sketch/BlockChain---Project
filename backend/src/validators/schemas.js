const { ValidationError } = require('../utils/errors');

function validateRegisterPayload(body) {
  const errors = [];
  if (!body.username || typeof body.username !== 'string' || body.username.trim().length < 2) {
    errors.push('Username is required and must be at least 2 characters');
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
    errors.push('Password is required and must be at least 6 characters');
  }
  if (body.role && !['ADMIN', 'SHOP', 'WAREHOUSE', 'CITIZEN', 'VALIDATOR'].includes(body.role.toUpperCase())) {
    errors.push('Role must be one of ADMIN, SHOP, WAREHOUSE, CITIZEN, VALIDATOR');
  }
  if (errors.length > 0) {
    throw new ValidationError('Registration validation failed', errors);
  }
  return true;
}

function validateLoginPayload(body) {
  const errors = [];
  if (!body.username || typeof body.username !== 'string') {
    errors.push('Username or email is required');
  }
  if (!body.password || typeof body.password !== 'string') {
    errors.push('Password is required');
  }
  if (errors.length > 0) {
    throw new ValidationError('Login validation failed', errors);
  }
  return true;
}

function validateTransactionPayload(body) {
  const errors = [];
  const beneficiaryId = body.beneficiaryId || body.beneficiary;
  const shopId = body.shopId || body.shop;
  const commodity = body.commodity;
  const rawQty = body.quantity || body.qty;

  if (!beneficiaryId || typeof beneficiaryId !== 'string') {
    errors.push('Beneficiary ID is required');
  }
  if (!shopId || typeof shopId !== 'string') {
    errors.push('Shop ID is required');
  }
  if (!commodity || typeof commodity !== 'string') {
    errors.push('Commodity name is required');
  }

  const qty = parseFloat(rawQty);
  if (isNaN(qty) || qty <= 0) {
    errors.push('Quantity must be a positive number');
  }

  if (errors.length > 0) {
    throw new ValidationError('Transaction validation failed', errors);
  }

  return {
    beneficiaryId: beneficiaryId.trim().toUpperCase(),
    shopId: shopId.trim().toUpperCase(),
    commodity: commodity.trim(),
    quantity: qty,
    name: body.name || body.beneficiaryName || ''
  };
}

module.exports = {
  validateRegisterPayload,
  validateLoginPayload,
  validateTransactionPayload
};

