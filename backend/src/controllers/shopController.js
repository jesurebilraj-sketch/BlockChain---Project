const Shop = require('../models/Shop');
const { NotFoundError } = require('../utils/errors');

class ShopController {
  async getAll(req, res, next) {
    try {
      const { region, search } = req.query;
      const where = {};
      if (region) where.region = region;

      let list = await Shop.findAll({ where, order: [['id', 'ASC']] });

      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        list = list.filter(s => s.name.toLowerCase().includes(q) || s.shopId.toLowerCase().includes(q) || s.region.toLowerCase().includes(q));
      }

      const formatted = list.map(s => ({
        id: s.shopId,
        shopId: s.shopId,
        name: s.name,
        region: s.region,
        manager: s.manager,
        beneficiaries: s.beneficiariesCount,
        stockHealth: s.stockHealth,
        status: s.status
      }));

      res.status(200).json({
        success: true,
        count: formatted.length,
        shops: formatted
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const id = req.params.id.toUpperCase().trim();
      const s = await Shop.findOne({ where: { shopId: id } });
      if (!s) {
        throw new NotFoundError(`Shop '${id}' not found.`);
      }

      res.status(200).json({
        success: true,
        shop: {
          id: s.shopId,
          shopId: s.shopId,
          name: s.name,
          region: s.region,
          manager: s.manager,
          beneficiaries: s.beneficiariesCount,
          stockHealth: s.stockHealth,
          status: s.status
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { name, region, manager, beneficiariesCount } = req.body;
      const count = await Shop.count();
      const shopId = `FPS-${String(100 + count + 1).padStart(3, '0')}`;

      const s = await Shop.create({
        shopId,
        name: name || `Fair Price Shop ${shopId}`,
        region: region || 'Chennai Central',
        manager: manager || 'Shop Officer',
        beneficiariesCount: parseInt(beneficiariesCount, 10) || 1000,
        stockHealth: 'Optimal',
        status: 'Active'
      });

      res.status(201).json({
        success: true,
        message: 'Shop created successfully',
        shop: s
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const id = req.params.id.toUpperCase().trim();
      const s = await Shop.findOne({ where: { shopId: id } });
      if (!s) {
        throw new NotFoundError(`Shop '${id}' not found.`);
      }

      const { name, region, manager, status, stockHealth } = req.body;
      if (name !== undefined) s.name = name;
      if (region !== undefined) s.region = region;
      if (manager !== undefined) s.manager = manager;
      if (status !== undefined) s.status = status;
      if (stockHealth !== undefined) s.stockHealth = stockHealth;

      await s.save();

      res.status(200).json({
        success: true,
        message: 'Shop updated successfully',
        shop: s
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ShopController();

