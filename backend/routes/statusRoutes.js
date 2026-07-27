import express from 'express';
import { getSeatStatus } from '../controllers/statusControllers.js';

const statusRouter = express.Router();

// /api/status
statusRouter.get('/status', getSeatStatus);

export default statusRouter;