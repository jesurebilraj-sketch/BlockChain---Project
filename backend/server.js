const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Block, Blockchain } = require('./blockchain');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Initialize Blockchain
let pdsCoin = new Blockchain();

// Mock Initial Data (same as frontend to bootstrap)
let beneficiaries = [
    { id: "BEN-1001", name: "Ravi Kumar", region: "Chennai Central", household: 4, quotaRice: 20, quotaWheat: 10, quotaSugar: 2, quotaPulses: 2, status: "Active", lastDist: "2026-08-28" },
    { id: "BEN-1002", name: "Priya Sharma", region: "Chennai North", household: 3, quotaRice: 15, quotaWheat: 8, quotaSugar: 2, quotaPulses: 1.5, status: "Active", lastDist: "2026-08-27" },
    { id: "BEN-1003", name: "Mohammed Ismail", region: "Chennai South", household: 5, quotaRice: 25, quotaWheat: 12, quotaSugar: 3, quotaPulses: 2.5, status: "Active", lastDist: "2026-08-29" },
    { id: "BEN-1004", name: "Lakshmi Devi", region: "Chennai West", household: 2, quotaRice: 10, quotaWheat: 5, quotaSugar: 1, quotaPulses: 1, status: "Active", lastDist: "2026-08-25" },
    { id: "BEN-1024", name: "Arun Kumar", region: "Chennai Central", household: 4, quotaRice: 40, quotaWheat: 15, quotaSugar: 3, quotaPulses: 2, status: "Active", lastDist: "2026-08-29" },
    { id: "BEN-1031", name: "Ananya Patel", region: "Chennai East", household: 4, quotaRice: 20, quotaWheat: 10, quotaSugar: 2, quotaPulses: 2, status: "Active", lastDist: "2026-08-20" },
    { id: "BEN-2114", name: "K. Venkatesh", region: "Chennai North", household: 6, quotaRice: 30, quotaWheat: 15, quotaSugar: 3, quotaPulses: 3, status: "Active", lastDist: "2026-08-29" },
    { id: "BEN-0887", name: "Sunita Rani", region: "Chennai South", household: 3, quotaRice: 15, quotaWheat: 8, quotaSugar: 2, quotaPulses: 1.5, status: "Active", lastDist: "2026-08-29" }
];

let shops = [
    { id: "FPS-101", name: "North Sector Fair Price Shop", region: "Chennai North", manager: "M. Ramanathan", beneficiaries: 1420, stockHealth: "Optimal", status: "Active" },
    { id: "FPS-102", name: "Central Bazaar Ration Point", region: "Chennai Central", manager: "K. Subramanian", beneficiaries: 1850, stockHealth: "Optimal", status: "Active" },
    { id: "FPS-103", name: "East Coast Distribution Centre", region: "Chennai East", manager: "R. Jayashree", beneficiaries: 1210, stockHealth: "Low Rice", status: "Active" },
    { id: "FPS-104", name: "West Gate Civil Supplies", region: "Chennai West", manager: "D. Prabhakar", beneficiaries: 980, stockHealth: "Optimal", status: "Active" },
    { id: "FPS-118", name: "South Sector Fair Price Shop", region: "Chennai South", manager: "S. Nithya", beneficiaries: 1640, stockHealth: "Optimal", status: "Active" }
];

let warehouses = [
    { id: "WH-001", name: "Central Civil Supplies Depot", location: "Chennai Central", capacity: "10,000 MT", currentStock: "8,450 MT", utilization: 84.5, status: "Operational" },
    { id: "WH-002", name: "Northern Regional Hub", location: "Chennai North", capacity: "6,500 MT", currentStock: "5,120 MT", utilization: 78.8, status: "Operational" },
    { id: "WH-003", name: "Chennai Main Grain Silo", location: "Chennai Harbour", capacity: "12,000 MT", currentStock: "9,820 MT", utilization: 81.8, status: "Operational" },
    { id: "WH-004", name: "Western Logistics Depot", location: "Chennai West", capacity: "5,000 MT", currentStock: "1,200 MT", utilization: 24.0, status: "Low Stock Alert" }
];

let transactions = [
    { id: "TXN-004281", beneficiary: "BEN-1024", name: "Arun Kumar", shop: "FPS-102", commodity: "Rice", qty: "5 KG", block: "#4281", validators: 12, hash: "0x8a7f92bd41e2aa91", status: "Verified", time: "2026-08-30 09:40 AM" },
    { id: "TXN-004280", beneficiary: "BEN-0887", name: "Sunita Rani", shop: "FPS-102", commodity: "Wheat", qty: "5 KG", block: "#4280", validators: 12, hash: "0x73ab18cd9940ef21", status: "Verified", time: "2026-08-30 09:05 AM" },
    { id: "TXN-004279", beneficiary: "BEN-2114", name: "K. Venkatesh", shop: "FPS-101", commodity: "Rice", qty: "10 KG", block: "#4279", validators: 11, hash: "0xc30e118fbb671042", status: "Verified", time: "2026-08-30 08:32 AM" },
    { id: "TXN-004278", beneficiary: "BEN-1031", name: "Ananya Patel", shop: "FPS-103", commodity: "Sugar", qty: "2 KG", block: "#4278", validators: 12, hash: "0xa04b9e218731cd95", status: "Verified", time: "2026-08-30 08:05 AM" },
    { id: "TXN-004275", beneficiary: "BEN-1002", name: "Priya Sharma", shop: "FPS-118", commodity: "Wheat", qty: "8 KG", block: "#4277", validators: 12, hash: "0x54ec77a10982bb31", status: "Verified", time: "2026-08-29 05:15 PM" },
    { id: "TXN-004261", beneficiary: "BEN-1001", name: "Ravi Kumar", shop: "FPS-102", commodity: "Pulses", qty: "2 KG", block: "#4276", validators: 12, hash: "0x91df44a982001e74", status: "Verified", time: "2026-08-29 03:20 PM" },
    { id: "TXN-004248", beneficiary: "BEN-1004", name: "Lakshmi Devi", shop: "FPS-104", commodity: "Rice", qty: "10 KG", block: "#4275", validators: 12, hash: "0x334acb7719882201", status: "Verified", time: "2026-08-29 11:45 AM" }
];

let validators = [
    { id: "NODE-01", org: "Ministry of Consumer Affairs", status: "Online", blockHeight: 4281, heartbeat: "Just now", txValidated: 14280, participation: "100%" },
    { id: "NODE-02", org: "National Informatics Centre", status: "Online", blockHeight: 4281, heartbeat: "1s ago", txValidated: 14280, participation: "100%" },
    { id: "NODE-03", org: "State Food Commission", status: "Online", blockHeight: 4281, heartbeat: "2s ago", txValidated: 14278, participation: "99.9%" },
    { id: "NODE-04", org: "Civil Supplies Corporation", status: "Online", blockHeight: 4281, heartbeat: "Just now", txValidated: 14280, participation: "100%" },
    { id: "NODE-05", org: "District Administration Node", status: "Online", blockHeight: 4281, heartbeat: "3s ago", txValidated: 14275, participation: "99.8%" },
    { id: "NODE-06", org: "Auditor General Observer Node", status: "Online", blockHeight: 4281, heartbeat: "Just now", txValidated: 14280, participation: "100%" },
    { id: "NODE-07", org: "Public Audit & Governance Node", status: "Online", blockHeight: 4281, heartbeat: "Just now", txValidated: 14280, participation: "100%" },
    { id: "NODE-08", org: "Regional Warehouse Authority", status: "Online", blockHeight: 4281, heartbeat: "4s ago", txValidated: 14270, participation: "99.7%" },
    { id: "NODE-09", org: "Fair Price Shop Union Node", status: "Online", blockHeight: 4281, heartbeat: "Just now", txValidated: 14280, participation: "100%" },
    { id: "NODE-10", org: "State Monitoring Cell", status: "Online", blockHeight: 4281, heartbeat: "2s ago", txValidated: 14279, participation: "99.9%" },
    { id: "NODE-11", org: "Citizen Oversight Organisation", status: "Online", blockHeight: 4281, heartbeat: "Just now", txValidated: 14280, participation: "100%" },
    { id: "NODE-12", org: "Security & Cryptography Validator", status: "Online", blockHeight: 4281, heartbeat: "1s ago", txValidated: 14280, participation: "100%" }
];

// Seed the blockchain with the mock blocks
let defaultBlocks = [
    { number: 4278, hash: "0xa04b9e218731cd95", prevHash: "0x54ec77a10982bb31", txns: 29, validators: 12, timestamp: "2026-08-30 08:08 AM", status: "Verified" },
    { number: 4279, hash: "0xc30e118fbb671042", prevHash: "0xa04b9e218731cd95", txns: 51, validators: 11, timestamp: "2026-08-30 08:35 AM", status: "Verified" },
    { number: 4280, hash: "0x73ab18cd9940ef21", prevHash: "0xc30e118fbb671042", txns: 38, validators: 12, timestamp: "2026-08-30 09:10 AM", status: "Verified" },
    { number: 4281, hash: "0x8a7f92bd41e2aa91", prevHash: "0x73ab18cd9940ef21", txns: 42, validators: 12, timestamp: "2026-08-30 09:42 AM", status: "Verified" }
];

for (let b of defaultBlocks) {
    let block = new Block(pdsCoin.chain.length, b.timestamp, { txns: b.txns, status: b.status }, b.prevHash);
    block.hash = b.hash;
    pdsCoin.chain.push(block);
}

// API Routes
app.get('/api/data', (req, res) => {
    // Return all data
    res.json({
        beneficiaries,
        shops,
        warehouses,
        transactions,
        validators,
        blocks: pdsCoin.chain
    });
});

app.post('/api/transactions', (req, res) => {
    const txn = req.body;
    txn.id = 'TXN-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    txn.time = new Date().toLocaleString();
    txn.status = "Pending";
    
    // In a real blockchain, transactions are added to a mempool and then mined.
    // For this simple demo, we add it directly and mine a block.
    transactions.unshift(txn); // add to top
    
    let newBlock = new Block(pdsCoin.chain.length, new Date().toLocaleString(), { transaction: txn });
    pdsCoin.addBlock(newBlock);
    
    // Update txn with block info
    txn.block = '#' + newBlock.index;
    txn.hash = newBlock.hash;
    txn.status = "Verified";
    
    res.json({ success: true, transaction: txn, block: newBlock });
});

app.get('/api/blockchain', (req, res) => {
    res.json(pdsCoin);
});

app.get('/api/blockchain/validate', (req, res) => {
    let isValid = pdsCoin.isChainValid();
    res.json({ isValid });
});

app.listen(port, () => {
    console.log(`PDSChain backend listening at http://localhost:${port}`);
});

