/**
 * Account Resolver - 3-Tier Read Strategy
 * Implements the fallback chain: Sonic Grid → HSSN → Solana L1
 */

import { Address } from '@solana/addresses';
import { Rpc, SolanaRpcApi } from '@solana/rpc';
import { AccountInfo } from '../types';
import { SonicReader } from './SonicReader';
import { HSSNReader } from './HSSNReader';

export class AccountResolver {
  private sonicReader: SonicReader;
  private hssnReader: HSSNReader;
  private solanaRpc: Rpc<SolanaRpcApi>;

  constructor(
    sonicReader: SonicReader,
    hssnReader: HSSNReader,
    solanaRpc: Rpc<SolanaRpcApi>
  ) {
    this.sonicReader = sonicReader;
    this.hssnReader = hssnReader;
    this.solanaRpc = solanaRpc;
  }

  /**
   * Resolve account information using 3-tier fallback strategy:
   * Sonic Grid → HSSN → Solana L1
   * 
   * @param address - Account address to resolve
   * @returns Account information with source indicator
   */
  async resolve(address: Address): Promise<AccountInfo> {
    try {
      const sonicAccount = await this.sonicReader.getAccountInfo(address);
      if (sonicAccount) {
        console.log(`✓ Account resolved from Sonic Grid: ${address}`);
        return sonicAccount;
      }
    } catch (error) {
      console.warn('Sonic Grid unavailable, trying HSSN:', error);
    }

    try {
      const hssnAccount = await this.hssnReader.getAccountInfo(address);
      if (hssnAccount) {
        console.log(`✓ Account resolved from HSSN: ${address}`);
        return hssnAccount;
      }
    } catch (error) {
      console.warn('HSSN unavailable, using Solana L1:', error);
    }

    try {
      console.log(`→ Fetching from Solana L1: ${address}`);
      const response = await this.solanaRpc
        .getAccountInfo(address, { encoding: 'base64' })
        .send();

      if (!response.value) {
        throw new Error(`Account not found: ${address}`);
      }

      const solanaAccount = response.value;

      return {
        address: address,
        data: new Uint8Array(Buffer.from(solanaAccount.data[0], 'base64')),
        executable: solanaAccount.executable,
        lamports: solanaAccount.lamports,
        owner: solanaAccount.owner as Address,
        slot: BigInt(response.context.slot),
        source: 'solana',
      };
    } catch (error) {
      console.error('All read sources failed:', error);
      throw new Error(
        `Failed to resolve account ${address} from any source`
      );
    }
  }

  /**
   * Batch resolve multiple accounts using the fallback strategy
   * @param addresses - Array of account addresses
   * @returns Array of account information
   */
  async resolveMultiple(addresses: Address[]): Promise<AccountInfo[]> {
    const results: AccountInfo[] = [];

    for (const address of addresses) {
      try {
        const account = await this.resolve(address);
        results.push(account);
      } catch (error) {
        console.error(`Failed to resolve ${address}:`, error);
        throw error;
      }
    }

    return results;
  }
}

