import { Address, address } from '@solana/addresses';
import { RouterProgram, SessionParams } from '../programs/router';

export interface Session {
  pda: Address;
  gridId: number;
  owner: Address;
  feeBudget: bigint;
  ttlSlots: bigint;
  createdAt: number;
  status: 'active' | 'expired' | 'closed';
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  /**
   * Open a new session for Sonic Grid operations
   * Creates and tracks a session for delegated execution
   * 
   * @param params - Session creation parameters
   * @returns Session address
   */
  async openSession(params: SessionParams): Promise<Address> {
    const { owner, gridId, feeBudget, ttlSlots } = params;

    const sessionPDA = await RouterProgram.deriveSessionPDA(owner, gridId);

    const session: Session = {
      pda: sessionPDA,
      gridId,
      owner,
      feeBudget,
      ttlSlots,
      createdAt: Date.now(),
      status: 'active',
    };

    this.sessions.set(sessionPDA, session);

    console.log(`✓ Session opened: ${sessionPDA}`);
    console.log(`  Grid ID: ${gridId}`);
    console.log(`  Fee Budget: ${feeBudget} lamports`);
    console.log(`  TTL: ${ttlSlots} slots`);

    return sessionPDA;
  }

  /**
   * Get session information
   */
  async getSession(sessionPDA: Address): Promise<Session | null> {
    return this.sessions.get(sessionPDA) || null;
  }

  /**
   * Check if session is still valid
   */
  async isSessionValid(sessionPDA: Address): Promise<boolean> {
    const session = await this.getSession(sessionPDA);
    if (!session) return false;

    const slotDuration = 400;
    const maxAge = Number(session.ttlSlots) * slotDuration;
    const age = Date.now() - session.createdAt;

    return session.status === 'active' && age < maxAge;
  }

  /**
   * Close a session
   */
  async closeSession(sessionPDA: Address): Promise<void> {
    const session = this.sessions.get(sessionPDA);
    if (session) {
      session.status = 'closed';
      console.log(`✓ Session closed: ${sessionPDA}`);
    }
  }

  /**
   * List all active sessions
   */
  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.status === 'active'
    );
  }
}

