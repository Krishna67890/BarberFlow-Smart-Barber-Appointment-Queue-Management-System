import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, User, Phone, CheckCircle, Clock, Users, ArrowRight, ArrowLeft, Calendar } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { addQueueEntry, addAppointment } from '../storage/queueManager';
import { useToast } from '../components/Toast';
import { format } from 'date-fns';

const Book: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { services, barbers, queue, settings } = useStorage();

  const isAppointmentMode = location.state?.mode === 'appointment';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceId: '',
    barberId: '',
    customerName: '',
    phone: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00'
  });

  useEffect(() => {
    if (location.state?.selectedServiceId) {
      setFormData(prev => ({ ...prev, serviceId: location.state.selectedServiceId }));
      setStep(2);
    }
  }, [location.state]);

  const handleServiceSelect = (id: string) => {
    setFormData({ ...formData, serviceId: id });
    setStep(2);
  };

  const handleBarberSelect = (id: string) => {
    setFormData({ ...formData, barberId: id });
    setStep(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.serviceId) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (isAppointmentMode) {
      if (!formData.barberId) {
        showToast('Please select a barber for appointment', 'error');
        return;
      }

      const app = addAppointment(
        formData.customerName,
        formData.phone,
        formData.serviceId,
        formData.barberId,
        formData.date,
        formData.time
      );
      showToast('Appointment booked successfully!');
      navigate('/track', { state: { phone: app.customerPhone } });
    } else {
      const entry = addQueueEntry(
        formData.customerName,
        formData.phone,
        formData.serviceId,
        formData.barberId || null
      );
      showToast('Token generated successfully!');
      navigate('/track', { state: { phone: entry.phone } });
    }
  };

  const selectedService = services.find(s => s.id === formData.serviceId);
  const selectedBarber = barbers.find(b => b.id === formData.barberId);

  const waitingCount = queue.filter(q => q.status === 'WAITING').length;
  const avgTime = Number(settings?.avgServiceTime);
  const estWait = waitingCount * (isNaN(avgTime) ? 30 : avgTime);

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display mb-2">{isAppointmentMode ? 'Book Appointment' : 'Join Waitlist'}</h1>
        <p className="text-white/40">{isAppointmentMode ? 'Schedule a specific time for your grooming session.' : 'Get a live token and wait for your turn.'}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-2 ${step >= s ? 'text-gold' : 'text-white/30'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= s ? 'border-gold bg-gold/10' : 'border-white/10'}`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">
                {s === 1 ? 'Service' : s === 2 ? 'Barber' : 'Details'}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gold"
            initial={{ width: '0%' }}
            animate={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-3xl font-display mb-8">Select a Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className={`glass-card p-6 text-left border-2 transition-all ${
                    formData.serviceId === service.id ? 'border-gold bg-gold/5' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{service.name}</h3>
                    <span className="text-gold font-bold">₹{service.price}</span>
                  </div>
                  <p className="text-sm text-white/50 mb-4">{service.description}</p>
                  <div className="flex items-center gap-2 text-xs text-white/40 font-bold uppercase">
                    <Clock className="w-4 h-4" /> {service.duration} mins
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-display">Choose a Barber</h2>
              {!isAppointmentMode && (
                <button
                  onClick={() => setStep(3)}
                  className="text-gold text-sm font-bold flex items-center gap-1 hover:underline"
                >
                  Skip / Any Barber <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => handleBarberSelect(barber.id)}
                  className={`glass-card p-6 flex items-center gap-6 text-left border-2 transition-all ${
                    formData.barberId === barber.id ? 'border-gold bg-gold/5' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <img src={barber.photo} alt={barber.name} className="w-20 h-20 rounded-xl object-cover" />
                  <div>
                    <h3 className="text-xl font-bold mb-1">{barber.name}</h3>
                    <p className="text-xs text-gold font-bold uppercase tracking-wider mb-2">{barber.experience}</p>
                    <div className="flex flex-wrap gap-1">
                      {barber.specializations?.slice(0, 2).map(s => (
                        <span key={s} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/60">{s}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Services
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-3xl font-display mb-8">Your Details</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {isAppointmentMode && (
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-widest text-white/40">Select Date</label>
                          <input
                            type="date"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 focus:border-gold outline-none text-white"
                            value={formData.date}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-widest text-white/40">Select Time</label>
                          <select
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 px-4 focus:border-gold outline-none text-white"
                            value={formData.time}
                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                          >
                             {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(t => (
                               <option key={t} value={t}>{t}</option>
                             ))}
                          </select>
                       </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-white/40">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-gold outline-none transition-colors"
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-white/40">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <input
                        type="tel"
                        required
                        placeholder="Enter mobile number"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-gold outline-none transition-colors"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-gold text-black py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform"
                    >
                      {isAppointmentMode ? 'CONFIRM APPOINTMENT' : 'CONFIRM & GET TOKEN'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-6 border-gold/20">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-gold mb-6">Booking Summary</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-white/40 text-sm">Service</span>
                      <span className="font-bold text-right">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-white/40 text-sm">Barber</span>
                      <span className="font-bold text-right">{selectedBarber?.name || 'Any Available'}</span>
                    </div>
                    {isAppointmentMode && (
                      <div className="flex justify-between items-start">
                        <span className="text-white/40 text-sm">Schedule</span>
                        <span className="font-bold text-right">{formData.date} at {formData.time}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <span className="text-white/40 text-sm">Price</span>
                      <span className="font-bold text-gold">₹{selectedService?.price}</span>
                    </div>
                    {!isAppointmentMode && (
                      <div className="pt-4 border-t border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Users className="w-4 h-4" />
                          <span>{waitingCount} people ahead</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>~{estWait} min wait</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Barber Selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Book;
