/**
 * PDA Derivation Utilities for SonicRouter Program
 * Uses Anza Kit's getProgramDerivedAddress
 */

import { Address, getProgramDerivedAddress } from '@solana/addresses';
import { SONIC_ROUTER_PROGRAM_ID } from '../programs/router';

/**
 * Convert number to little-endian bytes for PDA seeds
 */
function numberToLE(num: number, bytes: number): Uint8Array {
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) {
    arr[i] = num & 0xff;
    num = num >> 8;
  }
  return arr;
}

/**
 * Derive SessionPDA address using Kit's PDA derivation
 * Seeds: ["session", owner, grid_id]
 */
export async function deriveSessionPDA(
  owner: Address,
  gridId: number
): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: SONIC_ROUTER_PROGRAM_ID,
    seeds: [
      'session',
      owner,
      numberToLE(gridId, 8)
    ],
  });
  return pda;
}

/**
 * Derive FeeVaultPDA address using Kit's PDA derivation
 * Seeds: ["fee_vault", owner]
 */
export async function deriveFeeVaultPDA(owner: Address): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: SONIC_ROUTER_PROGRAM_ID,
    seeds: [
      'fee_vault',
      owner
    ],
  });
  return pda;
}

/**
 * Derive OutboxPDA address using Kit's PDA derivation
 * Seeds: ["outbox", authority]
 */
export async function deriveOutboxPDA(authority: Address): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: SONIC_ROUTER_PROGRAM_ID,
    seeds: [
      'outbox',
      authority
    ],
  });
  return pda;
}
