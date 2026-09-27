import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Users, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { updateQueueStatus } from '../storage/queueManager';
import { useToast } from '../components/Toast';
import { format, parseISO } from 'date-fns';

const Track: React.FC = () => {
  const location = useLocation();
  const { showToast } = useToast();
  const { queue, appointments, barbers, settings } = useStorage();

  const [searchPhone, setSearchPhone] = useState('');
  const [activeEntry, setActiveEntry] = useState<any>(null);
  const [activeAppointment, setActiveAppointment] = useState<any>(null);

  useEffect(() => {
    if (location.state?.phone) {
      setSearchPhone(location.state.phone);
      findAndSetEntry(location.state.phone);
    }
  }, [location.state, queue, appointments]);

  const [timeNow, setTimeNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTimeNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const findAndSetEntry = (phone: string) => {
    const cleanPhone = phone.trim();

    // Find in Queue
    const foundQueue = queue.find(
      e => e.phone.trim() === cleanPhone && (e.status === 'WAITING' || e.status === 'CALLED' || e.status === 'IN_SERVICE')
    );

    // Find in Appointments
    const foundApp = appointments.find(
      a => a.customerPhone.trim() === cleanPhone && (a.status === 'CONFIRMED' || a.status === 'PENDING')
    );

    setActiveEntry(foundQueue || null);
    setActiveAppointment(foundApp || null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone) {
      showToast('Please enter your Mobile Number', 'error');
      return;
    }
    findAndSetEntry(searchPhone);
    if (!activeEntry && !activeAppointment) {
      showToast('No active booking or appointment found', 'info');
    }
  };

  const handleCancel = () => {
    if (!activeEntry) return;
    if (window.confirm('Are you sure you want to cancel your place in the waitlist queue?')) {
      updateQueueStatus(activeEntry.id, 'CANCELLED');
      showToast('Your queue token has been cancelled successfully', 'info');
      setActiveEntry(null);
    }
  };

  // Calculations
  const waitingQueue = queue.filter(e => e.status === 'WAITING' || e.status === 'CALLED');
  const indexInWaiting = activeEntry ? waitingQueue.findIndex(e => e.id === activeEntry.id) : -1;
  const peopleAhead = indexInWaiting > 0 ? indexInWaiting : 0;
  const currentStatus = activeEntry?.status;

  // Status Message Guidelines
  let statusMessage = "You're in the queue.";
  let statusProgress = 20;
  if (currentStatus === 'CALLED') {
    statusMessage = "You're next! Please proceed to the barber chair immediately.";
    statusProgress = 80;
  } else if (currentStatus === 'IN_SERVICE') {
    statusMessage = "You are currently in the chair. Enjoy your premium grooming!";
    statusProgress = 100;
  } else if (peopleAhead === 0 && currentStatus === 'WAITING') {
    statusMessage = "You're next up in line! Get ready.";
    statusProgress = 60;
  } else if (peopleAhead <= 2) {
    statusMessage = "You're getting closer to the chair. Prepare to arrive shortly.";
    statusProgress = 40;
  }

  const assignedBarber = activeEntry ? barbers.find(b => b.id === activeEntry.barberId) : null;

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display mb-4">Track Your Token</h1>
        <p className="text-white/50">View real-time waiting metrics, ahead counts, and recommended arrival thresholds.</p>
      </div>

      {/* Search Bar Container */}
      <div className="glass-card p-6 border-white/10 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Mobile Number</label>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Enter registered mobile number"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-colors text-sm"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
              <button
                type="submit"
                className="bg-gold text-black font-bold px-6 rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {activeEntry ? (
          <motion.div
            key="status-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Main Token Display Card */}
            <div className="glass-card p-8 border-gold/30 bg-gradient-to-b from-gold/[0.03] to-transparent text-center relative overflow-hidden">
              {currentStatus === 'CALLED' && (
                <div className="absolute inset-0 bg-gold/10 animate-pulse pointer-events-none border border-gold/40 rounded-2xl" />
              )}

              <p className="text-xs uppercase font-bold text-white/40 tracking-widest mb-2">Your Live Token Number</p>
              <h2 className="text-6xl font-display font-bold text-gold tracking-tight mb-4">
                {activeEntry.tokenNumber}
              </h2>

              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 bg-gold/20 text-gold border border-gold/30">
                {currentStatus}
              </div>

              {/* Progress Indicator */}
              <div className="max-w-md mx-auto space-y-2 mb-4">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gold-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: `${statusProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm font-medium text-white/80">{statusMessage}</p>
                {currentStatus === 'IN_SERVICE' && (
                  <div className="mt-4">
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Service Time Remaining</p>
                    <div className="text-3xl font-mono font-black text-rose-400 animate-pulse">
                      {(() => {
                        const duration = activeEntry.serviceDuration || 30;
                        const startStr = activeEntry.serviceStartTime || activeEntry.createdAt;
                        const startMs = new Date(startStr).getTime();
                        const elapsedMs = timeNow.getTime() - startMs;
                        const remainingMs = (duration * 60000) - elapsedMs;
                        if (remainingMs <= 0) return '00:00';
                        const min = Math.floor(remainingMs / 60000);
                        const sec = Math.floor((remainingMs % 60000) / 1000);
                        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            {['WAITING', 'CALLED'].includes(currentStatus) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-6 flex items-center gap-4">
                  <Users className="w-6 h-6 text-white/40" />
                  <div>
                    <p className="text-2xl font-bold">{peopleAhead}</p>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">People Ahead</p>
                  </div>
                </div>

                <div className="glass-card p-6 flex items-center gap-4">
                  <Clock className="w-6 h-6 text-gold" />
                  <div>
                    <p className="text-2xl font-bold">~{(() => {
                      const avgTime = Number(settings?.avgServiceTime);
                      const computed = peopleAhead * (isNaN(avgTime) ? 30 : avgTime);
                      return isNaN(computed) ? 0 : computed;
                    })()}m</p>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Estimated Wait</p>
                  </div>
                </div>
              </div>
            )}

            {/* Details Summary Table */}
            <div className="glass-card p-6 border-white/10 space-y-4">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white/40 mb-2">Grooming Assignment</h3>
              <div className="flex justify-between border-b border-white/5 pb-3 text-sm">
                <span className="text-white/50">Requested Service</span>
                <span className="font-bold">{activeEntry.serviceName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3 text-sm">
                <span className="text-white/50">Assigned Barber</span>
                <span className="font-bold text-gold">{assignedBarber?.name || 'Any Barber'}</span>
              </div>
              {['WAITING', 'CALLED'].includes(currentStatus) && (
                <div className="flex justify-between border-b border-white/5 pb-3 text-sm">
                  <span className="text-white/50">Recommended Arrival</span>
                  <span className="font-bold text-emerald-400">
                    {format(new Date(parseISO(activeEntry.estimatedStartTime).getTime() - 10 * 60 * 1000), 'hh:mm a')}
                  </span>
                </div>
              )}
            </div>

            {/* Cancel Action */}
            {['WAITING', 'CALLED'].includes(currentStatus) && (
              <div className="text-center pt-2">
                <button
                  onClick={handleCancel}
                  className="text-rose-500 hover:text-rose-400 text-sm font-bold uppercase tracking-widest transition-colors"
                >
                  CANCEL MY QUEUE TOKEN
                </button>
              </div>
            )}
          </motion.div>
        ) : activeAppointment ? (
          <motion.div
            key="appointment-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Appointment Status Card */}
            <div className="glass-card p-8 border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.03] to-transparent text-center relative overflow-hidden">
              <p className="text-xs uppercase font-bold text-white/40 tracking-widest mb-2">Your Scheduled Appointment</p>
              <h2 className="text-5xl font-display font-bold text-emerald-400 tracking-tight mb-4 flex items-center justify-center gap-2">
                <Clock className="w-8 h-8" /> {activeAppointment.time}
              </h2>

              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {activeAppointment.status}
              </div>
              <p className="text-sm font-medium text-white/80">Your appointment is locked in for today! Please arrive 5 minutes early.</p>
            </div>

            {/* Details Summary Table */}
            <div className="glass-card p-6 border-white/10 space-y-4">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white/40 mb-2">Booking Info</h3>
              <div className="flex justify-between border-b border-white/5 pb-3 text-sm">
                <span className="text-white/50">Customer Name</span>
                <span className="font-bold">{activeAppointment.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3 text-sm">
                <span className="text-white/50">Service</span>
                <span className="font-bold">{activeAppointment.serviceName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3 text-sm">
                <span className="text-white/50">Barber Assigned</span>
                <span className="font-bold text-gold">{activeAppointment.barberName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3 text-sm">
                <span className="text-white/50">Price</span>
                <span className="font-bold text-emerald-400">₹{activeAppointment.servicePrice}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="glass-card p-12 text-center text-white/30 border-white/5">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="font-medium mb-1">No Active Booking Displayed</p>
            <p className="text-xs text-white/40">Enter your registered Mobile number above to view real-time status tracker dashboard.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Track;
