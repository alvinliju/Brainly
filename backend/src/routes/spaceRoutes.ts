import express from 'express';
import z from 'zod';
import { db } from '../database';
import { spaces ,NewSpace, spaceLinks } from '../database/schema';
import {requireAuth} from '../middleware/auth'
import { and, eq, sql } from 'drizzle-orm';
import { links } from '../database/schema';
import cacheMiddleware from '../middleware/cacheMiddleware';

const router = express.Router();

const NewSpaceSchema = z.object({
    title:z.string().min(3, "Minimum 3 characters required").max(40, 'Maximum 40 characters allowed')
})

router.get('/', cacheMiddleware('spaces'), requireAuth, async (req, res)=>{
    try{
        const userId = req.userId
        console.log(userId)

        const getAllSpaces  = await db.select({ name: spaces.title }).from(spaces).where(eq(spaces.userId, userId,));


        console.log(getAllSpaces)
        return res.status(200).json({message:"fetch Success", getAllSpaces});
    }catch(error){
        console.log(error)
        return res.status(500).json({message:"Internal Error"})
    }
})

router.post('/', requireAuth, async (req, res)=>{
    try{
        
        const userId = req.userId;
        console.log(userId)
        const {title} = NewSpaceSchema.parse(req.body);
        console.log(title)

        const existingSpace = await db.select().from(spaces).where(eq(spaces.title, title))

        if(existingSpace.length > 0){
            return res.status(403).json({meessage:`A space with name ${title} already exists`});
        }


        const newSpace:NewSpace={
            title,
            userId,
            is_public:false
        }

         const createdSpace = await db.insert(spaces).values(newSpace).returning();


        return res.status(201).json({message:"Space Created", createdSpace});

    }catch(error){
        return res.status(500).json({message:"Internal Error"})
    }
})

router.get('/:spacename',cacheMiddleware('space'), requireAuth, async (req, res)=>{
    try{
        const userId = req.userId
        const spaceName = req.params.spacename;

        const spaceWithLinks = await db.query.spaces.findFirst({
          where: and(
            eq(spaces.userId, userId),
            eq(spaces.title, spaceName)
          ),
          with:{
            links:{
              where:eq(links.userId, userId)
            }
          }
        })

          
        return res.status(200).json({message:"fetch Success", spaceWithLinks});
    }catch(error){
        console.log(error)
        return res.status(500).json({message:"Internal Error"})
    }
})

export default router