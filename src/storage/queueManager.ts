import { QueueEntry, QueueStatus, Service, Barber, Shop, Appointment, Review, ShopSettings } from '../types';
import { getData, setData, STORAGE_KEYS } from './utils';
import { format } from 'date-fns';
import { INITIAL_SHOP, INITIAL_SERVICES, INITIAL_BARBERS, INITIAL_REVIEWS, INITIAL_SETTINGS } from '../data/initialData';
import { messagingService } from './messagingService';

export const initializeStorage = () => {
  const storedShops = getData<Shop[]>(STORAGE_KEYS.SHOPS, []);

  // Migration & Force Reset if old data exists
  const isOldVersion = storedShops.length > 0 && (storedShops[0].id === 'BF-001' || storedShops[0].id === 'OWNER');
  const isEmpty = storedShops.length === 0;

  if (isOldVersion || isEmpty) {
    // Clear all barberflow data to force clean state
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('barberflow_')) {
        localStorage.removeItem(key);
      }
    });

    // Set fresh defaults
    setData(STORAGE_KEYS.SHOPS, [INITIAL_SHOP]);
    setData(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    setData(STORAGE_KEYS.BARBERS, INITIAL_BARBERS);
    setData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    setData(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    setData(STORAGE_KEYS.OWNERS, [{
      id: 'owner-1',
      name: 'BarberFlow Admin',
      email: 'admin@barberflow.com',
      phone: '9999911111',
      passwordHash: 'admin',
      role: 'OWNER',
      shopIds: ['ADMIN']
    }]);
  }

  // Ensure Demo Tokens & Appointments exist
  if (!localStorage.getItem(STORAGE_KEYS.QUEUE)) {
    // Generate some demo queue items so dashboard is beautiful out of the box
    const demoQueue: QueueEntry[] = [
      {
        id: 'q-demo-1',
        shopId: 'ADMIN',
        tokenNumber: '#20',
        customerId: 'walkin',
        customerName: 'Rohan Mehta',
        phone: '9876543211',
        serviceId: 'ser-1',
        serviceName: 'Classic Haircut',
        servicePrice: 200,
        serviceDuration: 30,
        barberId: 'bar-1',
        barberName: 'Rahul',
        status: 'IN_SERVICE',
        type: 'WALK_IN',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        estimatedStartTime: new Date().toISOString(),
        date: format(new Date(), 'yyyy-MM-dd')
      },
      {
        id: 'q-demo-2',
        shopId: 'ADMIN',
        tokenNumber: '#21',
        customerId: 'walkin',
        customerName: 'Kabir Malhotra',
        phone: '9876543212',
        serviceId: 'ser-2',
        serviceName: 'Beard Grooming',
        servicePrice: 120,
        serviceDuration: 20,
        barberId: null,
        barberName: null,
        status: 'WAITING',
        type: 'WALK_IN',
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        estimatedStartTime: new Date(Date.now() + 15 * 60000).toISOString(),
        date: format(new Date(), 'yyyy-MM-dd')
      }
    ];
    setData(STORAGE_KEYS.QUEUE, demoQueue);
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    // Demo appointments for a premium feel
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const demoAppointments: Appointment[] = [
      {
        id: 'ADMIN-10241',
        shopId: 'ADMIN',
        customerName: 'Anand Sharma',
        customerPhone: '9812345678',
        customerEmail: 'anand@gmail.com',
        serviceId: 'ser-3',
        serviceName: 'The Royal Combo',
        serviceDuration: 45,
        servicePrice: 300,
        barberId: 'bar-2',
        barberName: 'Amit',
        date: todayStr,
        time: '09:30',
        status: 'CONFIRMED',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ADMIN-10242',
        shopId: 'ADMIN',
        customerName: 'Devendra Joshi',
        customerPhone: '9855543210',
        serviceId: 'ser-1',
        serviceName: 'Classic Haircut',
        serviceDuration: 30,
        servicePrice: 200,
        barberId: 'bar-1',
        barberName: 'Rahul',
        date: todayStr,
        time: '11:00',
        status: 'CONFIRMED',
        createdAt: new Date().toISOString()
      }
    ];
    setData(STORAGE_KEYS.APPOINTMENTS, demoAppointments);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    setData(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    setData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.OWNERS)) {
    setData(STORAGE_KEYS.OWNERS, [
      {
        id: 'owner-1',
        name: 'BarberFlow Admin',
        email: 'admin@barberflow.com',
        phone: '9999911111',
        passwordHash: 'admin',
        role: 'OWNER',
        shopIds: ['ADMIN']
      }
    ]);
  }

  // Set initial token counter if not exists
  if (!localStorage.getItem(`${STORAGE_KEYS.TOKEN_COUNTER}_ADMIN`)) {
    setData(`${STORAGE_KEYS.TOKEN_COUNTER}_ADMIN`, 21);
  }
};

export const generateToken = (shopId: string): string => {
  const counterKey = `${STORAGE_KEYS.TOKEN_COUNTER}_${shopId}`;
  const counter = getData<number>(counterKey, 0) + 1;
  setData(counterKey, counter);
  return `#${counter}`;
};

export const calculateWaitTime = (shopId: string): number => {
  const settings = getData<ShopSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  const avgTime = Number(settings?.avgServiceTime) || 30;

  const queue = getData<QueueEntry[]>(STORAGE_KEYS.QUEUE, []);
  const barbers = getData<Barber[]>(STORAGE_KEYS.BARBERS, []).filter(b => b.isAvailable && b.status !== 'OFFLINE');

  const waitingEntries = queue.filter(e => e.status === 'WAITING');
  const inServiceEntries = queue.filter(e => e.status === 'IN_SERVICE');

  if (barbers.length === 0) return avgTime;

  let totalRemainingTime = inServiceEntries.reduce((acc, entry) => {
    const duration = Number(entry.serviceDuration) || avgTime;
    // If we have multiple barbers, we assume they are working in parallel.
    // For simplicity, we estimate remaining time for currently serving ones as 50% of their service duration.
    return acc + (duration * 0.5);
  }, 0);

  totalRemainingTime += waitingEntries.reduce((acc, entry) => {
    return acc + (Number(entry.serviceDuration) || avgTime);
  }, 0);

  const waitTime = Math.ceil(totalRemainingTime / barbers.length);
  return isNaN(waitTime) ? avgTime : Math.max(5, waitTime);
};

export const recalculateQueueTimes = (shopId: string): void => {
  const currentQueue = getData<QueueEntry[]>(STORAGE_KEYS.QUEUE, []);
  const settings = getData<ShopSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  const barbers = getData<Barber[]>(STORAGE_KEYS.BARBERS, []).filter(b => b.isAvailable && b.status === 'AVAILABLE');
  const avgTime = Number(settings?.avgServiceTime) || 30;

  const waitingEntries = currentQueue
    .filter(e => e.status === 'WAITING' && e.shopId === shopId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Logic: Wait time = (Position / Number of Barbers) * Avg Time
  const activeBarberCount = Math.max(1, barbers.length);

  waitingEntries.forEach((entry, index) => {
    const positionGroup = Math.floor(index / activeBarberCount);
    const waitTime = (positionGroup + 1) * avgTime;
    entry.estimatedStartTime = new Date(Date.now() + waitTime * 60000).toISOString();
  });

  setData(STORAGE_KEYS.QUEUE, currentQueue);
};

export const updateQueueStatus = (entryId: string, status: QueueStatus): void => {
  const currentQueue = getData<QueueEntry[]>(STORAGE_KEYS.QUEUE, []);
  const index = currentQueue.findIndex(e => e.id === entryId);
  if (index !== -1) {
    const entry = currentQueue[index];
    const oldStatus = entry.status;
    entry.status = status;

    if (status === 'COMPLETED' || status === 'CANCELLED') {
      entry.completedAt = new Date().toISOString();
    }

    if (status === 'IN_SERVICE') {
      entry.serviceStartTime = new Date().toISOString();
      if (!entry.barberId) {
        // Auto-assign first available barber if none assigned
        const barbers = getData<Barber[]>(STORAGE_KEYS.BARBERS, []);
        const availableBarber = barbers.find(b => b.isAvailable && b.status === 'AVAILABLE');
        if (availableBarber) {
          entry.barberId = availableBarber.id;
          entry.barberName = availableBarber.name;
        }
      }
    }

    setData(STORAGE_KEYS.QUEUE, currentQueue);

    if (oldStatus !== status) {
      recalculateQueueTimes(entry.shopId);

      // Send notifications based on status change
      if (status === 'CALLED') {
        messagingService.notifyCustomer(entry, 'YOUR_TURN');
      } else if (status === 'IN_SERVICE') {
        messagingService.notifyCustomer(entry, 'IN_SERVICE');
      } else if (status === 'COMPLETED') {
        messagingService.notifyCustomer(entry, 'COMPLETED');
      }
    }
  }
};

export const callNext = (shopId: string): void => {
  const currentQueue = getData<QueueEntry[]>(STORAGE_KEYS.QUEUE, []);
  const nextInLine = currentQueue
    .filter(e => e.status === 'WAITING' && e.shopId === shopId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

  if (nextInLine) {
    updateQueueStatus(nextInLine.id, 'CALLED');
  }
};

export const reorderQueue = (shopId: string, entryId: string, direction: 'up' | 'down'): void => {
  const currentQueue = getData<QueueEntry[]>(STORAGE_KEYS.QUEUE, []);
  const waitingEntries = currentQueue.filter(e => e.status === 'WAITING' && e.shopId === shopId);
  const index = waitingEntries.findIndex(e => e.id === entryId);

  if (index === -1) return;

  if (direction === 'up' && index > 0) {
    const temp = waitingEntries[index].createdAt;
    waitingEntries[index].createdAt = waitingEntries[index - 1].createdAt;
    waitingEntries[index - 1].createdAt = temp;
  } else if (direction === 'down' && index < waitingEntries.length - 1) {
    const temp = waitingEntries[index].createdAt;
    waitingEntries[index].createdAt = waitingEntries[index + 1].createdAt;
    waitingEntries[index + 1].createdAt = temp;
  }

  setData(STORAGE_KEYS.QUEUE, currentQueue);
};

export const addQueueEntry = (
  customerName: string,
  phone: string,
  serviceId: string,
  barberId: string | null
): QueueEntry => {
  const shop = getData<Shop[]>(STORAGE_KEYS.SHOPS, [])[0];
  const services = getData<Service[]>(STORAGE_KEYS.SERVICES, []);
  const barbers = getData<Barber[]>(STORAGE_KEYS.BARBERS, []);

  const service = services.find(s => s.id === serviceId);
  const barber = barbers.find(b => b.id === barberId);

  if (!service) throw new Error('Service not found');

  const tokenNumber = generateToken(shop.id);
  const waitTime = calculateWaitTime(shop.id);
  const estimatedStartTime = new Date(Date.now() + waitTime * 60000).toISOString();

  const newEntry: QueueEntry = {
    id: `q-${Date.now()}`,
    shopId: shop.id,
    tokenNumber,
    customerId: 'walkin',
    customerName,
    phone,
    serviceId,
    serviceName: service.name,
    servicePrice: service.price,
    serviceDuration: service.duration,
    barberId,
    barberName: barber ? barber.name : null,
    status: 'WAITING',
    type: 'WALK_IN',
    createdAt: new Date().toISOString(),
    estimatedStartTime,
    date: format(new Date(), 'yyyy-MM-dd')
  };

  const currentQueue = getData<QueueEntry[]>(STORAGE_KEYS.QUEUE, []);
  setData(STORAGE_KEYS.QUEUE, [...currentQueue, newEntry]);

  // Send confirmation notification
  messagingService.notifyCustomer(newEntry, 'CONFIRMATION');

  return newEntry;
};

export const addAppointment = (
  customerName: string,
  phone: string,
  serviceId: string,
  barberId: string,
  date: string,
  time: string
): Appointment => {
  const services = getData<Service[]>(STORAGE_KEYS.SERVICES, []);
  const barbers = getData<Barber[]>(STORAGE_KEYS.BARBERS, []);
  const service = services.find(s => s.id === serviceId);
  const barber = barbers.find(b => b.id === barberId);

  if (!service || !barber) throw new Error('Service or Barber not found');

  const newAppointment: Appointment = {
    id: `app-${Date.now()}`,
    shopId: 'ADMIN', // Default for this demo
    customerName,
    customerPhone: phone,
    serviceId,
    serviceName: service.name,
    serviceDuration: service.duration,
    servicePrice: service.price,
    barberId,
    barberName: barber.name,
    date,
    time,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  const currentAppointments = getData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
  setData(STORAGE_KEYS.APPOINTMENTS, [...currentAppointments, newAppointment]);

  return newAppointment;
};
