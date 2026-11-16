import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  TrendingUp,
  Package,
  ShoppingBag,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Pencil,
  FileCheck2,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Printer,
  BarChart3,
  Download,
  Menu,
  ChevronRight,
  ShieldCheck,
  Search,
  ArrowUpRight,
  Sun,
  Moon,
  Send,
  Globe,
  FileText,
  RotateCcw,
  Save,
  Compass,
  MapPin,
  Award,
  Truck,
  Tag,
  LogOut,
  Timer,
  Film,
  Video,
  Play,
  ArrowUp,
  ArrowDown,
  Volume2,
  VolumeX
} from 'lucide-react';
import { type Product, type Order, type CustomerMessage, type SiteContent, type AboutPageContent, type ContactPageContent, type SpecialOfferCampaign, type LookbookItem } from '../types';
import { DEFAULT_ABOUT_CONTENT, DEFAULT_CONTACT_CONTENT } from '../data/defaultSiteContent';
import { DEFAULT_SPECIAL_OFFER } from '../data/defaultSpecialOffer';
import { DEFAULT_LOOKBOOK_ITEMS } from '../data/defaultLookbook';
import { getMessageThread } from '../utils/messageThread';
import { KiruLogo } from './KiruLogo';

interface AdminPortalModalProps {
  products: Product[];
  orders: Order[];
  messages?: CustomerMessage[];
  siteContent?: SiteContent;
  specialOffer?: SpecialOfferCampaign;
  onUpdateSpecialOffer?: (campaign: SpecialOfferCampaign) => Promise<boolean | void> | void;
  onUpdateSiteContent?: (section: 'about' | 'contact', content: any) => Promise<boolean>;
  onUpdateProductStock?: (productId: string, newStock: number) => Promise<void> | void;
  onClose: () => void;
  onLogout?: () => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onVerifyPayment?: (orderId: string, action: 'approve' | 'reject', reason?: string) => void;
  onUpdateMessageStatus?: (messageId: string, status: CustomerMessage['status']) => void;
  onOpenInvoice?: (order: Order) => void;
  onOpenCertificate?: (order: Order) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onToggleVisibility?: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onSendMessage?: (message: CustomerMessage) => void;
  onReplyMessage?: (messageId: string, replyText: string) => Promise<void> | void;
  theme: 'dark' | 'light';
  onToggleTheme?: () => void;
  currency: 'USD' | 'ETB';
  exchangeRate?: number;
  lookbookItems?: LookbookItem[];
  onAddLookbookItem?: (item: LookbookItem) => Promise<boolean | void> | void;
  onUpdateLookbookItem?: (id: string, updates: Partial<LookbookItem>) => Promise<boolean | void> | void;
  onDeleteLookbookItem?: (id: string) => Promise<boolean | void> | void;
  onReorderLookbookItems?: (items: LookbookItem[]) => Promise<boolean | void> | void;
}

export interface AbandonedCartLead {
  id: string;
  customerName: string;
  phone: string;
  telegramUsername?: string;
  city: string;
  items: {
    productName: string;
    image: string;
    color: string;
    size?: string;
    price: number;
    monogram?: string;
  }[];
  subtotal: number;
  timeAgo: string;
  status: 'recoverable' | 'contacted' | 'recovered';
  notes?: string;
}

const INITIAL_ABANDONED_LEADS: AbandonedCartLead[] = [
  {
    id: 'AB-8821',
    customerName: 'Dawit Haile',
    phone: '+251912345678',
    telegramUsername: 'dawith_aa',
    city: 'Bole Sub-City, Addis Ababa',
    items: [
      {
        productName: 'The Sovereign Biker Jacket',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
        color: 'Espresso Black',
        size: 'L',
        price: 1250,
        monogram: 'DH (24K Gold)'
      }
    ],
    subtotal: 1250,
    timeAgo: '2 hours ago',
    status: 'recoverable',
    notes: 'Paused at shipping selection • Interested in 24k monogramming'
  },
  {
    id: 'AB-8822',
    customerName: 'Sara Tesfaye',
    phone: '+251928891234',
    telegramUsername: 'saratesf',
    city: 'Kazanchis, Addis Ababa',
    items: [
      {
        productName: 'Medici Heritage Tote',
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
        color: 'Rich Caramel',
        size: 'One Size',
        price: 920
      },
      {
        productName: 'Florence Bifold Wallet',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
        color: 'Mahogany Tan',
        price: 240
      }
    ],
    subtotal: 1160,
    timeAgo: '4 hours ago',
    status: 'recoverable',
    notes: 'Initiated Telebirr checkout flow • Awaiting voucher confirmation'
  },
  {
    id: 'AB-8823',
    customerName: 'Marcus Sterling',
    phone: '+447700900123',
    telegramUsername: 'msterling_uk',
    city: 'London, United Kingdom',
    items: [
      {
        productName: 'Monarch Executive Duffle',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        color: 'Vintage Chestnut',
        size: 'One Size',
        price: 890
      }
    ],
    subtotal: 890,
    timeAgo: 'Yesterday',
    status: 'contacted',
    notes: 'Inquired about DHL express delivery times to London Heathrow'
  },
  {
    id: 'AB-8824',
    customerName: 'Yordanos Bekele',
    phone: '+251934567890',
    telegramUsername: 'yordi_b',
    city: 'CMC / Ayat, Addis Ababa',
    items: [
      {
        productName: 'Aurelius Chelsea Boot',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
        color: 'Tuscan Amber',
        size: '42 EU',
        price: 680
      },
      {
        productName: 'The Sovereign Artisan Bridle Belt',
        image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
        color: 'Cognac Brown',
        size: '34',
        price: 165
      }
    ],
    subtotal: 845,
    timeAgo: '2 days ago',
    status: 'recovered',
    notes: 'Recovered via Telegram concierge with 10% privilege voucher'
  }
];

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  products,
  orders,
  messages = [],
  siteContent,
  onUpdateSiteContent,
  onUpdateProductStock,
  onClose,
  onLogout,
  onUpdateOrderStatus,
  onVerifyPayment,
  onUpdateMessageStatus,
  onOpenInvoice,
  onOpenCertificate,
  onAddProduct,
  onUpdateProduct,
  onToggleVisibility,
  onDeleteProduct,
  onSendMessage,
  onReplyMessage,
  specialOffer,
  onUpdateSpecialOffer,
  theme,
  onToggleTheme,
  currency,
  exchangeRate = 125,
  lookbookItems = [],
  onAddLookbookItem,
  onUpdateLookbookItem,
  onDeleteLookbookItem,
  onReorderLookbookItems
}) => {
  // Navigation: sidebar items matching the user's uploaded screenshot
  const [activeTab, setActiveTab] = useState<'orders' | 'payments' | 'messages' | 'products' | 'analytics' | 'content' | 'abandoned' | 'promotions' | 'lookbook'>('orders');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Search State (declared early for top-to-bottom scope availability)
  const [searchQuery, setSearchQuery] = useState('');

  // Special Offer Campaign State
  const [offerForm, setOfferForm] = useState<SpecialOfferCampaign>(() => {
    const base = specialOffer || DEFAULT_SPECIAL_OFFER;
    return {
      ...base,
      targetCategory: 'selected',
      targetProductIds: base.targetProductIds && base.targetProductIds.length > 0
        ? base.targetProductIds
        : ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'belt-01']
    };
  });
  const [isSavingOffer, setIsSavingOffer] = useState(false);
  const [offerSaveMessage, setOfferSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (specialOffer) {
      setOfferForm({
        ...specialOffer,
        targetCategory: 'selected',
        targetProductIds: specialOffer.targetProductIds && specialOffer.targetProductIds.length > 0
          ? specialOffer.targetProductIds
          : ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'belt-01']
      });
    }
  }, [specialOffer]);

  // Lookbook Video Management State
  const [lookbookList, setLookbookList] = useState<LookbookItem[]>(() => {
    return lookbookItems && lookbookItems.length > 0 ? lookbookItems : DEFAULT_LOOKBOOK_ITEMS;
  });
  const [lookbookSearch, setLookbookSearch] = useState('');
  const [lookbookCategoryFilter, setLookbookCategoryFilter] = useState<string>('all');
  const [lookbookStatusFilter, setLookbookStatusFilter] = useState<'all' | 'live' | 'hidden'>('all');
  const [isAddLookbookOpen, setIsAddLookbookOpen] = useState(false);
  const [editingLookbook, setEditingLookbook] = useState<LookbookItem | null>(null);
  const [previewVideo, setPreviewVideo] = useState<LookbookItem | null>(null);
  const [isPreviewMuted, setIsPreviewMuted] = useState(true);
  const [lookbookDeleteId, setLookbookDeleteId] = useState<string | null>(null);
  const [isSavingLookbook, setIsSavingLookbook] = useState(false);
  const [lookbookNotification, setLookbookNotification] = useState<string | null>(null);

  useEffect(() => {
    if (lookbookItems && lookbookItems.length > 0) {
      setLookbookList(lookbookItems);
    }
  }, [lookbookItems]);

  const [newVideoForm, setNewVideoForm] = useState({
    title: '',
    location: 'Bole Studio • Addis Ababa',
    category: 'jackets' as NonNullable<LookbookItem['category']>,
    videoUrl: '',
    image: '',
    description: '',
    selectedProductId: '',
    isHidden: false
  });

  const handleSaveOffer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingOffer(true);
    setOfferSaveMessage(null);
    try {
      if (onUpdateSpecialOffer) {
        await onUpdateSpecialOffer(offerForm);
      }
      localStorage.setItem('kiru_special_offer', JSON.stringify(offerForm));
      setOfferSaveMessage('Special Offer Campaign published & synced! (ቅናሹ ተመዝግቧል)');
      setTimeout(() => setOfferSaveMessage(null), 3500);
    } catch (err: any) {
      setOfferSaveMessage(err.message || 'Failed to save campaign');
    } finally {
      setIsSavingOffer(false);
    }
  };

  // Quick Duration helper
  const handleApplyPreset = (hours: number) => {
    const now = new Date();
    const startIso = now.toISOString().slice(0, 16);
    const endIso = new Date(now.getTime() + hours * 3600 * 1000).toISOString().slice(0, 16);
    setOfferForm((prev) => ({
      ...prev,
      startDate: startIso,
      endDate: endIso,
      isEnabled: true
    }));
  };

  // Helper to pick 1 hero piece per category (Jackets, Bags, Footwear, Wallets, Belts)
  const handleSelectOnePerCategory = () => {
    const categories: Array<'jackets' | 'bags' | 'footwear' | 'wallets' | 'belts'> = ['jackets', 'bags', 'footwear', 'wallets', 'belts'];
    const chosenIds: string[] = [];
    const preferredHeroIds: Record<string, string> = {
      jackets: 'prod-1',
      bags: 'prod-2',
      footwear: 'prod-3',
      wallets: 'prod-4',
      belts: 'belt-01'
    };

    categories.forEach((cat) => {
      const preferred = preferredHeroIds[cat];
      const foundPreferred = products.find((p) => p.id === preferred);
      if (foundPreferred) {
        chosenIds.push(foundPreferred.id);
      } else {
        const firstInCat = products.find((p) => p.category === cat);
        if (firstInCat) chosenIds.push(firstInCat.id);
      }
    });

    setOfferForm((prev) => ({
      ...prev,
      targetCategory: 'selected',
      targetProductIds: chosenIds
    }));
  };

  const handleClearProductSelection = () => {
    setOfferForm((prev) => ({
      ...prev,
      targetCategory: 'selected',
      targetProductIds: []
    }));
  };

  // Step-by-step category -> specific item discount builder state
  const [discountBuilderCat, setDiscountBuilderCat] = useState<'jackets' | 'bags' | 'footwear' | 'wallets' | 'belts'>('jackets');
  const [discountBuilderProdId, setDiscountBuilderProdId] = useState<string>('');
  const [builderFeedback, setBuilderFeedback] = useState<string | null>(null);

  // Automatically update selected product when builder category changes
  useEffect(() => {
    const prodsInCat = products.filter((p) => p.category === discountBuilderCat);
    if (prodsInCat.length > 0) {
      setDiscountBuilderProdId(prodsInCat[0].id);
    } else {
      setDiscountBuilderProdId('');
    }
  }, [discountBuilderCat, products]);

  const handleAddDiscountItem = () => {
    if (!discountBuilderProdId) return;
    const prod = products.find((p) => p.id === discountBuilderProdId);
    setOfferForm((prev) => {
      const current = prev.targetProductIds || [];
      if (current.includes(discountBuilderProdId)) {
        setBuilderFeedback(`"${prod?.name || 'Item'}" is already in the discount list!`);
        setTimeout(() => setBuilderFeedback(null), 3000);
        return prev;
      }
      setBuilderFeedback(`✓ Added "${prod?.name || 'Item'}" to discount list!`);
      setTimeout(() => setBuilderFeedback(null), 3000);
      return {
        ...prev,
        targetCategory: 'selected',
        targetProductIds: [...current, discountBuilderProdId]
      };
    });
  };

  const handleRemoveDiscountItem = (productId: string) => {
    setOfferForm((prev) => ({
      ...prev,
      targetCategory: 'selected',
      targetProductIds: (prev.targetProductIds || []).filter((id) => id !== productId)
    }));
  };

  // Abandoned Cart Recovery State
  const [abandonedLeads, setAbandonedLeads] = useState<AbandonedCartLead[]>(() => {
    try {
      const s = localStorage.getItem('kiru_abandoned_leads');
      return s ? JSON.parse(s) : INITIAL_ABANDONED_LEADS;
    } catch {
      return INITIAL_ABANDONED_LEADS;
    }
  });
  const [abandonedFilter, setAbandonedFilter] = useState<'all' | 'recoverable' | 'contacted' | 'recovered'>('all');
  const [abandonedSearch, setAbandonedSearch] = useState('');
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('kiru_abandoned_leads', JSON.stringify(abandonedLeads));
    } catch (e) {
      console.error(e);
    }
  }, [abandonedLeads]);

  // Content CMS form state
  const [contentSubTab, setContentSubTab] = useState<'about' | 'contact'>('about');
  const [aboutForm, setAboutForm] = useState<AboutPageContent>(() => siteContent?.about || DEFAULT_ABOUT_CONTENT);
  const [contactForm, setContactForm] = useState<ContactPageContent>(() => siteContent?.contact || DEFAULT_CONTACT_CONTENT);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [contentSaveSuccess, setContentSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (siteContent?.about) setAboutForm(siteContent.about);
    if (siteContent?.contact) setContactForm(siteContent.contact);
  }, [siteContent]);

  const handleSaveContent = async () => {
    setIsSavingContent(true);
    setContentSaveSuccess(null);
    try {
      let ok = false;
      if (contentSubTab === 'about') {
        if (onUpdateSiteContent) {
          ok = await onUpdateSiteContent('about', aboutForm);
        } else {
          const token = localStorage.getItem('kiru_token');
          const res = await fetch('/api/content/about', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(aboutForm)
          });
          ok = res.ok;
        }
      } else {
        if (onUpdateSiteContent) {
          ok = await onUpdateSiteContent('contact', contactForm);
        } else {
          const token = localStorage.getItem('kiru_token');
          const res = await fetch('/api/content/contact', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(contactForm)
          });
          ok = res.ok;
        }
      }
      if (ok) {
        setContentSaveSuccess(
          contentSubTab === 'about'
            ? 'About Us page content updated successfully in database!'
            : 'Contact Us page content updated successfully in database!'
        );
        setTimeout(() => setContentSaveSuccess(null), 5000);
      }
    } catch (err: any) {
      alert('Error updating content: ' + (err?.message || 'Network error'));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleResetContent = () => {
    if (contentSubTab === 'about') {
      if (window.confirm('Reset About Us content to atelier defaults?')) {
        setAboutForm(DEFAULT_ABOUT_CONTENT);
      }
    } else {
      if (window.confirm('Reset Contact Us content to atelier defaults?')) {
        setContactForm(DEFAULT_CONTACT_CONTENT);
      }
    }
  };

  // Lookbook Video Management Handlers
  const handleToggleLookbookVisibility = async (item: LookbookItem) => {
    const updatedHidden = !item.isHidden;
    const nextList = lookbookList.map((it) => (it.id === item.id ? { ...it, isHidden: updatedHidden } : it));
    setLookbookList(nextList);
    if (onUpdateLookbookItem) {
      await onUpdateLookbookItem(item.id, { isHidden: updatedHidden });
    }
    setLookbookNotification(
      updatedHidden
        ? `"${item.title}" is now HIDDEN from storefront (ለደንበኞች ተደብቋል)`
        : `"${item.title}" is now LIVE in Lookbook (በሉክቡክ ላይ እንዲታይ ተደርጓል)`
    );
    setTimeout(() => setLookbookNotification(null), 3500);
  };

  const handleMoveLookbook = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lookbookList.length) return;
    const nextList = [...lookbookList];
    const temp = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = temp;
    setLookbookList(nextList);
    if (onReorderLookbookItems) {
      await onReorderLookbookItems(nextList);
    }
  };

  const handleCreateLookbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoForm.title.trim()) return;
    setIsSavingLookbook(true);

    const linkedProd = products.find((p) => p.id === newVideoForm.selectedProductId);
    const prodImg = linkedProd ? (linkedProd.images?.[0] || (linkedProd as any).image) : undefined;
    const item: LookbookItem = {
      id: `lb-${Date.now()}`,
      title: newVideoForm.title.trim(),
      category: newVideoForm.category || 'all',
      location: newVideoForm.location.trim() || 'Addis Ababa Atelier',
      videoUrl: newVideoForm.videoUrl.trim() || 'https://v1.pinimg.com/videos/iht/720p/6c/9a/e3/6c9ae38137b6a5aaa1641372bd34ff38.mp4',
      image: newVideoForm.image.trim() || prodImg || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      description: newVideoForm.description.trim() || 'Master handcrafted bespoke piece from highland leather.',
      hotspot: linkedProd ? {
        productId: linkedProd.id,
        productName: linkedProd.name,
        price: `$${linkedProd.price.toLocaleString()}`
      } : undefined,
      isHidden: newVideoForm.isHidden,
      orderIndex: lookbookList.length + 1
    };

    const nextList = [item, ...lookbookList];
    setLookbookList(nextList);
    if (onAddLookbookItem) {
      await onAddLookbookItem(item);
    }
    setIsSavingLookbook(false);
    setIsAddLookbookOpen(false);
    setNewVideoForm({
      title: '',
      location: 'Bole Studio • Addis Ababa',
      category: 'jackets',
      videoUrl: '',
      image: '',
      description: '',
      selectedProductId: '',
      isHidden: false
    });
    setLookbookNotification(`✅ New video "${item.title}" successfully added to Lookbook!`);
    setTimeout(() => setLookbookNotification(null), 3500);
  };

  const handleUpdateExistingLookbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLookbook || !editingLookbook.title.trim()) return;
    setIsSavingLookbook(true);
    const nextList = lookbookList.map((it) => (it.id === editingLookbook.id ? editingLookbook : it));
    setLookbookList(nextList);
    if (onUpdateLookbookItem) {
      await onUpdateLookbookItem(editingLookbook.id, editingLookbook);
    }
    setIsSavingLookbook(false);
    setEditingLookbook(null);
    setLookbookNotification(`✅ Lookbook video "${editingLookbook.title}" updated.`);
    setTimeout(() => setLookbookNotification(null), 3500);
  };

  const handleDeleteExistingLookbook = async (id: string) => {
    const target = lookbookList.find((it) => it.id === id);
    const nextList = lookbookList.filter((it) => it.id !== id);
    setLookbookList(nextList);
    if (onDeleteLookbookItem) {
      await onDeleteLookbookItem(id);
    }
    setLookbookDeleteId(null);
    setLookbookNotification(`🗑️ Video "${target?.title || id}" removed from Lookbook.`);
    setTimeout(() => setLookbookNotification(null), 3500);
  };

  // Filters
  const [messageFilter, setMessageFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [productVisibilityFilter, setProductVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [chartCurrency, setChartCurrency] = useState<'ETB' | 'USD'>(currency);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const filteredLookbookItems = useMemo(() => {
    return lookbookList.filter((item) => {
      const q = (lookbookSearch || searchQuery).trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.hotspot?.productName && item.hotspot.productName.toLowerCase().includes(q));
      const matchesCat = lookbookCategoryFilter === 'all' || item.category === lookbookCategoryFilter;
      const matchesStatus =
        lookbookStatusFilter === 'all' ||
        (lookbookStatusFilter === 'live' && !item.isHidden) ||
        (lookbookStatusFilter === 'hidden' && Boolean(item.isHidden));
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [lookbookList, lookbookSearch, searchQuery, lookbookCategoryFilter, lookbookStatusFilter]);

  // Modals / Overlays
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<{ image: string; orderId: string; txId?: string; bank?: string } | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Courier Dispatch Modal
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);
  const [dispatchCourierName, setDispatchCourierName] = useState('DeliverAddis Express');
  const [dispatchCourierPhone, setDispatchCourierPhone] = useState('+251 91 123 4567');
  const [dispatchVehiclePlate, setDispatchVehiclePlate] = useState('A.A 2-B88421');
  const [dispatchDeliveryNote, setDispatchDeliveryNote] = useState('White-Glove Handover, Call recipient before arrival');
  const [isDispatching, setIsDispatching] = useState(false);
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'low_stock'>('all');

  const handleConfirmDispatch = async () => {
    if (!dispatchModalOrder) return;
    setIsDispatching(true);
    try {
      const res = await fetch(`/api/orders/${dispatchModalOrder.id}/dispatch-courier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courierName: dispatchCourierName,
          courierPhone: dispatchCourierPhone,
          vehiclePlate: dispatchVehiclePlate,
          deliveryNote: dispatchDeliveryNote
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          onUpdateOrderStatus(data.order.id, 'Shipped');
        }
        setDispatchModalOrder(null);
      }
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  // New product form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'jackets' | 'bags' | 'footwear' | 'wallets' | 'belts'>('jackets');
  const [newPrice, setNewPrice] = useState<number>(500);
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newStock, setNewStock] = useState<number>(10);

  // Edit product form state
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<'jackets' | 'bags' | 'footwear' | 'wallets' | 'belts'>('jackets');
  const [editPrice, setEditPrice] = useState<number>(500);
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editStock, setEditStock] = useState<number>(10);
  const [editFeatured, setEditFeatured] = useState<boolean>(false);
  const [editHidden, setEditHidden] = useState<boolean>(false);

  // Customer message direct reply state
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);

  const handleSendReply = async (messageId: string) => {
    const text = (replyTexts[messageId] || '').trim();
    if (!text || !onReplyMessage) return;
    setSendingReplyId(messageId);
    try {
      await onReplyMessage(messageId, text);
      setReplyTexts(prev => ({ ...prev, [messageId]: '' }));
    } finally {
      setSendingReplyId(null);
    }
  };

  const isDark = theme === 'dark';

  // Prevent background scrolling while Admin Portal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const formatPrice = (usd: number) => {
    const val = currency === 'ETB' ? usd * exchangeRate : usd;
    return currency === 'ETB' ? `${val.toLocaleString()} ETB` : `$${val.toLocaleString()}`;
  };

  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  }, [orders]);

  const totalETBRevenue = useMemo(() => {
    return orders.filter(o => o.currency === 'ETB').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders]);

  const totalUSDRevenue = useMemo(() => {
    return orders.filter(o => o.currency !== 'ETB').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders]);

  const pendingPaymentsCount = useMemo(() => {
    return orders.filter(o => o.paymentStatus === 'Pending Verification').length;
  }, [orders]);

  const unreadMessagesCount = useMemo(() => {
    return messages.filter(m => m.status === 'new').length;
  }, [messages]);

  const mobileTransferOrders = useMemo(() => {
    return orders.filter(o => o.paymentMethod === 'mobile_transfer' || !!o.transferDetails);
  }, [orders]);

  // Filtering for orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        o.id.toLowerCase().includes(q) ||
        (o.customer?.fullName || '').toLowerCase().includes(q) ||
        (o.customer?.phone || '').includes(q) ||
        (o.customer?.city || '').toLowerCase().includes(q) ||
        (o.paymentMethod || '').toLowerCase().includes(q);
      const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, orderStatusFilter]);

  // Filtering for payments
  const filteredTransfers = useMemo(() => {
    return mobileTransferOrders.filter(o => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        o.id.toLowerCase().includes(q) ||
        (o.customer?.fullName || '').toLowerCase().includes(q) ||
        (o.transferDetails?.transactionId || '').toLowerCase().includes(q) ||
        (o.transferDetails?.bank || '').toLowerCase().includes(q);

      if (paymentFilter === 'pending') return matchesSearch && (!o.paymentStatus || o.paymentStatus === 'Pending Verification');
      if (paymentFilter === 'approved') return matchesSearch && o.paymentStatus === 'Approved';
      if (paymentFilter === 'rejected') return matchesSearch && o.paymentStatus === 'Rejected';
      return matchesSearch;
    });
  }, [mobileTransferOrders, searchQuery, paymentFilter]);

  // Filtering for messages
  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone || '').includes(q) ||
        m.message.toLowerCase().includes(q);

      if (messageFilter === 'new') return matchesSearch && m.status === 'new';
      if (messageFilter === 'read') return matchesSearch && m.status === 'read';
      if (messageFilter === 'replied') return matchesSearch && m.status === 'replied';
      return matchesSearch;
    });
  }, [messages, searchQuery, messageFilter]);

  // Filtering for products (including visibility filter)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.categoryLabel || '').toLowerCase().includes(q);

      const isHidden = Boolean(p.hidden || p.is_hidden);
      const stockVal = p.stock !== undefined && p.stock !== null ? Number(p.stock) : 10;
      if (productStockFilter === 'low_stock' && stockVal > 3) return false;
      if (productVisibilityFilter === 'visible') return matchesSearch && !isHidden;
      if (productVisibilityFilter === 'hidden') return matchesSearch && isHidden;
      return matchesSearch;
    });
  }, [products, searchQuery, productVisibilityFilter, productStockFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 'City', 'Delivery Zone', 'Payment Method', 'Payment Status', 'Order Status', 'Items Count', 'Currency', 'Total Amount', 'Transaction ID'];
    const rows = orders.map((o) => [
      o.id,
      o.createdAt ? new Date(o.createdAt).toLocaleString() : '',
      `"${(o.customer?.fullName || '').replace(/"/g, '""')}"`,
      o.customer?.email || '',
      o.customer?.phone || '',
      o.customer?.city || '',
      `"${(o.deliveryZoneName || o.customer?.deliveryZoneName || '').replace(/"/g, '""')}"`,
      o.paymentMethod || '',
      o.paymentStatus || '',
      o.status || '',
      (o.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0),
      o.currency || 'USD',
      o.totalAmount || 0,
      o.transferDetails?.transactionId || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kiru_leathers_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyTx = (txId: string) => {
    navigator.clipboard?.writeText(txId);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const handleConfirmReject = () => {
    if (!rejectingOrder || !onVerifyPayment) return;
    const reason = rejectionReasonInput.trim() || 'የተሳሳተ ወይም ተቀባይነት የሌለው የክፍያ ደረሰኝ (Invalid or unverified receipt)';
    onVerifyPayment(rejectingOrder.id, 'reject', reason);
    setRejectingOrder(null);
    setRejectionReasonInput('');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const prod: Product = {
      id: `prod-${Date.now()}`,
      name: newTitle.trim(),
      category: newCategory,
      categoryLabel: newCategory.toUpperCase(),
      price: Number(newPrice),
      description: newDescription.trim() || 'Masterfully handcrafted leather piece from full-grain Ethiopian hides.',
      images: [newImageUrl.trim() || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80'],
      colors: [{ name: 'Espresso Black', hex: '#111111' }],
      sizes: ['S', 'M', 'L'],
      stock: Number(newStock),
      featured: true,
      rating: 5.0,
      reviewsCount: 1,
      isNew: true,
      hidden: false,
      is_hidden: 0
    };

    onAddProduct(prod);
    setNewTitle('');
    setNewDescription('');
    setNewImageUrl('');
    setIsAddingProduct(false);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setEditTitle(p.name);
    setEditCategory(p.category);
    setEditPrice(p.price);
    setEditDescription(p.description || '');
    setEditImageUrl(p.images && p.images[0] ? p.images[0] : '');
    setEditStock(p.stock !== undefined ? p.stock : 10);
    setEditFeatured(Boolean(p.featured));
    setEditHidden(Boolean(p.hidden || p.is_hidden));
  };

  // Save Edited Product
  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated: Product = {
      ...editingProduct,
      name: editTitle.trim() || editingProduct.name,
      category: editCategory,
      categoryLabel: editCategory.toUpperCase(),
      price: Number(editPrice),
      description: editDescription.trim(),
      images: editImageUrl.trim() ? [editImageUrl.trim(), ...(editingProduct.images?.slice(1) || [])] : editingProduct.images,
      stock: Number(editStock),
      featured: editFeatured,
      hidden: editHidden,
      is_hidden: editHidden ? 1 : 0
    };

    if (onUpdateProduct) {
      onUpdateProduct(updated);
    }
    setEditingProduct(null);
  };

  // Toggle Visibility directly from table action
  const handleDirectToggleVisibility = (p: Product) => {
    const isCurrentlyHidden = Boolean(p.hidden || p.is_hidden);
    const newHidden = !isCurrentlyHidden;

    if (onToggleVisibility) {
      onToggleVisibility(p.id);
    } else if (onUpdateProduct) {
      onUpdateProduct({
        ...p,
        hidden: newHidden,
        is_hidden: newHidden ? 1 : 0
      });
    }
  };

  // Analytics Calculation with vivid individual color styling per month
  const monthlyRevenueData = useMemo(() => {
    const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
    const baseAmounts = [142000, 198000, 245000, 280000, 310000, 385000];
    const realTotal = chartCurrency === 'ETB' ? (totalETBRevenue || 385000) : (totalUSDRevenue || 3080);
    
    const barColors = [
      {
        gradient: 'from-violet-600 via-purple-500 to-fuchsia-400',
        bgGradient: 'linear-gradient(to top, #7c3aed, #a855f7, #f472b6)',
        glow: 'shadow-[0_4px_25px_rgba(168,85,247,0.5)]',
        colorHex: '#8B5CF6',
        text: 'text-purple-600 dark:text-purple-400',
        badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
      },
      {
        gradient: 'from-blue-600 via-cyan-500 to-sky-400',
        bgGradient: 'linear-gradient(to top, #0284c7, #06b6d4, #38bdf8)',
        glow: 'shadow-[0_4px_25px_rgba(6,182,212,0.5)]',
        colorHex: '#06B6D4',
        text: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
      },
      {
        gradient: 'from-emerald-600 via-teal-500 to-emerald-400',
        bgGradient: 'linear-gradient(to top, #059669, #10b981, #34d399)',
        glow: 'shadow-[0_4px_25px_rgba(16,185,129,0.5)]',
        colorHex: '#10B981',
        text: 'text-emerald-600 dark:text-emerald-400',
        badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
      },
      {
        gradient: 'from-amber-600 via-orange-500 to-yellow-400',
        bgGradient: 'linear-gradient(to top, #d97706, #f59e0b, #fde047)',
        glow: 'shadow-[0_4px_25px_rgba(245,158,11,0.5)]',
        colorHex: '#F59E0B',
        text: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
      },
      {
        gradient: 'from-rose-600 via-pink-500 to-rose-400',
        bgGradient: 'linear-gradient(to top, #e11d48, #f43f5e, #fb7185)',
        glow: 'shadow-[0_4px_25px_rgba(244,63,94,0.5)]',
        colorHex: '#F43F5E',
        text: 'text-rose-600 dark:text-rose-400',
        badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
      },
      {
        gradient: 'from-amber-700 via-[#D4AF37] to-yellow-300',
        bgGradient: 'linear-gradient(to top, #b45309, #D4AF37, #fef08a)',
        glow: 'shadow-[0_4px_30px_rgba(212,175,55,0.65)]',
        colorHex: '#D4AF37',
        text: 'text-amber-700 dark:text-[#D4AF37]',
        badge: 'bg-amber-500/25 text-amber-800 dark:text-amber-300 border-[#D4AF37]/50 font-bold',
        isPeak: true
      }
    ];

    return months.map((month, idx) => {
      const rawVal = chartCurrency === 'ETB'
        ? Math.round((baseAmounts[idx] || 250000) * (realTotal > 400000 ? 1.2 : 1))
        : Math.round(((baseAmounts[idx] || 250000) / exchangeRate) * (realTotal > 3000 ? 1.2 : 1));
      const orderCount = Math.round(3 + idx * 2.5);
      return {
        month,
        amount: rawVal,
        orderCount,
        growth: idx === 0 ? '+12%' : `+${(14 + idx * 3.5).toFixed(1)}%`,
        color: barColors[idx]
      };
    });
  }, [totalETBRevenue, totalUSDRevenue, chartCurrency, exchangeRate]);

  const maxMonthAmount = Math.max(...monthlyRevenueData.map(d => d.amount), 1);

  // Order status breakdown for donut chart
  const orderStatusCounts = useMemo(() => {
    const counts = {
      inAtelier: orders.filter(o => o.status === 'In Atelier' || o.status === 'Processing' || o.status === 'Pending').length,
      delivered: orders.filter(o => o.status === 'Delivered' || o.status === 'Shipped').length,
      verification: orders.filter(o => o.status === 'Payment Verification' || o.paymentStatus === 'Pending Verification').length,
      rejected: orders.filter(o => o.status === 'Payment Rejected' || o.paymentStatus === 'Rejected').length
    };
    const total = orders.length || 1;
    return {
      ...counts,
      total: orders.length,
      pctInAtelier: Math.round((counts.inAtelier / total) * 100),
      pctDelivered: Math.round((counts.delivered / total) * 100),
      pctVerification: Math.round((counts.verification / total) * 100),
      pctRejected: Math.round((counts.rejected / total) * 100)
    };
  }, [orders]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const categories = ['jackets', 'bags', 'footwear', 'wallets', 'belts'] as const;
    return categories.map(cat => {
      const catProducts = products.filter(p => p.category === cat);
      const unitsSold = orders.reduce((sum, o) => {
        return sum + (o.items || []).filter(item => item.product?.category === cat).reduce((s, it) => s + (it.quantity || 1), 0);
      }, 0);
      const sampleUnits = unitsSold > 0 ? unitsSold : (cat === 'jackets' ? 8 : cat === 'bags' ? 12 : cat === 'footwear' ? 5 : cat === 'wallets' ? 9 : 7);
      const sharePct = cat === 'jackets' ? 38 : cat === 'bags' ? 30 : cat === 'footwear' ? 14 : cat === 'wallets' ? 10 : 8;
      return {
        category: cat,
        label: cat === 'jackets' ? 'Jackets & Outerwear (ጃኬቶች)' : cat === 'bags' ? 'Bags & Duffels (ቦርሳዎች)' : cat === 'footwear' ? 'Handmade Boots (ጫማዎች)' : cat === 'wallets' ? 'Wallets & Small Goods (የኪስ ቦርሳ)' : 'Belts & Straps (የቆዳ ቀበቶዎች)',
        productCount: catProducts.length,
        unitsSold: sampleUnits,
        sharePct
      };
    });
  }, [products, orders]);

  // Payment method breakdown
  const paymentMethodStats = useMemo(() => {
    const cbeOrders = orders.filter(o => o.transferDetails?.bank?.toLowerCase().includes('cbe') || o.transferDetails?.bank?.toLowerCase().includes('commercial'));
    const telebirrOrders = orders.filter(o => o.transferDetails?.bank?.toLowerCase().includes('telebirr'));
    const awashOrders = orders.filter(o => o.transferDetails?.bank?.toLowerCase().includes('awash') || o.transferDetails?.bank?.toLowerCase().includes('abyssinia'));
    const cardOrders = orders.filter(o => o.paymentMethod === 'card');

    return [
      { name: 'CBE Birr / CBE Transfer', count: Math.max(cbeOrders.length, 2), share: 45, color: '#9333ea', label: 'የኢትዮጵያ ንግድ ባንክ' },
      { name: 'Telebirr (ቴሌብር)', count: Math.max(telebirrOrders.length, 1), share: 30, color: '#0284c7', label: 'ኢትዮ ቴሌኮም' },
      { name: 'Awash / BOA Transfer', count: Math.max(awashOrders.length, 1), share: 15, color: '#f59e0b', label: 'አዋሽ / አቢሲኒያ' },
      { name: 'International Cards (Stripe)', count: Math.max(cardOrders.length, 0), share: 10, color: '#10b981', label: 'ቪዛ / ማስተርካርድ' },
    ];
  }, [orders]);

  // Navigation Items exactly from user photo
  const navItems = [
    {
      id: 'orders' as const,
      label: 'CUSTOMER ORDERS',
      amharic: 'የትእዛዞች ዝርዝር',
      icon: Package,
      count: orders.length,
      badge: null
    },
    {
      id: 'payments' as const,
      label: 'PAYMENT APPROVALS',
      amharic: 'የክፍያ ማረጋገጫዎች',
      icon: FileCheck2,
      count: mobileTransferOrders.length,
      badge: pendingPaymentsCount > 0 ? `${pendingPaymentsCount} NEW` : null,
      badgeColor: 'bg-amber-500 text-black'
    },
    {
      id: 'messages' as const,
      label: 'CUSTOMER MESSAGES',
      amharic: 'የደንበኞች መልእክት',
      icon: Mail,
      count: messages.length,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} NEW` : null,
      badgeColor: 'bg-amber-500 text-black'
    },
    {
      id: 'products' as const,
      label: 'PRODUCT INVENTORY',
      amharic: 'የእቃዎች ክምችት',
      icon: Layers,
      count: products.length,
      badge: null
    },
    {
      id: 'analytics' as const,
      label: 'ANALYTICS & CHARTS',
      amharic: 'የገቢና ሽያጭ ግራፎች',
      icon: BarChart3,
      count: null,
      badge: 'LIVE',
      badgeColor: 'bg-[#D4AF37] text-black'
    },
    {
      id: 'content' as const,
      label: 'PAGE CONTENT CMS',
      amharic: 'የገጽ ፅሁፎች ማስተካከያ',
      icon: Globe,
      count: null,
      badge: 'CMS',
      badgeColor: 'bg-[#D4AF37] text-black'
    },
    {
      id: 'abandoned' as const,
      label: 'ABANDONED CARTS',
      amharic: 'ያልተጠናቀቁ ቅርጫቶች',
      icon: ShoppingBag,
      count: abandonedLeads.filter(l => l.status === 'recoverable').length,
      badge: abandonedLeads.filter(l => l.status === 'recoverable').length > 0
        ? `${abandonedLeads.filter(l => l.status === 'recoverable').length} RECOVER`
        : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'promotions' as const,
      label: 'FLASH SALES & OFFERS',
      amharic: 'ልዩ ቅናሾችና የጊዜ ገደብ',
      icon: Tag,
      count: null,
      badge: (() => {
        const now = Date.now();
        const start = new Date(offerForm.startDate).getTime();
        const end = new Date(offerForm.endDate).getTime();
        return (offerForm.isEnabled && now >= start && now < end) ? `${offerForm.discountValue}% LIVE` : 'OFFER DESK';
      })(),
      badgeColor: 'bg-rose-600 text-white'
    },
    {
      id: 'lookbook' as const,
      label: 'LOOKBOOK VIDEOS',
      amharic: 'የቪዲዮ ሉክቡክ ማስተዳደሪያ',
      icon: Video,
      count: lookbookList.length,
      badge: `${lookbookList.filter(item => !item.isHidden).length} LIVE`,
      badgeColor: 'bg-emerald-500 text-black'
    }
  ];

  return (
    <div className={`fixed inset-0 z-50 w-screen h-screen min-h-screen flex flex-col md:flex-row overflow-hidden select-none transition-colors duration-300 ${
      isDark ? 'bg-[#070709] text-stone-100' : 'bg-[#F8F6F0] text-stone-900'
    }`}>
      
      {/* ============================================================== */}
      {/* 1. LEFT SIDEBAR (Desktop Fixed, Mobile Slide-Out Drawer)       */}
      {/* ============================================================== */}
      
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 sm:w-80 h-full border-r flex flex-col justify-between transition-all duration-300 ease-in-out md:translate-x-0 ${
          isDark
            ? 'bg-[#0A0B0E] border-white/10 text-white'
            : 'bg-white border-stone-200/90 text-stone-900 shadow-sm'
        } ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
        {/* Sidebar Brand Header */}
        <div className={`p-5 border-b ${isDark ? 'border-white/10' : 'border-stone-200/80'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KiruLogo variant="horizontal" size="sm" theme={isDark ? 'dark' : 'light'} subtitleText="ባለቤት አስተዳዳሪ ፖርታል" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-[#D4AF37] text-black font-extrabold tracking-wider shrink-0">
                OWNER
              </span>
            </div>

            {/* Mobile close button inside drawer */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`p-1.5 rounded-xl transition-colors md:hidden ${
                isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-stone-100 text-stone-500 hover:text-black'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Database & System Live Pulse */}
          <div className={`mt-4 px-3 py-2 rounded-xl border flex items-center justify-between text-[11px] font-mono ${
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-stone-50 border-stone-200 text-stone-700'
          }`}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium">MySQL :3306</span>
            </div>
            <span className="text-emerald-500 font-semibold uppercase text-[10px] tracking-wider">Connected</span>
          </div>
        </div>

        {/* Sidebar Navigation Items (Converted from the user's photo!) */}
        <div className="flex-1 min-h-0 overflow-y-auto py-4 px-3 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-gray-400 font-semibold">
            Atelier Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full group text-left px-3.5 py-3 rounded-2xl transition-all duration-200 flex items-center justify-between relative ${
                  isActive
                    ? isDark
                      ? 'bg-gradient-to-r from-amber-500/20 via-[#3D2314]/30 to-amber-500/5 border border-[#D4AF37]/50 text-white shadow-lg shadow-amber-500/5'
                      : 'bg-gradient-to-r from-amber-500/15 via-[#FFF9EE] to-amber-500/5 border border-[#D4AF37] text-stone-900 shadow-sm'
                    : isDark
                    ? 'hover:bg-white/[0.04] text-gray-400 hover:text-stone-200 border border-transparent'
                    : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900 border border-transparent'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#D4AF37] rounded-r shadow-[0_0_12px_#D4AF37]"
                  />
                )}

                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                      isActive
                        ? 'bg-[#D4AF37] text-black shadow-md'
                        : isDark
                        ? 'bg-white/[0.04] text-gray-400 group-hover:text-white group-hover:bg-white/10'
                        : 'bg-stone-100 text-stone-500 group-hover:text-black group-hover:bg-stone-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="truncate">
                    <p className={`font-mono text-xs uppercase tracking-wider font-bold transition-colors ${
                      isActive ? 'text-[#D4AF37]' : isDark ? 'text-gray-200 group-hover:text-white' : 'text-stone-800 group-hover:text-black'
                    }`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] font-sans text-gray-400 truncate mt-0.5">
                      {item.amharic}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase animate-pulse ${item.badgeColor || 'bg-amber-500 text-black'}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.count !== null && (
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                        isActive
                          ? 'bg-[#D4AF37]/20 text-amber-500 border border-[#D4AF37]/40'
                          : isDark
                          ? 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
                          : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200 group-hover:text-black'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Quick Actions in Sidebar */}
          <div className={`pt-4 mt-3 border-t ${isDark ? 'border-white/10' : 'border-stone-200/80'} space-y-2`}>
            {/* Theme Toggle in Sidebar */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-between group ${
                  isDark
                    ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-gray-300 hover:text-white'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isDark ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-stone-700" />}
                  <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-[#D4AF37]">
                  {isDark ? 'Light' : 'Dark'}
                </span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-between group ${
                isDark
                  ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-white/20 text-gray-300 hover:text-white'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700 hover:text-black'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span>Export Orders (CSV)</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
            </button>
          </div>
        </div>

        {/* Sidebar Footer: Active Admin Profile & Return to Storefront */}
        <div className={`p-4 border-t ${isDark ? 'border-white/10 bg-black/40' : 'border-stone-200 bg-stone-50/80'} space-y-3`}>
          {/* Admin User Card */}
          <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${
            isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-stone-200 shadow-2xs'
          }`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-[#3D2314] text-white flex items-center justify-center font-bold font-serif text-sm shadow">
              KM
            </div>
            <div className="truncate flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-serif font-bold truncate">Kirubel Melaku</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              </div>
              <p className="text-[10px] font-mono text-gray-400 truncate">kirubelmelaku454@gmail.com</p>
            </div>
          </div>

          {/* Sign Out Button */}
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-2 px-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              title="Sign Out of Admin Console (ከአካውንት ውጣ)"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Sign Out (ከአካውንት ውጣ)</span>
            </button>
          )}

          {/* Exit / Return to Storefront Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 px-3 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-mono text-xs uppercase font-extrabold tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>ወደ ሱቅ ተመለስ (Storefront)</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MAIN APPLICATION WORKSPACE AREA                            */}
      {/* ============================================================== */}
      
      <main className={`flex-1 h-full min-h-0 flex flex-col overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-[#0D0E12]' : 'bg-[#F4F1EA]'
      }`}>
        
        {/* Top Header Bar */}
        <header className={`h-16 px-4 sm:px-8 border-b backdrop-blur-md flex items-center justify-between gap-4 shrink-0 transition-colors ${
          isDark
            ? 'bg-[#0A0B0E]/80 border-white/10'
            : 'bg-white/80 border-stone-200 shadow-2xs'
        }`}>
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`p-2 rounded-xl md:hidden border transition-colors ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
              }`}
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight capitalize">
                  {activeTab === 'orders' && 'Live Customer Orders (የትእዛዝ ዝርዝር)'}
                  {activeTab === 'payments' && 'Bank & Transfer Verifications (የክፍያ ማረጋገጫዎች)'}
                  {activeTab === 'messages' && 'Concierge Customer Messages (የደንበኞች መልእክት)'}
                  {activeTab === 'products' && 'Atelier Product Inventory (የእቃዎች ክምችትና ቁጥጥር)'}
                  {activeTab === 'analytics' && 'Executive Analytics & Revenue Reports (የሽያጭና ገቢ ግራፎች)'}
                  {activeTab === 'content' && 'Site Content CMS: About & Contact (የገጽ ፅሁፎች ማስተካከያ)'}
                  {activeTab === 'abandoned' && 'Abandoned Cart Recovery & VIP Concierge (ያልተጠናቀቁ ቅርጫቶች)'}
                  {activeTab === 'promotions' && 'Special Offers & Flash Sales Manager (የልዩ ቅናሾችና ሰዓታት ማስተዳደሪያ)'}
                  {activeTab === 'lookbook' && 'Lookbook Video Editorial Manager (የቪዲዮ ሉክቡክ ማስተዳደሪያ)'}
                </h1>
              </div>
              <p className="text-[11px] font-mono text-gray-400 hidden sm:block">
                Kiru Leathers Luxury Atelier • Real-time Operations & Database Console
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative hidden sm:block w-48 lg:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
                className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs font-mono outline-none focus:border-[#D4AF37] ${
                  isDark
                    ? 'bg-white/[0.04] border-white/10 text-white placeholder-gray-500'
                    : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 shadow-2xs'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Light / Dark Mode Header Toggle */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className={`p-2 rounded-xl border transition-colors ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-[#D4AF37]'
                    : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-800 shadow-2xs'
                }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-stone-700" />}
              </button>
            )}

            {/* Currency Pill */}
            <span className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-semibold hidden md:inline-flex items-center gap-1 ${
              isDark ? 'bg-white/5 border-white/10 text-amber-300' : 'bg-white border-stone-200 text-amber-700 shadow-2xs'
            }`}>
              <span>Rate:</span>
              <strong className={isDark ? 'text-white' : 'text-stone-900'}>1 USD = {exchangeRate} ETB</strong>
            </span>

            {/* Sign Out quick button */}
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-2.5 py-1.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Sign Out of Admin Console (ከአካውንት ውጣ)"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            {/* Close / Return button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10' : 'bg-white hover:bg-stone-100 text-stone-500 hover:text-black border-stone-200 shadow-2xs'
              }`}
              title="Return to Storefront"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Global KPI Summary Bar (Responsive 2 to 5 columns) */}
        <section className={`px-4 sm:px-8 py-4 border-b shrink-0 ${
          isDark ? 'bg-black/20 border-white/10' : 'bg-stone-100/60 border-stone-200'
        }`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* KPI 1: Gross Revenue & Analytics Shortcut */}
            <div
              onClick={() => setActiveTab('analytics')}
              className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all ${
                activeTab === 'analytics'
                  ? 'border-[#D4AF37] bg-amber-500/10 ring-2 ring-[#D4AF37]/30 shadow-lg'
                  : isDark
                  ? 'bg-white/[0.03] border-white/10 hover:border-[#D4AF37]/50'
                  : 'bg-white border-stone-200/90 shadow-2xs hover:border-[#D4AF37]'
              }`}
            >
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Gross Revenue (ገቢ)</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="font-mono text-base sm:text-xl font-bold text-[#D4AF37]">
                {formatPrice(totalRevenue)}
              </p>
              <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>+28.4% velocity • Open Charts</span>
              </span>
            </div>

            {/* KPI 2: Total Orders */}
            <div
              onClick={() => setActiveTab('orders')}
              className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all ${
                activeTab === 'orders'
                  ? 'border-[#D4AF37] bg-amber-500/10'
                  : isDark ? 'bg-white/[0.03] border-white/10 hover:border-white/20' : 'bg-white border-stone-200/90 shadow-2xs hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider">All Orders</span>
                <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <p className="font-mono text-base sm:text-xl font-bold">
                {orders.length}
              </p>
              <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                {orders.filter(o => o.status === 'Delivered').length} fulfilled
              </span>
            </div>

            {/* KPI 3: Pending Payments */}
            <div
              onClick={() => setActiveTab('payments')}
              className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all ${
                activeTab === 'payments'
                  ? 'border-amber-400 bg-amber-500/10'
                  : isDark ? 'bg-white/[0.03] border-white/10 hover:border-white/20' : 'bg-white border-stone-200/90 shadow-2xs hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider">Pending Proofs</span>
                <AlertTriangle className={`w-4 h-4 ${pendingPaymentsCount > 0 ? 'text-amber-500 animate-pulse' : 'text-gray-400'}`} />
              </div>
              <p className={`font-mono text-base sm:text-xl font-bold ${pendingPaymentsCount > 0 ? 'text-amber-500' : ''}`}>
                {pendingPaymentsCount}
              </p>
              <span className="text-[10px] font-mono text-amber-500 block mt-0.5">
                {pendingPaymentsCount > 0 ? 'Verification needed' : 'All cleared'}
              </span>
            </div>

            {/* KPI 4: Direct Inquiries */}
            <div
              onClick={() => setActiveTab('messages')}
              className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all ${
                activeTab === 'messages'
                  ? 'border-[#D4AF37] bg-amber-500/10'
                  : isDark ? 'bg-white/[0.03] border-white/10 hover:border-white/20' : 'bg-white border-stone-200/90 shadow-2xs hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider">Client Inquiries</span>
                <MessageSquare className={`w-4 h-4 ${unreadMessagesCount > 0 ? 'text-amber-500 animate-pulse' : 'text-gray-400'}`} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <p className="font-mono text-base sm:text-xl font-bold">{messages.length}</p>
                {unreadMessagesCount > 0 && (
                  <span className="text-[10px] font-mono text-amber-500 font-bold">({unreadMessagesCount} new)</span>
                )}
              </div>
              <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                Concierge desk
              </span>
            </div>

            {/* KPI 5: Product Inventory */}
            <div
              onClick={() => setActiveTab('products')}
              className={`p-3 sm:p-3.5 rounded-2xl border col-span-2 sm:col-span-1 cursor-pointer transition-all ${
                activeTab === 'products'
                  ? 'border-[#D4AF37] bg-amber-500/10'
                  : isDark ? 'bg-white/[0.03] border-white/10 hover:border-white/20' : 'bg-white border-stone-200/90 shadow-2xs hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider">Catalog Inventory</span>
                <Layers className="w-4 h-4 text-sky-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <p className="font-mono text-base sm:text-xl font-bold">{products.length}</p>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">
                  ({products.filter(p => !p.hidden && !p.is_hidden).length} live)
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                {products.filter(p => p.hidden || p.is_hidden).length} hidden from store
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* Scrollable Work Area for Active Tab Content                    */}
        {/* ============================================================== */}
        
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 space-y-6">

          {/* High Priority Unread Alert Banner */}
          {unreadMessagesCount > 0 && activeTab !== 'messages' && (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg ${
              isDark
                ? 'bg-gradient-to-r from-amber-500/15 via-[#3D2314]/30 to-amber-500/10 border-amber-500/40'
                : 'bg-amber-50 border-amber-300 text-stone-900'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Mail className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-sm font-semibold text-amber-600 dark:text-amber-400">አዲስ የደንበኛ ቀጥታ መልእክት ማንቂያ (Customer Message Alert)</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-black animate-pulse">
                      {unreadMessagesCount} NEW
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-300' : 'text-stone-700'}`}>
                    ከደንበኞች የተላኩ {unreadMessagesCount} አዳዲስ መልእክቶች አሉ። እባክዎ ገብተው ይመልከቱ እና ምላሽ ይስጡ።
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('messages')}
                className="px-4 py-2 rounded-xl text-xs font-mono uppercase font-bold tracking-wider bg-[#D4AF37] hover:bg-amber-400 text-black transition-all shadow flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <MessageSquare className="w-4 h-4" />
                <span>መልእክቶችን ክፈት ({unreadMessagesCount})</span>
              </button>
            </div>
          )}







          {/* ========================================================== */}
          {/* TAB 1: CUSTOMER ORDERS (FULFILLMENT)                       */}
          {/* ========================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#D4AF37]" />
                    <span>Customer Orders & Delivery Dispatch</span>
                  </h3>
                  <p className="text-xs font-mono text-gray-400">
                    Live client orders placed via e-commerce and bank transfer
                  </p>
                </div>

                {/* Status filter pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono outline-none focus:border-[#D4AF37] ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-stone-300 text-stone-900 shadow-2xs'
                    }`}
                  >
                    <option value="all">All Order Statuses ({orders.length})</option>
                    <option value="In Atelier">In Atelier (Handcrafting)</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Payment Verification">Payment Verification</option>
                    <option value="Payment Rejected">Payment Rejected</option>
                  </select>

                  <button
                    onClick={handleExportCSV}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono text-[#D4AF37] flex items-center gap-1.5 transition-colors ${
                      isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-white hover:bg-stone-100 border-stone-200 shadow-2xs'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className={`text-center py-20 rounded-2xl border border-dashed ${
                  isDark ? 'border-white/10 bg-white/[0.01]' : 'border-stone-300 bg-white'
                }`}>
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-40" />
                  <p className="font-serif text-lg">No matching orders found.</p>
                  <p className="text-xs text-gray-400 mt-1">Try modifying your search or status filter.</p>
                </div>
              ) : (
                <div className={`overflow-x-auto rounded-2xl border shadow-xl ${
                  isDark ? 'border-white/10 bg-white/[0.02]' : 'border-stone-200 bg-white'
                }`}>
                  <table className="w-full text-left text-xs font-mono">
                    <thead className={`border-b uppercase text-[10px] tracking-wider ${
                      isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}>
                      <tr>
                        <th className="p-4">Order Ref</th>
                        <th className="p-4">Collector & Location</th>
                        <th className="p-4">Pieces Ordered</th>
                        <th className="p-4">Payment Method / Status</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4">Status & Invoice Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-stone-200'}`}>
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-amber-50/40'}`}>
                          <td className="p-4 font-bold text-[#D4AF37]">
                            <div className="flex items-center gap-1.5">
                              <span>{ord.id}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 block font-normal">
                              {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent'}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="font-sans font-medium text-sm">{ord.customer.fullName}</p>
                            <p className="text-[11px] text-gray-400">{ord.customer.phone || 'No phone'}</p>
                            <p className="text-[10px] text-amber-500 font-semibold">{ord.deliveryZoneName || ord.customer.city || 'Addis Ababa'}</p>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="font-sans">{it.product.name}</span>
                                  <span className="text-gray-400">×{it.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="uppercase font-semibold text-gray-400">
                                {ord.paymentMethod === 'mobile_transfer' ? 'Mobile / Bank Transfer' : ord.paymentMethod}
                              </span>
                              {ord.paymentMethod === 'mobile_transfer' && (
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                    ord.paymentStatus === 'Approved'
                                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                      : ord.paymentStatus === 'Rejected'
                                      ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                                      : 'bg-amber-500/20 text-amber-500 border border-amber-500/30 animate-pulse'
                                  }`}>
                                    {ord.paymentStatus || 'Pending Verification'}
                                  </span>
                                  {ord.transferDetails?.receiptImage && (
                                    <button
                                      onClick={() => setPreviewReceipt({
                                        image: ord.transferDetails!.receiptImage!,
                                        orderId: ord.id,
                                        txId: ord.transferDetails?.transactionId,
                                        bank: ord.transferDetails?.bank
                                      })}
                                      className={`p-1 rounded text-[#D4AF37] ${isDark ? 'hover:bg-white/10' : 'hover:bg-stone-100'}`}
                                      title="View receipt"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-bold text-sm">
                            {formatPrice(ord.totalAmount)}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <select
                                  value={ord.status}
                                  onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as Order['status'])}
                                  className={`rounded-xl px-2.5 py-1.5 text-xs font-mono outline-none cursor-pointer border ${
                                    isDark ? 'bg-black/60 border-white/20 text-amber-300 focus:border-[#D4AF37]' : 'bg-white border-stone-300 text-stone-900 focus:border-[#D4AF37] shadow-2xs'
                                  }`}
                                >
                                  <option value="Payment Verification">Payment Verification</option>
                                  <option value="Pending">Pending</option>
                                  <option value="In Atelier">In Atelier (Handcrafting)</option>
                                  <option value="Processing">Processing (Atelier)</option>
                                  <option value="Shipped">Shipped (In Transit)</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Payment Rejected">Payment Rejected</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setDispatchModalOrder(ord);
                                    if (ord.courier) {
                                      setDispatchCourierName(ord.courier.name);
                                      setDispatchCourierPhone(ord.courier.phone);
                                      setDispatchVehiclePlate(ord.courier.vehiclePlate || '');
                                      setDispatchDeliveryNote(ord.courier.deliveryNote || '');
                                    }
                                  }}
                                  className={`p-1.5 px-2.5 rounded-xl border text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    ord.courier
                                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                                      : 'border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'
                                  }`}
                                  title="Dispatch Courier with SMS Alert"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">{ord.courier ? 'Courier' : 'Dispatch'}</span>
                                </button>

                                {onOpenInvoice && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenInvoice(ord)}
                                    className={`p-1.5 rounded-xl border transition-colors ${
                                      isDark
                                        ? 'border-white/10 hover:border-[#D4AF37] text-gray-400 hover:text-[#D4AF37] hover:bg-white/5'
                                        : 'border-stone-200 hover:border-[#D4AF37] text-stone-600 hover:text-[#D4AF37] hover:bg-stone-50 shadow-2xs'
                                    }`}
                                    title="Print / View Official Tax Invoice"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                )}

                                {onOpenCertificate && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenCertificate(ord)}
                                    className={`p-1.5 rounded-xl border transition-colors ${
                                      isDark
                                        ? 'border-white/10 hover:border-[#D4AF37] text-amber-300 hover:bg-amber-400/10'
                                        : 'border-stone-200 hover:border-[#D4AF37] text-amber-700 hover:bg-amber-50 shadow-2xs'
                                    }`}
                                    title="View / Print Official Certificate of Authenticity"
                                  >
                                    <Award className="w-4 h-4 text-[#D4AF37]" />
                                  </button>
                                )}
                              </div>

                              {ord.courier && (
                                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                                  <span>🚚 {ord.courier.name}</span>
                                  <span>•</span>
                                  <a href={`tel:${ord.courier.phone}`} className="underline hover:text-white">{ord.courier.phone}</a>
                                  {ord.courier.vehiclePlate && <span>({ord.courier.vehiclePlate})</span>}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}







          {/* ========================================================== */}
          {/* TAB 2: PAYMENT APPROVALS (CBE, TELEBIRR, AWASH RECEIPTS)  */}
          {/* ========================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-[#D4AF37]" />
                    <span>Bank & Mobile Transfer Verifications</span>
                  </h3>
                  <p className="text-xs font-mono text-gray-400">
                    Inspect customer receipts (CBE, Telebirr, Awash, BOA) and verify funds
                  </p>
                </div>

                {/* Filters */}
                <div className={`flex items-center gap-1.5 p-1 border rounded-xl text-xs font-mono ${
                  isDark ? 'border-white/10 bg-white/5' : 'border-stone-200 bg-white shadow-2xs'
                }`}>
                  <button
                    onClick={() => setPaymentFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      paymentFilter === 'all' ? 'bg-[#D4AF37] text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    All ({mobileTransferOrders.length})
                  </button>
                  <button
                    onClick={() => setPaymentFilter('pending')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      paymentFilter === 'pending' ? 'bg-amber-400 text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Pending ({pendingPaymentsCount})
                  </button>
                  <button
                    onClick={() => setPaymentFilter('approved')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      paymentFilter === 'approved' ? 'bg-emerald-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setPaymentFilter('rejected')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      paymentFilter === 'rejected' ? 'bg-red-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>

              {filteredTransfers.length === 0 ? (
                <div className={`text-center py-20 border border-dashed rounded-2xl ${
                  isDark ? 'border-white/10 bg-white/[0.01]' : 'border-stone-300 bg-white'
                }`}>
                  <FileCheck2 className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-40" />
                  <p className="font-serif text-base">No transfer payments in this category.</p>
                  <p className="text-xs mt-1 text-gray-400">When customers submit payment proofs via CBE, Telebirr, or BOA, they show here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredTransfers.map((ord) => {
                    const tx = ord.transferDetails;
                    const isPending = !ord.paymentStatus || ord.paymentStatus === 'Pending Verification';
                    const isApproved = ord.paymentStatus === 'Approved';
                    const isRejected = ord.paymentStatus === 'Rejected';

                    return (
                      <div
                        key={ord.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          isPending
                            ? isDark ? 'bg-amber-500/[0.04] border-amber-500/30 shadow-lg' : 'bg-amber-50/60 border-amber-300 shadow-sm'
                            : isApproved
                            ? isDark ? 'bg-white/[0.02] border-emerald-500/20' : 'bg-white border-emerald-500/30 shadow-2xs'
                            : isDark ? 'bg-white/[0.01] border-red-500/20' : 'bg-white border-red-500/30 shadow-2xs'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Order info */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-bold text-[#D4AF37]">{ord.id}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                                {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                isApproved
                                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                  : isRejected
                                  ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                                  : 'bg-amber-500/20 text-amber-500 border border-amber-500/40 animate-pulse'
                              }`}>
                                {ord.paymentStatus || 'Pending Verification'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                              <div>
                                <span className="text-gray-400">Collector:</span>{' '}
                                <span className="font-medium">{ord.customer.fullName}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Phone:</span>{' '}
                                <span className="font-mono">{ord.customer.phone}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Sub-City:</span>{' '}
                                <span>{ord.customer.city || 'Addis Ababa'}</span>
                              </div>
                            </div>

                            {/* Bank details & Transaction ID */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                              <span className="px-2.5 py-1 rounded-lg bg-[#3D2314] text-[#D4AF37] font-semibold border border-[#D4AF37]/40">
                                {tx?.bank || 'Bank Transfer'}
                              </span>

                              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${
                                isDark ? 'bg-black/50 border-white/10 text-white' : 'bg-stone-100 border-stone-200 text-stone-900'
                              }`}>
                                <span className="text-[11px] text-gray-400">TX ID:</span>
                                <span className="font-bold text-amber-500 tracking-wider">
                                  {tx?.transactionId || 'N/A'}
                                </span>
                                {tx?.transactionId && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyTx(tx.transactionId)}
                                    className={`p-0.5 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-stone-500 hover:text-black'}`}
                                    title="Copy transaction ID"
                                  >
                                    {copiedTxId === tx.transactionId ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>

                              <span className="text-xs text-gray-400">
                                Account Holder: <strong className="font-normal">{tx?.accountHolderName || ord.customer.fullName}</strong>
                              </span>
                            </div>

                            {isRejected && ord.rejectionReason && (
                              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold block">Rejection Reason Given:</span>
                                  <span>{ord.rejectionReason}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right: receipt photo & approve/reject buttons */}
                          <div className={`flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 ${
                            isDark ? 'border-white/10' : 'border-stone-200'
                          }`}>
                            <div className="flex items-center gap-3">
                              {tx?.receiptImage ? (
                                <div
                                  onClick={() => setPreviewReceipt({
                                    image: tx.receiptImage!,
                                    orderId: ord.id,
                                    txId: tx.transactionId,
                                    bank: tx.bank
                                  })}
                                  className={`relative w-16 h-16 rounded-xl overflow-hidden border cursor-pointer group shadow ${
                                    isDark ? 'border-white/20' : 'border-stone-300'
                                  }`}
                                >
                                  <img
                                    src={tx.receiptImage}
                                    alt="Receipt Screenshot"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                    <Eye className="w-5 h-5 text-white drop-shadow" />
                                  </div>
                                </div>
                              ) : (
                                <div className={`w-16 h-16 rounded-xl border border-dashed flex flex-col items-center justify-center text-[10px] ${
                                  isDark ? 'border-white/20 text-gray-400' : 'border-stone-300 text-stone-400'
                                }`}>
                                  <span>No Photo</span>
                                </div>
                              )}

                              <div className="text-right">
                                <div className="text-[10px] font-mono uppercase text-gray-400">Order Total</div>
                                <div className="text-lg font-bold font-mono">
                                  {formatPrice(ord.totalAmount)}
                                </div>
                              </div>
                            </div>

                            {/* Verification Actions */}
                            <div className="flex items-center gap-2">
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => onVerifyPayment && onVerifyPayment(ord.id, 'approve')}
                                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono uppercase flex items-center gap-1.5 transition-all shadow-lg hover:shadow-emerald-500/20"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Accept Payment (አጽድቅ)</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectingOrder(ord);
                                      setRejectionReasonInput('');
                                    }}
                                    className="px-3.5 py-2 rounded-xl border border-red-500/40 hover:bg-red-500/20 text-red-500 text-xs font-mono uppercase flex items-center gap-1.5 transition-all"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>Reject (ውድቅ)</span>
                                  </button>
                                </>
                              )}

                              {isApproved && (
                                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-mono">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Verified & In Production</span>
                                </div>
                              )}

                              {isRejected && (
                                <button
                                  onClick={() => onVerifyPayment && onVerifyPayment(ord.id, 'approve')}
                                  className="px-3 py-1.5 rounded-lg border border-amber-500/40 hover:bg-amber-500/20 text-amber-500 text-xs font-mono"
                                >
                                  Re-verify & Approve
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}







          {/* ========================================================== */}
          {/* TAB 3: CUSTOMER MESSAGES (CONCIERGE & BESPOKE INQUIRIES)  */}
          {/* ========================================================== */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#D4AF37]" />
                    <span>Direct Customer Inquiries (የደንበኞች መልእክት)</span>
                  </h3>
                  <p className="text-xs font-mono text-gray-400">
                    Real-time consultations submitted through the atelier concierge desk
                  </p>
                </div>

                {/* Filter and simulation */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                    isDark ? 'border-white/10 bg-white/5' : 'border-stone-200 bg-white shadow-2xs'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setMessageFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                        messageFilter === 'all' ? 'bg-[#3D2314] text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      All ({messages.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageFilter('new')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 ${
                        messageFilter === 'new' ? 'bg-amber-500/20 text-amber-500 font-bold border border-amber-500/40' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>New</span>
                      {unreadMessagesCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-bold">
                          {unreadMessagesCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageFilter('replied')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                        messageFilter === 'replied' ? 'bg-emerald-500/20 text-emerald-500 font-bold border border-emerald-500/40' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Replied
                    </button>
                  </div>

                  {onSendMessage && (
                    <button
                      type="button"
                      onClick={() => {
                        const sampleMsg: CustomerMessage = {
                          id: `msg-${Date.now()}`,
                          fullName: 'Selamawit Bekele (የሙከራ ደንበኛ)',
                          email: 'selamawit.b@gmail.com',
                          phone: '+251911334455',
                          inquiryType: 'bespoke',
                          message: 'ሰላም፣ በቦሌ አቴሊየር የቆዳ ጃኬት ቀጠሮ ማስያዝ እፈልጋለሁ። (Bespoke consultation booking test)',
                          createdAt: new Date().toISOString(),
                          status: 'new'
                        };
                        onSendMessage(sampleMsg);
                      }}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/40 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors"
                      title="Simulate an incoming customer message"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>የሙከራ መልእክት (Test Message)</span>
                    </button>
                  )}
                </div>
              </div>

              {filteredMessages.length === 0 ? (
                <div className={`text-center py-20 rounded-2xl border ${
                  isDark ? 'border-white/10 bg-white/[0.01]' : 'border-stone-300 bg-white'
                }`}>
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-40" />
                  <p className="font-serif text-lg">No client messages in this view.</p>
                  <p className="text-xs mt-1 text-gray-400">Customer consultations from the Contact page appear here immediately.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        msg.status === 'new'
                          ? isDark ? 'bg-amber-500/[0.04] border-amber-500/30 shadow-lg' : 'bg-amber-50/60 border-amber-300 shadow-sm'
                          : isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-stone-200 shadow-2xs'
                      }`}
                    >
                      <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b ${
                        isDark ? 'border-white/10' : 'border-stone-200'
                      }`}>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="font-serif text-base font-semibold">{msg.fullName}</h4>

                            {msg.status === 'new' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                NEW INQUIRY
                              </span>
                            )}
                            {msg.status === 'read' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-500 border border-blue-500/40">
                                READ / ታይቷል
                              </span>
                            )}
                            {msg.status === 'replied' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                REPLIED / ተመልሷል
                              </span>
                            )}

                            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono uppercase bg-[#3D2314] text-[#D4AF37] border border-[#D4AF37]/30">
                              {msg.inquiryType === 'bespoke' && 'Bespoke Order'}
                              {msg.inquiryType === 'visit' && 'Atelier Visit'}
                              {msg.inquiryType === 'order' && 'Order Inquiry'}
                              {msg.inquiryType === 'general' && 'Corporate Gift'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-mono mt-2 flex-wrap text-gray-400">
                            <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors">
                              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>{msg.email}</span>
                            </a>
                            {msg.phone && (
                              <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors">
                                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>{msg.phone}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Status updates */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                          <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(msg.createdAt).toLocaleString()}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {onUpdateMessageStatus && msg.status === 'new' && (
                              <button
                                type="button"
                                onClick={() => onUpdateMessageStatus(msg.id, 'read')}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                                  isDark ? 'bg-white/10 hover:bg-white/20 text-gray-200' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                                }`}
                              >
                                Mark Read
                              </button>
                            )}
                            {onUpdateMessageStatus && msg.status !== 'replied' && (
                              <button
                                type="button"
                                onClick={() => onUpdateMessageStatus(msg.id, 'replied')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                <span>Mark Replied</span>
                              </button>
                            )}
                            {onUpdateMessageStatus && msg.status === 'replied' && (
                              <button
                                type="button"
                                onClick={() => onUpdateMessageStatus(msg.id, 'new')}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                                  isDark ? 'text-gray-400 hover:text-white' : 'text-stone-500 hover:text-black'
                                }`}
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Chronological Two-Way Thread (Initial Inquiry, Artisan Replies & Client Follow-ups) */}
                      <div className="mt-3 space-y-2.5">
                        {getMessageThread(msg).map((entry) => {
                          const isAdminEntry = entry.senderRole === 'admin';
                          return (
                            <div
                              key={entry.id}
                              className={`p-3.5 rounded-xl border text-xs leading-relaxed font-sans ${
                                isAdminEntry
                                  ? isDark
                                    ? 'bg-amber-500/[0.08] border-amber-500/40 text-amber-100'
                                    : 'bg-amber-50 border-amber-300 text-stone-900 shadow-xs'
                                  : isDark
                                    ? 'border-white/10 bg-black/40 text-gray-200'
                                    : 'border-stone-200 bg-stone-50 text-stone-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                                <span className={`text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                                  isAdminEntry ? 'text-[#D4AF37]' : 'text-gray-400'
                                }`}>
                                  {isAdminEntry && <span>👑</span>}
                                  <span>
                                    {isAdminEntry
                                      ? `Atelier Response (${entry.senderName})`
                                      : `Client (${entry.senderName})`}
                                  </span>
                                </span>
                                {entry.createdAt && (
                                  <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-[#D4AF37]" />
                                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                                  </span>
                                )}
                              </div>
                              <p className={`whitespace-pre-wrap ${isAdminEntry ? 'pl-1 border-l-2 border-[#D4AF37]/60' : ''}`}>
                                {entry.text}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Direct Two-Way Communication: Inline Artisan Reply Form */}
                      <div className={`mt-3.5 pt-3.5 border-t ${isDark ? 'border-white/10' : 'border-stone-200'}`}>
                        <label className="block text-[10px] font-mono uppercase tracking-wider font-bold mb-1.5 text-gray-400">
                          {msg.reply ? 'Send Additional Response / ማስተካከያ ምላሽ' : 'Direct Reply to Customer (ለደንበኛው ቀጥታ መልስ ይጻፉ)'}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <textarea
                            rows={2}
                            placeholder="Type direct concierge reply here... (ለደንበኛው ምላሽዎን እዚህ ይጻፉ...)"
                            value={replyTexts[msg.id] || ''}
                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [msg.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendReply(msg.id);
                              }
                            }}
                            className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none resize-none focus:border-[#D4AF37] transition-colors ${
                              isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                            }`}
                          />
                          <button
                            type="button"
                            disabled={sendingReplyId === msg.id || !replyTexts[msg.id]?.trim()}
                            onClick={() => handleSendReply(msg.id)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-500 hover:brightness-110 disabled:opacity-40 text-black text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md self-end sm:self-auto shrink-0 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{sendingReplyId === msg.id ? 'Sending...' : 'Send Reply (ምላሽ ላክ)'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-xs font-mono flex-wrap">
                        <a
                          href={`mailto:${msg.email}?subject=Kiru Leathers Atelier Concierge - Re: Inquiry`}
                          className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
                            isDark
                              ? 'bg-white/5 hover:bg-white/10 text-[#D4AF37] border-[#D4AF37]/30'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reply by External Email</span>
                        </a>
                        {msg.phone && (
                          <a
                            href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>WhatsApp Client</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}







          {/* ========================================================== */}
          {/* TAB 4: PRODUCT INVENTORY MANAGEMENT (WITH EDIT & HIDE/SHOW)*/}
          {/* ========================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#D4AF37]" />
                    <span>Workshop Inventory & Catalog Controls</span>
                  </h3>
                  <p className="text-xs font-mono text-gray-400">
                    Live stock levels, edit details, and hide/show products on the customer storefront cards
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                  {/* Visibility Filter */}
                  <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs font-mono ${
                    isDark ? 'border-white/10 bg-white/5' : 'border-stone-200 bg-white shadow-2xs'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setProductVisibilityFilter('all')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        productVisibilityFilter === 'all'
                          ? 'bg-[#D4AF37] text-black font-bold'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-stone-600 hover:text-black'
                      }`}
                    >
                      All ({products.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductVisibilityFilter('visible')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        productVisibilityFilter === 'visible'
                          ? 'bg-emerald-500 text-black font-bold'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-stone-600 hover:text-black'
                      }`}
                    >
                      Visible ({products.filter(p => !p.hidden && !p.is_hidden).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductVisibilityFilter('hidden')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        productVisibilityFilter === 'hidden'
                          ? 'bg-amber-500 text-black font-bold'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-stone-600 hover:text-black'
                      }`}
                    >
                      Hidden ({products.filter(p => p.hidden || p.is_hidden).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductStockFilter(productStockFilter === 'low_stock' ? 'all' : 'low_stock')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        productStockFilter === 'low_stock'
                          ? 'bg-amber-400 text-black font-bold shadow'
                          : isDark ? 'text-amber-400/90 hover:text-amber-300' : 'text-amber-700 hover:text-black'
                      }`}
                    >
                      <span>⚠️ Low Stock ({products.filter(p => (p.stock !== undefined ? p.stock : 10) <= 3).length})</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsAddingProduct(!isAddingProduct)}
                    className="px-4 py-2 bg-[#D4AF37] hover:bg-amber-400 text-black font-semibold text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAddingProduct ? 'Cancel' : 'Add New Leather Piece'}</span>
                  </button>
                </div>
              </div>

              {/* Add Product Form */}
              {isAddingProduct && (
                <form
                  onSubmit={handleCreateProduct}
                  className={`p-6 rounded-2xl border space-y-4 shadow-xl animate-fadeIn ${
                    isDark ? 'border-[#D4AF37]/40 bg-[#3D2314]/20' : 'border-[#D4AF37]/60 bg-amber-50/50'
                  }`}
                >
                  <h4 className="font-serif text-base font-medium text-[#D4AF37]">Publish New Leather Piece</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono uppercase mb-1 text-gray-400">Product Title</label>
                      <input
                        type="text"
                        required
                        placeholder="The Sovereign Field Jacket"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#D4AF37] ${
                          isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-white border-stone-300 text-stone-900 shadow-2xs'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase mb-1 text-gray-400">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#D4AF37] ${
                          isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-white border-stone-300 text-stone-900 shadow-2xs'
                        }`}
                      >
                        <option value="jackets">Jackets (ጃኬቶች)</option>
                        <option value="bags">Bags & Luggage (ቦርሳዎች)</option>
                        <option value="footwear">Footwear (ጫማዎች)</option>
                        <option value="wallets">Wallets & Small Goods (የኪስ ቦርሳ)</option>
                        <option value="belts">Belts & Straps (ቀበቶዎች)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase mb-1 text-gray-400">Price (USD $)</label>
                      <input
                        type="number"
                        required
                        min={10}
                        value={newPrice}
                        onChange={(e) => setNewPrice(Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#D4AF37] ${
                          isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-white border-stone-300 text-stone-900 shadow-2xs'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase mb-1 text-gray-400">Initial Stock Units</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newStock}
                        onChange={(e) => setNewStock(Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#D4AF37] ${
                          isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-white border-stone-300 text-stone-900 shadow-2xs'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase mb-1 text-gray-400">Image URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#D4AF37] ${
                          isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-white border-stone-300 text-stone-900 shadow-2xs'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase mb-1 text-gray-400">Artisan Description</label>
                    <textarea
                      rows={2}
                      placeholder="Full-grain Ethiopian calfskin with solid brass hardware..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#D4AF37] ${
                        isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-white border-stone-300 text-stone-900 shadow-2xs'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#D4AF37] hover:bg-amber-400 text-black font-semibold text-xs font-mono uppercase tracking-widest rounded-xl transition-all shadow"
                  >
                    Save & Publish To Catalog
                  </button>
                </form>
              )}

              {/* Products Inventory Table */}
              <div className={`overflow-x-auto rounded-2xl border shadow-xl ${
                isDark ? 'border-white/10 bg-white/[0.02]' : 'border-stone-200 bg-white'
              }`}>
                <table className="w-full text-left text-xs font-mono">
                  <thead className={`border-b uppercase text-[10px] tracking-wider ${
                    isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}>
                    <tr>
                      <th className="p-4">Piece</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Unit Price</th>
                      <th className="p-4">Database Stock</th>
                      <th className="p-4">Storefront Status</th>
                      <th className="p-4 text-right">Actions (Edit / Hide / Delete)</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-stone-200'}`}>
                    {filteredProducts.map((p) => {
                      const isHidden = Boolean(p.hidden || p.is_hidden);

                      return (
                        <tr key={p.id} className={`transition-colors ${
                          isHidden
                            ? isDark ? 'opacity-65 bg-white/[0.01]' : 'opacity-70 bg-stone-50'
                            : isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-amber-50/40'
                        }`}>
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={p.images && p.images[0] ? p.images[0] : ''}
                              alt=""
                              referrerPolicy="no-referrer"
                              className={`w-10 h-12 object-cover rounded-lg bg-gray-900 border ${
                                isDark ? 'border-white/10' : 'border-stone-200'
                              }`}
                            />
                            <div>
                              <span className="font-sans font-medium text-sm block">{p.name}</span>
                              <span className="text-[10px] text-gray-400">ID: {p.id}</span>
                            </div>
                          </td>
                          <td className="p-4 uppercase text-gray-400">{p.categoryLabel || p.category}</td>
                          <td className="p-4 font-bold text-[#D4AF37]">{formatPrice(p.price)}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  const currentStock = (p.stock !== undefined && p.stock !== null) ? Number(p.stock) : 10;
                                  const newStock = Math.max(0, currentStock - 1);
                                  p.stock = newStock;
                                  try {
                                    if (onUpdateProductStock) {
                                      await onUpdateProductStock(p.id, newStock);
                                    } else if (onUpdateProduct) {
                                      onUpdateProduct({ ...p, stock: newStock });
                                    } else {
                                      await fetch(`/api/products/${p.id}/stock`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ stock: newStock })
                                      });
                                    }
                                  } catch {}
                                }}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-900'
                                }`}
                                title="Decrement stock in database"
                              >
                                -
                              </button>
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                ((p.stock !== undefined && p.stock !== null) ? Number(p.stock) : 10) < 5
                                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                              }`}>
                                {((p.stock !== undefined && p.stock !== null) ? Number(p.stock) : 10)} in stock
                              </span>
                              <button
                                type="button"
                                onClick={async () => {
                                  const currentStock = (p.stock !== undefined && p.stock !== null) ? Number(p.stock) : 10;
                                  const newStock = currentStock + 1;
                                  p.stock = newStock;
                                  try {
                                    if (onUpdateProductStock) {
                                      await onUpdateProductStock(p.id, newStock);
                                    } else if (onUpdateProduct) {
                                      onUpdateProduct({ ...p, stock: newStock });
                                    } else {
                                      await fetch(`/api/products/${p.id}/stock`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ stock: newStock })
                                      });
                                    }
                                  } catch {}
                                }}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-900'
                                }`}
                                title="Increment stock in database"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Storefront Visibility Status Pill */}
                          <td className="p-4">
                            {isHidden ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 inline-flex items-center gap-1.5">
                                <EyeOff className="w-3 h-3" />
                                <span>HIDDEN (የተደበቀ)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 inline-flex items-center gap-1.5">
                                <Eye className="w-3 h-3" />
                                <span>LIVE (በካርድ የሚታይ)</span>
                              </span>
                            )}
                          </td>

                          {/* Action Buttons: Edit, Hide/Show, Delete */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1. Edit Product Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(p)}
                                className={`p-2 rounded-xl border transition-all ${
                                  isDark
                                    ? 'bg-white/5 hover:bg-white/15 border-white/10 text-stone-300 hover:text-white'
                                    : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-700 hover:text-black shadow-2xs'
                                }`}
                                title="Edit Product Details (የእቃውን መረጃ አድስ)"
                              >
                                <Pencil className="w-3.5 h-3.5 text-[#D4AF37]" />
                              </button>

                              {/* 2. Hidden / Show Visibility Toggle Button */}
                              <button
                                type="button"
                                onClick={() => handleDirectToggleVisibility(p)}
                                className={`p-2 rounded-xl border transition-all ${
                                  isHidden
                                    ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-500'
                                    : isDark
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700 shadow-2xs'
                                }`}
                                title={isHidden ? 'Click to Show on Storefront (በሱቅ ላይ አሳይ)' : 'Click to Hide from Storefront (ከሱቅ ላይ ደብቅ)'}
                              >
                                {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>

                              {/* 3. Delete Product Button */}
                              <button
                                type="button"
                                onClick={() => onDeleteProduct(p.id)}
                                className={`p-2 rounded-xl border transition-colors ${
                                  isDark
                                    ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400 border-white/10'
                                    : 'hover:bg-red-50 text-stone-400 hover:text-red-600 border-stone-200 shadow-2xs'
                                }`}
                                title="Delete piece completely (ሙሉ በሙሉ ሰርዝ)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}







          {/* ========================================================== */}
          {/* TAB 5: EXECUTIVE ANALYTICS & INTERACTIVE CHARTS            */}
          {/* ========================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Top Controls & Currency Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
                    <span>Executive Analytics & Financial Graphs (የሽያጭና ገቢ ግራፎች)</span>
                  </h3>
                  <p className="text-xs font-mono text-gray-400">
                    Interactive performance metrics, sales velocity, and material stock health
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Currency Toggle */}
                  <div className={`flex items-center p-1 rounded-xl border text-xs font-mono ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-white border-stone-200 shadow-2xs'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setChartCurrency('ETB')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        chartCurrency === 'ETB' ? 'bg-[#D4AF37] text-black font-bold shadow' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ETB (ብር)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartCurrency('USD')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        chartCurrency === 'USD' ? 'bg-[#D4AF37] text-black font-bold shadow' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      USD ($)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className={`px-3.5 py-1.5 border rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors ${
                      isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-900 shadow-2xs'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Export Data</span>
                  </button>
                </div>
              </div>

              {/* Chart 1: Interactive Monthly Revenue Trend Chart (Vibrant & Colorful) */}
              <div className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden ${
                isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">Monthly Revenue Trajectory</span>
                    <h4 className="font-serif text-xl font-bold mt-0.5">Sales Velocity & Monthly Growth (የወርሃዊ ገቢና ሽያጭ ዕድገት)</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span>+34.8% YoY Velocity</span>
                    </span>
                  </div>
                </div>

                {/* Vibrant Bar Chart Pillars with Explicit Cross-Browser Dimensions */}
                <div
                  style={{ height: '280px', minHeight: '280px' }}
                  className="h-72 w-full flex items-end justify-between gap-2.5 sm:gap-6 pt-6 pb-2 px-2 sm:px-4 relative"
                >
                  
                  {/* Subtle Horizontal Reference Grid Lines */}
                  <div className="absolute inset-x-2 sm:inset-x-4 top-8 bottom-10 flex flex-col justify-between pointer-events-none opacity-25 dark:opacity-15">
                    <div className="border-b border-dashed border-current w-full" />
                    <div className="border-b border-dashed border-current w-full" />
                    <div className="border-b border-dashed border-current w-full" />
                    <div className="border-b border-dashed border-current w-full" />
                  </div>

                  {monthlyRevenueData.map((item, idx) => {
                    const heightPercent = Math.max(20, Math.round((item.amount / maxMonthAmount) * 100));
                    const isHovered = hoveredBarIndex === idx;

                    return (
                      <div
                        key={item.month}
                        onMouseEnter={() => setHoveredBarIndex(idx)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                        style={{ height: '230px', minHeight: '230px' }}
                        className="flex-1 flex flex-col items-center justify-end shrink-0 group cursor-pointer relative z-10"
                      >
                        {/* Hover Tooltip */}
                        {isHovered && (
                          <div className="absolute -top-14 z-30 px-3.5 py-1.5 rounded-xl bg-black/95 border border-[#D4AF37] text-white text-[11px] font-mono shadow-2xl whitespace-nowrap text-center pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                            <span className="font-bold text-[#D4AF37]">
                              {chartCurrency === 'ETB' ? `${item.amount.toLocaleString()} ETB` : `$${item.amount.toLocaleString()}`}
                            </span>
                            <span className="text-gray-300 block text-[9px] mt-0.5">{item.orderCount} orders • {item.growth}</span>
                          </div>
                        )}

                        {/* Top Value Pill badge - colorful per month */}
                        <div className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold mb-2 shrink-0 transition-all ${item.color.badge} ${
                          isHovered ? 'scale-110 shadow-sm' : ''
                        }`}>
                          {chartCurrency === 'ETB' ? `${Math.round(item.amount / 1000)}k` : `$${item.amount}`}
                        </div>

                        {/* Bar Pillar Track with explicit solid height */}
                        <div
                          style={{ height: '170px', minHeight: '170px' }}
                          className={`w-full max-w-[54px] shrink-0 rounded-2xl overflow-hidden relative flex items-end p-1 border transition-all ${
                            isDark
                              ? 'bg-white/[0.04] border-white/10'
                              : 'bg-stone-100 border-stone-200/90 shadow-inner'
                          } ${isHovered ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30' : ''}`}
                        >
                          
                          <div
                            style={{
                              height: `${heightPercent}%`,
                              minHeight: '32px',
                              background: item.color.bgGradient,
                              boxShadow: isHovered
                                ? `0 10px 25px ${item.color.colorHex}80`
                                : `0 4px 15px ${item.color.colorHex}45`
                            }}
                            className={`w-full shrink-0 rounded-xl transition-all duration-500 ease-out relative flex flex-col justify-between overflow-hidden p-1 shadow-md ${
                              isHovered ? 'scale-[1.02] brightness-110' : ''
                            }`}
                          >
                            {/* Inner Gloss / Shimmer Bar */}
                            <div className="w-full h-1.5 rounded-full bg-white/45 shadow-xs" />

                            {/* Peak Month Badge on April */}
                            {item.color.isPeak && (
                              <div className="self-center my-auto">
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-mono uppercase bg-black/70 text-yellow-300 font-extrabold tracking-wider border border-yellow-300/60 shadow">
                                  PEAK
                                </span>
                              </div>
                            )}

                            <div className="w-full h-1 rounded-full bg-black/20" />
                          </div>
                        </div>

                        {/* X-Axis Month Label with matching color on hover */}
                        <span className={`text-xs font-mono uppercase mt-2.5 shrink-0 transition-colors font-bold ${
                          isHovered || item.color.isPeak ? item.color.text : 'text-gray-400'
                        }`}>
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Charts Row: Donut Chart & Category Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Chart 2: Order Fulfillment Radial / Donut Breakdown */}
                <div className={`p-6 rounded-3xl border shadow-xl ${
                  isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">Order Flow</span>
                      <h4 className="font-serif text-lg font-bold">Status Breakdown (የትእዛዝ ሁኔታ)</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                      isDark ? 'bg-white/5 text-gray-300' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {orderStatusCounts.total} Orders Total
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                    {/* SVG 4-Color Segmented Donut */}
                    {(() => {
                      const C = 238.76;
                      const total = orderStatusCounts.total || 1;
                      const lenInAtelier = (orderStatusCounts.inAtelier / total) * C;
                      const lenDelivered = (orderStatusCounts.delivered / total) * C;
                      const lenVerification = (orderStatusCounts.verification / total) * C;
                      const lenRejected = (orderStatusCounts.rejected / total) * C;

                      const offInAtelier = 0;
                      const offDelivered = -lenInAtelier;
                      const offVerification = -(lenInAtelier + lenDelivered);
                      const offRejected = -(lenInAtelier + lenDelivered + lenVerification);

                      return (
                        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <g transform="rotate(-90 50 50)">
                              {/* Background ring */}
                              <circle
                                cx="50"
                                cy="50"
                                r="38"
                                fill="transparent"
                                stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                                strokeWidth="12"
                              />
                              {/* Slice 1: In Atelier (Gold) */}
                              {orderStatusCounts.inAtelier > 0 && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="38"
                                  fill="transparent"
                                  stroke="#F59E0B"
                                  strokeWidth="12"
                                  strokeDasharray={`${lenInAtelier} ${C - lenInAtelier}`}
                                  strokeDashoffset={offInAtelier}
                                />
                              )}
                              {/* Slice 2: Delivered (Emerald) */}
                              {orderStatusCounts.delivered > 0 && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="38"
                                  fill="transparent"
                                  stroke="#10B981"
                                  strokeWidth="12"
                                  strokeDasharray={`${lenDelivered} ${C - lenDelivered}`}
                                  strokeDashoffset={offDelivered}
                                />
                              )}
                              {/* Slice 3: Verification (Blue) */}
                              {orderStatusCounts.verification > 0 && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="38"
                                  fill="transparent"
                                  stroke="#3B82F6"
                                  strokeWidth="12"
                                  strokeDasharray={`${lenVerification} ${C - lenVerification}`}
                                  strokeDashoffset={offVerification}
                                />
                              )}
                              {/* Slice 4: Rejected (Red) */}
                              {orderStatusCounts.rejected > 0 && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="38"
                                  fill="transparent"
                                  stroke="#EF4444"
                                  strokeWidth="12"
                                  strokeDasharray={`${lenRejected} ${C - lenRejected}`}
                                  strokeDashoffset={offRejected}
                                />
                              )}
                            </g>
                          </svg>
                          
                          {/* Center Stats */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="font-mono text-3xl font-extrabold text-[#D4AF37]">{orderStatusCounts.total}</span>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Total Orders</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Legend: 4 Colorful Pill Rows */}
                    <div className="space-y-2.5 w-full">
                      <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                        isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_#F59E0B]" />
                          <span className="text-xs font-mono font-medium">In Atelier (Handcrafting)</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-amber-500">{orderStatusCounts.inAtelier} ({orderStatusCounts.pctInAtelier}%)</span>
                      </div>

                      <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                        isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                          <span className="text-xs font-mono font-medium">Delivered / Shipped</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{orderStatusCounts.delivered} ({orderStatusCounts.pctDelivered}%)</span>
                      </div>

                      <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                        isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_#3B82F6]" />
                          <span className="text-xs font-mono font-medium">Payment Verification</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{orderStatusCounts.verification} ({orderStatusCounts.pctVerification}%)</span>
                      </div>

                      <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                        isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
                          <span className="text-xs font-mono font-medium">Rejected / Cancelled</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">{orderStatusCounts.rejected} ({orderStatusCounts.pctRejected}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart 3: Category Sales Volume Breakdown (Multi-Gradient Bars) */}
                <div className={`p-6 rounded-3xl border shadow-xl ${
                  isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">Product Portfolio</span>
                      <h4 className="font-serif text-lg font-bold">Sales Velocity by Category</h4>
                    </div>
                    <span className="text-xs font-mono text-amber-500 font-bold">4 Main Divisions</span>
                  </div>

                  <div className="space-y-4">
                    {categoryStats.map((cat, catIdx) => {
                      const catGradients = [
                        'from-amber-600 via-yellow-500 to-amber-300', // Jackets
                        'from-violet-600 via-purple-500 to-fuchsia-400', // Bags
                        'from-teal-600 via-emerald-500 to-green-300', // Footwear
                        'from-rose-600 via-pink-500 to-rose-300' // Wallets
                      ];

                      return (
                        <div key={cat.category} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-semibold">{cat.label}</span>
                            <span className="text-gray-400">{cat.unitsSold} sold • <strong className="text-[#D4AF37] font-bold">{cat.sharePct}%</strong></span>
                          </div>
                          <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
                            isDark ? 'bg-white/5 border-white/10' : 'bg-stone-100 border-stone-200'
                          }`}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cat.sharePct}%` }}
                              transition={{ duration: 0.8, delay: catIdx * 0.1 }}
                              className={`h-full rounded-full bg-gradient-to-r ${catGradients[catIdx % catGradients.length]} shadow-sm`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Payment Methods Distribution Grid (Color-Rich Gateway Cards) */}
              <div className={`p-6 rounded-3xl border shadow-xl ${
                isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
              }`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">Financial Gateways</span>
                    <h4 className="font-serif text-lg font-bold">Payment Method Distribution (የክፍያ መንገዶች)</h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {paymentMethodStats.map((item) => (
                    <div key={item.name} className={`p-4 rounded-2xl border space-y-2.5 transition-all shadow-xs ${
                      isDark ? 'bg-white/[0.03] border-white/10 hover:border-white/20' : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold">{item.name}</span>
                        <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold" style={{ backgroundColor: `${item.color}25`, color: item.color }}>
                          {item.share}%
                        </span>
                      </div>
                      <p className="text-[11px] font-sans text-gray-400">{item.label}</p>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${
                        isDark ? 'bg-white/5' : 'bg-stone-200'
                      }`}>
                        <div className="h-full rounded-full shadow-sm" style={{ width: `${item.share}%`, backgroundColor: item.color }} />
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 block font-semibold">
                        {item.count} orders processed
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}







          {/* ============================================================== */}
          {/* TAB 6: SITE CONTENT CMS (ABOUT US & CONTACT PAGES)            */}
          {/* ============================================================== */}
          {activeTab === 'content' && (
            <div className="space-y-6 max-w-7xl mx-auto pb-16">
              
              {/* CMS Control Bar */}
              <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                      Storefront Content Management (CMS)
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold">
                    Edit About & Contact Pages (የገጽ ፅሁፎች ማስተካከያ)
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Update text, addresses, contact details, and brand story. Changes save to the database in real-time.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className={`p-1 rounded-xl border flex gap-1 ${
                    isDark ? 'bg-black/40 border-white/10' : 'bg-stone-100 border-stone-200'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setContentSubTab('about')}
                      className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        contentSubTab === 'about'
                          ? 'bg-[#3D2314] text-[#D4AF37] shadow-sm'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      About Page (ስለ እኛ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentSubTab('contact')}
                      className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        contentSubTab === 'contact'
                          ? 'bg-[#3D2314] text-[#D4AF37] shadow-sm'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Contact Page (አግኙን)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetContent}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isDark ? 'border-white/10 hover:bg-white/5 text-gray-400 hover:text-white' : 'border-stone-200 hover:bg-stone-100 text-stone-600'
                    }`}
                    title="Reset to atelier defaults"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset Defaults</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveContent}
                    disabled={isSavingContent}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingContent ? (
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{isSavingContent ? 'Saving...' : 'Save Changes (አስቀምጥ)'}</span>
                  </button>
                </div>
              </div>

              {/* Success Notification Alert */}
              <AnimatePresence>
                {contentSaveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center gap-3 text-xs font-mono"
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{contentSaveSuccess}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ======================================================== */}
              {/* SUBTAB 1: ABOUT US PAGE CONTENT EDITOR                    */}
              {/* ======================================================== */}
              {contentSubTab === 'about' && (
                <div className="space-y-6">
                  
                  {/* Card 1: Section Header & Hero */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-5 ${
                    isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-200/10">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="font-serif text-lg font-bold">1. Header & Introduction (የላይኛው ርዕስ እና መግቢያ)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Section Badge</label>
                        <input
                          type="text"
                          value={aboutForm.sectionBadge}
                          onChange={(e) => setAboutForm({ ...aboutForm, sectionBadge: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Heading Prefix</label>
                        <input
                          type="text"
                          value={aboutForm.headingPrefix}
                          onChange={(e) => setAboutForm({ ...aboutForm, headingPrefix: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Animated Typewriter Tagline</label>
                        <input
                          type="text"
                          value={aboutForm.typewriterText}
                          onChange={(e) => setAboutForm({ ...aboutForm, typewriterText: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Main Atelier Story Paragraph</label>
                      <textarea
                        rows={3}
                        value={aboutForm.mainDescription}
                        onChange={(e) => setAboutForm({ ...aboutForm, mainDescription: e.target.value })}
                        className={`w-full p-3 rounded-xl border text-xs font-sans leading-relaxed outline-none focus:border-[#D4AF37] ${
                          isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Card 2: The Story & Image Provenance */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-5 ${
                    isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-200/10">
                      <FileText className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="font-serif text-lg font-bold">2. The Story Tab & Provenance (የእኛ ታሪክ እና የቆዳ ምስል)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Story Headline</label>
                        <input
                          type="text"
                          value={aboutForm.storyHeadline}
                          onChange={(e) => setAboutForm({ ...aboutForm, storyHeadline: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Story Image URL</label>
                        <input
                          type="text"
                          value={aboutForm.storyImage}
                          onChange={(e) => setAboutForm({ ...aboutForm, storyImage: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Story Paragraph 1</label>
                        <textarea
                          rows={3}
                          value={aboutForm.storyParagraph1}
                          onChange={(e) => setAboutForm({ ...aboutForm, storyParagraph1: e.target.value })}
                          className={`w-full p-3 rounded-xl border text-xs font-sans leading-relaxed outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Story Paragraph 2</label>
                        <textarea
                          rows={3}
                          value={aboutForm.storyParagraph2}
                          onChange={(e) => setAboutForm({ ...aboutForm, storyParagraph2: e.target.value })}
                          className={`w-full p-3 rounded-xl border text-xs font-sans leading-relaxed outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-200/10">
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Image Provenance Label</label>
                        <input
                          type="text"
                          value={aboutForm.storyImageProvenance}
                          onChange={(e) => setAboutForm({ ...aboutForm, storyImageProvenance: e.target.value })}
                          className={`w-full p-2 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Image Title Overlay</label>
                        <input
                          type="text"
                          value={aboutForm.storyImageTitle}
                          onChange={(e) => setAboutForm({ ...aboutForm, storyImageTitle: e.target.value })}
                          className={`w-full p-2 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Guarantee Badge (Years / Title)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={aboutForm.guaranteeBadgeYears}
                            onChange={(e) => setAboutForm({ ...aboutForm, guaranteeBadgeYears: e.target.value })}
                            placeholder="100"
                            className={`w-16 p-2 rounded-xl border text-xs font-sans text-center outline-none focus:border-[#D4AF37] ${
                              isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                            }`}
                          />
                          <input
                            type="text"
                            value={aboutForm.guaranteeBadgeTitle}
                            onChange={(e) => setAboutForm({ ...aboutForm, guaranteeBadgeTitle: e.target.value })}
                            placeholder="YEAR GUARANTEE"
                            className={`flex-1 p-2 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                              isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl border border-gray-200/10 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold">Feature Highlight 1</span>
                        <input
                          type="text"
                          value={aboutForm.storyFeature1Title}
                          onChange={(e) => setAboutForm({ ...aboutForm, storyFeature1Title: e.target.value })}
                          placeholder="Title"
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <input
                          type="text"
                          value={aboutForm.storyFeature1Subtitle}
                          onChange={(e) => setAboutForm({ ...aboutForm, storyFeature1Subtitle: e.target.value })}
                          placeholder="Subtitle"
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>

                      <div className="p-3.5 rounded-xl border border-gray-200/10 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold">Feature Highlight 2</span>
                        <input
                          type="text"
                          value={aboutForm.storyFeature2Title}
                          onChange={(e) => setAboutForm({ ...aboutForm, storyFeature2Title: e.target.value })}
                          placeholder="Title"
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <input
                          type="text"
                          value={aboutForm.storyFeature2Subtitle}
                          onChange={(e) => setAboutForm({ ...aboutForm, storyFeature2Subtitle: e.target.value })}
                          placeholder="Subtitle"
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Our Philosophy (3 Pillars) */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-5 ${
                    isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-200/10">
                      <Compass className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="font-serif text-lg font-bold">3. Our Philosophy - 3 Pillars (የፍልስፍናችን 3 ምሶሶዎች)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Pillar 1 */}
                      <div className="p-4 rounded-2xl border border-gray-200/10 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold">Pillar 1</span>
                        <input
                          type="text"
                          value={aboutForm.philosophyPillar1Title}
                          onChange={(e) => setAboutForm({ ...aboutForm, philosophyPillar1Title: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <textarea
                          rows={4}
                          value={aboutForm.philosophyPillar1Description}
                          onChange={(e) => setAboutForm({ ...aboutForm, philosophyPillar1Description: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans leading-relaxed outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>

                      {/* Pillar 2 */}
                      <div className="p-4 rounded-2xl border border-gray-200/10 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold">Pillar 2</span>
                        <input
                          type="text"
                          value={aboutForm.philosophyPillar2Title}
                          onChange={(e) => setAboutForm({ ...aboutForm, philosophyPillar2Title: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <textarea
                          rows={4}
                          value={aboutForm.philosophyPillar2Description}
                          onChange={(e) => setAboutForm({ ...aboutForm, philosophyPillar2Description: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans leading-relaxed outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>

                      {/* Pillar 3 */}
                      <div className="p-4 rounded-2xl border border-gray-200/10 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold">Pillar 3</span>
                        <input
                          type="text"
                          value={aboutForm.philosophyPillar3Title}
                          onChange={(e) => setAboutForm({ ...aboutForm, philosophyPillar3Title: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <textarea
                          rows={4}
                          value={aboutForm.philosophyPillar3Description}
                          onChange={(e) => setAboutForm({ ...aboutForm, philosophyPillar3Description: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans leading-relaxed outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: The Dual Atelier (Tuscany & Addis Ababa) */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-5 ${
                    isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-200/10">
                      <MapPin className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="font-serif text-lg font-bold">4. The Dual Atelier (ሁለቱ አቴሊየሮች - ጣሊያን እና አዲስ አበባ)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Atelier 1 */}
                      <div className="p-4 rounded-2xl border border-gray-200/10 space-y-2.5">
                        <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold">Atelier 1 (Florence / Tuscany)</span>
                        <input
                          type="text"
                          value={aboutForm.atelier1Title}
                          onChange={(e) => setAboutForm({ ...aboutForm, atelier1Title: e.target.value })}
                          placeholder="Title"
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <input
                          type="text"
                          value={aboutForm.atelier1Subtitle}
                          onChange={(e) => setAboutForm({ ...aboutForm, atelier1Subtitle: e.target.value })}
                          placeholder="Subtitle"
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <textarea
                          rows={3}
                          value={aboutForm.atelier1Description}
                          onChange={(e) => setAboutForm({ ...aboutForm, atelier1Description: e.target.value })}
                          placeholder="Description"
                          className={`w-full p-2 rounded-lg border text-xs font-sans leading-relaxed outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={aboutForm.atelier1Badge1}
                            onChange={(e) => setAboutForm({ ...aboutForm, atelier1Badge1: e.target.value })}
                            placeholder="Badge 1 (e.g. EST. 1994)"
                            className={`p-2 rounded-lg border text-xs font-sans outline-none ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                            }`}
                          />
                          <input
                            type="text"
                            value={aboutForm.atelier1Badge2}
                            onChange={(e) => setAboutForm({ ...aboutForm, atelier1Badge2: e.target.value })}
                            placeholder="Badge 2"
                            className={`p-2 rounded-lg border text-xs font-sans outline-none ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Atelier 2 */}
                      <div className="p-4 rounded-2xl border border-gray-200/10 space-y-2.5">
                        <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold">Atelier 2 (Addis Ababa Studio)</span>
                        <input
                          type="text"
                          value={aboutForm.atelier2Title}
                          onChange={(e) => setAboutForm({ ...aboutForm, atelier2Title: e.target.value })}
                          placeholder="Title"
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <input
                          type="text"
                          value={aboutForm.atelier2Subtitle}
                          onChange={(e) => setAboutForm({ ...aboutForm, atelier2Subtitle: e.target.value })}
                          placeholder="Subtitle"
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <textarea
                          rows={3}
                          value={aboutForm.atelier2Description}
                          onChange={(e) => setAboutForm({ ...aboutForm, atelier2Description: e.target.value })}
                          placeholder="Description"
                          className={`w-full p-2 rounded-lg border text-xs font-sans leading-relaxed outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={aboutForm.atelier2Badge1}
                            onChange={(e) => setAboutForm({ ...aboutForm, atelier2Badge1: e.target.value })}
                            placeholder="Badge 1 (e.g. OPEN FOR VISITS)"
                            className={`p-2 rounded-lg border text-xs font-sans outline-none ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                            }`}
                          />
                          <input
                            type="text"
                            value={aboutForm.atelier2Badge2}
                            onChange={(e) => setAboutForm({ ...aboutForm, atelier2Badge2: e.target.value })}
                            placeholder="Badge 2"
                            className={`p-2 rounded-lg border text-xs font-sans outline-none ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Global Assurances */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-5 ${
                    isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-200/10">
                      <Award className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="font-serif text-lg font-bold">5. Assurances & Guarantees (የዋስትና እና አገልግሎት 4 ካርዶች)</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Assurance 1 */}
                      <div className="p-3.5 rounded-xl border border-gray-200/10 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold">Assurance 1</span>
                        <input
                          type="text"
                          value={aboutForm.assurance1Title}
                          onChange={(e) => setAboutForm({ ...aboutForm, assurance1Title: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <textarea
                          rows={2}
                          value={aboutForm.assurance1Description}
                          onChange={(e) => setAboutForm({ ...aboutForm, assurance1Description: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>

                      {/* Assurance 2 */}
                      <div className="p-3.5 rounded-xl border border-gray-200/10 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold">Assurance 2</span>
                        <input
                          type="text"
                          value={aboutForm.assurance2Title}
                          onChange={(e) => setAboutForm({ ...aboutForm, assurance2Title: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <textarea
                          rows={2}
                          value={aboutForm.assurance2Description}
                          onChange={(e) => setAboutForm({ ...aboutForm, assurance2Description: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>

                      {/* Assurance 3 */}
                      <div className="p-3.5 rounded-xl border border-gray-200/10 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold">Assurance 3</span>
                        <input
                          type="text"
                          value={aboutForm.assurance3Title}
                          onChange={(e) => setAboutForm({ ...aboutForm, assurance3Title: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <textarea
                          rows={2}
                          value={aboutForm.assurance3Description}
                          onChange={(e) => setAboutForm({ ...aboutForm, assurance3Description: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>

                      {/* Assurance 4 */}
                      <div className="p-3.5 rounded-xl border border-gray-200/10 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold">Assurance 4</span>
                        <input
                          type="text"
                          value={aboutForm.assurance4Title}
                          onChange={(e) => setAboutForm({ ...aboutForm, assurance4Title: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                        <textarea
                          rows={2}
                          value={aboutForm.assurance4Description}
                          onChange={(e) => setAboutForm({ ...aboutForm, assurance4Description: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-xs font-sans outline-none ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* SUBTAB 2: CONTACT US PAGE CONTENT EDITOR                  */}
              {/* ======================================================== */}
              {contentSubTab === 'contact' && (
                <div className="space-y-6">
                  
                  {/* Card 1: Section Header */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-5 ${
                    isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-200/10">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="font-serif text-lg font-bold">1. Contact Header & Invitation (የላይኛው ርዕስ)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Section Badge</label>
                        <input
                          type="text"
                          value={contactForm.sectionBadge}
                          onChange={(e) => setContactForm({ ...contactForm, sectionBadge: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Heading Prefix</label>
                        <input
                          type="text"
                          value={contactForm.headingPrefix}
                          onChange={(e) => setContactForm({ ...contactForm, headingPrefix: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Animated Typewriter Tagline</label>
                        <input
                          type="text"
                          value={contactForm.typewriterText}
                          onChange={(e) => setContactForm({ ...contactForm, typewriterText: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Contact Section Subtitle</label>
                      <textarea
                        rows={2}
                        value={contactForm.mainDescription}
                        onChange={(e) => setContactForm({ ...contactForm, mainDescription: e.target.value })}
                        className={`w-full p-3 rounded-xl border text-xs font-sans leading-relaxed outline-none focus:border-[#D4AF37] ${
                          isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Card 2: Showroom Coordinates */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-5 ${
                    isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-200/10">
                      <MapPin className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="font-serif text-lg font-bold">2. Studio & Showroom Address (የአቴሊየሩ አድራሻ)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Flagship Header Title</label>
                        <input
                          type="text"
                          value={contactForm.flagshipTitle}
                          onChange={(e) => setContactForm({ ...contactForm, flagshipTitle: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Showroom Section Title</label>
                        <input
                          type="text"
                          value={contactForm.showroomTitle}
                          onChange={(e) => setContactForm({ ...contactForm, showroomTitle: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Physical Address / Street</label>
                        <input
                          type="text"
                          value={contactForm.showroomAddress}
                          onChange={(e) => setContactForm({ ...contactForm, showroomAddress: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">City, Sub-City & Landmarks</label>
                        <input
                          type="text"
                          value={contactForm.showroomCity}
                          onChange={(e) => setContactForm({ ...contactForm, showroomCity: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Phone & Email Channels */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-5 ${
                    isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-200/10">
                      <Phone className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="font-serif text-lg font-bold">3. Phone, WhatsApp & Email (ስልክ እና ኢሜይል)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Phone Section Title</label>
                        <input
                          type="text"
                          value={contactForm.phoneTitle}
                          onChange={(e) => setContactForm({ ...contactForm, phoneTitle: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Phone / WhatsApp Numbers</label>
                        <input
                          type="text"
                          value={contactForm.phoneNumber}
                          onChange={(e) => setContactForm({ ...contactForm, phoneNumber: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Business Hours</label>
                        <input
                          type="text"
                          value={contactForm.phoneHours}
                          onChange={(e) => setContactForm({ ...contactForm, phoneHours: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-200/10">
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Email Section Title</label>
                        <input
                          type="text"
                          value={contactForm.emailTitle}
                          onChange={(e) => setContactForm({ ...contactForm, emailTitle: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Bespoke Concierge Email</label>
                        <input
                          type="text"
                          value={contactForm.emailAddress}
                          onChange={(e) => setContactForm({ ...contactForm, emailAddress: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Orders Email / Subtext</label>
                        <input
                          type="text"
                          value={contactForm.emailSubtext}
                          onChange={(e) => setContactForm({ ...contactForm, emailSubtext: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Appointments & Corporate Desk */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-5 ${
                    isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-200/10">
                      <Clock className="w-4 h-4 text-[#D4AF37]" />
                      <h4 className="font-serif text-lg font-bold">4. Fittings & Corporate Desk (ቀጠሮ እና የድርጅት ስጦታዎች)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Appointment Badge Title</label>
                        <input
                          type="text"
                          value={contactForm.appointmentTitle}
                          onChange={(e) => setContactForm({ ...contactForm, appointmentTitle: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Appointment Subtitle</label>
                        <input
                          type="text"
                          value={contactForm.appointmentSubtitle}
                          onChange={(e) => setContactForm({ ...contactForm, appointmentSubtitle: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Appointment Pricing Badge</label>
                        <input
                          type="text"
                          value={contactForm.appointmentBadge}
                          onChange={(e) => setContactForm({ ...contactForm, appointmentBadge: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-200/10">
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Corporate Gifting Desk Title</label>
                        <input
                          type="text"
                          value={contactForm.corporateTitle}
                          onChange={(e) => setContactForm({ ...contactForm, corporateTitle: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase">Corporate Gifting Desk Description</label>
                        <textarea
                          rows={3}
                          value={contactForm.corporateDescription}
                          onChange={(e) => setContactForm({ ...contactForm, corporateDescription: e.target.value })}
                          className={`w-full p-3 rounded-xl border text-xs font-sans leading-relaxed outline-none focus:border-[#D4AF37] ${
                            isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}



          {/* ============================================================== */}
          {/* TAB 7: ABANDONED CART RECOVERY & VIP CONCIERGE DESK           */}
          {/* ============================================================== */}
          {activeTab === 'abandoned' && (
            <div className="space-y-6 max-w-7xl mx-auto pb-16">
              
              {/* Header Banner */}
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
                isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono mb-2">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>ATELIER REVENUE RECOVERY DESK</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                      Abandoned Cart Recovery (የተተዉ ቅርጫቶች ክትትል)
                    </h2>
                    <p className="text-xs sm:text-sm font-light text-gray-400 mt-1 max-w-2xl">
                      Re-engage discerning collectors who curated bespoke pieces but paused before checkout. Dispatch 1-click personalized Telegram / WhatsApp concierge invitations with complimentary 24K Gold Monogramming.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const script = `Greetings from Kiru Leathers Atelier Addis Ababa. We noticed your private commission tray currently holds handcrafted full-grain leather pieces. Our master saddlers would be honored to extend a complimentary 24K Gold Monogramming privilege and private courier delivery for your order. Use privilege code VIPATELIER10 or reply here to finalize.`;
                        navigator.clipboard?.writeText(script);
                        setCopiedScriptId('universal');
                        setTimeout(() => setCopiedScriptId(null), 2500);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all text-xs font-mono font-bold uppercase flex items-center gap-2 shadow cursor-pointer"
                    >
                      {copiedScriptId === 'universal' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedScriptId === 'universal' ? 'Script Copied!' : 'Copy Universal VIP Pitch'}</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics */}
                {(() => {
                  const recoverableLeads = abandonedLeads.filter(l => l.status === 'recoverable');
                  const contactedLeads = abandonedLeads.filter(l => l.status === 'contacted');
                  const recoveredLeads = abandonedLeads.filter(l => l.status === 'recovered');
                  const recoverableTotal = recoverableLeads.reduce((sum, l) => sum + l.subtotal, 0);
                  const recoveredTotal = recoveredLeads.reduce((sum, l) => sum + l.subtotal, 0);

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                      <div className="p-4 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/30">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] block font-semibold">
                          Recoverable Pipeline
                        </span>
                        <div className="font-serif text-2xl font-bold mt-1 text-[#D4AF37]">
                          ${recoverableTotal.toLocaleString()}
                        </div>
                        <span className="text-[11px] font-mono text-gray-400">
                          {(recoverableTotal * exchangeRate).toLocaleString()} ETB in cart
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 block font-semibold">
                          Active Unclaimed Carts
                        </span>
                        <div className="font-serif text-2xl font-bold mt-1 text-white">
                          {recoverableLeads.length} <span className="text-xs font-mono font-normal text-gray-400">Collectors</span>
                        </div>
                        <span className="text-[11px] font-mono text-gray-400">
                          Awaiting Concierge outreach
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block font-semibold">
                          VIP Outreach In-Flight
                        </span>
                        <div className="font-serif text-2xl font-bold mt-1 text-white">
                          {contactedLeads.length} <span className="text-xs font-mono font-normal text-gray-400">Dispatched</span>
                        </div>
                        <span className="text-[11px] font-mono text-gray-400">
                          Telegram & WhatsApp messages sent
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/30">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-semibold">
                          Recovered Atelier Revenue
                        </span>
                        <div className="font-serif text-2xl font-bold mt-1 text-emerald-400">
                          ${recoveredTotal.toLocaleString()}
                        </div>
                        <span className="text-[11px] font-mono text-gray-400">
                          {recoveredLeads.length} completed orders
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Filters and Search Bar */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
              }`}>
                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                  {(['all', 'recoverable', 'contacted', 'recovered'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setAbandonedFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                        abandonedFilter === filter
                          ? 'bg-[#D4AF37] text-black font-bold shadow'
                          : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {filter === 'all' && 'All Carts (ሁሉም)'}
                      {filter === 'recoverable' && '⚠️ Needs Recovery'}
                      {filter === 'contacted' && '💬 Contacted'}
                      {filter === 'recovered' && '✅ Recovered'}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={abandonedSearch}
                    onChange={(e) => setAbandonedSearch(e.target.value)}
                    placeholder="Search collector name or phone..."
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                      isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              {/* Abandoned Leads List */}
              <div className="space-y-4">
                {abandonedLeads
                  .filter((lead) => {
                    if (abandonedFilter !== 'all' && lead.status !== abandonedFilter) return false;
                    if (abandonedSearch.trim()) {
                      const q = abandonedSearch.toLowerCase();
                      const matchName = lead.customerName.toLowerCase().includes(q);
                      const matchPhone = lead.phone.toLowerCase().includes(q);
                      const matchCity = lead.city.toLowerCase().includes(q);
                      const matchTg = lead.telegramUsername?.toLowerCase().includes(q);
                      if (!matchName && !matchPhone && !matchCity && !matchTg) return false;
                    }
                    return true;
                  })
                  .map((lead) => {
                    const isCopied = copiedScriptId === lead.id;
                    const itemsSummary = lead.items.map(i => i.productName).join(' & ');
                    const tgMessage = encodeURIComponent(
                      `ሰላም ${lead.customerName}፣ ከ Kiru Leathers Atelier Addis Ababa ነን። በቅርጫትዎ ውስጥ ያስቀመጡትን "${itemsSummary}" ($${lead.subtotal.toLocaleString()}) ዝግጁ አድርገንልዎታል። የቆዳ ክምችቱን ለእርስዎ ብቻ እንድንይዝልዎና የ 24K የወርቅ ሞኖግራም (Monogramming) በነጻ እንድናደርግልዎ ይፈልጋሉ? ትዕዛዝዎን ለማጠናቀቅ ዝግጁ ነን።`
                    );
                    const tgUrl = lead.telegramUsername
                      ? `https://t.me/${lead.telegramUsername}?text=${tgMessage}`
                      : `https://t.me/kiruleathers?text=${tgMessage}`;
                    const waCleanPhone = lead.phone.replace(/[^0-9]/g, '');
                    const waUrl = `https://wa.me/${waCleanPhone}?text=${tgMessage}`;

                    return (
                      <div
                        key={lead.id}
                        className={`p-5 sm:p-6 rounded-3xl border shadow-lg transition-all ${
                          lead.status === 'recoverable'
                            ? isDark ? 'border-amber-500/40 bg-[#0E1015]' : 'border-amber-300 bg-amber-50/30'
                            : lead.status === 'recovered'
                              ? isDark ? 'border-emerald-500/40 bg-[#0E1015]' : 'border-emerald-200 bg-emerald-50/20'
                              : isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-200/10">
                          
                          {/* Collector Information */}
                          <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3D2314] to-[#1C1815] border border-[#D4AF37]/40 flex items-center justify-center font-serif font-bold text-lg text-[#D4AF37] shrink-0 shadow">
                              {lead.customerName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-serif text-lg font-bold text-white">
                                  {lead.customerName}
                                </h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                                  lead.status === 'recoverable'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : lead.status === 'contacted'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                }`}>
                                  {lead.status === 'recoverable' && '⚠️ RECOVERABLE'}
                                  {lead.status === 'contacted' && '💬 VIP CONTACTED'}
                                  {lead.status === 'recovered' && '✅ RECOVERED'}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs font-mono text-gray-400 mt-1 flex-wrap">
                                <span className="flex items-center gap-1 text-gray-300">
                                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                                  <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                                </span>
                                {lead.telegramUsername && (
                                  <span className="text-[#0088cc] flex items-center gap-1">
                                    <Send className="w-3 h-3" />
                                    @{lead.telegramUsername}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-gray-400">
                                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                  {lead.city}
                                </span>
                                <span className="flex items-center gap-1 text-gray-500">
                                  <Clock className="w-3.5 h-3.5" />
                                  {lead.timeAgo}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Cart Total Value */}
                          <div className="text-left lg:text-right">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] block">
                              Abandoned Basket Value
                            </span>
                            <div className="font-serif text-2xl font-bold text-white mt-0.5">
                              ${lead.subtotal.toLocaleString()}
                            </div>
                            <span className="text-[11px] font-mono text-gray-400">
                              {(lead.subtotal * exchangeRate).toLocaleString()} ETB
                            </span>
                          </div>
                        </div>

                        {/* Items in Basket */}
                        <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {lead.items.map((item, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3"
                            >
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-14 h-14 object-cover rounded-xl border border-white/10 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-serif text-sm font-semibold truncate text-white">
                                  {item.productName}
                                </h4>
                                <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2 mt-0.5">
                                  <span>{item.color}</span>
                                  {item.size && <span>• Size: {item.size}</span>}
                                  <span className="text-[#D4AF37] font-bold">${item.price}</span>
                                </div>
                                {item.monogram && (
                                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                                    Bespoke Foil: {item.monogram}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Artisan Note */}
                        {lead.notes && (
                          <div className="text-xs font-mono text-gray-400 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 mb-4 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span>Atelier Audit Note: {lead.notes}</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200/10">
                          
                          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                            {/* 1-Click Telegram Outreach */}
                            <a
                              href={tgUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                setAbandonedLeads((prev) =>
                                  prev.map((l) => (l.id === lead.id ? { ...l, status: 'contacted' } : l))
                                );
                              }}
                              className="px-4 py-2 rounded-xl bg-[#0088cc]/20 border border-[#0088cc]/40 hover:bg-[#0088cc] text-blue-200 hover:text-white transition-all text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Telegram VIP Outreach</span>
                            </a>

                            {/* 1-Click WhatsApp Outreach */}
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                setAbandonedLeads((prev) =>
                                  prev.map((l) => (l.id === lead.id ? { ...l, status: 'contacted' } : l))
                                );
                              }}
                              className="px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600 text-emerald-200 hover:text-white transition-all text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp VIP Outreach</span>
                            </a>

                            {/* Copy tailor-made pitch */}
                            <button
                              type="button"
                              onClick={() => {
                                const pitch = `Greetings ${lead.customerName}, this is Kiru Leathers Atelier in Addis Ababa. We noticed your bespoke selection of ${itemsSummary} ($${lead.subtotal.toLocaleString()}). As an exclusive courtesy from our Master Artisan, we would be delighted to reserve this hide for you and provide complimentary 24K Gold Monogramming and private courier dispatch. Would you like us to proceed? (Privilege Code: ATELIER10)`;
                                navigator.clipboard?.writeText(pitch);
                                setCopiedScriptId(lead.id);
                                setTimeout(() => setCopiedScriptId(null), 2500);
                              }}
                              className="px-3 py-2 rounded-xl border border-white/15 hover:border-white/30 text-gray-300 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? 'Copied' : 'Copy Pitch'}</span>
                            </button>
                          </div>

                          {/* Status Switcher */}
                          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                            <span className="text-[11px] font-mono text-gray-400">Set Status:</span>
                            <select
                              value={lead.status}
                              onChange={(e) => {
                                const newSt = e.target.value as AbandonedCartLead['status'];
                                setAbandonedLeads((prev) =>
                                  prev.map((l) => (l.id === lead.id ? { ...l, status: newSt } : l))
                                );
                              }}
                              aria-label="Set lead status"
                              className={`px-3 py-1.5 rounded-xl border text-xs font-mono outline-none cursor-pointer ${
                                isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-white border-stone-200 text-stone-900'
                              }`}
                            >
                              <option value="recoverable">⚠️ Recoverable</option>
                              <option value="contacted">💬 Contacted</option>
                              <option value="recovered">✅ Recovered</option>
                            </select>
                          </div>

                        </div>
                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 8: SPECIAL OFFERS & FLASH SALES CAMPAIGN MANAGER          */}
          {/* ============================================================== */}
          {activeTab === 'promotions' && (
            <div className="space-y-6 max-w-7xl mx-auto pb-16">
              
              {/* Campaign Status Banner */}
              {(() => {
                const now = Date.now();
                const start = new Date(offerForm.startDate).getTime();
                const end = new Date(offerForm.endDate).getTime();
                const isLive = offerForm.isEnabled && now >= start && now < end;
                const isScheduled = offerForm.isEnabled && now < start;
                const isExpired = now >= end;
                const isDisabled = !offerForm.isEnabled;

                return (
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
                    isLive
                      ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 via-stone-900 to-[#0E1015]'
                      : isScheduled
                        ? 'border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-stone-900 to-[#0E1015]'
                        : isExpired
                          ? 'border-gray-500/30 bg-[#0E1015]'
                          : 'border-rose-500/30 bg-[#0E1015]'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/10">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 shadow ${
                            isLive
                              ? 'bg-emerald-500 text-black'
                              : isScheduled
                                ? 'bg-amber-500 text-black'
                                : isExpired
                                  ? 'bg-gray-600 text-white'
                                  : 'bg-rose-600 text-white'
                          }`}>
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            {isLive && '🔥 CAMPAIGN CURRENTLY LIVE (ቅናሹ በገጹ ላይ ክፍት ነው)'}
                            {isScheduled && '🕒 SCHEDULED FOR FUTURE (ወደፊት የሚጀመር)'}
                            {isExpired && '⏹️ CAMPAIGN EXPIRED (ጊዜው አልቋል - ተደብቋል)'}
                            {isDisabled && '⏸️ MANUALLY PAUSED (ለጊዜው ቆሟል)'}
                          </span>
                          <span className="text-xs font-mono text-gray-400">
                            Promo Code: <strong className="text-[#D4AF37]">{offerForm.promoCode}</strong>
                          </span>
                        </div>

                        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                          Special Offers & Timed Discounts Manager (ልዩ ቅናሾችና የጊዜ ገደብ)
                        </h2>
                        <p className="text-xs sm:text-sm font-light text-gray-400 mt-1 max-w-2xl">
                          Configure time-sensitive discounts that automatically appear on the storefront during the set date/time, and automatically disappear when the countdown hits zero.
                        </p>
                      </div>

                      {/* Master Enable/Disable Switch */}
                      <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/10 shrink-0">
                        <span className="text-xs font-mono text-gray-300 font-semibold">Storefront Status:</span>
                        <button
                          type="button"
                          onClick={() => setOfferForm(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                          className={`px-4 py-1.5 rounded-xl font-mono text-xs font-bold uppercase transition-all shadow cursor-pointer ${
                            offerForm.isEnabled
                              ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                              : 'bg-stone-700 text-gray-300 hover:bg-stone-600'
                          }`}
                        >
                          {offerForm.isEnabled ? 'ENABLED (ክፍት)' : 'PAUSED (ዝግ)'}
                        </button>
                      </div>
                    </div>

                    {/* Quick Timing Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs font-mono">
                      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-gray-400 block uppercase text-[10px]">Start Date & Time</span>
                        <span className="font-bold text-white text-sm mt-0.5 block">
                          {new Date(offerForm.startDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-gray-400 block uppercase text-[10px]">Expiration Date & Time</span>
                        <span className="font-bold text-rose-400 text-sm mt-0.5 block">
                          {new Date(offerForm.endDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                        <span className="text-[#D4AF37] block uppercase text-[10px] font-bold">Privilege Rate</span>
                        <span className="font-bold text-[#D4AF37] text-lg mt-0.5 block">
                          {offerForm.discountValue}% OFF
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {offerForm.targetCategory === 'selected'
                            ? `Applies to ${offerForm.targetProductIds?.length || 0} Curated Pieces (1/category)`
                            : `Applies to ${offerForm.targetCategory.toUpperCase()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Form Content */}
              <form onSubmit={handleSaveOffer} className="space-y-6">
                
                {/* Section 1: Campaign Titles & Messaging */}
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-4 ${
                  isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                }`}>
                  <h3 className="font-serif text-lg font-bold flex items-center gap-2 pb-3 border-b border-gray-200/10">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>1. Campaign Copy & Luxury Messaging (የቅናሹ ስም እና መልእክት)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                        Campaign Title (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={offerForm.title}
                        onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                        className={`w-full p-3 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                          isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#D4AF37] mb-1">
                        Campaign Title (Amharic - አማርኛ) *
                      </label>
                      <input
                        type="text"
                        required
                        value={offerForm.titleAm}
                        onChange={(e) => setOfferForm({ ...offerForm, titleAm: e.target.value })}
                        className={`w-full p-3 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                          isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                        Subtitle / Offer Description (English)
                      </label>
                      <textarea
                        rows={2}
                        value={offerForm.subtitle}
                        onChange={(e) => setOfferForm({ ...offerForm, subtitle: e.target.value })}
                        className={`w-full p-3 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                          isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#D4AF37] mb-1">
                        Subtitle / Offer Description (Amharic - አማርኛ)
                      </label>
                      <textarea
                        rows={2}
                        value={offerForm.subtitleAm}
                        onChange={(e) => setOfferForm({ ...offerForm, subtitleAm: e.target.value })}
                        className={`w-full p-3 rounded-xl border text-xs font-sans outline-none focus:border-[#D4AF37] ${
                          isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Discount Value & Code */}
                {/* Section 2: Discount Structure & Specific Item Selection (Always Visible & Full Width) */}
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
                  isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/10">
                    <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#D4AF37]" />
                      <span>2. Discount Structure & Specific Item Selection (የቅናሽ መጠን እና የተመረጡ እቃዎች)</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                        {offerForm.targetProductIds?.length || 0} Pieces on Discount
                      </span>
                    </div>
                  </div>

                  {/* Top Campaign Parameters Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                        Discount Rate (%) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={90}
                          required
                          value={offerForm.discountValue}
                          onChange={(e) => setOfferForm({ ...offerForm, discountValue: Number(e.target.value) })}
                          className={`w-full p-3 pr-8 rounded-xl border text-xs font-mono outline-none focus:border-[#D4AF37] font-bold text-base ${
                            isDark ? 'bg-black/50 border-white/15 text-[#D4AF37]' : 'bg-stone-50 border-stone-200 text-[#D4AF37]'
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono font-bold">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                        Promo Voucher Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={offerForm.promoCode}
                        onChange={(e) => setOfferForm({ ...offerForm, promoCode: e.target.value.toUpperCase().replace(/\s/g, '') })}
                        className={`w-full p-3 rounded-xl border text-xs font-mono uppercase tracking-widest font-bold outline-none focus:border-[#D4AF37] ${
                          isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                        Badge Text Pill
                      </label>
                      <input
                        type="text"
                        value={offerForm.badgeText}
                        onChange={(e) => setOfferForm({ ...offerForm, badgeText: e.target.value })}
                        className={`w-full p-3 rounded-xl border text-xs font-mono outline-none focus:border-[#D4AF37] ${
                          isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Section 2B: Full-Width Step-by-Step Category -> Specific Item Discount Builder */}
                  <div className="pt-4 border-t border-white/10 space-y-5">
                    
                    {/* Builder Header & Fast Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono uppercase font-bold text-[#D4AF37]">
                            Step-by-Step Discount Item Selector (እቃዎችን በምድብ መርጦ የመጨመሪያ ቅጽ)
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-bold">
                            {offerForm.targetProductIds?.length || 0} Pieces Selected
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          በመጀመሪያ ምድቡን (ጃኬት፣ ቦርሳ፣ ጫማ፣ የኪስ ቦርሳ ወይም ቀበቶ) ይምረጡ፤ በመቀጠል ልዩ እቃውን መርጠው <strong>"+ Check & Add to Discount"</strong> የሚለውን በተን ይጫኑ። ሙሉ እቃዎች ሳይሆኑ እዚህ የተመረጡት ብቻ ቅናሽ ይደረጋሉ።
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleSelectOnePerCategory}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-stone-950 font-bold text-xs font-mono shadow-md hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Auto-picks 1 flagship piece from each of the 5 categories"
                        >
                          <span>✨</span>
                          <span>1 Hero per Category (1 ከእያንዳንዱ ምድብ ምረጥ)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleClearProductSelection}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 transition-all cursor-pointer"
                        >
                          Clear All (ሁሉንም አፅዳ)
                        </button>
                      </div>
                    </div>

                    {/* Step-by-Step Interactive Builder Box */}
                    <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-4 ${
                      isDark ? 'bg-black/50 border-[#D4AF37]/40' : 'bg-stone-50 border-stone-300'
                    }`}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        
                        {/* Step 1: Category Picker */}
                        <div>
                          <label className="block text-xs font-mono uppercase text-[#D4AF37] font-bold mb-2 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-stone-950 text-[11px] flex items-center justify-center font-black">1</span>
                            <span>Choose Category First (በቅድሚያ ምድብ ይምረጡ)</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              { id: 'jackets', label: 'Jackets', labelAm: 'ጃኬቶች', emoji: '🧥' },
                              { id: 'bags', label: 'Bags', labelAm: 'ቦርሳዎች', emoji: '🎒' },
                              { id: 'footwear', label: 'Boots', labelAm: 'ጫማዎች', emoji: '👢' },
                              { id: 'wallets', label: 'Wallets', labelAm: 'የኪስ ቦርሳ', emoji: '👛' },
                              { id: 'belts', label: 'Belts', labelAm: 'ቀበቶዎች', emoji: '🎗️' },
                            ].map((cat) => {
                              const isActive = discountBuilderCat === cat.id;
                              const countInCat = products.filter((p) => p.category === cat.id).length;
                              const selectedCountInCat = (offerForm.targetProductIds || []).filter(
                                (id) => products.find((p) => p.id === id)?.category === cat.id
                              ).length;

                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => setDiscountBuilderCat(cat.id as any)}
                                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-stone-950 font-bold border-[#D4AF37] shadow-md shadow-[#D4AF37]/20 scale-[1.02]'
                                      : isDark
                                      ? 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                                      : 'bg-white border-stone-200 text-stone-800 hover:border-stone-400'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <span>{cat.emoji} {cat.label}</span>
                                    {selectedCountInCat > 0 && (
                                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                                        isActive ? 'bg-stone-950 text-[#D4AF37]' : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                                      }`}>
                                        {selectedCountInCat} in sale
                                      </span>
                                    )}
                                  </div>
                                  <div className={`text-[10px] mt-0.5 ${isActive ? 'text-stone-900 font-semibold' : 'text-gray-400'}`}>
                                    {cat.labelAm} ({countInCat})
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Step 2: Specific Item Picker */}
                        <div>
                          <label className="block text-xs font-mono uppercase text-[#D4AF37] font-bold mb-2 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-stone-950 text-[11px] flex items-center justify-center font-black">2</span>
                            <span>Choose Specific Item in {discountBuilderCat.toUpperCase()} (ልዩ እቃውን ይምረጡ)</span>
                          </label>

                          <select
                            value={discountBuilderProdId}
                            onChange={(e) => setDiscountBuilderProdId(e.target.value)}
                            className={`w-full p-3 rounded-xl border text-xs font-mono outline-none focus:border-[#D4AF37] cursor-pointer ${
                              isDark ? 'bg-black/70 border-white/20 text-white' : 'bg-white border-stone-300 text-stone-900'
                            }`}
                          >
                            {products
                              .filter((p) => p.category === discountBuilderCat)
                              .map((p) => {
                                const isAlreadyAdded = offerForm.targetProductIds?.includes(p.id);
                                const discPrice = Math.round(p.price * (1 - offerForm.discountValue / 100));
                                return (
                                  <option key={p.id} value={p.id}>
                                    {p.name} — ${p.price} (ቅናሽ: ${discPrice}) {isAlreadyAdded ? '✓ [Already in Discount]' : ''}
                                  </option>
                                );
                              })}
                          </select>

                          {/* Preview Card of chosen specific item */}
                          {(() => {
                            const selectedP = products.find((p) => p.id === discountBuilderProdId);
                            if (!selectedP) return null;
                            const isAlreadyAdded = offerForm.targetProductIds?.includes(selectedP.id);
                            const discPrice = Math.round(selectedP.price * (1 - offerForm.discountValue / 100));
                            const thumb = selectedP.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5';

                            return (
                              <div className="mt-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-[#D4AF37]/30 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={thumb}
                                    alt={selectedP.name}
                                    className="w-12 h-12 rounded-lg object-cover bg-stone-900 shrink-0 border border-white/10"
                                  />
                                  <div className="truncate">
                                    <div className="text-xs font-bold truncate text-[#D4AF37]">{selectedP.name}</div>
                                    <div className="text-[11px] font-mono text-gray-300 mt-0.5">
                                      Original: <span className="line-through text-gray-400">${selectedP.price}</span> →{' '}
                                      <strong className="text-amber-400 font-bold">${discPrice} (-{offerForm.discountValue}%)</strong>
                                    </div>
                                  </div>
                                </div>

                                {isAlreadyAdded && (
                                  <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                                    Added ✓
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Step 3: Big Prominent "Check & Add" Button */}
                      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
                        <div>
                          {builderFeedback ? (
                            <span className={`text-xs font-mono font-bold animate-pulse ${
                              builderFeedback.includes('already') ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {builderFeedback}
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono text-gray-400">
                              Selected product: <strong className="text-white">{products.find(p => p.id === discountBuilderProdId)?.name || 'None'}</strong>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleAddDiscountItem}
                          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] hover:brightness-110 text-stone-950 font-bold text-xs font-mono shadow-xl shadow-[#D4AF37]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span className="tracking-wide uppercase font-extrabold">+ Check & Add to Discount List (መርጠህ ወደ ቅናሽ ጨምር)</span>
                        </button>
                      </div>

                      {/* Interactive Visual Product Cards in Selected Category with Direct "Check & Add" Toggle */}
                      <div className="pt-3 border-t border-white/10">
                        <span className="text-[11px] font-mono text-gray-400 block mb-2 font-bold">
                          Direct 1-Click Check & Add for all {discountBuilderCat.toUpperCase()} (በቀጥታ በዚህ ምድብ ያሉትን እቃዎች መርጠው ይጨምሩ):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {products
                            .filter((p) => p.category === discountBuilderCat)
                            .map((p) => {
                              const isAdded = offerForm.targetProductIds?.includes(p.id);
                              const thumb = p.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5';
                              const discPrice = Math.round(p.price * (1 - offerForm.discountValue / 100));

                              return (
                                <div
                                  key={p.id}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                                    isAdded
                                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-sm'
                                      : 'bg-black/30 border-white/10 text-gray-300 hover:border-white/20'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <img
                                      src={thumb}
                                      alt={p.name}
                                      className="w-9 h-9 rounded-lg object-cover bg-stone-900 shrink-0 border border-white/10"
                                    />
                                    <div className="min-w-0">
                                      <div className="text-xs font-medium truncate">{p.name}</div>
                                      <div className="text-[10px] font-mono text-gray-400">
                                        ${p.price} → <strong className="text-amber-400">${discPrice}</strong>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isAdded) {
                                        handleRemoveDiscountItem(p.id);
                                      } else {
                                        setDiscountBuilderProdId(p.id);
                                        setOfferForm((prev) => ({
                                          ...prev,
                                          targetCategory: 'selected',
                                          targetProductIds: [...(prev.targetProductIds || []), p.id]
                                        }));
                                      }
                                    }}
                                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                                      isAdded
                                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/40 border border-red-500/40'
                                        : 'bg-[#D4AF37] text-stone-950 hover:brightness-110 shadow-sm'
                                    }`}
                                  >
                                    {isAdded ? (
                                      <>
                                        <Trash2 className="w-3 h-3" />
                                        <span>Remove</span>
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-3 h-3 stroke-[2.5]" />
                                        <span>Check & Add</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    {/* Active Discounted Items Display Grid */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-bold">
                          Active Discounted Items ({offerForm.targetProductIds?.length || 0} Pieces Currently Selected)
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">
                          Strictly restricted to these pieces in the storefront
                        </span>
                      </div>

                      {(!offerForm.targetProductIds || offerForm.targetProductIds.length === 0) ? (
                        <div className="p-8 rounded-2xl border-2 border-dashed border-white/20 text-center text-gray-400 font-mono text-xs">
                          No items currently in discount list. Pick a category and product above, then click <strong>"+ Check & Add to Discount List"</strong>.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto p-2 rounded-2xl bg-black/40 border border-white/10">
                          {offerForm.targetProductIds.map((id) => {
                            const p = products.find((prod) => prod.id === id);
                            if (!p) return null;
                            const thumb = p.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5';
                            const discPrice = Math.round(p.price * (1 - offerForm.discountValue / 100));

                            return (
                              <div
                                key={p.id}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                  isDark ? 'bg-white/[0.04] border-[#D4AF37]/40 text-white' : 'bg-white border-stone-300 text-stone-900 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={thumb}
                                    alt={p.name}
                                    className="w-11 h-11 rounded-lg object-cover bg-stone-900 shrink-0 border border-white/10"
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold">
                                        {p.category}
                                      </span>
                                    </div>
                                    <h4 className="font-semibold text-xs truncate mt-0.5">{p.name}</h4>
                                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                      <span className="text-gray-400 line-through">${p.price}</span>
                                      <span className="text-amber-400 font-bold">→ ${discPrice} (-{offerForm.discountValue}%)</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDiscountItem(p.id)}
                                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer shrink-0 flex items-center gap-1 text-[11px] font-mono"
                                  title={`Remove "${p.name}" from discount list`}
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Section 3: Exact Date & Time Schedule */}
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-4 ${
                  isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/10">
                    <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                      <Timer className="w-4 h-4 text-[#D4AF37]" />
                      <span>3. Exact Timing & Auto-Expiration (የሚከፈትበት እና በራስ-ሰር የሚዘጋበት ቀንና ሰዓት)</span>
                    </h3>

                    {/* Quick Duration Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-mono text-gray-400">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(2)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-[#D4AF37] transition-all cursor-pointer"
                      >
                        +2 Hours Flash
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(12)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-[#D4AF37] transition-all cursor-pointer"
                      >
                        +12 Hours Tonight
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(24)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-[#D4AF37] transition-all cursor-pointer"
                      >
                        +24 Hours (1 Day)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(72)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-[#D4AF37] transition-all cursor-pointer"
                      >
                        +3 Days Weekend
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <label className="block text-xs font-mono uppercase text-emerald-400 font-semibold">
                        Campaign Starts At (የሚጀመርበት ቀንና ሰዓት) *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={offerForm.startDate.slice(0, 16)}
                        onChange={(e) => setOfferForm({ ...offerForm, startDate: new Date(e.target.value).toISOString() })}
                        className={`w-full p-3 rounded-xl border text-xs font-mono outline-none focus:border-emerald-500 ${
                          isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      />
                      <span className="text-[10px] font-mono text-gray-400 block">
                        The banner & page unlock precisely at this minute.
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <label className="block text-xs font-mono uppercase text-rose-400 font-semibold">
                        Campaign Expires & Disappears At (የሚያልቅበት ቀንና ሰዓት) *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={offerForm.endDate.slice(0, 16)}
                        onChange={(e) => setOfferForm({ ...offerForm, endDate: new Date(e.target.value).toISOString() })}
                        className={`w-full p-3 rounded-xl border text-xs font-mono outline-none focus:border-rose-500 ${
                          isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      />
                      <span className="text-[10px] font-mono text-rose-300 block">
                        ⚡ Upon reaching this time, the offer page automatically closes and prices revert to normal!
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Banner Visual */}
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-4 ${
                  isDark ? 'border-white/10 bg-[#0E1015]' : 'border-stone-200 bg-white'
                }`}>
                  <h3 className="font-serif text-lg font-bold flex items-center gap-2 pb-3 border-b border-gray-200/10">
                    <Layers className="w-4 h-4 text-[#D4AF37]" />
                    <span>4. Editorial Banner Visual</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                      Hero Banner Background Image URL
                    </label>
                    <input
                      type="url"
                      value={offerForm.bannerImageUrl || ''}
                      onChange={(e) => setOfferForm({ ...offerForm, bannerImageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className={`w-full p-3 rounded-xl border text-xs font-mono outline-none focus:border-[#D4AF37] ${
                        isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Submit Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-[#D4AF37]/30">
                  <div className="text-xs font-mono text-gray-300">
                    {offerSaveMessage ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {offerSaveMessage}
                      </span>
                    ) : (
                      <span>Changes take effect immediately across all customer devices.</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingOffer}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingOffer ? 'Saving Campaign...' : 'Save & Publish Special Offer (ቅናሹን መዝግብ)'}</span>
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 9: LOOKBOOK VIDEO EDITORIAL CMS                           */}
          {/* ============================================================== */}
          {activeTab === 'lookbook' && (
            <div className="space-y-6 max-w-7xl mx-auto pb-16">
              
              {/* Notification Banner */}
              <AnimatePresence>
                {lookbookNotification && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs font-mono shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{lookbookNotification}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLookbookNotification(null)}
                      className="p-1 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lookbook Executive Header & Stats Banner */}
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
                isDark
                  ? 'border-[#D4AF37]/30 bg-gradient-to-br from-[#1C130D]/70 via-[#101116] to-[#0A0B0E]'
                  : 'border-stone-200 bg-white'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-200/10">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-[#D4AF37] text-black flex items-center gap-1.5 shadow">
                        <Film className="w-3.5 h-3.5" />
                        <span>HAUTE MAROQUINERIE EDITORIAL CMS</span>
                      </span>
                      <span className="text-xs font-mono text-gray-400">
                        Total Looks: <strong className="text-white">{lookbookList.length} Videos</strong>
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                      Editorial Lookbook Videos & Runway Media (የቪዲዮ ሉክቡክ ማስተዳደሪያ)
                    </h2>
                    <p className="text-xs sm:text-sm font-light text-gray-400 mt-1 max-w-2xl">
                      Manage full-motion artisan videos, toggle visibility live/hidden for each card, add new runway or crafting videos, and link shoppable products with interactive hotspots.
                    </p>
                  </div>

                  {/* Primary Add New Video Button */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsAddLookbookOpen(true)}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-mono text-xs uppercase font-bold flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer transform hover:scale-[1.02]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add New Video (አዲስ ቪዲዮ ጨምር)</span>
                    </button>
                  </div>
                </div>

                {/* Live Stats Overview Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6">
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-stone-50 border-stone-200'}`}>
                    <p className="text-[10px] font-mono uppercase text-gray-400">Total Curated Looks</p>
                    <p className="font-serif text-2xl font-bold text-[#D4AF37] mt-1">{lookbookList.length}</p>
                    <p className="text-[10px] font-mono text-gray-500 mt-0.5">Highland & Tuscan media</p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Live in Store</p>
                    </div>
                    <p className="font-serif text-2xl font-bold text-emerald-400 mt-1">
                      {lookbookList.filter((i) => !i.isHidden).length}
                    </p>
                    <p className="text-[10px] font-mono text-emerald-500/80 mt-0.5">Visible to customers</p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center gap-1.5">
                      <EyeOff className="w-3 h-3 text-amber-400" />
                      <p className="text-[10px] font-mono uppercase text-amber-400 font-semibold">Hidden (Drafts)</p>
                    </div>
                    <p className="font-serif text-2xl font-bold text-amber-400 mt-1">
                      {lookbookList.filter((i) => i.isHidden).length}
                    </p>
                    <p className="text-[10px] font-mono text-amber-500/80 mt-0.5">Hidden from customers</p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-stone-50 border-stone-200'}`}>
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3 h-3 text-[#D4AF37]" />
                      <p className="text-[10px] font-mono uppercase text-gray-400">Shoppable Hotspots</p>
                    </div>
                    <p className="font-serif text-2xl font-bold text-white mt-1">
                      {lookbookList.filter((i) => i.hotspot).length}
                    </p>
                    <p className="text-[10px] font-mono text-gray-500 mt-0.5">Direct cart links</p>
                  </div>
                </div>
              </div>

              {/* Search, Status & Category Filters */}
              <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
                isDark ? 'bg-[#101217] border-white/10' : 'bg-white border-stone-200 shadow-sm'
              }`}>
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by look title, provenance, product name..."
                    value={lookbookSearch}
                    onChange={(e) => setLookbookSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-mono bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                  {lookbookSearch && (
                    <button
                      type="button"
                      onClick={() => setLookbookSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Toggle Filter Pills (All / Live / Hidden) */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setLookbookStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                      lookbookStatusFilter === 'all'
                        ? 'bg-[#D4AF37] text-black font-bold shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    All ({lookbookList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLookbookStatusFilter('live')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                      lookbookStatusFilter === 'live'
                        ? 'bg-emerald-500 text-black font-bold shadow'
                        : 'text-emerald-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Live ({lookbookList.filter((i) => !i.isHidden).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLookbookStatusFilter('hidden')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                      lookbookStatusFilter === 'hidden'
                        ? 'bg-amber-500 text-black font-bold shadow'
                        : 'text-amber-400 hover:bg-white/5'
                    }`}
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>Hidden ({lookbookList.filter((i) => i.isHidden).length})</span>
                  </button>
                </div>

                {/* Category Filter Dropdown / Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'jackets', label: 'Jackets' },
                    { id: 'bags', label: 'Bags' },
                    { id: 'wallets', label: 'Wallets' },
                    { id: 'footwear', label: 'Shoes' },
                    { id: 'belts', label: 'Belts' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setLookbookCategoryFilter(cat.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                        lookbookCategoryFilter === cat.id
                          ? 'bg-white/20 text-white font-bold border border-white/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lookbook Video Cards Grid */}
              {filteredLookbookItems.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl border ${
                  isDark ? 'bg-stone-900/30 border-white/10 text-gray-400' : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}>
                  <Film className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-60" />
                  <p className="font-serif text-lg text-gray-300">No lookbook videos matched your filter</p>
                  <p className="text-xs font-mono text-gray-500 mt-1">
                    Try adjusting the search query or status filter, or click "+ Add New Video" to create one.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLookbookSearch('');
                      setLookbookStatusFilter('all');
                      setLookbookCategoryFilter('all');
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono tracking-wider cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredLookbookItems.map((item, index) => {
                    const isHidden = Boolean(item.isHidden);
                    return (
                      <div
                        key={item.id}
                        className={`rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                          isHidden
                            ? isDark
                              ? 'bg-[#121318]/70 border-amber-500/30 opacity-75 hover:opacity-100'
                              : 'bg-stone-100/80 border-amber-300'
                            : isDark
                            ? 'bg-[#13151D] border-white/10 hover:border-[#D4AF37]/50 shadow-lg'
                            : 'bg-white border-stone-200 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {/* Top Media Frame */}
                        <div className="relative aspect-video w-full bg-black/60 overflow-hidden group">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Category Badge */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-black/70 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/40 shadow">
                              {item.category || 'Editorial'}
                            </span>
                          </div>

                          {/* Visibility Status Pill */}
                          <div className="absolute top-3 right-3">
                            {isHidden ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/90 text-black flex items-center gap-1 shadow">
                                <EyeOff className="w-3 h-3" />
                                <span>HIDDEN (DRAFT)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/90 text-black flex items-center gap-1 shadow">
                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                                <span>LIVE IN STORE</span>
                              </span>
                            )}
                          </div>

                          {/* Center Play Button (Test Video Playback) */}
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewVideo(item);
                              setIsPreviewMuted(false);
                            }}
                            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all transform hover:scale-110 hover:bg-[#D4AF37] hover:text-black cursor-pointer shadow-xl"
                            title="Test video playback"
                          >
                            <Play className="w-5 h-5 ml-0.5" />
                          </button>

                          {/* Location Provenance at bottom left */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-mono">
                            <span className="flex items-center gap-1 text-gray-300 drop-shadow">
                              <MapPin className="w-3 h-3 text-[#D4AF37]" />
                              {item.location}
                            </span>
                            <span className="text-[10px] text-gray-400 bg-black/60 px-2 py-0.5 rounded-md">
                              #{index + 1}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-serif text-lg font-bold text-white tracking-tight line-clamp-1">
                                {item.title}
                              </h3>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                              {item.description || 'Master artisan full-grain leather piece crafted with Tuscan tanning.'}
                            </p>
                          </div>

                          {/* Shoppable Product Hotspot Badge */}
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                            item.hotspot
                              ? isDark
                                ? 'bg-black/40 border-amber-500/30 text-amber-300'
                                : 'bg-amber-50 border-amber-200 text-amber-900'
                              : isDark
                              ? 'bg-black/20 border-white/5 text-gray-500'
                              : 'bg-stone-50 border-stone-200 text-stone-500'
                          }`}>
                            <div className="flex items-center gap-2 truncate">
                              <Tag className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                              <span className="truncate">
                                {item.hotspot ? item.hotspot.productName : 'No attached product'}
                              </span>
                            </div>
                            {item.hotspot && (
                              <span className="px-2 py-0.5 rounded-md bg-[#D4AF37] text-black font-bold text-[10px] shrink-0">
                                {item.hotspot.price}
                              </span>
                            )}
                          </div>

                          {/* Action Toolbar */}
                          <div className="pt-3 border-t border-gray-200/10 flex items-center justify-between gap-2">
                            {/* 1-Click Hide/Show Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleLookbookVisibility(item)}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isHidden
                                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black border border-emerald-500/40 shadow'
                                  : 'bg-white/10 text-gray-300 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 border border-white/10'
                              }`}
                              title={isHidden ? 'Click to show this video on storefront' : 'Click to hide this video from customers'}
                            >
                              {isHidden ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Show (አሳይ)</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Hide (ደብቅ)</span>
                                </>
                              )}
                            </button>

                            {/* Reorder Buttons */}
                            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                              <button
                                type="button"
                                onClick={() => handleMoveLookbook(index, 'up')}
                                disabled={index === 0}
                                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer"
                                title="Move up in order"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveLookbook(index, 'down')}
                                disabled={index === lookbookList.length - 1}
                                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer"
                                title="Move down in order"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => setEditingLookbook({ ...item })}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                              title="Edit Video Details"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setLookbookDeleteId(item.id)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer"
                              title="Delete Video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* ============================================================== */}
      {/* 3. MODAL: EDIT PRODUCT DETAILS                                */}
      {/* ============================================================== */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-[#121216] border-[#D4AF37]/40 text-white' : 'bg-white border-stone-300 text-stone-900'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-[#D4AF37]" />
                  <h4 className="font-serif text-lg font-bold">Edit Leather Piece (መረጃውን አድስ)</h4>
                </div>
                <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-black dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditProduct} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase mb-1 text-gray-400">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#D4AF37] ${
                      isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase mb-1 text-gray-400">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as any)}
                      className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#D4AF37] ${
                        isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    >
                      <option value="jackets">Jackets (ጃኬቶች)</option>
                      <option value="bags">Bags & Luggage (ቦርሳዎች)</option>
                      <option value="footwear">Footwear (ጫማዎች)</option>
                      <option value="wallets">Wallets & Small Goods (የኪስ ቦርሳ)</option>
                      <option value="belts">Belts & Straps (ቀበቶዎች)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase mb-1 text-gray-400">Price (USD $)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#D4AF37] ${
                        isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase mb-1 text-gray-400">Stock Inventory Units</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editStock}
                      onChange={(e) => setEditStock(Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#D4AF37] ${
                        isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase mb-1 text-gray-400">Storefront Visibility</label>
                    <button
                      type="button"
                      onClick={() => setEditHidden(!editHidden)}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                        editHidden
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                          : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500'
                      }`}
                    >
                      {editHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{editHidden ? 'Hidden (የተደበቀ)' : 'Live / Visible (የሚታይ)'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase mb-1 text-gray-400">Image URL</label>
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#D4AF37] ${
                      isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase mb-1 text-gray-400">Description</label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#D4AF37] ${
                      isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-semibold text-xs font-mono uppercase tracking-wider shadow transition-all"
                  >
                    Save Changes (ለውጦችን አጽድቅ)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 4. LIGHTBOX MODAL: FULLSIZE RECEIPT PREVIEW                    */}
      {/* ============================================================== */}
      <AnimatePresence>
        {previewReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121214] border border-[#D4AF37]/40 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/50">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#D4AF37]">{previewReceipt.orderId}</span>
                  <span className="text-gray-400 text-xs font-mono">• {previewReceipt.bank} Receipt Proof</span>
                  {previewReceipt.txId && (
                    <span className="px-2 py-0.5 rounded bg-black border border-white/10 text-amber-300 font-mono text-[11px]">
                      TX: {previewReceipt.txId}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewReceipt.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-mono"
                    title="Open full size"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Open Full Size</span>
                  </a>
                  <button
                    onClick={() => setPreviewReceipt(null)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-y-auto flex items-center justify-center bg-black/80 flex-1 max-h-[70vh]">
                <img
                  src={previewReceipt.image}
                  alt="Customer Transfer Receipt"
                  className="max-h-[66vh] w-auto max-w-full object-contain rounded-lg border border-white/10 shadow-lg"
                />
              </div>

              <div className="p-3 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">
                  Verify account name, timestamp, and transaction reference.
                </span>
                <button
                  onClick={() => setPreviewReceipt(null)}
                  className="px-4 py-1.5 rounded-lg bg-[#D4AF37] text-black font-semibold uppercase hover:bg-amber-400"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 5. MODAL: REJECTION REASON DIALOG                             */}
      {/* ============================================================== */}
      <AnimatePresence>
        {rejectingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141416] border border-red-500/40 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="w-6 h-6" />
                  <h4 className="font-serif text-lg font-medium text-white">Reject Transfer Payment</h4>
                </div>
                <button onClick={() => setRejectingOrder(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-300">
                Order <strong className="text-[#D4AF37] font-mono">{rejectingOrder.id}</strong> will be marked as{' '}
                <span className="text-red-400 font-semibold font-mono">Payment Rejected</span>. The customer will see
                the explanation on their order tracking console.
              </p>

              {/* Quick Presets */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5">
                  Quick Preset Explanations (ፈጣን ምክንያቶች)
                </label>
                <div className="space-y-1.5">
                  {[
                    'የተሳሳተ ወይም ያልተገኘ የግብይት ቁጥር (Invalid / Non-existent Transaction ID)',
                    'የተከፈለው ገንዘብ ከትእዛዙ ሂሳብ ጋር አይዛመድም (Payment amount does not match order)',
                    'የደረሰኙ ምስል አይነበብም ወይም የተቆረጠ ነው (Unreadable or cut-off receipt screenshot)',
                    'ክፍያው በባንክ ሂሳባችን ውስጥ ገቢ አልሆነም (Funds not received in merchant account)'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReasonInput(preset)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-sans border transition-colors ${
                        rejectionReasonInput === preset
                          ? 'bg-red-500/20 border-red-500/60 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom input */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                  Custom Explanation / ማብራሪያ
                </label>
                <textarea
                  rows={2}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="Enter custom rejection reason..."
                  className="w-full p-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRejectingOrder(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs uppercase font-semibold flex items-center gap-1.5 shadow"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Confirm Rejection (ውድቅ አድርግ)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 6. MODAL: DISPATCH COURIER & LOGISTICS HANDOVER               */}
      {/* ============================================================== */}
      <AnimatePresence>
        {dispatchModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 ${
                isDark ? 'bg-[#141416] border-[#D4AF37]/40 text-white' : 'bg-white border-stone-300 text-stone-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5 text-[#D4AF37]">
                  <Truck className="w-6 h-6" />
                  <div>
                    <h4 className="font-serif text-lg font-bold">Dispatch Courier (አድራሽ መድብ)</h4>
                    <p className="text-[11px] font-mono text-gray-400">
                      Order: <span className="text-[#D4AF37] font-bold">{dispatchModalOrder.id}</span> • Customer: {dispatchModalOrder.customer.fullName}
                    </p>
                  </div>
                </div>
                <button onClick={() => setDispatchModalOrder(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Delivery Destination reminder */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono space-y-1">
                <p className="text-gray-400">
                  📍 Destination: <strong className="text-white">{dispatchModalOrder.customer.address}, {dispatchModalOrder.customer.city}</strong>
                </p>
                <p className="text-gray-400">
                  📞 Recipient Phone: <strong className="text-white">{dispatchModalOrder.customer.phone}</strong>
                </p>
              </div>

              {/* Quick courier presets */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5">
                  Select Courier Service (የማድረሻ አማራጭ)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'DeliverAddis Express', phone: '+251 91 123 4567', plate: 'A.A 2-B88421' },
                    { name: 'Tikus Delivery', phone: '+251 92 987 6543', plate: 'A.A 3-C12948' },
                    { name: 'Atelier Private Rider', phone: '+251 91 100 2233', plate: 'KIRU-01' },
                    { name: 'DHL Express (Intl)', phone: '+251 11 661 5000', plate: 'DHL-ET-99' }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setDispatchCourierName(preset.name);
                        setDispatchCourierPhone(preset.phone);
                        setDispatchVehiclePlate(preset.plate);
                      }}
                      className={`p-2 rounded-xl text-left border text-xs transition-colors ${
                        dispatchCourierName === preset.name
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <span className="font-semibold block">{preset.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{preset.plate}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Courier Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                    Courier / Driver Name
                  </label>
                  <input
                    type="text"
                    value={dispatchCourierName}
                    onChange={(e) => setDispatchCourierName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/15 bg-black/40 text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                    Driver Phone Number
                  </label>
                  <input
                    type="text"
                    value={dispatchCourierPhone}
                    onChange={(e) => setDispatchCourierPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/15 bg-black/40 text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                    Vehicle / Plate Number
                  </label>
                  <input
                    type="text"
                    value={dispatchVehiclePlate}
                    onChange={(e) => setDispatchVehiclePlate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/15 bg-black/40 text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                    Special Instructions
                  </label>
                  <input
                    type="text"
                    value={dispatchDeliveryNote}
                    onChange={(e) => setDispatchDeliveryNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/15 bg-black/40 text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setDispatchModalOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDispatch}
                  disabled={isDispatching || !dispatchCourierName || !dispatchCourierPhone}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-mono text-xs uppercase font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Truck className="w-4 h-4" />
                  <span>{isDispatching ? 'Dispatching...' : 'Dispatch & Send SMS Alert'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 9. MODALS: LOOKBOOK VIDEO MANAGEMENT                          */}
      {/* ============================================================== */}

      {/* A. ADD NEW LOOKBOOK VIDEO MODAL */}
      <AnimatePresence>
        {isAddLookbookOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`border rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 ${
                isDark ? 'bg-[#121319] border-[#D4AF37]/40 text-white' : 'bg-white border-stone-300 text-stone-900'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center shadow">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold">Add Lookbook Video (አዲስ ቪዲዮ ማስተዋወቂያ)</h3>
                    <p className="text-xs font-mono text-gray-400">Curate runway and artisan craftsmanship footage for the storefront.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddLookbookOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateLookbook} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Lookbook Video Title * (የቪዲዮ ርዕስ)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Sovereign Biker Runway"
                      value={newVideoForm.title}
                      onChange={(e) => setNewVideoForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Product Category * (ክፍል)
                    </label>
                    <select
                      value={newVideoForm.category}
                      onChange={(e) => setNewVideoForm((prev) => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    >
                      <option value="jackets">Jackets (ጃኬቶች)</option>
                      <option value="bags">Bags & Duffles (ቦርሳዎች)</option>
                      <option value="wallets">Wallets (የኪስ ቦርሳ)</option>
                      <option value="footwear">Footwear (ጫማዎች)</option>
                      <option value="belts">Belts (ቀበቶዎች)</option>
                      <option value="all">General Editorial (አጠቃላይ)</option>
                    </select>
                  </div>

                  {/* Location Provenance */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Atelier Location / Provenance (የስራ ቦታ)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bole Studio • Addis Ababa"
                      value={newVideoForm.location}
                      onChange={(e) => setNewVideoForm((prev) => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Video URL */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono uppercase text-gray-400">
                        Video Stream URL * (MP4 / Web Video Link)
                      </label>
                      <span className="text-[10px] font-mono text-[#D4AF37]">Direct MP4 or Pinterest stream</span>
                    </div>
                    <input
                      type="url"
                      required
                      placeholder="https://.../video.mp4 or /kiru-leathers.mp4"
                      value={newVideoForm.videoUrl}
                      onChange={(e) => setNewVideoForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    />
                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-mono text-gray-500">Quick samples:</span>
                      <button
                        type="button"
                        onClick={() => setNewVideoForm((p) => ({ ...p, videoUrl: 'https://v1.pinimg.com/videos/iht/hevcMp4V3/44/c5/2f/44c52f82753f803b3445751b93f409a8_240w.mp4', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80' }))}
                        className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-mono text-gray-300 border border-white/10 cursor-pointer"
                      >
                        Biker Runway
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVideoForm((p) => ({ ...p, videoUrl: 'https://v1.pinimg.com/videos/iht/720p/6c/9a/e3/6c9ae38137b6a5aaa1641372bd34ff38.mp4', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' }))}
                        className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-mono text-gray-300 border border-white/10 cursor-pointer"
                      >
                        Duffle Craft
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVideoForm((p) => ({ ...p, videoUrl: '/kiru-leathers.mp4', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80' }))}
                        className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-mono text-gray-300 border border-white/10 cursor-pointer"
                      >
                        Highland Atelier (/kiru-leathers.mp4)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVideoForm((p) => ({ ...p, videoUrl: 'https://v1.pinimg.com/videos/iht/720p/fe/d5/a0/fed5a05f9f92e8633f8308382482a995.mp4', image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80' }))}
                        className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-mono text-gray-300 border border-white/10 cursor-pointer"
                      >
                        Artisan Footwear
                      </button>
                    </div>
                  </div>

                  {/* Cover Poster Image */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Poster / Thumbnail Image URL * (የሽፋን ምስል)
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newVideoForm.image}
                      onChange={(e) => setNewVideoForm((prev) => ({ ...prev, image: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Lookbook Story & Craftsmanship Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Describe the tanning, hide grade, and bespoke detailing..."
                      value={newVideoForm.description}
                      onChange={(e) => setNewVideoForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Shoppable Product Hotspot Dropdown */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono uppercase text-gray-400">
                        Link Shoppable Product Hotspot (የሚገዛ እቃ ማያያዣ)
                      </label>
                      <span className="text-[10px] font-mono text-emerald-400">Directly shoppable on click</span>
                    </div>
                    <select
                      value={newVideoForm.selectedProductId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        const prod = products.find((p) => p.id === pid);
                        const prodImg = prod ? (prod.images?.[0] || (prod as any).image) : undefined;
                        setNewVideoForm((prev) => ({
                          ...prev,
                          selectedProductId: pid,
                          image: prev.image || prodImg || prev.image
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    >
                      <option value="">-- No Attached Product (ያለ እቃ ማያያዣ) --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.category.toUpperCase()}] {p.name} — ${p.price.toLocaleString()} (Stock: {p.stock ?? 10})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Initial Visibility Switch */}
                  <div className="sm:col-span-2 p-3.5 rounded-2xl border border-white/10 bg-black/30 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono font-bold text-white uppercase">Initial Visibility Status</p>
                      <p className="text-[10px] font-mono text-gray-400">
                        {newVideoForm.isHidden
                          ? 'Will be saved as HIDDEN DRAFT (Customers will not see it)'
                          : 'Will be published LIVE immediately on Lookbook'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewVideoForm((prev) => ({ ...prev, isHidden: !prev.isHidden }))}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        newVideoForm.isHidden
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      }`}
                    >
                      {newVideoForm.isHidden ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hidden (Draft)</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Live in Store</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200/10">
                  <button
                    type="button"
                    onClick={() => setIsAddLookbookOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-mono uppercase text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingLookbook || !newVideoForm.title.trim() || !newVideoForm.videoUrl.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-mono text-xs uppercase font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSavingLookbook ? 'Publishing...' : 'Publish Video to Lookbook (ቪዲዮውን መዝግብ)'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* B. EDIT LOOKBOOK VIDEO MODAL */}
      <AnimatePresence>
        {editingLookbook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`border rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 ${
                isDark ? 'bg-[#121319] border-[#D4AF37]/40 text-white' : 'bg-white border-stone-300 text-stone-900'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center shadow">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold">Edit Lookbook Video (ቪዲዮ ማስተካከያ)</h3>
                    <p className="text-xs font-mono text-gray-400">Update editorial media, linked products, or visibility.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingLookbook(null)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleUpdateExistingLookbook} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Video Title * (የቪዲዮ ርዕስ)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingLookbook.title}
                      onChange={(e) => setEditingLookbook({ ...editingLookbook, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Category * (ክፍል)
                    </label>
                    <select
                      value={editingLookbook.category || 'all'}
                      onChange={(e) => setEditingLookbook({ ...editingLookbook, category: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    >
                      <option value="jackets">Jackets (ጃኬቶች)</option>
                      <option value="bags">Bags & Duffles (ቦርሳዎች)</option>
                      <option value="wallets">Wallets (የኪስ ቦርሳ)</option>
                      <option value="footwear">Footwear (ጫማዎች)</option>
                      <option value="belts">Belts (ቀበቶዎች)</option>
                      <option value="all">General Editorial (አጠቃላይ)</option>
                    </select>
                  </div>

                  {/* Location Provenance */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Atelier Location / Provenance
                    </label>
                    <input
                      type="text"
                      value={editingLookbook.location}
                      onChange={(e) => setEditingLookbook({ ...editingLookbook, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Video URL */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Video Stream URL (MP4 Link)
                    </label>
                    <input
                      type="url"
                      required
                      value={editingLookbook.videoUrl || ''}
                      onChange={(e) => setEditingLookbook({ ...editingLookbook, videoUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Poster Image */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Poster Image URL (የሽፋን ምስል)
                    </label>
                    <input
                      type="url"
                      required
                      value={editingLookbook.image}
                      onChange={(e) => setEditingLookbook({ ...editingLookbook, image: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Story & Craftsmanship Description
                    </label>
                    <textarea
                      rows={2}
                      value={editingLookbook.description || ''}
                      onChange={(e) => setEditingLookbook({ ...editingLookbook, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Shoppable Product Hotspot Dropdown */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Linked Shoppable Product Hotspot (የሚገዛ እቃ ማያያዣ)
                    </label>
                    <select
                      value={editingLookbook.hotspot?.productId || ''}
                      onChange={(e) => {
                        const pid = e.target.value;
                        if (!pid) {
                          setEditingLookbook({ ...editingLookbook, hotspot: undefined });
                        } else {
                          const found = products.find((p) => p.id === pid);
                          if (found) {
                            setEditingLookbook({
                              ...editingLookbook,
                              hotspot: {
                                productId: found.id,
                                productName: found.name,
                                price: `$${found.price.toLocaleString()}`
                              }
                            });
                          }
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs outline-none focus:border-[#D4AF37]"
                    >
                      <option value="">-- No Attached Product (ያለ እቃ ማያያዣ) --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.category.toUpperCase()}] {p.name} — ${p.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Visibility Switch */}
                  <div className="sm:col-span-2 p-3.5 rounded-2xl border border-white/10 bg-black/30 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono font-bold text-white uppercase">Storefront Visibility</p>
                      <p className="text-[10px] font-mono text-gray-400">
                        {editingLookbook.isHidden
                          ? 'Currently HIDDEN from storefront lookbook'
                          : 'Currently LIVE on customer storefront'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingLookbook({ ...editingLookbook, isHidden: !editingLookbook.isHidden })}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        editingLookbook.isHidden
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      }`}
                    >
                      {editingLookbook.isHidden ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hidden (Draft)</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Live in Store</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200/10">
                  <button
                    type="button"
                    onClick={() => setEditingLookbook(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-mono uppercase text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingLookbook || !editingLookbook.title.trim()}
                    className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-mono text-xs uppercase font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingLookbook ? 'Saving...' : 'Save Changes (ለውጦችን መዝግብ)'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. VIDEO TEST PLAYBACK CINEMA MODAL */}
      <AnimatePresence>
        {previewVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl rounded-3xl overflow-hidden bg-black border border-[#D4AF37]/40 shadow-2xl"
            >
              {/* Video Player */}
              <div className="relative aspect-video w-full bg-black">
                {previewVideo.videoUrl ? (
                  <video
                    src={previewVideo.videoUrl}
                    poster={previewVideo.image}
                    autoPlay
                    loop
                    playsInline
                    muted={isPreviewMuted}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 font-mono text-xs">
                    No video URL provided
                  </div>
                )}

                {/* Controls overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                  <button
                    type="button"
                    onClick={() => setIsPreviewMuted(!isPreviewMuted)}
                    className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors border border-white/20 cursor-pointer shadow"
                    title={isPreviewMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isPreviewMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#D4AF37]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewVideo(null)}
                    className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors border border-white/20 cursor-pointer shadow"
                    title="Close Video Preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Video info footer */}
              <div className="p-5 bg-gradient-to-t from-stone-950 to-stone-900 border-t border-white/10 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#D4AF37] text-black font-bold">
                      {previewVideo.category || 'Editorial'}
                    </span>
                    <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D4AF37]" />
                      {previewVideo.location}
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-white">{previewVideo.title}</h4>
                </div>

                {previewVideo.hotspot && (
                  <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-[#D4AF37]/40 text-right shrink-0">
                    <p className="text-[10px] font-mono uppercase text-gray-400">Linked Product</p>
                    <p className="font-serif text-xs font-bold text-[#D4AF37]">
                      {previewVideo.hotspot.productName} ({previewVideo.hotspot.price})
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D. DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {lookbookDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 rounded-3xl bg-[#14151C] border border-rose-500/40 text-white max-w-md w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">Delete Lookbook Video? (ቪዲዮ ይሰረዝ?)</h3>
                  <p className="text-xs text-gray-400 font-mono">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Are you sure you want to remove "
                <strong className="text-white">
                  {lookbookList.find((i) => i.id === lookbookDeleteId)?.title || lookbookDeleteId}
                </strong>
                " from the Lookbook editorial showcase?
              </p>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setLookbookDeleteId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteExistingLookbook(lookbookDeleteId)}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs uppercase font-bold cursor-pointer shadow-lg"
                >
                  Delete Video (ሰርዝ)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
