import express from 'express';
import z from 'zod';
import { db } from '../database';
import { linkTags, tags } from '../database/schema';
import { links } from '../database/schema';
import { requireAuth } from '../middleware/auth';
import { eq, and, sql } from 'drizzle-orm';

const router = express.Router();


router.get('/', requireAuth, async (req, res)=>{
    try{
        const userId = req.userId;
        const userTags = await db.select().from(tags).innerJoin(linkTags, eq(linkTags.tagId, tags.id)).innerJoin(links, and(eq(links.id, linkTags.linkId), eq(links.userId, userId))).groupBy(tags.id).orderBy(sql`tag_count DESC`)
        return res.status(200).json({ message: "Tags retrieved successfully", tags: userTags });
    }catch(error){
        console.log(error)
    }
})

export default router