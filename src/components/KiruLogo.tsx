import React from 'react';

interface KiruLogoProps {
  variant?: 'full' | 'horizontal' | 'stacked' | 'emblem';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  theme?: 'dark' | 'light';
  className?: string;
  showSubtitle?: boolean;
  subtitleText?: string;
}

export const KiruLogo: React.FC<KiruLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  theme = 'dark',
  className = '',
  showSubtitle = true,
  subtitleText = 'Addis Ababa • Florence'
}) => {
  const isDark = theme === 'dark';

  // Sizing matrix for the emblem badge
  const emblemSizes = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
    hero: 'w-28 h-28 sm:w-32 sm:h-32'
  };

  // Typography scaling
  const textSizes = {
    sm: {
      brand: 'text-sm sm:text-base tracking-[0.22em]',
      sub: 'text-[7.5px] sm:text-[8.5px] tracking-[0.28em]'
    },
    md: {
      brand: 'text-base sm:text-lg lg:text-xl tracking-[0.24em]',
      sub: 'text-[8.5px] sm:text-[9.5px] tracking-[0.3em]'
    },
    lg: {
      brand: 'text-xl sm:text-2xl lg:text-3xl tracking-[0.26em]',
      sub: 'text-[9.5px] sm:text-[10.5px] tracking-[0.32em]'
    },
    xl: {
      brand: 'text-2xl sm:text-3xl lg:text-4xl tracking-[0.28em]',
      sub: 'text-[11px] sm:text-xs tracking-[0.34em]'
    },
    hero: {
      brand: 'text-3xl sm:text-4xl lg:text-5xl tracking-[0.3em]',
      sub: 'text-xs sm:text-sm tracking-[0.36em]'
    }
  };

  /**
   * Authentic Kiru Leathers Stitched Leather Crest:
   * Features the bespoke debossed tan hide emblem with:
   * - Authentic perimeter saddle-stitching
   * - Royal roaring Lion of Judah head
   * - Ethiopian Ge'ez / Tibeb geometric patterned "K"
   * - Arching "KIRU LEATHERS" & Amharic "ኪሩ ሌዘር" script
   */
  const renderEmblem = () => (
    <div className={`relative ${emblemSizes[size]} shrink-0 transition-transform duration-300 group-hover:scale-105 select-none`}>
      <img
        src="/kiru-logo-badge.png"
        alt="Kiru Leathers Atelier Emblem"
        className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
      />
    </div>
  );

  // Pure Emblem variant
  if (variant === 'emblem') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderEmblem()}
      </div>
    );
  }

  // Stacked Centered variant (for Footers, Login Headers, Invoices, Certificates, Order Success)
  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center text-center group cursor-pointer ${className}`}>
        {renderEmblem()}
        <div className="mt-2.5 flex flex-col items-center">
          <span className={`font-serif font-bold uppercase leading-tight tracking-[0.26em] bg-gradient-to-r from-[#FFF5DC] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent ${textSizes[size].brand}`}>
            KIRU LEATHERS
          </span>
          <span className="font-serif text-[11px] sm:text-xs text-amber-200/90 tracking-widest mt-0.5">
            ኪሩ ሌዘር
          </span>
          {showSubtitle && (
            <span className={`font-mono uppercase font-medium mt-1 text-[#D4AF37]/85 ${textSizes[size].sub}`}>
              {subtitleText}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full / Horizontal variant (for Navbar, Topbars, Drawer Headers, Admin)
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group cursor-pointer ${className}`}>
      {renderEmblem()}
      <div className="flex flex-col justify-center text-left">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="font-serif font-black uppercase tracking-[0.22em] bg-gradient-to-r from-[#FFF5DC] via-[#D4AF37] to-[#AA7A1E] bg-clip-text text-transparent text-base sm:text-lg lg:text-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
            KIRU
          </span>
          <span className={`font-serif font-light uppercase tracking-[0.28em] text-[11px] sm:text-xs lg:text-sm ${
            isDark ? 'text-stone-200' : 'text-stone-800 font-normal'
          }`}>
            LEATHERS
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-mono uppercase font-medium text-[8px] sm:text-[9px] tracking-[0.25em] mt-1 flex items-center gap-1.5 ${
            isDark ? 'text-[#D4AF37]/90' : 'text-[#8A631E]'
          }`}>
            <span className="text-[#D4AF37] font-bold">ኪሩ ሌዘር</span>
            <span className="opacity-40">•</span>
            <span>{subtitleText}</span>
          </span>
        )}
      </div>
    </div>
  );
};
