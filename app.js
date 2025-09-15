import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import gridRouter from './routes/grid.route.js';
import connectDB from './db/connect.js';

const app = express();

await connectDB()

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(helmet());
app.use(express.json());


// --- Routes ---
app.get('/', (req, res) => {
  res.send('GIS Server is alive!');
});

app.use('/api/grid', gridRouter);

export default app;
