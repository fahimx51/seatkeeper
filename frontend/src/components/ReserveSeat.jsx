import { useState } from 'react';
import { reserveSeat } from '../services/api';

function ReserveSeat({ onReserveSuccess }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleReserve = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!email) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            const data = await reserveSeat(email);
            setSuccessMsg(`${data.message}`);

            if (onReserveSuccess) {
                onReserveSuccess(data);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to reserve seat.';
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            {/* Alerts */}
            {errorMsg && (
                <div className="bg-red-500/10 text-red-400 text-xs p-3 rounded-lg text-center font-medium">
                    {errorMsg}
                </div>
            )}

            {successMsg && (
                <div className="bg-emerald-500/10 text-emerald-400 text-xs p-3 rounded-lg text-center font-medium">
                    {successMsg}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleReserve} className="space-y-4">
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
                    {loading ? 'Reserving...' : 'Reserve Seat'}
                </button>
            </form>
        </div>
    );
}

export default ReserveSeat;