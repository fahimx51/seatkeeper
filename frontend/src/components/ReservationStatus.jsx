import { useState } from 'react';
import { getReservations } from '../services/api';

function ReservationStatus() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [reservation, setReservation] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setReservation(null);

        if (!email) {
            setErrorMsg('Please enter an email address.');
            return;
        }

        setLoading(true);

        try {
            const data = await getReservations(email);
            setReservation(data);
        } catch (err) {
            const msg = err.response?.data?.message || 'No reservation found for this email.';
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            
            {errorMsg && (
                <div className="bg-red-500/10 text-red-400 text-xs p-3 rounded-lg text-center font-medium">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSearch} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-600 disabled:opacity-50"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                    {loading ? 'Searching...' : 'Check Reservation'}
                </button>
            </form>

            {reservation && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 mt-4 text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Seat Number:</span>
                        <span className="font-bold text-white">#{reservation.seatNumber || reservation.seatId}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Status:</span>
                        <span
                            className={`font-semibold capitalize ${reservation.status === 'confirmed'
                                ? 'text-emerald-400'
                                : reservation.status === 'held'
                                    ? 'text-amber-400'
                                    : 'text-slate-300'
                                }`}
                        >
                            {reservation.status}
                        </span>
                    </div>

                    {reservation.holdId && (
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Hold ID:</span>
                            <span className="font-mono text-indigo-400">{reservation.holdId}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ReservationStatus;