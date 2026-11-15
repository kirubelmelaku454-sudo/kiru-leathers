import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';
import { type ProductReview } from '../types';

interface ProductReviewsProps {
  productId: string;
  reviews?: ProductReview[];
  averageRating?: number;
  totalReviews?: number;
  theme: 'dark' | 'light';
  onAddReview: (productId: string, review: ProductReview) => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  reviews = [],
  averageRating = 5.0,
  totalReviews = reviews.length,
  theme,
  onAddReview
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      author: name.trim(),
      rating,
      date: 'Just now',
      comment: comment.trim(),
      verified: true,
      imageUrl: photoUrl.trim() || undefined
    };

    onAddReview(productId, newRev);
    setName('');
    setComment('');
    setPhotoUrl('');
    setShowAddForm(false);
  };

  return (
    <div className="mt-8 pt-8 border-t border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="font-serif text-xl font-medium tracking-wide flex items-center gap-2">
            Client Reviews
            <span className="text-xs font-mono font-normal text-gray-400">({totalReviews})</span>
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-[#D4AF37]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-sm font-semibold text-[#D4AF37]">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">• 100% Verified Owners</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded text-xs uppercase tracking-widest font-semibold border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {showAddForm ? 'Cancel Review' : 'Write a Review'}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className={`p-5 rounded-xl border mb-6 space-y-4 ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Your Rating:</span>
            <div className="flex gap-1 text-[#D4AF37]">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className="hover:scale-125 transition-transform"
                >
                  <Star className={`w-5 h-5 ${s <= rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-600'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-xs font-mono uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alexander Thorne"
              required
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                theme === 'dark'
                  ? 'border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-[#D4AF37]'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-mono uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Review & Experience</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Describe the leather quality, fit, stitch resilience, and packaging..."
              required
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                theme === 'dark'
                  ? 'border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-[#D4AF37]'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-mono uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Photo or Patina URL (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://... (leather photo or review image)"
                className={`w-full px-4 py-2 rounded-lg border text-xs outline-none transition-colors ${
                  theme === 'dark'
                    ? 'border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-[#D4AF37]'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#D4AF37]'
                }`}
              />
              <button
                type="button"
                onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80')}
                className="px-2.5 py-1.5 rounded border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-mono shrink-0 hover:bg-[#D4AF37] hover:text-black transition-colors"
                title="Use sample workshop photo"
              >
                Sample Photo
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-widest hover:bg-amber-400 transition-colors shadow"
          >
            Publish Verified Review
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {reviews.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-2">No reviews yet. Be the first artisan connoisseur to review this piece.</p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{rev.author}</span>
                  {rev.verified && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono">
                      <CheckCircle className="w-3 h-3" /> Verified Buyer
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{rev.date}</span>
              </div>

              <div className="flex text-[#D4AF37] mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'}`}
                  />
                ))}
              </div>

              <p className={`text-xs font-light leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{rev.comment}</p>

              {rev.imageUrl && (
                <div className="mt-3">
                  <img
                    src={rev.imageUrl}
                    alt={`${rev.author}'s leather review`}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-[#D4AF37]/30 shadow-md hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => window.open(rev.imageUrl, '_blank')}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

