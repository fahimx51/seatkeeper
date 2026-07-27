import { useState, useEffect } from 'react';
import ReserveSeat from './components/ReserveSeat';
import ConfirmSeat from './components/ConfirmSeat';
import GetStatus from './components/GetStatus';
import ReservationStatus from './components/ReservationStatus';

function App() {
  const [activeTab, setActiveTab] = useState('reserve');
  const [timeLeft, setTimeLeft] = useState(0); // Time in seconds
  const [reservationInfo, setReservationInfo] = useState(null);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setReservationInfo(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);


  const handleReserveSuccess = (data) => {
    const secondsLeft = Math.max(
      0,
      Math.round((new Date(data.expiresAt).getTime() - Date.now()) / 1000)
    );
    setReservationInfo(data);
    setTimeLeft(secondsLeft);
  };

  const handleConfirmSuccess = () => {
    setTimeLeft(0);
    setReservationInfo(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'reserve', label: 'Reserve Seat', description: 'Hold a seat for 2 minutes' },
    { id: 'confirm', label: 'Confirm Seat', description: 'Finalize your held reservation' },
    { id: 'status', label: 'Seat Status', description: 'Check live seat metrics' },
    { id: 'reservations', label: 'My Bookings', description: 'View active reservations' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />

      <div className="w-full max-w-2xl space-y-8 z-10">


        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Seat<span className="text-indigo-500">Keeper</span>
          </h1>
          <p className="text-sm text-slate-400">
            Select an action to manage your seats
          </p>
        </div>

        {timeLeft > 0 && reservationInfo && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                Seat Reserved Temporarily
              </p>
              <p className="text-sm text-slate-200 mt-0.5">
                Hold ID: <span className="font-mono text-indigo-400 font-bold">{reservationInfo.holdId}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Expires in</span>
              <span className="text-xl font-mono font-bold text-amber-400">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${isActive
                  ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
              >
                <div className="space-y-0.5">
                  <h3
                    className={`text-base font-bold transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-200'
                      }`}
                  >
                    {tab.label}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {tab.description}
                  </p>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isActive
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-slate-700'
                    }`}
                >
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>


        <div className="pt-2 transition-all">
          {activeTab === 'reserve' && (
            <ReserveSeat onReserveSuccess={handleReserveSuccess} />
          )}
          {activeTab === 'confirm' && <ConfirmSeat onConfirmSuccess={handleConfirmSuccess} />}
          {activeTab === 'status' && <GetStatus />}
          {activeTab === 'reservations' && <ReservationStatus />}
        </div>

      </div>
    </div>
  );
}

export default App;