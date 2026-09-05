# PDSChain Backend — Production-Quality API & 12-Validator FBA Consensus Engine

> **Project:** PDSChain — Blockchain-Based Public Distribution System  
> **Consensus Mechanism:** Federated Byzantine Agreement (FBA) with 12 Institutional Nodes  
> **Database:** Sequelize ORM (Dual-Dialect: PostgreSQL / Persistent SQLite fallback)  
> **Version:** 1.0.0 (Production-Quality Academic Prototype)

---

## 1. Project Overview

**PDSChain** is an enterprise-grade backend architecture engineered to bring transparency, cryptographic immutability, tamper resistance, and real-time accountability to grain distribution under the Public Distribution System (PDS).

The backend delivers:
- **Persistent Database Storage:** Sequelize ORM with persistent storage surviving restarts.
- **Federated Byzantine Agreement (FBA) Consensus Engine:** 12 institutional validator nodes with mathematically verified quorum slice intersection logic.
- **Deterministic Blockchain Ledger:** SHA-256 block hashing, Merkle root tree calculations, previous-hash chaining, and tamper-detection validator.
- **Full PDS Business Rules:** Beneficiary eligibility verification, family monthly quota tracking, shop stock constraints, and duplicate transaction debounce protection.
- **Role-Based Authentication (RBAC):** JWT tokens with bcrypt password hashing across 5 roles (`ADMIN`, `SHOP`, `WAREHOUSE`, `CITIZEN`, `VALIDATOR`).
- **Automated Testing Suite:** 37 Jest unit and integration tests covering auth, transactions, blockchain, consensus, and REST endpoints.

---

## 2. Architecture Diagram

```
                              +---------------------------------------------+
                              |         PDSCHAIN FRONTEND PROTOTYPE         |
                              |   (35 HTML Pages / Vanilla JS / Chart.js)   |
                              +---------------------------------------------+
                                                     |
                                                     | REST APIs / JSON (CORS)
                                                     v
+---------------------------------------------------------------------------------------------------------+
|                                        EXPRESS BACKEND SERVER                                           |
|                                                                                                         |
|  +-------------------------------------+  +----------------------------------------------------------+  |
|  |       Authentication & RBAC         |  |                   PDS Business Logic                     |  |
|  |  - JWT token issuance & verify      |  |  - Beneficiary eligibility & monthly quota tracking      |  |
|  |  - Bcrypt password hashing          |  |  - Shop & warehouse inventory allocation                 |  |
|  |  - Role access control (5 roles)    |  |  - Duplicate transaction debounce protection             |  |
|  +-------------------------------------+  +----------------------------------------------------------+  |
|                                                     |                                                   |
|                                                     v                                                   |
|  +---------------------------------------------------------------------------------------------------+  |
|  |                    12-VALIDATOR FEDERATED BYZANTINE AGREEMENT (FBA) ENGINE                        |  |
|  |  - Institutional Identities: VAL-01 (Consumer Affairs) ... VAL-12 (National Crypto Board)          |  |
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
                                                     | Sequelize ORM Layer
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
│   │   ├── Transaction.js              # Ration distribution transaction logs
│   │   ├── Block.js                    # Persisted blockchain block records
│   │   └── Validator.js                # 12 Validator node identities & trust configs
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT verification & user injection
│   │   ├── roleMiddleware.js           # Role restriction guard
│   │   ├── validationMiddleware.js     # Schema validation helpers
│   │   └── errorMiddleware.js          # Centralized structured JSON error handler
│   │
│   ├── services/
│   │   ├── authService.js              # Registration, bcrypt login, JWT issuance
│   │   ├── entitlementService.js       # Citizen eligibility & quota calculation
│   │   ├── inventoryService.js         # Shop stock checks & atomic deductions
│   │   ├── transactionService.js       # PDS distribution pipeline orchestration
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
│   │   ├── FBAConsensus.js             # FBA consensus coordinator
│   │   └── consensusConfig.js          # 12-node institutional topology & trust graph
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
│   ├── validators/
│   │   └── schemas.js                  # Request body validation schemas
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
│   ├── auth.test.js                    # Auth & JWT integration tests
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

## 5. Running the Backend & Seeding

### 1. Seed the Database
Populates 100 citizen beneficiaries, 20 Fair Price Shops, 5 Warehouses, 12 Validator nodes, 5 commodities, 125 inventory stock items, and 5 verified blockchain blocks:

```bash
npm run seed
```

### 2. Start the Server
```bash
# Production start
npm start

# Development mode (with auto-reload)
npm run dev
```
The server will be live at `http://localhost:3000`.

### 3. Run Automated Tests
```bash
npm test
```

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

### Institutional Validator Topology

| Node ID | Institutional Identity | Public Key / Representation | Quorum Slice Members | Threshold |
| :--- | :--- | :--- | :--- | :---: |
| `VAL-01` | Ministry of Consumer Affairs | `0x01A9F4C82E3B7701` | `VAL-01`, `VAL-02`, `VAL-03`, `VAL-04` | 3 of 4 |
| `VAL-02` | National Informatics Centre (NIC) | `0x02B8E3D71C4A8812` | `VAL-02`, `VAL-03`, `VAL-05`, `VAL-06` | 3 of 4 |
| `VAL-03` | State Food Commission | `0x03C7D2A60B5C9923` | `VAL-01`, `VAL-03`, `VAL-07`, `VAL-08` | 3 of 4 |
| `VAL-04` | Civil Supplies Corporation | `0x04D6C195FA6D0034` | `VAL-01`, `VAL-04`, `VAL-09`, `VAL-10` | 3 of 4 |
| `VAL-05` | District Administration Node | `0x05E5B084E97E1145` | `VAL-02`, `VAL-05`, `VAL-07`, `VAL-11` | 3 of 4 |
| `VAL-06` | Auditor General Observer Node | `0x06F4A973D88F2256` | `VAL-02`, `VAL-06`, `VAL-08`, `VAL-12` | 3 of 4 |
| `VAL-07` | Public Audit & Governance Node | `0x07A39862C7903367` | `VAL-03`, `VAL-05`, `VAL-07`, `VAL-09` | 3 of 4 |
| `VAL-08` | Regional Warehouse Authority | `0x08B28751B6A14478` | `VAL-03`, `VAL-06`, `VAL-08`, `VAL-10` | 3 of 4 |
| `VAL-09` | Fair Price Shop Union Node | `0x09C17640A5B25589` | `VAL-04`, `VAL-07`, `VAL-09`, `VAL-11` | 3 of 4 |
| `VAL-10` | State Monitoring Cell | `0x10D0653F94C36690` | `VAL-04`, `VAL-08`, `VAL-10`, `VAL-12` | 3 of 4 |
| `VAL-11` | Citizen Oversight Organisation | `0x11E9542E83D47701` | `VAL-05`, `VAL-09`, `VAL-11`, `VAL-12` | 3 of 4 |
| `VAL-12` | Security & Cryptography Validator | `0x12F8431D72E58812` | `VAL-06`, `VAL-10`, `VAL-11`, `VAL-12` | 3 of 4 |

### Mathematical Quorum Logic
1. **Quorum Slice:** Each validator $v \in V$ defines a slice $\mathcal{S}(v) \subseteq V$ containing itself and trusted peers. A slice is satisfied if $|S \cap U| \ge \text{threshold}(v)$.
2. **Quorum ($U \subseteq V$):** A candidate set $U$ is a quorum if $\forall v \in U, \exists S \in \mathcal{S}(v)$ such that $S \subseteq U$.
3. **Consensus Round:**
   $$\text{Proposal } P \longrightarrow \text{Online Nodes Vote } \longrightarrow \text{Slice Evaluation } \longrightarrow \text{Quorum Discovery } \longrightarrow \text{Block Sealed}$$

### Validator Failure Demonstration
- **Tolerating Faults:** If `VAL-05` and `VAL-06` go `Offline`, the remaining 10 nodes still satisfy their overlapping quorum slices and reach consensus ($10 / 12 \ge 75\%$).
- **Catastrophic Failure:** If $>4$ nodes in critical slice intersections fail, quorum cannot form and the transaction proposal is safely rejected without corrupting database state.

---

## 8. Complete API Reference

### Authentication
- `POST /api/auth/register` — Register new user account (`username`, `password`, `role`, `name`).
- `POST /api/auth/login` — Login with credentials, returns JWT token.
- `GET /api/auth/me` — Return profile of authenticated user.

### Beneficiaries
- `GET /api/beneficiaries` — Query beneficiaries with `search`, `region`, and `status` filters.
- `GET /api/beneficiaries/:id` — Retrieve beneficiary record and monthly quota.
- `POST /api/beneficiaries` — Register new citizen beneficiary.
- `PUT /api/beneficiaries/:id` — Update beneficiary status or household size.

### Fair Price Shops & Inventory
- `GET /api/shops` — List all 20 Fair Price Shops.
- `GET /api/shops/:id` — Get shop details.
- `GET /api/shops/:id/inventory` — Query shop stock levels.
- `POST /api/shops/:id/inventory` — Add or replenish stock.

### Transactions & PDS Distribution
- `GET /api/transactions` — Query transaction registry with `search`, `commodity`, and `status` filters.
- `GET /api/transactions/:id` — Get single transaction details.
- `POST /api/transactions` — Execute PDS distribution (triggers FBA consensus and blockchain mining).
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
- `POST /api/validators/:id/status` — Toggle node status (`Online`, `Offline`, `Degraded`).
- `GET /api/consensus/status` — Current network quorum status.
- `GET /api/consensus/quorum` — Trust graph and recent rounds.

### Role Dashboards & Health
- `GET /api/dashboard/admin` — Master telemetry, system counters, and node health.
- `GET /api/dashboard/shop?shopId=FPS-102` — FPS inventory, dispatches, and recent transactions.
- `GET /api/dashboard/citizen?beneficiaryId=BEN-1024` — Citizen quota meters and digital ration history.
- `GET /api/dashboard/warehouse?warehouseId=WH-003` — Warehouse stock utilization.
- `GET /api/dashboard/validator?validatorId=VAL-07` — Validator votes and consensus telemetry.
- `GET /api/health` — System status, database health, blockchain height, and validator count.
- `GET /api/data` — Complete bootstrap snapshot for frontend clients.

---

## 9. Academic & Demonstration Disclaimer

This backend implementation has been developed as an advanced academic demonstration of a **Blockchain-Based Public Distribution System with Federated Byzantine Agreement (FBA)**.
- All beneficiary identities, shop names, and validator profiles are **fictional and synthetic**. No real Aadhaar or personal citizen data is stored or processed.
- The FBA consensus engine faithfully models the quorum slice and quorum intersection mathematics of Federated Byzantine Agreement within a single coordinated Node.js backend process for reproducible evaluation and academic examination.

