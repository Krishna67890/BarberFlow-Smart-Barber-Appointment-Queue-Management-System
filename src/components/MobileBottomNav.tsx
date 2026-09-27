import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Scissors, Calendar, Ticket, UserCheck, LayoutDashboard } from 'lucide-react';
import { storageService } from '../storage/storageService';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const session = storageService.getOwnerSession();
    setIsOwner(!!session);

    const handleUpdate = () => {
      const liveSession = storageService.getOwnerSession();
      setIsOwner(!!liveSession);
    };
    window.addEventListener('storage-update', handleUpdate);
    return () => window.removeEventListener('storage-update', handleUpdate);
  }, []);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#121212]/95 backdrop-blur-xl border-t border-white/5 py-2 px-4 grid grid-cols-5 text-center items-center z-50 shadow-2xl">
      <Link to="/" className={`flex flex-col items-center gap-0.5 ${location.pathname === '/' ? 'text-[#D4AF37]' : 'text-white/40'}`}>
        <Home className="w-5 h-5" />
        <span className="text-[9px] font-bold tracking-tight">Home</span>
      </Link>
      <Link to="/services" className={`flex flex-col items-center gap-0.5 ${location.pathname === '/services' ? 'text-[#D4AF37]' : 'text-white/40'}`}>
        <Scissors className="w-5 h-5" />
        <span className="text-[9px] font-bold tracking-tight">Services</span>
      </Link>
      <Link to="/book" className={`flex flex-col items-center gap-0.5 ${location.pathname === '/book' ? 'text-[#D4AF37]' : 'text-white/40'}`}>
        <Calendar className="w-5 h-5" />
        <span className="text-[9px] font-bold tracking-tight">Book</span>
      </Link>
      <Link to="/my-booking" className={`flex flex-col items-center gap-0.5 ${location.pathname === '/my-booking' ? 'text-[#D4AF37]' : 'text-white/40'}`}>
        <Ticket className="w-5 h-5" />
        <span className="text-[9px] font-bold tracking-tight">Track</span>
      </Link>

      {isOwner ? (
        <Link to="/owner/dashboard" className={`flex flex-col items-center gap-0.5 ${location.pathname.startsWith('/owner') ? 'text-[#D4AF37]' : 'text-white/40'}`}>
          <LayoutDashboard className="w-5 h-5 text-emerald-400" />
          <span className="text-[9px] font-bold tracking-tight">Panel</span>
        </Link>
      ) : (
        <Link to="/owner/login" className={`flex flex-col items-center gap-0.5 ${location.pathname === '/owner/login' ? 'text-[#D4AF37]' : 'text-white/40'}`}>
          <UserCheck className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-tight">Owner</span>
        </Link>
      )}
    </div>
  );
};

export default MobileBottomNav;
