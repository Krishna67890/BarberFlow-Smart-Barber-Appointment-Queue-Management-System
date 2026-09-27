import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Star, Users, Clock, Compass } from 'lucide-react';
import { storageService } from '../storage/storageService';
import { Shop } from '../types';

const Shops: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);

  // Search and Filter fields
  const [searchCity, setSearchCity] = useState('');
  const [searchArea, setSearchArea] = useState('');
  const [searchPIN, setSearchPIN] = useState('');
  const [searchShop, setSearchShop] = useState('');

  // Quick filters
  const [openNow, setOpenNow] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  // Geolocation states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
    const allShops = storageService.getShops();
    setShops(allShops);
    setFilteredShops(allShops);
  }, []);

  // Request user geolocation
  const handleNearbyMe = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError("We couldn't access your location. Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSortBy('distance');
      },
      (error) => {
        setGeoError("We couldn't access your location. Search by city, area or PIN instead.");
      }
    );
  };

  // Distance calculator helper (Haversine formula approximation)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  useEffect(() => {
    let result = [...shops];

    if (searchCity) {
      result = result.filter(s => s.city.toLowerCase().includes(searchCity.toLowerCase()));
    }
    if (searchArea) {
      result = result.filter(s => s.area.toLowerCase().includes(searchArea.toLowerCase()) || s.address.toLowerCase().includes(searchArea.toLowerCase()));
    }
    if (searchPIN) {
      result = result.filter(s => s.pincode.includes(searchPIN));
    }
    if (searchShop) {
      result = result.filter(s => s.name.toLowerCase().includes(searchShop.toLowerCase()));
    }

    if (openNow) {
      result = result.filter(s => s.status === 'OPEN');
    }

    // Sort operations
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'distance' && userLocation) {
      result.sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude || 19.0596, a.longitude || 72.8295) || 999;
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude || 19.0596, b.longitude || 72.8295) || 999;
        return distA - distB;
      });
    }

    setFilteredShops(result);
  }, [shops, searchCity, searchArea, searchPIN, searchShop, openNow, sortBy, userLocation]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-12 pb-24">
      <div className="container mx-auto px-6">

        {/* Title */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-black">Barber Shops Across India</h1>
            <p className="text-white/40 mt-1">Discover, join the waitlist queue, or book high-conversion slots instantly.</p>
          </div>

          <button
            onClick={handleNearbyMe}
            className="bg-gradient-to-r from-gold to-bronze text-black font-black px-6 py-3.5 rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-gold/10"
          >
            <Compass className="w-4 h-4" /> Nearby Me
          </button>
        </div>

        {geoError && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl max-w-2xl">
            {geoError}
          </div>
        )}

        {/* Discovery Filter Dashboard */}
        <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-6 md:p-8 mb-12 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Search City</label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Search Area</label>
              <input
                type="text"
                placeholder="e.g. Bandra"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Search PIN</label>
              <input
                type="text"
                placeholder="e.g. 400050"
                value={searchPIN}
                onChange={(e) => setSearchPIN(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Search Shop</label>
              <input
                type="text"
                placeholder="e.g. Royal Cut"
                value={searchShop}
                onChange={(e) => setSearchShop(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none text-white transition-all"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
             <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-white/60 select-none">
                  <input
                    type="checkbox"
                    checked={openNow}
                    onChange={(e) => setOpenNow(e.target.checked)}
                    className="w-5 h-5 rounded bg-white/5 border border-white/10 text-gold focus:ring-0"
                  />
                  Open Now Only
                </label>
             </div>

             <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white/40">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-gold cursor-pointer"
                >
                  <option value="rating">Highest Rated</option>
                  {userLocation && <option value="distance">Distance (Nearest First)</option>}
                </select>
             </div>
          </div>
        </div>

        {/* Shops Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredShops.map((shop) => {
            const distanceValue = userLocation
              ? calculateDistance(userLocation.lat, userLocation.lng, shop.latitude || 19.0596, shop.longitude || 72.8295)
              : null;

            return (
              <div
                key={shop.id}
                className="group bg-neutral-900 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-gold/20 transition-all duration-500 flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                  <img
                    src={shop.coverImage}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                    alt={shop.name}
                  />
                  <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-gold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Demo Shop
                  </div>
                  <div className="absolute bottom-5 right-5 bg-gold text-black text-xs font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-2xl">
                    <Star className="w-3.5 h-3.5 fill-black" /> {shop.rating || '4.5'}
                  </div>
                </div>

                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-2xl font-display font-bold group-hover:text-gold transition-colors leading-tight">{shop.name}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-white/40 text-xs mb-6 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>{shop.area || shop.address}, {shop.city}</span>
                    {distanceValue !== null && (
                      <span className="ml-auto bg-white/5 px-2 py-1 rounded text-gold font-bold">{distanceValue.toFixed(1)} km</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-5 border-y border-white/5 mb-6 text-sm">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Waiting</p>
                      <p className="font-bold flex items-center gap-1.5 text-white">
                        <Users className="w-4 h-4 text-gold/60" />
                        <span>3 people</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Estimated Wait</p>
                      <p className="font-bold flex items-center gap-1.5 text-white">
                        <Clock className="w-4 h-4 text-gold/60" />
                        <span>~25 min</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-2">
                    <Link
                      to={`/shop/${shop.id}`}
                      className="w-full bg-white/5 border border-white/10 hover:bg-gold hover:text-black hover:border-gold text-white font-black py-4 rounded-xl text-center block text-xs uppercase tracking-widest transition-all"
                    >
                      ENTER SHOP
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredShops.length === 0 && (
            <div className="col-span-full py-24 text-center text-white/20 italic font-display text-lg">
              No matching barber shops found. Try searching for "Mumbai" or "Nashik".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shops;
