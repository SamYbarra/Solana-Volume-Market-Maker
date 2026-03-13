import { config, validateConfig } from './config.js';
import { WalletManager } from './wallet.js';
import { TradingEngine } from './trading.js';
import { HealthChart } from './chart.js';

class PumpfunMarketMaker {
  private walletManager: WalletManager | null = null;
  private tradingEngine: TradingEngine | null = null;
  private healthChart: HealthChart | null = null;
  private isRunning: boolean = false;
  private chartIntervalId: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Pumpfun Market Maker...\n');
    
    // Validate configuration
    try {
      validateConfig();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Configuration error:', errorMessage);
      process.exit(1);
    }

    // Initialize wallet manager
    console.log(`💼 Wallet: Loading ${config.walletPrivateKeys.length} wallet(s)...`);
    this.walletManager = new WalletManager(config.walletPrivateKeys);
    
    // Check wallet balances
    const balances = await this.walletManager.getAllBalances();
    const totalBalance = balances.reduce((sum, b) => sum + b, 0);
    console.log(`💰 Total balance across all wallets: ${totalBalance.toFixed(4)} SOL\n`);
    
    balances.forEach((balance, index) => {
      const wallet = this.walletManager!.getAllWallets()[index];
      console.log(`   Wallet ${index + 1}: ${wallet.publicKey.toString().substring(0, 8)}... - ${balance.toFixed(4)} SOL`);
    });
    console.log('');

    // Initialize trading engine
    this.tradingEngine = new TradingEngine(this.walletManager);
    
    // Set token address if configured
    if (config.tokenAddress) {
      this.tradingEngine.traderInstance.setTokenAddress(config.tokenAddress);
      console.log(`🎯 Token address: ${config.tokenAddress}\n`);
    }

    // Initialize health chart
    this.healthChart = new HealthChart(config.chartOutputDir);
    console.log(`📊 Chart output directory: ${config.chartOutputDir}\n`);

    // Display configuration
    console.log('⚙️  Configuration:');
    console.log(`   Buy range: ${config.minBuyAmountSol} - ${config.maxBuyAmountSol} SOL`);
    console.log(`   Sell range: ${config.minSellAmountSol} - ${config.maxSellAmountSol} SOL`);
    console.log(`   Market cap range: ${config.minMarketCapSol} - ${config.maxMarketCapSol} SOL`);
    console.log(`   Trade delay: ${config.minTradeDelaySeconds} - ${config.maxTradeDelaySeconds} seconds`);
    console.log(`   Randomize size: ${config.randomizeTradeSize}`);
    console.log(`   Randomize timing: ${config.randomizeTradeTiming}`);
    console.log(`   Buy enabled: ${config.enableBuy}`);
    console.log(`   Sell enabled: ${config.enableSell}\n`);
  }

  async executeTradingCycle(): Promise<void> {
    if (!this.isRunning || !this.tradingEngine || !this.walletManager || !this.healthChart) return;

    try {
      // Get current market data
      const shouldTrade = await this.tradingEngine.traderInstance.shouldTrade();
      
      // Decide what trade to make
      const tradeType = await this.tradingEngine.decideTrade();
      
      if (tradeType === 'buy') {
        await this.tradingEngine.executeBuy();
      } else if (tradeType === 'sell') {
        await this.tradingEngine.executeSell();
      } else {
        console.log('⏸️  No trade executed (market conditions or randomization)');
      }

      // Update health chart data
      const totalBalance = await this.walletManager.getTotalBalance();
      const stats = this.tradingEngine.getStats();
      const totalTrades = stats.totalBuys + stats.totalSells;
      
      this.healthChart.addDataPoint(
        totalBalance,
        totalTrades,
        shouldTrade.marketCap,
        shouldTrade.price * 1000 // Mock volume
      );

    } catch (error) {
      console.error('❌ Error in trading cycle:', error);
    }
  }

  async updateChart(): Promise<void> {
    if (!this.isRunning || !this.walletManager || !this.tradingEngine || !this.healthChart) return;

    try {
      const totalBalance = await this.walletManager.getTotalBalance();
      const stats = this.tradingEngine.getStats();
      const shouldTrade = await this.tradingEngine.traderInstance.shouldTrade();
      
      await this.healthChart.generateChart(
        stats,
        totalBalance,
        shouldTrade.marketCap,
        shouldTrade.price
      );
      
      // Also generate stats chart periodically
      if (stats.totalBuys + stats.totalSells > 0) {
        await this.healthChart.generateStatsChart(stats);
      }
    } catch (error) {
      console.error('❌ Error updating chart:', error);
    }
  }

  async printStats(): Promise<void> {
    if (!this.walletManager || !this.tradingEngine) return;

    const stats = this.tradingEngine.getStats();
    const totalBalance = await this.walletManager.getTotalBalance();
    const shouldTrade = await this.tradingEngine.traderInstance.shouldTrade();
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 MARKET MAKER STATISTICS');
    console.log('='.repeat(60));
    console.log(`Total Balance: ${totalBalance.toFixed(4)} SOL`);
    console.log(`Market Cap: ${shouldTrade.marketCap.toFixed(2)} SOL`);
    console.log(`Token Price: ${shouldTrade.price.toFixed(8)} SOL`);
    console.log(`Total Buys: ${stats.totalBuys} (${stats.buySuccessRate}% success)`);
    console.log(`Total Sells: ${stats.totalSells} (${stats.sellSuccessRate}% success)`);
    console.log(`Total Volume: ${stats.totalVolumeSol.toFixed(4)} SOL`);
    console.log(`Total Trades: ${stats.totalBuys + stats.totalSells}`);
    console.log('='.repeat(60) + '\n');
  }

  start(): void {
    if (this.isRunning) {
      console.log('⚠️  Bot is already running');
      return;
    }

    if (!config.tradingEnabled) {
      console.log('⚠️  Trading is disabled in configuration');
      return;
    }

    console.log('✅ Starting market maker bot...\n');
    this.isRunning = true;

    // Main trading loop - execute trades with random intervals
    const runTradingCycle = async (): Promise<void> => {
      if (!this.isRunning) return;
      
      await this.executeTradingCycle();
      
      // Schedule next cycle with random delay
      const delay = config.minTradeDelaySeconds * 1000 + 
        Math.random() * (config.maxTradeDelaySeconds - config.minTradeDelaySeconds) * 1000;
      
      setTimeout(() => {
        runTradingCycle().catch(console.error);
      }, delay);
    };

    // Start trading cycle
    runTradingCycle().catch(console.error);

    // Update chart periodically
    this.chartIntervalId = setInterval(() => {
      this.updateChart().catch(console.error);
    }, config.chartUpdateIntervalSeconds * 1000);

    // Print stats periodically
    setInterval(() => {
      this.printStats().catch(console.error);
    }, config.healthCheckIntervalSeconds * 1000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down gracefully...');
      this.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n\n🛑 Shutting down gracefully...');
      this.stop();
      process.exit(0);
    });
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('⏹️  Stopping market maker bot...');
    this.isRunning = false;

    if (this.chartIntervalId) {
      clearInterval(this.chartIntervalId);
      this.chartIntervalId = null;
    }

    // Generate final chart
    this.updateChart().catch(console.error);
    this.printStats().catch(console.error);
  }
}

// Main execution
async function main(): Promise<void> {
  const bot = new PumpfunMarketMaker();
  
  try {
    await bot.initialize();
    bot.start();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.includes('index.ts') ||
                     import.meta.url.includes('index.js');
if (isMainModule) {
  main().catch(console.error);
}

export { PumpfunMarketMaker };
