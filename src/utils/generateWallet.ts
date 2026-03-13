import { Keypair } from '@solana/web3.js';
import * as bs58 from 'bs58';

/**
 * Utility script to generate a new Solana wallet
 * Run with: npx ts-node src/utils/generateWallet.ts
 */
function generateWallet() {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toString();
  const privateKey = bs58.encode(keypair.secretKey);

  console.log('\n=== New Solana Wallet Generated ===');
  console.log(`Public Key: ${publicKey}`);
  console.log(`Private Key (base58): ${privateKey}`);
  console.log('\n⚠️  IMPORTANT: Save this private key securely!');
  console.log('Add it to your .env file as WALLET_PRIVATE_KEYS or to a wallet file.\n');
}

generateWallet();
