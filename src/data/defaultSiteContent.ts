export interface AboutPageContent {
  sectionBadge: string;
  headingPrefix: string;
  typewriterText: string;
  mainDescription: string;
  // Story Tab
  storyImage: string;
  storyImageProvenance: string;
  storyImageTitle: string;
  guaranteeBadgeYears: string;
  guaranteeBadgeTitle: string;
  guaranteeBadgeSubtitle: string;
  storyHeadline: string;
  storyParagraph1: string;
  storyParagraph2: string;
  storyFeature1Title: string;
  storyFeature1Subtitle: string;
  storyFeature2Title: string;
  storyFeature2Subtitle: string;
  // Philosophy Tab
  philosophyPillar1Title: string;
  philosophyPillar1Description: string;
  philosophyPillar2Title: string;
  philosophyPillar2Description: string;
  philosophyPillar3Title: string;
  philosophyPillar3Description: string;
  // Atelier Tab
  atelier1Title: string;
  atelier1Subtitle: string;
  atelier1Description: string;
  atelier1Badge1: string;
  atelier1Badge2: string;
  atelier2Title: string;
  atelier2Subtitle: string;
  atelier2Description: string;
  atelier2Badge1: string;
  atelier2Badge2: string;
  // Global Assurances
  assurance1Title: string;
  assurance1Description: string;
  assurance2Title: string;
  assurance2Description: string;
  assurance3Title: string;
  assurance3Description: string;
  assurance4Title: string;
  assurance4Description: string;
}

export interface ContactPageContent {
  sectionBadge: string;
  headingPrefix: string;
  typewriterText: string;
  mainDescription: string;
  flagshipTitle: string;
  showroomTitle: string;
  showroomAddress: string;
  showroomCity: string;
  phoneTitle: string;
  phoneNumber: string;
  phoneHours: string;
  emailTitle: string;
  emailAddress: string;
  emailSubtext: string;
  appointmentTitle: string;
  appointmentSubtitle: string;
  appointmentBadge: string;
  corporateTitle: string;
  corporateDescription: string;
}

export interface SiteContent {
  about: AboutPageContent;
  contact: ContactPageContent;
}

export const DEFAULT_ABOUT_CONTENT: AboutPageContent = {
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

export const DEFAULT_CONTACT_CONTENT: ContactPageContent = {
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

export const DEFAULT_SITE_CONTENT: SiteContent = {
  about: DEFAULT_ABOUT_CONTENT,
  contact: DEFAULT_CONTACT_CONTENT
};
