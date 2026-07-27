import Seat from '../models/Seat.js';
import ErrorHandler from '../utils/ErrorHandler.js';

export const getReservationsByEmail = async (req, res, next) => {
    try {
        const { email: rawEmail } = req.query;

        if (!rawEmail) {
            return res.status(400).json({ message: 'email query parameter is required' });
        }

        const email = rawEmail.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const now = new Date();

        const reservationStatus = await Seat.findOne({
            email,
            $or: [
                { status: 'confirmed' },
                { status: 'held', expiresAt: { $gt: now } }
            ]
        }).lean();

        if (reservationStatus.status === "confirmed") {
            return res.status(200).json({
                status: reservationStatus.status,
                message: `Booked a seat with number #${reservationStatus.seatNumber}`
            });
        }
        else if (reservationStatus.status === "held") {
            return res.status(200).json({
                status: reservationStatus.status,
                holdId: reservationStatus.holdId,
                message: `Hold a seat with holdid #${reservationStatus.holdId}, confirm it before exipre`
            });
        }

        return res.status(200).json({
            message: 'No active reservations found for this email',
            email,
            reservations: []
        });

    } catch (error) {
        next(new ErrorHandler(error.message, 500));
    }
};