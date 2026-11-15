import { type SpecialOfferCampaign } from '../types';

// Compute active campaign dates (live now, ending in 48 hours by default)
const now = new Date();
const startDate = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
const endDate = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

export const DEFAULT_SPECIAL_OFFER: SpecialOfferCampaign = {
  id: 'promo-flash-atelier',
  title: 'Atelier Heritage Flash Privilege',
  titleAm: 'የአቴሊየር ቅርስ ልዩ የቅናሽ ጊዜ',
  subtitle: 'Enjoy 25% exclusive reduction on 5 handpicked masterworks — exactly one flagship piece selected from each artisanal leather category.',
  subtitleAm: 'ከእያንዳንዱ ምድብ በተመረጠ 1 መሪ የእጅ ስራ ላይ ብቻ (በጃኬት፣ ቦርሳ፣ ጫማ፣ የኪስ ቦርሳ እና ቀበቶ) የተዘጋጀ የ 25% ልዩ ቅናሽ።',
  badgeText: 'LIMITED ATELIER OFFER • 25% OFF',
  discountType: 'percentage',
  discountValue: 25,
  promoCode: 'FLASH25',
  targetCategory: 'selected',
  targetProductIds: ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'belt-01'],
  startDate,
  endDate,
  bannerImageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1600&q=80',
  isEnabled: true,
  themeColor: 'gold'
};
