import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2, X, ArrowRight, Sparkles, Send } from 'lucide-react';
import { type LookbookItem, type Product } from '../types';
import { DEFAULT_LOOKBOOK_ITEMS } from '../data/defaultLookbook';

export const LOOKBOOK_ITEMS: LookbookItem[] = DEFAULT_LOOKBOOK_ITEMS;

interface LookbookSectionProps {
  theme: 'dark' | 'light';
  products: Product[];
  onSelectProductById: (id: string) => void;
  currency?: 'USD' | 'ETB';
  exchangeRate?: number;
  items?: LookbookItem[];
}

export const LookbookSection: React.FC<LookbookSectionProps> = ({
  theme,
  products,
  onSelectProductById,
  currency = 'USD',
  exchangeRate = 125,
  items
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cinemaVideo, setCinemaVideo] = useState<LookbookItem | null>(null);
  const [isCinemaMuted, setIsCinemaMuted] = useState(true);

  const categories = [
    { id: 'all', label: 'All Looks (ሁሉም)' },
    { id: 'jackets', label: 'Jackets (ጃኬቶች)' },
    { id: 'bags', label: 'Bags & Duffles (ቦርሳዎች)' },
    { id: 'wallets', label: 'Wallets (የኪስ ቦርሳ)' },
    { id: 'footwear', label: 'Footwear (ጫማዎች)' },
    { id: 'belts', label: 'Belts (ቀበቶዎች)' }
  ];

  const sourceItems = items && items.length > 0 ? items : LOOKBOOK_ITEMS;
  const filteredItems = sourceItems.filter(
    (item) => !item.isHidden && (selectedCategory === 'all' || item.category === selectedCategory)
  );

  return (
    <section id="lookbook" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Section Header with Side & Fade-in Reveal (Bidirectional Scroll) */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3D2314]/70 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono tracking-[0.25em] uppercase mb-4 shadow">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Haute Maroquinerie Editorial</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-normal mt-1 mb-4 tracking-tight">
          The Video Lookbook
        </h2>
        <p className="text-xs sm:text-sm font-light text-stone-400 font-sans max-w-xl mx-auto leading-relaxed">
          Witness authentic Ethiopian master saddlery and Tuscan vegetable tanning in motion. Tap any piece to inspect or shop directly from the atelier.
        </p>

        {/* Category Filter Pills with Smooth Slide-in (Bidirectional Scroll) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-8"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#D4AF37] text-black font-bold shadow-lg shadow-[#D4AF37]/20 scale-105'
                  : theme === 'dark'
                  ? 'bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10 hover:text-white'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 shadow-2xs'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>
      </motion.div>

      {/* Lookbook Video Grid: 4 items per line (1 line 4 items) on desktop with minimized compact card size */}
      {filteredItems.length === 0 ? (
        <div className={`text-center py-16 px-4 rounded-3xl border ${
          theme === 'dark' ? 'bg-stone-900/40 border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-600'
        }`}>
          <p className="font-serif text-lg text-[#D4AF37] mb-1">No Looks Available (ምንም አልተገኘም)</p>
          <p className="text-xs font-mono">This collection is currently being curated in the atelier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredItems.map((item, index) => {
            const fromLeft = index % 2 === 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: fromLeft ? -35 : 35, scale: 0.96 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.12 }}
                transition={{
                  duration: 0.85,
                  ease: [0.16, 1, 0.3, 1],
                  delay: (index % 4) * 0.06
                }}
              >
                <LookbookCard
                  item={item}
                  theme={theme}
                  currency={currency}
                  exchangeRate={exchangeRate}
                  products={products}
                  onSelectProductById={onSelectProductById}
                  onOpenCinema={() => {
                    setCinemaVideo(item);
                    setIsCinemaMuted(false);
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Cinema Fullscreen Video Modal */}
      <AnimatePresence>
        {cinemaVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-stone-950 border border-[#D4AF37]/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setCinemaVideo(null)}
                className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer border border-white/10"
                title="Close Cinema View"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Video Player Side */}
              <div className="relative flex-1 bg-black flex items-center justify-center min-h-[350px] md:min-h-[550px]">
                {cinemaVideo.videoUrl && (
                  <video
                    src={cinemaVideo.videoUrl}
                    poster={cinemaVideo.image}
                    autoPlay
                    loop
                    playsInline
                    muted={isCinemaMuted}
                    className="w-full h-full max-h-[75vh] object-contain"
                  />
                )}

                {/* Sound Toggle */}
                <button
                  type="button"
                  onClick={() => setIsCinemaMuted(!isCinemaMuted)}
                  className="absolute bottom-4 left-4 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer border border-white/10 flex items-center gap-1.5 text-xs font-mono"
                >
                  {isCinemaMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isCinemaMuted ? 'Unmute' : 'Muted'}</span>
                </button>
              </div>

              {/* Editorial & Shoppable Product Side */}
              <div className="w-full md:w-80 p-6 sm:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 bg-stone-900/90 text-white">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                      {cinemaVideo.location}
                    </span>
                    <h3 className="font-serif text-2xl font-bold mt-1">
                      {cinemaVideo.title}
                    </h3>
                  </div>

                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    {cinemaVideo.description}
                  </p>
                </div>

                {cinemaVideo.hotspot && (
                  <div className="pt-6 border-t border-white/10 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block">
                      Featured Atelier Piece
                    </span>
                    <div className="p-3.5 rounded-2xl bg-black/50 border border-[#D4AF37]/30 flex items-center justify-between">
                      <div>
                        <p className="font-serif text-sm font-bold text-white">
                          {cinemaVideo.hotspot.productName}
                        </p>
                        <p className="text-xs text-[#D4AF37] font-mono mt-0.5">
                          {cinemaVideo.hotspot.price}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const pid = cinemaVideo.hotspot!.productId;
                        setCinemaVideo(null);
                        onSelectProductById(pid);
                      }}
                      className="w-full py-3.5 bg-[#D4AF37] text-black font-semibold text-xs font-mono uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Shop This Piece (ይዘዙ)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href={`https://t.me/kiruleathers?text=${encodeURIComponent(
                        `ሰላም ኪሩ ሌዘር! በLookbook ላይ ያየሁትን ${cinemaVideo.title} (${cinemaVideo.hotspot.productName}) ማዘዝ እፈልጋለሁ።`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all text-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Order on Telegram (ቴሌግራም)</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

interface LookbookCardProps {
  item: LookbookItem;
  theme: 'dark' | 'light';
  currency: 'USD' | 'ETB';
  exchangeRate: number;
  products: Product[];
  onSelectProductById: (id: string) => void;
  onOpenCinema: () => void;
}

const LookbookCard: React.FC<LookbookCardProps> = ({
  item,
  theme,
  currency,
  exchangeRate,
  products,
  onSelectProductById,
  onOpenCinema
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const matchedProduct = products.find(
    (p) => p.id === item.hotspot?.productId || p.name === item.hotspot?.productName
  );

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Format price
  const displayPrice = matchedProduct
    ? currency === 'ETB'
      ? `${(matchedProduct.price * exchangeRate).toLocaleString()} ETB`
      : `$${matchedProduct.price.toLocaleString()}`
    : item.hotspot?.price || '$680';

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-500 shadow-lg flex flex-col aspect-[3/4] ${
        theme === 'dark' ? 'border-white/10 bg-stone-950 hover:border-[#D4AF37]/60' : 'border-stone-200 bg-white hover:border-[#D4AF37]/60'
      }`}
    >
      {/* Background Poster Image */}
      <img
        src={item.image}
        alt={item.title}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          isPlaying ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* HTML5 Video Element */}
      {item.videoUrl && (
        <video
          ref={videoRef}
          src={item.videoUrl}
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Ambient Dark Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/40 pointer-events-none" />

      {/* Top Bar: Location & Control Badges (Compact) */}
      <div className="relative z-10 p-3 sm:p-3.5 flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase bg-black/60 border border-white/15 text-[#D4AF37] backdrop-blur-md truncate max-w-[125px]">
          {item.location}
        </span>

        <div className="flex items-center gap-1">
          {item.videoUrl && (
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-black/60 border border-white/15 text-white hover:bg-[#D4AF37] hover:text-black transition-colors backdrop-blur-md cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCinema}
            className="p-1.5 rounded-full bg-black/60 border border-white/15 text-white hover:bg-[#D4AF37] hover:text-black transition-colors backdrop-blur-md cursor-pointer"
            title="Expand to Cinema View"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Center Play Indicator (Compact) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          onClick={togglePlay}
          className={`w-11 h-11 rounded-full bg-black/60 border border-[#D4AF37]/60 text-[#D4AF37] flex items-center justify-center backdrop-blur-md transition-all duration-300 pointer-events-auto cursor-pointer shadow-lg ${
            isPlaying ? 'opacity-0 group-hover:opacity-100 scale-90' : 'opacity-90 hover:scale-110'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </div>
      </div>

      {/* Bottom Content: Title & Shoppable Hotspot (Compact Tailored for 4-Col Grid) */}
      <div className="relative z-10 p-3 sm:p-3.5 mt-auto space-y-2">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-wider text-amber-300 font-bold block">
            {item.category?.toUpperCase() || 'BESPOKE'}
          </span>
          <h3 className="font-serif text-xs sm:text-sm text-white font-medium tracking-tight truncate" title={item.title}>
            {item.title}
          </h3>
        </div>

        {item.hotspot && (
          <div
            onClick={() => onSelectProductById(item.hotspot!.productId)}
            className="p-2 sm:p-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all flex items-center justify-between cursor-pointer group/spot shadow-xl hover:bg-black/90"
            title="Inspect Piece & Shop"
          >
            <div className="truncate mr-2">
              <p className="text-[11px] text-white font-medium group-hover/spot:text-[#D4AF37] transition-colors truncate">
                {item.hotspot.productName}
              </p>
              <p className="text-[10px] text-[#D4AF37] font-mono font-bold mt-0.5">
                {displayPrice}
              </p>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] group-hover/spot:bg-[#D4AF37] group-hover/spot:text-black transition-colors shrink-0">
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
