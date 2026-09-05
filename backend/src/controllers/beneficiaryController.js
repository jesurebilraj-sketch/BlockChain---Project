const Beneficiary = require('../models/Beneficiary');
const { NotFoundError } = require('../utils/errors');

class BeneficiaryController {
  async getAll(req, res, next) {
    try {
      const { region, status, search } = req.query;
      const where = {};
      if (region) where.region = region;
      if (status) where.status = status;

      let list = await Beneficiary.findAll({ where, order: [['id', 'ASC']] });

      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        list = list.filter(b => b.name.toLowerCase().includes(q) || b.beneficiaryId.toLowerCase().includes(q));
      }

      // Map to frontend-friendly format
      const formatted = list.map(b => ({
        id: b.beneficiaryId,
        beneficiaryId: b.beneficiaryId,
        name: b.name,
        region: b.region,
        household: b.household,
        quotaRice: b.monthlyEntitlement?.Rice || 20,
        quotaWheat: b.monthlyEntitlement?.Wheat || 10,
        quotaSugar: b.monthlyEntitlement?.Sugar || 2,
        quotaPulses: b.monthlyEntitlement?.Pulses || 2,
        status: b.status,
        lastDist: b.lastDist || 'None',
        eligibilityStatus: b.eligibilityStatus,
        monthlyEntitlement: b.monthlyEntitlement,
        currentMonthClaimed: b.currentMonthClaimed
      }));

      res.status(200).json({
        success: true,
        count: formatted.length,
        beneficiaries: formatted
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const id = req.params.id.toUpperCase().trim();
      const b = await Beneficiary.findOne({ where: { beneficiaryId: id } });
      if (!b) {
        throw new NotFoundError(`Beneficiary '${id}' not found.`);
      }

      res.status(200).json({
        success: true,
        beneficiary: {
          id: b.beneficiaryId,
          beneficiaryId: b.beneficiaryId,
          name: b.name,
          region: b.region,
          household: b.household,
          status: b.status,
          eligibilityStatus: b.eligibilityStatus,
          monthlyEntitlement: b.monthlyEntitlement,
          currentMonthClaimed: b.currentMonthClaimed,
          lastDist: b.lastDist
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { name, region, household, monthlyEntitlement } = req.body;
      const count = await Beneficiary.count();
      const beneficiaryId = `BEN-${String(1000 + count + 1).padStart(4, '0')}`;

      const b = await Beneficiary.create({
        beneficiaryId,
        name: name || 'Citizen Beneficiary',
        region: region || 'Chennai Central',
        household: parseInt(household, 10) || 4,
        status: 'Active',
        eligibilityStatus: true,
        monthlyEntitlement: monthlyEntitlement || {
          Rice: (parseInt(household, 10) || 4) * 5,
          Wheat: (parseInt(household, 10) || 4) * 2.5,
          Sugar: 2,
          Pulses: 2,
          Kerosene: 1
        },
        currentMonthClaimed: { Rice: 0, Wheat: 0, Sugar: 0, Pulses: 0, Kerosene: 0 }
      });

      res.status(201).json({
        success: true,
        message: 'Beneficiary created successfully',
        beneficiary: b
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const id = req.params.id.toUpperCase().trim();
      const b = await Beneficiary.findOne({ where: { beneficiaryId: id } });
      if (!b) {
        throw new NotFoundError(`Beneficiary '${id}' not found.`);
      }

      const { name, region, household, status, eligibilityStatus } = req.body;
      if (name !== undefined) b.name = name;
      if (region !== undefined) b.region = region;
      if (household !== undefined) b.household = parseInt(household, 10);
      if (status !== undefined) b.status = status;
      if (eligibilityStatus !== undefined) b.eligibilityStatus = eligibilityStatus;

      await b.save();

      res.status(200).json({
        success: true,
        message: 'Beneficiary updated successfully',
        beneficiary: b
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BeneficiaryController();

