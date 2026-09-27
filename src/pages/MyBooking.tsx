import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  Timer,
  Users,
  Scissors,
  User,
  Calendar,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { format } from 'date-fns';

const MyBooking: React.FC = () => {
  const location = useLocation();
  const { queue, barbers, services, settings } = useStorage();

  // Try to get token from navigation state or search params
  const [searchToken, setSearchToken] = useState(location.state?.tokenNumber || '');
  const [searchPhone, setSearchPhone] = useState(location.state?.phone || '');
  const [activeToken, setActiveToken] = useState<any>(null);

  useEffect(() => {
    if (searchToken && searchPhone) {
      const entry = queue.find(q => q.tokenNumber === searchToken && q.phone === searchPhone);
      if (entry) {
        setActiveToken(entry);
      }
    }
  }, [queue, searchToken, searchPhone]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = queue.find(q => q.tokenNumber === searchToken && q.phone === searchPhone);
    if (entry) {
      setActiveToken(entry);
    } else {
      alert('No booking found with these details.');
    }
  };

  const getPosition = () => {
    if (!activeToken) return 0;
    const waitingList = queue
      .filter(q => q.status === 'WAITING' || q.status === 'CALLED')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return waitingList.findIndex(q => q.id === activeToken.id) + 1;
  };

  const getWaitTime = () => {
    if (!activeToken) return 0;
    const pos = getPosition();
    if (pos <= 0) return 0;
    const avgTime = Number(settings?.avgServiceTime);
    const calculated = (pos - 1) * (isNaN(avgTime) ? 30 : avgTime) + 5;
    return isNaN(calculated) ? 5 : Math.max(5, calculated);
  };

  if (!activeToken) {
    return (
      <div className="container mx-auto px-6 py-20 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 border-white/10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Timer className="text-gold w-8 h-8" />
            </div>
            <h1 className="text-3xl font-display mb-2">Track Your Token</h1>
            <p className="text-white/50">Enter your details to check live queue status</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Token Number</label>
              <input
                type="text"
                placeholder="e.g. #21"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 focus:border-gold outline-none"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Phone Number</label>
              <input
                type="tel"
                placeholder="Enter registered mobile"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 focus:border-gold outline-none"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gold text-black py-4 rounded-xl font-bold tracking-widest uppercase hover:scale-[1.02] transition-transform mt-4"
            >
              Check Status
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-white/40">Haven't booked yet?</p>
            <Link to="/book" className="text-gold font-bold hover:underline mt-1 inline-block">
              Book a Service Now
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const pos = getPosition();
  const wait = getWaitTime();
  const barber = barbers.find(b => b.id === activeToken.barberId);
  const service = services.find(s => s.id === activeToken.serviceId);

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Main Status Card */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 border-gold/30 relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full -mr-16 -mt-16" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div>
                <span className="inline-block px-3 py-1 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest rounded-full mb-2">
                  Live Queue Tracking
                </span>
                <h2 className="text-4xl font-display">{activeToken.customerName}</h2>
                <p className="text-white/40 text-sm mt-1">Token generated at {format(new Date(activeToken.createdAt), 'hh:mm a')}</p>
              </div>
              <div className="text-right bg-black/40 border border-white/5 p-4 rounded-2xl min-w-[120px]">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter mb-1">Your Token</p>
                <p className="text-3xl font-display text-gold leading-none">{activeToken.tokenNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <Users className="w-5 h-5 text-gold mb-3" />
                <p className="text-2xl font-display leading-none">{pos > 0 ? pos : '--'}</p>
                <p className="text-[10px] font-bold text-white/40 uppercase mt-2">Queue Position</p>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <Timer className="w-5 h-5 text-gold mb-3" />
                <p className="text-2xl font-display leading-none">{activeToken.status === 'WAITING' ? `~${wait}` : '0'} <span className="text-sm font-sans text-white/40">min</span></p>
                <p className="text-[10px] font-bold text-white/40 uppercase mt-2">Est. Wait Time</p>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 col-span-2 md:col-span-1">
                <div className={`w-3 h-3 rounded-full mb-3 animate-pulse ${
                  activeToken.status === 'WAITING' ? 'bg-yellow-500' :
                  activeToken.status === 'CALLED' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <p className="text-xl font-display leading-none uppercase tracking-tighter">{activeToken.status.replace('_', ' ')}</p>
                <p className="text-[10px] font-bold text-white/40 uppercase mt-2">Current Status</p>
              </div>
            </div>

            {activeToken.status === 'CALLED' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                <p className="text-sm text-green-200 font-medium">It's your turn! Please proceed to the billing counter or service station.</p>
              </motion.div>
            )}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 border-white/5">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Service Details</h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                  <Scissors className="text-gold w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{service?.name}</h4>
                  <p className="text-sm text-white/50">{service?.duration} Minutes • ₹{service?.price}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border-white/5">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Assigned Barber</h3>
              <div className="flex items-start gap-4">
                {barber ? (
                  <>
                    <img src={barber.photo} alt={barber.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-lg">{barber.name}</h4>
                      <p className="text-sm text-gold font-medium">{barber.experience}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/20">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white/40">Any Barber</h4>
                      <p className="text-sm text-white/30">Next available specialist</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Shop Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/5">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Shop Location</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="text-gold w-5 h-5 flex-shrink-0" />
                <p className="text-sm text-white/70 leading-relaxed">
                  {settings.address}
                </p>
              </div>
              <div className="flex gap-3">
                <Phone className="text-gold w-5 h-5 flex-shrink-0" />
                <p className="text-sm text-white/70">{settings.phone}</p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                >
                  Open in Maps <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-white/5 bg-gold/5">
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4">Pro Tip</h3>
            <p className="text-sm text-white/60 leading-relaxed italic">
              "We recommend arriving at the shop 5-10 minutes before your estimated start time to ensure a seamless experience."
            </p>
          </div>

          <button
            onClick={() => {
              setActiveToken(null);
              setSearchToken('');
              setSearchPhone('');
            }}
            className="w-full py-4 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Track another booking
          </button>
        </div>

      </div>
    </div>
  );
};

export default MyBooking;
