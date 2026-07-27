import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
    {
        holdId: {
            type: String,
            default: null,
        },
        seatNumber: {
            type: Number,
            required: true,
            unique: true,
            min: 1,
            max: 30,
        },
        status: {
            type: String,
            enum: ['available', 'held', 'confirmed'],
            default: 'available',
        },
        email: {
            type: String,
            default: null,
            lowercase: true,
            trim: true,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes to speed up queries when finding seats by holdId or status
seatSchema.index({ holdId: 1 });
seatSchema.index({ status: 1, expiresAt: 1 });

const Seat = mongoose.model('Seat', seatSchema);

export default Seat;