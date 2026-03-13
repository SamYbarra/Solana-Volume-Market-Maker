import { config } from './config.js';
import { PumpfunTrader } from './pumpfun.js';
import { WalletManager } from './wallet.js';
import type { TradeResult, TradeStats, TradeRecord } from './types.js';

export class TradingEngine {
  private trader: PumpfunTrader;
  private stats: TradeStats;

  constructor(walletManager: WalletManager) {
    this.trader = new PumpfunTrader(walletManager);
    this.stats = {
      totalBuys: 0,
      totalSells: 0,
      successfulBuys: 0,
      successfulSells: 0,
      totalVolumeSol: 0,
      trades: [],
      buySuccessRate: '0',
      sellSuccessRate: '0'
    };
  }

  get traderInstance(): PumpfunTrader {
    return this.trader;
  }

  // Randomize trade amount to act like real traders
  randomizeAmount(minAmount: number, maxAmount: number): number {
    if (!config.randomizeTradeSize) {
      return (minAmount + maxAmount) / 2;
    }
    
    // Use normal distribution around the middle with some randomness
    const mean = (minAmount + maxAmount) / 2;
    const range = maxAmount - minAmount;
    const stdDev = range / 4;
    
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    let amount = mean + z0 * stdDev;
    
    // Clamp to bounds
    amount = Math.max(minAmount, Math.min(maxAmount, amount));
    
    // Add some additional small random variation
    const variation = (Math.random() - 0.5) * range * 0.1;
    amount += variation;
    
    return Math.max(minAmount, Math.min(maxAmount, amount));
  }

  // Randomize delay to act like real traders
  async randomDelay(): Promise<void> {
    if (!config.randomizeTradeTiming) {
      return;
    }
    
    const delayMs = (config.minTradeDelaySeconds + 
      Math.random() * (config.maxTradeDelaySeconds - config.minTradeDelaySeconds)) * 1000;
    
    // Add some human-like variation (sometimes faster, sometimes slower)
    const variation = (Math.random() - 0.5) * delayMs * 0.3;
    const finalDelay = Math.max(1000, delayMs + variation);
    
    await new Promise(resolve => setTimeout(resolve, finalDelay));
  }

  async executeBuy(): Promise<TradeResult | null> {
    if (!config.enableBuy || !config.tradingEnabled) {
      return null;
    }

    await this.randomDelay();

    const shouldTrade = await this.trader.shouldTrade();
    if (!shouldTrade.canBuy) {
      console.log(`Skipping buy - market cap ${shouldTrade.marketCap} outside range`);
      return null;
    }

    const amount = this.randomizeAmount(config.minBuyAmountSol, config.maxBuyAmountSol);
    
    console.log(`Executing BUY: ${amount.toFixed(4)} SOL`);
    
    const result = await this.trader.buy(amount);
    
    this.stats.totalBuys++;
    if (result.success) {
      this.stats.successfulBuys++;
      this.stats.totalVolumeSol += amount;
    }
    
    const tradeRecord: TradeRecord = {
      ...result,
      timestamp: new Date(),
      amountSol: amount
    };
    this.stats.trades.push(tradeRecord);

    return result;
  }

  async executeSell(): Promise<TradeResult | null> {
    if (!config.enableSell || !config.tradingEnabled) {
      return null;
    }

    await this.randomDelay();

    const shouldTrade = await this.trader.shouldTrade();
    if (!shouldTrade.canSell) {
      console.log(`Skipping sell - market cap ${shouldTrade.marketCap} outside range`);
      return null;
    }

    const amount = this.randomizeAmount(config.minSellAmountSol, config.maxSellAmountSol);
    
    console.log(`Executing SELL: ${amount.toFixed(4)} SOL`);
    
    const result = await this.trader.sell(amount);
    
    this.stats.totalSells++;
    if (result.success) {
      this.stats.successfulSells++;
      this.stats.totalVolumeSol += amount;
    }
    
    const tradeRecord: TradeRecord = {
      ...result,
      timestamp: new Date(),
      amountSol: amount
    };
    this.stats.trades.push(tradeRecord);

    return result;
  }

  getStats(): TradeStats {
    return {
      ...this.stats,
      buySuccessRate: this.stats.totalBuys > 0 
        ? (this.stats.successfulBuys / this.stats.totalBuys * 100).toFixed(2) 
        : '0',
      sellSuccessRate: this.stats.totalSells > 0 
        ? (this.stats.successfulSells / this.stats.totalSells * 100).toFixed(2) 
        : '0'
    };
  }

  // Decide whether to buy or sell (simulate real trader behavior)
  async decideTrade(): Promise<'buy' | 'sell' | null> {
    const shouldTrade = await this.trader.shouldTrade();
    
    // Random decision with some logic
    const random = Math.random();
    
    // 60% chance to buy, 40% chance to sell (adjustable)
    if (random < 0.6 && shouldTrade.canBuy) {
      return 'buy';
    } else if (shouldTrade.canSell) {
      return 'sell';
    }
    
    return null;
  }
}
