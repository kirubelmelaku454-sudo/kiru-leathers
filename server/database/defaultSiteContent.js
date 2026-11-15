const DEFAULT_ABOUT_CONTENT = {
  sectionBadge: 'Heritage & Atelier Legacy',
  headingPrefix: 'Born from Passion.',
  typewriterText: 'Refined by Master Craftsmen.',
  mainDescription:
    'Kiru Leathers represents the convergence of age-old Tuscan vegetable tanning traditions and the extraordinary artisanal heritage of Ethiopia. We bridge Continental elegance with generational endurance.',
  storyImage:
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
  storyImageProvenance: 'Florence & Addis Ababa',
  storyImageTitle: 'Authentic Full-Grain Provenance',
  guaranteeBadgeYears: '100',
  guaranteeBadgeTitle: 'YEAR GUARANTEE',
  guaranteeBadgeSubtitle: 'Every stitch built to outlive seasons',
  storyHeadline: 'Preserving the dying art of genuine hand saddle-stitching.',
  storyParagraph1:
    'Kiru Leathers was founded with a singular conviction: in an era of mass-manufactured, disposable fashion, true luxury lies in objects that develop character with every decade of use.',
  storyParagraph2:
    'Every hide used in our workshop is hand-selected from top-tier certified tanneries in Tuscany and premium Highland hides in Ethiopia. We reject faux-bonded polymers, artificial grain embossing, and plastic coatings. Our leather breathes, patinas gracefully, and carries a story only you can write.',
  storyFeature1Title: '100% Full-Grain',
  storyFeature1Subtitle: 'Never split, buffed, or corrected',
  storyFeature2Title: 'Natural Patina',
  storyFeature2Subtitle: 'Deepens in tone & luster each year',
  philosophyPillar1Title: 'Slow Bespoke Production',
  philosophyPillar1Description:
    'We craft in limited numbered batches. Our leather rests in vegetable tannins for over 60 days to stabilize fibers before master cutters begin drafting the patterns.',
  philosophyPillar2Title: 'Saddle Stitch Integrity',
  philosophyPillar2Description:
    'Every structural seam is sewn with twin needles and waxed linen thread. Unlike sewing machine lock-stitches, a severed thread will never unravel the adjacent line.',
  philosophyPillar3Title: 'Fair Artisan Stewardship',
  philosophyPillar3Description:
    'We pay 3.5x living wage premiums to our artisan saddlers and cutters. Every artisan is honored as an artist whose initials are discreetly hallmarked on major pieces.',
  atelier1Title: 'San Miniato, Tuscany',
  atelier1Subtitle: 'Italian Tannery & Design',
  atelier1Description:
    'Our vegetable tanning consortium sits along the Arno river basin. Here, chestnut and mimosa barks are slowly infused into raw hides over two months to impart our signature aroma and resilience.',
  atelier1Badge1: 'EST. 1994',
  atelier1Badge2: 'CHESTNUT BARK TANNED',
  atelier2Title: 'Bole Sub-City, Addis Ababa',
  atelier2Subtitle: 'Master Workshop & Studio',
  atelier2Description:
    'Our bespoke tailoring, edge burnishing, and brass casting atelier operates with second-generation Ethiopian leather masters, providing custom fit modifications and private client commissions.',
  atelier2Badge1: 'OPEN FOR VISITS',
  atelier2Badge2: 'BESPOKE SIZING LAB',
  assurance1Title: 'Bespoke Fit Warranty',
  assurance1Description:
    'Complimentary tailoring adjustments within 30 days of delivery.',
  assurance2Title: 'Generational Life Guarantee',
  assurance2Description:
    'All brass zippers, copper rivets, and stitching covered for lifetime repair.',
  assurance3Title: 'Verified Payment Rails',
  assurance3Description:
    'Direct verification for CBE Birr, Telebirr, Awash, BOA, and Visa/Mastercard.',
  assurance4Title: 'Concierge Delivery',
  assurance4Description:
    'Hand-delivered white-glove packaging with organic beeswax conditioner balm.'
};

const DEFAULT_CONTACT_CONTENT = {
  sectionBadge: 'Private Atelier Inquiries',
  headingPrefix: 'Connect With Our',
  typewriterText: 'Client Concierge.',
  mainDescription:
    'Whether you desire a custom bespoke jacket fitting, corporate gift commission, or private appointment at our Addis Ababa studio, our artisan concierge is at your service.',
  flagshipTitle: 'The Flagship Atelier',
  showroomTitle: 'Studio & Showroom',
  showroomAddress: 'Bole Sub-City, Road 3, House 45',
  showroomCity: 'Next to Ambassador Theatre, Addis Ababa, Ethiopia',
  phoneTitle: 'Direct Phone & WhatsApp',
  phoneNumber: '+251 91 123 4567 / +251 92 000 8899',
  phoneHours: 'Monday - Saturday, 9:00 AM - 7:00 PM EAT',
  emailTitle: 'Bespoke Concierge Email',
  emailAddress: 'concierge@kiruleathers.com',
  emailSubtext: 'General orders: orders@kiruleathers.com',
  appointmentTitle: 'Private Fitting Appointments',
  appointmentSubtitle: 'Available by advance reservation',
  appointmentBadge: 'Complimentary',
  corporateTitle: 'Corporate Gifting & International Export',
  corporateDescription:
    'We provide custom logo debossing and personalized monogramming for luxury corporate gifts, diplomatic missions, and international boutique partners. Contact our commercial desk directly.'
};

const DEFAULT_LOOKBOOK_ITEMS = [
  {
    id: 'lb-1',
    title: 'The Executive Weekender',
    location: 'Milan • Florence',
    category: 'bags',
    description: 'Timeless luxury overnight duffle in full-grain Tuscan hide with antique brass fittings.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://v1.pinimg.com/videos/iht/720p/6c/9a/e3/6c9ae38137b6a5aaa1641372bd34ff38.mp4',
    hotspot: {
      productName: 'Monarch Executive Duffle',
      productId: 'prod-2',
      price: '$890'
    },
    isHidden: false
  },
  {
    id: 'lb-2',
    title: 'Florentine Artisan Bifold',
    location: 'Florence, Italy',
    category: 'wallets',
    description: 'Hand-burnished vegetable-tanned bifold with beeswax edge sealing and RFID protection.',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://v1.pinimg.com/videos/iht/expMp4/ef/dd/8d/efdd8d5bc7c93063c6965a1575e754bd_720w.mp4',
    hotspot: {
      productName: 'Florence Bifold Wallet',
      productId: 'prod-4',
      price: '$240'
    },
    isHidden: false
  },
  {
    id: 'lb-3',
    title: 'Handmade Saddlecraft Tote',
    location: 'Addis Ababa Atelier',
    category: 'bags',
    description: 'Master saddlery hand-stitched tote bag from heavy-weight full-grain bridle leather.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://v1.pinimg.com/videos/iht/expMp4/0d/26/69/0d26698d2e908d8708d11b56fdfb64ae_720w.mp4',
    hotspot: {
      productName: 'Medici Heritage Tote',
      productId: 'prod-5',
      price: '$920'
    },
    isHidden: false
  },
  {
    id: 'lb-4',
    title: 'The Sovereign Biker',
    location: 'Bole Studio • Addis Ababa',
    category: 'jackets',
    description: 'Classic asymmetrical double-rider jacket in uncorrected black aniline leather.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://v1.pinimg.com/videos/iht/hevcMp4V3/44/c5/2f/44c52f82753f803b3445751b93f409a8_240w.mp4',
    hotspot: {
      productName: 'The Sovereign Biker Jacket',
      productId: 'prod-1',
      price: '$1,250'
    },
    isHidden: false
  },
  {
    id: 'lb-5',
    title: 'Haute Couture Leather Tailoring',
    location: 'Rome, Italy',
    category: 'jackets',
    description: 'Precision Italian tailored leather blazer with hand-rolled silk lining.',
    image: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://v1.pinimg.com/videos/iht/expMp4/4b/9b/50/4b9b50d1e498cd1c4960d0f6f97e1e88_720w.mp4',
    hotspot: {
      productName: 'The Sovereign Biker Jacket (Bespoke Cut)',
      productId: 'prod-1',
      price: '$1,250'
    },
    isHidden: false
  },
  {
    id: 'lb-6',
    title: 'Cafe Racer Heritage Stitch',
    location: 'Florence Workshop',
    category: 'jackets',
    description: 'Clean collar cafe racer built from thick vegetable-tanned hide designed to age with rich patina.',
    image: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://v1.pinimg.com/videos/iht/720p/4b/52/65/4b5265cd99aa240c4ef6816f1dbb4414.mp4',
    hotspot: {
      productName: 'The Sovereign Biker Jacket',
      productId: 'prod-1',
      price: '$1,250'
    },
    isHidden: false
  },
  {
    id: 'lb-7',
    title: 'Full-Grain Minimalist Folio',
    location: 'Tuscan Tannery',
    category: 'wallets',
    description: 'Ultra-slim card and cash companion with beveled painted edges.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://v1.pinimg.com/videos/mc/expMp4/3b/28/ae/3b28ae2dbdb2b0082f3fdb363437b57e_t1.mp4',
    hotspot: {
      productName: 'Tuscan Belt & Cardholder Set',
      productId: 'prod-6',
      price: '$310'
    },
    isHidden: false
  },
  {
    id: 'lb-8',
    title: 'Master Artisan Hand-Stitch',
    location: 'Florence • Addis Ababa',
    category: 'wallets',
    description: 'From a single piece of Italian leather into an heirloom wallet. Every stitch hand-pulled.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://v1.pinimg.com/videos/iht/expMp4/99/ae/09/99ae09b013c87cdfa125b8bcb7cf8f21_720w.mp4',
    hotspot: {
      productName: 'Florence Bifold Wallet',
      productId: 'prod-4',
      price: '$240'
    },
    isHidden: false
  },
  {
    id: 'lb-9',
    title: 'Goodyear Welted Brogue',
    location: 'Florence, Italy',
    category: 'footwear',
    description: 'Hand-cut calfskin dress oxford with resoleable Goodyear welt and channel stitching.',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://v1.pinimg.com/videos/iht/720p/fe/d5/a0/fed5a05f9f92e8633f8308382482a995.mp4',
    hotspot: {
      productName: 'Aurelius Chelsea Boot',
      productId: 'prod-3',
      price: '$680'
    },
    isHidden: false
  },
  {
    id: 'lb-10',
    title: 'Aurelius Chelsea Boot',
    location: 'Addis Ababa Atelier',
    category: 'footwear',
    description: 'Handcrafted equestrian Chelsea boots in burnished cognac with elastic gussets.',
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://v1.pinimg.com/videos/iht/hevcMp4V3/v2/74/c3/70/74c370a43953cb4e3363a02b5065108e_240w.mp4',
    hotspot: {
      productName: 'Aurelius Chelsea Boot',
      productId: 'prod-3',
      price: '$680'
    },
    isHidden: false
  },
  {
    id: 'lb-11',
    title: 'Solid Brass Bridle Belt',
    location: 'Addis Ababa • Florence',
    category: 'belts',
    description: 'Full-grain English bridle leather belt with solid cast brass buckle and hand-burnished edges.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://v1.pinimg.com/videos/iht/hevcMp4V3/ec/1c/f3/ec1cf3da3e51b2a0d745a9a180b62baa_720w.mp4',
    hotspot: {
      productName: 'The Sovereign Artisan Bridle Belt',
      productId: 'belt-01',
      price: '$165'
    },
    isHidden: false
  }
];

const DEFAULT_SITE_CONTENT = {
  about: DEFAULT_ABOUT_CONTENT,
  contact: DEFAULT_CONTACT_CONTENT,
  lookbook: DEFAULT_LOOKBOOK_ITEMS
};

module.exports = {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_LOOKBOOK_ITEMS,
  DEFAULT_SITE_CONTENT
};
