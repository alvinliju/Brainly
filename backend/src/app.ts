import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

//security middlewares
app.use(helmet());
app.use(cors());

//for json parsing
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res)=>{
    res.json({message:"Hello world"})
})

export default app;