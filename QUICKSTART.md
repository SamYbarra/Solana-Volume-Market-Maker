# Quick Start Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Generate Wallets (Optional)
If you need to generate new wallets:
```bash
npx ts-node src/utils/generateWallet.ts
```

## 3. Create .env File
Create a `.env` file in the root directory with:

```env
RPC_URL=https://api.mainnet-beta.solana.com
TOKEN_MINT_ADDRESS=YOUR_TOKEN_MINT_ADDRESS
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

## 4. Build
```bash
npm run build
```

## 5. Run
```bash
npm start
```

## Important Notes

- **Fund your wallets**: Make sure each wallet has SOL for trading and transaction fees
- **Start small**: Test with small amounts first
- **Use private RPC**: Public RPCs have rate limits
- **Monitor transactions**: Check Solana Explorer for your wallet addresses

## Wallet File Format

Alternatively, you can use `WALLET_FILE_PATH` to point to a file with one private key per line:
```
your_private_key_1
your_private_key_2
your_private_key_3
```
