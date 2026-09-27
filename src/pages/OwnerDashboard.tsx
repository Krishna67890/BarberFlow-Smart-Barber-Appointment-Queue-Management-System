import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Scissors, Calendar, Settings,
  Star, LogOut, CheckCircle2, Clock, UserPlus,
  MapPin, ShieldCheck, ChevronRight, MessageSquare,
  UserMinus, Play, Check, ArrowUp, ArrowDown, Bell,
  Plus, X, RefreshCw
} from 'lucide-react';
import { storageService } from '../storage/storageService';
import { updateQueueStatus, callNext, reorderQueue, addQueueEntry } from '../storage/queueManager';
import { QueueEntry, Shop, Barber, Service } from '../types';
import { useToast } from '../components/Toast';

const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [shop, setShop] = useState<Shop | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [ownerSession, setOwnerSession] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State for Walk-in
  const [newWalkin, setNewWalkin] = useState({
    name: '',
    phone: '',
    serviceId: '',
    barberId: ''
  });

  // Form State for Service
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category: 'Grooming'
  });

  // Review Reply State
  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const [settings, setSettings] = useState<any>(storageService.getSettings());

  useEffect(() => {
    const session = storageService.getOwnerSession();
    if (!session || session.role !== 'OWNER') {
      navigate('/owner/login');
      return;
    }
    setOwnerSession(session);

    const shopData = storageService.getShop();
    if (shopData) {
      setShop(shopData);
      setQueue(storageService.getQueue());
      setAppointments(storageService.getAppointmentsByShopId(shopData.id));
      setServices(storageService.getServices());
      setBarbers(storageService.getBarbers());
      setSettings(storageService.getSettings());
    }
  }, [navigate]);

  useEffect(() => {
    const handleUpdate = () => {
      const currentShop = storageService.getShop();
      setQueue(storageService.getQueue());
      if (currentShop) {
        setAppointments(storageService.getAppointmentsByShopId(currentShop.id));
      }
      setServices(storageService.getServices());
      setBarbers(storageService.getBarbers());
      setShop(currentShop);
      setSettings(storageService.getSettings());
    };
    window.addEventListener('storage-update', handleUpdate);
    return () => window.removeEventListener('storage-update', handleUpdate);
  }, []);

  const handleUpdateSettings = (newSettings: any) => {
    storageService.updateSettings(newSettings);
    setSettings(newSettings);
    showToast('Settings updated successfully', 'success');
  };

  const handleLogout = () => {
    storageService.logoutOwner();
    navigate('/owner/login');
  };

  const updateStatus = (entryId: string, newStatus: QueueEntry['status']) => {
    updateQueueStatus(entryId, newStatus);
    setQueue(storageService.getQueue());
    showToast(`Status updated to ${newStatus}`, 'success');
  };

  const handleCallNext = () => {
    if (shop) {
      callNext(shop.id);
      setQueue(storageService.getQueue());
      showToast('Next customer called', 'success');
    }
  };

  const handleReorder = (entryId: string, direction: 'up' | 'down') => {
    if (shop) {
      reorderQueue(shop.id, entryId, direction);
      setQueue(storageService.getQueue());
    }
  };

  const handleAddWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addQueueEntry(
        newWalkin.name,
        newWalkin.phone,
        newWalkin.serviceId,
        newWalkin.barberId || null
      );
      showToast('Walk-in customer added to queue', 'success');
      setIsAddModalOpen(false);
      setNewWalkin({ name: '', phone: '', serviceId: '', barberId: '' });
      setQueue(storageService.getQueue());
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    if (editingService) {
      const updated = { ...editingService, ...serviceForm };
      storageService.updateService(updated);
      showToast('Service updated successfully', 'success');
    } else {
      const newService: Service = {
        id: `ser-${Date.now()}`,
        shopId: shop.id,
        ...serviceForm,
        active: true
      };
      storageService.saveService(newService);
      showToast('New service added', 'success');
    }
    setIsServiceModalOpen(false);
    setEditingService(null);
    setServiceForm({ name: '', description: '', price: 0, duration: 30, category: 'Grooming' });
    setServices(storageService.getServices());
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category
    });
    setIsServiceModalOpen(true);
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      storageService.deleteService(id);
      setServices(storageService.getServices());
      showToast('Service deleted', 'info');
    }
  };

  const toggleServiceActive = (service: Service) => {
    storageService.updateService({ ...service, active: !service.active });
    setServices(storageService.getServices());
  };

  const handleReplyToReview = (reviewId: string) => {
    const reviews = storageService.getReviews();
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      review.ownerReply = replyText;
      storageService.updateReview(review);
      showToast('Reply posted', 'success');
      setReplyingToReviewId(null);
      setReplyText('');
    }
  };

  const toggleBarberStatus = (barberId: string, currentStatus: Barber['status']) => {
    const barber = barbers.find(b => b.id === barberId);
    if (!barber) return;

    const newStatus: Barber['status'] = currentStatus === 'AVAILABLE' ? 'BREAK' : 'AVAILABLE';
    const updatedBarber = { ...barber, status: newStatus, isAvailable: newStatus === 'AVAILABLE' };

    storageService.updateBarber(updatedBarber);
    setBarbers(storageService.getBarbers());
    showToast(`${barber.name} is now ${newStatus.toLowerCase()}`, 'info');
  };

  if (!shop) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-display font-bold text-2xl uppercase tracking-[0.2em] animate-pulse">Loading Dashboard...</div>;

  const waitingCount = queue.filter(q => q.status === 'WAITING').length;
  const inService = queue.find(q => q.status === 'IN_SERVICE');
  const todayCompleted = queue.filter(q => q.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-72 bg-black border-r border-white/5 flex flex-col p-6 lg:fixed lg:h-full z-20">
        <div className="mb-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gold to-bronze rounded-2xl flex items-center justify-center shadow-lg shadow-gold/10">
            <Scissors className="text-black w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-display font-black leading-none">{shop.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${shop.status === 'OPEN' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{shop.status}</span>
            </div>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'queue', icon: Clock, label: 'Queue' },
            { id: 'appointments', icon: Calendar, label: 'Appointments' },
            { id: 'services', icon: Scissors, label: 'Services' },
            { id: 'barbers', icon: Users, label: 'Barbers' },
            { id: 'schedule', icon: Clock, label: 'Schedule' },
            { id: 'reviews', icon: MessageSquare, label: 'Reviews' },
            { id: 'settings', icon: Settings, label: 'Shop Settings' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-gold text-black shadow-lg shadow-gold/20 scale-[1.02]' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/5 mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-grow lg:ml-72 p-6 md:p-10">

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-black">Dashboard</h1>
                <p className="text-white/40 mt-1">Quick overview of your shop's operations</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gold text-black px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-gold/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Walk-in
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Waiting", value: waitingCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: "Serving", value: inService ? inService.tokenNumber : '-', icon: UserPlus, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Appointments", value: appointments.filter(a => a.status === 'CONFIRMED').length, icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
                { label: "Today", value: todayCompleted + appointments.filter(a => a.status === 'COMPLETED').length, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" }
              ].map((stat, i) => (
                <div key={i} className="bg-neutral-900 border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all group">
                  <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-4xl font-display font-black mb-1">{stat.value}</h3>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Live Status Board */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-neutral-900 border border-white/5 rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Live Queue</h3>
                  <button onClick={() => setActiveTab('queue')} className="text-gold text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
                </div>

                <div className="space-y-4">
                  {queue.filter(q => q.status === 'WAITING' || q.status === 'IN_SERVICE').slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center font-black text-gold text-lg">
                          {entry.tokenNumber}
                        </div>
                        <div>
                          <p className="font-bold">{entry.customerName}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{entry.serviceName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${entry.status === 'IN_SERVICE' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/40'}`}>
                           {entry.status.replace('_', ' ')}
                         </span>
                         <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-white/20" /></button>
                      </div>
                    </div>
                  ))}
                  {queue.filter(q => q.status === 'WAITING' || q.status === 'IN_SERVICE').length === 0 && (
                    <div className="py-20 text-center text-white/20 italic">No active customers in queue</div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                 <div className="bg-gold rounded-[2.5rem] p-8 text-black relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full translate-x-10 -translate-y-10"></div>
                    <h3 className="text-sm font-black uppercase tracking-widest mb-6 opacity-60">Shop Controls</h3>
                    <div className="space-y-4 relative z-10">
                       <button
                         onClick={handleCallNext}
                         className="w-full bg-black text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:scale-105 transition-all"
                       >
                         Call Next
                       </button>
                       <button
                         onClick={() => {
                           const shop = storageService.getShop();
                           const newStatus = shop.status === 'OPEN' ? 'ON_BREAK' : 'OPEN';
                           storageService.updateShop({ ...shop, status: newStatus });
                           showToast(`Shop status updated to ${newStatus}`, 'info');
                         }}
                         className="w-full bg-black/10 border border-black/20 text-black font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-black/20 transition-all"
                       >
                         {shop.status === 'OPEN' ? 'Pause Queue (Break)' : 'Resume Operations'}
                       </button>
                    </div>
                 </div>

                 <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-8">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-white/40">Quick Info</h3>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <span className="text-xs text-white/40 font-bold">Shop ID</span>
                          <span className="font-mono text-gold font-bold">{shop.id}</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-xs text-white/40 font-bold">Password</span>
                          <span className="font-mono text-white/60 font-bold">{shop.password}</span>
                       </div>
                       <div className="pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2 text-emerald-500">
                             <ShieldCheck className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Verified Shop</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Queue View */}
        {activeTab === 'queue' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-display font-black">Live Queue</h2>
                <button className="bg-gold text-black px-6 py-3 rounded-xl font-bold text-sm">Add Walk-in</button>
             </div>

             <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="grid grid-cols-7 p-6 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  <div className="col-span-1">Token</div>
                  <div className="col-span-2">Customer</div>
                  <div className="col-span-1">Service</div>
                  <div className="col-span-1">Wait Time</div>
                  <div className="col-span-1">Barber</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                <div className="divide-y divide-white/5">
                  {queue.length === 0 ? (
                    <div className="p-20 text-center text-white/20 italic">No records found</div>
                  ) : (
                    queue.map((q, idx) => {
                      const estStart = new Date(q.estimatedStartTime);
                      const waitMin = Math.max(0, Math.ceil((estStart.getTime() - Date.now()) / 60000));

                      return (
                        <div key={q.id} className={`grid grid-cols-7 p-6 items-center hover:bg-white/[0.02] transition-all ${q.status === 'IN_SERVICE' ? 'bg-blue-500/5' : q.status === 'CALLED' ? 'bg-amber-500/5' : ''}`}>
                          <div className="col-span-1 font-black text-xl text-gold">{q.tokenNumber}</div>
                          <div className="col-span-2">
                             <p className="font-bold">{q.customerName}</p>
                             <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{q.phone}</p>
                          </div>
                          <div className="col-span-1 text-sm text-white/60">{q.serviceName}</div>
                          <div className="col-span-1">
                             <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gold">
                               <Clock className="w-3 h-3" />
                               {q.status === 'WAITING' ? `${waitMin}m` : q.status}
                             </div>
                          </div>
                          <div className="col-span-1">
                             <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] font-bold text-white/40">
                                {barbers.find(b => b.id === q.barberId)?.name || 'Auto'}
                             </span>
                          </div>
                          <div className="col-span-1 flex justify-end gap-2">
                             {q.status === 'WAITING' && (
                               <>
                                 <button onClick={() => handleReorder(q.id, 'up')} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"><ArrowUp className="w-3.5 h-3.5" /></button>
                                 <button onClick={() => handleReorder(q.id, 'down')} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"><ArrowDown className="w-3.5 h-3.5" /></button>
                                 <button
                                   onClick={() => updateStatus(q.id, 'CALLED')}
                                   className="p-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all"
                                   title="Call Now"
                                 >
                                   <Bell className="w-4 h-4" />
                                 </button>
                               </>
                             )}
                             {(q.status === 'WAITING' || q.status === 'CALLED') && (
                               <button
                                 onClick={() => updateStatus(q.id, 'IN_SERVICE')}
                                 className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                                 title="Start Service"
                               >
                                 <Play className="w-4 h-4" />
                               </button>
                             )}
                             {q.status === 'IN_SERVICE' && (
                               <button
                                 onClick={() => updateStatus(q.id, 'COMPLETED')}
                                 className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                                 title="Complete"
                               >
                                 <Check className="w-4 h-4" />
                               </button>
                             )}
                             {q.status !== 'CANCELLED' && q.status !== 'COMPLETED' && (
                               <button
                                 onClick={() => updateStatus(q.id, 'CANCELLED')}
                                 className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                 title="Skip/Cancel"
                               >
                                 <UserMinus className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
             </div>
          </motion.div>
        )}

        {/* Settings View */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <div>
              <h1 className="text-4xl font-display font-black">Shop Settings</h1>
              <p className="text-white/40 mt-1">Configure your shop's operational parameters</p>
            </div>

            <div className="max-w-2xl bg-neutral-900 border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-xl font-bold mb-8">Queue Parameters</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Average Service Time (minutes)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={settings?.avgServiceTime || 30}
                      onChange={(e) => handleUpdateSettings({ ...settings, avgServiceTime: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-gold outline-none transition-all font-bold text-lg"
                      min="1"
                    />
                    <div className="bg-gold/10 text-gold px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                      mins
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-white/30 italic">
                    This value is used to calculate estimated wait times for your customers.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Barbers View */}
        {activeTab === 'barbers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-display font-black">Barber Management</h2>
                <p className="text-white/40 text-sm">Monitor specialist status and assignment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbers.map((barber) => (
                <div key={barber.id} className="bg-neutral-900 border border-white/5 rounded-[2rem] p-6 group hover:border-gold/20 transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <img src={barber.photo} className="w-16 h-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                    <div>
                      <h4 className="font-bold text-lg">{barber.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${barber.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{barber.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {barber.specializations.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[9px] bg-white/5 px-2 py-1 rounded-md text-white/40 font-bold uppercase tracking-tighter">{s}</span>
                      ))}
                    </div>

                    <button
                      onClick={() => toggleBarberStatus(barber.id, barber.status)}
                      className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        barber.status === 'AVAILABLE'
                        ? 'border-amber-500/20 text-amber-500 hover:bg-amber-500/10'
                        : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'
                      }`}
                    >
                      {barber.status === 'AVAILABLE' ? 'Move to Break' : 'Set Available'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Services View */}
        {activeTab === 'services' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-display font-black">Services Management</h2>
                <p className="text-white/40 text-sm">Add, modify or disable services offered at your shop</p>
              </div>
              <button
                onClick={() => {
                  setEditingService(null);
                  setServiceForm({ name: '', description: '', price: 0, duration: 30, category: 'Grooming' });
                  setIsServiceModalOpen(true);
                }}
                className="bg-gold text-black px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-gold/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className={`bg-neutral-900 border rounded-[2rem] p-6 flex flex-col justify-between transition-all ${service.active ? 'border-white/5' : 'border-white/5 opacity-50'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black tracking-widest text-gold uppercase">{service.category}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${service.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {service.active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg mb-2 text-white">{service.name}</h4>
                    <p className="text-xs text-white/50 line-clamp-3 mb-4">{service.description || 'No description provided.'}</p>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-[9px] text-white/30 uppercase block font-bold">Price</span>
                        <span className="text-lg font-black text-white">₹{service.price}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-white/30 uppercase block font-bold">Duration</span>
                        <span className="text-sm font-bold text-white/80">{service.duration} mins</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-xl text-xs transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleServiceActive(service)}
                        className={`font-bold py-2 rounded-xl text-xs transition-all ${service.active ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                      >
                        {service.active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold py-2 rounded-xl text-xs transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews View */}
        {activeTab === 'reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div>
              <h2 className="text-3xl font-display font-black">Review & Feedback Panel</h2>
              <p className="text-white/40 text-sm">Respond to customer ratings and experience notes</p>
            </div>

            <div className="space-y-4">
              {storageService.getReviews().length === 0 ? (
                <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-12 text-center text-white/20 italic">
                  No reviews left by customers yet
                </div>
              ) : (
                storageService.getReviews().map((review) => (
                  <div key={review.id} className="bg-neutral-900 border border-white/5 rounded-[2rem] p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white flex items-center gap-2">
                          {review.customerName}
                          <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-white/40 font-bold uppercase tracking-wider">{review.tags?.[0] || 'Review'}</span>
                        </h4>
                        <p className="text-[10px] text-white/30 font-medium">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-0.5 bg-black/40 border border-white/5 px-2 py-1 rounded-xl">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-gold fill-gold' : 'text-white/10'}`} />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-white/70 italic">"{review.comment}"</p>

                    {review.ownerReply ? (
                      <div className="bg-black/30 border-l-2 border-gold p-4 rounded-xl space-y-1">
                        <span className="text-[10px] uppercase font-black text-gold tracking-widest block">Your Response</span>
                        <p className="text-xs text-white/60">{review.ownerReply}</p>
                      </div>
                    ) : (
                      <div className="pt-2">
                        {replyingToReviewId === review.id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your luxurious response..."
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-gold outline-none text-xs text-white resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReplyToReview(review.id)}
                                className="bg-gold text-black px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider"
                              >
                                Post Reply
                              </button>
                              <button
                                onClick={() => setReplyingToReviewId(null)}
                                className="bg-white/5 text-white/40 px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-white/10"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingToReviewId(review.id);
                              setReplyText('');
                            }}
                            className="bg-white/5 hover:bg-white/10 text-gold px-4 py-2 rounded-xl text-xs font-bold transition-all"
                          >
                            Reply to this review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Appointments View */}
        {activeTab === 'appointments' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-display font-black">Scheduled Appointments</h2>
                <p className="text-white/40 text-sm">Manage bookings and temporal reservations</p>
              </div>
            </div>

            <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="grid grid-cols-7 p-6 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  <div className="col-span-1">Time</div>
                  <div className="col-span-2">Customer</div>
                  <div className="col-span-1">Service</div>
                  <div className="col-span-1">Barber</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                <div className="divide-y divide-white/5">
                  {appointments.length === 0 ? (
                    <div className="p-20 text-center text-white/20 italic">No appointments scheduled</div>
                  ) : (
                    appointments
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((app) => (
                        <div key={app.id} className={`grid grid-cols-7 p-6 items-center hover:bg-white/[0.02] transition-all ${app.status === 'COMPLETED' ? 'opacity-50' : ''}`}>
                          <div className="col-span-1 font-black text-xl text-gold">{app.time}</div>
                          <div className="col-span-2">
                             <p className="font-bold">{app.customerName}</p>
                             <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{app.customerPhone}</p>
                          </div>
                          <div className="col-span-1 text-sm text-white/60">{app.serviceName}</div>
                          <div className="col-span-1">
                             <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] font-bold text-white/40">
                                {app.barberName}
                             </span>
                          </div>
                          <div className="col-span-1">
                             <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                               app.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500' :
                               app.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                               app.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-500' :
                               'bg-white/5 text-white/40'
                             }`}>
                               {app.status}
                             </span>
                          </div>
                          <div className="col-span-1 flex justify-end gap-2">
                             {app.status === 'CONFIRMED' && (
                               <button
                                 onClick={() => {
                                   storageService.updateAppointment({ ...app, status: 'COMPLETED' });
                                   setAppointments(storageService.getAppointmentsByShopId(shop.id));
                                   showToast('Appointment marked as completed', 'success');
                                 }}
                                 className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                                 title="Complete"
                               >
                                 <Check className="w-4 h-4" />
                               </button>
                             )}
                             {(app.status === 'CONFIRMED' || app.status === 'PENDING') && (
                               <button
                                 onClick={() => {
                                   if (window.confirm('Cancel this appointment?')) {
                                     storageService.cancelAppointment(app.id);
                                     setAppointments(storageService.getAppointmentsByShopId(shop.id));
                                     showToast('Appointment cancelled', 'info');
                                   }
                                 }}
                                 className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                 title="Cancel"
                                >
                                 <X className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
             </div>
          </motion.div>
        )}

        {/* Placeholders for other tabs */}
        {(['schedule'].includes(activeTab)) && (

          <div className="h-[60vh] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6">
              <Settings className="w-8 h-8 text-white/20 animate-spin-slow" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Module Under Construction</h2>
            <p className="text-white/40 max-w-xs">This feature is being polished for the premium production release.</p>
          </div>
        )}

      </div>

      {/* Add Walk-in Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-display font-black">Add Walk-in</h3>
                <p className="text-white/40 text-sm mt-1">Insert a new customer directly into the live sequence</p>
              </div>

              <form onSubmit={handleAddWalkin} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Customer Name</label>
                    <input
                      required
                      type="text"
                      value={newWalkin.name}
                      onChange={e => setNewWalkin({ ...newWalkin, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-gold outline-none transition-all text-sm font-bold"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={newWalkin.phone}
                      onChange={e => setNewWalkin({ ...newWalkin, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-gold outline-none transition-all text-sm font-bold"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Select Service</label>
                  <select
                    required
                    value={newWalkin.serviceId}
                    onChange={e => setNewWalkin({ ...newWalkin, serviceId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-gold outline-none transition-all text-sm font-bold appearance-none"
                  >
                    <option value="" className="bg-neutral-900">Choose a service...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id} className="bg-neutral-900">{s.name} - ₹{s.price}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Assign Barber (Optional)</label>
                  <select
                    value={newWalkin.barberId}
                    onChange={e => setNewWalkin({ ...newWalkin, barberId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-gold outline-none transition-all text-sm font-bold appearance-none"
                  >
                    <option value="" className="bg-neutral-900">Auto-assign available</option>
                    {barbers.filter(b => b.status === 'AVAILABLE').map(b => (
                      <option key={b.id} value={b.id} className="bg-neutral-900">{b.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gold text-black font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                >
                  Confirm Entry & Generate Token
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Service Modal */}
      <AnimatePresence>
        {isServiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setIsServiceModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-display font-black">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                <p className="text-white/40 text-sm mt-1">Configure service pricing and temporal parameters</p>
              </div>

              <form onSubmit={handleSaveService} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Service Name</label>
                  <input
                    required
                    type="text"
                    value={serviceForm.name}
                    onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-gold outline-none transition-all text-sm font-bold"
                    placeholder="e.g. Executive Beard Sculpt"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Description</label>
                  <textarea
                    rows={3}
                    value={serviceForm.description}
                    onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-gold outline-none transition-all text-sm font-bold resize-none"
                    placeholder="Describe the premium experience..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Price (₹)</label>
                    <input
                      required
                      type="number"
                      value={serviceForm.price}
                      onChange={e => setServiceForm({ ...serviceForm, price: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-gold outline-none transition-all text-sm font-bold"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Duration (mins)</label>
                    <input
                      required
                      type="number"
                      value={serviceForm.duration}
                      onChange={e => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-gold outline-none transition-all text-sm font-bold"
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Category</label>
                  <select
                    value={serviceForm.category}
                    onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-gold outline-none transition-all text-sm font-bold appearance-none"
                  >
                    <option value="Grooming" className="bg-neutral-900">Grooming</option>
                    <option value="Haircut" className="bg-neutral-900">Haircut</option>
                    <option value="Shave" className="bg-neutral-900">Shave</option>
                    <option value="Styling" className="bg-neutral-900">Styling</option>
                    <option value="Premium" className="bg-neutral-900">Premium</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gold text-black font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                >
                  {editingService ? 'Update Service' : 'Add Service to Menu'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OwnerDashboard;
