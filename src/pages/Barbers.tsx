import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, ShieldCheck, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storageService } from '../storage/storageService';
import { Barber } from '../types';

const Barbers: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    setBarbers(storageService.getBarbers().filter(b => b.isAvailable));
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
            <Sparkles className="w-3 h-3" /> Master Artisans
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
            OUR BARBERS TEAM
          </h1>
          <p className="text-sm text-white/40 leading-relaxed font-medium">
            Meet our certified elite style architects. Armed with precision tools and years of premium mastercraft grooming experience.
          </p>
        </div>

        {/* Barbers Deck Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map((barber, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={barber.id}
              className="glass-card overflow-hidden hover:border-gold/30 transition-all group"
            >
              <div className="relative aspect-square overflow-hidden bg-neutral-900 border-b border-white/5">
                <img
                  src={barber.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={barber.name}
                />

                {/* Live Status Tag */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Active Now
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-black text-white group-hover:text-gold transition-colors">
                    {barber.name}
                  </h3>
                  <span className="text-[10px] font-black tracking-wider uppercase text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded">
                    {barber.experience}
                  </span>
                </div>

                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-4 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-gold" /> Senior Style Architect
                </p>

                {/* Specialties Pins */}
                <div className="mb-6 flex flex-wrap gap-1.5">
                  {barber.specializations?.map((spec, i) => (
                    <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-white/70 font-semibold">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-5">
                  <Link
                    to="/book"
                    state={{ preselectedBarberId: barber.id }}
                    className="w-full bg-gradient-to-r from-gold to-[#AA7C11] text-black py-3.5 rounded-xl font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-gold/5"
                  >
                    Book With {barber.name} <Calendar className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Universal Selection Card Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 flex flex-col justify-between hover:border-gold/30 transition-all border-dashed border-white/20 bg-white/[0.01]"
          >
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gold">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">ANY AVAILABLE ARTISAN</h3>
              <p className="text-xs text-white/40 max-w-xs mx-auto leading-relaxed">
                Need the fastest turnaround time? Let our smart matrix routing logic automatically appoint the absolute best artisan matching your slot setup.
              </p>
            </div>

            <Link
              to="/book"
              state={{ preselectedBarberId: 'any' }}
              className="w-full bg-white/5 hover:bg-white hover:text-black border border-white/10 text-white font-black text-xs tracking-wider uppercase py-3.5 rounded-xl text-center block transition-all active:scale-95"
            >
              Select First Free Slot
            </Link>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Barbers;
