const Warehouse = require('../models/Warehouse');
const { NotFoundError } = require('../utils/errors');

class WarehouseController {
  async getAll(req, res, next) {
    try {
      const list = await Warehouse.findAll({ order: [['id', 'ASC']] });

      const formatted = list.map(w => ({
        id: w.warehouseId,
        warehouseId: w.warehouseId,
        name: w.name,
        location: w.location,
        capacity: w.capacity,
        currentStock: w.currentStock,
        utilization: w.utilization,
        status: w.status
      }));

      res.status(200).json({
        success: true,
        count: formatted.length,
        warehouses: formatted
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const id = req.params.id.toUpperCase().trim();
      const w = await Warehouse.findOne({ where: { warehouseId: id } });
      if (!w) {
        throw new NotFoundError(`Warehouse '${id}' not found.`);
      }

      res.status(200).json({
        success: true,
        warehouse: {
          id: w.warehouseId,
          warehouseId: w.warehouseId,
          name: w.name,
          location: w.location,
          capacity: w.capacity,
          currentStock: w.currentStock,
          utilization: w.utilization,
          status: w.status
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { name, location, capacity, currentStock, utilization, status } = req.body;
      const count = await Warehouse.count();
      const warehouseId = `WH-${String(count + 1).padStart(3, '0')}`;

      const w = await Warehouse.create({
        warehouseId,
        name: name || `Regional Silo Depot ${warehouseId}`,
        location: location || 'Chennai Central',
        capacity: capacity || '10,000 MT',
        currentStock: currentStock || '8,000 MT',
        utilization: utilization !== undefined ? parseFloat(utilization) : 80.0,
        status: status || 'Operational'
      });

      res.status(201).json({
        success: true,
        message: 'Warehouse created successfully',
        warehouse: w
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const id = req.params.id.toUpperCase().trim();
      const w = await Warehouse.findOne({ where: { warehouseId: id } });
      if (!w) {
        throw new NotFoundError(`Warehouse '${id}' not found.`);
      }

      const { name, location, capacity, currentStock, utilization, status } = req.body;
      if (name !== undefined) w.name = name;
      if (location !== undefined) w.location = location;
      if (capacity !== undefined) w.capacity = capacity;
      if (currentStock !== undefined) w.currentStock = currentStock;
      if (utilization !== undefined) w.utilization = parseFloat(utilization);
      if (status !== undefined) w.status = status;

      await w.save();

      res.status(200).json({
        success: true,
        message: 'Warehouse updated successfully',
        warehouse: w
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WarehouseController();

