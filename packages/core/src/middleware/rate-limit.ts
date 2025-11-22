// Lua Script:
// Logic: Check tokens, refill based on time passed, update bucket.

import Redis from "ioredis";
import { SecurityRequest } from "../types";
import { NextFunction, Response } from "express";

const TOKEN_BUCKET_SCRIPT = `
  local key = KEYS[1]
  local capacity = tonumber(ARGV[1])
  local refillRate = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local requested = 1

  -- Get current state (tokens, last_refill_timestamp)
  local state = redis.call('HMGET', key, 'tokens', 'lastRefill')
  local tokens = tonumber(state[1])
  local lastRefill = tonumber(state[2])

  -- Init if not exists
  if not tokens then
    tokens = capacity
    lastRefill = now
  end

  -- Calculate Refill
  local delta = math.max(0, now-lastRefill)
  local tokensToAdd = delta * refillRate

  -- fill the bucket (but not more then capacity)
  local newTokens = math.min(capacity, tokens + tokensToAdd)

  local allowed=0

  if newTokens >= requested then
    newTokens = newTokens - requested
    allowed=1
    lastRefill=now
  end

  -- Save Logic (Set 60s expiry to clean up idle keys)
  redis.call('HMSET', key, 'tokens', newTokens, 'lastRefill', lastRefill)
  redis.call('EXPIRE', key, 60)

  return {
    allowed,
    newTokens
  }
`

export interface RateLimitConfig {
  capacity: number;
  refillRate: number;
}

export const createRateLimiter = (redis: Redis, config: RateLimitConfig) => {
  return async (req: SecurityRequest, res: Response, next: NextFunction) => {
    const ip = req.clientIp || 'UNKNOWN';
    const key = `gateway:limits:ip:${ip}`;
    const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

    try {
      const result = await redis.eval(
        TOKEN_BUCKET_SCRIPT, 
        1, 
        key, 
        config.capacity, 
        config.refillRate, 
        now
      ) as [number, number];

      const [allowed, remaining] = result;

      res.setHeader('X-RateLimit-Limit', config.capacity);
      res.setHeader('X-RateLimit-Remaining', remaining);

      if(allowed === 1){
        next();
      }else{
        console.warn(`⏳ Rate Limit Exceeded for IP: ${ip}`)
        res.status(429).json({ 
          error: 'Too Many Requests', 
          message: 'Please slow down, bucket is empty!' 
        });
      }
    } catch (err) {
      console.error('Rate Limiter Error:', err);
      next();
    }
  }
}