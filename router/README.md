# SonicRouter Solana Program

The on-chain Solana program that enables routing transactions from Solana mainnet to Sonic Grid for execution.

## Overview

SonicRouter is the critical infrastructure piece for North Star SDK. It allows users to:
- Create sessions with access control
- Commit intents to an OutboxPDA
- Have intents relayed to Sonic Grid via HSSN
- Track fees and manage refunds

## Architecture

```
User Wallet (Solana)
    ↓ Signs transaction
SonicRouter Program
    ↓ Commits to OutboxPDA
Relayer (hypergrid-aide+)
    ↓ Picks up packet
HSSN (IBC Router)
    ↓ Routes to Grid
SonicExecutor (Sonic SVM)
    ↓ Executes
```

## Program Accounts

### SessionPDA
- Per-user session tracking
- Access control (whitelisted programs/opcodes)
- Fee cap enforcement
- Nonce for replay protection
- TTL expiration

**Seeds**: `["session", owner, grid_id]`

### FeeVaultPDA
- Escrows lamports for fees
- Deducted per message sent
- Refunded when session closes

**Seeds**: `["fee_vault", owner]`

### OutboxPDA
- Append-only message buffer
- Maintains Merkle root
- Relayer watches this for new entries

**Seeds**: `["outbox", authority]`

## Instructions

### `open_session`
Creates a new session with specified parameters.

**Parameters:**
- `grid_id`: Target Sonic Grid ID
- `allowed_programs`: Whitelisted programs (empty = allow all)
- `allowed_opcodes`: Whitelisted opcodes (empty = allow all)
- `ttl_slots`: Time-to-live in slots
- `fee_cap`: Maximum fee budget

### `send`
Commits a message to the outbox for routing to Sonic.

**Parameters:**
- `msg`: SonicMsg structure
- `fee_budget`: Fee allocation for this message

**Validations:**
- Session owner must sign
- Session must not be expired
- Nonce must match
- Fee budget ≤ fee cap
- Sufficient balance in fee vault
- Program/opcode must be allowed

### `close_expired`
Closes an expired session and refunds unused fees.

**Validations:**
- Session must be expired
- Owner must sign

## Message Types

### Invoke Mode
User specifies exact program, accounts, and data:
```rust
SonicMsg {
    kind: MsgKind::Invoke,
    invoke: Some(InvokeCall {
        target_program,
        accounts,
        data,
    }),
    ...
}
```

### Embedded Mode
User specifies opcode and parameters; Sonic resolves accounts:
```rust
SonicMsg {
    kind: MsgKind::Embedded,
    opcode: Some(EmbeddedOpcode::Swap),
    params: Some(EmbeddedParams {
        in_mint,
        out_mint,
        amount_in,
        slippage_bps,
        deadline_slot,
        expected_plan_hash,
    }),
    ...
}
```

## Development

### Build
```bash
anchor build
```

### Test
```bash
anchor test
```

### Deploy
```bash
# Devnet
anchor deploy --provider.cluster devnet

# Testnet
anchor deploy --provider.cluster testnet

# Mainnet
anchor deploy --provider.cluster mainnet
```

## Integration with North Star SDK

After deployment, update the SDK:

1. **Copy program ID** from `anchor deploy` output
2. **Update SDK** at `src/programs/router.ts`:
   ```typescript
   export const SONIC_ROUTER_PROGRAM_ID: Address = address(
     'YourDeployedProgramIDHere'
   );
   ```
3. **Test integration** with `yarn demo`

## Security Features

- ✅ Replay protection (nonce)
- ✅ Access control (program/opcode whitelists)
- ✅ Fee limits (per-session caps)
- ✅ TTL expiration
- ✅ Owner validation
- ✅ Merkle root verification (for relayer)

## Events

### SessionOpened
Emitted when a new session is created.

### EntryCommitted
Emitted when a message is added to the outbox.
Relayers watch for this event to pick up packets.

### SessionClosed
Emitted when an expired session is closed.
