import { 
  Transaction, 
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  TransactionInstruction
} from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import { connection, config } from './config.js';
import { WalletManager } from './wallet.js';
import type { TokenPriceData, TradeResult, ShouldTradeResult } from './types.js';

// Pumpfun program ID (update with actual program ID)
const PUMPFUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');

export class PumpfunTrader {
  private walletManager: WalletManager;
  private tokenAddress: PublicKey | null;

  constructor(walletManager: WalletManager) {
    this.walletManager = walletManager;
    this.tokenAddress = null;
    if (config.tokenAddress) {
      this.tokenAddress = new PublicKey(config.tokenAddress);
    }
  }

  setTokenAddress(tokenAddress: string): void {
    this.tokenAddress = new PublicKey(tokenAddress);
  }

  async getTokenPrice(): Promise<TokenPriceData> {
    // This is a placeholder - you'll need to implement actual price fetching
    // from Pumpfun API or on-chain data
    try {
      if (!this.tokenAddress) {
        throw new Error('Token address not set');
      }
      // Mock implementation - replace with actual Pumpfun API call
      const response = await fetch(`https://pump.fun/api/token/${this.tokenAddress.toString()}`);
      if (response.ok) {
        const data = await response.json() as Partial<TokenPriceData>;
        return {
          price: data.price || 0,
          marketCap: data.marketCap || 0,
          volume24h: data.volume24h || 0
        };
      }
    } catch (error) {
      console.error('Error fetching token price:', error);
    }
    
    // Fallback: return mock data
    return {
      price: 0.0001,
      marketCap: 50000,
      volume24h: 10000
    };
  }

  async buy(amountSol: number, wallet: any = null): Promise<TradeResult> {
    if (!this.tokenAddress) {
      throw new Error('Token address not set');
    }

    const traderWallet = wallet || this.walletManager.getRandomWallet();
    const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

    try {
      // Get associated token account
      const tokenMint = this.tokenAddress;
      const associatedTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        traderWallet.publicKey
      );

      const transaction = new Transaction();

      // Check if token account exists
      try {
        await getAccount(connection, associatedTokenAccount);
      } catch (e) {
        // Create associated token account if it doesn't exist
        transaction.add(
          createAssociatedTokenAccountInstruction(
            traderWallet.publicKey,
            associatedTokenAccount,
            traderWallet.publicKey,
            tokenMint
          )
        );
      }

      // Add buy instruction (simplified - actual Pumpfun buy instruction structure may differ)
      // This is a placeholder - you'll need to construct the actual instruction
      // based on Pumpfun's program interface
      const buyInstruction = new TransactionInstruction({
        keys: [
          { pubkey: traderWallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: associatedTokenAccount, isSigner: false, isWritable: true },
          { pubkey: tokenMint, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PUMPFUN_PROGRAM_ID,
        data: Buffer.from([]), // Actual instruction data needed here
      });
      transaction.add(buyInstruction);

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = traderWallet.publicKey;

      // Sign and send transaction
      transaction.sign(traderWallet);
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [traderWallet],
        { commitment: 'confirmed' }
      );

      return {
        success: true,
        signature,
        wallet: traderWallet.publicKey.toString(),
        amountSol,
        type: 'buy'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Buy error:', error);
      return {
        success: false,
        error: errorMessage,
        wallet: traderWallet.publicKey.toString(),
        amountSol,
        type: 'buy'
      };
    }
  }

  async sell(amountSol: number, wallet: any = null): Promise<TradeResult> {
    if (!this.tokenAddress) {
      throw new Error('Token address not set');
    }

    const traderWallet = wallet || this.walletManager.getRandomWallet();
    const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

    try {
      const tokenMint = this.tokenAddress;
      const associatedTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        traderWallet.publicKey
      );

      // Check token balance
      const tokenAccount = await getAccount(connection, associatedTokenAccount);
      if (tokenAccount.amount === BigInt(0)) {
        throw new Error('No tokens to sell');
      }

      const transaction = new Transaction();

      // Add sell instruction (simplified - actual Pumpfun sell instruction structure may differ)
      const sellInstruction = new TransactionInstruction({
        keys: [
          { pubkey: traderWallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: associatedTokenAccount, isSigner: false, isWritable: true },
          { pubkey: tokenMint, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PUMPFUN_PROGRAM_ID,
        data: Buffer.from([]), // Actual instruction data needed here
      });
      transaction.add(sellInstruction);

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = traderWallet.publicKey;

      transaction.sign(traderWallet);
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [traderWallet],
        { commitment: 'confirmed' }
      );

      return {
        success: true,
        signature,
        wallet: traderWallet.publicKey.toString(),
        amountSol,
        type: 'sell'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Sell error:', error);
      return {
        success: false,
        error: errorMessage,
        wallet: traderWallet.publicKey.toString(),
        amountSol,
        type: 'sell'
      };
    }
  }

  async shouldTrade(): Promise<ShouldTradeResult> {
    const priceData = await this.getTokenPrice();
    return {
      canBuy: priceData.marketCap >= config.minMarketCapSol && 
              priceData.marketCap <= config.maxMarketCapSol,
      canSell: priceData.marketCap >= config.minMarketCapSol && 
               priceData.marketCap <= config.maxMarketCapSol,
      marketCap: priceData.marketCap,
      price: priceData.price
    };
  }
}
