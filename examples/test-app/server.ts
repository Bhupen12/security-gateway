// examples/test-app/server.ts
import { SecurityGateway } from '@bhupen/gateway';

const redisUrl = 'redis://localhost:6379'

async function main(){
  console.log('testing redis logic...');

  const gateway = new SecurityGateway({
    redisUrl: redisUrl
  });

  const repo = gateway.getRepository();

  if(repo){
    const testIp = "192.168.1.50";
    await repo.blockIp(testIp);
    const isBlocked = await repo.isIpBlocked(testIp);
    console.log(`IP ${testIp} blocked? : ${isBlocked}`); // Should be true

    // Test 2: Seed Admin
    await repo.seedAdmin("admin", "secret123");
    const isValid = await repo.validateAdmin("admin", "secret123");
    console.log(`Admin login valid? : ${isValid}`); // Should be true
  }
}

main();