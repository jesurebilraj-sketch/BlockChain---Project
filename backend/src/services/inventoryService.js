const Inventory = require('../models/Inventory');
const StockTransfer = require('../models/StockTransfer');
const { sequelize } = require('../config/database');
const { ValidationError, NotFoundError } = require('../utils/errors');
const crypto = require('crypto');

class InventoryService {
  async getShopInventory(shopId) {
    return await Inventory.findAll({
      where: { ownerType: 'SHOP', ownerId: shopId }
    });
  }

  async getWarehouseInventory(warehouseId) {
    return await Inventory.findAll({
      where: { ownerType: 'WAREHOUSE', ownerId: warehouseId }
    });
  }

  async checkShopStock(shopId, commodity, requestedQty, transaction = null) {
    let inv = await Inventory.findOne({
      where: {
        ownerType: 'SHOP',
        ownerId: shopId,
        commodityName: commodity
      },
      transaction
    });

    if (!inv) {
      inv = await Inventory.create({
        ownerType: 'SHOP',
        ownerId: shopId,
        commodityName: commodity,
        quantity: 1500,
        reserved: 0,
        unit: 'KG',
        minThreshold: 200
      }, { transaction });
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

  async deductShopStock(shopId, commodity, quantity, transaction = null) {
    let inv = await Inventory.findOne({
      where: {
        ownerType: 'SHOP',
        ownerId: shopId,
        commodityName: commodity
      },
      transaction
    });

    if (!inv) {
      throw new NotFoundError(`Inventory item '${commodity}' not found for shop '${shopId}'.`);
    }

    if (inv.quantity < quantity) {
      throw new ValidationError(`Cannot deduct ${quantity} KG from ${inv.quantity} KG. Inventory cannot become negative.`);
    }

    inv.quantity = Math.max(0, inv.quantity - parseFloat(quantity));
    await inv.save({ transaction });
    return inv;
  }

  /**
   * Atomic Warehouse to Shop Stock Transfer
   */
  async transferStock(warehouseId, shopId, commodity, quantity) {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new ValidationError('Transfer quantity must be a positive number.');
    }

    return await sequelize.transaction(async (t) => {
      // 1. Check & Deduct from Warehouse
      let whInv = await Inventory.findOne({
        where: { ownerType: 'WAREHOUSE', ownerId: warehouseId, commodityName: commodity },
        transaction: t
      });

      if (!whInv || whInv.quantity < qty) {
        throw new ValidationError(`Insufficient warehouse inventory in '${warehouseId}' for '${commodity}'. Available: ${whInv ? whInv.quantity : 0} KG.`);
      }

      whInv.quantity -= qty;
      await whInv.save({ transaction: t });

      // 2. Increment Shop Inventory
      let shopInv = await Inventory.findOne({
        where: { ownerType: 'SHOP', ownerId: shopId, commodityName: commodity },
        transaction: t
      });

      if (shopInv) {
        shopInv.quantity += qty;
        await shopInv.save({ transaction: t });
      } else {
        shopInv = await Inventory.create({
          ownerType: 'SHOP',
          ownerId: shopId,
          commodityName: commodity,
          quantity: qty,
          reserved: 0,
          unit: 'KG',
          minThreshold: 100
        }, { transaction: t });
      }

      // 3. Record Stock Transfer Log
      const transferId = `TRF-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      const transferRecord = await StockTransfer.create({
        transferId,
        warehouseId,
        shopId,
        commodity,
        quantity: qty,
        unit: 'KG',
        status: 'Completed',
        timestamp: new Date().toISOString()
      }, { transaction: t });

      return {
        success: true,
        message: `Successfully transferred ${qty} KG of ${commodity} from ${warehouseId} to ${shopId}.`,
        transfer: transferRecord,
        warehouseInventory: whInv,
        shopInventory: shopInv
      };
    });
  }
}

module.exports = new InventoryService();
