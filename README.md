# Pumpfun Market Maker Bot

An automated market maker bot for Pumpfun tokens on Solana blockchain. This bot simulates real trader behavior with randomized trade sizes, timing, and multi-wallet support.

## Features

- 🤖 **Automated Trading**: Buy and sell tokens automatically based on market conditions
- 🎲 **Realistic Behavior**: Randomized trade sizes and timing to mimic human traders
- 💼 **Multi-Wallet Support**: Distribute trades across multiple wallets
- 📊 **Health Charts**: Visualize bot performance with real-time charts
- ⚙️ **Configurable**: Control buy/sell volumes, market cap limits, and trading behavior
- 📈 **Statistics**: Track trading performance and success rates

## Prerequisites

- Node.js 18+ 
- TypeScript 5.3+
- Solana wallet(s) with SOL balance
- Access to Solana RPC endpoint (public or private)

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your configuration

# Build TypeScript
npm run build

# Or run in development mode
npm run dev:run
```

## Configuration

Edit the `.env` file with your settings:

### Required Settings

- `WALLET_PRIVATE_KEYS`: Comma-separated list of wallet private keys (base58 or hex format)
- `TOKEN_ADDRESS`: The Pumpfun token address to trade

### Trading Settings

- `MIN_BUY_AMOUNT_SOL` / `MAX_BUY_AMOUNT_SOL`: Buy amount range in SOL
- `MIN_SELL_AMOUNT_SOL` / `MAX_SELL_AMOUNT_SOL`: Sell amount range in SOL
- `MIN_MARKET_CAP_SOL` / `MAX_MARKET_CAP_SOL`: Market cap range to trade within

### Behavior Settings

- `MIN_TRADE_DELAY_SECONDS` / `MAX_TRADE_DELAY_SECONDS`: Delay between trades (randomized)
- `RANDOMIZE_TRADE_SIZE`: Enable/disable trade size randomization
- `RANDOMIZE_TRADE_TIMING`: Enable/disable trade timing randomization

### Example Configuration

```env
WALLET_PRIVATE_KEYS=5Kd3N...abc123,7Hm9P...def456
TOKEN_ADDRESS=TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
MIN_BUY_AMOUNT_SOL=0.1
MAX_BUY_AMOUNT_SOL=1.0
MIN_MARKET_CAP_SOL=1000
MAX_MARKET_CAP_SOL=100000
```

## Usage

```bash
# Build and start the bot
npm start

# Or run in development mode (with TypeScript watch)
npm run dev

# Or run directly with tsx (no build step)
npm run dev:run

# Type check without running
npm run type-check
```

## How It Works

1. **Initialization**: Loads wallets and validates configuration
2. **Market Analysis**: Checks token price and market cap
3. **Trade Decision**: Randomly decides to buy or sell based on market conditions
4. **Execution**: Executes trade with randomized amount and timing
5. **Monitoring**: Updates health charts and statistics
6. **Repeat**: Continues trading cycle with random delays

## Trading Behavior

The bot is designed to act like real traders:

- **Randomized Trade Sizes**: Uses normal distribution around configured ranges
- **Randomized Timing**: Varies delays between trades
- **Multi-Wallet Rotation**: Distributes trades across multiple wallets
- **Market Cap Filtering**: Only trades when market cap is within configured range

## Health Charts

Charts are generated automatically and saved to the `charts/` directory:

- `health-chart-*.png`: Real-time health metrics (balance, market cap, trades)
- `stats-chart-*.png`: Trading statistics (buy/sell counts)
- `latest.png`: Most recent health chart

## Statistics

The bot tracks:

- Total buys/sells
- Success rates
- Total volume traded
- Current balance
- Market cap and price

Statistics are printed periodically and can be viewed in the console.

## Safety Features

- Market cap limits prevent trading outside configured ranges
- Configurable buy/sell enable flags
- Graceful shutdown on SIGINT/SIGTERM
- Error handling and logging

## Important Notes

⚠️ **Disclaimer**: This bot is for educational purposes. Trading cryptocurrencies involves risk. Use at your own discretion.

⚠️ **Pumpfun Integration**: The current implementation includes placeholder Pumpfun program interactions. You'll need to:

1. Update `PUMPFUN_PROGRAM_ID` in `src/pumpfun.js` with the actual program ID
2. Implement the correct instruction data format for Pumpfun buy/sell operations
3. Verify the API endpoints for price/market cap data

⚠️ **RPC Limits**: Public RPC endpoints have rate limits. Consider using a private RPC endpoint for production use.

## Troubleshooting

### "No wallet private keys configured"
- Ensure `WALLET_PRIVATE_KEYS` is set in `.env`
- Check that private keys are comma-separated

### "Token address not configured"
- Set `TOKEN_ADDRESS` in `.env` file

### "Insufficient balance"
- Ensure wallets have enough SOL for trading and transaction fees

### Chart generation errors
- Ensure `charts/` directory exists or is writable
- Check that `chartjs-node-canvas` dependencies are installed

## Development

### Project Structure

```
.
├── src/
│   ├── index.ts          # Main bot entry point
│   ├── config.ts         # Configuration management
│   ├── wallet.ts         # Wallet management
│   ├── pumpfun.ts       # Pumpfun trading logic
│   ├── trading.ts        # Trading engine
│   ├── chart.ts          # Chart generation
│   ├── utils.ts          # Utility functions
│   └── types.ts          # TypeScript type definitions
├── dist/                 # Compiled JavaScript (generated)
├── charts/               # Generated charts
├── .env                 # Environment variables (not in git)
├── .env.example         # Example environment file
├── .gitignore
├── tsconfig.json        # TypeScript configuration
├── package.json
└── README.md
```

## License

MIT License - Use at your own risk

## Contributing

Contributions welcome! Please ensure:

1. Code follows existing style
2. Tests pass (if applicable)
3. Documentation is updated

## Support

For issues and questions, please open an issue on the repository.
