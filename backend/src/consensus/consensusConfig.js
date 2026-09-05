/**
 * 12-Validator Federated Byzantine Agreement (FBA) Configuration
 * Defines the institutional identity, public keys, and trusted quorum slice topology.
 */

const DEFAULT_12_VALIDATORS = [
  {
    validatorId: 'VAL-01',
    name: 'Ministry of Consumer Affairs',
    org: 'Government of India',
    publicKey: '0x01A9F4C82E3B7701',
    status: 'Online',
    trustConfiguration: {
      threshold: 3,
      quorumSlice: ['VAL-01', 'VAL-02', 'VAL-03', 'VAL-04']
    }
  },
  {
    validatorId: 'VAL-02',
    name: 'National Informatics Centre',
    org: 'NIC Technology Cell',
    publicKey: '0x02B8E3D71C4A8812',
    status: 'Online',
    trustConfiguration: {
      threshold: 3,
      quorumSlice: ['VAL-02', 'VAL-03', 'VAL-05', 'VAL-06']
    }
  },
  {
    validatorId: 'VAL-03',
    name: 'State Food Commission',
    org: 'State Regulatory Authority',
    publicKey: '0x03C7D2A60B5C9923',
    status: 'Online',
    trustConfiguration: {
      threshold: 3,
      quorumSlice: ['VAL-01', 'VAL-03', 'VAL-07', 'VAL-08']
    }
  },
  {
    validatorId: 'VAL-04',
    name: 'Civil Supplies Corporation',
    org: 'State Food Logistics',
    publicKey: '0x04D6C195FA6D0034',
    status: 'Online',
    trustConfiguration: {
      threshold: 3,
      quorumSlice: ['VAL-01', 'VAL-04', 'VAL-09', 'VAL-10']
    }
  },
  {
    validatorId: 'VAL-05',
    name: 'District Administration Node',
    org: 'District Collectorate',
    publicKey: '0x05E5B084E97E1145',
    status: 'Online',
    trustConfiguration: {
      threshold: 3,
      quorumSlice: ['VAL-02', 'VAL-05', 'VAL-07', 'VAL-11']
    }
  },
  {
    validatorId: 'VAL-06',
    name: 'Auditor General Observer Node',
    org: 'Comptroller & Auditor General',
    publicKey: '0x06F4A973D88F2256',
    status: 'Online',
    trustConfiguration: {
      threshold: 3,
      quorumSlice: ['VAL-02', 'VAL-06', 'VAL-08', 'VAL-12']
    }
  },
  {
    validatorId: 'VAL-07',
    name: 'Public Audit & Governance Node',
    org: 'Independent Audit Council',
    publicKey: '0x07A39862C7903367',
    status: 'Online',
    trustConfiguration: {
      threshold: 3,
      quorumSlice: ['VAL-03', 'VAL-05', 'VAL-07', 'VAL-09']
    }
  },
  {
    validatorId: 'VAL-08',
    name: 'Regional Warehouse Authority',
    org: 'Civil Supplies Depots',
    publicKey: '0x08B28751B6A14478',
    status: 'Online',
    trustConfiguration: {
      threshold: 3,
      quorumSlice: ['VAL-03', 'VAL-06', 'VAL-08', 'VAL-10']
    }
  },
  {
    validatorId: 'VAL-09',
    name: 'Fair Price Shop Union Node',
    org: 'FPS Representative Federation',
    publicKey: '0x09C17640A5B25589',
    status: 'Online',
    trustConfiguration: {
      threshold: 3,
      quorumSlice: ['VAL-04', 'VAL-07', 'VAL-09', 'VAL-11']
    }
  },
  {
    validatorId: 'VAL-10',
    name: 'State Monitoring Cell',
    org: 'E-Governance Cell',
    publicKey: '0x10D0653F94C36690',
    status: 'Online',
    trustConfiguration: {
      threshold: 3,
      quorumSlice: ['VAL-04', 'VAL-08', 'VAL-10', 'VAL-12']
    }
  },
  {
    validatorId: 'VAL-11',
    name: 'Citizen Oversight Organisation',
    org: 'Civil Rights & Transparency Forum',
    publicKey: '0x11E9542E83D47701',
    status: 'Online',
    trustConfiguration: {
      threshold: 3,
      quorumSlice: ['VAL-05', 'VAL-09', 'VAL-11', 'VAL-12']
    }
  },
  {
    validatorId: 'VAL-12',
    name: 'Security & Cryptography Validator',
    org: 'National Cryptographic Board',
    publicKey: '0x12F8431D72E58812',
    status: 'Online',
    trustConfiguration: {
      threshold: 3,
      quorumSlice: ['VAL-06', 'VAL-10', 'VAL-11', 'VAL-12']
    }
  }
];

module.exports = {
  DEFAULT_12_VALIDATORS
};

