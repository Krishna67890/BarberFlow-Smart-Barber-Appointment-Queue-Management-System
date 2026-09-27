export const STORAGE_KEYS = {
  OWNERS: 'barberflow_owners',
  SHOPS: 'barberflow_shops',
  SERVICES: 'barberflow_services',
  BARBERS: 'barberflow_barbers',
  CUSTOMERS: 'barberflow_customers',
  APPOINTMENTS: 'barberflow_appointments',
  QUEUE: 'barberflow_queue',
  REVIEWS: 'barberflow_reviews',
  SESSIONS: 'barberflow_sessions',
  FAVORITES: 'barberflow_favorites',
  SETTINGS: 'barberflow_settings',
  TOKEN_COUNTER: 'barberflow_token_counter',
  LAST_RESET_DATE: 'barberflow_last_reset_date',
};

export const getData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch a custom event so other components/hooks can listen to changes
    window.dispatchEvent(new Event('storage-update'));

    // Broadcast cross-browser/tab sync using BroadcastChannel
    try {
      const channel = new BroadcastChannel('barberflow_sync_channel');
      channel.postMessage({ key, value });
      channel.close();
    } catch (bcError) {
      console.error('BroadcastChannel error:', bcError);
    }
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

// Initialize BroadcastChannel listener for cross-tab/browser synchronization
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  const syncChannel = new BroadcastChannel('barberflow_sync_channel');
  syncChannel.onmessage = (event) => {
    const { key, value } = event.data;
    if (key && localStorage.getItem(key) !== JSON.stringify(value)) {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new Event('storage-update'));
    }
  };
}

export const updateData = <T>(key: string, updater: (prev: T) => T, defaultValue: T): void => {
  const current = getData(key, defaultValue);
  const next = updater(current);
  setData(key, next);
};

export const removeData = (key: string): void => {
  localStorage.removeItem(key);
  window.dispatchEvent(new Event('storage-update'));
};
