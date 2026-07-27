import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { ErrorMiddleware } from './middleware/error.js';
import seedSeats from './utils/seedSeats.js';
import reserveRoutes from './routes/reserveRoutes.js';
import confirmRoutes from './routes/confirmRoutes.js';
import statusRouter from './routes/statusRoutes.js';
import reservationRouter from './routes/reservationRoutes.js';

dotenv.config();

const app = express();

// Middlewares
const allowedOrigins = [
    'http://localhost:5000',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (!process.env.CLIENT_URL || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});


//Routes
app.use('/api', reserveRoutes);
app.use('/api', confirmRoutes);
app.use('/api', statusRouter);
app.use('/api', reservationRouter);

// error middleware
app.use(ErrorMiddleware);

const PORT = process.env.PORT || 5000;

async function start() {
    await connectDB();
    await seedSeats();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

start();