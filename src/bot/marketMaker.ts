import { Connection, PublicKey } from '@solana/web3.js';
import { WalletManager } from '../utils/wallet';
import { JupiterService } from '../services/jupiter';
import { BotConfig } from '../types/config';
import { randomFloat, randomInterval } from '../utils/random';

export class MarketMakerBot {
  private connection: Connection;
  private walletManager: WalletManager;
  private jupiterService: JupiterService;
  private config: BotConfig;
  private isRunning: boolean = false;
  private buyTimer?: NodeJS.Timeout;
  private sellTimer?: NodeJS.Timeout;
  private activeWallets: Set<string> = new Set();

  constructor(connection: Connection, walletManager: WalletManager, jupiterService: JupiterService, config: BotConfig) {
    this.connection = connection;
    this.walletManager = walletManager;
    this.jupiterService = jupiterService;
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Bot is already running');
      return;
    }

    if (!this.config.enabled) {
      console.log('Bot is disabled in configuration');
      return;
    }

    console.log('Starting Market Maker Bot...');
    console.log(`Token: ${this.config.trading.tokenMintAddress}`);
    console.log(`Base Token: ${this.config.trading.baseTokenMintAddress}`);
    console.log(`Using up to ${this.config.trading.maxWalletsToUse} wallets`);

    this.isRunning = true;
    this.scheduleNextBuy();
    this.scheduleNextSell();
  }

  stop(): void {
    console.log('Stopping Market Maker Bot...');
    this.isRunning = false;
    
    if (this.buyTimer) {
      clearTimeout(this.buyTimer);
      this.buyTimer = undefined;
    }
    
    if (this.sellTimer) {
      clearTimeout(this.sellTimer);
      this.sellTimer = undefined;
    }
  }

  private scheduleNextBuy(): void {
    if (!this.isRunning) return;

    const interval = randomInterval(
      this.config.trading.buyIntervalMin,
      this.config.trading.buyIntervalMax
    );

    console.log(`Next buy scheduled in ${interval / 1000} seconds`);

    this.buyTimer = setTimeout(() => {
      this.executeBuy();
      this.scheduleNextBuy();
    }, interval);
  }

  private scheduleNextSell(): void {
    if (!this.isRunning) return;

    const interval = randomInterval(
      this.config.trading.sellIntervalMin,
      this.config.trading.sellIntervalMax
    );

    console.log(`Next sell scheduled in ${interval / 1000} seconds`);

    this.sellTimer = setTimeout(() => {
      this.executeSell();
      this.scheduleNextSell();
    }, interval);
  }

  private async executeBuy(): Promise<void> {
    try {
      const wallet = this.walletManager.getRandomWallet();
      const walletAddress = wallet.publicKey.toString();

      // Check if wallet is already active
      if (this.activeWallets.has(walletAddress)) {
        console.log(`Wallet ${walletAddress} is busy, skipping buy`);
        return;
      }

      this.activeWallets.add(walletAddress);

      const amount = randomFloat(
        this.config.trading.minBuyAmount,
        this.config.trading.maxBuyAmount
      );

      console.log(`\n[BUY] Wallet: ${walletAddress.substring(0, 8)}...`);
      console.log(`[BUY] Amount: ${amount} SOL`);

      const signature = await this.jupiterService.buyToken(
        wallet,
        this.config.trading.baseTokenMintAddress,
        this.config.trading.tokenMintAddress,
        amount,
        this.config.trading.slippageBps
      );

      if (signature) {
        console.log(`[BUY] Success! Signature: ${signature}`);
      } else {
        console.log(`[BUY] Failed`);
      }

      this.activeWallets.delete(walletAddress);
    } catch (error: any) {
      console.error(`[BUY] Error: ${error.message}`);
    }
  }

  private async executeSell(): Promise<void> {
    try {
      const wallet = this.walletManager.getRandomWallet();
      const walletAddress = wallet.publicKey.toString();

      // Check if wallet is already active
      if (this.activeWallets.has(walletAddress)) {
        console.log(`Wallet ${walletAddress} is busy, skipping sell`);
        return;
      }

      this.activeWallets.add(walletAddress);

      // Check token balance first
      const tokenMint = new PublicKey(this.config.trading.tokenMintAddress);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        wallet.publicKey,
        { mint: tokenMint }
      );

      if (tokenAccounts.value.length === 0) {
        console.log(`[SELL] Wallet ${walletAddress.substring(0, 8)}... has no tokens to sell`);
        this.activeWallets.delete(walletAddress);
        return;
      }

      const tokenAccount = tokenAccounts.value[0];
      const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
      const decimals = tokenAccount.account.data.parsed.info.tokenAmount.decimals;

      if (balance === 0 || balance === null) {
        console.log(`[SELL] Wallet ${walletAddress.substring(0, 8)}... has zero balance`);
        this.activeWallets.delete(walletAddress);
        return;
      }

      // Use a random amount between min and max, but not more than available
      const maxSellAmount = Math.min(
        this.config.trading.maxSellAmount,
        balance
      );
      const minSellAmount = Math.min(
        this.config.trading.minSellAmount,
        balance
      );

      if (maxSellAmount < minSellAmount) {
        console.log(`[SELL] Wallet ${walletAddress.substring(0, 8)}... balance too low`);
        this.activeWallets.delete(walletAddress);
        return;
      }

      const amount = randomFloat(minSellAmount, maxSellAmount);

      console.log(`\n[SELL] Wallet: ${walletAddress.substring(0, 8)}...`);
      console.log(`[SELL] Balance: ${balance} tokens`);
      console.log(`[SELL] Amount: ${amount} tokens`);

      const signature = await this.jupiterService.sellToken(
        wallet,
        this.config.trading.tokenMintAddress,
        this.config.trading.baseTokenMintAddress,
        amount,
        this.config.trading.slippageBps,
        decimals
      );

      if (signature) {
        console.log(`[SELL] Success! Signature: ${signature}`);
      } else {
        console.log(`[SELL] Failed`);
      }

      this.activeWallets.delete(walletAddress);
    } catch (error: any) {
      console.error(`[SELL] Error: ${error.message}`);
    }
  }

  getStatus(): { isRunning: boolean; activeWallets: number } {
    return {
      isRunning: this.isRunning,
      activeWallets: this.activeWallets.size,
    };
  }
}
