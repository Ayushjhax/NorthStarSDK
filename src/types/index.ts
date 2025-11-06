/**
 * Core types and interfaces for North Star SDK
 */

import { Address } from '@solana/addresses';
import { Commitment } from '@solana/rpc-types';

/**
 * Account information from Sonic Grid or HSSN
 */
export interface AccountInfo {
  address: Address;
  data: Uint8Array;
  executable: boolean;
  lamports: bigint;
  owner: Address;
  slot: bigint;
  source: 'sonic' | 'hssn' | 'solana';
}

/**
 * HSSN API response for Solana account
 */
export interface HSSNAccountResponse {
  solanaAccount: {
    address: string;
    version: string;
    source: string;
    slot: string;
    value: string;
    creator: string;
  };
}

/**
 * Sonic Grid account response
 */
export interface SonicAccountResponse {
  jsonrpc: string;
  result: {
    context: {
      apiVersion: string;
      slot: number;
    };
    value: {
      data: [string, string]; // [data, encoding]
      executable: boolean;
      lamports: number;
      owner: string;
      remote: boolean;
      rentEpoch: number;
      space: number;
    };
  };
  id: number;
}

/**
 * Transaction build parameters
 */
export interface ReadTransactionParams {
  gridId: number;
  accountAddress: Address;
  sessionPDA?: Address;
}

/**
 * SDK configuration
 */
export interface NorthStarConfig {
  solanaNetwork: 'mainnet' | 'testnet' | 'devnet';
  sonicGridId?: number;
  customEndpoints?: {
    solana?: string;
    sonic?: string;
    hssn?: string;
  };
}

