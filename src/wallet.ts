import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { connection } from './config.js';

export class WalletManager {
  private wallets: Keypair[];
  private currentIndex: number;

  constructor(privateKeys: string[]) {
    this.wallets = privateKeys.map(key => {
      try {
        // Try base58 decode first
        const decoded = bs58.decode(key.trim());
        return Keypair.fromSecretKey(decoded);
      } catch (e) {
        // Try hex format
        try {
          const hexKey = key.trim();
          const keyArray = hexKey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16));
          if (!keyArray) {
            throw new Error(`Invalid private key format: ${key.substring(0, 10)}...`);
          }
          return Keypair.fromSecretKey(Uint8Array.from(keyArray));
        } catch (e2) {
          throw new Error(`Invalid private key format: ${key.substring(0, 10)}...`);
        }
      }
    });
    this.currentIndex = 0;
  }

  getWallet(): Keypair {
    const wallet = this.wallets[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.wallets.length;
    return wallet;
  }

  getRandomWallet(): Keypair {
    const randomIndex = Math.floor(Math.random() * this.wallets.length);
    return this.wallets[randomIndex];
  }

  getAllWallets(): Keypair[] {
    return this.wallets;
  }

  async getBalance(wallet: Keypair): Promise<number> {
    try {
      const balance = await connection.getBalance(wallet.publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error(`Error getting balance for wallet ${wallet.publicKey.toString()}:`, error);
      return 0;
    }
  }

  async getAllBalances(): Promise<number[]> {
    const balances = await Promise.all(
      this.wallets.map(wallet => this.getBalance(wallet))
    );
    return balances;
  }

  async getTotalBalance(): Promise<number> {
    const balances = await this.getAllBalances();
    return balances.reduce((sum, balance) => sum + balance, 0);
  }
}
