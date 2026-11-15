import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Scissors, ShieldCheck, ShoppingBag } from 'lucide-react';
import type { Product, CartItemCustomization, ProductColor } from '../types';
import { translations, type Language } from '../i18n/translations';

interface BespokeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProduct?: Product | null;
  onAddToCart: (product: Product, color: ProductColor, size: string, quantity: number, customization?: CartItemCustomization) => void;
  lang: Language;
  currency: 'USD' | 'ETB';
}

export const BespokeStudioModal: React.FC<BespokeStudioModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProduct: initialProduct,
  onAddToCart,
  lang,
  currency
}) => {
  const t = translations[lang];
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct?.id || (products.length > 0 ? products[0].id : '')
  );
  const [monogramText, setMonogramText] = useState('');
  const [foilColor, setFoilColor] = useState<'gold' | 'silver' | 'blind'>('gold');
  const [leatherFinish, setLeatherFinish] = useState('Highland Full-Grain');
  const [hardware, setHardware] = useState('Antique Brass');
  const [customNotes, setCustomNotes] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];

  if (!isOpen || !activeProduct) return null;

  const handleAddToCart = () => {
    const defaultColor = activeProduct.colors?.[0] || { name: 'Artisan Cognac', hex: '#8B4513' };
    const defaultSize = activeProduct.sizes?.[0] || 'Standard';

    const customization: CartItemCustomization = {
      monogramText: monogramText.trim().toUpperCase(),
      foilColor,
      leatherFinish,
      customNotes: `Hardware: ${hardware}. ${customNotes}`.trim()
    };

    onAddToCart(activeProduct, defaultColor, defaultSize, 1, customization);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  const exchangeRate = 125;
  const displayPrice = currency === 'ETB' ? activeProduct.price * exchangeRate : activeProduct.price;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl shadow-2xl p-6 md:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-stone-400 hover:text-white rounded-full bg-stone-800/80 hover:bg-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-2xl font-serif font-bold text-amber-100 tracking-wide">{t.bespokeTitle}</h2>
              <p className="text-sm text-stone-400 font-sans">{t.bespokeSubtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-6">
            {/* Left: Interactive Leather Foil Preview */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
                {t.livePreview}
              </div>

              {/* Realistic Leather Textured Card */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-amber-900/40 bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase tracking-widest text-amber-300/80 font-mono">
                    KIRU ATELIER ADDIS
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono">
                    {activeProduct.category}
                  </span>
                </div>

                {/* Stamped Monogram in the Center */}
                <div className="my-auto text-center flex flex-col items-center justify-center">
                  <div className="p-4 rounded-xl border border-stone-800/80 bg-stone-950/40 backdrop-blur-sm shadow-inner min-w-[140px]">
                    <div
                      className={`text-4xl md:text-5xl font-serif font-bold tracking-widest transition-all duration-300 ${
                        foilColor === 'gold'
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)]'
                          : foilColor === 'silver'
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-stone-200 via-slate-100 to-zinc-400 drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]'
                          : 'text-stone-900 drop-shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-stone-800/50 rounded'
                      }`}
                    >
                      {monogramText.trim() ? monogramText.trim().toUpperCase() : 'KL'}
                    </div>
                    <div className="text-[10px] tracking-widest uppercase text-amber-500/70 mt-2 font-mono">
                      {foilColor === 'gold' ? '24K Gold Stamped' : foilColor === 'silver' ? 'Brushed Silver' : 'Blind Heat Pressed'}
                    </div>
                  </div>
                </div>

                {/* Bottom Specifications */}
                <div className="pt-4 border-t border-stone-800/60 flex justify-between items-center text-xs text-stone-400">
                  <span>{leatherFinish}</span>
                  <span>{hardware}</span>
                </div>
              </div>

              {/* Product preview summary */}
              <div className="mt-4 w-full p-3.5 rounded-xl bg-stone-800/50 border border-stone-800 flex items-center gap-3">
                <img
                  src={activeProduct.images?.[0] || '/assets/hero.png'}
                  alt={activeProduct.name}
                  className="w-14 h-14 object-cover rounded-lg border border-stone-700"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-stone-200 truncate">{activeProduct.name}</h4>
                  <p className="text-xs text-amber-400 font-mono mt-0.5">
                    {currency} {displayPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Customization Controls */}
            <div className="md:col-span-7 space-y-5">
              {/* Select Product */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  {t.selectProduct}
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-sm focus:outline-none focus:border-amber-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category}) - {currency} {(currency === 'ETB' ? p.price * exchangeRate : p.price).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monogram Text Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5 flex justify-between">
                  <span>{t.monogramLetters}</span>
                  <span className="text-[11px] text-stone-400 font-mono">{monogramText.length}/4</span>
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={monogramText}
                  onChange={(e) => setMonogramText(e.target.value.toUpperCase())}
                  placeholder={t.monogramPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-amber-200 font-mono text-lg tracking-widest uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Foil Stamp Finish */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-2">
                  {t.foilFinish}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFoilColor('gold')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition text-center flex flex-col items-center gap-1 ${
                      foilColor === 'gold'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 inline-block shadow"></span>
                    <span>{t.goldFoil}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFoilColor('silver')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition text-center flex flex-col items-center gap-1 ${
                      foilColor === 'silver'
                        ? 'border-zinc-300 bg-zinc-500/10 text-zinc-200'
                        : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-zinc-200 to-stone-400 inline-block shadow"></span>
                    <span>{t.silverFoil}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFoilColor('blind')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition text-center flex flex-col items-center gap-1 ${
                      foilColor === 'blind'
                        ? 'border-stone-500 bg-stone-800 text-amber-100'
                        : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-stone-700 inline-block shadow"></span>
                    <span>{t.blindDeboss}</span>
                  </button>
                </div>
              </div>

              {/* Leather Finish Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  {t.leatherFinish}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'Highland Full-Grain', label: t.fullGrain },
                    { key: 'Oiled Pull-Up', label: t.pullUp },
                    { key: 'Nubuck Suede', label: t.suede }
                  ].map((lf) => (
                    <button
                      key={lf.key}
                      type="button"
                      onClick={() => setLeatherFinish(lf.key)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition ${
                        leatherFinish === lf.key
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-stone-700 bg-stone-800/80 text-stone-400 hover:border-stone-600'
                      }`}
                    >
                      <div className="font-semibold text-stone-200">{lf.key}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{lf.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hardware Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  Hardware Accent
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Antique Brass', 'Matte Black', 'Polished Nickel'].map((hw) => (
                    <button
                      key={hw}
                      type="button"
                      onClick={() => setHardware(hw)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition text-center ${
                        hardware === hw
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-stone-700 bg-stone-800 text-stone-400'
                      }`}
                    >
                      {hw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Notes / Sizing */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  {t.bespokeNotes}
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder={t.bespokeNotesPlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Atelier Guarantee */}
              <div className="flex items-center gap-2 text-xs text-stone-400 bg-stone-800/40 p-2.5 rounded-xl border border-stone-800">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Each bespoke piece is serialized and authenticated by our master craftsman.</span>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdded}
                className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-semibold shadow-lg shadow-amber-900/30 transition transform active:scale-[0.99]"
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5 text-stone-950" />
                    <span>Added to Atelier Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>{t.addBespokeToCart} ({currency} {displayPrice.toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
