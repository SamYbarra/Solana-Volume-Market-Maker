/**
 * Utility functions for the Pumpfun Market Maker
 */

import { PublicKey } from '@solana/web3.js';
import type { TradeResult } from './types.js';

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function formatSol(lamports: number): string {
  return (lamports / 1e9).toFixed(4);
}

export function formatAddress(address: string | PublicKey | null | undefined, chars: number = 8): string {
  if (!address) return 'N/A';
  const str = typeof address === 'string' ? address : address.toString();
  if (str.length <= chars * 2) return str;
  return `${str.substring(0, chars)}...${str.substring(str.length - chars)}`;
}

export function logTrade(trade: TradeResult): void {
  const emoji = trade.type === 'buy' ? '🟢' : '🔴';
  const status = trade.success ? '✅' : '❌';
  console.log(
    `${emoji} ${status} ${trade.type.toUpperCase()}: ${trade.amountSol.toFixed(4)} SOL | ` +
    `Wallet: ${formatAddress(trade.wallet)} | ` +
    (trade.signature ? `Sig: ${formatAddress(trade.signature)}` : `Error: ${trade.error || 'Unknown'}`)
  );
}

export function validatePrivateKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }
  
  // Check if it's base58 format (typically 88 chars)
  if (key.length === 88) {
    try {
      // Try to decode it
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const bs58 = require('bs58');
      bs58.decode(key);
      return true;
    } catch {
      return false;
    }
  }
  
  // Check if it's hex format (typically 128 chars for 64 bytes)
  if (key.length === 128 || key.length === 64) {
    return /^[0-9a-fA-F]+$/.test(key);
  }
  
  return false;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
