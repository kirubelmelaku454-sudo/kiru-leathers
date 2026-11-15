export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'jackets' | 'bags' | 'footwear' | 'wallets' | 'belts';
  categoryLabel?: string;
  price: number;
  description: string;
  images: string[];
  image?: string;
  colors?: ProductColor[];
  sizes?: string[];
  featured?: boolean;
  rating?: number;
  reviewsCount?: number;
  stock?: number;
  isNew?: boolean;
  reviews?: ProductReview[];
  hidden?: boolean;
  is_hidden?: boolean | number;
}

export interface CartItemCustomization {
  monogramText?: string;
  foilColor?: 'gold' | 'silver' | 'blind';
  leatherFinish?: string;
  customNotes?: string;
}

export interface CartItem {
  product: Product;
  color: ProductColor;
  size: string;
  quantity: number;
  customization?: CartItemCustomization;
}

export interface CraftsmanshipStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  stats: { label: string; value: string }[];
}

export interface LookbookItem {
  id: string;
  title: string;
  location: string;
  image: string;
  videoUrl?: string;
  category?: 'all' | 'jackets' | 'bags' | 'footwear' | 'wallets' | 'belts';
  description?: string;
  hotspot?: {
    x?: string;
    y?: string;
    productName: string;
    productId: string;
    price: string;
  };
  isHidden?: boolean;
  orderIndex?: number;
}
export const LookbookItem = {};

export interface FAQItem {
  q: string;
  a: string;
}

export type PaymentMethod = 'card' | 'chapa' | 'telebirr' | 'cod' | 'mobile_transfer';

export interface TransferPaymentDetails {
  bank: 'CBE' | 'Telebirr' | 'Awash' | 'BOA' | 'Dashen';
  transactionId: string;
  receiptImage?: string;
  accountHolderName?: string;
  transferAmount?: number;
  submittedAt: string;
}

export interface CheckoutDetails {
  fullName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  transferDetails?: TransferPaymentDetails;
}

export interface DeliveryZone {
  id: string;
  region: 'addis_ababa' | 'regional' | 'international';
  name: string;
  amharicName: string;
  rateUsd: number;
  rateEtb: number;
  estimatedDelivery: string;
}

export interface OrderNotification {
  id: string;
  type: 'order_placed' | 'payment_verified' | 'payment_rejected' | 'in_atelier' | 'shipped' | 'delivered';
  title: string;
  message: string;
  timestamp: string;
  channel: 'sms' | 'email' | 'system';
}

export interface Order {
  id: string;
  userId?: string;
  customer: CheckoutDetails;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  totalAmount: number;
  currency: 'USD' | 'ETB';
  paymentMethod: PaymentMethod;
  paymentStatus: 'Pending Verification' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  transferDetails?: TransferPaymentDetails;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  notifications?: OrderNotification[];
  courier?: {
    name: string;
    phone: string;
    vehiclePlate?: string;
    deliveryNote?: string;
  };
  status: 'Pending' | 'Payment Verification' | 'In Atelier' | 'Processing' | 'Shipped' | 'Delivered' | 'Payment Rejected';
  createdAt: string;
  trackingNumber?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: string;
  city?: string;
  loyaltyPoints?: number;
  loyaltyTier?: 'Classic Member' | 'Artisan Circle' | 'Royal Collector';
}

export interface MessageThreadEntry {
  id: string;
  senderRole: 'customer' | 'admin';
  senderName: string;
  text: string;
  createdAt: string;
}

export interface CustomerMessage {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  inquiryType: 'bespoke' | 'order' | 'visit' | 'general';
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
  reply?: string;
  replyDate?: string;
  repliedBy?: string;
  thread?: MessageThreadEntry[];
}

export interface SpecialOfferCampaign {
  id: string;
  title: string;
  titleAm: string;
  subtitle: string;
  subtitleAm: string;
  badgeText: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  promoCode: string;
  targetCategory: 'all' | 'jackets' | 'bags' | 'wallets' | 'footwear' | 'belts' | 'selected';
  targetProductIds?: string[];
  startDate: string;
  endDate: string;
  bannerImageUrl?: string;
  isEnabled: boolean;
  themeColor?: 'gold' | 'crimson' | 'emerald';
}

export type { AboutPageContent, ContactPageContent, SiteContent } from './data/defaultSiteContent';
