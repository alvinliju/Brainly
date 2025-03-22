import express from 'express'
import jwt from 'jsonwebtoken'

import z from 'zod'
import { users, NewUser } from '../database/schema';
import { db } from '../database/index'
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const UserSchema = z.object({
    name: z.string().min(5, 'Username must be at least 5 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must contain at least 8 characters'),
});

const LoginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must contain at least 8 characters'),
})

const JWT_SECRET = process.env.JWT_SECRET;


router.post('/register', async (req, res) => {
    try {
        const validatedData = UserSchema.parse(req.body);
        const { name, email, password } = validatedData;

        //check if user exists
        const existingUser = await db.select().from(users).where(eq(users.email, email))

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User already exists" })
        }

        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        const newUser: NewUser = {
            name: name,
            email,
            hashedPassword: hash,
            emailVerified: false
        }

        await db.insert(users).values(newUser);

        return res.status(201).json({ message: "User registration succesful" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to register user" });
    }

})

router.post('/login', async (req, res) => {
    try {

        const validatedData = LoginSchema.parse(req.body);
        const { email, password } = validatedData;

        const existingUser = await db.select().from(users).where(eq(users.email, email));

        if (!existingUser) {
            return res.status(400).json({ message: "User does not exist" });
        }


        const isPasswordValid = await bcrypt.compare(password, existingUser[0].hashedPassword);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: existingUser[0].id },JWT_SECRET, {expiresIn: "1h"})

        return res.status(200).json({ message: "Login Successful", token })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Error" })
    }

})

export default router