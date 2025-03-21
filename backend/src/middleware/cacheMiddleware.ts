import { Request, Response, NextFunction } from 'express';
import client from '../utils/redis';

const cacheMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    try{

        const cacheKey = `request:${req.url}:${JSON.stringify(req.query)}`;

        const cachedData = await client.get(cacheKey);

        if(cachedData){
            return res.status(200).json({
                data: JSON.parse(cachedData),
                fromCache: true
            })
        }

        res.locals.cacheKey = cacheKey;
        next()

    }catch(error){
        console.error('Cache middleware error:', error);
        next();
    }
}

export default cacheMiddleware