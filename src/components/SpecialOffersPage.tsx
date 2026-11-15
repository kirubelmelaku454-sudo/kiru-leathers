import React, { useState, useEffect } from 'react';
import { Sparkles, Timer, Tag, Copy, Check, ShieldCheck, Truck, ShoppingBag, Eye } from 'lucide-react';
import { type Product, type SpecialOfferCampaign, type CartItemCustomization, type ProductColor } from '../types';
import type { Language } from '../i18n/translations';

interface SpecialOffersPageProps {
  campaign: SpecialOfferCampaign;
  products: Product[];
  theme: 'dark' | 'light';
  currency: 'USD' | 'ETB';
  exchangeRate: number;
  lang: Language;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (product: Product, color: ProductColor, size: string, quantity: number, customization?: CartItemCustomization) => void;
  onExpire: () => void;
}

export const SpecialOffersPage: React.FC<SpecialOffersPageProps> = ({
  campaign,
  products,
  theme,
  currency,
  exchangeRate,
  lang,
  onSelectProduct,
  onAddToCart,
  onExpire
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Compute countdown in real-time
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(campaign.endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        onExpire();
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [campaign.endDate, onExpire]);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(campaign.promoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filter products matching campaign criteria (Supports individual selected items: 1 per category)
  const eligibleProducts = products.filter((p) => {
    if (campaign.targetCategory === 'selected') {
      return campaign.targetProductIds ? campaign.targetProductIds.includes(p.id) : false;
    }
    if (campaign.targetProductIds && campaign.targetProductIds.length > 0) {
      return campaign.targetProductIds.includes(p.id);
    }
    if (campaign.targetCategory !== 'all' && p.category !== campaign.targetCategory) return false;
    return true;
  });

  const displayProducts = eligibleProducts.filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );

  const isEtb = currency === 'ETB';
  const formatVal = (usd: number) => {
    const val = isEtb ? usd * exchangeRate : usd;
    return isEtb ? `${Math.round(val).toLocaleString()} ETB` : `$${Math.round(val).toLocaleString()}`;
  };

  const calculateDiscountedPrice = (origUsd: number) => {
    if (campaign.discountType === 'percentage') {
      return Math.round(origUsd * (1 - campaign.discountValue / 100));
    }
    return Math.max(0, origUsd - campaign.discountValue);
  };

  const isAm = lang === 'am';

  return (
    <div className={`min-h-screen pt-24 pb-20 ${theme === 'dark' ? 'bg-[#0a0a0c] text-white' : 'bg-[#FAF8F5] text-stone-900'} transition-colors`}>
      
      {/* Top Flash Ticker - Exclusively visible on Discount Page (ከቅናሽ ገጽ ብቻ የሚታይ) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-gradient-to-r from-[#2A180E] via-[#3D2314] to-[#1C1815] text-[#FBF7EE] border border-[#D4AF37]/50 rounded-2xl px-4 py-2.5 sm:py-3 text-xs shadow-xl flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold tracking-wider uppercase shadow">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>{campaign.discountValue}% OFF</span>
            </span>
            <span className="font-serif font-semibold text-stone-200 text-xs sm:text-sm">
              {isAm ? campaign.titleAm : campaign.title}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap ml-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-[#D4AF37]/40 text-[#D4AF37] font-mono text-[11px] font-bold tracking-wider">
              <Timer className="w-3.5 h-3.5" />
              <span>
                {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
              </span>
            </div>

            <div className="text-[11px] font-mono text-stone-300">
              Use code: <strong className="text-[#D4AF37] font-bold tracking-widest">{campaign.promoCode}</strong>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="text-[#D4AF37] hover:text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{copiedCode ? 'COPIED ✓' : (isAm ? 'ኮዱን ቅዳ' : 'CLAIM PRIVILEGE')}</span>
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. HERO EDITORIAL FLASH BANNER */}
      <section className="relative overflow-hidden mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto rounded-3xl border border-[#D4AF37]/40 shadow-2xl bg-[#120F0D]">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 blur-3xl rounded-full pointer-events-none" />

        {/* Background Image Texture */}
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity">
          <img
            src={campaign.bannerImageUrl || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1600&q=80'}
            alt="Atelier Banner"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 p-6 sm:p-12 lg:p-16 flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3D2314]/80 border border-[#D4AF37]/60 text-[#D4AF37] text-xs font-mono tracking-[0.25em] uppercase shadow-lg">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#D4AF37]" />
            <span>{isAm ? 'ልዩ የአቴሊየር የቅናሽ ጊዜ' : campaign.badgeText}</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
            {isAm ? campaign.titleAm : campaign.title}
          </h1>

          <p className="text-sm sm:text-base text-stone-300 font-sans max-w-2xl leading-relaxed">
            {isAm ? campaign.subtitleAm : campaign.subtitle}
          </p>

          {/* REAL-TIME COUNTDOWN CLOCK */}
          <div className="pt-2 pb-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D4AF37] mb-3 flex items-center justify-center gap-1.5 font-semibold">
              <Timer className="w-4 h-4" />
              <span>{isAm ? 'ቅናሹ የሚያበቃበት የቀረ ጊዜ' : 'LIMITED TIME PRIVILEGE EXPIRES IN'}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
              {[
                { label: isAm ? 'ቀናት' : 'DAYS', value: timeLeft.days },
                { label: isAm ? 'ሰዓታት' : 'HOURS', value: timeLeft.hours },
                { label: isAm ? 'ደቂቃዎች' : 'MINS', value: timeLeft.minutes },
                { label: isAm ? 'ሰከንዶች' : 'SECS', value: timeLeft.seconds }
              ].map((unit, i) => (
                <div
                  key={i}
                  className="p-3 sm:p-4 rounded-2xl bg-black/60 border border-[#D4AF37]/40 backdrop-blur-md shadow-xl flex flex-col items-center justify-center min-w-[70px] sm:min-w-[90px]"
                >
                  <span className="font-mono text-2xl sm:text-4xl font-bold text-white tracking-wider">
                    {String(unit.value).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase mt-1">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* PROMO VOUCHER CODE BOX */}
          <div className="p-3 sm:p-4 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-mono text-gray-300">
                {isAm ? 'የቅናሽ ኮድ (Promo Code)፦' : 'Privilege Code:'}
              </span>
              <span className="font-mono text-base font-bold text-[#D4AF37] tracking-widest bg-white/10 px-3 py-1 rounded-lg border border-[#D4AF37]/30">
                {campaign.promoCode}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-4 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-mono text-xs font-bold uppercase transition-all shadow flex items-center gap-1.5 cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? (isAm ? 'ተገልብጧል!' : 'Copied!') : (isAm ? 'ኮዱን ቅዳ' : 'Copy Code')}</span>
            </button>
          </div>

          {/* Assurances Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs font-mono text-stone-400">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>100% Full-Grain Hides</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-[#D4AF37]" />
              <span>White-Glove Delivery</span>
            </div>
            <div className="hidden sm:flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Complimentary 24K Monogram</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CATEGORY FILTER CHIPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
        <div className="flex items-center justify-between border-b border-gray-200/10 pb-4 flex-wrap gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal">
              {isAm ? 'በቅናሽ የተካተቱ የእጅ ስራዎች' : 'Curated Atelier Pieces on Offer'}
            </h2>
            <p className="text-xs font-mono text-stone-400 mt-0.5">
              {displayProducts.length} {isAm ? 'እቃዎች በልዩ ቅናሽ ተዘጋጅተዋል' : 'exclusive pieces eligible for this campaign'}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: isAm ? 'ሁሉም' : 'All Deals' },
              { id: 'jackets', label: isAm ? 'ጃኬቶች' : 'Jackets' },
              { id: 'bags', label: isAm ? 'ቦርሳዎች' : 'Bags & Duffles' },
              { id: 'footwear', label: isAm ? 'ጫማዎች' : 'Footwear' },
              { id: 'wallets', label: isAm ? 'የኪስ ቦርሳ' : 'Wallets' },
              { id: 'belts', label: isAm ? 'ቀበቶዎች' : 'Belts' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === tab.id
                    ? 'bg-[#D4AF37] text-black font-bold shadow-lg shadow-[#D4AF37]/20 scale-105'
                    : theme === 'dark'
                      ? 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10'
                      : 'bg-stone-200/60 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayProducts.map((p) => {
            const origPrice = p.price;
            const flashPrice = calculateDiscountedPrice(origPrice);
            const savings = origPrice - flashPrice;
            const isAdded = addedProductId === p.id;

            return (
              <div
                key={p.id}
                className={`rounded-3xl overflow-hidden border shadow-xl flex flex-col justify-between transition-all group ${
                  theme === 'dark'
                    ? 'bg-[#121216] border-white/10 hover:border-[#D4AF37]/60'
                    : 'bg-white border-stone-200 hover:border-[#D4AF37]'
                }`}
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-[4/5] overflow-hidden bg-stone-900 cursor-pointer" onClick={() => onSelectProduct(p)}>
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-mono text-[11px] font-bold tracking-wider shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{campaign.discountValue}% OFF</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#D4AF37] font-mono text-[10px] border border-[#D4AF37]/30">
                      Save {formatVal(savings)}
                    </span>
                  </div>

                  {/* Stock pill */}
                  <div className="absolute bottom-3 left-3 text-[10px] font-mono text-amber-200 bg-black/75 px-2.5 py-1 rounded-full backdrop-blur-sm border border-amber-500/30">
                    ⚡ {p.stock ?? 7} pieces in vault
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
                      {p.categoryLabel || p.category}
                    </span>
                    <h3
                      onClick={() => onSelectProduct(p)}
                      className="font-serif text-lg font-bold mt-1 hover:text-[#D4AF37] transition-colors cursor-pointer line-clamp-1"
                    >
                      {p.name}
                    </h3>
                    <p className="text-xs text-stone-400 font-sans line-clamp-2 mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Pricing Display */}
                  <div className="pt-2 border-t border-gray-200/10 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-mono text-gray-500 line-through mr-2">
                        {formatVal(origPrice)}
                      </span>
                      <span className="font-serif text-xl font-bold text-[#D4AF37]">
                        {formatVal(flashPrice)}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      Flash Price
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectProduct(p)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        theme === 'dark'
                          ? 'border-white/20 hover:bg-white/10 text-white'
                          : 'border-stone-300 hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const defaultColor = p.colors?.[0] || { name: 'Cognac Brown', hex: '#5C2C16' };
                        const defaultSize = p.sizes?.[0] || 'Standard';
                        onAddToCart(p, defaultColor, defaultSize, 1);
                        setAddedProductId(p.id);
                        setTimeout(() => setAddedProductId(null), 1500);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black text-xs font-mono font-bold uppercase transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-black" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Claim Deal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
