import { useState, useEffect, useCallback } from 'react';
import { getData, setData, STORAGE_KEYS } from '../storage/utils';
import { QueueEntry, Service, Barber, ShopSettings, Review, Notification, Appointment } from '../types';
import { INITIAL_SETTINGS, INITIAL_SERVICES, INITIAL_BARBERS } from '../data/initialData';

export const useStorage = () => {
  const [settings, setSettingsState] = useState<ShopSettings>(() => getData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS));
  const [services, setServicesState] = useState<Service[]>(() => getData(STORAGE_KEYS.SERVICES, INITIAL_SERVICES));
  const [barbers, setBarbersState] = useState<Barber[]>(() => getData(STORAGE_KEYS.BARBERS, INITIAL_BARBERS));
  const [queue, setQueueState] = useState<QueueEntry[]>(() => getData(STORAGE_KEYS.QUEUE, []));
  const [appointments, setAppointmentsState] = useState<Appointment[]>(() => getData(STORAGE_KEYS.APPOINTMENTS, []));
  const [history, setHistoryState] = useState<QueueEntry[]>(() => getData(STORAGE_KEYS.HISTORY, []));
  const [reviews, setReviewsState] = useState<Review[]>(() => getData(STORAGE_KEYS.REVIEWS, []));
  const [notifications, setNotificationsState] = useState<Notification[]>(() => getData(STORAGE_KEYS.NOTIFICATIONS, []));

  const refreshData = useCallback(() => {
    setSettingsState(getData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS));
    setServicesState(getData(STORAGE_KEYS.SERVICES, INITIAL_SERVICES));
    setBarbersState(getData(STORAGE_KEYS.BARBERS, INITIAL_BARBERS));
    setQueueState(getData(STORAGE_KEYS.QUEUE, []));
    setAppointmentsState(getData(STORAGE_KEYS.APPOINTMENTS, []));
    setHistoryState(getData(STORAGE_KEYS.HISTORY, []));
    setReviewsState(getData(STORAGE_KEYS.REVIEWS, []));
    setNotificationsState(getData(STORAGE_KEYS.NOTIFICATIONS, []));
  }, []);

  useEffect(() => {
    window.addEventListener('storage-update', refreshData);
    window.addEventListener('storage', refreshData);
    return () => {
      window.removeEventListener('storage-update', refreshData);
      window.removeEventListener('storage', refreshData);
    };
  }, [refreshData]);

  const addNotification = useCallback((title: string, message: string, type: Notification['type'] = 'info') => {
    const newNotif: Notification = {
      id: crypto.randomUUID(),
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false,
      type
    };
    const updated = [newNotif, ...getData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, [])];
    setData(STORAGE_KEYS.NOTIFICATIONS, updated);
  }, []);

  return {
    settings,
    services,
    barbers,
    queue,
    appointments,
    history,
    reviews,
    notifications,
    addNotification,
    refreshData
  };
};
