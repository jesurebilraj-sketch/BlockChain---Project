const crypto = require('crypto');

let txCounter = 4282;

module.exports = {
  generateTransactionId: () => {
    txCounter++;
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `TXN-${String(txCounter).padStart(6, '0')}-${randomHex}`;
  },
  generateBeneficiaryId: (index) => {
    return `BEN-${String(1000 + index).padStart(4, '0')}`;
  },
  generateShopId: (index) => {
    return `FPS-${String(100 + index).padStart(3, '0')}`;
  },
  generateWarehouseId: (index) => {
    return `WH-${String(index).padStart(3, '0')}`;
  },
  generateValidatorId: (index) => {
    return `VAL-${String(index).padStart(2, '0')}`;
  }
};

