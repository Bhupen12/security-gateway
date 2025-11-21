import Redis from 'ioredis';

export class RedisClient {
  private client: Redis | null = null;

  /**
   * connect to redis instance using provided url
   */
  public connect(url: string) {
    if (!this.client) {
      this.client = new Redis(url, {
        lazyConnect: true, // explicit connect call
        retryStrategy(times) {
          return Math.min(times * 50, 2000) // Retry logic
        },
      });
      this.client.on('error', (err) => {
        console.error('Redis Connection Error', err);
      })
    }
  }

  /**
   * @returns Returns the active Redis instance. Throws error if not connected.
   */
  public getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client is not initialized. Call connect() first.');
    }
    return this.client;
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}