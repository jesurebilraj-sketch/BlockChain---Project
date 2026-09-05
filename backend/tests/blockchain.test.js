const Blockchain = require('../src/blockchain/Blockchain');
const Block = require('../src/blockchain/Block');
const { validateBlock, validateChain } = require('../src/blockchain/validation');

describe('Blockchain Engine Test Suite', () => {
  let blockchain;

  beforeEach(() => {
    blockchain = new Blockchain(2);
  });

  it('should initialize with a valid Genesis Block', () => {
    const genesis = blockchain.getLatestBlock();
    expect(genesis.blockNumber).toBe(0);
    expect(genesis.previousHash).toBe('0000000000000000000000000000000000000000000000000000000000000000');
    expect(genesis.blockHash).toBeDefined();
    expect(blockchain.isChainValid()).toBe(true);
  });

  it('should append new block with correct previousHash and valid Merkle root', () => {
    const txData = [
      { transactionId: 'TXN-TEST-001', beneficiaryId: 'BEN-1001', commodity: 'Rice', quantity: '5 KG' }
    ];

    const newBlock = blockchain.addBlock(txData, ['VAL-01', 'VAL-02', 'VAL-03']);
    expect(newBlock.blockNumber).toBe(1);
    expect(newBlock.previousHash).toBe(blockchain.chain[0].blockHash);
    expect(blockchain.chain.length).toBe(2);
    expect(blockchain.isChainValid()).toBe(true);
  });

  it('should detect tampered block data and fail validation', () => {
    blockchain.addBlock([{ transactionId: 'TXN-TEST-001', quantity: '5 KG' }]);
    blockchain.addBlock([{ transactionId: 'TXN-TEST-002', quantity: '10 KG' }]);

    expect(blockchain.isChainValid()).toBe(true);

    // Tamper with block 1 transaction quantity
    blockchain.chain[1].transactions[0].quantity = '9999 KG';

    expect(blockchain.isChainValid()).toBe(false);
  });

  it('should detect broken previousHash link in chain', () => {
    blockchain.addBlock([{ transactionId: 'TXN-TEST-001' }]);
    blockchain.addBlock([{ transactionId: 'TXN-TEST-002' }]);

    // Tamper with block 2 previousHash
    blockchain.chain[2].previousHash = '0xBAD_HASH_1234567890ABCDEF';

    const result = validateChain(blockchain.chain);
    expect(result.isValid).toBe(false);
  });

  it('should lookup transactions by ID', () => {
    blockchain.addBlock([{ transactionId: 'TXN-FIND-ME-42', commodity: 'Wheat', qty: '10 KG' }]);

    const found = blockchain.getTransactionById('TXN-FIND-ME-42');
    expect(found).not.toBeNull();
    expect(found.blockNumber).toBe(1);
    expect(found.transaction.commodity).toBe('Wheat');
  });
});

