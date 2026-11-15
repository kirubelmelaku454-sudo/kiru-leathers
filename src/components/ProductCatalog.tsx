import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  SlidersHorizontal,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  Search,
  X,
  Scissors
} from 'lucide-react';
import { type Product, type SpecialOfferCampaign } from '../types';
import { ProductCard } from './ProductCard';
import { translations, type Language } from '../i18n/translations';

interface ProductCatalogProps {
  theme: 'dark' | 'light';
  products: Product[];
  loading: boolean;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAddToCart: (product: Product) => void;
  currency?: 'USD' | 'ETB';
  exchangeRate?: number;
  lang?: Language;
  onOpenBespoke?: (product?: Product) => void;
  specialOffer?: SpecialOfferCampaign;
  isOfferLive?: boolean;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
type PriceFilterOption = 'all' | 'under-500' | '500-1000' | 'over-1000';

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  theme,
  products,
  loading,
  wishlist,
  onToggleWishlist,
  onSelectProduct,
  onQuickAddToCart,
  currency = 'USD',
  exchangeRate = 125,
  lang = 'en',
  onOpenBespoke,
  specialOffer,
  isOfferLive = false
}) => {
  const t = translations[lang] || translations.en;

  const isProductFlashDeal = (product: Product) => {
    if (!isOfferLive || !specialOffer || !specialOffer.isEnabled) return false;
    if (specialOffer.targetCategory === 'selected') {
      return Boolean(specialOffer.targetProductIds?.includes(product.id));
    }
    if (specialOffer.targetCategory === 'all') return true;
    return specialOffer.targetCategory === product.category;
  };
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [priceFilter, setPriceFilter] = useState<PriceFilterOption>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', label: t.allCategories },
    { id: 'jackets', label: t.jackets },
    { id: 'bags', label: t.bags },
    { id: 'footwear', label: t.footwear },
    { id: 'wallets', label: t.wallets },
    { id: 'belts', label: t.belts || (lang === 'am' ? 'የቆዳ ቀበቶዎች' : 'Belts & Straps') }
  ];

  // Filter out products marked as hidden by the atelier owner
  const visibleProducts = useMemo(() => {
    return products.filter((p) => !p.hidden && !p.is_hidden);
  }, [products]);

  // Category counts for visible products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: visibleProducts.length };
    visibleProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [visibleProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...visibleProducts];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Price filter (normalized in USD)
    if (priceFilter === 'under-500') {
      result = result.filter((p) => p.price < 500);
    } else if (priceFilter === '500-1000') {
      result = result.filter((p) => p.price >= 500 && p.price <= 1000);
    } else if (priceFilter === 'over-1000') {
      result = result.filter((p) => p.price > 1000);
    }

    // In Stock filter
    if (inStockOnly) {
      result = result.filter((p) => p.stock === undefined || p.stock > 0);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (sortBy === 'featured') {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [visibleProducts, searchQuery, activeCategory, priceFilter, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setSortBy('featured');
    setPriceFilter('all');
    setInStockOnly(false);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    activeCategory !== 'all' ||
    priceFilter !== 'all' ||
    inStockOnly ||
    sortBy !== 'featured';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="collection" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
      {/* Section Header with Side & Fade-in Reveal (Bidirectional Scroll) */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-10"
      >
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.catalogTitle}</span>
        </div>
        <h2 className={`font-serif text-3xl sm:text-5xl font-normal tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t.heroTitle}
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-3 max-w-xl mx-auto font-light leading-relaxed`}>
          {t.heroSubtitle}
        </p>
        <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-5" />
      </motion.div>

      {/* Category Tabs with Left-slide Reveal (Bidirectional Scroll) */}
      <motion.div
        initial={{ opacity: 0, x: -35 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mb-8"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 flex items-center gap-2 ${
              activeCategory === cat.id
                ? 'bg-[#3D2314] text-[#D4AF37] border border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                : theme === 'dark'
                ? 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                : 'bg-gray-100 border border-gray-200 text-gray-700 hover:text-black hover:bg-gray-200'
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeCategory === cat.id ? 'bg-[#D4AF37] text-black font-bold' : 'bg-white/10 text-stone-400'
              }`}
            >
              {categoryCounts[cat.id] || 0}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Filter, Search and Control Bar with Right-slide Reveal (Bidirectional Scroll) */}
      <motion.div
        initial={{ opacity: 0, x: 35 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className={`flex flex-col lg:flex-row items-center justify-between gap-4 py-4 px-5 rounded-2xl border ${
          theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-gray-50/90 shadow-sm'
        } backdrop-blur-md mb-8`}
      >
        {/* Left: Search input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            placeholder={t.searchPlaceholder}
            className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-sans transition-all border outline-none ${
              theme === 'dark'
                ? 'bg-stone-900/90 border-stone-800 text-stone-200 placeholder-stone-500 focus:border-[#D4AF37]'
                : 'bg-white border-stone-300 text-stone-800 placeholder-stone-400 focus:border-[#D4AF37]'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center: Filters & Bespoke Trigger */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <button
            type="button"
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`px-3.5 py-2 rounded-lg border text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors ${
              showFilterDrawer || hasActiveFilters
                ? 'bg-[#3D2314] border-[#D4AF37] text-[#D4AF37]'
                : theme === 'dark'
                ? 'border-white/10 hover:border-white/30 text-gray-300 hover:text-white'
                : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700 hover:text-black shadow-sm'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t.filterTitle}</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />}
          </button>

          {onOpenBespoke && (
            <button
              type="button"
              onClick={() => onOpenBespoke()}
              className="px-3.5 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.bespoke}</span>
            </button>
          )}

          <span className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hidden sm:inline`}>
            {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'Creation' : 'Creations'}
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400 hover:text-[#D4AF37]' : 'text-gray-600 hover:text-[#D4AF37]'} flex items-center gap-1 transition-colors`}
            >
              <RotateCcw className="w-3 h-3" /> {t.resetFilters}
            </button>
          )}
        </div>

        {/* Right: Sort & Grid View Toggle */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-2">
            <ArrowUpDown className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={`${
                theme === 'dark' ? 'bg-black/60 border-white/15 text-gray-200' : 'bg-white border-gray-300 text-gray-800 shadow-sm'
              } border text-xs rounded-lg px-3 py-2 font-mono outline-none focus:border-[#D4AF37] cursor-pointer`}
            >
              <option value="featured">{t.sortFeatured}</option>
              <option value="rating">{t.sortRating}</option>
              <option value="newest">{t.sortNewest}</option>
              <option value="price-asc">{t.sortPriceAsc}</option>
              <option value="price-desc">{t.sortPriceDesc}</option>
            </select>
          </div>

          <div
            className={`flex border ${
              theme === 'dark' ? 'border-white/10 bg-black/40' : 'border-gray-300 bg-white shadow-sm'
            } rounded-lg p-0.5`}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#3D2314] text-[#D4AF37]'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-black'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'carousel'
                  ? 'bg-[#3D2314] text-[#D4AF37]'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-black'
              }`}
              title="Carousel Showcase"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Expanded Filter Panel */}
      {showFilterDrawer && (
        <div
          className={`p-5 rounded-2xl border ${
            theme === 'dark' ? 'border-white/10 bg-[#121214]' : 'border-gray-200 bg-white shadow-lg'
          } mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fadeIn`}
        >
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-[#D4AF37] mb-2.5">
              {t.priceRange} ({currency})
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under-500', label: currency === 'ETB' ? `< ${(500 * exchangeRate).toLocaleString()} ETB` : '< $500' },
                {
                  id: '500-1000',
                  label:
                    currency === 'ETB'
                      ? `${(500 * exchangeRate).toLocaleString()} – ${(1000 * exchangeRate).toLocaleString()} ETB`
                      : '$500 – $1,000'
                },
                { id: 'over-1000', label: currency === 'ETB' ? `> ${(1000 * exchangeRate).toLocaleString()} ETB` : '$1,000+' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPriceFilter(p.id as PriceFilterOption)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                    priceFilter === p.id
                      ? 'bg-[#3D2314] text-[#D4AF37] border border-[#D4AF37]'
                      : theme === 'dark'
                      ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-[#D4AF37] mb-2.5">
              {t.inStockOnly}
            </label>
            <label className={`flex items-center gap-2 cursor-pointer text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded accent-[#D4AF37] w-4 h-4 cursor-pointer"
              />
              <span>{t.inStockOnly}</span>
            </label>
          </div>

          <div className="flex items-end justify-start sm:justify-end">
            <button
              onClick={resetFilters}
              className={`text-xs uppercase tracking-widest font-mono ${
                theme === 'dark' ? 'text-gray-400 hover:text-[#D4AF37]' : 'text-gray-600 hover:text-[#D4AF37]'
              } underline underline-offset-4`}
            >
              {t.resetFilters}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 font-mono animate-pulse">
          Polishing artisan collection...
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
          <p className="font-serif text-xl text-gray-300">{t.noProductsFound}</p>
          <p className="text-xs text-gray-500 mt-2">Try adjusting your search terms or filters.</p>
          <button
            onClick={resetFilters}
            className="mt-4 px-5 py-2.5 rounded bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider"
          >
            {t.resetFilters}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {filteredAndSortedProducts.map((product, index) => {
            const isLeft = index % 2 === 0;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: isLeft ? -36 : 36, scale: 0.96 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.12 }}
                transition={{
                  duration: 0.85,
                  ease: [0.16, 1, 0.3, 1],
                  delay: (index % 4) * 0.06
                }}
              >
                <ProductCard
                  product={product}
                  theme={theme}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onSelectProduct={onSelectProduct}
                  onQuickAddToCart={onQuickAddToCart}
                  currency={currency}
                  exchangeRate={exchangeRate}
                  isFlashDeal={isProductFlashDeal(product)}
                  discountPercent={specialOffer?.discountValue}
                />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/80 border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center backdrop-blur-md shadow-2xl hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/80 border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center backdrop-blur-md shadow-2xl hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredAndSortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: (index % 2 === 0 ? -30 : 30), scale: 0.97 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.12 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: (index % 5) * 0.05 }}
                className="min-w-[175px] sm:min-w-[220px] max-w-[260px] flex-shrink-0"
              >
                <ProductCard
                  product={product}
                  theme={theme}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onSelectProduct={onSelectProduct}
                  onQuickAddToCart={onQuickAddToCart}
                  currency={currency}
                  exchangeRate={exchangeRate}
                  isFlashDeal={isProductFlashDeal(product)}
                  discountPercent={specialOffer?.discountValue}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
