/**
 * North Star SDK - CLI Demo
 * Demonstrates reading account data from Sonic Grid and constructing transactions
 */

import { address } from '@solana/addresses';
import { NorthStarSDK } from '../src';

async function main() {
  console.log('='.repeat(60));
  console.log('North Star SDK - Demo Application');
  console.log('='.repeat(60));
  console.log();

  // Initialize SDK
  const sdk = new NorthStarSDK({
    solanaNetwork: 'testnet',
    sonicGridId: 1,
  });

  console.log();
  console.log('Checking service health...');
  const health = await sdk.checkHealth();
  console.log('Service Status:');
  console.log(`  Solana: ${health.solana ? '✓ Online' : '✗ Offline'}`);
  console.log(`  Sonic Grid: ${health.sonic ? '✓ Online' : '✗ Offline'}`);
  console.log(`  HSSN: ${health.hssn ? '✓ Online' : '✗ Offline'}`); 
  console.log();

  const exampleAccount = address(
    'Hb2F1pTk9oNfoCpi8WDRvVNaZKedE4KHZp34uFo1rWdJ'
  );

  console.log('-'.repeat(60));
  console.log('Demo 1: Reading Account from Sonic Grid');
  console.log('-'.repeat(60));
  console.log(`Account: ${exampleAccount}`);
  console.log();

  try {
    const accountInfo = await sdk.getAccountInfo(exampleAccount);

    console.log('✓ Account Info Retrieved:');
    console.log(`  Source: ${accountInfo.source.toUpperCase()}`);
    console.log(`  Address: ${accountInfo.address}`);
    console.log(`  Owner: ${accountInfo.owner}`);
    console.log(`  Lamports: ${accountInfo.lamports}`);
    console.log(`  Executable: ${accountInfo.executable}`);
    console.log(`  Slot: ${accountInfo.slot}`);
    console.log(`  Data Size: ${accountInfo.data.length} bytes`);
    if (accountInfo.data.length > 0) {
      console.log(`  Data (first 32 bytes): ${Buffer.from(accountInfo.data.slice(0, 32)).toString('hex')}`);
    }
  } catch (error) {
    console.error('✗ Error reading account:', error);
  }

  console.log();
  console.log('-'.repeat(60));
  console.log('Demo 2: Constructing Solana Transaction');
  console.log('-'.repeat(60));
  console.log();

  try {
    console.log('Opening session...');
    const sessionOwner = address('11111111111111111111111111111112');
    const sessionPDA = await sdk.openSession(sessionOwner, 1_000_000, 2000);
    console.log(`✓ Session Address: ${sessionPDA}`);
    console.log(`  Owner: ${sessionOwner}`);
    console.log();

    // Build a read transaction
    console.log('Building read transaction...');
    const transaction = await sdk.buildReadTransaction(exampleAccount, 1);

    console.log('✓ Transaction Built:');
    console.log(`  Instructions: ${transaction.instructions.length}`);
    console.log(`  Blockhash: ${transaction.blockhash}`);
    console.log(`  Last Valid Block Height: ${transaction.lastValidBlockHeight}`);
    console.log();
    console.log('Transaction Structure:');
    transaction.instructions.forEach((ix: any, i: number) => {
      console.log(`  Instruction ${i + 1}:`);
      console.log(`    Program Address: ${ix.programAddress}`);
      console.log(`    Accounts: ${ix.accounts.length}`);
      console.log(`    Data Length: ${ix.data.length} bytes`);
    });
  } catch (error) {
    console.error('✗ Error building transaction:', error);
  }

  console.log();
  console.log('='.repeat(60));
  console.log('Demo Complete');
  console.log('='.repeat(60));
  console.log();
  console.log('Current Features:');
  console.log('  ✓ Read account data from Sonic Grid');
  console.log('  ✓ 3-tier fallback resolution');
  console.log('  ✓ Transaction construction');
  console.log('  ✓ Session management');
  console.log();
  console.log('Coming Soon:');
  console.log('  → On-chain session validation');
  console.log('  → Delegated execution');
  console.log('  → Receipt verification');
  console.log('  → Write-back to Solana L1');
  console.log();
}

// Run the demo
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

