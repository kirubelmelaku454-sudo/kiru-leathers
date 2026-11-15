import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  Moon,
  Sun,
  X,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  Shield,
  Award,
  Feather,
  Menu,
  Sparkles,
  Heart,
  Globe,
  Scissors,
  User as UserIcon,
  Package,
  Phone
} from 'lucide-react';
import { type Product, type ProductColor, type CartItem, type CartItemCustomization, type CraftsmanshipStep, type FAQItem, type ProductReview, type Order, type User, type CustomerMessage, type OrderNotification, type LookbookItem } from './types';
import { DEFAULT_SITE_CONTENT, type SiteContent } from './data/defaultSiteContent';
import { DEFAULT_LOOKBOOK_ITEMS } from './data/defaultLookbook';
import { MOCK_PRODUCTS } from './data/mockProducts';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductModal } from './components/ProductModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CartDrawer } from './components/CartDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AuthModal } from './components/AuthModal';
import { CustomerDashboardModal } from './components/CustomerDashboardModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { PrintableInvoiceModal } from './components/PrintableInvoiceModal';
import { CertificateOfAuthenticityModal } from './components/CertificateOfAuthenticityModal';
import { PublicOrderTrackingModal } from './components/PublicOrderTrackingModal';
import { BespokeStudioModal } from './components/BespokeStudioModal';
import { AiConciergeModal } from './components/AiConciergeModal';
import { LookbookSection } from './components/LookbookSection';
import { SpecialOffersPage } from './components/SpecialOffersPage';
import { DEFAULT_SPECIAL_OFFER } from './data/defaultSpecialOffer';
import { type SpecialOfferCampaign } from './types';
import { KiruLogo } from './components/KiruLogo';
import type { Language } from './i18n/translations';
import { playLuxuryChime } from './utils/audioAlert';

const CRAFTSMANSHIP_STEPS: CraftsmanshipStep[] = [
  {
    id: 'hide',
    title: '1. Premium Hide Selection',
    subtitle: 'Top 1% Vegetable-Tanned Italian Hides',
    description: 'We source exclusively unblemished full-grain hides from certified Tuscan tanneries. Natural vegetable tanning preserves character while ensuring unmatched tensile strength.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80',
    stats: [
      { label: 'Grain Retained', value: '100%' },
      { label: 'Tanning Duration', value: '60 Days' }
    ]
  },
  {
    id: 'stitch',
    title: '2. Saddle Stitch Precision',
    subtitle: 'Hand-sewn with Two Needles and Waxed Thread',
    description: 'Unlike machine lock-stitching which unravels if a single thread snaps, our traditional saddle stitch locks every node independently, guaranteeing structural integrity for generations.',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80',
    stats: [
      { label: 'Tensile Resistance', value: '120 lbs/in' },
      { label: 'Lifetime Promise', value: '100 Years' }
    ]
  },
  {
    id: 'finish',
    title: '3. Natural Edge Finishing',
    subtitle: '7-Layer Hand-Beveled & Beeswax Burnished Edges',
    description: 'Every exposed leather edge is manually beveled, sanded across multiple grits, and sealed with organic beeswax before heat-burnishing for a smooth, waterproof finish.',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80',
    stats: [
      { label: 'Coating Layers', value: '7 Step Process' },
      { label: 'Water Sealing', value: 'Impervious' }
    ]
  }
];


const FAQS: FAQItem[] = [
  {
    q: 'How does Kiru Leathers source its leather hides?',
    a: 'We exclusively source European full-grain calfskins certified by the Leather Working Group (LWG). Our hides are vegetable-tanned in Tuscany using organic tree barks, ensuring no toxic chrome is introduced to the environment.'
  },
  {
    q: 'What is covered under the Lifetime Guarantee?',
    a: 'Every stitch, seam, rivet, and zipper is warrantied for life. If your Kiru Leather product experiences hardware failure or structural thread wear under normal use, we repair or replace it free of charge.'
  },
  {
    q: 'How should I condition and care for my full-grain leather?',
    a: 'We recommend applying Kiru Natural Beeswax Conditioner once every 3 to 6 months. Avoid direct heating vents and wipe away water splashes with a clean micro-fiber cloth.'
  },
  {
    q: 'What is your international shipping and return policy?',
    a: 'We offer complimentary express shipping worldwide. Returns and exchanges are accepted within 30 days of delivery provided items remain un-worn in original dust bags.'
  }
];

export default function App() {
  // Always default to pristine luxury LIGHT mode
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // By default, no user is logged in on fresh browser load (session persistence preserves login across tab interactions)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem('kiru_session_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // User-isolated Cart Persistence via localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedUserStr = localStorage.getItem('kiru_user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      const key = savedUser?.email ? `kiru_cart_${savedUser.email}` : 'kiru_cart_guest';
      const savedCart = localStorage.getItem(key);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kiru_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [currency, setCurrency] = useState<'USD' | 'ETB'>('USD');
  const exchangeRate = 125; // 1 USD = 125 ETB

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('kiru_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState<CustomerMessage[]>(() => {
    try {
      const saved = localStorage.getItem('kiru_customer_messages');
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'msg-sample-1',
          fullName: 'Amanuel Kebede',
          email: 'amanuel.k@ethiopianaviation.com',
          phone: '+251911445566',
          inquiryType: 'bespoke',
          message: 'Hello, I am interested in ordering a bespoke Florence Aviator leather jacket with custom chestnut brown shearling collar. Can we schedule a fitting at your Bole atelier this Saturday?',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          status: 'new'
        },
        {
          id: 'msg-sample-2',
          fullName: 'Helena Vance',
          email: 'helena.vance@luxurydiplomacy.org',
          phone: '+251920112233',
          inquiryType: 'general',
          message: 'Our organization would like to commission 25 debossed full-grain Tuscan briefcases for our upcoming trade summit delegates. Please send your corporate catalog and lead times.',
          createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
          status: 'new'
        }
      ];
    } catch {
      return [];
    }
  });

  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [lookbookItems, setLookbookItems] = useState<LookbookItem[]>(() => {
    try {
      const saved = localStorage.getItem('kiru_lookbook_items');
      return saved ? JSON.parse(saved) : DEFAULT_LOOKBOOK_ITEMS;
    } catch {
      return DEFAULT_LOOKBOOK_ITEMS;
    }
  });
  const [activePage, setActivePage] = useState<'home' | 'about' | 'contact' | 'offers'>('home');
  const [specialOffer, setSpecialOffer] = useState<SpecialOfferCampaign>(() => {
    try {
      const saved = localStorage.getItem('kiru_special_offer');
      return saved ? JSON.parse(saved) : DEFAULT_SPECIAL_OFFER;
    } catch {
      return DEFAULT_SPECIAL_OFFER;
    }
  });

  const isOfferCurrentlyLive = useMemo(() => {
    if (!specialOffer || !specialOffer.isEnabled) return false;
    const now = Date.now();
    const start = new Date(specialOffer.startDate).getTime();
    const end = new Date(specialOffer.endDate).getTime();
    return now >= start && now < end;
  }, [specialOffer]);

  const handleOfferExpired = () => {
    if (activePage === 'offers') {
      setActivePage('home');
      setToastMessage('Atelier Special Offer has concluded. Thank you for visiting!');
    }
  };
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCustomerDashboardOpen, setIsCustomerDashboardOpen] = useState<boolean>(false);
  const [customerDashboardTab, setCustomerDashboardTab] = useState<'orders' | 'messages' | 'profile'>('orders');
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedCertificateOrder, setSelectedCertificateOrder] = useState<Order | null>(null);
  const [isPublicTrackingOpen, setIsPublicTrackingOpen] = useState<boolean>(false);
  const [isBespokeStudioOpen, setIsBespokeStudioOpen] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>(() => {
    try {
      return (localStorage.getItem('kiru_lang') as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  const toggleLanguage = () => {
    const nextLang: Language = lang === 'en' ? 'am' : 'en';
    setLang(nextLang);
    try {
      localStorage.setItem('kiru_lang', nextLang);
    } catch {}
  };

  // Sync Theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kiru_theme', theme);
    } catch {}
  }, [theme]);

  // Sync User to localStorage & sessionStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('kiru_user', JSON.stringify(user));
        sessionStorage.setItem('kiru_session_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('kiru_user');
        sessionStorage.removeItem('kiru_session_user');
      }
    } catch (e) {
      console.error('Failed to save user:', e);
    }
  }, [user]);

  // Refresh signed-in user profile from server on startup if token exists
  useEffect(() => {
    const token = localStorage.getItem('kiru_token');
    if (!token || !user) return;
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((freshUser: User | null) => {
        if (freshUser && freshUser.email) {
          setUser(freshUser);
        }
      })
      .catch(() => {});
  }, []);

  // Sync Orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kiru_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders:', e);
    }
  }, [orders]);

  // Sync Messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kiru_customer_messages', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save customer messages:', e);
    }
  }, [messages]);

  // Switch cart when user logs in or out
  useEffect(() => {
    try {
      const key = user?.email ? `kiru_cart_${user.email}` : 'kiru_cart_guest';
      const savedCart = localStorage.getItem(key);
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } catch {
      setCart([]);
    }
  }, [user?.email]);

  // Sync Cart to localStorage keyed to active user
  useEffect(() => {
    try {
      const key = user?.email ? `kiru_cart_${user.email}` : 'kiru_cart_guest';
      localStorage.setItem(key, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cart, user?.email]);

  // Sync Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kiru_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage:', e);
    }
  }, [wishlist]);

  // Detect Chapa return redirect and celebrate
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isChapa = urlParams.get('chapa_verified');
      const txRef = urlParams.get('tx_ref');

      if (isChapa === 'true' || txRef) {
        playLuxuryChime('order');
        setToastMessage('🎉 Chapa payment secured! Your bespoke heirloom piece is officially in atelier craftsmanship queue.');
        setTimeout(() => setToastMessage(null), 6000);

        fetch('/api/orders')
          .then((res) => res.json())
          .then((ords: Order[]) => {
            if (Array.isArray(ords) && ords.length > 0) {
              const target = txRef ? ords.find((o) => o.id === txRef) : ords[0];
              if (target) setCompletedOrder(target);
            }
          })
          .catch(() => {});

        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {}
  }, []);

  // Fetch Products, Orders, Messages & Set Up Real-Time Event Stream
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Fetch products
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data: Product[]) => {
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data);
          } else {
            setProducts(MOCK_PRODUCTS);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProducts(MOCK_PRODUCTS);
          setLoading(false);
        }
      });

    // Initial orders fetch
    fetch('/api/orders')
      .then((res) => res.json())
      .then((serverOrders: Order[]) => {
        if (isMounted && Array.isArray(serverOrders) && serverOrders.length > 0) {
          setOrders(serverOrders);
        }
      })
      .catch(() => {});

    // Initial messages fetch
    fetch('/api/messages')
      .then((res) => (res.ok ? res.json() : null))
      .then((serverMessages: CustomerMessage[] | null) => {
        if (isMounted && Array.isArray(serverMessages)) {
          setMessages(serverMessages);
        }
      })
      .catch(() => {});

    // Initial site content fetch (About Us & Contact CMS)
    fetch('/api/content')
      .then((res) => (res.ok ? res.json() : null))
      .then((contentData: SiteContent | null) => {
        if (isMounted && contentData) {
          setSiteContent((prev) => ({
            about: { ...prev.about, ...(contentData.about || {}) },
            contact: { ...prev.contact, ...(contentData.contact || {}) }
          }));
        }
      })
      .catch(() => {});

    // Initial lookbook fetch
    fetch('/api/lookbook')
      .then((res) => (res.ok ? res.json() : null))
      .then((lbData: LookbookItem[] | null) => {
        if (isMounted && Array.isArray(lbData) && lbData.length > 0) {
          setLookbookItems(lbData);
          try {
            localStorage.setItem('kiru_lookbook_items', JSON.stringify(lbData));
          } catch {}
        }
      })
      .catch(() => {});

    // Check if customer returned from Chapa verification
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('chapa_verified') === 'true') {
      const txRef = urlParams.get('tx_ref');
      if (txRef) {
        fetch(`/api/payments/chapa/verify/${txRef}`)
          .then((r) => r.json())
          .then(() => {
            showToast('✓ Chapa Payment Verified! Your order is now in the atelier.');
            playLuxuryChime('success');
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .catch(() => {});
      } else {
        showToast('✓ Payment Verified! Your order has been registered.');
        playLuxuryChime('success');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Real-Time Cross-Tab Synchronization via BroadcastChannel
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('kiru_atelier_realtime');
      broadcastChannel.onmessage = (event) => {
        if (!isMounted) return;
        const payload = event.data;
        if (payload?.type === 'NEW_ORDER' && payload.order) {
          const ord: Order = payload.order;
          setOrders((prev) => (prev.some((o) => o.id === ord.id) ? prev : [ord, ...prev]));
          playLuxuryChime('order');
          showToast(`🔔 New Order Commission: ${ord.id} (${ord.customer.fullName})`);
          if (Array.isArray(payload.products) && payload.products.length > 0) {
            setProducts(payload.products);
          } else {
            setProducts((prev) =>
              prev.map((p) => {
                const match = ord.items?.find((it) => (it.product?.id || (it as any).productId || (it as any).id) === p.id);
                if (match) {
                  const cur = p.stock !== undefined && p.stock !== null ? Number(p.stock) : 10;
                  return { ...p, stock: Math.max(0, cur - Number(match.quantity || 1)) };
                }
                return p;
              })
            );
          }
        } else if (payload?.type === 'PRODUCTS_UPDATED' && Array.isArray(payload.products)) {
          setProducts(payload.products);
        } else if (payload?.type === 'NEW_MESSAGE' && payload.message) {
          const msg: CustomerMessage = payload.message;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [msg, ...prev]));
          playLuxuryChime('alert');
          showToast(`✉️ New Atelier Consultation: ${msg.fullName}`);
        } else if (payload?.type === 'MESSAGE_REPLIED' && payload.message) {
          const msg: CustomerMessage = payload.message;
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
          playLuxuryChime('alert');
          showToast(`💬 Message Updated: ${msg.fullName}`);
        }
      };
    } catch {}

    // Real-Time Server-Sent Events (SSE) from Backend: Instant zero-latency push
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const parsed = JSON.parse(event.data);
          const dataPayload = parsed.payload || parsed;

          if (parsed.type === 'NEW_ORDER') {
            const ord: Order | undefined = dataPayload?.order || (dataPayload?.id ? dataPayload : undefined);
            if (!ord?.id) return;
            setOrders((prev) => {
              if (prev.some((o) => o.id === ord.id)) return prev;
              return [ord, ...prev];
            });
            playLuxuryChime('order');
            showToast(`🔔 New Customer Order Received: ${ord.id} (${ord.customer?.fullName || 'Client'})`);

            if (Array.isArray(dataPayload?.products) && dataPayload.products.length > 0) {
              setProducts(dataPayload.products);
            } else {
              // Instant stock deduction in client catalog
              setProducts((prev) =>
                prev.map((p) => {
                  const match = ord.items?.find((it) => (it.product?.id || (it as any).productId || (it as any).id) === p.id);
                  if (match) {
                    const cur = p.stock !== undefined && p.stock !== null ? Number(p.stock) : 10;
                    return { ...p, stock: Math.max(0, cur - Number(match.quantity || 1)) };
                  }
                  return p;
                })
              );
            }
          } else if (parsed.type === 'PRODUCTS_UPDATED' || parsed.type === 'PRODUCT_UPDATED') {
            if (Array.isArray(dataPayload?.products)) {
              setProducts(dataPayload.products);
            } else if (dataPayload?.product) {
              const updatedP = dataPayload.product;
              setProducts((prev) => prev.map((p) => (p.id === updatedP.id ? { ...p, ...updatedP } : p)));
            }
          } else if (parsed.type === 'CONTENT_UPDATED') {
            const { section, content } = dataPayload || {};
            if (section === 'about' || section === 'contact') {
              const targetKey = section as 'about' | 'contact';
              setSiteContent((prev) => ({
                ...prev,
                [targetKey]: { ...prev[targetKey], ...(content || {}) }
              }));
              showToast(`📝 ${section === 'about' ? 'About Us' : 'Contact'} page updated.`);
            }
          } else if (parsed.type === 'LOOKBOOK_UPDATED') {
            const items = dataPayload?.items || (Array.isArray(dataPayload) ? dataPayload : null);
            if (Array.isArray(items)) {
              setLookbookItems(items);
              try {
                localStorage.setItem('kiru_lookbook_items', JSON.stringify(items));
              } catch {}
              showToast('🎬 Lookbook Editorial updated in real time.');
            }
          } else if (parsed.type === 'ORDER_STATUS_UPDATED' || parsed.type === 'ORDER_UPDATED') {
            const ord = dataPayload?.order || (dataPayload?.id ? dataPayload : undefined);
            const targetId = ord?.id || dataPayload?.orderId;
            if (!targetId) return;
            setOrders((prev) =>
              prev.map((o) =>
                o.id === targetId
                  ? { ...o, ...(ord || {}), status: ord?.status || dataPayload?.status || o.status }
                  : o
              )
            );
          } else if (parsed.type === 'ORDER_PAYMENT_VERIFIED' || parsed.type === 'PAYMENT_VERIFIED') {
            const ord = dataPayload?.order || (dataPayload?.id ? dataPayload : undefined);
            const targetId = ord?.id || dataPayload?.orderId;
            if (!targetId) return;
            setOrders((prev) =>
              prev.map((o) =>
                o.id === targetId
                  ? {
                      ...o,
                      ...(ord || {}),
                      status: ord?.status || dataPayload?.status || o.status,
                      paymentStatus: ord?.paymentStatus || dataPayload?.paymentStatus || o.paymentStatus,
                      rejectionReason: ord?.rejectionReason || dataPayload?.rejectionReason
                    }
                  : o
              )
            );
          } else if (parsed.type === 'NEW_MESSAGE') {
            const msg: CustomerMessage | undefined = dataPayload?.message || (dataPayload?.id ? dataPayload : undefined);
            if (!msg?.id) return;
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [msg, ...prev];
            });
            playLuxuryChime('alert');
            showToast(`✉️ New Atelier Consultation: ${msg.fullName}`);
          } else if (parsed.type === 'MESSAGE_REPLIED' || parsed.type === 'MESSAGE_STATUS_UPDATED') {
            const msg: CustomerMessage | undefined = dataPayload?.message || (dataPayload?.id ? dataPayload : undefined);
            if (!msg?.id) return;
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === msg.id);
              return exists ? prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)) : [msg, ...prev];
            });
            playLuxuryChime('alert');
            showToast(
              msg.status === 'replied'
                ? `💬 Kiru Atelier Replied to ${msg.fullName}`
                : `✉️ Client Follow-up from ${msg.fullName}`
            );
          }
        } catch {}
      };
    } catch {}

    // Smart fallback sync (every 12 seconds) for orders, messages, & inventory stock
    const syncInterval = setInterval(() => {
      fetch('/api/orders')
        .then((res) => (res.ok ? res.json() : null))
        .then((serverOrders: Order[] | null) => {
          if (isMounted && Array.isArray(serverOrders) && serverOrders.length > 0) {
            setOrders((prev) => {
              if (prev.length === serverOrders.length && prev[0]?.id === serverOrders[0]?.id && prev[0]?.status === serverOrders[0]?.status) {
                return prev;
              }
              return serverOrders;
            });
          }
        })
        .catch(() => {});

      fetch('/api/messages')
        .then((res) => (res.ok ? res.json() : null))
        .then((serverMsgs: CustomerMessage[] | null) => {
          if (isMounted && Array.isArray(serverMsgs)) {
            setMessages(serverMsgs);
          }
        })
        .catch(() => {});

      fetch('/api/products')
        .then((res) => (res.ok ? res.json() : null))
        .then((serverProds: Product[] | null) => {
          if (isMounted && Array.isArray(serverProds) && serverProds.length > 0) {
            setProducts((prev) => {
              const hasDiff = serverProds.some((sp) => {
                const match = prev.find((p) => p.id === sp.id);
                return !match || match.stock !== sp.stock;
              });
              return hasDiff ? serverProds : prev;
            });
          }
        })
        .catch(() => {});
    }, 12000);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kiru_orders' && e.newValue && isMounted) {
        try {
          setOrders(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'kiru_customer_messages' && e.newValue && isMounted) {
        try {
          const parsedMsgs = JSON.parse(e.newValue);
          if (Array.isArray(parsedMsgs)) {
            setMessages(parsedMsgs);
            playLuxuryChime('alert');
            const newest = parsedMsgs[0];
            if (newest && newest.status === 'new') {
              showToast(`🔔 አዲስ የደንበኛ መልእክት ደርሷል: ${newest.fullName} (${newest.inquiryType})`);
            }
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleStorageChange);
      if (eventSource) {
        eventSource.close();
      }
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const addToCart = (product: Product, color?: ProductColor, size?: string, qty = 1, customization?: CartItemCustomization) => {
    const selectedColor = color || (product.colors && product.colors[0]) || { name: 'Standard', hex: '#000000' };
    const selectedSize = size || (product.sizes && product.sizes[0]) || 'Standard';

    setCart(prevCart => {
      if (customization) {
        return [...prevCart, { product, color: selectedColor, size: selectedSize, quantity: qty, customization }];
      }

      const existingIdx = prevCart.findIndex(
        item => !item.customization && item.product.id === product.id && item.color.name === selectedColor.name && item.size === selectedSize
      );
      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx].quantity += qty;
        return updated;
      }
      return [...prevCart, { product, color: selectedColor, size: selectedSize, quantity: qty }];
    });
    showToast(`Added "${product.name}" to your shopping bag.`);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed item from Saved Wishlist.');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Item saved to your Wishlist.');
        return [...prev, productId];
      }
    });
  };

  const handleAddReview = async (productId: string, newReview: ProductReview) => {
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === productId) {
          const currentReviews = p.reviews || [];
          const updatedReviews = [newReview, ...currentReviews];
          const newAvg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
          return {
            ...p,
            reviews: updatedReviews,
            reviewsCount: updatedReviews.length,
            rating: Number(newAvg.toFixed(1))
          };
        }
        return p;
      })
    );

    setSelectedProduct(prev => {
      if (!prev || prev.id !== productId) return prev;
      const currentReviews = prev.reviews || [];
      const updatedReviews = [newReview, ...currentReviews];
      const newAvg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
      return {
        ...prev,
        reviews: updatedReviews,
        reviewsCount: updatedReviews.length,
        rating: Number(newAvg.toFixed(1))
      };
    });

    try {
      await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReview,
          userId: user?.id
        })
      });
    } catch {}

    playLuxuryChime('success');
    showToast('Verified review published to atelier registry.');
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch {}
    showToast(`Order status updated to ${status}.`);
  };

  const handleVerifyPayment = async (orderId: string, action: 'approve' | 'reject', reason?: string) => {
    const updatedStatus = action === 'approve' ? 'Processing' : 'Payment Rejected';
    const updatedPaymentStatus = action === 'approve' ? 'Approved' : 'Rejected';

    const targetOrder = orders.find(o => o.id === orderId);

    const newNotification: OrderNotification = {
      id: `notif-${Date.now()}`,
      type: action === 'approve' ? 'payment_verified' : 'payment_rejected',
      title: action === 'approve' ? 'Payment Verified & Approved' : 'Payment Receipt Unverified',
      message: action === 'approve'
        ? `SMS to ${targetOrder?.customer.phone || 'client'}: Your payment was verified by Kiru Leathers. Piece has entered master artisan cutting & stitching.`
        : `SMS to ${targetOrder?.customer.phone || 'client'}: Payment receipt rejected: ${reason || 'Unverified'}. Please contact concierge.`,
      timestamp: new Date().toISOString(),
      channel: 'sms'
    };

    setOrders(prev =>
      prev.map(o => (o.id === orderId ? {
        ...o,
        status: updatedStatus,
        paymentStatus: updatedPaymentStatus,
        rejectionReason: action === 'reject' ? reason : undefined,
        notifications: [newNotification, ...(o.notifications || [])]
      } : o))
    );

    // Auto-deplete inventory stock on payment approval
    if (action === 'approve' && targetOrder) {
      setProducts(prevProducts =>
        prevProducts.map(p => {
          const itemInOrder = targetOrder.items.find(it => it.product.id === p.id);
          if (itemInOrder) {
            const curStock = p.stock !== undefined ? p.stock : 10;
            return { ...p, stock: Math.max(0, curStock - itemInOrder.quantity) };
          }
          return p;
        })
      );
    }

    try {
      await fetch(`/api/orders/${orderId}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });
    } catch (e) {
      console.warn('Backend payment verification sync failed:', e);
    }

    playLuxuryChime(action === 'approve' ? 'success' : 'alert');

    if (action === 'approve') {
      showToast(`Order ${orderId}: Payment verified. SMS alert dispatched to client.`);
    } else {
      showToast(`Order ${orderId}: Payment rejected.`);
    }
  };

  const refreshMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) return;
      const serverMessages: CustomerMessage[] = await res.json();
      if (Array.isArray(serverMessages)) {
        setMessages(serverMessages);
      }
    } catch {}
  };

  const handleIncomingMessage = async (newMessage: CustomerMessage): Promise<boolean> => {
    const token = localStorage.getItem('kiru_token');
    if (!token || !user) {
      setIsAuthModalOpen(true);
      showToast('Please sign in first to message our concierge.');
      return false;
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newMessage)
      });

      if (res.status === 401) {
        setIsAuthModalOpen(true);
        showToast('Please sign in again to dispatch your message.');
        return false;
      }

      if (!res.ok) {
        throw new Error('Failed to save customer message');
      }

      const payload = await res.json();
      const savedMsg: CustomerMessage = payload?.data || newMessage;

      setMessages((prev) => {
        if (prev.some((m) => m.id === savedMsg.id)) return prev;
        const updated = [savedMsg, ...prev];
        try {
          localStorage.setItem('kiru_customer_messages', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Broadcast across all open browser tabs/windows
      try {
        const bc = new BroadcastChannel('kiru_atelier_realtime');
        bc.postMessage({ type: 'NEW_MESSAGE', message: savedMsg });
        bc.close();
      } catch {}

      playLuxuryChime('alert');
      showToast(`🔔 መልእክትዎ ተልኳል: ${savedMsg.fullName} (${savedMsg.inquiryType.toUpperCase()})`);
      return true;
    } catch (err) {
      console.error('Error dispatching customer message:', err);
      showToast('Unable to send message. Please check your connection and try again.');
      return false;
    }
  };

  const handleCustomerReplyMessage = async (messageId: string, replyText: string): Promise<boolean> => {
    const token = localStorage.getItem('kiru_token');
    if (!token || !user) {
      setIsAuthModalOpen(true);
      return false;
    }

    try {
      const res = await fetch(`/api/messages/${messageId}/customer-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      });

      if (res.status === 401) {
        setIsAuthModalOpen(true);
        return false;
      }
      if (!res.ok) {
        throw new Error('Failed to send follow-up reply');
      }

      const data = await res.json();
      const updatedMsg: CustomerMessage | undefined = data?.data;

      if (updatedMsg) {
        setMessages((prev) => {
          const updated = prev.map((m) => (m.id === messageId ? { ...m, ...updatedMsg } : m));
          try {
            localStorage.setItem('kiru_customer_messages', JSON.stringify(updated));
          } catch {}
          return updated;
        });

        try {
          const bc = new BroadcastChannel('kiru_atelier_realtime');
          bc.postMessage({ type: 'MESSAGE_REPLIED', message: updatedMsg });
          bc.close();
        } catch {}
      }

      playLuxuryChime('success');
      showToast('✉️ Follow-up reply sent to Kiru Atelier Concierge!');
      return true;
    } catch (err) {
      console.error('Failed to send customer reply:', err);
      showToast('Unable to send reply right now.');
      return false;
    }
  };

  const handleUpdateMessageStatus = (messageId: string, status: CustomerMessage['status']) => {
    setMessages((prev) => {
      const updated = prev.map((m) => (m.id === messageId ? { ...m, status } : m));
      try {
        localStorage.setItem('kiru_customer_messages', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      const token = localStorage.getItem('kiru_token');
      fetch(`/api/messages/${messageId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status })
      }).catch(() => {});
    } catch {}
    showToast(status === 'replied' ? 'Client message marked as Replied.' : 'Message status updated.');
  };

  const handleReplyMessage = async (messageId: string, replyText: string) => {
    try {
      const token = localStorage.getItem('kiru_token');
      const res = await fetch(`/api/messages/${messageId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          reply: replyText,
          repliedBy: 'Kiru Atelier Master Artisan'
        })
      });
      if (res.status === 401 || res.status === 403) {
        setIsAuthModalOpen(true);
        showToast('Please sign in with an Admin account to send official replies.');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Reply dispatch failed');
      }
      const updatedMsg: CustomerMessage | undefined = data.data;

      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === messageId
            ? updatedMsg || {
                ...m,
                reply: replyText,
                replyDate: new Date().toISOString(),
                repliedBy: 'Kiru Atelier Master Artisan',
                status: 'replied' as const
              }
            : m
        );
        try {
          localStorage.setItem('kiru_customer_messages', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Broadcast update across tabs
      try {
        const bc = new BroadcastChannel('kiru_atelier_realtime');
        bc.postMessage({
          type: 'MESSAGE_REPLIED',
          message: updatedMsg || {
            id: messageId,
            reply: replyText,
            replyDate: new Date().toISOString(),
            repliedBy: 'Kiru Atelier Master Artisan',
            status: 'replied'
          }
        });
        bc.close();
      } catch {}

      playLuxuryChime('success');
      showToast('✉️ Reply dispatched directly to client dashboard!');
    } catch (err: any) {
      console.error('Failed to reply to message:', err);
      // Fallback local update
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                reply: replyText,
                replyDate: new Date().toISOString(),
                repliedBy: 'Kiru Atelier Master Artisan',
                status: 'replied' as const
              }
            : m
        )
      );
      playLuxuryChime('success');
      showToast('✉️ Reply recorded locally for client!');
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
    } catch {}
    showToast(`Added "${newProduct.name}" to Atelier Collection.`);
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
    } catch {}
    showToast('Product removed from catalog.');
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    try {
      await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
    } catch {}
    showToast(`Updated "${updatedProduct.name}".`);
  };

  const handleUpdateProductStock = async (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    try {
      const token = localStorage.getItem('kiru_token');
      await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ stock: newStock })
      });
    } catch {}
  };

  const handleUpdateSiteContent = async (section: 'about' | 'contact', newContent: any): Promise<boolean> => {
    setSiteContent(prev => ({
      ...prev,
      [section]: { ...prev[section], ...(newContent || {}) }
    }));
    try {
      const token = localStorage.getItem('kiru_token');
      const res = await fetch(`/api/content/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newContent)
      });
      if (res.ok) {
        showToast(`✅ ${section === 'about' ? 'About Us' : 'Contact'} content saved to database.`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleToggleProductVisibility = async (productId: string) => {
    setProducts(prev => {
      const target = prev.find(p => p.id === productId);
      const isCurrentlyHidden = Boolean(target?.hidden || target?.is_hidden);
      const newHidden = !isCurrentlyHidden;

      const updated = prev.map(p => {
        if (p.id === productId) {
          return { ...p, hidden: newHidden, is_hidden: newHidden ? 1 : 0 };
        }
        return p;
      });

      try {
        fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hidden: newHidden, is_hidden: newHidden ? 1 : 0 })
        }).catch(() => {});
      } catch {}

      showToast(newHidden ? `"${target?.name}" is now hidden from storefront.` : `"${target?.name}" is now visible on storefront.`);
      return updated;
    });
  };

  const handleAddLookbookItem = async (newItem: LookbookItem) => {
    setLookbookItems((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem('kiru_lookbook_items', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      const token = localStorage.getItem('kiru_token');
      const res = await fetch('/api/lookbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        showToast(`✅ Lookbook video published: ${newItem.title}`);
        return true;
      }
    } catch {}
  };

  const handleUpdateLookbookItem = async (id: string, updates: Partial<LookbookItem>) => {
    setLookbookItems((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      try {
        localStorage.setItem('kiru_lookbook_items', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      const token = localStorage.getItem('kiru_token');
      const res = await fetch(`/api/lookbook/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        if (updates.isHidden !== undefined) {
          showToast(updates.isHidden ? '👁️‍🗨️ Video hidden from customer lookbook' : '✨ Video visible in customer lookbook');
        } else {
          showToast('✅ Lookbook video updated');
        }
        return true;
      }
    } catch {}
  };

  const handleDeleteLookbookItem = async (id: string) => {
    setLookbookItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('kiru_lookbook_items', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      const token = localStorage.getItem('kiru_token');
      const res = await fetch(`/api/lookbook/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        showToast('🗑️ Lookbook video removed');
        return true;
      }
    } catch {}
  };

  const handleReorderLookbookItems = async (reordered: LookbookItem[]) => {
    setLookbookItems(reordered);
    try {
      localStorage.setItem('kiru_lookbook_items', JSON.stringify(reordered));
    } catch {}
    try {
      const token = localStorage.getItem('kiru_token');
      await fetch('/api/lookbook', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ items: reordered })
      });
      showToast('↕️ Lookbook order resequenced');
    } catch {}
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    if (
      loggedInUser.email &&
      (loggedInUser.email.toLowerCase() === 'admin@kiruleathers.com' ||
        loggedInUser.email.toLowerCase() === 'kirubelmelaku454@gmail.com')
    ) {
      loggedInUser.role = 'admin';
    }
    setUser(loggedInUser);
    try {
      sessionStorage.setItem('kiru_session_user', JSON.stringify(loggedInUser));
    } catch {}
    showToast(`Welcome back, ${loggedInUser.name}`);
    if (loggedInUser.role === 'admin') {
      setIsAdminPortalOpen(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem('kiru_session_user');
      localStorage.removeItem('kiru_user');
      localStorage.removeItem('kiru_token');
    } catch {}
    setIsCustomerDashboardOpen(false);
    setIsAdminPortalOpen(false);
    showToast('Signed out of Kiru Leathers.');
  };

  const handleOpenAdmin = () => {
    if (user?.role === 'admin') {
      setIsAdminPortalOpen(true);
    } else {
      setIsAuthModalOpen(true);
      showToast('Please sign in with your Admin account (የአስተዳዳሪ አካውንትዎን ያስገቡ)');
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const unreadMessagesCount = useMemo(() => {
    return messages.filter(m => m.status === 'new').length;
  }, [messages]);

  const customerRepliedCount = useMemo(() => {
    if (!user || user.role === 'admin') return 0;
    return messages.filter((m) => {
      const belongs =
        (m.userId && user.id && m.userId === user.id) ||
        (m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase());
      const hasAdminReply = Boolean(m.reply || m.thread?.some((entry) => entry.senderRole === 'admin'));
      return belongs && m.status === 'replied' && hasAdminReply;
    }).length;
  }, [messages, user]);

  return (
    <div className={`${theme === 'dark' ? 'bg-[#0B0B0C] text-[#F5F5F7]' : 'bg-white text-[#111111]'} font-sans min-h-screen transition-colors duration-300 selection:bg-[#D4AF37] selection:text-black`}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[100] bg-[#3D2314] text-[#F5F5F7] border border-[#D4AF37]/40 px-5 py-3.5 rounded-lg shadow-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-sm font-medium tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        cartCount={cartItemsCount}
        wishlistCount={wishlist.length}
        unreadMessagesCount={unreadMessagesCount}
        customerRepliesCount={customerRepliedCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSignIn={() => setIsAuthModalOpen(true)}
        user={user}
        onOpenDashboard={() => {
          setCustomerDashboardTab(customerRepliedCount > 0 ? 'messages' : 'orders');
          setIsCustomerDashboardOpen(true);
        }}
        onOpenAdmin={handleOpenAdmin}
        onOpenPublicTracking={() => setIsPublicTrackingOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        currency={currency}
        onToggleCurrency={() => setCurrency(prev => prev === 'USD' ? 'ETB' : 'USD')}
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOfferLive={isOfferCurrentlyLive}
        specialOffer={specialOffer}
        lang={lang}
        onToggleLanguage={toggleLanguage}
        onOpenBespoke={() => setIsBespokeStudioOpen(true)}
      />

      <AnimatePresence>
        {isBespokeStudioOpen && (
          <BespokeStudioModal
            isOpen={isBespokeStudioOpen}
            onClose={() => setIsBespokeStudioOpen(false)}
            products={products}
            selectedProduct={selectedProduct}
            onAddToCart={(prod, col, sz, qty, customization) => {
              addToCart(prod, col, sz, qty, customization);
              setToastMessage('Bespoke heirloom piece added to bag');
              setTimeout(() => setToastMessage(null), 3500);
            }}
            lang={lang}
            currency={currency}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal
            onClose={() => setIsAuthModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* DEDICATED PAGE VIEWS: HOME / ABOUT / CONTACT */}
      {activePage === 'home' && (
        <main className="overflow-x-hidden">
          <HeroSection onOpenVideo={() => setIsVideoModalOpen(true)} theme={theme} />

          <ProductCatalog
            theme={theme}
            products={products}
            loading={loading}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onSelectProduct={(product) => setSelectedProduct(product)}
            onQuickAddToCart={(product) => addToCart(product)}
            currency={currency}
            exchangeRate={exchangeRate}
            lang={lang}
            specialOffer={specialOffer}
            isOfferLive={isOfferCurrentlyLive}
            onOpenBespoke={(p) => {
              if (p) setSelectedProduct(p);
              setIsBespokeStudioOpen(true);
            }}
          />

          <CraftsmanshipSection theme={theme} />

          <LookbookSection
            theme={theme}
            products={products}
            items={lookbookItems}
            onSelectProductById={(id) => {
              const found = products.find(p => p.id === id) || products.find(p => p.name.toLowerCase().includes(id.toLowerCase())) || products[0];
              if (found) setSelectedProduct(found);
            }}
            currency={currency}
            exchangeRate={exchangeRate}
          />

          <FAQSection theme={theme} />
        </main>
      )}

      {activePage === 'about' && (
        <main className="pt-24 min-h-[85vh]">
          <AboutSection
            theme={theme}
            content={siteContent.about}
            isStandalonePage={true}
            onNavigateHome={() => {
              setActivePage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      )}

      {activePage === 'contact' && (
        <main className="pt-24 min-h-[85vh]">
          <ContactSection
            theme={theme}
            user={user}
            content={siteContent.contact}
            onOpenSignIn={() => setIsAuthModalOpen(true)}
            onOpenDashboard={() => {
              setCustomerDashboardTab('messages');
              setIsCustomerDashboardOpen(true);
            }}
            isStandalonePage={true}
            onSendMessage={handleIncomingMessage}
            onNavigateHome={() => {
              setActivePage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      )}

      {activePage === 'offers' && isOfferCurrentlyLive && (
        <SpecialOffersPage
          campaign={specialOffer}
          products={products}
          theme={theme}
          currency={currency}
          exchangeRate={exchangeRate}
          lang={lang}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={addToCart}
          onExpire={handleOfferExpired}
        />
      )}

      <Footer
        theme={theme}
        user={user}
        unreadMessagesCount={unreadMessagesCount}
        onOpenAdmin={handleOpenAdmin}
        onOpenPublicTracking={() => setIsPublicTrackingOpen(true)}
        onNavigate={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
            isWishlisted={wishlist.includes(selectedProduct.id)}
            onToggleWishlist={toggleWishlist}
            theme={theme}
            onAddReview={handleAddReview}
            currency={currency}
            exchangeRate={exchangeRate}
            isFlashDeal={
              Boolean(isOfferCurrentlyLive && specialOffer && (
                specialOffer.targetCategory === 'selected'
                  ? specialOffer.targetProductIds?.includes(selectedProduct.id)
                  : (specialOffer.targetCategory === 'all' || specialOffer.targetCategory === selectedProduct.category)
              ))
            }
            discountPercent={specialOffer?.discountValue}
          />
        )}
      </AnimatePresence>

      {/* Wishlist Drawer */}
      <AnimatePresence>
        {isWishlistOpen && (
          <WishlistDrawer
            isOpen={isWishlistOpen}
            onClose={() => setIsWishlistOpen(false)}
            wishlistProducts={products.filter(p => wishlist.includes(p.id))}
            onRemoveFromWishlist={toggleWishlist}
            onAddToCart={(product) => addToCart(product)}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            cart={cart}
            onClose={() => setIsCartOpen(false)}
            onUpdateQuantity={updateQuantity}
            onClearCart={clearCart}
            subtotal={cartSubtotal}
            theme={theme}
            currency={currency}
            exchangeRate={exchangeRate}
            user={user}
            onOpenSignIn={() => setIsAuthModalOpen(true)}
            onOrderSuccess={(orderData: Order, returnedProducts?: Product[]) => {
              setOrders(prev => (prev.some(o => o.id === orderData.id) ? prev : [orderData, ...prev]));
              setIsCartOpen(false);
              setCompletedOrder(orderData);
              // Broadcast immediately to any other active tabs/admin windows
              try {
                const bc = new BroadcastChannel('kiru_atelier_realtime');
                bc.postMessage({ type: 'NEW_ORDER', order: orderData, products: returnedProducts });
                bc.close();
              } catch {}
              if (Array.isArray(returnedProducts) && returnedProducts.length > 0) {
                setProducts(returnedProducts);
              } else {
                // Auto-deduct stock immediately
                setProducts(prev =>
                  prev.map(p => {
                    const match = orderData.items.find(it => (it.product?.id || (it as any).productId || (it as any).id) === p.id);
                    if (match) {
                      const cur = p.stock !== undefined && p.stock !== null ? Number(p.stock) : 10;
                      return { ...p, stock: Math.max(0, cur - Number(match.quantity || 1)) };
                    }
                    return p;
                  })
                );
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Customer Dashboard / Orders Tracker Modal (Full Screen) */}
      <AnimatePresence>
        {isCustomerDashboardOpen && user && (
          <CustomerDashboardModal
            user={user}
            orders={orders}
            messages={messages}
            onSendMessage={handleIncomingMessage}
            onCustomerReplyMessage={handleCustomerReplyMessage}
            onRefreshMessages={refreshMessages}
            onUserUpdated={(updatedUser) => setUser(updatedUser)}
            initialTab={customerDashboardTab}
            onClose={() => setIsCustomerDashboardOpen(false)}
            onLogout={handleLogout}
            onViewReceipt={(ord: Order) => {
              setSelectedInvoiceOrder(ord);
            }}
            onViewCertificate={(ord: Order) => {
              setSelectedCertificateOrder(ord);
            }}
            onOpenAdmin={() => setIsAdminPortalOpen(true)}
            theme={theme}
            currency={currency}
            exchangeRate={exchangeRate}
          />
        )}
      </AnimatePresence>

      {/* Admin Merchant Portal */}
      <AnimatePresence>
        {isAdminPortalOpen && (
          <AdminPortalModal
            products={products}
            orders={orders}
            messages={messages}
            siteContent={siteContent}
            onUpdateSiteContent={handleUpdateSiteContent}
            onUpdateProductStock={handleUpdateProductStock}
            onClose={() => setIsAdminPortalOpen(false)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onVerifyPayment={handleVerifyPayment}
            onUpdateMessageStatus={handleUpdateMessageStatus}
            onReplyMessage={handleReplyMessage}
            onOpenInvoice={(ord) => setSelectedInvoiceOrder(ord)}
            onOpenCertificate={(ord) => setSelectedCertificateOrder(ord)}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onToggleVisibility={handleToggleProductVisibility}
            onDeleteProduct={handleDeleteProduct}
            onSendMessage={handleIncomingMessage}
            specialOffer={specialOffer}
            onUpdateSpecialOffer={(camp) => setSpecialOffer(camp)}
            lookbookItems={lookbookItems}
            onAddLookbookItem={handleAddLookbookItem}
            onUpdateLookbookItem={handleUpdateLookbookItem}
            onDeleteLookbookItem={handleDeleteLookbookItem}
            onReorderLookbookItems={handleReorderLookbookItems}
            theme={theme}
            onToggleTheme={toggleTheme}
            currency={currency}
            exchangeRate={exchangeRate}
          />
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <SearchModal
            products={products}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onClose={() => setIsSearchOpen(false)}
            onSelectProduct={(product) => {
              setIsSearchOpen(false);
              setSelectedProduct(product);
            }}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Craftsmanship Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <VideoModal onClose={() => setIsVideoModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* Order Confirmation Receipt Modal */}
      <AnimatePresence>
        {completedOrder && (
          <OrderSuccessModal
            order={completedOrder}
            onClose={() => setCompletedOrder(null)}
            theme={theme}
            onOpenInvoice={(ord) => setSelectedInvoiceOrder(ord)}
            onViewCertificate={(ord) => setSelectedCertificateOrder(ord)}
            onViewOrderTracking={() => {
              setIsCustomerDashboardOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Printable Official Luxury Invoice Modal */}
      <AnimatePresence>
        {selectedInvoiceOrder && (
          <PrintableInvoiceModal
            order={selectedInvoiceOrder}
            onClose={() => setSelectedInvoiceOrder(null)}
            currency={currency}
            exchangeRate={exchangeRate}
          />
        )}
      </AnimatePresence>

      {/* Official Atelier Certificate of Authenticity Modal */}
      <AnimatePresence>
        {selectedCertificateOrder && (
          <CertificateOfAuthenticityModal
            order={selectedCertificateOrder}
            onClose={() => setSelectedCertificateOrder(null)}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Public Order Tracking Lookup Modal */}
      <AnimatePresence>
        {isPublicTrackingOpen && (
          <PublicOrderTrackingModal
            orders={orders}
            onClose={() => setIsPublicTrackingOpen(false)}
            onOpenInvoice={(ord) => setSelectedInvoiceOrder(ord)}
            theme={theme}
            currency={currency}
            exchangeRate={exchangeRate}
          />
        )}
      </AnimatePresence>

      {/* AI Atelier Concierge Assistant */}
      <AiConciergeModal
        lang={lang}
        currency={currency}
        onTrackOrder={() => setIsPublicTrackingOpen(true)}
        onOpenBespoke={() => setIsBespokeStudioOpen(true)}
      />
    </div>
  );
}

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  cartCount: number;
  wishlistCount: number;
  unreadMessagesCount?: number;
  customerRepliesCount?: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenSignIn: () => void;
  user: User | null;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  onOpenPublicTracking: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  currency: 'USD' | 'ETB';
  onToggleCurrency: () => void;
  activePage: 'home' | 'about' | 'contact' | 'offers';
  onNavigate: (page: 'home' | 'about' | 'contact' | 'offers') => void;
  isOfferLive?: boolean;
  specialOffer?: SpecialOfferCampaign;
  lang?: Language;
  onToggleLanguage?: () => void;
  onOpenBespoke?: () => void;
}

function Header({
  theme,
  toggleTheme,
  cartCount,
  wishlistCount,
  unreadMessagesCount = 0,
  customerRepliesCount = 0,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenSignIn,
  user,
  onOpenDashboard,
  onOpenAdmin,
  onOpenPublicTracking,
  mobileMenuOpen,
  setMobileMenuOpen,
  currency,
  onToggleCurrency,
  activePage,
  onNavigate,
  isOfferLive = false,
  specialOffer,
  lang = 'en',
  onToggleLanguage,
  onOpenBespoke
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  // Lock body scroll when sidebar drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 w-full max-w-full overflow-x-clip transition-all duration-300 ${
      scrolled 
        ? theme === 'dark' 
          ? 'bg-[#0B0B0C]/95 backdrop-blur-md border-b border-white/10 py-2.5 sm:py-3 shadow-xl' 
          : 'bg-white/95 backdrop-blur-md border-b border-black/10 py-2.5 sm:py-3 shadow-md'
        : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent py-3 sm:py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo - Responsive on left, clicking returns to Home */}
        <div className="flex items-center shrink-0 min-w-0 max-w-[55vw] sm:max-w-none">
          <button 
            type="button"
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }} 
            className="group text-left cursor-pointer transition-transform duration-200 hover:opacity-95 block"
            title="Kiru Leathers - Addis Ababa & Florence"
          >
            <div className="block sm:hidden">
              <KiruLogo variant="horizontal" size="sm" theme={theme} subtitleText="Addis Ababa" />
            </div>
            <div className="hidden sm:block">
              <KiruLogo variant="horizontal" size="md" theme={theme} subtitleText="Addis Ababa • Florence" />
            </div>
          </button>
        </div>

        {/* Center Navigation - Concise short luxury form for desktop (xl: and above) */}
        <nav className="hidden xl:flex items-center gap-6 2xl:gap-8 text-xs tracking-[0.2em] uppercase font-medium justify-center flex-1 px-4">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`transition-colors relative py-1 hover:text-[#D4AF37] cursor-pointer ${
              activePage === 'home' ? 'text-[#D4AF37] font-bold after:w-full' : ''
            } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#D4AF37] hover:after:w-full after:transition-all`}
          >
            Collection
          </button>

          {isOfferLive && (
            <button
              type="button"
              onClick={() => onNavigate('offers')}
              className={`transition-colors relative py-1 hover:text-[#D4AF37] cursor-pointer flex items-center gap-1.5 ${
                activePage === 'offers' ? 'text-[#D4AF37] font-bold after:w-full' : 'text-amber-200'
              } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#D4AF37] hover:after:w-full after:transition-all`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              <span>Offers</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-600 text-white font-bold animate-bounce">
                {specialOffer?.discountValue}%
              </span>
            </button>
          )}

          <a
            href="#lookbook"
            onClick={(e) => {
              if (activePage !== 'home') {
                e.preventDefault();
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('lookbook')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-[#D4AF37] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#D4AF37] hover:after:w-full after:transition-all cursor-pointer"
          >
            Lookbook
          </a>

          <button
            type="button"
            onClick={() => onNavigate('about')}
            className={`transition-colors relative py-1 hover:text-[#D4AF37] cursor-pointer ${
              activePage === 'about' ? 'text-[#D4AF37] font-bold after:w-full' : ''
            } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#D4AF37] hover:after:w-full after:transition-all`}
          >
            About
          </button>

          {onOpenBespoke && (
            <button
              type="button"
              onClick={onOpenBespoke}
              className="hover:text-[#D4AF37] transition-colors relative py-1 cursor-pointer flex items-center gap-1 text-amber-300 font-medium after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#D4AF37] hover:after:w-full after:transition-all"
            >
              <Scissors className="w-3 h-3 text-amber-400" />
              <span>Bespoke</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className={`transition-colors relative py-1 hover:text-[#D4AF37] cursor-pointer ${
              activePage === 'contact' ? 'text-[#D4AF37] font-bold after:w-full' : ''
            } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#D4AF37] hover:after:w-full after:transition-all`}
          >
            Contact
          </button>
        </nav>

        {/* Right Actions - compact on mobile/tablet, complete on xl: */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
          
          {/* Admin quick indicator on desktop / tablets if signed in as admin */}
          {user?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="relative px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-mono border border-[#D4AF37]/60 bg-gradient-to-r from-amber-500/15 via-[#3D2314]/40 to-amber-500/10 text-amber-300 hover:bg-[#D4AF37] hover:text-black transition-all font-semibold flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
              title="Open Atelier Merchant Admin Console (የአስተዳዳሪ ፖርታል)"
            >
              <span>⚙️</span>
              <span className="font-bold tracking-wider uppercase hidden sm:inline">Admin</span>
              {unreadMessagesCount > 0 && (
                <span className="flex items-center gap-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse shadow-sm">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
          )}

          {/* Customer Dashboard quick indicator on desktop / tablets if signed in as customer */}
          {user && user.role !== 'admin' && (
            <button
              onClick={onOpenDashboard}
              className="relative px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-mono border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all font-semibold flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
              title="Open Customer Dashboard & Order Tracker (የደንበኛ ዳሽቦርድ)"
            >
              <span>👤</span>
              <span className="font-bold tracking-wider uppercase hidden sm:inline">Dashboard</span>
              {customerRepliesCount > 0 && (
                <span className="bg-emerald-500 text-black text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  {customerRepliesCount}
                </span>
              )}
            </button>
          )}

          {/* Currency Switcher (visible on desktop md+) */}
          <button
            onClick={onToggleCurrency}
            className="hidden md:flex px-2 py-1 rounded-lg text-[11px] font-mono border border-[#D4AF37]/40 bg-[#3D2314]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all items-center gap-1 shrink-0"
            title="Switch Currency between USD and ETB"
          >
            <Globe className="w-3 h-3" />
            <span className="font-semibold">{currency}</span>
          </button>

          {/* Language Switcher (visible on desktop md+) */}
          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="hidden md:flex px-2 py-1 rounded-lg text-[11px] font-mono border border-stone-600/70 bg-stone-900/60 text-stone-200 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all items-center gap-1 shrink-0"
              title="Switch Language (English / አማርኛ)"
            >
              <span className="font-bold text-[#D4AF37]">{lang === 'en' ? 'አማ' : 'EN'}</span>
            </button>
          )}

          {/* Search Button (always visible) */}
          <button
            onClick={onOpenSearch}
            className={`p-1.5 sm:p-2 rounded-full transition-colors text-[#D4AF37] cursor-pointer ${
              theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
            aria-label="Search"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Wishlist Button (visible on xl:) */}
          <button
            onClick={onOpenWishlist}
            className={`hidden xl:flex p-1.5 sm:p-2 rounded-full transition-colors relative text-[#D4AF37] cursor-pointer ${
              theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Theme Toggle (visible on xl:) */}
          <button
            onClick={toggleTheme}
            className={`hidden xl:flex p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer ${
              theme === 'dark' ? 'hover:bg-white/10 text-[#D4AF37]' : 'hover:bg-black/5 text-gray-800'
            }`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />}
          </button>

          {/* Cart Drawer Button (always visible) */}
          <button
            onClick={onOpenCart}
            className={`p-1.5 sm:p-2 rounded-full transition-colors relative text-[#D4AF37] cursor-pointer ${
              theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
            aria-label="Cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-[9px] sm:text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth Button (desktop xl: only) */}
          {user ? (
            <button
              onClick={onOpenDashboard}
              className="hidden xl:inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] px-3 py-1.5 border border-[#D4AF37]/60 bg-[#3D2314]/80 text-[#D4AF37] font-semibold rounded-full hover:border-[#D4AF37] transition-all cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full bg-[#D4AF37] text-black text-[9px] flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenSignIn}
              className="hidden xl:inline-flex items-center justify-center text-xs uppercase tracking-[0.15em] px-3.5 py-1.5 border border-[#D4AF37]/60 bg-[#D4AF37]/10 text-[#D4AF37] font-semibold rounded hover:bg-[#D4AF37] hover:text-black transition-all cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* 3 ሰረዝ (Hamburger Menu Button) - Responsive for phone, tablet, and quick sidebar navigation */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`p-1.5 sm:p-2 text-[#D4AF37] rounded-xl transition-all cursor-pointer border border-[#D4AF37]/25 hover:border-[#D4AF37] ${
              theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-stone-100 hover:bg-stone-200'
            }`}
            aria-label="Open Atelier Sidebar Menu (3 ሰረዝ ሜኑ)"
            title="Open Atelier Menu (3 ሰረዝ)"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Sliding Luxury Sidebar Drawer (3 ሰረዝ የጎን ሜኑ) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity cursor-pointer"
            />

            {/* Sliding Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className={`fixed inset-y-0 right-0 w-[310px] sm:w-[380px] max-w-[88vw] z-50 flex flex-col shadow-2xl border-l ${
                theme === 'dark'
                  ? 'bg-[#0E0F12] border-white/10 text-white'
                  : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              {/* Sidebar Header */}
              <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
                theme === 'dark' ? 'border-white/10' : 'border-stone-200'
              }`}>
                <div onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }} className="cursor-pointer">
                  <KiruLogo variant="horizontal" size="sm" theme={theme} subtitleText="Addis Ababa • Florence" />
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-white/15 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      : 'border-stone-300 bg-stone-100 text-stone-600 hover:text-stone-950'
                  }`}
                  aria-label="Close sidebar menu"
                >
                  <X className="w-5 h-5 text-[#D4AF37]" />
                </button>
              </div>

              {/* Sidebar Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-5">
                
                {/* Account / Role Card */}
                {user?.role === 'admin' ? (
                  <div className="p-3.5 rounded-2xl bg-[#3D2314] border border-[#D4AF37]/60 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                        Store Administration
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#D4AF37] text-black uppercase font-mono">
                        Admin Portal
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-stone-950 font-bold uppercase text-xs font-mono tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow cursor-pointer hover:brightness-105"
                    >
                      <span>⚙️</span>
                      <span>Open Admin Console (የአስተዳዳሪ ዳሽቦርድ)</span>
                      {unreadMessagesCount > 0 && (
                        <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 animate-pulse">
                          {unreadMessagesCount}
                        </span>
                      )}
                    </button>
                  </div>
                ) : user ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-[#3D2314]/80 border border-emerald-500/50 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                        Collector Profile
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-black uppercase font-mono">
                        {user.name.split(' ')[0]}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenDashboard();
                      }}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-stone-950 font-bold uppercase text-xs font-mono tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow cursor-pointer hover:brightness-105"
                    >
                      <span>👤</span>
                      <span>Open My Dashboard (የደንበኛ ዳሽቦርድ)</span>
                      {customerRepliesCount > 0 && (
                        <span className="bg-black text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                          {customerRepliesCount}
                        </span>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSignIn();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/15 to-[#3D2314]/40 hover:bg-[#D4AF37] hover:text-black text-[#D4AF37] font-semibold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Sign In / Register (ይግቡ ወይም ይመዝገቡ)</span>
                  </button>
                )}

                {/* Primary Navigation Links */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block mb-2 font-bold">
                    Atelier Navigation (የገጾች ዝርዝር)
                  </span>
                  <nav className="flex flex-col space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('home');
                      }}
                      className={`text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                        activePage === 'home'
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-bold border border-[#D4AF37]/30'
                          : theme === 'dark' ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <span className="text-xs tracking-wider uppercase font-medium">🛍️ Collection (ካታሎግ)</span>
                      <span className="text-[10px] font-mono text-stone-400">All Masterworks</span>
                    </button>

                    {isOfferLive && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigate('offers');
                        }}
                        className={`text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer border ${
                          activePage === 'offers'
                            ? 'bg-rose-950/40 text-amber-300 font-bold border-rose-500/50'
                            : 'bg-rose-950/20 text-amber-200 border-rose-500/30 hover:bg-rose-950/40'
                        }`}
                      >
                        <span className="text-xs tracking-wider uppercase font-medium flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>⚡ Flash Deals (ልዩ ቅናሾች)</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-bold animate-bounce">
                          {specialOffer?.discountValue}% OFF
                        </span>
                      </button>
                    )}

                    {onOpenBespoke && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenBespoke();
                        }}
                        className={`text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                          theme === 'dark' ? 'hover:bg-white/5 text-amber-300' : 'hover:bg-stone-100 text-amber-700'
                        }`}
                      >
                        <span className="text-xs tracking-wider uppercase font-medium flex items-center gap-2">
                          <Scissors className="w-3.5 h-3.5 text-amber-400" />
                          <span>✂️ Bespoke Studio (የግል ማበጃ)</span>
                        </span>
                        <span className="text-[9px] font-mono uppercase text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">Custom</span>
                      </button>
                    )}

                    <a
                      href="#lookbook"
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        if (activePage !== 'home') {
                          e.preventDefault();
                          onNavigate('home');
                          setTimeout(() => {
                            document.getElementById('lookbook')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                      className={`p-2.5 rounded-xl transition-all flex items-center justify-between ${
                        theme === 'dark' ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <span className="text-xs tracking-wider uppercase font-medium">📖 Lookbook (ቪዲዮና ፎቶ)</span>
                      <span className="text-[10px] font-mono text-stone-400">Cinematic</span>
                    </a>

                    <a
                      href="#craftsmanship"
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        if (activePage !== 'home') {
                          e.preventDefault();
                          onNavigate('home');
                          setTimeout(() => {
                            document.getElementById('craftsmanship')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                      className={`p-2.5 rounded-xl transition-all flex items-center justify-between ${
                        theme === 'dark' ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <span className="text-xs tracking-wider uppercase font-medium">🏛️ Craftsmanship (ጥራት)</span>
                      <span className="text-[10px] font-mono text-stone-400">Atelier Standards</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('about');
                      }}
                      className={`text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                        activePage === 'about'
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-bold border border-[#D4AF37]/30'
                          : theme === 'dark' ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <span className="text-xs tracking-wider uppercase font-medium">📜 Heritage & Story (ታሪክ)</span>
                      <span className="text-[10px] font-mono text-stone-400">Since 1994</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenPublicTracking();
                      }}
                      className={`text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <span className="text-xs tracking-wider uppercase font-medium flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>📦 Track Order (መከታተያ)</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#D4AF37]">Live Dispatch</span>
                    </button>

                    <a
                      href="#faq"
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        if (activePage !== 'home') {
                          e.preventDefault();
                          onNavigate('home');
                          setTimeout(() => {
                            document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                      className={`p-2.5 rounded-xl transition-all flex items-center justify-between ${
                        theme === 'dark' ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <span className="text-xs tracking-wider uppercase font-medium">💬 FAQ (ጥያቄዎች)</span>
                      <span className="text-[10px] font-mono text-stone-400">Assistance</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('contact');
                      }}
                      className={`text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                        activePage === 'contact'
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-bold border border-[#D4AF37]/30'
                          : theme === 'dark' ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <span className="text-xs tracking-wider uppercase font-medium">📞 Concierge (ቀጠሮና አድራሻ)</span>
                      <span className="text-[10px] font-mono text-stone-400">Direct Chat</span>
                    </button>
                  </nav>
                </div>

                {/* Quick Preferences Bar (Currency, Language, Wishlist, Theme) */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-stone-200'} space-y-3`}>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block font-bold">
                    Store Settings & Preferences
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Currency Selector */}
                    <div className="flex rounded-xl p-1 bg-white/[0.04] border border-white/10">
                      <button
                        type="button"
                        onClick={() => { if (currency !== 'USD') onToggleCurrency(); }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          currency === 'USD'
                            ? 'bg-[#D4AF37] text-stone-950 shadow'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        $ USD
                      </button>
                      <button
                        type="button"
                        onClick={() => { if (currency !== 'ETB') onToggleCurrency(); }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          currency === 'ETB'
                            ? 'bg-[#D4AF37] text-stone-950 shadow'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        ETB
                      </button>
                    </div>

                    {/* Language Selector */}
                    {onToggleLanguage && (
                      <div className="flex rounded-xl p-1 bg-white/[0.04] border border-white/10">
                        <button
                          type="button"
                          onClick={() => { if (lang !== 'en') onToggleLanguage(); }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            lang === 'en'
                              ? 'bg-[#D4AF37] text-stone-950 shadow'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          EN
                        </button>
                        <button
                          type="button"
                          onClick={() => { if (lang !== 'am') onToggleLanguage(); }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            lang === 'am'
                              ? 'bg-[#D4AF37] text-stone-950 shadow'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          አማ
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenWishlist();
                      }}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono transition-colors cursor-pointer ${
                        theme === 'dark'
                          ? 'border-white/10 bg-white/5 text-gray-300 hover:text-white'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:text-black'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      <span>Wishlist ({wishlistCount})</span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono transition-colors cursor-pointer ${
                        theme === 'dark'
                          ? 'border-white/10 bg-white/5 text-gray-300 hover:text-white'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:text-black'
                      }`}
                    >
                      {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-stone-800" />}
                      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                    </button>
                  </div>
                </div>

                {/* Atelier Boutique Contact Footer */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-stone-200'} text-[11px] font-mono text-stone-400 space-y-1.5`}>
                  <div className="flex items-center gap-2 text-amber-300">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Concierge: +251 911 234 567</span>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Bole Medhanialem, Addis Ababa • Via de' Tornabuoni, Florence
                  </p>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}



interface HeroSectionProps {
  onOpenVideo: () => void;
  theme: 'dark' | 'light';
}

function HeroSection({ onOpenVideo, theme }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [transparencyMode, setTransparencyMode] = useState<'ultra-clear' | 'balanced' | 'cinema'>('ultra-clear');

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Typewriter Animation for "Built for Generations."
  const targetText = "Built for Generations.";
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const typingSpeed = isDeleting ? 45 : 95;

    if (!isDeleting && typedText === targetText) {
      // Pause when fully typed
      timer = setTimeout(() => setIsDeleting(true), 3200);
    } else if (isDeleting && typedText === "") {
      // Pause before typing again
      timer = setTimeout(() => setIsDeleting(false), 800);
    } else {
      timer = setTimeout(() => {
        setTypedText(prev => 
          isDeleting 
            ? targetText.substring(0, prev.length - 1)
            : targetText.substring(0, prev.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, targetText]);

  // Compute dynamic hero background transparency overlay
  const getHeroOverlayClasses = () => {
    if (transparencyMode === 'ultra-clear') {
      // 100% Crisp, vivid, and unblurred video visibility ("ጥርት ብሎ የሚታይ")
      return theme === 'dark'
        ? 'bg-gradient-to-b from-black/50 via-transparent to-[#0B0B0C]'
        : 'bg-gradient-to-b from-[#FAF8F5]/60 via-transparent to-[#FAF8F5]';
    } else if (transparencyMode === 'balanced') {
      return theme === 'dark'
        ? 'bg-gradient-to-b from-[#0B0B0C]/70 via-[#0B0B0C]/30 to-[#0B0B0C]'
        : 'bg-gradient-to-b from-[#FAF8F5]/75 via-[#FAF8F5]/35 to-[#FAF8F5]';
    } else {
      // Cinema mode (softer)
      return theme === 'dark'
        ? 'bg-gradient-to-b from-[#0B0B0C]/85 via-[#0B0B0C]/55 to-[#0B0B0C]'
        : 'bg-gradient-to-b from-[#FAF8F5]/90 via-[#FAF8F5]/60 to-[#FAF8F5]';
    }
  };

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden pt-20 transition-colors ${
      theme === 'dark' ? 'bg-[#0B0B0C]' : 'bg-[#FAF8F5]'
    }`}>
      
      {/* Background Video with Crystal-Clear High Fidelity ("ጥርት ያለ ግልጸኝነት") */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          className="w-full h-full object-cover scale-105 filter brightness-100 contrast-[1.04] saturate-[1.05] transition-all duration-700"
        >
          <source src="/kiru-leathers.mp4" type="video/mp4" />
          <source src="/kiru%20leathers.mp4" type="video/mp4" />
          <source src="/video_2026-10-08_22-11-08.mp4" type="video/mp4" />
        </video>

        {/* Dynamic Transparency Overlay - Crisp & Clear with Zero Muddy Blur */}
        <div className={`absolute inset-0 transition-all duration-500 ${getHeroOverlayClasses()}`} />
      </div>

      {/* Atelier Craft Film & Live Transparency Clarity Controller */}
      <div className="absolute bottom-8 right-4 sm:right-10 z-20 flex items-center gap-2 p-1.5 rounded-full bg-black/75 backdrop-blur-md border border-[#D4AF37]/50 text-[#D4AF37] shadow-2xl">
        <button
          type="button"
          onClick={togglePlay}
          className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
          title={isPlaying ? "Pause craft film" : "Play craft film"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          type="button"
          onClick={toggleMute}
          className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
          title={isMuted ? "Unmute Background Sound" : "Mute Background Sound"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#D4AF37]" />}
        </button>

        <div className="h-4 w-px bg-white/20" />

        {/* 1-Click Transparency Clarity Switcher */}
        <button
          type="button"
          onClick={() => {
            setTransparencyMode(prev => 
              prev === 'ultra-clear' ? 'balanced' : prev === 'balanced' ? 'cinema' : 'ultra-clear'
            );
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3D2314]/85 hover:bg-[#3D2314] text-xs font-mono transition-all text-stone-200 border border-[#D4AF37]/40 shadow-inner"
          title="Click to toggle transparency clarity (ጥርት ያለ / መካከለኛ / ሲኒማ)"
        >
          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="hidden sm:inline text-stone-300">ጥራት፦</span>
          <span className="text-[#D4AF37] font-semibold">
            {transparencyMode === 'ultra-clear' ? 'ጥርት ያለ (Vivid)' : transparencyMode === 'balanced' ? 'መካከለኛ (Balanced)' : 'ሲኒማ (Soft)'}
          </span>
        </button>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center py-16">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3D2314]/85 backdrop-blur-md border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-mono tracking-widest uppercase mb-6 shadow-xl"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Handcrafted Italian Elegance</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-[1.08] mb-6 min-h-[1.9em] sm:min-h-[2.1em] ${
            theme === 'dark' 
              ? 'text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]' 
              : 'text-stone-900 drop-shadow-[0_2px_14px_rgba(255,255,255,0.9)]'
          }`}
        >
          Crafted to Perfection.<br />
          <span className="italic font-light text-[#D4AF37] inline-block relative drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)]">
            <span>{typedText}</span>
            <span className="inline-block w-[3px] h-[0.85em] bg-[#D4AF37] ml-1.5 align-middle animate-pulse" />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`text-base sm:text-xl max-w-2xl font-sans font-light tracking-wide leading-relaxed mb-10 ${
            theme === 'dark' 
              ? 'text-stone-200 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]' 
              : 'text-stone-800 drop-shadow-[0_1px_8px_rgba(255,255,255,0.9)]'
          }`}
        >
          Handcrafted luxury leather outerwear, bespoke footwear, travel duffles, and artisan accessories. Made with ethically sourced Tuscan full-grain hides.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto"
        >
          <a
            href="#collection"
            className="w-full sm:w-auto px-8 py-4 rounded bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#D4AF37] text-black font-semibold uppercase text-xs tracking-[0.2em] hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:scale-105 transition-all duration-300 text-center shadow-lg"
          >
            Explore Collection
          </a>

          <button
            onClick={onOpenVideo}
            className={`w-full sm:w-auto px-8 py-4 rounded backdrop-blur-md border uppercase text-xs tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 group font-medium ${
              theme === 'dark'
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                : 'bg-black/5 hover:bg-black/10 border-stone-300 text-stone-900 shadow-sm'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center text-black group-hover:scale-110 transition-transform">
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </div>
            Watch Craftsmanship
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className={`mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 border-t pt-8 w-full max-w-4xl ${
            theme === 'dark' ? 'border-white/15 text-gray-200' : 'border-stone-300/80 text-stone-700'
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-xs uppercase tracking-widest font-medium">100% Full-Grain Leather</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Feather className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-xs uppercase tracking-widest font-medium">Ethically Tuscan Sourced</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Award className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-xs uppercase tracking-widest font-medium">Lifetime Stitch Guarantee</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}



function CraftsmanshipSection({ theme }: { theme: 'dark' | 'light' }) {
  const [activeStep, setActiveStep] = useState<CraftsmanshipStep>(CRAFTSMANSHIP_STEPS[0]);

  return (
    <section id="craftsmanship" className={`py-24 ${theme === 'dark' ? 'bg-[#0f0f11]' : 'bg-gray-100'} transition-colors border-y border-white/10 overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Artisanal Process</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal mt-2 mb-4 tracking-tight">The Anatomy of Excellence</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Cards sliding in from Left (Bidirectional Scroll) */}
          <div className="lg:col-span-5 space-y-4">
            {CRAFTSMANSHIP_STEPS.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -45, scale: 0.97 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: idx * 0.08 }}
                onClick={() => setActiveStep(step)}
                className={`p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
                  activeStep.id === step.id
                    ? 'bg-[#3D2314] border-[#D4AF37] shadow-xl'
                    : theme === 'dark'
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <h3 className={`font-serif text-lg font-medium mb-1 ${activeStep.id === step.id ? 'text-[#D4AF37]' : ''}`}>{step.title}</h3>
                <p className="text-xs text-gray-400 font-mono mb-2">{step.subtitle}</p>
                <p className="text-xs text-gray-300 font-light leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Right Side: Artwork sliding in from Right (Bidirectional Scroll) */}
          <motion.div
            initial={{ opacity: 0, x: 45, scale: 0.97 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative"
          >
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={activeStep.image} alt={activeStep.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                <div className="grid grid-cols-2 gap-8 w-full border-t border-white/20 pt-6">
                  {activeStep.stats.map((stat, i) => (
                    <div key={i}>
                      <span className="block text-2xl font-serif text-[#D4AF37] font-bold">{stat.value}</span>
                      <span className="text-[10px] uppercase tracking-widest text-gray-300 font-mono">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


function FAQSection({ theme }: { theme: 'dark' | 'light' }) {
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-16"
      >
        <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Client Service</span>
        <h2 className="font-serif text-3xl sm:text-4xl mt-2">Frequently Asked Questions</h2>
      </motion.div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const fromLeft = idx % 2 === 0;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: fromLeft ? -40 : 40, scale: 0.98 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (idx % 3) * 0.06 }}
              className={`border rounded-xl overflow-hidden transition-colors ${
                theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white shadow-sm'
              }`}
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                className="w-full p-6 text-left flex justify-between items-center gap-4 cursor-pointer"
              >
                <span className="font-serif text-base sm:text-lg font-medium">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 ${openIdx === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === idx && (
                <div className="px-6 pb-6 text-sm text-gray-400 font-light leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function Footer({ 
  theme, 
  user, 
  unreadMessagesCount = 0,
  onOpenAdmin, 
  onOpenPublicTracking,
  onNavigate 
}: { 
  theme: 'dark' | 'light'; 
  user?: User | null; 
  unreadMessagesCount?: number;
  onOpenAdmin?: () => void;
  onOpenPublicTracking?: () => void;
  onNavigate?: (page: 'home' | 'about' | 'contact' | 'offers') => void;
}) {
  return (
    <footer className={`border-t py-16 ${theme === 'dark' ? 'border-white/10 bg-black/60' : 'border-gray-200 bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-200/10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center">
              <KiruLogo variant="horizontal" size="lg" theme="dark" subtitleText="Florence & Addis Ababa • Est. 2024" />
            </div>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Tuscan vegetable-tanned hides married with authentic Ethiopian master saddlery. Craftsmanship warrantied for lifetime preservation.
            </p>
            <div className="flex items-center gap-3 text-xs font-mono text-[#D4AF37]">
              <span>Florence, IT</span>
              <span>•</span>
              <span>Addis Ababa, ET</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold mb-4">Maison Navigation</h5>
            <ul className="space-y-2.5 text-xs text-gray-400 font-light">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('home')}
                  className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer"
                >
                  Bespoke Collection
                </button>
              </li>
              <li>
                <a
                  href="#craftsmanship"
                  onClick={() => onNavigate?.('home')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Tuscan Craftsmanship
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('about')}
                  className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer"
                >
                  Atelier Heritage & Story (የእኛ ታሪክ)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPublicTracking?.()}
                  className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer flex items-center gap-1.5 text-[#D4AF37] font-medium"
                >
                  <span>📦</span>
                  <span>Track Live Order (ትዕዛዝ መከታተያ)</span>
                </button>
              </li>
              <li>
                <a
                  href="#lookbook"
                  onClick={() => onNavigate?.('home')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Editorial Lookbook
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('contact')}
                  className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer"
                >
                  Client Concierge Desk (አድራሻና ቀጠሮ)
                </button>
              </li>
            </ul>
          </div>

          {/* Client Assurance */}
          <div>
            <h5 className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold mb-4">Client Privileges</h5>
            <ul className="space-y-2.5 text-xs text-gray-400 font-light">
              <li><span className="text-gray-300 font-medium">100-Year Life Warranty</span> on structural seams</li>
              <li><span className="text-gray-300 font-medium">30-Day Bespoke Tailoring</span> fit adjustments</li>
              <li><span className="text-gray-300 font-medium">Certified Payment Verification</span> (CBE, Telebirr, BOA)</li>
              <li><span className="text-gray-300 font-medium">White-Glove Delivery</span> across Addis Ababa & World</li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div>
            <h5 className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold mb-4">Direct Atelier</h5>
            <div className="space-y-2 text-xs text-gray-400 font-light">
              <p>Bole Sub-City, Road 3, Addis Ababa</p>
              <p className="font-mono text-gray-300">+251 91 123 4567 / +251 92 000 8899</p>
              <p className="font-mono text-[#D4AF37]">concierge@kiruleathers.com</p>
              <p className="text-[11px] text-gray-500 pt-1">Studio Visits: Mon - Sat by Reservation</p>
            </div>
          </div>
        </div>

        <div className="pt-8 text-center space-y-4">
          <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">
            © {new Date().getFullYear()} KIRU LEATHERS S.R.L. FLORENCE & ADDIS ABABA. ALL RIGHTS RESERVED.
          </p>

          {/* Admin Portal Link in Footer - ONLY visible if signed in as Admin */}
          {user?.role === 'admin' && onOpenAdmin && (
            <div className="flex items-center justify-center pt-2">
              <button
                onClick={onOpenAdmin}
                className="relative px-4 py-2 rounded-xl border border-amber-400/50 bg-[#3D2314]/80 text-amber-300 hover:bg-amber-400 hover:text-black transition-all flex items-center gap-2 text-xs font-mono font-semibold shadow cursor-pointer"
              >
                <span>⚙️</span>
                <span>Atelier Merchant Admin Console (የአስተዳዳሪ ፖርታል)</span>
                <span className="bg-amber-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                  Admin Active
                </span>
                {unreadMessagesCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                    {unreadMessagesCount} NEW
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </footer>
  );
}





interface SearchModalProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  theme: 'dark' | 'light';
}

function SearchModal({ products, searchQuery, setSearchQuery, onClose, onSelectProduct, theme }: SearchModalProps) {
  const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-md px-4">
      <div className={`${theme === 'dark' ? 'bg-[#121214] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-2xl p-6 max-w-2xl w-full shadow-2xl`}>
        <div className={`flex items-center justify-between pb-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} mb-4`}>
          <input
            type="text"
            placeholder="Search luxury leather goods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered.length > 0) {
                  onSelectProduct(filtered[0]);
                }
              }
            }}
            className={`bg-transparent text-lg outline-none w-full ${theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'} font-sans`}
            autoFocus
          />
          <button onClick={onClose}><X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`} /></button>
        </div>
        <div className="max-h-80 overflow-y-auto space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No matching leather items found.</p>
          ) : (
            filtered.map(p => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition-colors border ${
                  theme === 'dark'
                    ? 'hover:bg-white/5 border-transparent hover:border-white/10'
                    : 'hover:bg-gray-50 border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={p.images ? p.images[0] : ''} alt="" className="w-10 h-12 object-cover rounded bg-gray-900 border border-gray-200/20" />
                  <div>
                    <span className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{p.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono uppercase">{p.categoryLabel || p.category}</span>
                  </div>
                </div>
                <span className="text-[#D4AF37] font-mono text-sm">${p.price}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function VideoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white bg-black/50 p-2 rounded-full hover:bg-black"><X className="w-6 h-6" /></button>
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-[#0B0B0C]">
          <Sparkles className="w-12 h-12 text-[#D4AF37] mb-4 animate-bounce" />
          <h3 className="font-serif text-2xl text-white mb-2">Tuscan Leathercraft Documentary</h3>
          <p className="text-sm text-gray-400 max-w-md font-light">Experience the 60-day natural tanning and traditional saddle stitching process behind every Kiru Leather product.</p>
        </div>
      </div>
    </div>
  );
}

