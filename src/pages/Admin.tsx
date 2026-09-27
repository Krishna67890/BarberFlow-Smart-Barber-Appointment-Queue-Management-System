import React, { useState, useEffect } from 'react';
import { storageService } from '../storage/storageService';
import { Shop, User, Report } from '../types';
import { ShieldCheck, Store, Users, AlertTriangle, Check, X, Search, MoreVertical } from 'lucide-react';
import { useToast } from '../components/Toast';

const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('verification');
  const [shops, setShops] = useState<Shop[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    setShops(storageService.getShops());
  }, []);

  const handleVerify = (id: string, status: 'VERIFIED' | 'REJECTED') => {
    const updated = shops.map(s => s.id === id ? { ...s, verified: status } : s);
    setShops(updated);
    storageService.saveShops(updated);
    showToast(`Shop ${status === 'VERIFIED' ? 'Approved' : 'Rejected'}`, status === 'VERIFIED' ? 'success' : 'alert');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="container mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-display font-black flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-gold" /> Platform Admin
            </h1>
            <p className="text-white/40">Manage India's smart barber platform infrastructure.</p>
          </div>

          <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl">
             <button onClick={() => setActiveTab('verification')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'verification' ? 'bg-gold text-black' : 'text-white/40 hover:text-white'}`}>Verification</button>
             <button onClick={() => setActiveTab('shops')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'shops' ? 'bg-gold text-black' : 'text-white/40 hover:text-white'}`}>All Shops</button>
             <button onClick={() => setActiveTab('reports')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-gold text-black' : 'text-white/40 hover:text-white'}`}>Reports</button>
          </div>
        </header>

        {activeTab === 'verification' && (
          <div className="grid gap-6">
            <h2 className="text-xl font-bold">Pending Shop Verifications</h2>
            {shops.filter(s => s.verified === 'PENDING').length === 0 ? (
              <div className="p-12 text-center text-white/20 border border-white/5 rounded-3xl italic">
                 No pending verifications at this time.
              </div>
            ) : (
              shops.filter(s => s.verified === 'PENDING').map(shop => (
                <div key={shop.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5">
                      <img src={shop.coverImage} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{shop.name}</h3>
                      <p className="text-xs text-white/40">{shop.address}, {shop.city}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVerify(shop.id, 'REJECTED')}
                      className="px-6 py-3 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-sm border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleVerify(shop.id, 'VERIFIED')}
                      className="px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-sm border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      Verify Shop
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'shops' && (
          <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/30">
                     <th className="px-8 py-6">Shop Name</th>
                     <th className="px-8 py-6">Location</th>
                     <th className="px-8 py-6">Status</th>
                     <th className="px-8 py-6">Verified</th>
                     <th className="px-8 py-6 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {shops.map((shop) => (
                     <tr key={shop.id} className="text-sm">
                       <td className="px-8 py-6 font-bold">{shop.name}</td>
                       <td className="px-8 py-6 text-white/60">{shop.city}, {shop.state}</td>
                       <td className="px-8 py-6">
                         <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{shop.status}</span>
                       </td>
                       <td className="px-8 py-6">
                          {shop.verified === 'VERIFIED' ? (
                            <ShieldCheck className="w-5 h-5 text-gold" />
                          ) : (
                            <span className="text-white/20">--</span>
                          )}
                       </td>
                       <td className="px-8 py-6 text-right">
                          <button className="p-2 hover:bg-white/5 rounded-lg"><MoreVertical className="w-4 h-4 text-white/40" /></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
