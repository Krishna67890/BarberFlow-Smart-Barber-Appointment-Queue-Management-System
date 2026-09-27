import React from 'react';
import { Scissors, Users, Award, ShieldCheck, Heart, Zap } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-12 pb-24">
      <div className="container mx-auto px-6 max-w-4xl text-center">
         <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Scissors className="w-8 h-8 text-gold" />
         </div>
         <h1 className="text-4xl md:text-6xl font-display font-black mb-6">About BarberFlow</h1>
         <p className="text-xl text-white/60 mb-16 max-w-2xl mx-auto leading-relaxed">
            "BarberFlow connects customers with barber shops around India through location-based discovery, transparent queue information and appointment management."
         </p>

         <div className="grid md:grid-cols-2 gap-8 text-left mb-24">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
               <div className="w-12 h-12 rounded-xl bg-gold text-black flex items-center justify-center font-bold mb-6">1</div>
               <h3 className="text-xl font-bold mb-3">For Customers</h3>
               <p className="text-sm text-white/50 leading-relaxed">
                  Find nearby trusted salons, inspect live wait metrics, select the haircut or styling service, choose an available barber or join the digital line sequence seamlessly.
               </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
               <div className="w-12 h-12 rounded-xl bg-gold text-black flex items-center justify-center font-bold mb-6">2</div>
               <h3 className="text-xl font-bold mb-3">For Shop Owners</h3>
               <p className="text-sm text-white/50 leading-relaxed">
                  List your salon, fully customize services and prices, manage barbers, run automated FIFO queues or live scheduled slots via our state-of-the-art SaaS owner panel.
               </p>
            </div>
         </div>

         <div className="border-t border-white/5 pt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
               <h4 className="text-4xl font-display font-black text-gold mb-1">42+</h4>
               <p className="text-xs uppercase font-bold tracking-widest text-white/40">Cities Covered</p>
            </div>
            <div>
               <h4 className="text-4xl font-display font-black text-gold mb-1">1.2K+</h4>
               <p className="text-xs uppercase font-bold tracking-widest text-white/40">Barber Partners</p>
            </div>
            <div>
               <h4 className="text-4xl font-display font-black text-gold mb-1">98%</h4>
               <p className="text-xs uppercase font-bold tracking-widest text-white/40">Happy Clients</p>
            </div>
            <div>
               <h4 className="text-4xl font-display font-black text-gold mb-1">&lt; 15m</h4>
               <p className="text-xs uppercase font-bold tracking-widest text-white/40">Average Wait Time</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default About;
