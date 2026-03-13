export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomInterval(min: number, max: number): number {
  return randomInt(min, max) * 1000; // Convert to milliseconds
}
