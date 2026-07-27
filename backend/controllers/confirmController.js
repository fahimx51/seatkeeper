import Seat from "../models/Seat.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const confirmSeat = async (req, res, next) => {
    try {
        const { holdId } = req.body;

        if (!holdId) {
            return res.status(400).json({ message: 'holdId is required' });
        }

        const now = new Date();

        const alreadyBooked = await Seat.findOne({
            holdId,
            status: 'confirmed'
        });


        if (alreadyBooked) {
            return res.status(200).json({
                message: `You have already booked sit ${alreadyBooked.seatNumber}`
            });
        }

        const confirmedSeat = await Seat.findOneAndUpdate(
            {
                holdId,
                status: 'held',
                expiresAt: { $gt: now }
            },
            {
                $set: {
                    status: 'confirmed',
                    expiresAt: null
                }
            },
            { returnDocument: 'after' }
        );

        if (!confirmedSeat) {
            return res.status(400).json({
                message: 'Invalid hold ID or hold has expired'
            });
        }

        res.status(200).json({
            message: 'Seat confirmed successfully',
            seatNumber: confirmedSeat.seatNumber,
            status: confirmedSeat.status,
            email: confirmedSeat.email
        });

    }
    catch (error) {
        next(new ErrorHandler(error.message, 500));
    }
};