import express from 'express';
import { getSeatStatus } from '../controllers/statusControllers.js';
import { getReservationsByEmail } from '../controllers/reservationController.js';

const reservationRouter = express.Router();

// /api/reservations
reservationRouter.get('/reservations', getReservationsByEmail);

export default reservationRouter;