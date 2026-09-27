import { QueueEntry, Shop } from '../types';
import { storageService } from './storageService';

export const messagingService = {
  sendSMS: (phone: string, message: string) => {
    console.log(`[SMS to ${phone}]: ${message}`);
    // In a real app, you'd call an API like Twilio here
  },

  sendWhatsApp: (phone: string, message: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    console.log(`[WhatsApp to ${phone}]: ${message}`);
    console.log(`[WhatsApp URL]: ${url}`);
    // In a production app, you might use WhatsApp Business API
  },

  notifyCustomer: (entry: QueueEntry, type: 'CONFIRMATION' | 'YOUR_TURN' | 'IN_SERVICE' | 'COMPLETED') => {
    const shop = storageService.getShop();
    let message = '';

    switch (type) {
      case 'CONFIRMATION':
        message = `Hi ${entry.customerName}, your token at ${shop.name} is ${entry.tokenNumber}. Estimated wait: ${Math.max(0, Math.ceil((new Date(entry.estimatedStartTime).getTime() - Date.now()) / 60000))} mins. Track live: ${window.location.origin}/track/${entry.id}`;
        break;
      case 'YOUR_TURN':
        message = `Hey ${entry.customerName}, it's almost your turn! Please head to the station at ${shop.name}. Your token is ${entry.tokenNumber}.`;
        break;
      case 'IN_SERVICE':
        message = `Your service at ${shop.name} has started. Enjoy!`;
        break;
      case 'COMPLETED':
        message = `Thank you for visiting ${shop.name}! We hope you loved your service. Share your experience: ${window.location.origin}/reviews`;
        break;
    }

    // Mock sending both
    messagingService.sendSMS(entry.phone, message);
    messagingService.sendWhatsApp(entry.phone, message);

    // Also add to internal notifications for the "Customer" (in a real app, this would be based on userId)
    // For this demo, we'll just log it.
  }
};
