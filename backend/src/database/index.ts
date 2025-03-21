

import dotenv from 'dotenv';
dotenv.config();

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

const dbUrl = process.env.DATABASE_URL!
export const db = drizzle(dbUrl);
