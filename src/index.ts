import { Connection } from '@solana/web3.js';
import { loadConfig } from './config';
import { WalletManager } from './utils/wallet';
import { JupiterService } from './services/jupiter';
import { MarketMakerBot } from './bot/marketMaker';

async function main() {
  console.log('=== Solana Volume Market Maker Bot ===\n');

  try {
    // Load configuration
    const config = loadConfig();
    console.log('Configuration loaded successfully');

    // Initialize Solana connection
    const connection = new Connection(config.solana.rpcUrl, 'confirmed');
    console.log(`Connected to Solana RPC: ${config.solana.rpcUrl}`);

    // Check connection
    const version = await connection.getVersion();
    console.log(`Solana version: ${version['solana-core']}`);

    // Initialize wallet manager
    const walletManager = new WalletManager();
    console.log(`Wallets available: ${walletManager.getWalletCount()}`);

    // Initialize Jupiter service
    const jupiterService = new JupiterService(connection, config.jupiter);
    console.log(`Jupiter API: ${config.jupiter.apiUrl}`);

    // Create and start bot
    const bot = new MarketMakerBot(connection, walletManager, jupiterService, config);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nReceived SIGINT, shutting down gracefully...');
      bot.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\nReceived SIGTERM, shutting down gracefully...');
      bot.stop();
      process.exit(0);
    });

    // Start the bot
    await bot.start();

    // Keep the process alive
    console.log('\nBot is running. Press Ctrl+C to stop.\n');
  } catch (error: any) {
    console.error('Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the bot
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
