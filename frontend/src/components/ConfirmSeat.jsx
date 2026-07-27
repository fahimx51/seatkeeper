import { useState } from 'react';
import { confirmSeat } from '../services/api';

function ConfirmSeat({ onConfirmSuccess }) {
    const [holdId, setHoldId] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleConfirm = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!holdId) {
            setErrorMsg('Please enter a Hold ID.');
            return;
        }

        setLoading(true);

        try {
            const data = await confirmSeat(holdId);
            setSuccessMsg(data.message || 'Seat confirmed successfully!');
            if (onConfirmSuccess) onConfirmSuccess();
            setHoldId('');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to confirm seat.';
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

            {successMsg && (
                <div className="bg-emerald-500/10 text-emerald-400 text-xs p-3 rounded-lg text-center font-medium">
                    {successMsg}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleConfirm} className="space-y-4">
                <div>
                    <label htmlFor="holdId" className="block text-xs font-medium text-slate-400 mb-1.5">
                        Hold ID
                    </label>
                    <input
                        id="holdId"
                        type="text"
                        placeholder="e.g. hold_123"
                        value={holdId}
                        onChange={(e) => setHoldId(e.target.value)}
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
                    {loading ? 'Confirming...' : 'Confirm Seat'}
                </button>
            </form>
        </div>
    );
}

export default ConfirmSeat;