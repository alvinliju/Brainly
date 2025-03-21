

import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();
import { users, links, spaces, spaceRelations, linkRealtions } from './schema'; // Import your schema
import { drizzle } from 'drizzle-orm/node-postgres';

const dbUrl = process.env.DATABASE_URL!
console.log(dbUrl)

const poolConfig = {
    connectionString: dbUrl,
    max: 20,           // Maximum number of connections in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 5000, // Max. time to establish connection, in milliseconds
};


const pool = new Pool(poolConfig);
export const db = drizzle(pool, {schema:{users, links, spaces, spaceRelations, linkRealtions }});

pool.on('connect', ()=>{
    console.log('db connected')
})


// Optional: Add an error handler for the pool
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1); // Or handle more gracefully
});