/**
 * Integration Tests
 * End-to-end tests for North Star SDK
 */

import { address } from '@solana/addresses';
import { NorthStarSDK } from '../src';

describe('North Star SDK Integration Tests', () => {
  let sdk: NorthStarSDK;

  beforeAll(() => {
    sdk = new NorthStarSDK({
      solanaNetwork: 'testnet',
      sonicGridId: 1,
    });
  });

  test('should initialize SDK successfully', () => {
    expect(sdk).toBeDefined();
    expect(sdk.getRpc()).toBeDefined();
  });

  test('should check service health', async () => {
    const health = await sdk.checkHealth();

    expect(health).toHaveProperty('solana');
    expect(health).toHaveProperty('sonic');
    expect(health).toHaveProperty('hssn');
    expect(typeof health.solana).toBe('boolean');
    expect(typeof health.sonic).toBe('boolean');
    expect(typeof health.hssn).toBe('boolean');
  }, 30000);

  test('should resolve account info', async () => {
    const systemProgram = address('11111111111111111111111111111111');

    const accountInfo = await sdk.getAccountInfo(systemProgram);

    expect(accountInfo).toBeDefined();
    expect(accountInfo.address).toBe(systemProgram);
    expect(['sonic', 'hssn', 'solana']).toContain(accountInfo.source);
  }, 30000);

  test('should build read transaction', async () => {
    const testAddress = address('11111111111111111111111111111111');

    const transaction = await sdk.buildReadTransaction(testAddress);

    expect(transaction).toBeDefined();
    expect(transaction.instructions.length).toBeGreaterThan(0);
    expect(transaction.blockhash).toBeDefined();
  }, 30000);

  test('should open session', async () => {
    const owner = address('11111111111111111111111111111112');
    const sessionPDA = await sdk.openSession(owner);

    expect(sessionPDA).toBeDefined();
    expect(typeof sessionPDA).toBe('string');
  });
});

