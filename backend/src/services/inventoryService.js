const Inventory = require('../models/Inventory');
const { ValidationError } = require('../utils/errors');

class InventoryService {
  async getShopInventory(shopId) {
    return await Inventory.findAll({
      where: { ownerType: 'SHOP', ownerId: shopId }
    });
  }

  async checkShopStock(shopId, commodity, requestedQty) {
    let inv = await Inventory.findOne({
      where: {
        ownerType: 'SHOP',
        ownerId: shopId,
        commodityName: commodity
      }
    });

    if (!inv) {
      // Create with default stock if not present during simulation
      inv = await Inventory.create({
        ownerType: 'SHOP',
        ownerId: shopId,
        commodityName: commodity,
        quantity: 1500,
        reserved: 0,
        unit: 'KG',
        minThreshold: 200
      });
    }

    const available = inv.quantity - inv.reserved;
    if (requestedQty > available) {
      throw new ValidationError(`Insufficient shop inventory for '${commodity}'. Available: ${available} KG, Requested: ${requestedQty} KG.`);
    }

    return {
      available,
      inventory: inv
    };
  }

  async deductShopStock(shopId, commodity, quantity) {
    const inv = await Inventory.findOne({
      where: {
        ownerType: 'SHOP',
        ownerId: shopId,
        commodityName: commodity
      }
    });

    if (inv) {
      inv.quantity = Math.max(0, inv.quantity - parseFloat(quantity));
      await inv.save();
    }
    return inv;
  }
}

module.exports = new InventoryService();

