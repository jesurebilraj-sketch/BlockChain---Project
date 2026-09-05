const fbaInstance = require('../src/consensus/FBAConsensus');

describe('12-Validator Federated Byzantine Agreement (FBA) Test Suite', () => {
  beforeEach(() => {
    fbaInstance.initDefaultValidators();
  });

  it('should initialize exactly 12 institutional validator nodes', () => {
    const validators = fbaInstance.getValidators();
    expect(validators.length).toBe(12);

    const ids = validators.map(v => v.validatorId);
    expect(ids).toContain('VAL-01');
    expect(ids).toContain('VAL-12');
  });

  it('should evaluate quorum slices and achieve consensus when all nodes are online', async () => {
    const proposal = {
      transactionId: 'TXN-CONSENSUS-001',
      beneficiaryId: 'BEN-1024',
      commodity: 'Rice',
      quantity: 5
    };

    const round = await fbaInstance.runConsensusRound(proposal);

    expect(round.status).toBe('ACHIEVED');
    expect(round.quorumAchieved).toBe(true);
    expect(round.participatingValidators).toBe(12);
    expect(round.quorumSize).toBeGreaterThanOrEqual(9);
    expect(round.validatorSignatures.length).toBe(12);
  });

  it('should tolerate minor validator failures (VAL-05 and VAL-06 OFFLINE) and still achieve consensus', async () => {
    // Take VAL-05 and VAL-06 offline
    fbaInstance.setValidatorStatus('VAL-05', 'Offline');
    fbaInstance.setValidatorStatus('VAL-06', 'Offline');

    const networkStatus = fbaInstance.getNetworkStatus();
    expect(networkStatus.onlineCount).toBe(10);
    expect(networkStatus.offlineCount).toBe(2);
    expect(networkStatus.hasQuorum).toBe(true);

    const proposal = {
      transactionId: 'TXN-TOLERANCE-002',
      beneficiaryId: 'BEN-1001',
      commodity: 'Wheat',
      quantity: 10
    };

    const round = await fbaInstance.runConsensusRound(proposal);

    expect(round.status).toBe('ACHIEVED');
    expect(round.quorumAchieved).toBe(true);
    expect(round.participatingValidators).toBe(10);
    expect(round.quorumMembers).not.toContain('VAL-05');
    expect(round.quorumMembers).not.toContain('VAL-06');
  });

  it('should fail consensus when too many critical validators are offline', async () => {
    // Take 5 nodes offline
    fbaInstance.setValidatorStatus('VAL-01', 'Offline');
    fbaInstance.setValidatorStatus('VAL-02', 'Offline');
    fbaInstance.setValidatorStatus('VAL-03', 'Offline');
    fbaInstance.setValidatorStatus('VAL-04', 'Offline');
    fbaInstance.setValidatorStatus('VAL-05', 'Offline');

    const proposal = {
      transactionId: 'TXN-FAILURE-003',
      beneficiaryId: 'BEN-1001',
      commodity: 'Rice',
      quantity: 5
    };

    const round = await fbaInstance.runConsensusRound(proposal);

    expect(round.status).toBe('FAILED');
  });

  it('should restore nodes and recover network consensus health', async () => {
    fbaInstance.setValidatorStatus('VAL-01', 'Offline');
    fbaInstance.setValidatorStatus('VAL-02', 'Offline');

    // Restore back to online
    fbaInstance.setValidatorStatus('VAL-01', 'Online');
    fbaInstance.setValidatorStatus('VAL-02', 'Online');

    const status = fbaInstance.getNetworkStatus();
    expect(status.onlineCount).toBe(12);
    expect(status.hasQuorum).toBe(true);
  });
});

