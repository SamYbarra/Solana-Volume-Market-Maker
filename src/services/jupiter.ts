import { Connection, Keypair, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import axios, { AxiosInstance } from 'axios';
import { JupiterConfig } from '../types/config';

export interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: any;
  priceImpactPct: string;
  routePlan: any[];
  contextSlot: number;
  timeTaken: number;
}

export interface JupiterSwapResponse {
  swapTransaction: string;
}

export class JupiterService {
  private apiClient: AxiosInstance;
  private connection: Connection;

  constructor(connection: Connection, config: JupiterConfig) {
    this.connection = connection;
    this.apiClient = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
    });
  }

  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number,
    decimals: number = 9
  ): Promise<JupiterQuote | null> {
    try {
      const inputMintPubkey = new PublicKey(inputMint);
      const outputMintPubkey = new PublicKey(outputMint);

      // Convert amount to smallest unit based on decimals
      const amountInSmallestUnit = Math.floor(amount * Math.pow(10, decimals));

      const response = await this.apiClient.get('/quote', {
        params: {
          inputMint: inputMintPubkey.toString(),
          outputMint: outputMintPubkey.toString(),
          amount: amountInSmallestUnit.toString(),
          slippageBps: slippageBps,
          onlyDirectRoutes: false,
          asLegacyTransaction: false,
        },
      });

      if (response.data) {
        return response.data as JupiterQuote;
      }

      return null;
    } catch (error: any) {
      console.error('Error getting Jupiter quote:', error.response?.data || error.message);
      return null;
    }
  }

  async getSwapTransaction(
    quote: JupiterQuote,
    userPublicKey: PublicKey,
    wrapUnwrapSOL: boolean = true
  ): Promise<VersionedTransaction | null> {
    try {
      const response = await this.apiClient.post('/swap', {
        quoteResponse: quote,
        userPublicKey: userPublicKey.toString(),
        wrapUnwrapSOL: wrapUnwrapSOL,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      });

      if (response.data && response.data.swapTransaction) {
        const swapTransactionBuf = Buffer.from(response.data.swapTransaction, 'base64');
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
        return transaction;
      }

      return null;
    } catch (error: any) {
      console.error('Error getting swap transaction:', error.message);
      return null;
    }
  }

  async executeSwap(
    wallet: Keypair,
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number,
    decimals: number = 9
  ): Promise<string | null> {
    try {
      // Get quote
      const quote = await this.getQuote(inputMint, outputMint, amount, slippageBps, decimals);
      if (!quote) {
        console.error('Failed to get quote');
        return null;
      }

      const inAmountFormatted = (parseInt(quote.inAmount) / Math.pow(10, decimals)).toFixed(4);
      const outAmountFormatted = (parseInt(quote.outAmount) / Math.pow(10, decimals)).toFixed(4);
      console.log(`Quote: ${inAmountFormatted} -> ${outAmountFormatted} (${quote.priceImpactPct}% impact)`);

      // Get swap transaction
      const swapTransaction = await this.getSwapTransaction(quote, wallet.publicKey);
      if (!swapTransaction) {
        console.error('Failed to get swap transaction');
        return null;
      }

      // Sign transaction
      swapTransaction.sign([wallet]);

      // Send transaction
      const signature = await this.connection.sendRawTransaction(swapTransaction.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        console.error('Transaction failed:', confirmation.value.err);
        return null;
      }

      console.log(`Swap executed successfully: ${signature}`);
      return signature;
    } catch (error: any) {
      console.error('Error executing swap:', error.message);
      if (error.response) {
        console.error('API Error:', error.response.data);
      }
      return null;
    }
  }

  async buyToken(
    wallet: Keypair,
    baseTokenMint: string,
    tokenMint: string,
    solAmount: number,
    slippageBps: number
  ): Promise<string | null> {
    // SOL has 9 decimals
    return this.executeSwap(wallet, baseTokenMint, tokenMint, solAmount, slippageBps, 9);
  }

  async sellToken(
    wallet: Keypair,
    tokenMint: string,
    baseTokenMint: string,
    tokenAmount: number,
    slippageBps: number,
    tokenDecimals: number
  ): Promise<string | null> {
    // Use the token's decimals for the input amount
    return this.executeSwap(wallet, tokenMint, baseTokenMint, tokenAmount, slippageBps, tokenDecimals);
  }
}
