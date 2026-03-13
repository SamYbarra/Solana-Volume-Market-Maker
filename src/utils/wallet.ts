import { Keypair } from '@solana/web3.js';
import * as bs58 from 'bs58';
import * as fs from 'fs';
import * as path from 'path';

export class WalletManager {
  private wallets: Keypair[] = [];

  constructor() {
    this.loadWallets();
  }

  private loadWallets(): void {
    // Try loading from environment variable first
    const privateKeysEnv = process.env.WALLET_PRIVATE_KEYS;
    if (privateKeysEnv) {
      const keys = privateKeysEnv.split(',').map(k => k.trim()).filter(k => k.length > 0);
      for (const key of keys) {
        try {
          const keypair = Keypair.fromSecretKey(bs58.decode(key));
          this.wallets.push(keypair);
        } catch (error) {
          console.error(`Failed to load wallet from env: ${error}`);
        }
      }
    }

    // Try loading from file
    const walletFilePath = process.env.WALLET_FILE_PATH;
    if (walletFilePath && fs.existsSync(walletFilePath)) {
      try {
        const content = fs.readFileSync(walletFilePath, 'utf-8');
        const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
        for (const line of lines) {
          try {
            const keypair = Keypair.fromSecretKey(bs58.decode(line));
            this.wallets.push(keypair);
          } catch (error) {
            console.error(`Failed to load wallet from file line: ${error}`);
          }
        }
      } catch (error) {
        console.error(`Failed to read wallet file: ${error}`);
      }
    }

    if (this.wallets.length === 0) {
      throw new Error('No wallets loaded. Please provide WALLET_PRIVATE_KEYS or WALLET_FILE_PATH in .env');
    }

    console.log(`Loaded ${this.wallets.length} wallet(s)`);
  }

  getRandomWallet(): Keypair {
    if (this.wallets.length === 0) {
      throw new Error('No wallets available');
    }
    const randomIndex = Math.floor(Math.random() * this.wallets.length);
    return this.wallets[randomIndex];
  }

  getAllWallets(): Keypair[] {
    return [...this.wallets];
  }

  getWallets(maxCount: number): Keypair[] {
    const shuffled = [...this.wallets].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(maxCount, shuffled.length));
  }

  getWalletCount(): number {
    return this.wallets.length;
  }
}
