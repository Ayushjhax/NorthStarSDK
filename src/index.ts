import { createSolanaRpc, Rpc, SolanaRpcApi } from '@solana/rpc';
import { Address } from '@solana/addresses';
import { NETWORKS, SolanaNetwork } from './config/networks';
import { AccountInfo, NorthStarConfig, ReadTransactionParams } from './types';
import { SonicReader } from './readers/SonicReader';
import { HSSNReader } from './readers/HSSNReader';
import { AccountResolver } from './readers/AccountResolver';
import { TransactionBuilder } from './builders/TransactionBuilder';
import { SessionManager } from './session/SessionManager';

/**
 * Main North Star SDK class
 * Provides unified interface for Sonic Grid interactions
 */
export class NorthStarSDK {
  private rpc: Rpc<SolanaRpcApi>;
  private sonicReader: SonicReader;
  private hssnReader: HSSNReader;
  private accountResolver: AccountResolver;
  private transactionBuilder: TransactionBuilder;
  private sessionManager: SessionManager;
  private config: NorthStarConfig;

  /**
   * Initialize North Star SDK
   * @param config - SDK configuration
   */
  constructor(config: NorthStarConfig) {
    this.config = config;

    const solanaRpc =
      config.customEndpoints?.solana ||
      NETWORKS.solana[config.solanaNetwork];
    this.rpc = createSolanaRpc(solanaRpc);

    // Initialize Sonic reader - use matching network
    const sonicRpc = config.customEndpoints?.sonic || 
                     NETWORKS.sonic[config.solanaNetwork];
    this.sonicReader = new SonicReader(sonicRpc);

    // Initialize HSSN reader
    const hssnRpc = config.customEndpoints?.hssn || NETWORKS.hssn.exapi;
    this.hssnReader = new HSSNReader(hssnRpc);

    // Initialize account resolver with 3-tier fallback
    this.accountResolver = new AccountResolver(
      this.sonicReader,
      this.hssnReader,
      this.rpc
    );

    // Initialize transaction builder
    this.transactionBuilder = new TransactionBuilder(this.rpc);

    // Initialize session manager
    this.sessionManager = new SessionManager();

    console.log('✓ North Star SDK initialized');
    console.log(`  Solana Network: ${config.solanaNetwork}`);
    console.log(`  Sonic Grid: ${sonicRpc}`);
    console.log(`  HSSN: ${hssnRpc}`);
  }

  /**
   * Get account information using 3-tier fallback strategy
   * Priority: Sonic Grid → HSSN → Solana L1
   * 
   * @param address - Account address
   * @returns Account information with source indicator
   */
  async getAccountInfo(address: Address): Promise<AccountInfo> {
    return await this.accountResolver.resolve(address);
  }

  /**
   * Get multiple accounts in batch
   * @param addresses - Array of account addresses
   * @returns Array of account information
   */
  async getMultipleAccounts(addresses: Address[]): Promise<AccountInfo[]> {
    return await this.accountResolver.resolveMultiple(addresses);
  }

  /**
   * Build a read transaction
   * Constructs a Solana transaction that would read from Sonic Grid
   * 
   * @param accountAddress - Account to read
   * @param gridId - Target grid ID (optional, defaults to config)
   * @returns Prepared transaction data (not signed)
   */
  async buildReadTransaction(
    accountAddress: Address,
    gridId?: number
  ): Promise<any> {
    const params: ReadTransactionParams = {
      gridId: gridId || this.config.sonicGridId || 1,
      accountAddress,
    };

    return await this.transactionBuilder.buildReadTx(params);
  }

  /**
   * Open a session for Sonic Grid operations
   * Sessions track state for delegated execution
   * 
   * @param owner - Session owner address
   * @param feeBudget - Fee budget in lamports
   * @param ttlSlots - Time to live in slots
   * @returns Session address
   */
  async openSession(
    owner: Address,
    feeBudget: number = 1_000_000,
    ttlSlots: number = 2000
  ): Promise<Address> {
    return await this.sessionManager.openSession({
      owner,
      gridId: this.config.sonicGridId || 1,
      feeBudget: BigInt(feeBudget),
      ttlSlots: BigInt(ttlSlots),
    });
  }

  /**
   * Get Solana RPC instance
   */
  getRpc(): Rpc<SolanaRpcApi> {
    return this.rpc;
  }

  /**
   * Check health of all connected services
   */
  async checkHealth(): Promise<{
    solana: boolean;
    sonic: boolean;
    hssn: boolean;
  }> {
    const [sonicHealthy, hssnHealthy] = await Promise.all([
      this.sonicReader.isHealthy(),
      this.hssnReader.isHealthy(),
    ]);

    let solanaHealthy = false;
    try {
      await this.rpc.getSlot().send();
      solanaHealthy = true;
    } catch {
      solanaHealthy = false;
    }

    return {
      solana: solanaHealthy,
      sonic: sonicHealthy,
      hssn: hssnHealthy,
    };
  }
}

// Re-export types and Kit utilities for convenience
export * from './types';
export * from './programs/router';
export { Address } from '@solana/addresses';
export { createSolanaRpc } from '@solana/rpc';

