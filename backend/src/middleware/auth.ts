import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

export const requireAuth = async (req:Request, res:Response, next:NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if(!token){
        return res.status(401).json({message:"Unathorized route"})
    }



    try{
        const JWT_SECRET = process.env.JWT_SECRET!

        const decoded = jwt.verify(token, JWT_SECRET) as {userId:string}

        if(!decoded){
            return res.status(401).json({message:"Invalid token"})
        }

        req.userId = decoded.userId;
        next();
    }catch(error){
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({message:"Token Expired"})
        }
        return res.status(500).json({ message: 'Internal Error' });
    }
} 