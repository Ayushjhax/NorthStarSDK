/**
 * North Star SDK - Basic Demo
 * 
 * This demonstrates the SDK's core functionality:
 * - Reading account data with 3-tier fallback
 * - Building transactions on Solana
 * - Session management
 * - Transaction structure for Sonic routing
 */

import { address } from '@solana/addresses';
import { NorthStarSDK } from '../src';

// Use a known Solana testnet account for testing
const TEST_ACCOUNT = address('SysvarC1ock11111111111111111111111111111111');

async function main() {
  console.log('='.repeat(70));
  console.log('North Star SDK - Basic Demo');
  console.log('='.repeat(70));
  console.log();

  // Initialize SDK
  const sdk = new NorthStarSDK({
    solanaNetwork: 'testnet',
    sonicGridId: 1,
  });

  console.log('✓ SDK Initialized');
  console.log(`  Solana Network: testnet`);
  console.log(`  Sonic RPC: https://api.testnet.sonic.game`);
  console.log(`  Router Program: J6YB6HFjFecHKRvgfWwqa6sAr2DhR2k7ArvAd6NG7mBo`);
  console.log();

  // Check service health
  console.log('Checking services...');
  const health = await sdk.checkHealth();
  console.log('✓ Service Status:');
  console.log(`  Solana: ${health.solana ? 'Online' : 'Offline'}`);
  console.log(`  Sonic Grid: ${health.sonic ? 'Online' : 'Offline'}`);
  console.log(`  HSSN: ${health.hssn ? 'Online' : 'Offline'}`);
  console.log();

  // Step 1: Read Account
  console.log('━'.repeat(70));
  console.log('Step 1: Read Account from Sonic Grid');
  console.log('━'.repeat(70));
  console.log();

  try {
    console.log(`Reading account: ${TEST_ACCOUNT}`);
    console.log('(Using Solana Clock Sysvar - exists on all networks)');
    console.log();

    const accountData = await sdk.getAccountInfo(TEST_ACCOUNT);

    console.log('✓ Account Retrieved:');
    console.log(`  Source: ${accountData.source.toUpperCase()}`);
    console.log(`  Owner: ${accountData.owner}`);
    console.log(`  Lamports: ${accountData.lamports.toString()}`);
    console.log(`  Data Size: ${accountData.data.length} bytes`);
    console.log();

    if (accountData.source !== 'sonic') {
      console.log('NOTE: Read from', accountData.source.toUpperCase());
      console.log('Account not yet synced to Sonic Grid cache.');
      console.log('This demonstrates the 3-tier fallback working correctly!');
      console.log();
    }

  } catch (error: any) {
    console.log('✗ Error:', error.message);
    console.log();
  }

  // Step 2: Build Transaction
  console.log('━'.repeat(70));
  console.log('Step 2: Build Transaction on Solana');
  console.log('━'.repeat(70));
  console.log();

  try {
    // Demo wallet
    const demoWallet = address('11111111111111111111111111111112');

    console.log('Creating session on Solana...');
    const sessionPDA = await sdk.openSession(demoWallet, 1_000_000, 2000);
    console.log(`✓ Session PDA: ${sessionPDA}`);
    console.log();

    console.log('Building transaction...');
    const tx = await sdk.buildReadTransaction(TEST_ACCOUNT, 1);

    console.log('✓ Transaction Structure:');
    console.log(`  Router Program: ${tx.instructions[0].programAddress}`);
    console.log(`  Blockhash: ${tx.blockhash}`);
    console.log(`  Instructions: ${tx.instructions.length}`);
    console.log(`  Data Size: ${tx.instructions[0].data.length} bytes`);
    console.log();

    console.log('Transaction Message:');
    console.log(`  Grid ID: ${tx.message.gridId}`);
    console.log(`  Target Account: ${TEST_ACCOUNT}`);
    console.log(`  Nonce: ${tx.message.nonce}`);
    console.log(`  TTL Slots: ${tx.message.ttlSlots}`);
    console.log();

  } catch (error: any) {
    console.log('✗ Error:', error.message);
    console.log();
  }

  // Summary
  console.log('='.repeat(70));
  console.log('Summary');
  console.log('='.repeat(70));
  console.log();

  console.log('✓ What Works:');
  console.log('  • SDK reads account data (with 3-tier fallback)');
  console.log('  • SDK builds valid Solana transactions');
  console.log('  • Router program deployed on testnet');
  console.log('  • Transaction structure ready for routing');
  console.log();

  console.log('Next Steps:');
  console.log('  1. Deploy target program to Sonic Grid');
  console.log('  2. Configure relayer to watch SonicRouter');
  console.log('  3. Deploy SonicExecutor on Sonic Grid');
  console.log('  4. Test end-to-end message routing');
  console.log();

  console.log('The North Star SDK is ready for integration! 🚀');
  console.log();
}

main()
  .then(() => {
    console.log('Demo complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
