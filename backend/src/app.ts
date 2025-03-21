import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {rateLimit} from 'express-rate-limit'

//importing routes
import contentRoutes from '../src/routes/contentRoutes'
import authRoutes from './routes/authRoutes'
import spaceRoutes from './routes/spaceRoutes'

const app = express();

//security middlewares
app.use(helmet());
app.use(cors());
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));


//for json parsing
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res)=>{
    res.json({message:"Hello world"})
})

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/contents', contentRoutes);
app.use('/api/v1/spaces', spaceRoutes)

export default app;