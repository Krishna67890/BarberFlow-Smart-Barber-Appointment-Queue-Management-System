import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scissors, Lock, HelpCircle } from 'lucide-react';
import { storageService } from '../storage/storageService';

const OwnerLogin: React.FC = () => {
  const navigate = useNavigate();
  const [shopId, setShopId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const shop = storageService.getShop();
    const inputId = shopId.toUpperCase().trim();
    const inputPassword = password.trim();

    if (shop && shop.id.toUpperCase() === inputId && shop.password === inputPassword) {
      // Create session storage entry
      const session = {
        role: 'OWNER',
        shopId: shop.id,
        ownerId: shop.ownerId,
        shopName: shop.name
      };
      storageService.saveOwnerSession(session);
      navigate('/owner/dashboard');
    } else {
      setError('Invalid Shop ID or Password. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#0a0a0a] text-white px-6 py-12 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-gold to-bronze flex items-center justify-center rounded-2xl mx-auto mb-4 shadow-lg shadow-gold/10">
            <Scissors className="text-black w-6 h-6" />
          </div>
          <h2 className="text-3xl font-display font-bold">Owner Login</h2>
          <p className="text-white/40 text-sm mt-2">Manage your live wait queue and timing setup</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 ml-1">Shop ID</label>
            <input
              type="text"
              placeholder="e.g. BF-MUM-001"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-gold transition-all uppercase placeholder:text-white/20"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-gold transition-all placeholder:text-white/20"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center font-bold">
              {error}
              <button
                type="button"
                onClick={() => {
                  storageService.resetDemoData();
                  window.location.reload();
                }}
                className="block mx-auto mt-2 text-[9px] underline opacity-60 hover:opacity-100"
              >
                Reset System Data & Try Again
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-gold to-bronze text-black font-black py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-gold/10 uppercase tracking-wider text-xs"
          >
            Login to Dashboard
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-sm text-white/40">
          <span>BarberFlow Business Portal</span>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/50 space-y-1">
          <p className="font-bold text-gold flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Admin Access:
          </p>
          <p>• Username: <span className="text-white font-mono bg-white/10 px-1 rounded">ADMIN</span></p>
          <p>• Password: <span className="text-white font-mono bg-white/10 px-1 rounded">admin</span></p>
        </div>
      </div>
    </div>
  );
};

export default OwnerLogin;
