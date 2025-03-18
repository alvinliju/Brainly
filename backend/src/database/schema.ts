

import { serial, text, pgTable, pgSchema, uuid, primaryKey, varchar, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";



//@ts-ignore
export const linkType = pgEnum("link_type", ["youtube", "twitter","article", "other" ])


export const users = pgTable("users", {
    id: uuid("id").primaryKey(),
    name: varchar("name", {length: 255}).notNull(),
    email: varchar("email", {length: 255}).notNull().unique(),
    emailVerified: boolean("email_verified"),
    hashedPassword: varchar("password_hash", {length:255}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const links = pgTable("links", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull().references(()=>users.id),
    url: varchar("url", {length:255}),
    title: varchar("title", {length:255}),
    description: varchar("description", {length:255}),
    image_url: varchar("image_url", {length:255}),
    favicon_url: varchar("favicon_url", {length:255}),
    spaceId: uuid("space_id").notNull().references(()=>spaces.id),
    type: linkType("link_type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
    id:uuid("id").primaryKey(),
    userId: uuid("user_id").notNull().references(()=>users.id),
    tag_name: varchar("tag_name", {length:255}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})



export const spaces = pgTable("spaces", {
    id:uuid("id").primaryKey(),
    userId: uuid("user_id").notNull().references(()=>users.id),
    title: varchar("title", {length:255}),
    is_public: boolean("is_public"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const linkTags = pgTable("link_tags",{
    linkId: uuid("link_Id").notNull().references(()=>links.id),
    tagId: uuid("tag_Id").notNull().references(()=>tags.id)
}, 
(table) => ({
    primaryKey: primaryKey({
        columns:[table.linkId, table.tagId],
    })
})
)


export const spaceLinks = pgTable("space_links", {
    spaceId: uuid("space_Id").notNull().references(()=>spaces.id),
    linkId: uuid("link_Id").notNull().references(()=>links.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    
}, 
(table) => ({
    primaryKey: primaryKey({
        columns:[table.spaceId, table.linkId],
    })
})
)



// select operations
export type User = typeof users.$inferSelect;
export type Link = typeof links.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Space = typeof spaces.$inferSelect;


// insert operations
export type NewUser = typeof users.$inferInsert;
export type NewLink = typeof links.$inferInsert;
export type NewTag = typeof tags.$inferInsert;
export type NewSpace = typeof spaces.$inferInsert;
export type LinkTag = typeof linkTags.$inferInsert; // usually insert only
export type SpaceLink = typeof spaceLinks.$inferInsert;