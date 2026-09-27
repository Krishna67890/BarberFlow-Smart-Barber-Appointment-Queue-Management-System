import { Shop, Service, Barber, Review, ShopSettings } from '../types';

const defaultSchedule = {
  monday: { open: '09:00', close: '21:00', isOpen: true },
  tuesday: { open: '09:00', close: '21:00', isOpen: true },
  wednesday: { open: '09:00', close: '21:00', isOpen: true },
  thursday: { open: '09:00', close: '21:00', isOpen: true },
  friday: { open: '09:00', close: '21:00', isOpen: true },
  saturday: { open: '08:00', close: '22:00', isOpen: true },
  sunday: { open: '10:00', close: '18:00', isOpen: true },
};

export const INITIAL_SHOP: Shop = {
  id: 'ADMIN',
  ownerId: 'owner-1',
  password: 'admin',
  name: "BarberFlow Studio",
  slug: 'barberflow-studio',
  description: "Experience the pinnacle of grooming at BarberFlow Studio. Our master barbers combine traditional techniques with modern styles to give you a look that's uniquely yours. Premium charcoal ambiance, gold-standard service.",
  logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150&h=150&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&h=600&fit=crop',
  gallery: [
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&h=600&fit=crop'
  ],
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'hello@barberflow.com',
  address: '123 Premium Plaza, High Street',
  area: 'Bandra West',
  city: 'Mumbai',
  district: 'Mumbai Suburb',
  state: 'Maharashtra',
  pincode: '400050',
  latitude: 19.0596,
  longitude: 72.8295,
  schedule: defaultSchedule,
  status: 'OPEN',
  accentColor: '#D4AF37',
  rating: 4.8,
  reviewCount: 126,
  verified: 'VERIFIED',
  createdAt: new Date().toISOString(),
  visibility: 'PUBLIC',
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'ser-1',
    shopId: 'ADMIN',
    name: 'Classic Haircut',
    description: 'Precision cut tailored to your face shape, finished with a hot towel and premium styling product.',
    price: 200,
    duration: 30,
    category: 'Haircut',
    active: true,
  },
  {
    id: 'ser-2',
    shopId: 'ADMIN',
    name: 'Beard Grooming',
    description: 'Expert beard trim, shape, and alignment using a straight razor for crisp lines. Includes beard oil massage.',
    price: 120,
    duration: 20,
    category: 'Beard',
    active: true,
  },
  {
    id: 'ser-3',
    shopId: 'ADMIN',
    name: 'The Royal Combo',
    description: 'Our signature Haircut and Beard Grooming package. The ultimate rejuvenation for the modern gentleman.',
    price: 300,
    duration: 45,
    category: 'Combo',
    active: true,
  },
  {
    id: 'ser-4',
    shopId: 'ADMIN',
    name: 'Premium Hair Styling',
    description: 'Professional wash, scalp massage, and expert styling for that perfect occasion.',
    price: 250,
    duration: 40,
    category: 'Styling',
    active: true,
  },
  {
    id: 'ser-5',
    shopId: 'ADMIN',
    name: 'Luxury Face Clean-up',
    description: 'Deep cleansing, charcoal mask, and hydration treatment to keep your skin fresh.',
    price: 400,
    duration: 45,
    category: 'Skin',
    active: true,
  }
];

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'bar-1',
    shopId: 'ADMIN',
    name: 'Rahul',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
    experience: '8+ Years Experience',
    specializations: ['Skin Fades', 'Beard Art', 'Scissors Cut'],
    isAvailable: true,
    status: 'AVAILABLE',
  },
  {
    id: 'bar-2',
    shopId: 'ADMIN',
    name: 'Amit',
    photo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop',
    experience: '5+ Years Experience',
    specializations: ['Modern Fades', 'Hair Styling'],
    isAvailable: true,
    status: 'AVAILABLE',
  },
  {
    id: 'bar-3',
    shopId: 'ADMIN',
    name: 'Suresh',
    photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop',
    experience: '6+ Years Experience',
    specializations: ['Traditional Cuts', 'Hot Shaves'],
    isAvailable: true,
    status: 'AVAILABLE',
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    shopId: 'ADMIN',
    customerId: 'cust-1',
    customerName: 'Vikram Singh',
    rating: 5,
    comment: 'Best barber shop in town! Rahul is a master with the clippers. The ambiance is so premium and relaxing.',
    photos: [],
    verified: true,
    createdAt: new Date().toISOString(),
    tags: ['Master Barber', 'Premium Vibe'],
  },
  {
    id: 'rev-2',
    shopId: 'ADMIN',
    customerId: 'cust-2',
    customerName: 'Aditya Verma',
    rating: 4,
    comment: 'Great service, Amit did a fantastic job with my beard. Highly recommended.',
    photos: [],
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: ['Beard Expert'],
  }
];

export const INITIAL_SETTINGS: ShopSettings = {
  shopId: 'ADMIN',
  name: 'BarberFlow Studio',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  address: '123 Premium Plaza, High Street, Bandra West',
  autoAcceptQueue: true,
  enableNotifications: true,
  avgServiceTime: 30,
  currency: 'INR',
  workingHours: {
    start: '09:00',
    end: '21:00'
  }
};
