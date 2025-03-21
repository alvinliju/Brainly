import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import client from '../utils/redis';

export const requireAuth = async (req:Request, res:Response, next:NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    try{

        if(!token){
            return res.status(401).json({message:"Unathorized route"})
        }
    
        const cachedUser = await client.get(`auth:${token}`);

        const isBlacklisted = await client.exists(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ message: "Token blacklisted" });
        }
    
        if(cachedUser){
            req.userId = cachedUser
            return next();
        }

        const JWT_SECRET = process.env.JWT_SECRET!

        const decoded = jwt.verify(token, JWT_SECRET) as {userId:string}

        if(!decoded){
            return res.status(401).json({message:"Invalid token"})
        }

        await client.setex(`user:${token}`, 3600, decoded.userId)
        req.userId = decoded.userId;
        next();
    }catch(error){
        if(error.name === 'TokenExpiredError'){
            await client.setex(`blacklist:${token}`, 86400, '1');
            return res.status(401).json({message:"Token Expired"})
        }
        return res.status(500).json({ message: 'Internal Error' });
    }
} 