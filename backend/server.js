import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { ErrorMiddleware } from './middleware/error.js';
import seedSeats from './utils/seedSeats.js';
import reserveRoutes from './routes/reserveRoutes.js';
import confirmRoutes from './routes/confirmRoutes.js';
import statusRouter from './routes/statusRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// error middleware
app.use(ErrorMiddleware);

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});


//Routes
app.use('/api', reserveRoutes);
app.use('/api', confirmRoutes);
app.use('/api', statusRouter);

const PORT = process.env.PORT || 5000;

async function start() {
    await connectDB();
    await seedSeats();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

start();