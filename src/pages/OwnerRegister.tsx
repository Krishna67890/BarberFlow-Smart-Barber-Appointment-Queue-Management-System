import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scissors, CheckCircle, Copy, ArrowRight, ArrowLeft } from 'lucide-react';
import { storageService } from '../storage/storageService';
import { getData, setData, STORAGE_KEYS } from '../storage/utils';
import { Shop, Owner, WeeklySchedule } from '../types';

const OwnerRegister: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Owner Details
  const [ownerData, setOwnerData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Shop Details
  const [shopData, setShopData] = useState({
    name: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    phone: ''
  });

  const [createdShop, setCreatedShop] = useState<{id: string, password: string} | null>(null);

  const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerData({...ownerData, [e.target.name]: e.target.value});
  };

  const handleShopChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShopData({...shopData, [e.target.name]: e.target.value});
  };

  const defaultSchedule: WeeklySchedule = {
    monday: { open: '09:00', close: '21:00', isOpen: true },
    tuesday: { open: '09:00', close: '21:00', isOpen: true },
    wednesday: { open: '09:00', close: '21:00', isOpen: true },
    thursday: { open: '09:00', close: '21:00', isOpen: true },
    friday: { open: '09:00', close: '21:00', isOpen: true },
    saturday: { open: '08:00', close: '22:00', isOpen: true },
    sunday: { open: '10:00', close: '18:00', isOpen: true },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate Shop ID
    const cityCode = shopData.city.substring(0, 3).toUpperCase();
    const existingShops = getData<Shop[]>(STORAGE_KEYS.SHOPS, []);
    const count = existingShops.length + 1;
    const shopId = `BF-${cityCode}-${count.toString().padStart(3, '0')}`;

    // Generate Password (simplified)
    const generatedPassword = (shopData.name.substring(0, 2) + new Date().getFullYear()).toUpperCase();

    const ownerId = 'own-' + Math.random().toString(36).substr(2, 9);

    const newOwner: Owner = {
      id: ownerId,
      name: ownerData.name,
      email: ownerData.email,
      phone: ownerData.phone,
      passwordHash: ownerData.password, // In a real app, this would be hashed
      role: 'OWNER',
      createdAt: new Date().toISOString(),
      shopIds: [shopId]
    };

    const newShop: Shop = {
      id: shopId,
      ownerId: ownerId,
      password: generatedPassword,
      name: shopData.name,
      slug: shopData.name.toLowerCase().replace(/\s+/g, '-'),
      description: '',
      logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150&h=150&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&h=600&fit=crop',
      gallery: [],
      phone: shopData.phone,
      whatsapp: shopData.phone,
      email: ownerData.email,
      address: shopData.address,
      area: '',
      city: shopData.city,
      district: shopData.city,
      state: shopData.state,
      pincode: shopData.pincode,
      latitude: 0,
      longitude: 0,
      schedule: defaultSchedule,
      status: 'OPEN',
      accentColor: '#D4AF37',
      rating: 0,
      reviewCount: 0,
      verified: 'PENDING',
      createdAt: new Date().toISOString(),
      visibility: 'PUBLIC'
    };

    // Save to storage
    const owners = getData<Owner[]>(STORAGE_KEYS.OWNERS, []);
    setData(STORAGE_KEYS.OWNERS, [...owners, newOwner]);

    const shops = getData<Shop[]>(STORAGE_KEYS.SHOPS, []);
    setData(STORAGE_KEYS.SHOPS, [...shops, newShop]);

    setCreatedShop({ id: shopId, password: generatedPassword });
    setStep(3);
  };

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-6">
        <div className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-[3rem] p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full"></div>

          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-4xl font-display font-bold mb-2">Shop Created!</h2>
          <p className="text-white/40 mb-8">Your barber shop is now registered on BarberFlow India.</p>

          <div className="bg-black/40 rounded-3xl p-8 border border-white/5 space-y-6 text-left">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Shop Name</p>
              <p className="text-xl font-bold">{shopData.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Shop ID</p>
                <p className="text-2xl font-black text-gold font-mono">{createdShop?.id}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Login Password</p>
                <p className="text-2xl font-black text-white font-mono">{createdShop?.password}</p>
              </div>
            </div>

            <div className="bg-gold/10 p-4 rounded-2xl border border-gold/20">
              <p className="text-[10px] font-bold text-gold uppercase text-center">Share these credentials with your customers</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/owner/login')}
            className="w-full mt-10 bg-white text-black font-black py-5 rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            GO TO OWNER LOGIN <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-[#0a0a0a] text-white px-6 pb-24">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold">Create Shop</h1>
            <p className="text-white/40">Step {step} of 2</p>
          </div>
          <div className="flex gap-2">
            <div className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-gold' : 'bg-white/10'}`}></div>
            <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-gold' : 'bg-white/10'}`}></div>
          </div>
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="space-y-8">
          {step === 1 ? (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gold">Owner Information</h3>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Owner Name</label>
                <input
                  type="text"
                  name="name"
                  value={ownerData.name}
                  onChange={handleOwnerChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-gold outline-none"
                  placeholder="Rahul Sharma"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={ownerData.phone}
                    onChange={handleOwnerChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-gold outline-none"
                    placeholder="99999 00000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={ownerData.email}
                    onChange={handleOwnerChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-gold outline-none"
                    placeholder="rahul@email.com"
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Create Password</label>
                  <input
                    type="password"
                    name="password"
                    value={ownerData.password}
                    onChange={handleOwnerChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-gold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={ownerData.confirmPassword}
                    onChange={handleOwnerChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-gold outline-none"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gold text-black font-black py-5 rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                NEXT: SHOP DETAILS <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gold">Shop Details</h3>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Shop Name</label>
                <input
                  type="text"
                  name="name"
                  value={shopData.name}
                  onChange={handleShopChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-gold outline-none"
                  placeholder="Royal Cut Barber Shop"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Shop Address</label>
                <input
                  type="text"
                  name="address"
                  value={shopData.address}
                  onChange={handleShopChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-gold outline-none"
                  placeholder="Linking Road, Near Starbucks"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={shopData.city}
                    onChange={handleShopChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-gold outline-none"
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">PIN Code</label>
                  <input
                    type="text"
                    name="pincode"
                    value={shopData.pincode}
                    onChange={handleShopChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-gold outline-none"
                    placeholder="400050"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Shop Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={shopData.phone}
                  onChange={handleShopChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-gold outline-none"
                  placeholder="022 1234 5678"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-white/5 border border-white/10 text-white font-bold py-5 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" /> BACK
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-gold text-black font-black py-5 rounded-2xl hover:scale-[1.02] transition-all"
                >
                  CREATE BARBER SHOP
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OwnerRegister;
