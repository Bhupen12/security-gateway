import { NextFunction, Request, Response } from "express";
import { SecurityRequest } from "../types";
import geoip from 'geoip-lite';

export const requestExtractor = (req: SecurityRequest, res: Response, next: NextFunction) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  if(Array.isArray(ip)){
    ip = ip[0];
  } else if (typeof ip === 'string') {
    ip = ip.split(',')[0].trim();
  }

  if (ip === '::1') ip = '127.0.0.1';

  // remove ipv6 prefix if present (::ffff:127.0.0.1)
  if(typeof ip === 'string' && ip.includes('::ffff:')){
    ip = ip.split(":").pop() || ip;
  }

  req.clientIp = ip;

  // get country code
  const geo = geoip.lookup(ip);
  req.clientCountry = geo ? geo.country : 'UNKNOWN';
  next()
}