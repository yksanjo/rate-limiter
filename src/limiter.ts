export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export class RateLimiter {
  private requests = new Map<string, number[]>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const valid = timestamps.filter(t => now - t < this.config.windowMs);
    
    if (valid.length >= this.config.maxRequests) {
      this.requests.set(key, valid);
      return false;
    }
    
    valid.push(now);
    this.requests.set(key, valid);
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }

  getRemaining(key: string): number {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const valid = timestamps.filter(t => now - t < this.config.windowMs);
    return Math.max(0, this.config.maxRequests - valid.length);
  }
}
