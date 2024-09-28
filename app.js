// import modules
import express from 'express';
import { db } from './lib/database.lib.js';
import reportR from './routes/reports.route.js';
import authR from './routes/auth.route.js';
import userRouter from './routes/users.route.js';
import { isAdmin } from './middleware/admin.middleware.js';
import cors from 'cors';
import dotenv from 'dotenv';

// dotenv config
dotenv.config();

// setupe express
const app = express();
const port = 3001;

// setup middleware
app.use(express.json());
app.use(cors({
    origin: ["https://tracer.crittercodes.com", "http://localhost:3000"]
}));

//set up routes
app.use('/api/v1/reports', isAdmin, reportR);
app.use('/api/v1/auth', authR);
app.use('/api/v1/users', isAdmin, userRouter);
app.use('/', (req, res) => {
  res.send('Welcome to Tracer API');
});

// setup db
const config = {
  url: process.env.MONGO_URL,
  database: 'Tracer',
  minPoolSize: 3,
  maxPoolSize: 10,
};

db.init(config);

// start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})