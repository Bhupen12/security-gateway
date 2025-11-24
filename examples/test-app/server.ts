import express from 'express';
import { SecurityGateway } from '@alien-ai/gateway';

const app = express();
const REDIS_URL = 'redis://localhost:6379';

async function start() {
  const gateway = new SecurityGateway({ 
    redisUrl: REDIS_URL,
    limiter: { capacity: 10, refillRate: 1 }
  });

  // 1. Seed Admin (Only needed once, but safe to run)
  const repo = gateway.getRepository();
  await repo.seedAdmin('admin', 'password123');

  // 2. Start Dashboard
  gateway.startDashboard(9000);

  // 3. Normal App Middleware
  app.use(gateway.middleware() as any);
  
  app.get('/', (req, res) => res.send('App is running'));

  app.listen(3000, () => {
    console.log('🚀 App Server: http://localhost:3000');
    // Dashboard log server.ts ke andar se aayega
  });
}

start();