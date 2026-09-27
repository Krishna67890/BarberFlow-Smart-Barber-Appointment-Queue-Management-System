import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Scissors, Menu, X, User, ShieldAlert, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storageService } from '../storage/storageService';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = () => {
    const session = storageService.getOwnerSession();
    setIsOwner(!!session);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    checkAuth();

    window.addEventListener('storage-update', checkAuth);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage-update', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    storageService.logoutOwner();
    setIsOpen(false);
    navigate('/');
  };

  const customerLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Barbers', path: '/barbers' },
    { name: 'Live Waitlist', path: '/queue' },
    { name: 'Book Now', path: '/book' },
    { name: 'Track Token', path: '/my-booking' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Contact', path: '/contact' },
  ];

  const ownerLinks = [
    { name: 'Dashboard', path: '/owner/dashboard' },
  ];

  const links = isOwner ? [...ownerLinks, ...customerLinks] : customerLinks;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#121212]/90 backdrop-blur-xl py-3 border-b border-white/5 shadow-2xl' : 'bg-[#0f0f0f]/40 py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] flex items-center justify-center rounded-xl shadow-lg shadow-gold/20 group-hover:rotate-12 transition-transform duration-300">
            <Scissors className="text-black w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-none">
              BARBER<span className="text-[#D4AF37]">FLOW</span>
            </span>
            <span className="text-[9px] font-medium tracking-[0.3em] text-white/40 uppercase mt-0.5">
              Premium Grooming
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs font-semibold tracking-wider uppercase transition-colors duration-300 ${location.pathname === link.path ? 'text-[#D4AF37]' : 'text-white/70 hover:text-white'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Button */}
        <div className="hidden lg:flex items-center gap-4">
          {isOwner ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-red-500/30 bg-red-500/10 text-red-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          ) : (
            <Link
              to="/owner/login"
              className="flex items-center gap-1.5 border border-white/10 bg-white/5 text-white/80 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
              <User className="w-3.5 h-3.5 text-[#D4AF37]" /> Owner portal
            </Link>
          )}
          <Link
            to="/book"
            className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black px-5 py-2 rounded-xl font-bold text-xs tracking-wider uppercase hover:brightness-110 shadow-lg shadow-gold/10 transition-all active:scale-95"
          >
            Book Appointment
          </Link>
        </div>

        {/* Mobile menu toggle button */}
        <div className="lg:hidden flex items-center gap-3">
          <Link
            to="/book"
            className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black px-3 py-1.5 rounded-lg font-bold text-[10px] tracking-wider uppercase"
          >
            Book
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 flex items-center justify-center text-white bg-white/5 rounded-lg border border-white/10"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[65px] bg-[#121212] border-b border-white/5 shadow-2xl z-40 lg:hidden max-h-[85vh] overflow-y-auto"
          >
            <div className="flex flex-col p-6 gap-4">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-semibold tracking-wide py-2 border-b border-white/[0.02] ${location.pathname === link.path ? 'text-[#D4AF37]' : 'text-white/80'}`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-2 flex flex-col gap-3">
                {isOwner ? (
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 border border-red-500/20 text-red-400 py-3 rounded-xl font-bold text-center text-xs flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout Owner Session
                  </button>
                ) : (
                  <Link
                    to="/owner/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-white/5 border border-white/10 text-white/80 py-3 rounded-xl font-bold text-center text-xs flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#D4AF37]" /> Barber Shop Owner Portal
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
