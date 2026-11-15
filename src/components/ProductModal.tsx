import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Heart, Shield, Plus, Minus, Star, Truck, RefreshCw, Send, MessageSquare } from 'lucide-react';
import { type Product, type ProductColor, type ProductReview } from '../types';
import { ProductReviews } from './ProductReviews';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, color?: ProductColor, size?: string, qty?: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  theme: 'dark' | 'light';
  onAddReview: (productId: string, review: ProductReview) => void;
  currency?: 'USD' | 'ETB';
  exchangeRate?: number;
  isFlashDeal?: boolean;
  discountPercent?: number;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  theme,
  onAddReview,
  currency = 'USD',
  exchangeRate = 125,
  isFlashDeal = false,
  discountPercent
}) => {
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors && product.colors[0] ? product.colors[0] : { name: 'Artisan Standard', hex: '#111111' }
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes[0] ? product.sizes[0] : 'Standard'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1551028719-00167b16eac5'];

  const rating = product.rating || 4.9;
  const reviewsCount = product.reviewsCount || (product.reviews ? product.reviews.length : 12);
  const stock = product.stock !== undefined ? product.stock : 10;
  
  const effectiveUnitPriceUsd = isFlashDeal && discountPercent ? Math.round(product.price * (1 - discountPercent / 100)) : product.price;
  const unitPrice = currency === 'ETB' ? effectiveUnitPriceUsd * exchangeRate : effectiveUnitPriceUsd;
  const originalUnitPrice = currency === 'ETB' ? product.price * exchangeRate : product.price;
  const totalPrice = unitPrice * quantity;
  const originalTotalPrice = originalUnitPrice * quantity;
  
  const formattedTotal = currency === 'ETB' ? `${totalPrice.toLocaleString()} ETB` : `$${totalPrice.toLocaleString()}`;
  const formattedOriginalTotal = currency === 'ETB' ? `${originalTotalPrice.toLocaleString()} ETB` : `$${originalTotalPrice.toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className={`w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl relative ${
          theme === 'dark' ? 'bg-[#111214] text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'
        } p-6 sm:p-8`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 z-20 p-2 rounded-full ${
            theme === 'dark'
              ? 'bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black'
          } transition-colors`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery View */}
          <div className="flex flex-col gap-3">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-gray-950 relative">
              <img
                src={images[activeImageIdx]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                className={`absolute top-4 left-4 p-2.5 rounded-full border backdrop-blur-md transition-all ${
                  isWishlisted
                    ? 'bg-[#3D2314] border-[#D4AF37] text-[#D4AF37]'
                    : 'bg-black/40 border-white/20 text-white hover:bg-black/70'
                }`}
                title={isWishlisted ? 'Saved' : 'Save to Wishlist'}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#D4AF37]' : ''}`} />
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-18 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIdx === idx ? 'border-[#D4AF37] scale-105 ring-2 ring-[#D4AF37]/30' : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Reassurance Badges */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10 text-[11px] font-mono text-gray-400">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>100-Yr Stitch Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Complimentary Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>30-Day Bespoke Returns</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Vegetable Tanned Leather</span>
              </div>
            </div>
          </div>

          {/* Product Purchase & Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest font-semibold">
                    {product.categoryLabel || product.category}
                  </span>
                  {isFlashDeal && discountPercent && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-600 text-stone-950 font-black shadow-sm flex items-center gap-1 border border-amber-300">
                      <span>⚡</span> {discountPercent}% FLASH DEAL
                    </span>
                  )}
                </div>

                {/* Rating Badge */}
                <div
                  onClick={() => setActiveTab('reviews')}
                  className="flex items-center gap-1 text-amber-400 cursor-pointer hover:underline text-xs font-mono"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold">{rating}</span>
                  <span className="text-gray-400">({reviewsCount} reviews)</span>
                </div>
              </div>

              <h3 className={`font-serif text-3xl font-normal mt-1 mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {product.name}
              </h3>

              {/* Tabs Switcher */}
              <div className={`flex border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} mb-4`}>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 text-xs uppercase tracking-widest font-mono font-medium transition-colors relative mr-6 ${
                    activeTab === 'details'
                      ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                      : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Specification
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 text-xs uppercase tracking-widest font-mono font-medium transition-colors relative ${
                    activeTab === 'reviews'
                      ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                      : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Reviews ({reviewsCount})
                </button>
              </div>

              {activeTab === 'details' ? (
                <>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} font-light mb-6 leading-relaxed`}>
                    {product.description}
                  </p>

                  {/* Stock status */}
                  <div className="mb-5 flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400 uppercase">Availability:</span>
                    {stock > 0 ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono ${
                        stock <= 3 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stock <= 3 ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                        {stock <= 3 ? `Only ${stock} left in Atelier!` : `In Stock (${stock} units ready)`}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                        Sold Out / ክምችት አልቋል
                      </span>
                    )}
                  </div>

                  {/* Color Selection */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                        Color: <span className="text-[#D4AF37] font-semibold">{selectedColor.name}</span>
                      </label>
                      <div className="flex gap-3">
                        {product.colors.map((c, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedColor(c)}
                            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedColor.name === c.name ? 'border-[#D4AF37] scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          >
                            {selectedColor.name === c.name && (
                              <Check className="w-4 h-4 text-white drop-shadow-md" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider">
                          Size & Fit
                        </label>
                        <span className="text-[10px] font-mono text-[#D4AF37] underline cursor-pointer">
                          Artisan Sizing Guide
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedSize(s)}
                            className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                              selectedSize === s
                                ? 'bg-[#3D2314] text-[#D4AF37] border border-[#D4AF37] shadow'
                                : theme === 'dark'
                                  ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                                  : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Counter */}
                  <div className="mb-6">
                    <label className={`block text-xs font-mono mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Quantity
                    </label>
                    <div className={`inline-flex items-center border rounded-lg p-1 ${
                      theme === 'dark' ? 'border-white/20 bg-black/40 text-white' : 'border-gray-300 bg-gray-100 text-gray-900'
                    }`}>
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className={`p-1.5 rounded disabled:opacity-30 ${
                          theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-200 text-gray-900'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 text-sm font-mono text-[#D4AF37] font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                        disabled={quantity >= stock}
                        className={`p-1.5 rounded disabled:opacity-30 ${
                          theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-200 text-gray-900'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Reviews Component Tab */
                <ProductReviews
                  productId={product.id}
                  reviews={product.reviews}
                  averageRating={rating}
                  totalReviews={reviewsCount}
                  theme={theme}
                  onAddReview={onAddReview}
                />
              )}
            </div>

            {/* Price & Checkout Footer */}
            <div className={`border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} pt-5 mt-6`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-mono text-gray-400 block">
                    {isFlashDeal ? `⚡ Flash Privilege (${discountPercent}% OFF)` : 'Total Investment'}
                  </span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-3xl text-amber-400 font-bold">
                      {formattedTotal}
                    </span>
                    {isFlashDeal && (
                      <span className="font-mono text-base text-gray-400 line-through">
                        {formattedOriginalTotal}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-xs text-gray-400 font-mono">
                  {quantity > 1 ? `(${quantity} × ${currency === 'ETB' ? (effectiveUnitPriceUsd * exchangeRate).toLocaleString() + ' ETB' : '$' + effectiveUnitPriceUsd})` : 'Taxes Included'}
                </span>
              </div>

              {/* Stock Urgency Indicator */}
              {stock > 0 && stock <= 3 && (
                <div className="mb-3 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>⚠️ Only {stock} bespoke pieces remaining in workshop (ጥቂት የቀሩ)</span>
                </div>
              )}
              {stock === 0 && (
                <div className="mb-3 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>Commission Waitlist: Currently crafted on request</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, selectedColor, selectedSize, quantity);
                    onClose();
                  }}
                  disabled={stock === 0}
                  className="flex-1 py-4 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-amber-400 transition-colors shadow-xl shadow-[#D4AF37]/20 disabled:opacity-40"
                >
                  {stock === 0 ? 'Out of Stock' : 'Add To Shopping Bag'}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  className={`p-4 rounded-xl border transition-colors flex items-center justify-center ${
                    isWishlisted
                      ? 'bg-[#3D2314] border-[#D4AF37] text-[#D4AF37]'
                      : 'border-white/15 hover:bg-white/10 text-gray-400 hover:text-white'
                  }`}
                  title={isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#D4AF37]' : ''}`} />
                </button>
              </div>

              {/* Direct Atelier Concierge Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                <a
                  href={`https://t.me/kiruleathers?text=${encodeURIComponent(
                    `ሰላም ኪሩ ሌዘር አቴሊየር! ይሄንን እቃ ማዘዝ እፈልጋለሁ፦\n• ምርት፦ ${product.name}\n• ቀለም፦ ${selectedColor?.name || 'Default'}\n• መጠን፦ ${selectedSize}\n• ብዛት፦ ${quantity}\n• ዋጋ፦ ${currency === 'ETB' ? (product.price * exchangeRate).toLocaleString() + ' ETB' : '$' + product.price}\n\nእባክዎ እንዴት ማጠናቀቅ እንደምችል ያሳውቁኝ።`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-[11px] font-mono font-medium flex items-center justify-center gap-2 transition-all text-center"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>በቴሌግራም ይዘዙ (Telegram)</span>
                </a>

                <a
                  href={`https://wa.me/251911234567?text=${encodeURIComponent(
                    `Hello Kiru Leathers Atelier! I would like to order: ${product.name} (Color: ${selectedColor?.name || 'Standard'}, Size: ${selectedSize}, Price: ${currency === 'ETB' ? (product.price * exchangeRate).toLocaleString() + ' ETB' : '$' + product.price}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-medium flex items-center justify-center gap-2 transition-all text-center"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Concierge</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

