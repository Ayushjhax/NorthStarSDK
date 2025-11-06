/**
 * AccountResolver Tests
 * Tests the 3-tier fallback strategy for account resolution
 */

import { address, Address } from '@solana/addresses';
import { AccountResolver } from '../src/readers/AccountResolver';
import { SonicReader } from '../src/readers/SonicReader';
import { HSSNReader } from '../src/readers/HSSNReader';

// Mock implementations for testing
jest.mock('../src/readers/SonicReader');
jest.mock('../src/readers/HSSNReader');

describe('AccountResolver', () => {
  let accountResolver: AccountResolver;
  let mockSonicReader: jest.Mocked<SonicReader>;
  let mockHSSNReader: jest.Mocked<HSSNReader>;
  let mockRpc: any;

  beforeEach(() => {
    mockSonicReader = new SonicReader('http://test') as jest.Mocked<SonicReader>;
    mockHSSNReader = new HSSNReader('http://test') as jest.Mocked<HSSNReader>;
    mockRpc = {
      getAccountInfo: jest.fn().mockReturnValue({
        send: jest.fn(),
      }),
    };

    accountResolver = new AccountResolver(
      mockSonicReader,
      mockHSSNReader,
      mockRpc
    );
  });

  test('should resolve from Sonic Grid when available', async () => {
    const testAddress = address('11111111111111111111111111111111');
    const mockAccount = {
      address: testAddress,
      data: new Uint8Array(Buffer.from('test')),
      executable: false,
      lamports: BigInt(1000000),
      owner: address('11111111111111111111111111111111'),
      slot: BigInt(12345),
      source: 'sonic' as const,
    };

    mockSonicReader.getAccountInfo.mockResolvedValue(mockAccount);

    const result = await accountResolver.resolve(testAddress);

    expect(result).toEqual(mockAccount);
    expect(result.source).toBe('sonic');
    expect(mockSonicReader.getAccountInfo).toHaveBeenCalledWith(testAddress);
    expect(mockHSSNReader.getAccountInfo).not.toHaveBeenCalled();
    expect(mockRpc.getAccountInfo).not.toHaveBeenCalled();
  });

  test('should fallback to HSSN when Sonic fails', async () => {
    const testAddress = address('11111111111111111111111111111111');
    const mockAccount = {
      address: testAddress,
      data: new Uint8Array(Buffer.from('test')),
      executable: false,
      lamports: BigInt(1000000),
      owner: address('11111111111111111111111111111111'),
      slot: BigInt(12345),
      source: 'hssn' as const,
    };

    mockSonicReader.getAccountInfo.mockResolvedValue(null);
    mockHSSNReader.getAccountInfo.mockResolvedValue(mockAccount);

    const result = await accountResolver.resolve(testAddress);

    expect(result).toEqual(mockAccount);
    expect(result.source).toBe('hssn');
    expect(mockSonicReader.getAccountInfo).toHaveBeenCalled();
    expect(mockHSSNReader.getAccountInfo).toHaveBeenCalled();
    expect(mockRpc.getAccountInfo).not.toHaveBeenCalled();
  });

  test('should fallback to Solana L1 when both Sonic and HSSN fail', async () => {
    const testAddress = address('11111111111111111111111111111111');
    const mockSolanaResponse = {
      context: { slot: 12345 },
      value: {
        data: ['c29sYW5hLWRhdGE=', 'base64'], // 'solana-data' in base64
        executable: false,
        lamports: BigInt(2000000),
        owner: address('11111111111111111111111111111111'),
      },
    };

    mockSonicReader.getAccountInfo.mockResolvedValue(null);
    mockHSSNReader.getAccountInfo.mockResolvedValue(null);
    mockRpc.getAccountInfo.mockReturnValue({
      send: jest.fn().mockResolvedValue(mockSolanaResponse),
    });

    const result = await accountResolver.resolve(testAddress);

    expect(result.source).toBe('solana');
    expect(result.lamports).toBe(BigInt(2000000));
    expect(mockSonicReader.getAccountInfo).toHaveBeenCalled();
    expect(mockHSSNReader.getAccountInfo).toHaveBeenCalled();
    expect(mockRpc.getAccountInfo).toHaveBeenCalled();
  });

  test('should throw error when all sources fail', async () => {
    const testAddress = address('11111111111111111111111111111111');

    mockSonicReader.getAccountInfo.mockResolvedValue(null);
    mockHSSNReader.getAccountInfo.mockResolvedValue(null);
    mockRpc.getAccountInfo.mockReturnValue({
      send: jest.fn().mockResolvedValue({ value: null }),
    });

    await expect(accountResolver.resolve(testAddress)).rejects.toThrow(
      `Failed to resolve account ${testAddress} from any source`
    );
  });
});

