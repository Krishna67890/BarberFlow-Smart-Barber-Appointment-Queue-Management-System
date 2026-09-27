import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, Play, Bell, UserPlus, SkipForward, XCircle, Clock } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { updateQueueStatus } from '../storage/queueManager';
import { useToast } from '../components/Toast';
import { format, parseISO } from 'date-fns';

const BarberDashboard: React.FC = () => {
  const { queue, barbers } = useStorage();
  const { showToast } = useToast();
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);

  if (!selectedBarberId) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <h1 className="text-4xl font-display text-center mb-12">Barber Entrance</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {barbers.map((barber) => (
            <button
              key={barber.id}
              onClick={() => setSelectedBarberId(barber.id)}
              className="glass-card p-6 flex items-center gap-6 hover:border-gold/50 transition-all text-left group"
            >
              <img src={barber.avatar} alt={barber.name} className="w-20 h-20 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" />
              <div>
                <h3 className="text-xl font-bold">{barber.name}</h3>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{barber.experience}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-gold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
                  Active Session
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const barber = barbers.find(b => b.id === selectedBarberId)!;
  const barberQueue = queue.filter(e => e.barberId === selectedBarberId);

  const currentCustomer = barberQueue.find(e => e.status === 'IN_SERVICE');
  const calledCustomer = barberQueue.find(e => e.status === 'CALLED');
  const nextCustomers = barberQueue.filter(e => e.status === 'WAITING').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const completedToday = barberQueue.filter(e => e.status === 'COMPLETED').length;

  const handleStatusUpdate = (id: string, status: any) => {
    updateQueueStatus(id, status);
    showToast(`Customer status updated to ${status}`);
  };

  const callNext = () => {
    if (nextCustomers.length > 0) {
      handleStatusUpdate(nextCustomers[0].id, 'CALLED');
    } else {
      showToast('No more customers in queue', 'info');
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Barber Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <img src={barber.avatar} alt={barber.name} className="w-20 h-20 rounded-2xl border-2 border-gold/20 object-cover" />
          <div>
            <h1 className="text-4xl font-display font-bold">{barber.name}</h1>
            <p className="text-gold font-bold uppercase tracking-widest text-xs">{barber.experience} Artisan</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-card px-6 py-3 border-white/10 flex flex-col items-center">
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Completed Today</span>
            <span className="text-2xl font-bold">{completedToday}</span>
          </div>
          <button
            onClick={() => setSelectedBarberId(null)}
            className="text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest"
          >
            Switch Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Controls */}
        <div className="lg:col-span-2 space-y-8">

          {/* Currently Serving */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Play className="w-4 h-4" /> Active Service
            </h2>

            {currentCustomer ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 border-gold border-2 bg-gold/5 flex flex-col md:flex-row justify-between items-center gap-8"
              >
                <div className="text-center md:text-left">
                  <span className="text-7xl font-display font-bold text-gold">#{currentCustomer.tokenNumber.split('-')[1]}</span>
                  <h3 className="text-2xl font-bold mt-2">{currentCustomer.customerName}</h3>
                  <p className="text-white/60 font-medium">{currentCustomer.serviceName}</p>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleStatusUpdate(currentCustomer.id, 'COMPLETED')}
                    className="bg-emerald-600 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5" /> COMPLETE SERVICE
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(currentCustomer.id, 'NO_SHOW')}
                    className="bg-white/5 text-rose-500 border border-rose-500/30 font-bold py-3 px-8 rounded-xl hover:bg-rose-500/10 transition-colors"
                  >
                    MARK AS NO-SHOW
                  </button>
                </div>
              </motion.div>
            ) : calledCustomer ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 border-cyan-500/50 bg-cyan-500/5 flex flex-col md:flex-row justify-between items-center gap-8"
              >
                 <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-4">
                    Customer Called
                  </div>
                  <h3 className="text-6xl font-display font-bold">#{calledCustomer.tokenNumber.split('-')[1]}</h3>
                  <p className="text-xl font-bold mt-2">{calledCustomer.customerName}</p>
                  <p className="text-white/40">{calledCustomer.serviceName}</p>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleStatusUpdate(calledCustomer.id, 'IN_SERVICE')}
                    className="bg-cyan-600 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-500 transition-colors"
                  >
                    <Play className="w-5 h-5" /> START SERVICE
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(calledCustomer.id, 'WAITING')}
                    className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest mt-2"
                  >
                    REVERT TO WAITING
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-12 text-center border-white/5 bg-white/[0.01]">
                <Bell className="w-12 h-12 text-white/10 mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-4">Ready for Next Customer?</h3>
                <button
                  onClick={callNext}
                  className="bg-gold text-black font-bold py-4 px-12 rounded-xl text-lg hover:scale-105 transition-transform"
                >
                  CALL NEXT CUSTOMER
                </button>
              </div>
            )}
          </section>

          {/* Upcoming in Queue */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Users className="w-4 h-4" /> Your Waiting List
            </h2>

            <div className="glass-card overflow-hidden border-white/10">
              <table className="w-full">
                <tbody className="divide-y divide-white/5">
                  {nextCustomers.length > 0 ? nextCustomers.map((c, i) => (
                    <tr key={c.id} className="group hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-bold text-lg">#{c.tokenNumber.split('-')[1]}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold">{c.customerName}</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase">{c.serviceName}</p>
                      </td>
                      <td className="px-6 py-4 text-white/40 text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(c.createdAt), 'hh:mm a')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button
                            onClick={() => handleStatusUpdate(c.id, 'CALLED')}
                            className="bg-white/10 p-2 rounded-lg hover:bg-gold hover:text-black transition-colors"
                            title="Call Now"
                           >
                            <Bell className="w-4 h-4" />
                           </button>
                           <button
                            onClick={() => handleStatusUpdate(c.id, 'CANCELLED')}
                            className="bg-white/10 p-2 rounded-lg hover:bg-rose-500 hover:text-white transition-colors"
                            title="Cancel Token"
                           >
                            <XCircle className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-6 py-12 text-center text-white/20 italic">No customers waiting specifically for you.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/10">
            <h3 className="font-display font-bold text-sm uppercase tracking-widest mb-6">Service Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/50">Customers Waiting</span>
                <span className="font-bold">{nextCustomers.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/50">Est. Wait Time</span>
                <span className="font-bold text-gold">{nextCustomers.length * 20}m</span>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-white/50">Session Productivity</span>
                  <span className="text-emerald-500 font-bold">88%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[88%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-white/10">
            <h3 className="font-display font-bold text-sm uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <button className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors">
                Broadcast Announcement
              </button>
              <button className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors">
                Break Time (15m)
              </button>
              <button className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors">
                End Day Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberDashboard;
