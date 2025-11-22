import express from 'express';
import { SecurityGateway } from '@bhupen/gateway';

const app = express();

const redisUrl = 'redis://localhost:6379'

async function main() {
  console.log('testing redis logic...');

  const gateway = new SecurityGateway({
    redisUrl: redisUrl
  });

  app.use(gateway.middleware() as any);

  app.get('/', (req: any, res: any)=>{
    res.send(`Welcome! Your IP is ${req.clientIp} from ${req.clientCountry}`);
    return;
  })

  const repo = gateway.getRepository();
  await repo.blockIp('127.0.0.1'); 
  console.log("🔒 127.0.0.1 has been blocked for testing.");

  app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
  });
}

main();