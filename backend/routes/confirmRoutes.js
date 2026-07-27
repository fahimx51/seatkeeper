import express from 'express';
import { confirmSeat } from '../controllers/confirmController.js';

const router = express.Router();

// /api/confirm
router.post('/confirm', confirmSeat);

export default router;