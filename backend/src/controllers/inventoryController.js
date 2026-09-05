const Inventory = require('../models/Inventory');

class InventoryController {
  async getByShop(req, res, next) {
    try {
      const shopId = req.params.id.toUpperCase().trim();
      const inventory = await Inventory.findAll({
        where: { ownerType: 'SHOP', ownerId: shopId }
      });

      res.status(200).json({
        success: true,
        shopId,
        inventory
      });
    } catch (err) {
      next(err);
    }
  }

  async addOrUpdate(req, res, next) {
    try {
      const shopId = req.params.id.toUpperCase().trim();
      const { commodityName, quantity, minThreshold, unit } = req.body;

      let item = await Inventory.findOne({
        where: { ownerType: 'SHOP', ownerId: shopId, commodityName }
      });

      if (item) {
        if (quantity !== undefined) item.quantity = parseFloat(quantity);
        if (minThreshold !== undefined) item.minThreshold = parseFloat(minThreshold);
        if (unit !== undefined) item.unit = unit;
        await item.save();
      } else {
        item = await Inventory.create({
          ownerType: 'SHOP',
          ownerId: shopId,
          commodityName,
          quantity: parseFloat(quantity) || 0,
          reserved: 0,
          unit: unit || 'KG',
          minThreshold: parseFloat(minThreshold) || 100
        });
      }

      res.status(200).json({
        success: true,
        message: 'Inventory updated successfully',
        item
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InventoryController();

