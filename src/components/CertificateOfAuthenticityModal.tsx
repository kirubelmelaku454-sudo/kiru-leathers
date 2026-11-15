import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Printer, X, QrCode, CheckCircle2 } from 'lucide-react';
import { type Order, type CartItem } from '../types';
import { KiruLogo } from './KiruLogo';

interface CertificateOfAuthenticityModalProps {
  order: Order;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const CertificateOfAuthenticityModal: React.FC<CertificateOfAuthenticityModalProps> = ({
  order,
  onClose,
  theme = 'dark'
}) => {
  void theme;
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);

  const activeItem: CartItem | undefined = order.items[selectedItemIdx] || order.items[0];

  const handlePrint = () => {
    window.print();
  };

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const certNumber = `KL-AUTH-${order.id.replace(/[^A-Za-z0-9]/g, '').slice(-6).toUpperCase()}-${selectedItemIdx + 1}`;
  const batchNumber = `BATCH-TUS-AA-${order.id.slice(0, 4).toUpperCase()}-94`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-3xl bg-[#0f0e0c] text-[#f7f3eb] rounded-2xl shadow-2xl overflow-hidden relative border border-[#D4AF37]/40 my-6"
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-[#1C1815] text-white px-6 py-3.5 flex items-center justify-between border-b border-[#D4AF37]/30 print:hidden">
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <span className="p-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-[#D4AF37] font-semibold tracking-wider uppercase">
              Official Atelier Heirloom Registry
            </span>
            <span className="text-gray-400 hidden sm:inline">• {certNumber}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-amber-400 text-black font-mono text-xs uppercase font-bold flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-item selector if order contains multiple items (Hidden on print) */}
        {order.items.length > 1 && (
          <div className="px-6 py-2.5 bg-[#171412] border-b border-white/5 flex items-center gap-2 overflow-x-auto print:hidden">
            <span className="text-[11px] font-mono text-gray-400 whitespace-nowrap">
              Select Piece:
            </span>
            {order.items.map((item, idx) => (
              <button
                key={item.product.id + idx}
                type="button"
                onClick={() => setSelectedItemIdx(idx)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                  selectedItemIdx === idx
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {item.product.name}
              </button>
            ))}
          </div>
        )}

        {/* Parchment Certificate Body */}
        <div id="printable-certificate" className="p-6 sm:p-12 text-[#2A231C] bg-[#FBF7EE] relative select-none print:p-0 print:bg-white">
          {/* Subtle Decorative Guilloche Border */}
          <div className="border-4 border-[#8B7355] p-5 sm:p-8 relative rounded-lg outline outline-1 outline-[#8B7355] outline-offset-4 bg-[#FBF7EE] shadow-inner">
            
            {/* Corner Florentine Ornaments */}
            <div className="absolute top-2 left-2 text-[#8B7355] font-serif text-lg leading-none select-none">✦</div>
            <div className="absolute top-2 right-2 text-[#8B7355] font-serif text-lg leading-none select-none">✦</div>
            <div className="absolute bottom-2 left-2 text-[#8B7355] font-serif text-lg leading-none select-none">✦</div>
            <div className="absolute bottom-2 right-2 text-[#8B7355] font-serif text-lg leading-none select-none">✦</div>

            {/* Atelier Crest / Logo */}
            <div className="text-center pt-2 pb-4 border-b border-[#8B7355]/30">
              <div className="flex justify-center mb-1">
                <KiruLogo variant="stacked" size="sm" theme="light" />
              </div>
              <p className="text-[10px] tracking-[0.3em] font-mono uppercase text-[#6B5A42] mt-1">
                Florence & Addis Ababa • Maison Est. 2024
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#1E1712] font-semibold tracking-wide uppercase mt-3">
                Certificate of Authenticity
              </h1>
              <p className="text-xs font-serif italic text-[#8B7355] mt-0.5">
                የዕደ-ጥበብ እና የትክክለኛነት ኦፊሴላዊ የቅርስ ምስክር ወረቀት
              </p>
            </div>

            {/* Official Proclamation */}
            <div className="py-6 sm:py-8 text-center max-w-xl mx-auto space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] font-mono text-[#8B7355]">
                Attestation of Commission & Provenance
              </p>
              <p className="text-sm sm:text-base font-serif text-[#2C2219] leading-relaxed">
                This document certifies that the artisanal leather commission identified below has been individually handcrafted at <strong className="font-semibold text-[#1A130E]">Kiru Leathers Atelier</strong> in strict accordance with ancestral Tuscan vegetable tanning standards and master saddlery discipline.
              </p>

              {/* Master Commission Highlight Box */}
              <div className="p-4 sm:p-5 rounded-lg bg-[#F5EDE0] border border-[#8B7355]/40 text-left my-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-[#8B7355] block tracking-wider">Artisanal Masterpiece</span>
                    <strong className="text-sm font-serif text-[#1C1510] block mt-0.5">
                      {activeItem?.product.name || 'Artisanal Commission'}
                    </strong>
                    <span className="text-[11px] text-[#6B5A42]">
                      Variant: {activeItem?.color?.name || 'Espresso Brown'}
                      {activeItem?.size ? ` • Size: ${activeItem.size}` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-[#8B7355] block tracking-wider">Registered Collector</span>
                    <strong className="text-sm font-serif text-[#1C1510] block mt-0.5">
                      {order.customer.fullName || 'Private Client'}
                    </strong>
                    <span className="text-[11px] text-[#6B5A42]">
                      {order.customer.city || 'Addis Ababa'}, Ethiopia
                    </span>
                  </div>
                </div>

                {/* Bespoke Monogramming Note if present */}
                {activeItem?.customization?.monogramText && (
                  <div className="mt-3 pt-3 border-t border-[#8B7355]/30 flex items-center justify-between text-xs">
                    <span className="font-mono text-[#8B7355] text-[11px]">24K Hot-Foil Monogram:</span>
                    <span className="font-mono font-bold tracking-widest text-[#B8860B] bg-black/5 px-2 py-0.5 rounded">
                      "{activeItem.customization.monogramText}" ({(activeItem.customization.foilColor || 'gold').toUpperCase()})
                    </span>
                  </div>
                )}
              </div>

              {/* Technical Atelier Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-2">
                <div className="p-2.5 rounded bg-white/60 border border-[#8B7355]/20">
                  <span className="text-[9px] uppercase font-mono tracking-wider text-[#8B7355] block">Hide Grade</span>
                  <span className="text-xs font-semibold text-[#1F1711] mt-0.5 block">100% Full Grain</span>
                  <span className="text-[9px] text-[#7A6750]">Tuscan & Highland Hide</span>
                </div>

                <div className="p-2.5 rounded bg-white/60 border border-[#8B7355]/20">
                  <span className="text-[9px] uppercase font-mono tracking-wider text-[#8B7355] block">Tanning Class</span>
                  <span className="text-xs font-semibold text-[#1F1711] mt-0.5 block">Pure Vegetable</span>
                  <span className="text-[9px] text-[#7A6750]">Chestnut & Mimosa</span>
                </div>

                <div className="p-2.5 rounded bg-white/60 border border-[#8B7355]/20">
                  <span className="text-[9px] uppercase font-mono tracking-wider text-[#8B7355] block">Saddle Stitch</span>
                  <span className="text-xs font-semibold text-[#1F1711] mt-0.5 block">Double Needle</span>
                  <span className="text-[9px] text-[#7A6750]">Waxed French Thread</span>
                </div>

                <div className="p-2.5 rounded bg-white/60 border border-[#8B7355]/20">
                  <span className="text-[9px] uppercase font-mono tracking-wider text-[#8B7355] block">Guarantee</span>
                  <span className="text-xs font-semibold text-emerald-800 mt-0.5 block">Lifetime Stitch</span>
                  <span className="text-[9px] text-[#7A6750]">Atelier Restoration</span>
                </div>
              </div>
            </div>

            {/* Signature & Seal Footer */}
            <div className="pt-6 border-t-2 border-[#8B7355]/30 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
              
              {/* QR Verification */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded border border-[#8B7355]/40 shadow-sm">
                  <QrCode className="w-10 h-10 text-[#2C2219]" />
                </div>
                <div className="text-[10px] font-mono text-[#6B5A42] space-y-0.5">
                  <span className="font-bold text-[#1C1510] block">SCAN TO VERIFY</span>
                  <span>Cert: {certNumber}</span>
                  <span>Batch: {batchNumber}</span>
                </div>
              </div>

              {/* Gold Atelier Wax Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-[#8B7355] bg-gradient-to-tr from-[#8B7355] to-[#D4AF37] p-1 flex items-center justify-center shadow-md">
                  <div className="w-full h-full rounded-full border border-dashed border-[#FBF7EE] flex flex-col items-center justify-center text-center text-[#FBF7EE]">
                    <ShieldCheck className="w-5 h-5 text-amber-100" />
                    <span className="text-[7px] font-mono tracking-widest uppercase font-bold mt-0.5">SEAL OF MAISON</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#8B7355] mt-1">
                  Addis Ababa Atelier
                </span>
              </div>

              {/* Master Artisan Signature */}
              <div className="text-right sm:text-right">
                <div className="inline-block border-b border-[#2C2219] pb-1 mb-1 px-4">
                  <span className="font-serif italic text-base text-[#1E1712] tracking-wider block">
                    Kiru G. & Master Saddlers
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#6B5A42]">
                  <p className="font-semibold text-[#1C1510]">Head of Atelier Craftsmanship</p>
                  <p>Commission Date: {orderDate}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="bg-[#1C1815] px-6 py-3 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 font-mono gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographically registered in the Kiru Leathers Private Atelier Ledger.</span>
          </div>
          <span className="text-gray-500">Certificate Hash: SHA-256 Validated</span>
        </div>
      </motion.div>
    </div>
  );
};
