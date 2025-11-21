import Redis from "ioredis";
import bcrypt from 'bcryptjs';

export class SecurityRepository{
  private redis: Redis;

  constructor(redisClient: Redis){
    this.redis = redisClient;
  }

  // ==============================
  // 🛡️ IP & Country Management
  // ==============================

  /**
   * Adds an IP to the blocklist permanently.
   */
  public async blockIp(ip: string): Promise<void>{
    await this.redis.sadd('gateway:blocked:ips', ip);
  }

  /**
   * Remove an IP from blocklist
   */
  public async unblockIp(ip: string): Promise<void>{
    await this.redis.srem('gateway:blocked:ips', ip);
  }

  /**
   * Checks if an IP is blocked.
   * Returns true if blocked, false otherwise.
   */
  public async isIpBlocked(ip: string): Promise<boolean>{
    const result = await this.redis.sismember('gateway:blocked:ips', ip);
    return result === 1;
  }

  // ==============================
  // 👤 Admin Management
  // ==============================

  /**
   * Creates an admin user if they don't exist.
   * Hashes the password before storing.
   */
  public async seedAdmin(username: string, plainPassword: string): Promise<void>{
    const exist = await this.redis.hexists('gateway:admins', username)
    if(!exist){
      const hashPassword = await bcrypt.hash(plainPassword, 10);
      await this.redis.hset('gateway:admins', username, hashPassword);
      console.log(`👤 Admin seeded: ${username}`)
    }
  }

  /**
   * Verifies Admin Credentials.
   */
  public async validateAdmin(username: string, plainPassword: string): Promise<boolean> {
    const storedHash = await this.redis.hget('gateway:admins', username);
    
    if (!storedHash) return false;
    
    return await bcrypt.compare(plainPassword, storedHash);
  }
}