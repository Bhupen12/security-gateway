import { RedisClient } from "./db/redis";
import { SecurityRepository } from "./db/repository";
import { requestExtractor } from "./middleware/extractor";
import { createGuardMiddleware } from "./middleware/guard";
import { createRateLimiter, RateLimitConfig } from "./middleware/rate-limit";

export interface GatewayConfig {
  redisUrl: string;
  limiter?: RateLimitConfig;
}

export class SecurityGateway{
  private redisClient: RedisClient;
  private repository: SecurityRepository;
  private limiterConfig: RateLimitConfig;

  constructor(config: GatewayConfig){
    this.redisClient = new RedisClient();
    this.redisClient.connect(config.redisUrl);

    const client = this.redisClient.getClient();
    this.repository = new SecurityRepository(client);

    this.limiterConfig = config.limiter || { capacity: 10, refillRate: 1 }

    console.log("✅ Security Gateway Connected to Redis!");
  }

  public middleware() {
    const client = this.redisClient.getClient();
    const guard = createGuardMiddleware(this.repository);
    const limiter = createRateLimiter(client, this.limiterConfig);

    return [
      requestExtractor,
      guard,
      limiter
    ];
  }

  public getRepository(){
    return this.repository;
  }
}