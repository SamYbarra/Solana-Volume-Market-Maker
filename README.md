# Solana Volume Market Maker Bot

A sophisticated volume market maker bot for Solana DEXs using Jupiter aggregator. This bot creates organic trading patterns by using multiple wallets with randomized buy/sell intervals and amounts.

## Features

- 🚀 **Jupiter Integration**: Trades across all Solana DEXs via Jupiter aggregator
- 👛 **Multi-Wallet Support**: Uses multiple wallets to create organic trading patterns
- ⏱️ **Configurable Intervals**: Random buy/sell intervals to simulate natural trading
- 💰 **Flexible Amounts**: Random buy/sell amounts within configurable ranges
- 🔒 **Safe & Secure**: Private keys stored securely, never exposed
- 📊 **Real-time Trading**: Executes trades on Solana mainnet

## Prerequisites

- Node.js 18+ and npm
- Solana wallet(s) with SOL for trading
- RPC endpoint (public or private)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Solana-Volume-Market-Maker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Configure your `.env` file (see Configuration section below)

5. Build the project:
```bash
npm run build
```

## Configuration

Edit the `.env` file with your settings:

### Required Settings

- **RPC_URL**: Your Solana RPC endpoint
  - Public: `https://api.mainnet-beta.solana.com`
  - Recommended: Use a private RPC (Helius, QuickNode, etc.) for better performance

- **WALLET_PRIVATE_KEYS**: Comma-separated list of base58-encoded private keys
  - Example: `key1,key2,key3`
  - OR use **WALLET_FILE_PATH** to load from a file (one key per line)

- **TOKEN_MINT_ADDRESS**: The token you want to trade (mint address)

### Trading Settings

- **MIN_BUY_AMOUNT** / **MAX_BUY_AMOUNT**: SOL amount range for buys (default: 0.01 - 1.0)
- **MIN_SELL_AMOUNT** / **MAX_SELL_AMOUNT**: Token amount range for sells (default: 0.01 - 1.0)
- **BUY_INTERVAL_MIN** / **BUY_INTERVAL_MAX**: Buy interval range in seconds (default: 30 - 300)
- **SELL_INTERVAL_MIN** / **SELL_INTERVAL_MAX**: Sell interval range in seconds (default: 30 - 300)
- **SLIPPAGE_BPS**: Slippage tolerance in basis points (default: 50 = 0.5%)
- **MAX_WALLETS_TO_USE**: Maximum number of wallets to use simultaneously (default: 5)

### Example .env File

```env
RPC_URL=https://api.mainnet-beta.solana.com
TOKEN_MINT_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
BASE_TOKEN_MINT_ADDRESS=So11111111111111111111111111111111111111112
MIN_BUY_AMOUNT=0.1
MAX_BUY_AMOUNT=2.0
MIN_SELL_AMOUNT=0.1
MAX_SELL_AMOUNT=2.0
BUY_INTERVAL_MIN=60
BUY_INTERVAL_MAX=600
SELL_INTERVAL_MIN=60
SELL_INTERVAL_MAX=600
SLIPPAGE_BPS=50
WALLET_PRIVATE_KEYS=your_key1,your_key2,your_key3
ENABLED=true
MAX_WALLETS_TO_USE=5
```

## Usage

### Development Mode

Run with TypeScript directly (requires `ts-node`):
```bash
npm run dev
```

### Production Mode

Build and run:
```bash
npm run build
npm start
```

### Watch Mode

Auto-rebuild on changes:
```bash
npm run watch
```

## How It Works

1. **Wallet Management**: The bot loads multiple wallets from your configuration
2. **Random Selection**: For each trade, a random wallet is selected
3. **Interval Control**: Buy and sell operations are scheduled with random intervals
4. **Amount Randomization**: Each trade uses a random amount within your configured range
5. **Jupiter Integration**: All trades go through Jupiter, which routes to the best DEX
6. **Balance Checking**: Before selling, the bot checks if the wallet has tokens

## Trading Flow

### Buy Flow
1. Random wallet selected
2. Random SOL amount calculated (within min/max range)
3. Jupiter quote requested
4. Swap transaction created and signed
5. Transaction sent to Solana network

### Sell Flow
1. Random wallet selected
2. Token balance checked
3. Random token amount calculated (within min/max range, not exceeding balance)
4. Jupiter quote requested
5. Swap transaction created and signed
6. Transaction sent to Solana network

## Safety Features

- ✅ Wallet busy detection (prevents concurrent trades on same wallet)
- ✅ Balance validation before selling
- ✅ Transaction confirmation waiting
- ✅ Error handling and logging
- ✅ Graceful shutdown on SIGINT/SIGTERM

## Monitoring

The bot logs all activities to the console:
- Wallet addresses (truncated for privacy)
- Trade amounts
- Transaction signatures
- Errors and warnings

## Troubleshooting

### "No wallets loaded" Error
- Ensure `WALLET_PRIVATE_KEYS` or `WALLET_FILE_PATH` is set correctly
- Verify private keys are base58-encoded
- Check that keys are valid Solana private keys

### Transaction Failures
- Ensure wallets have sufficient SOL for fees
- Check token mint address is correct
- Verify RPC endpoint is working
- Increase slippage tolerance if needed

### RPC Rate Limiting
- Use a private RPC endpoint for better rate limits
- Consider reducing trading frequency
- Monitor RPC usage

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use separate trading wallets** - Don't use your main wallet
3. **Start with small amounts** - Test with minimal amounts first
4. **Monitor transactions** - Check Solana Explorer regularly
5. **Use private RPC** - Public RPCs have rate limits

## Project Structure

```
.
├── src/
│   ├── bot/
│   │   └── marketMaker.ts      # Main bot logic
│   ├── config/
│   │   └── index.ts            # Configuration loader
│   ├── services/
│   │   └── jupiter.ts          # Jupiter API integration
│   ├── types/
│   │   └── config.ts           # TypeScript types
│   ├── utils/
│   │   ├── random.ts           # Random number utilities
│   │   └── wallet.ts           # Wallet management
│   └── index.ts                # Entry point
├── .env.example                # Example environment file
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # This file
```

## Dependencies

- `@solana/web3.js`: Solana blockchain interaction
- `axios`: HTTP client for Jupiter API
- `bs58`: Base58 encoding/decoding for keys
- `dotenv`: Environment variable management

## License

MIT

## Disclaimer

This bot is for educational and research purposes. Trading cryptocurrencies involves risk. Use at your own discretion. The authors are not responsible for any financial losses.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Solana and Jupiter documentation
3. Verify your configuration matches the examples

## Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- All new features are tested
- Documentation is updated
