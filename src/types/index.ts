export type UserRole = 'CUSTOMER' | 'OWNER' | 'ADMIN';

export type QueueStatus = 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type ShopStatus = 'OPEN' | 'CLOSED' | 'BUSY' | 'ON_BREAK' | 'TEMPORARILY_CLOSED';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  avatar?: string;
}

export interface Customer extends User {
  role: 'CUSTOMER';
  favoriteShops: string[];
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export interface Owner extends User {
  role: 'OWNER';
  shopIds: string[];
}

export interface WorkingHours {
  open: string; // "HH:mm"
  close: string; // "HH:mm"
  isOpen: boolean;
}

export interface WeeklySchedule {
  monday: WorkingHours;
  tuesday: WorkingHours;
  wednesday: WorkingHours;
  thursday: WorkingHours;
  friday: WorkingHours;
  saturday: WorkingHours;
  sunday: WorkingHours;
}

export interface Shop {
  id: string; // This will be the Shop ID like BF-MUM-001
  ownerId: string;
  password?: string; // Shop password for customers
  name: string;
  slug: string;
  description: string;
  logo: string;
  coverImage: string;
  gallery: string[];
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  area: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  schedule: WeeklySchedule;
  status: ShopStatus;
  accentColor: string;
  rating: number;
  reviewCount: number;
  verified: VerificationStatus;
  createdAt: string;
  visibility: 'PUBLIC' | 'PRIVATE';
}

export interface Service {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  image?: string;
  category: string;
  active: boolean;
}

export interface Barber {
  id: string;
  shopId: string;
  name: string;
  photo: string;
  experience: string;
  specializations: string[];
  isAvailable: boolean;
  status: 'AVAILABLE' | 'BUSY' | 'BREAK' | 'OFFLINE';
  schedule?: WeeklySchedule;
}

export interface QueueEntry {
  id: string;
  shopId: string;
  tokenNumber: string;
  customerId: string;
  customerName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  barberId: string | null;
  barberName: string | null;
  status: QueueStatus;
  type: 'WALK_IN' | 'APPOINTMENT';
  createdAt: string;
  estimatedStartTime: string;
  serviceStartTime?: string;
  completedAt?: string;
  date: string; // YYYY-MM-DD
}

export interface Appointment {
  id: string;
  shopId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  appointmentId?: string;
  rating: number;
  comment: string;
  photos: string[];
  verified: boolean;
  ownerReply?: string;
  createdAt: string;
  tags: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  shopId: string;
  customerId: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  createdAt: string;
}

export interface ShopSettings {
  shopId: string;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  autoAcceptQueue: boolean;
  enableNotifications: boolean;
  avgServiceTime: number;
  currency: string;
  workingHours: {
    start: string;
    end: string;
  };
}

