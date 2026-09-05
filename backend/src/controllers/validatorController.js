const validatorService = require('../services/validatorService');

class ValidatorController {
  async getAll(req, res, next) {
    try {
      const validators = await validatorService.getAllValidators();
      res.status(200).json({
        success: true,
        count: validators.length,
        validators
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const id = req.params.id.toUpperCase().trim();
      const validator = await validatorService.getValidatorById(id);
      res.status(200).json({
        success: true,
        validator
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const id = req.params.id.toUpperCase().trim();
      const { status } = req.body;
      const result = await validatorService.updateValidatorStatus(id, status);
      res.status(200).json({
        success: true,
        message: `Validator ${id} status updated to ${status}`,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ValidatorController();

