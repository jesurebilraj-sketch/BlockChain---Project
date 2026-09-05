const transactionService = require('../services/transactionService');

class TransactionController {
  async getAll(req, res, next) {
    try {
      const { limit, commodity, status, search } = req.query;
      let list = await transactionService.getAllTransactions(limit);

      if (commodity) {
        list = list.filter(t => t.commodity.toLowerCase() === commodity.toLowerCase());
      }
      if (status) {
        list = list.filter(t => t.status.toLowerCase() === status.toLowerCase());
      }
      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        list = list.filter(t => 
          (t.transactionId && t.transactionId.toLowerCase().includes(q)) ||
          (t.beneficiaryId && t.beneficiaryId.toLowerCase().includes(q)) ||
          (t.beneficiaryName && t.beneficiaryName.toLowerCase().includes(q))
        );
      }

      const formatted = list.map(t => ({
        id: t.transactionId,
        transactionId: t.transactionId,
        beneficiary: t.beneficiaryId,
        beneficiaryId: t.beneficiaryId,
        name: t.beneficiaryName,
        shop: t.shopId,
        shopId: t.shopId,
        commodity: t.commodity,
        qty: `${t.quantity} ${t.unit || 'KG'}`,
        quantity: t.quantity,
        block: t.blockNumber ? `#${t.blockNumber}` : 'Pending',
        blockNumber: t.blockNumber,
        blockHash: t.blockHash,
        hash: t.hash || t.blockHash || '',
        validators: t.fbaValidators || 12,
        status: t.status,
        time: t.timestamp,
        timestamp: t.timestamp,
        createdAt: t.createdAt
      }));

      res.status(200).json({
        success: true,
        count: formatted.length,
        transactions: formatted
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const id = req.params.id;
      const t = await transactionService.getTransactionById(id);

      res.status(200).json({
        success: true,
        transaction: {
          id: t.transactionId,
          transactionId: t.transactionId,
          beneficiary: t.beneficiaryId,
          beneficiaryId: t.beneficiaryId,
          name: t.beneficiaryName,
          shop: t.shopId,
          shopId: t.shopId,
          commodity: t.commodity,
          qty: `${t.quantity} ${t.unit || 'KG'}`,
          quantity: t.quantity,
          block: t.blockNumber ? `#${t.blockNumber}` : 'Pending',
          blockNumber: t.blockNumber,
          blockHash: t.blockHash,
          hash: t.hash || t.blockHash,
          validators: t.fbaValidators,
          status: t.status,
          time: t.timestamp,
          timestamp: t.timestamp
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await transactionService.processDistribution(req.body, req.user);
      const statusCode = result.success ? 201 : 400;
      res.status(statusCode).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getByBeneficiary(req, res, next) {
    try {
      const list = await transactionService.getTransactionsByBeneficiary(req.params.id);
      res.status(200).json({
        success: true,
        count: list.length,
        transactions: list
      });
    } catch (err) {
      next(err);
    }
  }

  async getByShop(req, res, next) {
    try {
      const list = await transactionService.getTransactionsByShop(req.params.id);
      res.status(200).json({
        success: true,
        count: list.length,
        transactions: list
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TransactionController();

