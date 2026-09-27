import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, Scissors, User as UserIcon, Timer, CheckCircle, AlertTriangle } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { format, parseISO } from 'date-fns';

const Queue: React.FC = () => {
  const { queue, barbers, settings, services } = useStorage();
  const [timeNow, setTimeNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTimeNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nowServing = queue.filter(e => e.status === 'IN_SERVICE');
  const called = queue.filter(e => e.status === 'CALLED');
  const waiting = queue.filter(e => e.status === 'WAITING')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const getBarberName = (id: string | null) => {
    return barbers.find(b => b.id === id)?.name || 'Any Barber';
  };

  const getServicePrice = (id: string) => {
    return services.find(s => s.id === id)?.price || '0';
  };

  // Calculate live countdown for an item based on estimated start time
  const getRemainingMinutes = (estimatedStartTimeStr: string) => {
    try {
      const estTime = new Date(estimatedStartTimeStr).getTime();
      const diffMs = estTime - timeNow.getTime();
      if (diffMs <= 0) return 0;
      return Math.ceil(diffMs / 60000);
    } catch (e) {
      return Number(settings?.avgServiceTime) || 30;
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-7xl text-white">
      <div className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/10 blur-[100px] rounded-full pointer-events-none"></div>
        <span className="text-gold text-xs font-bold uppercase tracking-[0.3em] bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20">
          Live Digital Floor Board
        </span>
        <h1 className="text-4xl md:text-6xl font-display font-black mt-4 mb-4 tracking-tight">
          Live Studio <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-300">Waitlist</span>
        </h1>
        <p className="text-white/50 max-w-xl mx-auto text-sm md:text-base">
          Real-time premium queue timeline tracking. Monitor your position, active barber assignment, and live automated countdown timers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Status Board Column */}
        <div className="lg:col-span-1 space-y-6">

          {/* NOW SERVING CARD */}
          <div className="glass-card p-6 md:p-8 border-gold/40 bg-neutral-900/80 backdrop-blur-xl relative overflow-hidden rounded-[2rem] shadow-2xl">
            <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">LIVE SERVICE</span>
            </div>

            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gold mb-6 flex items-center gap-2">
              <Scissors className="w-3.5 h-3.5" /> Currently In Service
            </h2>

            <div className="space-y-4">
              {nowServing.length > 0 ? (
                nowServing.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-gold/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-gold to-amber-500 rounded-xl flex flex-col items-center justify-center text-black font-display font-black shadow-lg shadow-gold/10">
                        <span className="text-[10px] font-sans opacity-70 leading-none">TOKEN</span>
                        <span className="text-xl font-black leading-none mt-0.5">{entry.tokenNumber}</span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg group-hover:text-gold transition-colors leading-tight">{entry.customerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-white/60 font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            {entry.serviceName}
                          </span>
                          <span className="text-[10px] text-gold font-black bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                            ₹{getServicePrice(entry.serviceId)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right border-l border-white/10 pl-4">
                      <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Serving Barber</p>
                      <p className="text-sm font-black text-gold mt-0.5 flex items-center justify-end gap-1.5">
                         <UserIcon className="w-3 h-3" /> {getBarberName(entry.barberId)}
                      </p>
                      <div className="mt-2 text-right">
                        <span className="text-[9px] font-bold text-white/40 block uppercase tracking-wider">Time Remaining</span>
                        <span className="text-xs font-mono font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 inline-block mt-0.5 animate-pulse">
                          {(() => {
                            const duration = entry.serviceDuration || 30;
                            const startStr = entry.serviceStartTime || entry.createdAt;
                            const startMs = new Date(startStr).getTime();
                            const elapsedMs = timeNow.getTime() - startMs;
                            const remainingMs = (duration * 60000) - elapsedMs;
                            if (remainingMs <= 0) return '00:00';
                            const min = Math.floor(remainingMs / 60000);
                            const sec = Math.floor((remainingMs % 60000) / 1000);
                            return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-8 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                  <p className="text-white/30 text-xs italic">All grooming stations are currently open</p>
                </div>
              )}
            </div>
          </div>

          {/* UP NEXT / CALLED CARD */}
          <div className="glass-card p-6 border-white/5 bg-neutral-900/60 rounded-[2rem]">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-5 flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-white/30" /> Action Required (Called)
            </h2>
            <div className="space-y-3">
              <AnimatePresence>
                {called.length > 0 ? (
                  called.map(entry => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-pulse"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500 text-black flex flex-col items-center justify-center font-display font-black text-sm shadow-md">
                          <span className="text-[8px] opacity-60 leading-none">TOKEN</span>
                          <span className="text-base font-black leading-none mt-0.5">{entry.tokenNumber}</span>
                        </div>
                        <div>
                          <p className="font-bold text-white text-base">{entry.customerName}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {entry.serviceName}
                            </span>
                            <span className="text-[10px] text-gold font-bold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                              ₹{getServicePrice(entry.serviceId)}
                            </span>
                          </div>
                          <p className="text-[10px] text-white/50 font-medium mt-1 flex items-center gap-1">
                            Selected Barber: <span className="text-white font-bold">{getBarberName(entry.barberId)}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500 text-black px-2 py-1 rounded">
                        PROCEED
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-white/20 text-xs italic py-2 text-center">No tokens currently flagged for transition.</p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* LIVE TOTAL STATS COUNTER */}
          <div className="glass-card p-5 bg-gradient-to-b from-neutral-900 to-black border-white/5 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Waiting Line</p>
                <p className="text-xl font-display font-black text-white">{waiting.length} Clients</p>
              </div>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                <Timer className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Est. Wait Max</p>
                <p className="text-xl font-display font-black text-gold">
                  {waiting.reduce((acc, curr) => acc + (getRemainingMinutes(curr.estimatedStartTime) > 0 ? 1 : 0), 0) * (Number(settings?.avgServiceTime) || 30)} min
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Live Timeline Grid Column */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden border-white/5 bg-neutral-900/40 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gold animate-ping"></div>
                <h2 className="font-display font-black text-xl uppercase tracking-wider">Active Timeline Sequence</h2>
              </div>
              <span className="text-[10px] text-gold font-bold uppercase bg-gold/10 border border-gold/20 px-3 py-1 rounded-full tracking-wider animate-pulse">
                Auto Synced Continuous
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-white/30 uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.01]">
                    <th className="px-6 py-4 font-black">Position</th>
                    <th className="px-6 py-4 font-black">Token</th>
                    <th className="px-6 py-4 font-black">Customer</th>
                    <th className="px-6 py-4 font-black">Service & Price</th>
                    <th className="px-6 py-4 font-black">Barber</th>
                    <th className="px-6 py-4 font-black text-center">Wait Time</th>
                    <th className="px-6 py-4 font-black text-right">Start Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {waiting.length > 0 ? (
                    waiting.map((entry, idx) => {
                      const minutesLeft = getRemainingMinutes(entry.estimatedStartTime);

                      return (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="text-sm hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-6 py-5 font-bold text-white/40 font-mono">
                            <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs group-hover:bg-gold/20 group-hover:text-gold transition-all">
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-6 py-5 font-black text-gold text-base tracking-tight">{entry.tokenNumber}</td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-white text-base">{entry.customerName}</span>
                              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Customer</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                              <span className="text-white/90 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 w-fit">{entry.serviceName}</span>
                              <span className="text-xs text-gold font-black flex items-center gap-1">
                                <span className="opacity-50 text-[10px]">PRICE:</span> ₹{getServicePrice(entry.serviceId)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 bg-gold/5 border border-gold/20 px-3 py-1 rounded-lg w-fit">
                                <Scissors className="w-3 h-3 text-gold" />
                                <span className="text-sm font-black text-white">{getBarberName(entry.barberId)}</span>
                              </div>
                              <span className="text-[9px] text-white/30 uppercase font-black tracking-tighter pl-1">Selected Barber</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-gold/5 border border-gold/10 px-3 py-1.5 rounded-xl text-gold font-bold font-mono text-xs">
                              <Clock className="w-3 h-3 text-gold animate-pulse" />
                              <span>{minutesLeft > 0 ? `~${minutesLeft} mins` : 'Next Up'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right font-mono font-bold text-white/40 group-hover:text-gold transition-colors text-xs">
                            {format(parseISO(entry.estimatedStartTime), 'hh:mm a')}
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-24 text-center text-white/20 italic">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <CheckCircle className="w-8 h-8 text-white/10" />
                          <p className="text-sm tracking-wide">The waiting line is completely clear.</p>
                          <p className="text-xs text-white/10 not-italic uppercase tracking-widest font-bold">Ready for luxury walk-ins</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Queue;
