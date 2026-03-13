/**
 * Type definitions for Pumpfun Market Maker
 */

import { Keypair, PublicKey } from '@solana/web3.js';

export interface Config {
  rpcUrl: string;
  useDevnet: boolean;
  walletPrivateKeys: string[];
  minBuyAmountSol: number;
  maxBuyAmountSol: number;
  minSellAmountSol: number;
  maxSellAmountSol: number;
  minMarketCapSol: number;
  maxMarketCapSol: number;
  minTradeDelaySeconds: number;
  maxTradeDelaySeconds: number;
  randomizeTradeSize: boolean;
  randomizeTradeTiming: boolean;
  tokenAddress: string;
  chartUpdateIntervalSeconds: number;
  chartOutputDir: string;
  enableBuy: boolean;
  enableSell: boolean;
  tradingEnabled: boolean;
  healthCheckIntervalSeconds: number;
}

export interface TokenPriceData {
  price: number;
  marketCap: number;
  volume24h: number;
}

export interface TradeResult {
  success: boolean;
  signature?: string;
  wallet: string;
  amountSol: number;
  type: 'buy' | 'sell';
  error?: string;
}

export interface TradeStats {
  totalBuys: number;
  totalSells: number;
  successfulBuys: number;
  successfulSells: number;
  totalVolumeSol: number;
  trades: TradeRecord[];
  buySuccessRate: string;
  sellSuccessRate: string;
}

export interface TradeRecord extends TradeResult {
  timestamp: Date;
}

export interface ShouldTradeResult {
  canBuy: boolean;
  canSell: boolean;
  marketCap: number;
  price: number;
}

export interface ChartDataPoint {
  timestamp: string;
  balance: number;
  trades: number;
  marketCap: number;
  volume: number;
}
