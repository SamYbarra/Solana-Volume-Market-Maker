export interface TradingConfig {
  tokenMintAddress: string;
  baseTokenMintAddress: string;
  minBuyAmount: number;
  maxBuyAmount: number;
  minSellAmount: number;
  maxSellAmount: number;
  buyIntervalMin: number;
  buyIntervalMax: number;
  sellIntervalMin: number;
  sellIntervalMax: number;
  slippageBps: number;
  maxWalletsToUse: number;
}

export interface SolanaConfig {
  rpcUrl: string;
}

export interface JupiterConfig {
  apiUrl: string;
}

export interface BotConfig {
  enabled: boolean;
  trading: TradingConfig;
  solana: SolanaConfig;
  jupiter: JupiterConfig;
}
