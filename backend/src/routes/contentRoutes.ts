import express from 'express'
import z, { string } from 'zod';
import { links, NewLink, linkType, spaces, NewTag, linkTags } from '../database/schema';
import { db } from '../database';
import { eq } from 'drizzle-orm';
import scrapeArticle from '../utils/scraper';
import cacheMiddleware from '../middleware/cacheMiddleware';
import { tags } from '../database/schema';

import { requireAuth } from '../middleware/auth';
import { and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';


const router = express.Router();

const linkTypeValues = linkType.enumValues



const contentPostSchema = z.object({
    spaceName: z.string(),
    type: z.enum(linkTypeValues),
    url: z.string().url(),
    tags: z.array(z.string()).optional().default([])
})


router.get('/', requireAuth, cacheMiddleware('content'), async (req, res) => {
    try {
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

        res.status(200).json({ message: "Success", content });
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "Internal Error Cannot Fetch Links" });
    }
})

router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { spaceName, type, url, tagName } = req.body;



        const spaceIdFromDb = await db.transaction(async (tx) => {
            const res = await tx.select().from(spaces).where(eq(spaces.title, spaceName));
            return res;
        });

        if (spaceIdFromDb.length === 0) {
            return res.status(404).json({ message: `The space with name ${spaceName} does not exist` })
        }

        const spaceId = spaceIdFromDb[0]?.id;



        const { image, favicon, description, title } = await scrapeArticle(url);



        const newContent: NewLink = {
            spaceId,
            userId,
            type,
            url,
            title,
            description,
            image_url: image,
            favicon_url: favicon
        }

        

        const createdLink = await db.transaction(async (tx) => {



            const existingLink = await tx.select().from(links).where(eq(links.url, url))

    
            if(existingLink.length > 0){
    
                return tx.update(links).set({
                    title: title || existingLink[0].title,
                    description: description || existingLink[0].description,
                    image_url: image || existingLink[0].image_url,
                    favicon_url: favicon || existingLink[0].favicon_url
                })
                .where(eq(links.id, existingLink[0].id))
                .returning();
            }else{
                return await tx
                    .insert(links)
                    .values(newContent)
                    .returning();
            }
        });

        console.log(createdLink)

        const linkId = createdLink[0]?.id;

        console.log(linkId)

        let tagId;
        let createdTag;

        for(const IndividualTag of tagName){
            if (IndividualTag && IndividualTag.length > 0) {
                const normalizeTag = IndividualTag.trim().toLowerCase();
    
                console.log(normalizeTag ,'fuck tag')
    
            
    
                const existingTag = await db.transaction(async (tx) => {
                    return tx.select()
                        .from(tags)
                        .where(eq(tags.tag_name, normalizeTag))
                })
    
                console.log('fuck existing tag')
    
    
    
                if (existingTag.length === 0) {
                    const newTag: NewTag = {
                        userId,
                        tag_name: normalizeTag,
                    }
    
                    console.log('created newTag')
    
                    createdTag = await db.transaction(async (tx) => {
                        return tx.insert(tags).values(newTag).returning()
                    })
    
                    console.log(createdTag , 'fuck new tag')
    
                    tagId = createdTag[0]?.id;
    
                    console.log(tagId)
                } else {
                    tagId = existingTag[0].id;
                }
    
                const existingLinkTag = await db.select().from(linkTags).where(and(eq(linkTags.linkId, linkId), eq(linkTags.tagId, tagId)))
    
                if(existingLinkTag.length === 0){
                    await db.transaction(async (tx) => {
                        return tx.insert(linkTags).values({ linkId, tagId }).returning()
                    })
                }else{
                    continue
                }
            }

        }
    

        return res.status(200).json({
            message: "Success",
            link: createdLink[0],
            addedTags: createdTag || []
        });

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "Internal Error Cannot Add Links" });
    }
})




export default router