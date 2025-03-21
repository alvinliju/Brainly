import express from 'express'
import z from 'zod';
import { links ,NewLink, linkType, spaces } from '../database/schema';
import { db } from '../database';
import { eq } from 'drizzle-orm';
import scrapeArticle from '../utils/scraper';
import cacheMiddleware from '../middleware/cacheMiddleware';


import { requireAuth } from '../middleware/auth';

const router = express.Router();

const linkTypeValues = linkType.enumValues



const contentPostSchema = z.object({
    spaceName:z.string(),
    type:z.enum(linkTypeValues),
    url:z.string().url()
})


router.get('/', requireAuth, cacheMiddleware('content'), async (req, res)=>{
    try{
        const userId = req.userId;
        const content = await db
      .select({
        id: links.id,
        url: links.url,
        title: links.title,
        description: links.description,
        imageUrl: links.image_url,
        favicon: links.favicon_url
      })
      .from(links)
      .where(eq(links.userId, userId))
      .limit(100); 

      res.status(200).json({message:"Success", content});
    }catch(error){
        console.log(error)
        res.status(400).json({message:"Internal Error Cannot Fetch Links"});
    }
})

router.post('/', requireAuth, async (req, res)=>{
    try{
        const userId = req.userId;
        const {spaceName, type, url} = req.body;

        let spaceIdFromDb;

         await db.transaction(async (tx) => {
            spaceIdFromDb = await tx.select().from(spaces).where(eq(spaces.title, spaceName));
        });


        if(spaceIdFromDb.length === 0){
            return res.status(404).json({message:`The space with name ${spaceName} does not exist`})
        }

        const spaceId = spaceIdFromDb[0]?.id;

        const {image, favicon, description, title}  = await scrapeArticle(url)

        const newContent:NewLink = {
            spaceId,
            userId,
            type, 
            url,
            title,
            description,
            image_url:image,
            favicon_url:favicon

        }

        const response = await db.transaction(async (tx) => {
            await tx.insert(links).values(newContent).returning();
          });


        res.status(200).json({message:"Success", response});
    }catch(error){
        console.log(error)
        res.status(400).json({message:"Internal Error Cannot Add Links"});
    }
})




export default router