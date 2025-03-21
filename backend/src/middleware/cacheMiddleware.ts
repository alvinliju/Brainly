import { Request, Response, NextFunction } from 'express';
import client from '../utils/redis';

const cacheMiddleware = (key: string, ttl = 60) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Generate user-specific cache key
    const cacheKey = `dumb:${req.userId}:${key}`;

    // 2. Try to get cached value
    const cached = await client.get(cacheKey).catch(() => null);
    
    // 3. If found, return immediately
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // 4. If not found, override response.json
    const originalJson = res.json;
    res.json = (body: any) => {
      // 5. Cache the response for next time
      client.set(cacheKey, JSON.stringify(body), 'EX', ttl)
        .catch(() => {/* ignore errors */});
      
      originalJson.call(res, body);
    };

    next();
  };
};

export default cacheMiddleware;