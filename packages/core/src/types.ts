import { Request } from "express";

export interface SecurityRequest extends Request {
  clientIp?: string,
  clientCountry?: string,
}