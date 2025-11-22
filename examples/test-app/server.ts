import express from 'express';
import { SecurityGateway } from '@bhupen/gateway';

const app = express();
const REDIS_URL = 'redis://localhost:6379';

async function start() {
  const gateway = new SecurityGateway({ 
    redisUrl: REDIS_URL,
    limiter: { capacity: 2, refillRate: 0.02 } 
  });
  
  const repo = gateway.getRepository();
  await repo.unblockIp('127.0.0.1');

  app.use(gateway.middleware() as any);

  app.get('/', (req, res) => {
    res.send(`Success! Tokens remaining: ${res.getHeader('X-RateLimit-Remaining')}`);
  });

  app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
  });
}

start();