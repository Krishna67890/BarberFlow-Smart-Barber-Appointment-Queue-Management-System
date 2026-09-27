import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storageService } from '../storage/storageService';
import { useStorage } from '../hooks/useStorage';
import { Scissors, Users, Clock, Calendar } from 'lucide-react';

const Display: React.FC = () => {
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shopId') || 'ADMIN';
  const { queue, appointments } = useStorage();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [timeNow, setTimeNow] = useState(new Date());

  const shop = storageService.getShopById(shopId);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
      setTimeNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const serving = queue.filter(e => e.status === 'IN_SERVICE' && e.shopId === shopId);
  const waiting = queue.filter(e => (e.status === 'WAITING' || e.status === 'CALLED') && e.shopId === shopId);
  const confirmedAppointments = appointments.filter(a => a.status === 'CONFIRMED' && a.shopId === shopId);

  const getRemainingTime = (entry: any) => {
    const duration = entry.serviceDuration || 30;
    const startStr = entry.serviceStartTime || entry.createdAt;
    const startMs = new Date(startStr).getTime();
    const elapsedMs = timeNow.getTime() - startMs;
    const remainingMs = (duration * 60000) - elapsedMs;
    if (remainingMs <= 0) return '00:00';
    const min = Math.floor(remainingMs / 60000);
    const sec = Math.floor((remainingMs % 60000) / 1000);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12 flex flex-col font-sans select-none">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 mb-8 gap-4">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gold text-black flex items-center justify-center rounded-xl shadow-lg shadow-gold/20">
               <Scissors className="w-6 h-6 animate-pulse" />
            </div>
            <div>
               <h1 className="text-2xl lg:text-3xl font-display font-black tracking-tight uppercase">{shop?.name || "Premium Barber Shop"}</h1>
               <p className="text-xs text-gold font-bold tracking-[0.3em] uppercase">Live TV Waiting & Appointments Monitor Terminal ({shopId})</p>
            </div>
         </div>
         <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="text-2xl lg:text-3xl font-black text-white/90">{time}</div>
            <div className="text-xs text-white/40 uppercase tracking-widest font-bold flex items-center gap-2 sm:justify-end">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Live Broadcast
            </div>
         </div>
      </header>

      {/* Advanced Layout Grid */}
      <div className="flex-grow grid grid-cols-1 xl:grid-cols-3 gap-8">

         {/* Column 1: Now Serving Block */}
         <div className="bg-gradient-to-br from-neutral-900 to-black border-2 border-gold/40 rounded-[2rem] p-6 lg:p-8 flex flex-col shadow-[0_0_50px_rgba(212,175,55,0.05)]">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
               <h2 className="text-xl font-bold flex items-center gap-3 text-gold">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span> NOW SERVING
               </h2>
               <span className="text-xs text-white/40 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{serving.length} Active</span>
            </div>

            <div className="flex-grow space-y-4 overflow-y-auto no-scrollbar">
               {serving.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/20 italic text-base">Chairs currently free. Join waitlist lines instantly!</div>
               ) : (
                  serving.map(entry => (
                     <div key={entry.id} className="p-5 bg-gold/5 border border-gold/20 rounded-2xl flex justify-between items-center">
                        <div>
                           <div className="text-4xl font-black text-gold mb-1">{entry.tokenNumber}</div>
                           <div className="text-lg font-bold text-white/90">{entry.customerName}</div>
                           <div className="text-xs text-white/40 font-medium">Barber: {entry.barberName || 'Any Available'}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs font-bold text-white/70 bg-white/5 border border-white/10 px-3 py-2 rounded-xl uppercase tracking-wider mb-2">{entry.serviceName}</div>
                           <div className="text-xs font-mono font-black text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 animate-pulse">
                              {getRemainingTime(entry)}
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Column 2: Upcoming Live Waitlist */}
         <div className="bg-neutral-900/30 border border-white/10 rounded-[2rem] p-6 lg:p-8 flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
               <h2 className="text-xl font-bold text-white/70 flex items-center gap-3">
                  <Users className="text-white/40 w-5 h-5" /> NEXT IN QUEUE
               </h2>
               <span className="text-xs text-white/40 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{waiting.length} Waiting</span>
            </div>

            <div className="flex-grow space-y-3 overflow-y-auto no-scrollbar">
               {waiting.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/20 italic text-base">No one waiting in line. Walk in directly!</div>
               ) : (
                  waiting.map((entry, index) => (
                     <div key={entry.id} className={`p-4 rounded-xl flex items-center justify-between ${entry.status === 'CALLED' ? 'bg-gold/10 border border-gold/40' : 'bg-white/5 border border-white/5'}`}>
                        <div>
                           <div className="flex items-center gap-2">
                              <span className="text-2xl font-black text-white">{entry.tokenNumber}</span>
                              {entry.status === 'CALLED' && (
                                 <span className="text-[9px] font-bold bg-gold text-black px-1.5 py-0.5 rounded animate-bounce">CALLED</span>
                              )}
                           </div>
                           <div className="font-bold text-white/80 text-sm truncate max-w-[150px]">{entry.customerName}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs font-bold text-gold tracking-widest uppercase">Pos #{index + 1}</div>
                           <div className="text-[11px] text-white/40 truncate max-w-[120px]">{entry.serviceName}</div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Column 3: Scheduled Appointments List */}
         <div className="bg-neutral-900/30 border border-white/10 rounded-[2rem] p-6 lg:p-8 flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
               <h2 className="text-xl font-bold text-white/70 flex items-center gap-3">
                  <Calendar className="text-white/40 w-5 h-5" /> TODAY'S BOOKINGS
               </h2>
               <span className="text-xs text-white/40 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{confirmedAppointments.length} Confirmed</span>
            </div>

            <div className="flex-grow space-y-3 overflow-y-auto no-scrollbar">
               {confirmedAppointments.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/20 italic text-base">No scheduled appointments for today.</div>
               ) : (
                  confirmedAppointments.map((app) => (
                     <div key={app.id} className="p-4 bg-white/5 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                        <div>
                           <div className="flex items-center gap-2 text-emerald-400 font-black text-lg">
                              <Clock className="w-4 h-4" /> {app.time}
                           </div>
                           <div className="font-bold text-white/80 text-sm truncate max-w-[150px]">{app.customerName}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs font-bold text-white/60 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md inline-block uppercase tracking-wider mb-1">
                              {app.barberName}
                           </div>
                           <div className="text-[11px] text-white/40 truncate max-w-[120px]">{app.serviceName}</div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

      </div>
    </div>
  );
};

export default Display;
