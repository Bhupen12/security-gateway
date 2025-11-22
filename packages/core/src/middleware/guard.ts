import { NextFunction, Response } from "express";
import { SecurityRequest } from "../types";
import { SecurityRepository } from "../db/repository";

export const createGuardMiddleware = (repo: SecurityRepository) => {
  return async (req: SecurityRequest, res: Response, next: NextFunction) => {
    const ip = req.clientIp || '';
    const country = req.clientCountry || '';

    const isIpBlocked = await repo.isIpBlocked(ip);
    if(isIpBlocked) {
      console.warn(`⛔ Blocked Request from IP: ${ip}`);
      res.status(403).json({ error: 'Access Denied: Your IP is blocked.' });
      return;
    }

    // 2. Check Blocked Country (Future scope)
    // const isCountryBlocked = await repo.isCountryBlocked(country);
    // if (isCountryBlocked) ...

    next();
  };
};