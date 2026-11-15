import { type Product } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'The Sovereign Biker Jacket',
    category: 'jackets',
    categoryLabel: 'Outerwear',
    price: 1250,
    description: 'Masterfully tailored from full-grain Tuscan calfskin with hand-burnished edges, custom bronze hardware, and silk lining.',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Espresso Black', hex: '#111111' },
      { name: 'Cognac Brown', hex: '#5C2C16' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    featured: true,
    rating: 4.9,
    reviewsCount: 128,
    stock: 7,
    isNew: true,
    reviews: [
      {
        id: 'rev-1',
        author: 'Julian Vance',
        rating: 5,
        date: '2 weeks ago',
        comment: 'The leather aroma and supple texture are unmatched. Heavyweight yet molds perfectly to the shoulders.',
        verified: true
      },
      {
        id: 'rev-2',
        author: 'Elena Rossi',
        rating: 5,
        date: '1 month ago',
        comment: 'Truly heirloom craftsmanship. The stitch tension and custom bronze zips make this jacket worth twice the price.',
        verified: true
      }
    ]
  },
  {
    id: 'prod-2',
    name: 'Monarch Executive Duffle',
    category: 'bags',
    categoryLabel: 'Travel & Luggage',
    price: 890,
    description: 'Spacious weekend travel bag crafted from 100% vegetable-tanned Italian leather with brass feet and padded laptop compartment.',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Vintage Chestnut', hex: '#633A20' },
      { name: 'Midnight Onyx', hex: '#1A1A1A' }
    ],
    sizes: ['One Size'],
    featured: true,
    rating: 4.8,
    reviewsCount: 84,
    stock: 12,
    isNew: false,
    reviews: [
      {
        id: 'rev-3',
        author: 'Marcus Sterling',
        rating: 5,
        date: '3 weeks ago',
        comment: 'Carried this on flights across Europe. Fits perfectly in overhead bins and gets constant compliments.',
        verified: true
      }
    ]
  },
  {
    id: 'prod-3',
    name: 'Aurelius Chelsea Boot',
    category: 'footwear',
    categoryLabel: 'Footwear',
    price: 680,
    description: 'Goodyear-welted Chelsea boots featuring hand-buffed calfskin leather, stacked leather heel, and anti-slip rubber outsole.',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Tuscan Amber', hex: '#7C431D' },
      { name: 'Charcoal Black', hex: '#1C1C1E' }
    ],
    sizes: ['40 EU', '41 EU', '42 EU', '43 EU', '44 EU', '45 EU'],
    featured: true,
    rating: 4.9,
    reviewsCount: 67,
    stock: 5,
    isNew: true,
    reviews: [
      {
        id: 'rev-4',
        author: 'Dario Belmonte',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Break-in was effortless. The Goodyear welt ensures I will be resolving and wearing these for ten years.',
        verified: true
      }
    ]
  },
  {
    id: 'prod-4',
    name: 'Florence Bifold Wallet',
    category: 'wallets',
    categoryLabel: 'Small Leather Goods',
    price: 240,
    description: 'Ultra-slim saddle-stitched bifold wallet with 6 card slots, dual cash compartments, and RFID blocking protection.',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Mahogany Tan', hex: '#8B4513' },
      { name: 'Obsidian Black', hex: '#0D0D0D' }
    ],
    sizes: ['One Size'],
    featured: false,
    rating: 4.7,
    reviewsCount: 156,
    stock: 24,
    isNew: false,
    reviews: [
      {
        id: 'rev-5',
        author: 'Nathaniel Cole',
        rating: 5,
        date: '1 month ago',
        comment: 'Slim profile, edges are burnished to glass-smooth perfection. RFID shielding works as advertised.',
        verified: true
      }
    ]
  },
  {
    id: 'prod-5',
    name: 'Medici Heritage Tote',
    category: 'bags',
    categoryLabel: 'Bags & Luggage',
    price: 920,
    description: 'Elegant structured tote bag with magnetic snap closure, key leash, and removable shoulder strap in premium full-grain leather.',
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Rich Caramel', hex: '#A0522D' },
      { name: 'Dark Olive', hex: '#3B3C36' }
    ],
    sizes: ['One Size'],
    featured: true,
    rating: 5.0,
    reviewsCount: 39,
    stock: 4,
    isNew: true,
    reviews: [
      {
        id: 'rev-6',
        author: 'Sophia Chen',
        rating: 5,
        date: '5 days ago',
        comment: 'Exquisite patina already developing. Holds my 16-inch laptop with room to spare while looking effortlessly chic.',
        verified: true
      }
    ]
  },
  {
    id: 'prod-6',
    name: 'Tuscan Belt & Cardholder Set',
    category: 'wallets',
    categoryLabel: 'Gift Sets',
    price: 310,
    description: 'Matching luxury gift set featuring a hand-stitched 35mm dress belt and a slim 4-slot minimalist card sleeve.',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Cognac', hex: '#8B4513' },
      { name: 'Matte Black', hex: '#111111' }
    ],
    sizes: ['85cm', '90cm', '95cm', '100cm', '105cm'],
    featured: false,
    rating: 4.8,
    reviewsCount: 52,
    stock: 18,
    isNew: false,
    reviews: [
      {
        id: 'rev-7',
        author: 'Liam Bennett',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Bought this as a gift for myself. The brass buckle is solid and substantial. Comes in a gorgeous presentation box.',
        verified: true
      }
    ]
  },
  {
    id: 'belt-01',
    name: 'The Sovereign Artisan Bridle Belt',
    price: 165,
    category: 'belts',
    categoryLabel: 'Belts & Straps',
    rating: 5.0,
    reviewsCount: 38,
    description: 'Full-grain vegetable-tanned bridle leather with hand-burnished beveled edges, solid brushed brass buckle, and beeswax edge finish.',
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80'
    ],
    featured: true,
    stock: 15,
    colors: [
      { name: 'Cognac Brown', hex: '#8B4513' },
      { name: 'Obsidian Black', hex: '#1A1A1A' }
    ],
    sizes: ['32', '34', '36', '38', '40', '42'],
    isNew: true
  },
  {
    id: 'belt-02',
    name: 'The Addis Heritage Dress Belt',
    price: 145,
    category: 'belts',
    categoryLabel: 'Belts & Straps',
    rating: 4.9,
    reviewsCount: 29,
    description: 'Refined 32mm calfskin dress belt with hand-sewn saddle stitching, solid antique nickel hardware, and feather-stitched edge lining.',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80'
    ],
    featured: false,
    stock: 18,
    colors: [
      { name: 'Espresso Dark Brown', hex: '#3D2314' },
      { name: 'Classic Tan', hex: '#D27D2D' }
    ],
    sizes: ['32', '34', '36', '38', '40', '42'],
    isNew: false
  },
  {
    id: 'belt-03',
    name: 'The Entoto Reversible Luxury Belt',
    price: 195,
    category: 'belts',
    categoryLabel: 'Belts & Straps',
    rating: 5.0,
    reviewsCount: 42,
    description: 'Double-faced reversible bridle leather featuring rich Cognac on one side and Obsidian Black on the reverse, with swivel titanium buckle.',
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80'
    ],
    featured: true,
    stock: 12,
    colors: [
      { name: 'Cognac / Black Reversible', hex: '#795548' }
    ],
    sizes: ['32', '34', '36', '38', '40', '42'],
    isNew: true
  }
];
