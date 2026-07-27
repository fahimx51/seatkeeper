import { useEffect, useState } from 'react';
import { getSeatStatus } from '../services/api';

function GetStatus() {
    const [status, setStatus] = useState({ available: 0, held: 0, confirmed: 0 });
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchStatus = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const data = await getSeatStatus();
            setStatus({
                available: data.available || 0,
                held: data.held || 0,
                confirmed: data.confirmed || 0,
            });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to fetch status.';
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            {/* Alert */}
            {errorMsg && (
                <div className="bg-red-500/10 text-red-400 text-xs p-3 rounded-lg text-center font-medium">
                    {errorMsg}
                </div>
            )}

           
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl">
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
                        Available
                    </span>
                    <span className="block text-2xl font-bold text-emerald-400 mt-1">
                        {loading ? '...' : status.available}
                    </span>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl">
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
                        Held
                    </span>
                    <span className="block text-2xl font-bold text-amber-400 mt-1">
                        {loading ? '...' : status.held}
                    </span>
                </div>

                {/* Confirmed */}
                <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl">
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
                        Confirmed
                    </span>
                    <span className="block text-2xl font-bold text-indigo-400 mt-1">
                        {loading ? '...' : status.confirmed}
                    </span>
                </div>
            </div>

            <button
                onClick={fetchStatus}
                disabled={loading}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
                {loading ? 'Updating...' : 'Refresh Status'}
            </button>
        </div>
    );
}

export default GetStatus;