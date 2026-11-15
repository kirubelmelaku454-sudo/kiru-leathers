import React, { useState } from 'react';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  theme: 'dark' | 'light';
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAddToCart: (product: Product) => void;
  currency?: 'USD' | 'ETB';
  exchangeRate?: number;
  isFlashDeal?: boolean;
  discountPercent?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  theme,
  isWishlisted,
  onToggleWishlist,
  onSelectProduct,
  onQuickAddToCart,
  currency = 'USD',
  exchangeRate = 125,
  isFlashDeal = false,
  discountPercent
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const originalPriceUsd = product.price;
  const discountedPriceUsd = isFlashDeal && discountPercent ? Math.round(originalPriceUsd * (1 - discountPercent / 100)) : originalPriceUsd;

  const displayPrice =
    currency === 'ETB'
      ? `${(originalPriceUsd * exchangeRate).toLocaleString()} ETB`
      : `$${originalPriceUsd.toLocaleString()}`;

  const flashDisplayPrice =
    currency === 'ETB'
      ? `${(discountedPriceUsd * exchangeRate).toLocaleString()} ETB`
      : `$${discountedPriceUsd.toLocaleString()}`;

  const rating = product.rating || 5.0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 4;
  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5';
  const secondaryImage = product.images?.[1] || null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col relative ${
        theme === 'dark'
          ? 'bg-[#101014] border-stone-800/80 hover:border-[#D4AF37]/60 hover:shadow-xl hover:shadow-[#D4AF37]/10'
          : 'bg-white border-stone-200 hover:border-[#D4AF37]/60 hover:shadow-xl'
      } hover:-translate-y-1`}
    >
      {/* ========================================================= */}
      {/* IMAGE CONTAINER & DUAL-IMAGE HOVER FADE (Sleek Compact Aspect) */}
      {/* ========================================================= */}
      <div
        className="relative aspect-square max-h-56 sm:max-h-64 overflow-hidden bg-stone-950 cursor-pointer select-none"
        onClick={() => onSelectProduct(product)}
      >
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
            secondaryImage ? (isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100') : 'group-hover:scale-105'
          }`}
          loading="lazy"
        />

        {/* Secondary Angle Image (Smooth Luxury Crossfade on Hover) */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            referrerPolicy="no-referrer"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            loading="lazy"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {isFlashDeal && discountPercent && (
            <span className="px-2 py-0.5 rounded-full text-[8.5px] font-mono tracking-wider uppercase bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-600 text-stone-950 font-black shadow-lg shadow-amber-500/30 flex items-center gap-1 border border-amber-300/60">
              <span className="animate-pulse">⚡</span> -{discountPercent}%
            </span>
          )}
          {product.isNew && (
            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-mono tracking-widest uppercase bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-black font-extrabold shadow-sm">
              NEW
            </span>
          )}
          {isLowStock && (
            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-mono tracking-wider uppercase bg-amber-500/90 text-stone-950 font-bold shadow-sm">
              Only {product.stock} left
            </span>
          )}
          {isOutOfStock && (
            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-mono tracking-wider uppercase bg-stone-900/90 text-red-400 border border-red-500/40 font-bold shadow-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Floating Glassmorphic Wishlist Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 cursor-pointer ${
            isWishlisted
              ? 'bg-[#3D2314] border-[#D4AF37] text-[#D4AF37] scale-105 shadow-md shadow-[#D4AF37]/20'
              : 'bg-black/40 border-white/20 text-white/90 hover:bg-black/70 hover:scale-110 hover:text-white'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          title={isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-[#D4AF37]' : ''}`} />
        </button>

        {/* Sleek Floating Slide-Up Quick Action Bar */}
        <div className="absolute bottom-2 inset-x-2 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="flex-1 py-1.5 px-2 rounded-lg bg-stone-950/90 hover:bg-black text-white text-[10px] font-mono tracking-wider uppercase font-semibold border border-white/20 backdrop-blur-md flex items-center justify-center gap-1 transition-all shadow-lg hover:border-[#D4AF37]/50 cursor-pointer"
          >
            <Eye className="w-3 h-3 text-[#D4AF37]" />
            <span>View</span>
          </button>

          {!isOutOfStock && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAddToCart(product);
              }}
              className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] hover:brightness-105 text-stone-950 text-[10px] font-mono tracking-wider uppercase font-bold flex items-center justify-center gap-1 transition-all shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
            >
              <ShoppingBag className="w-3 h-3 text-stone-950" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* COMPACT & CAPTIVATING CONTENT DETAILS                     */}
      {/* ========================================================= */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-grow justify-between">
        <div>
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono mb-0.5">
            <span className="text-[#D4AF37] uppercase tracking-[0.15em] font-semibold truncate">
              {product.categoryLabel || product.category}
            </span>
            <div className="flex items-center gap-0.5 text-amber-400 shrink-0 font-medium">
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelectProduct(product)}
            className={`font-serif text-xs sm:text-sm font-semibold tracking-tight ${
              theme === 'dark' ? 'text-stone-100' : 'text-stone-900'
            } hover:text-[#D4AF37] transition-colors cursor-pointer truncate`}
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Miniature Leather Color Dye Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1 mt-1 mb-0.5">
              {product.colors.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full border border-white/20 inline-block shadow-xs"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[8px] font-mono text-stone-500">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Quick Add Mobile Row */}
        <div
          className={`pt-2 mt-1.5 border-t ${
            theme === 'dark' ? 'border-stone-800/80' : 'border-stone-200'
          } flex items-center justify-between`}
        >
          <div>
            <span className="text-[8px] font-mono uppercase text-stone-500 block leading-none">
              {isFlashDeal ? (
                <span className="text-amber-500 font-bold flex items-center gap-0.5">
                  <span>⚡</span> Flash Privilege
                </span>
              ) : (
                'Atelier Piece'
              )}
            </span>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {isFlashDeal && discountPercent ? (
                <>
                  <span className="font-mono text-xs sm:text-sm font-bold text-amber-400">
                    {flashDisplayPrice}
                  </span>
                  <span className="font-mono text-[10px] text-stone-400 line-through">
                    {displayPrice}
                  </span>
                </>
              ) : (
                <span className="font-mono text-xs sm:text-sm font-bold text-[#D4AF37]">
                  {displayPrice}
                </span>
              )}
            </div>
          </div>

          {/* Touch-Friendly Mobile Quick Add Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAddToCart(product);
            }}
            disabled={isOutOfStock}
            className="sm:hidden p-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#D4AF37]/30 transition-all cursor-pointer disabled:opacity-30"
            aria-label="Add to bag"
          >
            <ShoppingBag className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
