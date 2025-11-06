/**
 * Transaction Builder
 * Constructs Solana transactions for Sonic Grid operations
 */

import { Address } from '@solana/addresses';
import { Rpc, SolanaRpcApi } from '@solana/rpc';
import {
  RouterProgram,
  MsgKind,
  SonicMessage,
  SONIC_ROUTER_PROGRAM_ID,
} from '../programs/router';
import { ReadTransactionParams } from '../types';

export class TransactionBuilder {
  private rpc: Rpc<SolanaRpcApi>;

  constructor(rpc: Rpc<SolanaRpcApi>) {
    this.rpc = rpc;
  }

  /**
   * Build a transaction to read from Sonic Grid
   * Constructs a Solana transaction for reading account data via Sonic
   * 
   * @param params - Transaction parameters
   * @returns Prepared transaction data structure
   */
  async buildReadTx(params: ReadTransactionParams): Promise<any> {
    const { gridId, accountAddress, sessionPDA } = params;

    const { value: latestBlockhash } = await this.rpc.getLatestBlockhash().send();

    const message: SonicMessage = {
      gridId,
      kind: MsgKind.Invoke,
      invoke: {
        targetProgram: accountAddress,
        accounts: [
          {
            address: accountAddress,
            role: 0,
          },
        ],
        data: new Uint8Array([]),
      },
      nonce: BigInt(Date.now()),
      ttlSlots: BigInt(1000),
    };

    return {
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      message: message,
      session: sessionPDA || accountAddress,
      instructions: [
        {
          programAddress: SONIC_ROUTER_PROGRAM_ID,
          accounts: [
            { address: sessionPDA || accountAddress, role: 1 },
          ],
          data: this.encodeMessage(message),
        },
      ],
    };
  }

  /**
   * Encode Sonic message for instruction data
   */
  private encodeMessage(message: SonicMessage): Uint8Array {
    const jsonStr = JSON.stringify({
      gridId: message.gridId,
      kind: message.kind,
      nonce: message.nonce.toString(),
      ttlSlots: message.ttlSlots.toString(),
      invoke: message.invoke,
      embedded: message.embedded,
    });
    return new Uint8Array(Buffer.from(jsonStr, 'utf-8'));
  }

  /**
   * Build a transaction to open a session
   * Creates a transaction for session initialization
   * 
   * @param owner - Session owner address
   * @param gridId - Target grid ID
   * @param feeBudget - Fee budget in lamports
   * @returns Prepared transaction data
   */
  async buildOpenSessionTx(
    owner: Address,
    gridId: number,
    feeBudget: bigint = BigInt(1_000_000)
  ): Promise<any> {
    const { value: latestBlockhash } = await this.rpc.getLatestBlockhash().send();

    return {
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      feePayer: owner,
      instructions: [
        {
          programAddress: SONIC_ROUTER_PROGRAM_ID,
          accounts: [
            { address: owner, role: 1 }, // Signer
          ],
          data: new Uint8Array(
            Buffer.from(
              JSON.stringify({
                type: 'openSession',
                gridId,
                ttlSlots: 2000,
                feeBudget: feeBudget.toString(),
              })
            )
          ),
        },
      ],
    };
  }
}

