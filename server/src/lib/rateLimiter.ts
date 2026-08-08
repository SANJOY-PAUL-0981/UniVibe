type BucketState = {
  tokens: number;
  lastRefill: number;
};

export class TokenBucket {
  private store = new Map<string, BucketState>();

  constructor(
    private capacity: number,
    private refillRate: number,
  ) {}

  isAllowed(clientId: string): boolean {
    const now = Date.now();
    const state = this.store.get(clientId) ?? {
      tokens: this.capacity,
      lastRefill: now,
    };
    const elapsed = now - state.lastRefill;
    state.tokens = Math.min(
      this.capacity,
      state.tokens + elapsed * this.refillRate,
    );
    state.lastRefill = now;
    if (state.tokens < 1) {
      this.store.set(clientId, state);
      return false;
    }
    state.tokens -= 1;
    this.store.set(clientId, state);
    return true;
  }
}
