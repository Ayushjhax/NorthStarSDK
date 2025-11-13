use anchor_lang::prelude::*;

/// FeeVaultPDA - Escrow account for relayer fees and Sonic gas
/// Holds lamports or SPL tokens to pay for execution
#[account]
pub struct FeeVault {
    /// Authority that owns this vault
    pub authority: Pubkey,
    /// Current balance (in lamports)
    pub balance: u64,
    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl FeeVault {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 + // balance
        1; // bump

    pub const SEED_PREFIX: &'static [u8] = b"fee_vault";

    /// Deposit lamports into the vault
    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        self.balance = self
            .balance
            .checked_add(amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        Ok(())
    }

    /// Withdraw lamports from the vault
    pub fn withdraw(&mut self, amount: u64) -> Result<()> {
        self.balance = self
            .balance
            .checked_sub(amount)
            .ok_or(ProgramError::InsufficientFunds)?;
        Ok(())
    }

    /// Check if vault has sufficient balance
    pub fn has_sufficient_balance(&self, amount: u64) -> bool {
        self.balance >= amount
    }
}
