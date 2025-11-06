/**
 * SonicRouter Program Interface
 * Provides transaction instruction structures for Sonic Grid operations
 */

import { Address, address } from '@solana/addresses';

/**
 * SonicRouter Program ID
 * Update this when the on-chain program is deployed
 */
export const SONIC_ROUTER_PROGRAM_ID: Address = address(
  '11111111111111111111111111111111'
);

/**
 * Message types for Sonic execution
 */
export enum MsgKind {
  Invoke = 0,
  Embedded = 1,
}

/**
 * Embedded operation opcodes
 */
export enum EmbeddedOpcode {
  Swap = 0,
  // Future: Route, AddLiquidity, etc.
}

/**
 * Account metadata for Kit transactions
 */
export interface AccountParam {
  address: Address;
  role: number; // 0 = read-only, 1 = writable, etc.
}

/**
 * Parameters for invoke mode
 */
export interface InvokeParams {
  targetProgram: Address;
  accounts: AccountParam[];
  data: Uint8Array;
}

/**
 * Parameters for embedded mode (swap example)
 */
export interface EmbeddedParams {
  opcode: EmbeddedOpcode;
  inMint: Address;
  outMint: Address;
  amountIn: bigint;
  slippageBps: number;
  deadlineSlot: bigint;
  expectedPlanHash?: Uint8Array;
}

/**
 * Sonic message structure
 */
export interface SonicMessage {
  gridId: number;
  kind: MsgKind;
  invoke?: InvokeParams;
  embedded?: EmbeddedParams;
  nonce: bigint;
  ttlSlots: bigint;
}

/**
 * Session creation parameters
 */
export interface SessionParams {
  owner: Address;
  gridId: number;
  allowedPrograms?: Address[];
  allowedOpcodes?: EmbeddedOpcode[];
  ttlSlots: bigint;
  feeBudget: bigint;
}

export class RouterProgram {
  /**
   * Create instruction to open a session
   */
  static async createOpenSessionInstruction(
    params: SessionParams
  ): Promise<any> {
    return {
      programAddress: SONIC_ROUTER_PROGRAM_ID,
      accounts: [
        { address: params.owner, role: 1 },
      ],
      data: this.encodeSessionParams(params),
    };
  }

  /**
   * Create instruction to send a message to Sonic
   */
  static async createSendInstruction(
    session: Address,
    message: SonicMessage
  ): Promise<any> {
    return {
      programAddress: SONIC_ROUTER_PROGRAM_ID,
      accounts: [
        { address: session, role: 1 },
      ],
      data: this.encodeSonicMessage(message),
    };
  }

  /**
   * Encode session parameters for instruction data
   */
  private static encodeSessionParams(params: SessionParams): Uint8Array {
    const data = {
      type: 'openSession',
      owner: params.owner,
      gridId: params.gridId,
      allowedPrograms: params.allowedPrograms || [],
      allowedOpcodes: params.allowedOpcodes || [],
      ttlSlots: params.ttlSlots.toString(),
      feeBudget: params.feeBudget.toString(),
    };
    return new Uint8Array(Buffer.from(JSON.stringify(data)));
  }

  /**
   * Encode Sonic message for instruction data
   */
  private static encodeSonicMessage(message: SonicMessage): Uint8Array {
    const data = {
      type: 'send',
      gridId: message.gridId,
      kind: message.kind,
      nonce: message.nonce.toString(),
      ttlSlots: message.ttlSlots.toString(),
      invoke: message.invoke,
      embedded: message.embedded,
    };
    return new Uint8Array(Buffer.from(JSON.stringify(data)));
  }

  /**
   * Derive session PDA
   * Generates a deterministic session address from owner and grid ID
   */
  static async deriveSessionPDA(
    owner: Address,
    gridId: number
  ): Promise<Address> {
    return `${owner}_session_${gridId}` as Address;
  }
}

