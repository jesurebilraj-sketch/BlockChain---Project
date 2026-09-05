# PDSChain Backend — Production-Quality API & 12-Validator FBA Consensus Engine

> **Project:** PDSChain — Blockchain-Based Public Distribution System  
> **Consensus Mechanism:** Federated Byzantine Agreement (FBA) with 12 Distributed/Institutional Nodes  
> **Database:** Sequelize ORM (Dual-Dialect: PostgreSQL / Persistent SQLite fallback with ACID Transactions)  
> **Version:** 1.0.0 (Production-Quality Academic Prototype)

---

## 1. Project Overview

**PDSChain** is an enterprise-grade backend architecture engineered to bring transparency, cryptographic immutability, tamper resistance, and real-time accountability to grain distribution under the Public Distribution System (PDS).

The backend delivers:
- **Persistent Database Storage:** Sequelize ORM with persistent SQLite/PostgreSQL storage and ACID database transaction rollback protection.
- **Federated Byzantine Agreement (FBA) Consensus Engine:** 12 institutional validator nodes with mathematically verified quorum slice intersection logic, supporting both in-process evaluation and multi-process HTTP validator servers (`VAL-01` to `VAL-12` on ports `4001`–`4012`).
- **Deterministic Blockchain Ledger:** SHA-256 block hashing, Merkle root tree calculations, previous-hash chaining, and tamper-detection validator.
- **Full PDS Business Rules & Atomic Transfers:** Beneficiary eligibility verification, family monthly quota tracking, shop stock constraints, duplicate debounce protection, and atomic warehouse-to-shop transfers.
- **Role-Based Authentication (RBAC):** JWT tokens with bcrypt password hashing across 5 roles (`ADMIN`, `SHOP`, `WAREHOUSE`, `CITIZEN`, `VALIDATOR`).
- **Automated Testing Suite:** 47 comprehensive Jest unit and integration tests covering auth & RBAC, atomic transactions, warehouse transfers, blockchain integrity, 12-node consensus, and REST endpoints.

---

## 2. Architecture Diagram

```
                              +---------------------------------------------+
                              |         PDSCHAIN FRONTEND PROTOTYPE         |
                              |   (35 HTML Pages / Vanilla JS / api.js)     |
                              +---------------------------------------------+
                                                     |
                                                     | REST APIs / JWT Auth / JSON (CORS)
                                                     v
+---------------------------------------------------------------------------------------------------------+
|                                        EXPRESS BACKEND SERVER (Port 3000)                                |
|                                                                                                         |
|  +-------------------------------------+  +----------------------------------------------------------+  |
|  |       Authentication & RBAC         |  |         Atomic PDS Business Logic & Transactions         |  |
|  |  - JWT token issuance & verify      |  |  - Managed Sequelize transactions (ACID / Rollback)      |  |
|  |  - Bcrypt password hashing          |  |  - Beneficiary eligibility & monthly quota tracking      |  |
|  |  - Strict Role Guards (5 roles)     |  |  - Atomic Warehouse-to-Shop transfers (TRF-xxxx)         |  |
|  +-------------------------------------+  +----------------------------------------------------------+  |
|                                                     |                                                   |
|                                                     v                                                   |
|  +---------------------------------------------------------------------------------------------------+  |
|  |                    12-VALIDATOR FEDERATED BYZANTINE AGREEMENT (FBA) ENGINE                        |  |
|  |  - Institutional Identities: VAL-01 (Consumer Affairs) ... VAL-12 (National Crypto Board)          |  |
|  |  - Distributed Mode: 12 HTTP Validator Micro-Servers (Ports 4001-4012: /proposal, /vote)          |  |
|  |  - Quorum Slice Evaluation: S(v) with threshold k out of n peers                                 |  |
|  |  - Intersecting Quorum Discovery: findQuorum(U, V)                                                |  |
|  |  - Byzantine Failure Tolerance: Simulation of offline nodes & recovery                           |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                     |                                                   |
|                                                     v                                                   |
|  +---------------------------------------------------------------------------------------------------+  |
|  |                                DETERMINISTIC BLOCKCHAIN LEDGER                                    |  |
|  |  - SHA-256 deterministic block hashing                                                            |  |
|  |  - Merkle root computation over transaction payloads                                              |  |
|  |  - Previous-hash cryptographic linking (Genesis: Block #0)                                        |  |
|  |  - Full chain validator: GET /api/blockchain/validate -> isValid: true                           |  |
|  +---------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                                     | Sequelize ORM Layer (ACID Transactions)
                                                     v
                                +------------------------------------------+
                                |             PERSISTENT STORAGE           |
                                |  - PostgreSQL (via DATABASE_URL in Prod) |
                                |  - SQLite (database/pdschain.sqlite)     |
                                +------------------------------------------+
```

---

## 3. Directory Structure

```
backend/
├── src/
│   ├── app.js                          # Express app configuration & middleware
│   ├── server.js                       # Server entry point, DB sync & startup
│   │
│   ├── config/
│   │   ├── env.js                      # Environment variables loader & defaults
│   │   └── database.js                 # Sequelize PostgreSQL / SQLite connector
│   │
│   ├── models/
│   │   ├── index.js                    # Model registry & DB associations
│   │   ├── User.js                     # User accounts & RBAC roles
│   │   ├── Beneficiary.js              # Citizen records & monthly quota state
│   │   ├── Shop.js                     # Fair Price Shops registry
│   │   ├── Warehouse.js                # Regional grain silos & depots
│   │   ├── Commodity.js                # Rice, Wheat, Sugar, Pulses, Kerosene
│   │   ├── Inventory.js                # Shop & warehouse stock quantities
│   │   ├── StockTransfer.js            # Inter-facility warehouse-to-shop stock transfers
│   │   ├── Transaction.js              # Ration distribution transaction logs
│   │   ├── Block.js                    # Persisted blockchain block records
│   │   └── Validator.js                # 12 Validator node identities & trust configs
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT verification & user injection
│   │   ├── roleMiddleware.js           # Strict role restriction guard
│   │   ├── validationMiddleware.js     # Schema validation helpers
│   │   └── errorMiddleware.js          # Centralized structured JSON error handler
│   │
│   ├── services/
│   │   ├── authService.js              # Registration, bcrypt login, JWT issuance
│   │   ├── entitlementService.js       # Citizen eligibility & quota calculation
│   │   ├── inventoryService.js         # Shop stock checks & atomic transfers
│   │   ├── transactionService.js       # PDS distribution pipeline with Sequelize transactions
│   │   ├── blockchainService.js        # Chain query, block addition & sync
│   │   ├── validatorService.js         # Validator status management & telemetry
│   │   └── consensusService.js         # FBA consensus rounds coordinator
│   │
│   ├── blockchain/
│   │   ├── Block.js                    # Block class (SHA-256, Merkle root, signatures)
│   │   ├── Blockchain.js               # Blockchain class (genesis, mining, validation)
│   │   ├── hashing.js                  # SHA-256 & Merkle tree calculation
│   │   └── validation.js               # Block & chain integrity validation
│   │
│   ├── consensus/
│   │   ├── ValidatorNode.js            # Node class (identity, status, vote evaluation)
│   │   ├── QuorumSlice.js              # Quorum slice definition & threshold evaluator
│   │   ├── Quorum.js                   # FBA quorum search algorithm
│   │   ├── FBAConsensus.js             # FBA consensus coordinator (HTTP & in-process)
│   │   └── consensusConfig.js          # 12-node institutional topology & HTTP port mappings
│   │
│   ├── validators/
│   │   ├── validatorServer.js          # Standalone HTTP Validator server for multi-process mode
│   │   ├── startValidators.js          # Launcher for 12 distributed node instances (ports 4001-4012)
│   │   └── schemas.js                  # Request body validation schemas
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── beneficiaryController.js
│   │   ├── shopController.js
│   │   ├── warehouseController.js
│   │   ├── inventoryController.js
│   │   ├── transactionController.js
│   │   ├── blockchainController.js
│   │   ├── validatorController.js
│   │   ├── consensusController.js
│   │   └── dashboardController.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── beneficiaryRoutes.js
│   │   ├── shopRoutes.js
│   │   ├── warehouseRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── blockchainRoutes.js
│   │   ├── validatorRoutes.js
│   │   ├── consensusRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── index.js                    # Root API router & /api/health
│   │
│   ├── utils/
│   │   ├── logger.js                   # Structured logging utility
│   │   ├── errors.js                   # Custom HTTP error classes (AppError, etc.)
│   │   └── ids.js                      # Non-colliding unique ID generators
│   │
│   └── seed/
│       ├── seedData.js                 # 100 beneficiaries, 20 shops, 5 warehouses
│       └── seedDatabase.js             # Repeatable database & blockchain seed script
│
├── tests/
│   ├── auth.test.js                    # Auth & RBAC integration tests
│   ├── warehouse.test.js               # Warehouse-to-shop atomic stock transfer tests
│   ├── transaction.test.js             # PDS business logic & quota tests
│   ├── blockchain.test.js              # Chain tampering & hashing tests
│   ├── consensus.test.js               # 12-node FBA quorum & failure tests
│   └── api.test.js                     # REST endpoint integration tests
│
├── .env.example                        # Configuration template
├── .env                                # Local configuration
├── package.json                        # NPM package configuration & scripts
└── README.md                           # Complete documentation manual
```

---

## 4. Installation & Environment Setup

### Prerequisites
- Node.js `v18.0.0` or newer
- npm `v9.0.0` or newer

### Installation
From the `backend/` directory:

```bash
npm install
```

### Environment Configuration (`.env`)
Copy `.env.example` to `.env`:

```env
PORT=3000
NODE_ENV=development

# Optional PostgreSQL Connection (Leave blank for automatic zero-config SQLite persistence)
DATABASE_URL=
DATABASE_STORAGE=../database/pdschain.sqlite

JWT_SECRET=pdschain_dev_super_secret_jwt_key_2026
JWT_EXPIRES_IN=24h

BLOCKCHAIN_DIFFICULTY=2
VALIDATOR_COUNT=12
CORS_ORIGIN=*
```

---

## 5. Running the Backend, Distributed Validators & Tests

### 1. Seed the Database
Populates 100 citizen beneficiaries, 20 Fair Price Shops, 5 Warehouses, 12 Validator nodes, 5 commodities, 125 inventory stock items, and 5 verified blockchain blocks:

```bash
npm run seed
```

### 2. Start the Express Backend Server
```bash
# Production start
npm start

# Development mode (with auto-reload)
npm run dev
```
The server will be live at `http://localhost:3000`.

### 3. (Optional) Launch the 12 Distributed Validator Node Servers
To demonstrate real distributed multi-node consensus over HTTP micro-services:
```bash
npm run validators:start
```
This spawns 12 independent validator HTTP processes on ports `4001` through `4012`, each handling `/proposal`, `/vote`, `/status`, `/health`, and `/chain`.

### 4. Run Automated Tests
```bash
npm test -- --runInBand
```
Runs all 47 tests across 6 test suites covering RBAC, atomic transfers, consensus, and blockchain integrity.

---

## 6. Demo Accounts & Credentials

The seed script creates pre-configured demo user accounts:

| Role | Username | Password | Assigned Entity | Default Redirect |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | System Master | `admin/admin.html` |
| **Fair Price Shop** | `shop` | `shop123` | `FPS-102` (Central Bazaar) | `shop/shop.html` |
| **Warehouse Officer** | `warehouse` | `warehouse123` | `WH-003` (Grain Silo) | `warehouse/warehouse.html` |
| **Citizen Beneficiary**| `citizen` | `citizen123` | `BEN-1024` (Arun Kumar) | `citizen/citizen.html` |
| **FBA Validator Node** | `validator` | `validator123` | `VAL-07` (Audit Node) | `validator/validator.html` |

---

## 7. 12-Validator Federated Byzantine Agreement (FBA)

### Institutional Validator Topology & Port Map

| Node ID | Institutional Identity | HTTP Endpoint | Quorum Slice Members | Threshold |
| :--- | :--- | :---: | :--- | :---: |
| `VAL-01` | Ministry of Consumer Affairs | `http://127.0.0.1:4001` | `VAL-01`, `VAL-02`, `VAL-03`, `VAL-04` | 3 of 4 |
| `VAL-02` | National Informatics Centre (NIC) | `http://127.0.0.1:4002` | `VAL-02`, `VAL-03`, `VAL-05`, `VAL-06` | 3 of 4 |
| `VAL-03` | State Food Commission | `http://127.0.0.1:4003` | `VAL-01`, `VAL-03`, `VAL-07`, `VAL-08` | 3 of 4 |
| `VAL-04` | Civil Supplies Corporation | `http://127.0.0.1:4004` | `VAL-01`, `VAL-04`, `VAL-09`, `VAL-10` | 3 of 4 |
| `VAL-05` | District Administration Node | `http://127.0.0.1:4005` | `VAL-02`, `VAL-05`, `VAL-07`, `VAL-11` | 3 of 4 |
| `VAL-06` | Auditor General Observer Node | `http://127.0.0.1:4006` | `VAL-02`, `VAL-06`, `VAL-08`, `VAL-12` | 3 of 4 |
| `VAL-07` | Public Audit & Governance Node | `http://127.0.0.1:4007` | `VAL-03`, `VAL-05`, `VAL-07`, `VAL-09` | 3 of 4 |
| `VAL-08` | Regional Warehouse Authority | `http://127.0.0.1:4008` | `VAL-03`, `VAL-06`, `VAL-08`, `VAL-10` | 3 of 4 |
| `VAL-09` | Fair Price Shop Union Node | `http://127.0.0.1:4009` | `VAL-04`, `VAL-07`, `VAL-09`, `VAL-11` | 3 of 4 |
| `VAL-10` | State Monitoring Cell | `http://127.0.0.1:4010` | `VAL-04`, `VAL-08`, `VAL-10`, `VAL-12` | 3 of 4 |
| `VAL-11` | Citizen Oversight Organisation | `http://127.0.0.1:4011` | `VAL-05`, `VAL-09`, `VAL-11`, `VAL-12` | 3 of 4 |
| `VAL-12` | Security & Cryptography Validator | `http://127.0.0.1:4012` | `VAL-06`, `VAL-10`, `VAL-11`, `VAL-12` | 3 of 4 |

### Mathematical Quorum Logic
1. **Quorum Slice:** Each validator $v \in V$ defines a slice $\mathcal{S}(v) \subseteq V$ containing itself and trusted peers. A slice is satisfied if $|S \cap U| \ge \text{threshold}(v)$.
2. **Quorum ($U \subseteq V$):** A candidate set $U$ is a quorum if $\forall v \in U, \exists S \in \mathcal{S}(v)$ such that $S \subseteq U$.
3. **Consensus Round:**
   $$\text{Proposal } P \longrightarrow \text{Validator Nodes Vote } \longrightarrow \text{Slice Evaluation } \longrightarrow \text{Quorum Discovery } \longrightarrow \text{Block Mined}$$

### Validator Failure Demonstration
- **Tolerating Faults:** If `VAL-05` and `VAL-06` go `Offline`, the remaining 10 nodes still satisfy their overlapping quorum slices and reach consensus ($10 / 12 \ge 75\%$).
- **Catastrophic Failure:** If $>4$ nodes in critical slice intersections fail, quorum cannot form and the transaction proposal is safely rejected without corrupting database state.

---

## 8. Complete API Reference

### Authentication & Profiles
- `POST /api/auth/register` — Register new user account (`username`, `password`, `role`, `name`).
- `POST /api/auth/login` — Login with credentials, returns JWT token.
- `GET /api/auth/me` — Return profile of authenticated user.

### Beneficiaries
- `GET /api/beneficiaries` — Query beneficiaries with `search`, `region`, and `status` filters.
- `GET /api/beneficiaries/:id` — Retrieve beneficiary record and monthly quota.
- `POST /api/beneficiaries` — Register new citizen beneficiary *(Admin only)*.
- `PUT /api/beneficiaries/:id` — Update beneficiary status or household size *(Admin only)*.

### Fair Price Shops & Warehouses
- `GET /api/shops` — List all 20 Fair Price Shops.
- `GET /api/shops/:id` — Get shop details.
- `GET /api/shops/:id/inventory` — Query shop stock levels.
- `POST /api/shops/:id/inventory` — Add or replenish stock *(Shop/Warehouse/Admin)*.
- `GET /api/warehouses` — List all 5 Warehouses.
- `GET /api/warehouses/:id` — Get warehouse details.
- `POST /api/warehouses/:id/transfer` — Execute atomic stock transfer from warehouse to shop *(Warehouse/Admin)*.

### Transactions & PDS Distribution
- `GET /api/transactions` — Query transaction registry with `search`, `commodity`, and `status` filters.
- `GET /api/transactions/:id` — Get single transaction details.
- `POST /api/transactions` — Execute PDS distribution with atomic database transaction and FBA consensus *(Shop/Admin)*.
  ```json
  {
    "beneficiaryId": "BEN-1001",
    "shopId": "FPS-102",
    "commodity": "Rice",
    "quantity": 5
  }
  ```

### Blockchain Ledger
- `GET /api/blockchain` — Complete chain data, difficulty, and height.
- `GET /api/blockchain/blocks` — List all mined blocks.
- `GET /api/blockchain/blocks/:number` — Get block by height.
- `GET /api/blockchain/transactions/:transactionId` — Lookup on-chain transaction.
- `GET /api/blockchain/validate` — Recalculates all block hashes, Merkle roots, and previous links. Returns `{ "isValid": true }`.

### Validators & FBA Consensus
- `GET /api/validators` — List all 12 institutional validator nodes.
- `GET /api/validators/:id` — Get validator trust configuration and quorum slice.
- `POST /api/validators/:id/status` — Toggle node status (`Online`, `Offline`, `Degraded`) *(Validator/Admin)*.
- `GET /api/consensus/status` — Current network quorum status.
- `GET /api/consensus/quorum` — Trust graph and recent rounds.

### Role Dashboards & Health
- `GET /api/dashboard/admin` — Master telemetry, system counters, and node health *(Admin only)*.
- `GET /api/dashboard/shop?shopId=FPS-102` — FPS inventory, dispatches, and recent transactions *(Shop/Admin)*.
- `GET /api/dashboard/citizen?beneficiaryId=BEN-1024` — Citizen quota meters and digital ration history *(Citizen/Admin)*.
- `GET /api/dashboard/warehouse?warehouseId=WH-003` — Warehouse stock utilization *(Warehouse/Admin)*.
- `GET /api/dashboard/validator?validatorId=VAL-07` — Validator votes and consensus telemetry *(Validator/Admin)*.
- `GET /api/health` — System status, database health, blockchain height, and validator count.
- `GET /api/data` — Complete bootstrap snapshot for frontend clients.

---

## 9. Academic & Demonstration Disclaimer

This backend implementation has been developed as an advanced academic demonstration of a **Blockchain-Based Public Distribution System with Federated Byzantine Agreement (FBA)**.
- **Academic Scope Statement:** The validator network is implemented as 12 independent HTTP processes on loopback for academic demonstration. It demonstrates validator communication, quorum slices, quorum evaluation, and consensus, but is not intended to represent a production WAN deployment.
- **Synthetic Data:** All beneficiary identities, shop names, and validator profiles are **fictional and synthetic**. No real Aadhaar or personal citizen data is stored or processed.
- **Consensus Fidelity:** The FBA consensus engine faithfully models the quorum slice and quorum intersection mathematics of Federated Byzantine Agreement with both in-process coordinator execution and real 12-node distributed HTTP microservices for academic evaluation.

