import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Star, Clock, MapPin, ChevronRight, Phone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storageService } from '../storage/storageService';
import { format } from 'date-fns';
import gsap from 'gsap';

const Home: React.FC = () => {
  const shop = storageService.getShop();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Hero animation
    gsap.from(".hero-content > *", {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power4.out"
    });
  }, []);

  return (
    <div className="bg-[#0A0A0A]">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={shop.coverImage}
            className="w-full h-full object-cover opacity-40 scale-105"
            alt="Barber Shop"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl hero-content">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="flex items-center gap-1 bg-gold/20 text-gold px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border border-gold/30">
                <Star className="w-3 h-3 fill-gold" /> {shop.rating} • {shop.reviewCount} Reviews
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black tracking-widest uppercase">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Open Now
              </div>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-[0.9]">
              YOUR STYLE.<br />
              YOUR BARBER.<br />
              <span className="text-gold">YOUR TIME.</span>
            </h1>

            <p className="text-lg text-white/60 mb-10 max-w-xl font-medium leading-relaxed">
              Professional grooming, simple booking, and less waiting.
              Step into the new era of barbering at {shop.name}.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/book"
                className="bg-gold text-black px-10 py-5 rounded-2xl font-black tracking-widest uppercase hover:scale-105 transition-transform shadow-2xl shadow-gold/20 flex items-center gap-3"
              >
                Book Appointment <Calendar className="w-5 h-5" />
              </Link>
              <Link
                to="/services"
                className="bg-white/5 backdrop-blur-md text-white border border-white/10 px-10 py-5 rounded-2xl font-black tracking-widest uppercase hover:bg-white/10 transition-all flex items-center gap-3"
              >
                View Services <Scissors className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Info */}
        <div className="absolute bottom-12 right-12 hidden lg:block hero-content">
          <div className="glass-card p-6 border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <Clock className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Today's Hours</p>
                <p className="text-sm font-bold text-white">09:00 AM – 09:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <MapPin className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Our Location</p>
                <p className="text-sm font-bold text-white">{shop.area}, {shop.city}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="py-24 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 group hover:border-gold/50 transition-all cursor-pointer">
            <h3 className="text-2xl font-black mb-4 group-hover:text-gold transition-colors">EXPERT BARBERS</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-6">Our team consists of senior barbers with 5-10 years of experience in modern fades and classic styling.</p>
            <Link to="/barbers" className="text-xs font-black tracking-widest uppercase text-gold flex items-center gap-2">
              Meet The Team <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-card p-8 group hover:border-gold/50 transition-all cursor-pointer bg-gold/[0.03]">
            <h3 className="text-2xl font-black mb-4 group-hover:text-gold transition-colors">LIVE QUEUE</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-6">Running late? Check our live wait time and join the virtual walk-in queue from your phone.</p>
            <Link to="/book" className="text-xs font-black tracking-widest uppercase text-gold flex items-center gap-2">
              Join Live Queue <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-card p-8 group hover:border-gold/50 transition-all cursor-pointer">
            <h3 className="text-2xl font-black mb-4 group-hover:text-gold transition-colors">PREMIUM EXPERIENCE</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-6">Enjoy complimentary beverages, high-speed Wi-Fi, and a luxury lounge while you wait for your session.</p>
            <Link to="/contact" className="text-xs font-black tracking-widest uppercase text-gold flex items-center gap-2">
              Find Us <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Services Teaser */}
      <section className="py-24 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">OUR SERVICES</h2>
              <p className="text-white/40 font-medium">Precision grooming tailored for the modern gentleman.</p>
            </div>
            <Link to="/services" className="text-xs font-black tracking-widest uppercase border-b-2 border-gold pb-1 text-gold">
              View All Services
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {storageService.getServices().slice(0, 4).map(service => (
              <div key={service.id} className="group relative rounded-3xl overflow-hidden aspect-[4/5]">
                <img src={service.image || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <div className="text-[10px] font-black tracking-widest text-gold uppercase mb-1">{service.category}</div>
                  <h4 className="text-xl font-black text-white mb-2">{service.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 font-bold text-sm">₹{service.price}</span>
                    <span className="text-white/40 text-[10px] font-bold uppercase">{service.duration} MIN</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
