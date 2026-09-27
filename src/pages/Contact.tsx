import React from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Instagram,
  Facebook,
  Twitter,
  ExternalLink
} from 'lucide-react';
import { useStorage } from '../hooks/useStorage';

const Contact: React.FC = () => {
  const { settings } = useStorage();

  const phone = settings?.phone || '+91 98765 43210';
  const whatsapp = settings?.whatsapp || '+91 98765 43210';
  const address = settings?.address || '123 Premium Plaza, High Street, Bandra West';

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      value: phone,
      action: `tel:${phone}`,
      label: "Call Now"
    },
    {
      icon: MessageSquare,
      title: "WhatsApp",
      value: whatsapp,
      action: `https://wa.me/${whatsapp.replace(/\D/g, '')}`,
      label: "Message Us"
    },
    {
      icon: Mail,
      title: "Email",
      value: "hello@barberflow.com",
      action: "mailto:hello@barberflow.com",
      label: "Send Email"
    },
    {
      icon: MapPin,
      title: "Location",
      value: address,
      action: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
      label: "Get Directions"
    }
  ];

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="text-center mb-16">
        <span className="text-gold text-xs font-bold uppercase tracking-[0.3em] bg-gold/10 px-4 py-1.5 rounded-full">
          Get In Touch
        </span>
        <h1 className="text-4xl md:text-5xl font-display mt-4 mb-4">Visit The Studio</h1>
        <p className="text-white/50 max-w-xl mx-auto">
          Have questions or want to inquire about special events? Reach out to our concierge team.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">

        {/* Contact Info */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactMethods.map((method, i) => (
              <motion.a
                key={i}
                href={method.action}
                target={method.icon === MapPin || method.icon === MessageSquare ? "_blank" : "_self"}
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 border-white/5 hover:border-gold/30 group transition-all"
              >
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/10 group-hover:text-gold transition-all text-white/60">
                  <method.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">{method.title}</h3>
                <p className="font-bold text-white mb-4 line-clamp-2">{method.value}</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-gold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {method.label} <ExternalLink className="w-3 h-3" />
                </span>
              </motion.a>
            ))}
          </div>

          <div className="glass-card p-8 border-white/5">
            <h3 className="text-xl font-display mb-6">Studio Hours</h3>
            <div className="space-y-4">
              {[
                { days: "Mon - Fri", hours: "09:00 AM - 09:00 PM" },
                { days: "Saturday", hours: "08:00 AM - 10:00 PM" },
                { days: "Sunday", hours: "10:00 AM - 06:00 PM" }
              ].map((time, i) => (
                <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <span className="font-bold text-white/60">{time.days}</span>
                  <span className="text-gold font-bold">{time.hours}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4 justify-center">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-gold hover:bg-gold/10 transition-all border border-white/10">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-card p-8 md:p-10 border-white/10 bg-neutral-900/40">
          <h3 className="text-2xl font-display mb-2">Send a Message</h3>
          <p className="text-sm text-white/40 mb-8">Drop us a line and we'll get back to you shortly.</p>

          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-gold outline-none text-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-gold outline-none text-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Subject</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-gold outline-none text-white/60 appearance-none">
                <option>General Inquiry</option>
                <option>Special Event Booking</option>
                <option>Feedback & Suggestions</option>
                <option>Careers</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Message</label>
              <textarea
                rows={5}
                placeholder="How can we help you today?"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-gold outline-none text-white transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="button"
              className="w-full bg-gold text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs shadow-lg shadow-gold/10 hover:scale-[1.01] active:scale-95 transition-all"
            >
              Send Concierge Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
