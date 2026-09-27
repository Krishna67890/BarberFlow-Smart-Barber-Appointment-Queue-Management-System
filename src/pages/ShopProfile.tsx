import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Star, Users, Clock, ShieldCheck, Heart, Share2, Calendar, Ticket, ChevronRight, Award } from 'lucide-react';
import { storageService } from '../storage/storageService';
import { addQueueEntry, calculateWaitTime } from '../storage/queueManager';
import { Shop, Service, Barber, Review } from '../types';
import { useToast } from '../components/Toast';

const ShopProfile: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [queueInfo, setQueueInfo] = useState({ waiting: 0, estWait: 0 });

  const [showQueueModal, setShowQueueModal] = useState(searchParams.get('join') === 'true');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);

  useEffect(() => {
    if (shopId) {
      const currentShop = storageService.getShopById(shopId);
      if (currentShop) {
        setShop(currentShop);
        setServices(storageService.getServices(shopId));
        setBarbers(storageService.getBarbers(shopId));
        setReviews(storageService.getReviews(shopId));

        const queue = storageService.getQueues(shopId);
        const waiting = queue.filter(q => q.status === 'WAITING').length;
        const estWait = calculateWaitTime(shopId);
        setQueueInfo({ waiting, estWait });
      }
    }
  }, [shopId]);

  const handleJoinQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !customerName || !phone || !selectedService) return;

    const ticket = addQueueEntry(shop.id, 'cust-1', customerName, phone, selectedService, selectedBarber);
    showToast(`Successfully joined queue! Your token number is ${ticket.tokenNumber}`, 'success');
    setShowQueueModal(false);

    // Refresh queue counts
    const queue = storageService.getQueues(shop.id);
    const waiting = queue.filter(q => q.status === 'WAITING').length;
    const estWait = calculateWaitTime(shop.id);
    setQueueInfo({ waiting, estWait });
  };

  if (!shop) {
    return <div className="p-24 text-center text-white">Loading Barber Shop...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      {/* Cover Image Gallery */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img src={shop.coverImage} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent"></div>

        <div className="absolute bottom-8 left-0 w-full">
          <div className="container mx-auto px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-gold text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                  <Award className="w-3 h-3" /> Premium Partner
                </span>
                <span className="text-xs text-white/60 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-black mb-2">{shop.name}</h1>
              <p className="text-white/60 flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gold" /> {shop.address}, {shop.area}, {shop.city}
              </p>
            </div>

            <div className="flex gap-4">
               <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                  <Heart className="w-5 h-5 text-white/60" />
               </button>
               <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                  <Share2 className="w-5 h-5 text-white/60" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container mx-auto px-6 mt-12 grid lg:grid-cols-3 gap-12">
        {/* Left Columns - Details & Catalog */}
        <div className="lg:col-span-2 space-y-12">
          {/* Shop Status Banner */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Live Status</p>
              <p className="font-bold text-emerald-400 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {shop.status}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Queue Line</p>
              <p className="font-bold text-white flex items-center gap-1.5">
                 <Users className="w-4 h-4 text-gold" /> {queueInfo.waiting} Waiting
              </p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Estimated Wait</p>
              <p className="font-bold text-white flex items-center gap-1.5">
                 <Clock className="w-4 h-4 text-gold" /> {queueInfo.estWait} mins
              </p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Avg Service Time</p>
              <p className="font-bold text-white">20 mins</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-bold mb-4">About this shop</h2>
            <p className="text-white/60 leading-relaxed">{shop.description}</p>
          </div>

          {/* Service catalog */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Service Catalog</h2>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-gold/30 transition-colors">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-gold transition-colors">{service.name}</h3>
                    <p className="text-sm text-white/40 mb-2">{service.description}</p>
                    <span className="text-xs text-white/60 bg-white/5 px-2 py-0.5 rounded-full">{service.duration} mins</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black text-gold mb-2">₹{service.price}</p>
                    <button
                      onClick={() => {
                        setSelectedService(service.id);
                        setShowQueueModal(true);
                      }}
                      className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gold transition-colors"
                    >
                      Book Turn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team / Barbers */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Our Stylists</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {barbers.map((barber) => (
                <div key={barber.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gold/20">
                    <img src={barber.photo} className="w-full h-full object-cover" alt="" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{barber.name}</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-3">{barber.experience}</p>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {barber.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sticky Booking Column */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-3xl p-8 sticky top-28 shadow-2xl">
             <h3 className="text-xl font-bold mb-6">Reserve Your Turn</h3>

             <div className="space-y-4 mb-8">
                <button
                  onClick={() => navigate('/book', { state: { mode: 'queue' } })}
                  className="w-full py-4 rounded-xl bg-gold text-black font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg shadow-gold/10"
                >
                  <Ticket className="w-5 h-5" /> Take Live Queue Ticket
                </button>

                <button
                  onClick={() => navigate('/book', { state: { mode: 'appointment' } })}
                  className="w-full py-4 rounded-xl bg-white/5 border border-white/10 font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-gold" /> Book Future Appointment
                </button>
             </div>

             <div className="border-t border-white/5 pt-6 text-sm text-white/40 space-y-3">
                <div className="flex justify-between">
                   <span>Opening Hours</span>
                   <span className="text-white font-bold">09:00 AM - 09:00 PM</span>
                </div>
                <div className="flex justify-between">
                   <span>Contact Shop</span>
                   <span className="text-white font-bold">{shop.phone}</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Queue Modal */}
      {showQueueModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative">
            <h3 className="text-2xl font-bold mb-2">Join Live Queue</h3>
            <p className="text-sm text-white/40 mb-6">Enter your details to register a digital token position line sequence inline.</p>

            <form onSubmit={handleJoinQueue} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-gold outline-none"
                  placeholder="e.g. Krishna Kumar"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-gold outline-none"
                  placeholder="e.g. 98234XXXXX"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Select Service</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-gold outline-none"
                >
                  <option value="">-- Choose a service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - ₹{s.price}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQueueModal(false)}
                  className="flex-grow py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-3 bg-gold text-black rounded-xl font-bold text-sm shadow-lg shadow-gold/10"
                >
                  Get Token Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopProfile;
