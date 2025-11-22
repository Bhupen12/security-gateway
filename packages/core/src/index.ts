import { RedisClient } from "./db/redis";
import { SecurityRepository } from "./db/repository";
import { requestExtractor } from "./middleware/extractor";
import { createGuardMiddleware } from "./middleware/guard";

export class SecurityGateway{
  private redisClient: RedisClient;
  private repository: SecurityRepository;

  constructor(config: { redisUrl: string }){
    this.redisClient = new RedisClient();
    this.redisClient.connect(config.redisUrl);

    const client = this.redisClient.getClient();
    this.repository = new SecurityRepository(client);

    console.log("✅ Security Gateway Connected to Redis!");
  }

  public middleware() {
    const guard = createGuardMiddleware(this.repository);

    return [
      requestExtractor,
      guard
    ];
  }

  public getRepository(){
    return this.repository;
  }
}