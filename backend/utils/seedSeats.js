import Seat from '../models/Seat.js';

async function seedSeats() {
    const count = await Seat.countDocuments();
    if (count === 0) {
        const seats = Array.from({ length: 30 }, (_, i) => ({ seatNumber: i + 1 }));
        await Seat.insertMany(seats);
        console.log('Seeded 30 seats');
    }
}

export default seedSeats;