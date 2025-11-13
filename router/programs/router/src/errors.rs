use anchor_lang::prelude::*;

#[error_code]
pub enum RouterError {
    #[msg("Session has expired")]
    SessionExpired,

    #[msg("Insufficient fee balance in vault")]
    InsufficientFees,

    #[msg("Program not in allowed list")]
    UnauthorizedProgram,

    #[msg("Opcode not in allowed list")]
    UnauthorizedOpcode,

    #[msg("Invalid nonce (replay protection)")]
    InvalidNonce,

    #[msg("Fee budget exceeds session fee cap")]
    FeeCapExceeded,

    #[msg("TTL has been reached")]
    TTLExpired,

    #[msg("Invalid grid ID")]
    InvalidGridId,

    #[msg("Session is still active")]
    SessionStillActive,

    #[msg("Maximum allowed programs exceeded")]
    TooManyAllowedPrograms,

    #[msg("Maximum allowed opcodes exceeded")]
    TooManyAllowedOpcodes,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Invalid message kind")]
    InvalidMessageKind,
}
