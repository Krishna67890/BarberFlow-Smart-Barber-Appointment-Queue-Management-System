import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storageService } from '../storage/storageService';
import { Service } from '../types';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    setServices(storageService.getServices().filter(s => s.active));
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header Block */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold text-[10px] uppercase tracking-widest font-black mb-4"
          >
            <Scissors className="w-3 h-3" /> Grooming Menu
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
            PREMIUM SERVICES
          </h1>
          <p className="text-sm text-white/40 leading-relaxed font-medium">
            Explore our meticulously calibrated grooming matrix. Every cut includes a complimentary premium hair wash, massage, and hot towel wipe down.
          </p>
        </div>

        {/* Dynamic Service Deck */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={service.id}
              className="glass-card p-6 flex flex-col justify-between hover:border-gold/30 hover:bg-gold/[0.01] transition-all relative overflow-hidden group"
            >
              <div>
                {/* Category Pin */}
                <div className="text-[10px] font-black tracking-widest text-gold/60 uppercase mb-2">
                  {service.category || 'Grooming'}
                </div>

                <h3 className="text-xl font-black text-white group-hover:text-gold transition-colors mb-3">
                  {service.name}
                </h3>

                <p className="text-xs text-white/50 font-medium leading-relaxed mb-6 line-clamp-3">
                  {service.description || 'Premium custom tailored grooming experience conducted by our certified top tier style masters.'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mb-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Investment</span>
                    <span className="text-xl font-black text-white">₹{service.price}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-white/70">
                    <Clock className="w-3.5 h-3.5 text-gold" /> {service.duration} mins
                  </div>
                </div>

                <Link
                  to="/book"
                  state={{ preselectedServiceId: service.id }}
                  className="w-full bg-white/5 hover:bg-gold hover:text-black border border-white/10 hover:border-gold py-3.5 rounded-xl font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Book This Service <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand Promise Banner */}
        <div className="mt-20 border border-white/5 bg-gradient-to-r from-black to-white/[0.02] p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-gold/10 border border-gold/20 flex items-center justify-center rounded-2xl text-gold shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">The BarberFlow Commitment</h4>
              <p className="text-xs text-white/40 max-w-xl">Zero fixed slots double-bookings. Our dynamic temporal scheduler guarantees that your chosen barber is 100% focused on you during the full service duration.</p>
            </div>
          </div>
          <Link
            to="/book"
            className="bg-gold text-black px-8 py-4 rounded-xl font-black text-xs uppercase tracking-wider shrink-0 shadow-lg shadow-gold/10 active:scale-95 transition-all"
          >
            Configure Appointment
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Services;
