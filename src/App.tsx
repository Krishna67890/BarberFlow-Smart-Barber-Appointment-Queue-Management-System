import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import { ToastProvider } from './components/Toast';
import { initializeStorage } from './storage/queueManager';

import Home from './pages/Home';
import Services from './pages/Services';
import Barbers from './pages/Barbers';
import Queue from './pages/Queue';
import Book from './pages/Book';
import MyBooking from './pages/MyBooking';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';

// Owner portal
import OwnerLogin from './pages/OwnerLogin';
import OwnerRegister from './pages/OwnerRegister';
import OwnerDashboard from './pages/OwnerDashboard';

const App: React.FC = () => {
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <ToastProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white">
          <Navbar />
          <main className="flex-grow pt-[73px] pb-16 lg:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/barbers" element={<Barbers />} />
              <Route path="/queue" element={<Queue />} />
              <Route path="/book" element={<Book />} />
              <Route path="/my-booking" element={<MyBooking />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contact" element={<Contact />} />

              <Route path="/owner/login" element={<OwnerLogin />} />
              <Route path="/owner/register" element={<OwnerRegister />} />
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            </Routes>
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
