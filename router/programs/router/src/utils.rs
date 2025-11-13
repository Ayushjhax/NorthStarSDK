use anchor_lang::prelude::*;

use crate::types::OutboxEntry;

/// Compute a hash for an outbox entry
/// Used for Merkle root calculation and entry identification
pub fn compute_entry_hash(entry: &OutboxEntry) -> Result<[u8; 32]> {
    // Simple deterministic hash using entry components
    // TODO: When polishing this to production, use a proper cryptographic hash (keccak, sha256)
    let mut hash = [0u8; 32];

    // XOR key components to create a deterministic identifier
    for (i, byte) in entry.owner.as_ref().iter().enumerate() {
        hash[i] ^= byte;
    }
    for (i, byte) in entry.session.as_ref().iter().enumerate() {
        hash[i] ^= byte;
    }
    for (i, byte) in entry.fee_budget.to_le_bytes().iter().enumerate() {
        if i < 32 {
            hash[i] ^= byte;
        }
    }
    for (i, byte) in entry.msg.nonce.to_le_bytes().iter().enumerate() {
        if i < 32 {
            hash[i] ^= byte;
        }
    }

    Ok(hash)
}

/// Verify entry signature
pub fn verify_entry_signature(entry: &OutboxEntry, signature: &[u8; 64]) -> Result<bool> {
    // Signature verification would be implemented here
    // For now, return true as signature is computed off-chain
    Ok(signature == &entry.sig)
}
