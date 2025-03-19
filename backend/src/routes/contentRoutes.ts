import express from 'express'
import z from 'zod';
import { links ,NewLink } from '../database/schema';
import { db } from '../database';
import { eq } from 'drizzle-orm';

import { requireAuth } from '../middleware/auth';

const router = express.Router();


router.get('/',requireAuth, async (req, res)=>{
    try{
        const userId = req.userId;
        const content = await db.select().from(links).where(eq(links.userId, userId));
        res.status(200).json({message:"Success", content});
    }catch(error){
        res.status(400).json({message:"Internal Error Cannot Fetch Links"});
    }
})

router.post('/',requireAuth, async (req, res)=>{
    try{
        const userId = req.userId;
        const {spaceId, type, url} = req.body;
        const newContent:NewLink = {
            spaceId
        }
        const content = await db.select().from(links).where(eq(links.userId, userId));
        res.status(200).json({message:"Success", content});
    }catch(error){
        res.status(400).json({message:"Internal Error Cannot Fetch Links"});
    }
})

export default router