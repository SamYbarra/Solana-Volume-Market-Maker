import dotenv from 'dotenv';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import type { Config } from './types.js';

dotenv.config();

export const config: Config = {
  // Solana RPC
  rpcUrl: process.env.RPC_URL || clusterApiUrl('mainnet-beta'),
  useDevnet: process.env.USE_DEVNET === 'true',
  
  // Wallet Configuration
  walletPrivateKeys: process.env.WALLET_PRIVATE_KEYS?.split(',').map(key => key.trim()) || [],  
  // Trading Configuration
  minBuyAmountSol: parseFloat(process.env.MIN_BUY_AMOUNT_SOL || '0.1'),
  maxBuyAmountSol: parseFloat(process.env.MAX_BUY_AMOUNT_SOL || '1.0'),
  minSellAmountSol: parseFloat(process.env.MIN_SELL_AMOUNT_SOL || '0.1'),
  maxSellAmountSol: parseFloat(process.env.MAX_SELL_AMOUNT_SOL || '1.0'),  
  // Market Cap Limits
  minMarketCapSol: parseFloat(process.env.MIN_MARKET_CAP_SOL || '1000'),
  maxMarketCapSol: parseFloat(process.env.MAX_MARKET_CAP_SOL || '100000'),  
  // Trading Behavior
  minTradeDelaySeconds: parseInt(process.env.MIN_TRADE_DELAY_SECONDS || '5', 10),
  maxTradeDelaySeconds: parseInt(process.env.MAX_TRADE_DELAY_SECONDS || '30', 10),
  randomizeTradeSize: process.env.RANDOMIZE_TRADE_SIZE !== 'false',
  randomizeTradeTiming: process.env.RANDOMIZE_TRADE_TIMING !== 'false',  
  // Token Configuration
  tokenAddress: process.env.TOKEN_ADDRESS || '',
  
  // Chart Configuration
  chartUpdateIntervalSeconds: parseInt(process.env.CHART_UPDATE_INTERVAL_SECONDS || '60', 10),
  chartOutputDir: process.env.CHART_OUTPUT_DIR || 'charts',  
  // Bot Control
  enableBuy: process.env.ENABLE_BUY !== 'false',
  enableSell: process.env.ENABLE_SELL !== 'false',
  tradingEnabled: process.env.TRADING_ENABLED !== 'false',  
  // Health Check
  healthCheckIntervalSeconds: parseInt(process.env.HEALTH_CHECK_INTERVAL_SECONDS || '300', 10),
};

// Create Solana connection
export const connection = new Connection(
  config.useDevnet ? clusterApiUrl('devnet') : config.rpcUrl,
  'confirmed'
);

// Validate configuration
export function validateConfig(): void {
  const errors: string[] = [];
  
  if (config.walletPrivateKeys.length === 0) {
    errors.push('No wallet private keys configured');
  }
  
  if (!config.tokenAddress) {
    errors.push('Token address not configured');
  }
  
  if (config.minBuyAmountSol >= config.maxBuyAmountSol) {
    errors.push('MIN_BUY_AMOUNT_SOL must be less than MAX_BUY_AMOUNT_SOL');
  }
  
  if (config.minSellAmountSol >= config.maxSellAmountSol) {
    errors.push('MIN_SELL_AMOUNT_SOL must be less than MAX_SELL_AMOUNT_SOL');
  }
  
  if (config.minMarketCapSol >= config.maxMarketCapSol) {
    errors.push('MIN_MARKET_CAP_SOL must be less than MAX_MARKET_CAP_SOL');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}
