import Seat from '../models/Seat.js';
import ErrorHandler from '../utils/ErrorHandler.js';

export const getSeatStatus = async (req, res, next) => {
    try {
        const totalSeats = 30;
        const now = new Date();

        const confirmed = await Seat.countDocuments({
            status: 'confirmed'
        });

        const held = await Seat.countDocuments({
            status: 'held',
            expiresAt: { $gt: now }
        });

        const available = totalSeats - (confirmed + held);

        return res.status(200).json({
            totalSeats,
            confirmed,
            held,
            available
        });

    } catch (error) {
        next(new ErrorHandler(error.message, 500));
    }
};