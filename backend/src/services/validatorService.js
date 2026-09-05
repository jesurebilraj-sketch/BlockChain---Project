const Validator = require('../models/Validator');
const fbaInstance = require('../consensus/FBAConsensus');
const { NotFoundError } = require('../utils/errors');

class ValidatorService {
  async getAllValidators() {
    // Return synced state between DB and in-memory FBA engine
    const nodes = fbaInstance.getValidators();
    return nodes.map(n => n.toJSON());
  }

  async getValidatorById(id) {
    const node = fbaInstance.getValidator(id);
    if (!node) {
      throw new NotFoundError(`Validator '${id}' not found.`);
    }
    return node.toJSON();
  }

  async updateValidatorStatus(id, status) {
    const node = fbaInstance.getValidator(id);
    if (!node) {
      throw new NotFoundError(`Validator '${id}' not found.`);
    }

    const ok = fbaInstance.setValidatorStatus(id, status);
    if (!ok) {
      throw new Error(`Invalid status '${status}'. Must be Online, Offline, or Degraded.`);
    }

    // Persist to DB
    const record = await Validator.findOne({ where: { validatorId: id } });
    if (record) {
      record.status = status;
      await record.save();
    }

    const networkStatus = fbaInstance.getNetworkStatus();

    return {
      validator: node.toJSON(),
      networkStatus
    };
  }
}

module.exports = new ValidatorService();

