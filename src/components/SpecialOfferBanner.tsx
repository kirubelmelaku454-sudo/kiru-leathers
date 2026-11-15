import React, { useState, useEffect } from 'react';
import { Sparkles, Timer, ArrowRight, X } from 'lucide-react';
import { type SpecialOfferCampaign } from '../types';
import type { Language } from '../i18n/translations';

interface SpecialOfferBannerProps {
  campaign: SpecialOfferCampaign;
  lang: Language;
  onExplore: () => void;
  onExpire: () => void;
}

export const SpecialOfferBanner: React.FC<SpecialOfferBannerProps> = ({
  campaign,
  lang,
  onExplore,
  onExpire
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    days: number;
    isLive: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, days: 0, isLive: false });

  useEffect(() => {
    const checkLive = () => {
      const now = new Date().getTime();
      const start = new Date(campaign.startDate).getTime();
      const end = new Date(campaign.endDate).getTime();

      if (!campaign.isEnabled || now < start || now >= end) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, days: 0, isLive: false });
        if (now >= end) onExpire();
      } else {
        const diff = end - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isLive: true });
      }
    };

    checkLive();
    const interval = setInterval(checkLive, 1000);
    return () => clearInterval(interval);
  }, [campaign, onExpire]);

  if (!timeLeft.isLive || isDismissed) {
    return null;
  }

  const isAm = lang === 'am';

  return (
    <aside aria-label="Special Offer Announcement" className="relative z-40 bg-gradient-to-r from-[#2A180E] via-[#3D2314] to-[#1C1815] text-[#FBF7EE] border-b border-[#D4AF37]/40 px-4 py-2 sm:py-2.5 text-xs shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left / Center Message */}
        <div
          onClick={onExplore}
          className="flex-1 flex items-center justify-center gap-2 sm:gap-3 flex-wrap cursor-pointer group"
        >
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-600/90 text-white font-mono text-[10px] font-bold tracking-wider uppercase shadow">
            <Sparkles className="w-3 h-3 animate-spin" />
            <span>{campaign.discountValue}% OFF</span>
          </div>

          <span className="font-serif font-medium text-amber-100 group-hover:text-white transition-colors">
            {isAm ? campaign.titleAm : campaign.title}:
          </span>

          {/* Countdown timer pills */}
          <div className="inline-flex items-center gap-1 font-mono text-[11px] text-[#D4AF37] font-bold bg-black/40 px-2.5 py-0.5 rounded-lg border border-[#D4AF37]/30">
            <Timer className="w-3.5 h-3.5" />
            <span>
              {timeLeft.days > 0 ? `${timeLeft.days}d : ` : ''}
              {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>

          <span className="hidden md:inline font-mono text-[11px] text-stone-300">
            {isAm ? `የቅናሽ ኮድ፦ ${campaign.promoCode}` : `Use code: ${campaign.promoCode}`}
          </span>

          <span className="inline-flex items-center gap-1 text-[#D4AF37] font-mono text-[11px] font-bold uppercase tracking-wider group-hover:underline">
            <span>{isAm ? 'ቅናሾቹን ይመልከቱ' : 'Claim Privilege'}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </aside>
  );
};
