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

  app.listen(port, () => {
    console.log(`🎛️  Dashboard API running on http://localhost:${port}`);
  });
}