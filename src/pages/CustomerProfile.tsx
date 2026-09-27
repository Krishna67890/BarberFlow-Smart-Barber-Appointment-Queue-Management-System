import React, { useState, useEffect } from 'react';
import { storageService } from '../storage/storageService';
import { QueueEntry, Appointment, Shop } from '../types';
import { Ticket, Calendar, Heart, Star, MapPin, User, LogOut } from 'lucide-react';

const CustomerProfile: React.FC = () => {
  const [tickets, setTickets] = useState<QueueEntry[]>([]);
  const [favorites, setFavorites] = useState<Shop[]>([]);

  const customerId = 'cust-1';

  useEffect(() => {
    // Filter out tickets belonging to this customer
    const allQueues = localStorage.getItem('barberflow_queue');
    if (allQueues) {
      const parsed = JSON.parse(allQueues) as QueueEntry[];
      setTickets(parsed.filter(t => t.customerId === customerId));
    }

    const favIds = storageService.getFavorites(customerId);
    const allShops = storageService.getShops();
    setFavorites(allShops.filter(s => favIds.includes(s.id)));
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-12 pb-24">
      <div className="container mx-auto px-6 max-w-5xl">
         {/* Profile Card Header */}
         <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center gap-8 backdrop-blur-md relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold to-bronze flex items-center justify-center border-4 border-white/10 shadow-2xl shrink-0">
               <User className="w-10 h-10 text-black" />
            </div>

            <div className="flex-grow text-center md:text-left">
               <h1 className="text-3xl font-display font-black mb-1">Demo Customer</h1>
               <p className="text-sm text-white/40 mb-4">customer@barberflow.com • +91 98765 43210</p>
               <span className="text-[10px] font-black tracking-widest bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full uppercase">Silver Member</span>
            </div>

            <button className="flex items-center gap-2 text-rose-500 font-bold hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-all text-sm shrink-0 border border-transparent hover:border-rose-500/20">
               <LogOut className="w-4 h-4" /> Logout
            </button>
         </div>

         {/* Content Segments */}
         <div className="grid md:grid-cols-3 gap-12">
            {/* Active Tickets & History */}
            <div className="md:col-span-2 space-y-8">
               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Ticket className="text-gold" /> My Tickets & Appointments
               </h2>

               <div className="space-y-4">
                  {tickets.length === 0 ? (
                     <div className="p-12 text-center text-white/20 border border-white/5 rounded-2xl italic">
                        No active queue history. Discover a barber and take a turn token line!
                     </div>
                  ) : (
                     tickets.map((ticket) => (
                        <div key={ticket.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
                           <div>
                              <div className="flex items-center gap-3 mb-2">
                                 <span className="font-black text-gold text-lg">{ticket.tokenNumber}</span>
                                 <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${ticket.status === 'WAITING' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                    {ticket.status}
                                 </span>
                              </div>
                              <h3 className="font-bold text-sm mb-1">{ticket.serviceName}</h3>
                              <p className="text-xs text-white/40">{ticket.date} • Created just now</p>
                           </div>

                           <div className="text-right">
                              <span className="text-xs font-bold text-white/60 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                                 Track Turn Line
                              </span>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

            {/* Favorite Shops */}
            <div>
               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Heart className="text-rose-500 fill-rose-500" /> Favorites
               </h2>

               <div className="space-y-4">
                  {favorites.length === 0 ? (
                     <div className="text-xs text-white/40 italic">
                        Save favorite shops from their profile screens for rapid book access lines.
                     </div>
                  ) : (
                     favorites.map(shop => (
                        <div key={shop.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                              <img src={shop.coverImage} className="w-full h-full object-cover" alt="" />
                           </div>
                           <div>
                              <h4 className="font-bold text-sm">{shop.name}</h4>
                              <div className="flex items-center gap-1 text-[10px] text-white/40 mt-0.5">
                                 <Star className="w-3 h-3 text-gold fill-gold" /> {shop.rating} • {shop.city}
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
