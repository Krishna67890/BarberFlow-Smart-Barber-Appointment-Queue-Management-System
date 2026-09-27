import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, History, Package, Search, Calendar, ChevronRight } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { format, parseISO } from 'date-fns';
import { useToast } from '../components/Toast';

const Customer: React.FC = () => {
  const { queue, history, barbers } = useStorage();
  const { showToast } = useToast();
  const [searchPhone, setSearchPhone] = useState('');
  const [activeCustomer, setActiveCustomer] = useState<{ phone: string; name: string } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone) return;

    // Find customer in queue or history
    const allRecords = [...queue, ...history];
    const customerRecord = allRecords.find(r => r.phone === searchPhone);

    if (customerRecord) {
      setActiveCustomer({ phone: searchPhone, name: customerRecord.customerName });
    } else {
      showToast('No records found for this phone number', 'error');
      setActiveCustomer(null);
    }
  };

  const customerQueue = queue.filter(q => q.phone === activeCustomer?.phone);
  const customerHistory = history.filter(h => h.phone === activeCustomer?.phone)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getBarberName = (id: string | null) => {
    return barbers.find(b => b.id === id)?.name || 'Any Barber';
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display mb-4">Customer Dashboard</h1>
        <p className="text-white/50">Access your active tokens, booking history, and personal grooming stats.</p>
      </div>

      {!activeCustomer ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 max-w-lg mx-auto text-center border-white/10"
        >
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-gold" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Identify Yourself</h2>
          <p className="text-white/40 text-sm mb-8">Enter your mobile number to view your dashboard.</p>

          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="tel"
              placeholder="Enter Mobile Number"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-gold outline-none text-center text-lg"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-gold text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform"
            >
              ACCESS DASHBOARD
            </button>
          </form>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-black font-bold text-xl">
                {activeCustomer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{activeCustomer.name}</h2>
                <p className="text-white/40 text-sm">{activeCustomer.phone}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveCustomer(null)}
              className="text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Logout / Switch Number
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Booking Card */}
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Active Tokens
              </h3>

              {customerQueue.length > 0 ? (
                customerQueue.map(item => (
                  <motion.div
                    key={item.id}
                    className="glass-card p-6 border-gold/30 bg-gold/5 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-4xl font-display font-bold text-gold">#{item.tokenNumber.split('-')[1]}</span>
                        <p className="text-sm text-white/60 font-medium mt-1">{item.serviceName}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-gold/20 text-gold border border-gold/30">
                          {item.status}
                        </span>
                        <p className="text-[10px] text-white/40 font-bold uppercase mt-2 tracking-widest">
                          {format(parseISO(item.estimatedStartTime), 'hh:mm a')}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-white/50 border-t border-white/5 pt-4">
                      <span>Barber: <span className="text-white font-bold">{getBarberName(item.barberId)}</span></span>
                      <button
                        onClick={() => window.location.href = `/track`}
                        className="text-gold font-bold flex items-center gap-1 hover:underline"
                      >
                        TRACK LIVE <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="glass-card p-12 text-center text-white/20 border-white/5 border-dashed">
                  <p>No active queue tokens.</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Package className="w-4 h-4" /> Grooming Summary
              </h3>
              <div className="glass-card p-6 border-white/10 divide-y divide-white/5">
                <div className="pb-4">
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Total Visits</p>
                  <p className="text-3xl font-bold">{customerHistory.length + customerQueue.length}</p>
                </div>
                <div className="py-4">
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Last Service</p>
                  <p className="text-sm font-bold">
                    {customerHistory[0]?.serviceName || 'No previous services'}
                  </p>
                  <p className="text-[10px] text-white/30 mt-1">
                    {customerHistory[0] ? format(parseISO(customerHistory[0].date), 'MMM dd, yyyy') : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking History */}
          <div className="space-y-6 pt-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              <History className="w-4 h-4" /> Service History
            </h3>

            <div className="glass-card overflow-hidden border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] text-white/30 uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Barber</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customerHistory.length > 0 ? customerHistory.map(item => (
                    <tr key={item.id} className="text-sm hover:bg-white/[0.01]">
                      <td className="px-6 py-4 text-white/50">{format(parseISO(item.date), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 font-bold">{item.serviceName}</td>
                      <td className="px-6 py-4 text-white/50">{getBarberName(item.barberId)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase ${
                          item.status === 'COMPLETED' ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-white/20 italic">No history available yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;
