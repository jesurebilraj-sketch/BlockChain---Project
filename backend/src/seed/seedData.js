const bcrypt = require('bcryptjs');
const { DEFAULT_12_VALIDATORS } = require('../consensus/consensusConfig');

const FIRST_NAMES = [
  'Arun', 'Ravi', 'Priya', 'Mohammed', 'Lakshmi', 'Sunita', 'Venkatesh', 'Ananya', 'Ramesh', 'Suresh',
  'Deepa', 'Karthik', 'Meena', 'Vijay', 'Divya', 'Rajesh', 'Geetha', 'Saravanan', 'Shanthi', 'Manoj',
  'Pooja', 'Ganesh', 'Kavitha', 'Senthil', 'Radha', 'Prakash', 'Bhavani', 'Dinesh', 'Uma', 'Harish',
  'Revathi', 'Balaji', 'Swathi', 'Pradeep', 'Mythili', 'Sanjay', 'Padma', 'Naveen', 'Sudha', 'Ashok',
  'Malathi', 'Kishore', 'Vasanthi', 'Murugan', 'Rekha', 'Madhavan', 'Gayathri', 'Selvan', 'Nithya', 'Chitra'
];

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Ismail', 'Devi', 'Rani', 'Venkatesh', 'Patel', 'Chandran', 'Subramanian', 'Ramanathan',
  'Narayanan', 'Jayashree', 'Prabhakar', 'Nithya', 'Sundaram', 'Krishnan', 'Murugesan', 'Balan', 'Menon', 'Pillai',
  'Reddy', 'Gounder', 'Naidu', 'Chettiar', 'Iyer', 'Iyengar', 'Varma', 'Gupta', 'Singh', 'Khan'
];

const REGIONS = ['Chennai Central', 'Chennai North', 'Chennai South', 'Chennai West', 'Chennai East'];

async function generateSeedData() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);
  const shopPwHash = await bcrypt.hash('shop123', salt);
  const whPwHash = await bcrypt.hash('warehouse123', salt);
  const citizenPwHash = await bcrypt.hash('citizen123', salt);
  const valPwHash = await bcrypt.hash('validator123', salt);

  // 1. Users (Demo Accounts)
  const users = [
    { username: 'admin', passwordHash, role: 'ADMIN', name: 'Master Administrator', email: 'admin@pdschain.local' },
    { username: 'shop', passwordHash: shopPwHash, role: 'SHOP', name: 'FPS Officer (FPS-102)', email: 'fps102@pdschain.local', entityId: 'FPS-102' },
    { username: 'warehouse', passwordHash: whPwHash, role: 'WAREHOUSE', name: 'Warehouse Officer (WH-003)', email: 'wh003@pdschain.local', entityId: 'WH-003' },
    { username: 'citizen', passwordHash: citizenPwHash, role: 'CITIZEN', name: 'Arun Kumar (BEN-1024)', email: 'arun@pdschain.local', entityId: 'BEN-1024' },
    { username: 'validator', passwordHash: valPwHash, role: 'VALIDATOR', name: 'Validator Node 07', email: 'val07@pdschain.local', entityId: 'VAL-07' }
  ];

  // 2. Commodities
  const commodities = [
    { commodityId: 'COM-01', name: 'Rice', unit: 'KG', price: 0.0, category: 'Food Grain' },
    { commodityId: 'COM-02', name: 'Wheat', unit: 'KG', price: 0.0, category: 'Food Grain' },
    { commodityId: 'COM-03', name: 'Sugar', unit: 'KG', price: 13.5, category: 'Essential Sugar' },
    { commodityId: 'COM-04', name: 'Pulses', unit: 'KG', price: 30.0, category: 'Lentils & Dal' },
    { commodityId: 'COM-05', name: 'Kerosene', unit: 'Litre', price: 25.0, category: 'Fuel' }
  ];

  // 3. 100 Beneficiaries
  const beneficiaries = [];
  // Include specific known ones first
  const knownBeneficiaries = [
    { id: "BEN-1024", name: "Arun Kumar", region: "Chennai Central", household: 4, quotaRice: 40, quotaWheat: 15, quotaSugar: 3, quotaPulses: 2, status: "Active", lastDist: "2026-08-29" },
    { id: "BEN-1001", name: "Ravi Kumar", region: "Chennai Central", household: 4, quotaRice: 20, quotaWheat: 10, quotaSugar: 2, quotaPulses: 2, status: "Active", lastDist: "2026-08-28" },
    { id: "BEN-1002", name: "Priya Sharma", region: "Chennai North", household: 3, quotaRice: 15, quotaWheat: 8, quotaSugar: 2, quotaPulses: 1.5, status: "Active", lastDist: "2026-08-27" },
    { id: "BEN-1003", name: "Mohammed Ismail", region: "Chennai South", household: 5, quotaRice: 25, quotaWheat: 12, quotaSugar: 3, quotaPulses: 2.5, status: "Active", lastDist: "2026-08-29" },
    { id: "BEN-1004", name: "Lakshmi Devi", region: "Chennai West", household: 2, quotaRice: 10, quotaWheat: 5, quotaSugar: 1, quotaPulses: 1, status: "Active", lastDist: "2026-08-25" },
    { id: "BEN-1031", name: "Ananya Patel", region: "Chennai East", household: 4, quotaRice: 20, quotaWheat: 10, quotaSugar: 2, quotaPulses: 2, status: "Active", lastDist: "2026-08-20" },
    { id: "BEN-2114", name: "K. Venkatesh", region: "Chennai North", household: 6, quotaRice: 30, quotaWheat: 15, quotaSugar: 3, quotaPulses: 3, status: "Active", lastDist: "2026-08-29" },
    { id: "BEN-0887", name: "Sunita Rani", region: "Chennai South", household: 3, quotaRice: 15, quotaWheat: 8, quotaSugar: 2, quotaPulses: 1.5, status: "Active", lastDist: "2026-08-29" }
  ];

  const usedIds = new Set();
  for (const kb of knownBeneficiaries) {
    usedIds.add(kb.id);
    beneficiaries.push({
      beneficiaryId: kb.id,
      name: kb.name,
      region: kb.region,
      household: kb.household,
      status: kb.status,
      eligibilityStatus: true,
      monthlyEntitlement: {
        Rice: kb.quotaRice,
        Wheat: kb.quotaWheat,
        Sugar: kb.quotaSugar,
        Pulses: kb.quotaPulses,
        Kerosene: 1
      },
      currentMonthClaimed: {
        Rice: kb.id === 'BEN-1024' ? 5 : 0,
        Wheat: 0,
        Sugar: 0,
        Pulses: 0,
        Kerosene: 0
      },
      lastDist: kb.lastDist
    });
  }

  let counter = 1;
  while (beneficiaries.length < 100) {
    const benId = `BEN-${String(1000 + counter).padStart(4, '0')}`;
    counter++;
    if (usedIds.has(benId)) continue;
    usedIds.add(benId);

    const i = beneficiaries.length + 1;
    const fn = FIRST_NAMES[(i * 3) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const region = REGIONS[i % REGIONS.length];
    const household = (i % 5) + 2;

    beneficiaries.push({
      beneficiaryId: benId,
      name: `${fn} ${ln}`,
      region,
      household,
      status: i === 42 ? 'Suspended' : 'Active',
      eligibilityStatus: i !== 42,
      monthlyEntitlement: {
        Rice: household * 5,
        Wheat: Math.round(household * 2.5),
        Sugar: 2,
        Pulses: 2,
        Kerosene: 1
      },
      currentMonthClaimed: { Rice: 0, Wheat: 0, Sugar: 0, Pulses: 0, Kerosene: 0 },
      lastDist: `2026-08-${String(10 + (i % 18)).padStart(2, '0')}`
    });
  }

  // 4. 20 Fair Price Shops
  const shops = [];
  const knownShops = [
    { id: "FPS-101", name: "North Sector Fair Price Shop", region: "Chennai North", manager: "M. Ramanathan", beneficiaries: 1420, stockHealth: "Optimal", status: "Active" },
    { id: "FPS-102", name: "Central Bazaar Ration Point", region: "Chennai Central", manager: "K. Subramanian", beneficiaries: 1850, stockHealth: "Optimal", status: "Active" },
    { id: "FPS-103", name: "East Coast Distribution Centre", region: "Chennai East", manager: "R. Jayashree", beneficiaries: 1210, stockHealth: "Low Rice", status: "Active" },
    { id: "FPS-104", name: "West Gate Civil Supplies", region: "Chennai West", manager: "D. Prabhakar", beneficiaries: 980, stockHealth: "Optimal", status: "Active" },
    { id: "FPS-118", name: "South Sector Fair Price Shop", region: "Chennai South", manager: "S. Nithya", beneficiaries: 1640, stockHealth: "Optimal", status: "Active" }
  ];

  const usedShopIds = new Set();
  for (const ks of knownShops) {
    usedShopIds.add(ks.id);
    shops.push({
      shopId: ks.id,
      name: ks.name,
      region: ks.region,
      manager: ks.manager,
      beneficiariesCount: ks.beneficiaries,
      stockHealth: ks.stockHealth,
      status: ks.status
    });
  }

  let shopCounter = 5;
  while (shops.length < 20) {
    const shopId = `FPS-${String(100 + shopCounter).padStart(3, '0')}`;
    shopCounter++;
    if (usedShopIds.has(shopId)) continue;
    usedShopIds.add(shopId);

    const i = shops.length + 1;
    const region = REGIONS[i % REGIONS.length];
    const mgr = `${FIRST_NAMES[(i * 4) % FIRST_NAMES.length]} ${LAST_NAMES[(i * 2) % LAST_NAMES.length]}`;

    shops.push({
      shopId,
      name: `${region} Unit ${i} Fair Price Shop`,
      region,
      manager: mgr,
      beneficiariesCount: 800 + (i * 45),
      stockHealth: i === 12 ? 'Low Sugar' : 'Optimal',
      status: 'Active'
    });
  }

  // 5. 5 Warehouses
  const warehouses = [
    { warehouseId: "WH-001", name: "Central Civil Supplies Depot", location: "Chennai Central", capacity: "10,000 MT", currentStock: "8,450 MT", utilization: 84.5, status: "Operational" },
    { warehouseId: "WH-002", name: "Northern Regional Hub", location: "Chennai North", capacity: "6,500 MT", currentStock: "5,120 MT", utilization: 78.8, status: "Operational" },
    { warehouseId: "WH-003", name: "Chennai Main Grain Silo", location: "Chennai Harbour", capacity: "12,000 MT", currentStock: "9,820 MT", utilization: 81.8, status: "Operational" },
    { warehouseId: "WH-004", name: "Western Logistics Depot", location: "Chennai West", capacity: "5,000 MT", currentStock: "1,200 MT", utilization: 24.0, status: "Low Stock Alert" },
    { warehouseId: "WH-005", name: "Southern Buffer Reserve Silo", location: "Chennai South", capacity: "8,000 MT", currentStock: "6,400 MT", utilization: 80.0, status: "Operational" }
  ];

  // 6. Shop & Warehouse Inventories
  const inventories = [];
  const commNames = ['Rice', 'Wheat', 'Sugar', 'Pulses', 'Kerosene'];

  for (const s of shops) {
    for (const c of commNames) {
      inventories.push({
        ownerType: 'SHOP',
        ownerId: s.shopId,
        commodityName: c,
        quantity: c === 'Rice' ? 1800 : c === 'Wheat' ? 1200 : c === 'Sugar' ? 400 : c === 'Pulses' ? 300 : 150,
        reserved: 0,
        unit: c === 'Kerosene' ? 'Litre' : 'KG',
        minThreshold: c === 'Rice' ? 300 : 100
      });
    }
  }

  for (const w of warehouses) {
    for (const c of commNames) {
      inventories.push({
        ownerType: 'WAREHOUSE',
        ownerId: w.warehouseId,
        commodityName: c,
        quantity: c === 'Rice' ? 4400 : c === 'Wheat' ? 2550 : c === 'Sugar' ? 800 : c === 'Pulses' ? 420 : 180,
        reserved: c === 'Rice' ? 500 : 100,
        unit: c === 'Kerosene' ? 'KL' : 'MT',
        minThreshold: 500
      });
    }
  }

  // 7. 12 Validators
  const validators = DEFAULT_12_VALIDATORS.map((v, idx) => ({
    validatorId: v.validatorId,
    name: v.name,
    org: v.org,
    publicKey: v.publicKey,
    status: v.status,
    blockHeight: 4281,
    heartbeat: 'Just now',
    txValidated: 14280 - (idx * 2),
    participation: idx === 2 || idx === 9 ? '99.9%' : '100%',
    trustConfiguration: v.trustConfiguration
  }));

  // 8. Initial Verified Transactions
  const transactions = [
    { transactionId: "TXN-004281", beneficiaryId: "BEN-1024", beneficiaryName: "Arun Kumar", shopId: "FPS-102", commodity: "Rice", quantity: 5, unit: "KG", blockNumber: 4281, blockHash: "0x8a7f92bd41e2aa91", hash: "0x8a7f92bd41e2aa91", fbaValidators: 12, fbaConsensus: true, status: "Verified", timestamp: "2026-08-30 09:40 AM" },
    { transactionId: "TXN-004280", beneficiaryId: "BEN-0887", beneficiaryName: "Sunita Rani", shopId: "FPS-102", commodity: "Wheat", quantity: 5, unit: "KG", blockNumber: 4280, blockHash: "0x73ab18cd9940ef21", hash: "0x73ab18cd9940ef21", fbaValidators: 12, fbaConsensus: true, status: "Verified", timestamp: "2026-08-30 09:05 AM" },
    { transactionId: "TXN-004279", beneficiaryId: "BEN-2114", beneficiaryName: "K. Venkatesh", shopId: "FPS-101", commodity: "Rice", quantity: 10, unit: "KG", blockNumber: 4279, blockHash: "0xc30e118fbb671042", hash: "0xc30e118fbb671042", fbaValidators: 11, fbaConsensus: true, status: "Verified", timestamp: "2026-08-30 08:32 AM" },
    { transactionId: "TXN-004278", beneficiaryId: "BEN-1031", beneficiaryName: "Ananya Patel", shopId: "FPS-103", commodity: "Sugar", quantity: 2, unit: "KG", blockNumber: 4278, blockHash: "0xa04b9e218731cd95", hash: "0xa04b9e218731cd95", fbaValidators: 12, fbaConsensus: true, status: "Verified", timestamp: "2026-08-30 08:05 AM" },
    { transactionId: "TXN-004275", beneficiaryId: "BEN-1002", beneficiaryName: "Priya Sharma", shopId: "FPS-118", commodity: "Wheat", quantity: 8, unit: "KG", blockNumber: 4277, blockHash: "0x54ec77a10982bb31", hash: "0x54ec77a10982bb31", fbaValidators: 12, fbaConsensus: true, status: "Verified", timestamp: "2026-08-29 05:15 PM" }
  ];

  return {
    users,
    commodities,
    beneficiaries,
    shops,
    warehouses,
    inventories,
    validators,
    transactions
  };
}

module.exports = {
  generateSeedData
};
