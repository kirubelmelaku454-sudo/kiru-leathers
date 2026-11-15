import { type DeliveryZone } from '../types';

export const DELIVERY_ZONES: DeliveryZone[] = [
  // Addis Ababa Sub-Cities & Neighborhoods
  {
    id: 'aa-pickup',
    region: 'addis_ababa',
    name: 'Atelier Showroom Pickup (Bole Road 3)',
    amharicName: 'ከአቴሊየር ሾውሩም መውሰድ (ቦሌ)',
    rateUsd: 0,
    rateEtb: 0,
    estimatedDelivery: 'Ready within 2 hours • Complimentary'
  },
  {
    id: 'aa-bole',
    region: 'addis_ababa',
    name: 'Bole, Atlas, Rwanda, Medhanialem',
    amharicName: 'ቦሌ፣ አትላስ፣ ሩዋንዳ፣ መድኃኔዓለም',
    rateUsd: 2,
    rateEtb: 250,
    estimatedDelivery: 'Same-Day Hand Delivery (2 - 4 Hours)'
  },
  {
    id: 'aa-central',
    region: 'addis_ababa',
    name: 'Kirkos, Kazanchis, Meskel Square, Mexico',
    amharicName: 'ቂርቆስ፣ ካዛንቺስ፣ መስቀል አደባባይ፣ ሜክሲኮ',
    rateUsd: 2.5,
    rateEtb: 300,
    estimatedDelivery: 'Same-Day Hand Delivery (3 - 5 Hours)'
  },
  {
    id: 'aa-north',
    region: 'addis_ababa',
    name: 'Yeka, Megenagna, Piassa, Arada, 4 Kilo',
    amharicName: 'የካ፣ መገናኛ፣ ፒያሳ፣ አራዳ፣ 4 ኪሎ',
    rateUsd: 2.8,
    rateEtb: 350,
    estimatedDelivery: 'Same-Day Hand Delivery'
  },
  {
    id: 'aa-east',
    region: 'addis_ababa',
    name: 'CMC, Ayat, Summit, Gurd Shola, Meri',
    amharicName: 'ሲኤምሲ፣ አያት፣ ሰሚት፣ ጉርድ ሾላ',
    rateUsd: 3.2,
    rateEtb: 400,
    estimatedDelivery: 'Same-Day / Next-Day Delivery'
  },
  {
    id: 'aa-south',
    region: 'addis_ababa',
    name: 'Bole Bulbula, Saris, Nifas Silk, Lebu, Jomo',
    amharicName: 'ቦሌ ቡልቡላ፣ ሳሪስ፣ ንፋስ ስልክ፣ ለቡ፣ ጆሞ',
    rateUsd: 3.5,
    rateEtb: 450,
    estimatedDelivery: 'Same-Day / Next-Day Delivery'
  },

  // Regional Cities (Express Courier / EMS / Ethiopian Post)
  {
    id: 'reg-adama',
    region: 'regional',
    name: 'Adama / Nazret & Bishoftu / Debre Zeyit',
    amharicName: 'አዳማ / ናዝሬት እና ቢሾፍቱ / ደብረ ዘይት',
    rateUsd: 6.5,
    rateEtb: 800,
    estimatedDelivery: 'Next-Day Express Courier (24 Hours)'
  },
  {
    id: 'reg-hawassa',
    region: 'regional',
    name: 'Hawassa & Shashemene',
    amharicName: 'ሀዋሳ እና ሻሸመኔ',
    rateUsd: 7.5,
    rateEtb: 950,
    estimatedDelivery: '1 - 2 Business Days (Express Cargo)'
  },
  {
    id: 'reg-bahirdar',
    region: 'regional',
    name: 'Bahir Dar & Gondar',
    amharicName: 'ባህር ዳር እና ጎንደር',
    rateUsd: 9,
    rateEtb: 1100,
    estimatedDelivery: '2 Business Days (Air Express / EMS)'
  },
  {
    id: 'reg-diredawa',
    region: 'regional',
    name: 'Dire Dawa & Harar',
    amharicName: 'ድሬዳዋ እና ሐረር',
    rateUsd: 9.5,
    rateEtb: 1200,
    estimatedDelivery: '2 Business Days (Air Express / EMS)'
  },
  {
    id: 'reg-mekelle',
    region: 'regional',
    name: 'Mekelle & Jimma',
    amharicName: 'መቀሌ እና ጅማ',
    rateUsd: 11,
    rateEtb: 1400,
    estimatedDelivery: '2 - 3 Business Days'
  },

  // International Express
  {
    id: 'intl-express',
    region: 'international',
    name: 'International Courier (DHL / Ethiopian Cargo Worldwide)',
    amharicName: 'አለም አቀፍ ፈጣን መላኪያ (DHL / Ethiopian Cargo)',
    rateUsd: 35,
    rateEtb: 4375,
    estimatedDelivery: '3 - 5 Business Days Worldwide with Tracking'
  }
];

