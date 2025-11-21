import { RedisClient } from "./db/redis";
import { SecurityRepository } from "./db/repository";

export class SecurityGateway{
  private redisClient: RedisClient;
  private repository: SecurityRepository | null = null;

  constructor(config: { redisUrl: string }){
    this.redisClient = new RedisClient();
    this.redisClient.connect(config.redisUrl);

    const client = this.redisClient.getClient();
    this.repository = new SecurityRepository(client);

    console.log("✅ Security Gateway Connected to Redis!");
  }

  public getRepository(){
    return this.repository;
  }
}