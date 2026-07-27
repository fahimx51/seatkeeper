import { randomUUID } from 'node:crypto';
import Seat from '../models/Seat.js';
import ErrorHandler from '../utils/ErrorHandler.js';

export const reserveSeat = async (req, res, next) => {
    try {
        const { email: rawEmail } = req.body;

        if (!rawEmail) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const email = rawEmail.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const confirmedSeat = await Seat.findOne({ email, status: 'confirmed' });

        if (confirmedSeat) {
            return res.status(400).json({ message: `Email already has a confirmed seat ${confirmedSeat.seatNumber}`});
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 2 * 60 * 1000);

        const existingHold = await Seat.findOne({
            email,
            status: 'held',
            expiresAt: { $gt: now }
        });

        if (existingHold) {
            return res.status(200).json({
                holdId: existingHold.holdId,
                expiresAt: existingHold.expiresAt,
                message: `You already hold the sit #${existingHold.seatNumber}`
            });
        }

        const holdId = randomUUID();
        const reservedSeat = await Seat.findOneAndUpdate(
            {
                $or: [
                    { status: 'available' },
                    { status: 'held', expiresAt: { $lte: now } },
                ],
            },
            {
                $set: {
                    status: 'held',
                    email,
                    holdId,
                    expiresAt,
                },
            },
            { returnDocument: 'after' }
        );

        if (!reservedSeat) {
            return res.status(400).json({ message: 'No seats available' });
        }

        res.status(200).json({
            holdId: reservedSeat.holdId,
            expiresAt: reservedSeat.expiresAt,
        });
    }

    catch (error) {
        next(new ErrorHandler(error.message, 500));
    }
};