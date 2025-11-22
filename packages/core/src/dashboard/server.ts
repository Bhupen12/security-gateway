import { SecurityRepository } from "../db/repository";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const JWT_SECRET = 'super-secret-key-change-this-in-prod';

export const startDashboardServer = (
  port: number,
  repo: SecurityRepository
) => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if(!username || !password){
      return res.status(400).json({ error: 'Username and password required' });
    }

    const isvalid = await repo.validateAdmin(username, password);

    if(isvalid){
      const token = jwt.sign({username}, JWT_SECRET, { expiresIn: '1h' });
      return res.json({token});
    }
    else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  })

  app.get('/api/blocked-ips', authenticateToken, async (req, res) => {
    const ips = await repo.getAllBlockedIps(); 
    res.json({ ips });
  });

  // 2. Block an IP
  app.post('/api/block-ip', authenticateToken, async (req, res) => {
    const { ip } = req.body;
    if (ip) {
      await repo.blockIp(ip);
      res.json({ success: true, message: `Blocked ${ip}` });
    } else {
      res.status(400).json({ error: 'IP is required' });
    }
  });

  // 3. Unblock an IP
  app.post('/api/unblock-ip', authenticateToken, async (req, res) => {
    const { ip } = req.body;
    if (ip) {
      await repo.unblockIp(ip);
      res.json({ success: true, message: `Unblocked ${ip}` });
    } else {
      res.status(400).json({ error: 'IP is required' });
    }
  });

  app.listen(port, () => {
    console.log(`🎛️  Dashboard API running on http://localhost:${port}`);
  });
}

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.sendStatus(401); // No token

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};