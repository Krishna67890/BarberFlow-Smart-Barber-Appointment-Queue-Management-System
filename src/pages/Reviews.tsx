import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, Sparkles, User } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { storageService } from '../storage/storageService';
import { getData } from '../storage/utils';
import { format } from 'date-fns';
import { useToast } from '../components/Toast';

const Reviews: React.FC = () => {
  const { reviews, refreshData } = useStorage();
  const { showToast } = useToast();

  const [rating, setRating] = useState(5);
  const [name, setName] = useState(() => {
    // Try to get name from localStorage or previous bookings
    const savedName = localStorage.getItem('barberflow_customer_name');
    if (savedName) return savedName;

    const queue = getData<any[]>('barberflow_queue', []);
    if (queue.length > 0) return queue[queue.length - 1].customerName || '';

    return '';
  });
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      showToast('Please provide your name and a comment.', 'error');
      return;
    }

    // Save name for future convenience
    localStorage.setItem('barberflow_customer_name', name.trim());

    const shop = storageService.getShop();
    const newReview = {
      id: `rev-${Date.now()}`,
      shopId: shop.id,
      customerId: `cust-${Date.now()}`,
      customerName: name,
      rating,
      comment,
      photos: [],
      verified: true,
      createdAt: new Date().toISOString(),
      tags: ['Customer Review']
    };

    storageService.saveReview(newReview);
    showToast('Thank you for your premium review!', 'success');

    // Clear form
    setName('');
    setComment('');
    setRating(5);
    refreshData();
  };

  // Calculate statistics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="text-center mb-16">
        <span className="text-gold text-xs font-bold uppercase tracking-[0.3em] bg-gold/10 px-4 py-1.5 rounded-full">
          Guest Book
        </span>
        <h1 className="text-4xl md:text-5xl font-display mt-4 mb-4">Reviews & Experiences</h1>
        <p className="text-white/50 max-w-xl mx-auto">
          Read stories from gentlemen who trust BarberFlow Studio for their premium grooming needs, or share your own experience.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">

        {/* Left Side: Stats and Leave Review Form */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-card p-6 border-white/5 text-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Overall Score</h3>
            <div className="text-5xl font-display text-gold mb-2">{avgRating}</div>
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= Math.round(parseFloat(avgRating)) ? 'text-gold fill-gold' : 'text-white/20'}`}
                />
              ))}
            </div>
            <p className="text-xs text-white/40">Based on {totalReviews} premium ratings</p>
          </div>

          <div className="glass-card p-6 border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-gold w-4 h-4" /> Share Experience
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`p-2 rounded-lg border transition-all ${
                        rating >= num
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-white/5 bg-white/5 text-white/30'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${rating >= num ? 'fill-gold' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ranbir Kapoor"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-gold outline-none text-sm text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Your Thoughts</label>
                <textarea
                  rows={4}
                  placeholder="Describe your haircut or grooming session..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-gold outline-none text-sm text-white resize-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gold text-black font-bold py-3 rounded-xl uppercase tracking-wider text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-gold/10"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: List of Reviews */}
        <div className="lg:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <div className="glass-card p-12 text-center text-white/30 italic">
              No reviews yet. Be the first gentleman to leave your experience!
            </div>
          ) : (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 border-white/5 relative group hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-white/40">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2">
                        {review.customerName}
                        {review.verified && (
                          <span className="text-[9px] uppercase font-black bg-gold/10 text-gold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <CheckCircle className="w-2.5 h-2.5" /> Verified
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-white/30 font-medium">
                        {format(new Date(review.createdAt), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 bg-black/40 border border-white/5 px-2.5 py-1 rounded-xl">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= review.rating ? 'text-gold fill-gold' : 'text-white/10'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-white/70 text-sm leading-relaxed pl-13">
                  "{review.comment}"
                </p>

                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4 pl-13">
                    {review.tags.map(tag => (
                      <span key={tag} className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-white/40 font-bold uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Reviews;
