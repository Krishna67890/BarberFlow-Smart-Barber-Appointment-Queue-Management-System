import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Phone, MapPin, Clock } from 'lucide-react';
import { storageService } from '../storage/storageService';

const Footer: React.FC = () => {
  const shop = storageService.getShop();

  return (
    <footer className="bg-[#0D0D0D] border-t border-white/5 text-white/60 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] flex items-center justify-center rounded-lg">
              <Scissors className="text-black w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              BARBER<span className="text-[#D4AF37]">FLOW</span>
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-white/40">
            Premium single-shop scheduling matrix engineered with microsecond wait-time calibration.
          </p>
        </div>

        {/* Dynamic Hours Summary */}
        <div>
          <h4 className="text-xs font-black tracking-widest text-white uppercase mb-4 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> Core Timings
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex justify-between">
              <span>Mon - Fri:</span>
              <span className="text-white/80">09:00 AM - 09:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Saturday:</span>
              <span className="text-white/80">08:00 AM - 10:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Sunday:</span>
              <span className="text-white/80">10:00 AM - 06:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Quick Route Links */}
        <div>
          <h4 className="text-xs font-black tracking-widest text-white uppercase mb-4">
            Navigation Map
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link to="/services" className="hover:text-white transition-colors">Services</Link>
            <Link to="/barbers" className="hover:text-white transition-colors">Barbers Team</Link>
            <Link to="/book" className="hover:text-white transition-colors">Book Seat</Link>
            <Link to="/my-booking" className="hover:text-white transition-colors">Track Token</Link>
            <Link to="/reviews" className="hover:text-white transition-colors">Testimonials</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>

        {/* Geolocation Matrix */}
        <div className="flex flex-col gap-3 text-xs">
          <h4 className="text-xs font-black tracking-widest text-white uppercase mb-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> Hub Coordinate
          </h4>
          <p className="text-white/40 leading-relaxed">
            {shop?.address || '123 Premium Plaza, High Street'}, {shop?.area || 'Bandra West'}, {shop?.city || 'Mumbai'}
          </p>
          <a
            href={`tel:${shop?.phone || '+919876543210'}`}
            className="flex items-center gap-2 mt-2 text-[#D4AF37] font-bold"
          >
            <Phone className="w-3.5 h-3.5" /> {shop?.phone || '+91 98765 43210'}
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/[0.02] text-center text-[10px] text-white/20 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} BarberFlow Studio Inc. All Rights Reserved. Prototype persistence active.
      </div>
    </footer>
  );
};

export default Footer;
