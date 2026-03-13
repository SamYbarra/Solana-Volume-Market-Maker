import * as dotenv from 'dotenv';
import { BotConfig, TradingConfig, SolanaConfig, JupiterConfig } from '../types/config';

dotenv.config();

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseFloat(value) : defaultValue;
}

function getEnvString(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

export function loadConfig(): BotConfig {
  const tradingConfig: TradingConfig = {
    tokenMintAddress: getEnvString('TOKEN_MINT_ADDRESS', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    baseTokenMintAddress: getEnvString('BASE_TOKEN_MINT_ADDRESS', 'So11111111111111111111111111111111111111112'),
    minBuyAmount: getEnvNumber('MIN_BUY_AMOUNT', 0.01),
    maxBuyAmount: getEnvNumber('MAX_BUY_AMOUNT', 1.0),
    minSellAmount: getEnvNumber('MIN_SELL_AMOUNT', 0.01),
    maxSellAmount: getEnvNumber('MAX_SELL_AMOUNT', 1.0),
    buyIntervalMin: getEnvNumber('BUY_INTERVAL_MIN', 30),
    buyIntervalMax: getEnvNumber('BUY_INTERVAL_MAX', 300),
    sellIntervalMin: getEnvNumber('SELL_INTERVAL_MIN', 30),
    sellIntervalMax: getEnvNumber('SELL_INTERVAL_MAX', 300),
    slippageBps: getEnvNumber('SLIPPAGE_BPS', 50),
    maxWalletsToUse: getEnvNumber('MAX_WALLETS_TO_USE', 5),
  };

  const solanaConfig: SolanaConfig = {
    rpcUrl: getEnvString('RPC_URL', 'https://api.mainnet-beta.solana.com'),
  };

  const jupiterConfig: JupiterConfig = {
    apiUrl: getEnvString('JUPITER_API_URL', 'https://quote-api.jup.ag/v6'),
  };

  return {
    enabled: getEnvBoolean('ENABLED', true),
    trading: tradingConfig,
    solana: solanaConfig,
    jupiter: jupiterConfig,
  };
}
