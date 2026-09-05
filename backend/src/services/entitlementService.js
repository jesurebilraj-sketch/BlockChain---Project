const Beneficiary = require('../models/Beneficiary');
const { NotFoundError, ValidationError } = require('../utils/errors');

class EntitlementService {
  async getBeneficiary(beneficiaryId, transaction = null) {
    const ben = await Beneficiary.findOne({
      where: { beneficiaryId: beneficiaryId.toUpperCase().trim() },
      transaction
    });
    if (!ben) {
      throw new NotFoundError(`Beneficiary '${beneficiaryId}' not found.`);
    }
    return ben;
  }

  async checkEligibilityAndQuota(beneficiaryId, commodity, requestedQty, transaction = null) {
    const ben = await this.getBeneficiary(beneficiaryId, transaction);

    if (ben.status !== 'Active' || !ben.eligibilityStatus) {
      throw new ValidationError(`Beneficiary '${beneficiaryId}' is not eligible (Status: ${ben.status}).`);
    }

    const entitlements = ben.monthlyEntitlement || {};
    const claimed = ben.currentMonthClaimed || {};

    const maxQuota = parseFloat(entitlements[commodity] || entitlements[commodity.toLowerCase()] || 0);
    const alreadyClaimed = parseFloat(claimed[commodity] || claimed[commodity.toLowerCase()] || 0);
    const remainingQuota = Math.max(0, maxQuota - alreadyClaimed);

    if (maxQuota <= 0) {
      throw new ValidationError(`Beneficiary is not entitled to commodity '${commodity}'.`);
    }

    if (requestedQty > remainingQuota) {
      throw new ValidationError(`Requested quantity (${requestedQty} KG) exceeds remaining monthly quota (${remainingQuota} KG).`);
    }

    return {
      eligible: true,
      beneficiary: ben,
      maxQuota,
      alreadyClaimed,
      remainingQuota,
      newRemaining: remainingQuota - requestedQty
    };
  }

  async deductQuota(beneficiaryId, commodity, quantity, transaction = null) {
    const ben = await this.getBeneficiary(beneficiaryId, transaction);
    const claimed = { ...(ben.currentMonthClaimed || {}) };
    const current = parseFloat(claimed[commodity] || 0);
    claimed[commodity] = current + parseFloat(quantity);

    ben.currentMonthClaimed = claimed;
    ben.lastDist = new Date().toISOString().split('T')[0];
    await ben.save({ transaction });
    return ben;
  }
}

module.exports = new EntitlementService();
