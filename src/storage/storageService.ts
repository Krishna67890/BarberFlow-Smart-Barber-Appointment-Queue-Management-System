import { Shop, Service, Barber, QueueEntry, Appointment, Review, ShopSettings } from '../types';
import { getData, setData, STORAGE_KEYS } from './utils';
import { INITIAL_SHOP } from '../data/initialData';

export const storageService = {
  // Shop Details
  getShop: (): Shop => {
    const shops = getData<Shop[]>(STORAGE_KEYS.SHOPS, []);
    return shops[0] || INITIAL_SHOP;
  },
  getShopById: (id: string): Shop | null => {
    const shops = getData<Shop[]>(STORAGE_KEYS.SHOPS, []);
    return shops.find(s => s.id === id) || (id === 'ADMIN' ? INITIAL_SHOP : null);
  },
  updateShop: (shop: Shop): void => {
    setData(STORAGE_KEYS.SHOPS, [shop]);
  },

  // Services
  getServices: (): Service[] => {
    return getData<Service[]>(STORAGE_KEYS.SERVICES, []);
  },
  saveService: (service: Service): void => {
    const services = getData<Service[]>(STORAGE_KEYS.SERVICES, []);
    setData(STORAGE_KEYS.SERVICES, [...services, service]);
  },
  updateService: (service: Service): void => {
    const services = getData<Service[]>(STORAGE_KEYS.SERVICES, []);
    const idx = services.findIndex(s => s.id === service.id);
    if (idx !== -1) {
      services[idx] = service;
      setData(STORAGE_KEYS.SERVICES, services);
    }
  },
  deleteService: (id: string): void => {
    const services = getData<Service[]>(STORAGE_KEYS.SERVICES, []);
    setData(STORAGE_KEYS.SERVICES, services.filter(s => s.id !== id));
  },

  // Barbers
  getBarbers: (): Barber[] => {
    return getData<Barber[]>(STORAGE_KEYS.BARBERS, []);
  },
  saveBarber: (barber: Barber): void => {
    const barbers = getData<Barber[]>(STORAGE_KEYS.BARBERS, []);
    setData(STORAGE_KEYS.BARBERS, [...barbers, barber]);
  },
  updateBarber: (barber: Barber): void => {
    const barbers = getData<Barber[]>(STORAGE_KEYS.BARBERS, []);
    const idx = barbers.findIndex(b => b.id === barber.id);
    if (idx !== -1) {
      barbers[idx] = barber;
      setData(STORAGE_KEYS.BARBERS, barbers);
    }
  },
  deleteBarber: (id: string): void => {
    const barbers = getData<Barber[]>(STORAGE_KEYS.BARBERS, []);
    setData(STORAGE_KEYS.BARBERS, barbers.filter(b => b.id !== id));
  },

  // Appointments
  getAppointments: (): Appointment[] => {
    return getData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
  },
  getAppointmentsByShopId: (shopId: string): Appointment[] => {
    const all = getData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    return all.filter(a => a.shopId === shopId);
  },
  saveAppointment: (appointment: Appointment): void => {
    const appointments = getData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    setData(STORAGE_KEYS.APPOINTMENTS, [...appointments, appointment]);
  },
  updateAppointment: (appointment: Appointment): void => {
    const appointments = getData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const idx = appointments.findIndex(a => a.id === appointment.id);
    if (idx !== -1) {
      appointments[idx] = appointment;
      setData(STORAGE_KEYS.APPOINTMENTS, appointments);
    }
  },
  cancelAppointment: (id: string): void => {
    const appointments = getData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const idx = appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      appointments[idx].status = 'CANCELLED';
      setData(STORAGE_KEYS.APPOINTMENTS, appointments);
    }
  },

  // Queue
  getQueue: (): QueueEntry[] => {
    return getData<QueueEntry[]>(STORAGE_KEYS.QUEUE, []);
  },
  getQueues: (shopId: string): QueueEntry[] => {
    const all = getData<QueueEntry[]>(STORAGE_KEYS.QUEUE, []);
    return all.filter(q => q.shopId === shopId);
  },
  saveQueue: (queue: QueueEntry[]): void => {
    setData(STORAGE_KEYS.QUEUE, queue);
  },
  updateQueue: (entry: QueueEntry): void => {
    const queue = getData<QueueEntry[]>(STORAGE_KEYS.QUEUE, []);
    const idx = queue.findIndex(q => q.id === entry.id);
    if (idx !== -1) {
      queue[idx] = entry;
      setData(STORAGE_KEYS.QUEUE, queue);
    }
  },

  // Reviews
  getReviews: (): Review[] => {
    return getData<Review[]>(STORAGE_KEYS.REVIEWS, []);
  },
  saveReview: (review: Review): void => {
    const reviews = getData<Review[]>(STORAGE_KEYS.REVIEWS, []);
    setData(STORAGE_KEYS.REVIEWS, [...reviews, review]);

    // Automatically recalculate shop rating
    const shop = storageService.getShop();
    if (shop) {
      const updatedReviews = [...reviews, review];
      const sum = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
      shop.rating = parseFloat((sum / updatedReviews.length).toFixed(1));
      shop.reviewCount = updatedReviews.length;
      storageService.updateShop(shop);
    }
  },
  updateReview: (review: Review): void => {
    const reviews = getData<Review[]>(STORAGE_KEYS.REVIEWS, []);
    const idx = reviews.findIndex(r => r.id === review.id);
    if (idx !== -1) {
      reviews[idx] = review;
      setData(STORAGE_KEYS.REVIEWS, reviews);
    }
  },

  // Settings
  getSettings: (): ShopSettings => {
    return getData<ShopSettings>(STORAGE_KEYS.SETTINGS, {} as ShopSettings);
  },
  updateSettings: (settings: ShopSettings): void => {
    setData(STORAGE_KEYS.SETTINGS, settings);
  },

  // Owner Authentication Session
  getOwnerSession: () => {
    return getData<any>('barberflow_owner_session', null);
  },
  saveOwnerSession: (session: any) => {
    setData('barberflow_owner_session', session);
  },
  logoutOwner: () => {
    localStorage.removeItem('barberflow_owner_session');
    window.dispatchEvent(new Event('storage-update'));
  },

  // Developer Reset Feature
  resetDemoData: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('barberflow_')) {
        localStorage.removeItem(key);
      }
    });
    window.dispatchEvent(new Event('storage-update'));
    window.location.reload();
  }
};
