import express from 'express';
import { reserveSeat } from '../controllers/reserveController.js';

const router = express.Router();

// /api/reserve
router.post('/reserve', reserveSeat);

export default router;