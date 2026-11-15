import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Truck,
  Tag,
  CheckCircle,
  AlertCircle,
  Building2,
  Copy,
  Check,
  Upload,
  MapPin,
  Send
} from 'lucide-react';
import { type Product, type CartItem, type PaymentMethod, type CheckoutDetails, type Order, type TransferPaymentDetails, type User } from '../types';
import { DELIVERY_ZONES } from '../data/deliveryZones';
import { playLuxuryChime } from '../utils/audioAlert';

interface CartDrawerProps {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onClearCart: () => void;
  subtotal: number;
  theme: 'dark' | 'light';
  currency: 'USD' | 'ETB';
  exchangeRate?: number;
  onOrderSuccess: (order: Order, updatedProducts?: Product[]) => void;
  user?: User | null;
  onOpenSignIn?: () => void;
}

const PROMO_CODES: Record<string, { type: 'percent' | 'fixed'; value: number; minOrder?: number; label: string }> = {
  KIRU10: { type: 'percent', value: 0.1, label: '10% Artisan Privilege' },
  LUXURY50: { type: 'fixed', value: 50, minOrder: 300, label: '$50 Bespoke Credit' },
  FIRSTORDER: { type: 'percent', value: 0.15, label: '15% First Collector Welcome' },
  COLLECTOR10: { type: 'percent', value: 0.1, label: '10% Collector Circle Privilege' },
  VIP10: { type: 'percent', value: 0.1, label: '10% VIP Courtesy' }
};

const STORE_ACCOUNTS = {
  CBE: {
    bank: 'Commercial Bank of Ethiopia (CBE)',
    account: '1000 4521 8976 2',
    rawAccount: '1000452189762',
    holder: 'KIRU LEATHERS ATELIER',
    instructions: 'በኢትዮጵያ ንግድ ባንክ ሞባይል ባንኪንግ ወይም በአቅራቢያዎ ቅርንጫፍ ክፍያ ፈጽመው የግብይት ቁጥሩንና ደረሰኙን ያስገቡ።'
  },
  Telebirr: {
    bank: 'Telebirr SuperApp',
    account: '0911 234 567',
    rawAccount: '0911234567',
    holder: 'KIRU LEATHERS',
    instructions: 'በቴሌብር መተግበሪያ "Send Money" ወይም "Pay Merchant" በማድረግ ትክክለኛውን የትዕዛዝ ዋጋ ይላኩ።'
  },
  BOA: {
    bank: 'Bank of Abyssinia (BOA)',
    account: '8891 2345 6',
    rawAccount: '889123456',
    holder: 'KIRU LEATHERS',
    instructions: 'በአቢሲኒያ ባንክ ሞባይል ባንኪንግ ወይም በቅርንጫፍ ገንዘብ ገቢ በማድረግ የደረሰኝ ስክሪንሽት ያስገቡ።'
  },
  Awash: {
    bank: 'Awash International Bank',
    account: '0130 4567 8901',
    rawAccount: '013045678901',
    holder: 'KIRU LEATHERS',
    instructions: 'በአዋሽ ባንክ ሞባይል ባንኪንግ ወይም በቅርንጫፍ ክፍያ ፈጽመው ደረሰኙን እዚህ ይስቀሉ።'
  }
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  onClose,
  onUpdateQuantity,
  onClearCart,
  subtotal,
  theme,
  currency,
  exchangeRate = 125,
  onOrderSuccess,
  user,
  onOpenSignIn
}) => {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_transfer');
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Form Details (auto-fill from active user if logged in)
  const [details, setDetails] = useState<CheckoutDetails>(() => ({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || 'Addis Ababa',
    paymentMethod: 'mobile_transfer'
  }));

  React.useEffect(() => {
    if (user) {
      setDetails(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
        city: prev.city || user.city || 'Addis Ababa'
      }));
    }
  }, [user]);

  // Mobile Transfer State
  const [selectedBank, setSelectedBank] = useState<'CBE' | 'Telebirr' | 'BOA' | 'Awash'>('CBE');
  const [transactionId, setTransactionId] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedDeliveryZoneId, setSelectedDeliveryZoneId] = useState<string>('aa-bole');

  // Currency conversions
  const toActiveCurrency = (usdVal: number) => {
    return currency === 'ETB' ? usdVal * exchangeRate : usdVal;
  };

  const formatPrice = (usdVal: number) => {
    const val = toActiveCurrency(usdVal);
    return currency === 'ETB' ? `${val.toLocaleString()} ETB` : `$${val.toLocaleString()}`;
  };

  const activeZone = DELIVERY_ZONES.find(z => z.id === selectedDeliveryZoneId) || DELIVERY_ZONES[1];
  const shippingUsd = currency === 'ETB' ? (activeZone.rateEtb / exchangeRate) : activeZone.rateUsd;

  let discountUsd = 0;
  if (appliedPromo) {
    discountUsd = appliedPromo.discount;
  }

  const finalTotalUsd = Math.max(0, subtotal - discountUsd + shippingUsd);

  const handleCopyAccount = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('እባክዎ ትክክለኛ የፎቶ/ስክሪንሽት ደረሰኝ ይምረጡ (JPG, PNG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target?.result as string);
      setDuplicateError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const clean = promoCodeInput.trim().toUpperCase();

    // Dynamically check active Special Offer Campaign from Admin Dashboard
    let activeCampaignPromo: {
      type: 'percent' | 'fixed';
      value: number;
      label: string;
      minOrder?: number;
      targetCategory?: string;
      targetProductIds?: string[];
    } | null = null;
    try {
      const savedOfferStr = localStorage.getItem('kiru_special_offer');
      if (savedOfferStr) {
        const saved = JSON.parse(savedOfferStr);
        const now = Date.now();
        const start = new Date(saved.startDate).getTime();
        const end = new Date(saved.endDate).getTime();
        if (saved.isEnabled && now >= start && now < end && saved.promoCode?.toUpperCase() === clean) {
          activeCampaignPromo = {
            type: saved.discountType === 'percentage' ? 'percent' : 'fixed',
            value: saved.discountType === 'percentage' ? (saved.discountValue / 100) : saved.discountValue,
            label: `${saved.discountValue}% ${saved.title}`,
            targetCategory: saved.targetCategory,
            targetProductIds: saved.targetProductIds
          };
        }
      }
    } catch {}

    const promo = activeCampaignPromo || PROMO_CODES[clean];

    if (!promo) {
      setPromoError('Invalid promo code. Try KIRU10 or FIRSTORDER');
      return;
    }

    if (promo.minOrder && subtotal < promo.minOrder) {
      setPromoError(`Requires minimum order of $${promo.minOrder}`);
      return;
    }

    let eligibleSubtotal = subtotal;
    if (activeCampaignPromo) {
      if (activeCampaignPromo.targetCategory === 'selected' && Array.isArray(activeCampaignPromo.targetProductIds) && activeCampaignPromo.targetProductIds.length > 0) {
        eligibleSubtotal = cart
          .filter(item => activeCampaignPromo.targetProductIds!.includes(item.product.id))
          .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

        if (eligibleSubtotal === 0) {
          setPromoError('This promo is reserved for the 5 curated Flash Deal pieces (ለተመረጡት 5 የቅናሽ እቃዎች ብቻ የሚሰራ ነው).');
          return;
        }
      } else if (activeCampaignPromo.targetCategory && activeCampaignPromo.targetCategory !== 'all') {
        eligibleSubtotal = cart
          .filter(item => item.product.category === activeCampaignPromo.targetCategory)
          .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

        if (eligibleSubtotal === 0) {
          setPromoError(`This promo is valid for ${activeCampaignPromo.targetCategory} pieces only.`);
          return;
        }
      }
    }

    let calculatedDiscount = 0;
    if (promo.type === 'percent') {
      calculatedDiscount = Math.round(eligibleSubtotal * promo.value);
    } else {
      calculatedDiscount = promo.value;
    }

    setAppliedPromo({
      code: clean,
      discount: calculatedDiscount,
      label: promo.label
    });
    setPromoCodeInput('');
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setDuplicateError(null);

    // Validate mobile transfer fields
    if (paymentMethod === 'mobile_transfer') {
      const cleanTx = transactionId.trim().toUpperCase();
      if (!cleanTx) {
        setDuplicateError('እባክዎ የከፈሉበትን የግብይት ቁጥር (Transaction Reference ID) ያስገቡ!');
        return;
      }
      if (!receiptImage) {
        setDuplicateError('እባክዎ የክፍያ ማረጋገጫ ደረሰኝ (ስክሪንሽት) ይስቀሉ!');
        return;
      }

      // Pre-check for duplicate transaction ID with backend
      try {
        const checkRes = await fetch('/api/payments/check-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: cleanTx })
        });
        const checkData = await checkRes.json();
        if (checkData.available === false) {
          setDuplicateError(checkData.message);
          return;
        }
      } catch {
        // Check in localStorage if backend is offline
        try {
          const stored = JSON.parse(localStorage.getItem('kiru_orders') || '[]');
          const isDup = stored.some((o: Order) => 
            o.transferDetails?.transactionId &&
            o.transferDetails.transactionId.trim().toUpperCase() === cleanTx &&
            o.paymentStatus !== 'Rejected'
          );
          if (isDup) {
            setDuplicateError('ይህ የግብይት ቁጥር (Transaction ID) ከዚህ በፊት ሌላ ትዕዛዝ ላይ ጥቅም ላይ ውሏል! ደረሰኝን ለሁለተኛ ጊዜ መጠቀም በጥብቅ የተከለከለ ነው።');
            return;
          }
        } catch {}
      }
    }

    setIsSubmitting(true);
    const orderId = 'KL-' + Math.floor(100000 + Math.random() * 900000);

    const transferDetails: TransferPaymentDetails | undefined = paymentMethod === 'mobile_transfer' ? {
      bank: selectedBank,
      transactionId: transactionId.trim().toUpperCase(),
      receiptImage: receiptImage || undefined,
      accountHolderName: accountHolderName.trim() || undefined,
      transferAmount: toActiveCurrency(finalTotalUsd),
      submittedAt: new Date().toISOString()
    } : undefined;

    const completedOrder: Order = {
      id: orderId,
      customer: {
        ...details,
        deliveryZoneId: activeZone.id,
        deliveryZoneName: activeZone.name,
        paymentMethod,
        transferDetails
      },
      items: [...cart],
      subtotal,
      discount: discountUsd,
      shipping: shippingUsd,
      totalAmount: finalTotalUsd,
      currency,
      paymentMethod,
      paymentStatus: paymentMethod === 'mobile_transfer' ? 'Pending Verification' : 'Approved',
      transferDetails,
      deliveryZoneId: activeZone.id,
      deliveryZoneName: `${activeZone.name} (${activeZone.estimatedDelivery})`,
      notifications: [
        {
          id: `notif-${Date.now()}`,
          type: 'order_placed',
          title: 'Order Commission Registered',
          message: `Your commission for order ${orderId} has been successfully logged. Total: ${currency === 'ETB' ? (finalTotalUsd * exchangeRate).toLocaleString() + ' ETB' : '$' + finalTotalUsd.toLocaleString()}.`,
          timestamp: new Date().toISOString(),
          channel: 'sms'
        }
      ],
      status: paymentMethod === 'mobile_transfer' ? 'Payment Verification' : 'Processing',
      createdAt: new Date().toISOString(),
      trackingNumber: 'TRK-' + Math.random().toString(36).substring(2, 9).toUpperCase()
    };

    let returnedProducts: Product[] | undefined;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completedOrder)
      });
      const data = await res.json();
      if (!res.ok) {
        setDuplicateError(data.message || 'Error creating order');
        setIsSubmitting(false);
        return;
      }
      if (Array.isArray(data.updatedProducts)) {
        returnedProducts = data.updatedProducts;
      }
    } catch {
      // Offline fallback handling
    }

    if (paymentMethod === 'chapa') {
      try {
        const chapaRes = await fetch('/api/payments/chapa/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: toActiveCurrency(finalTotalUsd),
            currency,
            email: details.email,
            firstName: details.fullName.split(' ')[0] || 'Collector',
            lastName: details.fullName.split(' ')[1] || 'Circle',
            tx_ref: orderId,
            callback_url: window.location.origin + '/api/payments/chapa/webhook',
            return_url: window.location.origin + '/?chapa_verified=true'
          })
        });
        const chapaData = await chapaRes.json();
        if (chapaData.data?.checkout_url) {
          playLuxuryChime('order');
          onClearCart();
          setIsSubmitting(false);
          window.location.href = chapaData.data.checkout_url;
          return;
        }
      } catch (e) {
        console.warn('Chapa redirect error, completing regular order flow:', e);
      }
    }

    playLuxuryChime('order');
    onClearCart();
    setIsSubmitting(false);
    onOrderSuccess(completedOrder, returnedProducts);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className={`w-full max-w-lg h-full ${
          theme === 'dark' ? 'bg-[#0E0E10] text-[#F5F5F7] border-l border-white/10' : 'bg-white text-gray-900 border-l border-gray-200'
        } p-6 flex flex-col justify-between overflow-y-auto shadow-2xl`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <h3 className="font-serif text-xl font-medium tracking-wide">
              {step === 'cart' ? `Shopping Bag (${cart.length})` : 'Artisan Bespoke Checkout'}
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-black'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 'cart' ? (
            /* CART VIEW */
            <div className="mt-6 flex flex-col gap-4 max-h-[55vh] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#D4AF37] opacity-40" />
                  <p className="font-serif text-xl">Your bag is currently empty.</p>
                  <p className="text-xs text-gray-500 mt-2">Discover our handcrafted leather creations and add your selection.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-4 p-3.5 rounded-xl border transition-all ${
                      theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200 shadow-sm'
                    }`}
                  >
                    <img
                      src={item.product.images ? item.product.images[0] : ''}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-18 h-22 object-cover rounded-lg bg-gray-900 border border-white/10"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif text-sm font-medium">{item.product.name}</h4>
                          <span className="font-mono text-sm font-bold text-[#D4AF37]">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 inline-block"
                            style={{ backgroundColor: item.color.hex }}
                          />
                          <span className={`text-[11px] font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.color.name} • {item.size}
                          </span>
                        </div>
                        {item.customization && (
                          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                            {item.customization.monogramText && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Monogram: {item.customization.monogramText} ({item.customization.foilColor || 'gold'})
                              </span>
                            )}
                            {item.customization.leatherFinish && (
                              <span className="text-[10px] text-stone-400 font-mono">
                                • {item.customization.leatherFinish}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className={`flex items-center justify-between mt-3 pt-2 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'}`}>
                        <div className={`flex items-center gap-2 border rounded-md px-2 py-0.5 ${
                          theme === 'dark' ? 'border-white/20 bg-black/30' : 'border-gray-300 bg-white shadow-sm'
                        }`}>
                          <button
                            onClick={() => onUpdateQuantity(idx, -1)}
                            className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-semibold px-2">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(idx, 1)}
                            className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-[11px] font-mono text-gray-500">
                          {formatPrice(item.product.price)} each
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 mt-5">
              {!user && (
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  theme === 'dark' ? 'bg-[#3D2314]/50 border-amber-500/40' : 'bg-amber-50 border-amber-300'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <div>
                      <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ትዕዛዝ ለማስገባት እባክዎን መጀመሪያ Login ያድርጉ
                      </p>
                      <p className={`text-[11px] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Sign in is required before finalizing and tracking your order.
                      </p>
                    </div>
                  </div>
                  {onOpenSignIn && (
                    <button
                      type="button"
                      onClick={onOpenSignIn}
                      className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors shadow flex-shrink-0"
                    >
                      Sign In Now
                    </button>
                  )}
                </div>
              )}

              {duplicateError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-400 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-semibold block mb-0.5">የግብይት ማረጋገጫ ተቀባይነት አላገኘም!</span>
                    <span>{duplicateError}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={details.fullName}
                    onChange={(e) => setDetails({ ...details, fullName: e.target.value })}
                    placeholder="Kirubel Tesfaye"
                    className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:border-[#D4AF37]'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#D4AF37]'
                    }`}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={details.phone || ''}
                    onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                    placeholder="+251 91 123 4567"
                    className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:border-[#D4AF37]'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#D4AF37]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Email Address (Receipt & Tracking) *
                </label>
                <input
                  type="email"
                  required
                  value={details.email}
                  onChange={(e) => setDetails({ ...details, email: e.target.value })}
                  placeholder="kirubel@example.com"
                  className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:border-[#D4AF37]'
                      : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#D4AF37]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={details.address}
                    onChange={(e) => setDetails({ ...details, address: e.target.value })}
                    placeholder="Bole Sub-City, Road 3, House 45"
                    className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:border-[#D4AF37]'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#D4AF37]'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={details.city}
                    onChange={(e) => setDetails({ ...details, city: e.target.value })}
                    placeholder="Addis Ababa"
                    className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:border-[#D4AF37]'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#D4AF37]'
                    }`}
                  />
                </div>
              </div>

              {/* Delivery Zone & Calculated Shipping */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>DELIVERY ZONE & DESTINATION RATE</span>
                  </label>
                  <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Fee: <strong className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{shippingUsd === 0 ? 'FREE' : formatPrice(shippingUsd)}</strong>
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={selectedDeliveryZoneId}
                    onChange={(e) => setSelectedDeliveryZoneId(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs font-mono outline-none border transition-colors cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-black/60 border-white/20 text-white focus:border-[#D4AF37]'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-[#D4AF37]'
                    }`}
                  >
                    <optgroup label="📍 Addis Ababa Sub-Cities (በአዲስ አበባ ውስጥ)">
                      {DELIVERY_ZONES.filter(z => z.region === 'addis_ababa').map(zone => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} — {zone.rateEtb === 0 ? 'COMPLIMENTARY' : `${zone.rateEtb} ETB ($${zone.rateUsd})`}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🚚 Regional Express Cargo / EMS (ወደ ክልል ከተሞች)">
                      {DELIVERY_ZONES.filter(z => z.region === 'regional').map(zone => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} — {zone.rateEtb} ETB (${zone.rateUsd})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="✈️ International Worldwide (አለም አቀፍ)">
                      {DELIVERY_ZONES.filter(z => z.region === 'international').map(zone => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} — ${zone.rateUsd}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Selected Zone Estimated Delivery Badge */}
                <div className={`mt-2 p-2.5 rounded-lg border flex items-center justify-between text-[11px] ${
                  theme === 'dark' ? 'bg-[#3D2314]/30 border-[#D4AF37]/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span>{activeZone.estimatedDelivery}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase">
                    {activeZone.rateEtb === 0 ? 'FREE' : `${activeZone.rateEtb} ETB`}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] mb-1.5 font-semibold">
                  SELECT PAYMENT RAIL
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Primary Mobile Transfer Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mobile_transfer')}
                    className={`col-span-2 p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      paymentMethod === 'mobile_transfer'
                        ? 'bg-[#3D2314] border-[#D4AF37] text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                        : theme === 'dark' ? 'border-white/10 bg-white/5 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold block">የባንክ / ቴሌብር ሐዋላ (Mobile Transfer)</span>
                        <span className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>CBE Birr • Telebirr • Abyssinia • Awash</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#D4AF37] text-black font-bold">
                      Recommended
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('chapa')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      paymentMethod === 'chapa'
                        ? 'bg-[#3D2314] border-[#D4AF37] text-[#D4AF37]'
                        : theme === 'dark' ? 'border-white/10 bg-white/5 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium">Chapa Gateway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-[#3D2314] border-[#D4AF37] text-[#D4AF37]'
                        : theme === 'dark' ? 'border-white/10 bg-white/5 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs font-medium">Visa / MasterCard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`col-span-2 p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-[#3D2314] border-[#D4AF37] text-[#D4AF37]'
                        : theme === 'dark' ? 'border-white/10 bg-white/5 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-medium">Concierge Cash on Hand Delivery</span>
                  </button>
                </div>

                {/* --- MOBILE BANK TRANSFER SUB-PANEL --- */}
                {paymentMethod === 'mobile_transfer' && (
                  <div className={`mt-4 p-4 rounded-2xl border space-y-4 ${
                    theme === 'dark' ? 'border-[#D4AF37]/40 bg-[#161619]' : 'border-[#D4AF37]/50 bg-amber-50/40 shadow-sm'
                  }`}>
                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-wider block mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        1. የሚከፍሉበትን ባንክ ይምረጡ (Select Bank):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['CBE', 'Telebirr', 'BOA', 'Awash'] as const).map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBank(b)}
                            className={`py-2 px-2.5 rounded-xl border text-xs font-mono font-medium transition-all ${
                              selectedBank === b
                                ? 'bg-[#3D2314] border-[#D4AF37] text-[#D4AF37] font-bold shadow'
                                : theme === 'dark'
                                  ? 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                                  : 'bg-white border-gray-300 text-gray-700 hover:text-black hover:border-gray-400'
                            }`}
                          >
                            {b === 'CBE' ? 'ንግድ ባንክ' : b === 'BOA' ? 'አቢሲኒያ' : b === 'Awash' ? 'አዋሽ' : 'ቴሌብር'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Bank Account Display Card */}
                    <div className={`p-3.5 rounded-xl border space-y-2 ${
                      theme === 'dark' ? 'border-white/10 bg-black/50' : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-[11px] font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{STORE_ACCOUNTS[selectedBank].bank}</p>
                          <p className={`text-base font-mono font-bold mt-0.5 tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {STORE_ACCOUNTS[selectedBank].account}
                          </p>
                          <p className="text-[10px] text-[#D4AF37] font-mono mt-0.5">
                            Account Name: {STORE_ACCOUNTS[selectedBank].holder}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount(STORE_ACCOUNTS[selectedBank].rawAccount)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#3D2314] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all flex items-center gap-1 text-[11px] font-mono"
                          title="Copy Account Number"
                        >
                          {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAccount ? 'ኮፒ ተደርጓል!' : 'ኮፒ አድርግ'}</span>
                        </button>
                      </div>
                      <p className={`text-[10px] italic border-t pt-2 ${
                        theme === 'dark' ? 'text-gray-400 border-white/5' : 'text-gray-600 border-gray-100'
                      }`}>
                        {STORE_ACCOUNTS[selectedBank].instructions}
                      </p>
                    </div>

                    {/* Step 2: Transaction ID and Payer Details */}
                    <div>
                      <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700 font-semibold'}`}>
                        2. የግብይት ቁጥር (Transaction Reference / FT ID) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. FT24098XXXXX ወይም TB01928374"
                        value={transactionId}
                        onChange={(e) => {
                          setTransactionId(e.target.value.toUpperCase());
                          setDuplicateError(null);
                        }}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-mono uppercase outline-none transition-colors ${
                          theme === 'dark'
                            ? 'bg-black/60 border border-white/20 text-amber-300 focus:border-[#D4AF37]'
                            : 'bg-white border border-gray-300 text-amber-900 font-bold focus:border-[#D4AF37]'
                        }`}
                      />
                      <span className={`text-[10px] font-mono mt-0.5 block ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        ከደረሰኙ ላይ የሚገኘውን ትክክለኛ የግብይት መለያ ቁጥር ያስገቡ።
                      </span>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700 font-semibold'}`}>
                        የከፋይ ሙሉ ስም (Payer Account Name)
                      </label>
                      <input
                        type="text"
                        placeholder="የላኩበት የባንክ አካውንት ስም"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg text-xs outline-none transition-colors ${
                          theme === 'dark'
                            ? 'bg-black/60 border border-white/20 text-white focus:border-[#D4AF37]'
                            : 'bg-white border border-gray-300 text-gray-900 focus:border-[#D4AF37]'
                        }`}
                      />
                    </div>

                    {/* Step 3: Receipt Screenshot Upload */}
                    <div>
                      <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700 font-semibold'}`}>
                        3. የክፍያ ማረጋገጫ ደረሰኝ ስክሪንሽት (Upload Receipt Screenshot) *
                      </label>
                      
                      {receiptImage ? (
                        <div className={`relative rounded-xl overflow-hidden border p-2 flex items-center justify-between ${
                          theme === 'dark' ? 'border-[#D4AF37] bg-black/60' : 'border-[#D4AF37] bg-white'
                        }`}>
                          <div className="flex items-center gap-3">
                            <img
                              src={receiptImage}
                              alt="Receipt Preview"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200/20"
                            />
                            <div>
                              <span className="text-xs font-mono font-semibold text-emerald-600 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> ደረሰኝ ተያይዟል
                              </span>
                              <span className="text-[10px] text-gray-500 block font-mono">
                                ስክሪንሽት ተመርጧል
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReceiptImage(null)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-colors text-xs font-mono"
                          >
                            አስወግድ
                          </button>
                        </div>
                      ) : (
                        <label className={`flex flex-col items-center justify-center p-4 rounded-xl border border-dashed cursor-pointer transition-colors group ${
                          theme === 'dark'
                            ? 'border-white/20 hover:border-[#D4AF37] bg-black/40'
                            : 'border-gray-300 hover:border-[#D4AF37] bg-white'
                        }`}>
                          <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#D4AF37] mb-1.5" />
                          <span className={`text-xs font-mono group-hover:text-[#D4AF37] font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            የደረሰኝ ፎቶ እዚህ ይጫኑ (Upload Receipt)
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                            PNG, JPG, ወይም የሞባይል ስክሪንሽት
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleReceiptUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-inputs for card payment */}
                {paymentMethod === 'card' && (
                  <div className="mt-3 p-3 rounded-lg border border-white/10 bg-black/40 space-y-2">
                    <input
                      type="text"
                      placeholder="Card Number (4242 •••• •••• 4242)"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      maxLength={19}
                      className="w-full px-3 py-1.5 bg-white/5 border border-white/20 rounded text-xs text-white outline-none focus:border-[#D4AF37]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                        maxLength={5}
                        className="px-3 py-1.5 bg-white/5 border border-white/20 rounded text-xs text-white outline-none focus:border-[#D4AF37]"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        required
                        maxLength={4}
                        className="px-3 py-1.5 bg-white/5 border border-white/20 rounded text-xs text-white outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'chapa' && (
                  <div className="mt-3 p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-xs">
                    <p className="text-emerald-400 font-medium">Chapa Ethiopian Multi-Rail Checkout</p>
                    <p className="text-gray-400 text-[11px] mt-1">Supports instant settlement via CBE Birr, Awash, BOA, and cards.</p>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer & Price Breakdown */}
        <div className={`border-t pt-4 mt-4 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
          {/* Promo code input */}
          {step === 'cart' && (
            <div className="mb-4">
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-500">
                  <div className="flex items-center gap-1.5 font-mono">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{appliedPromo.code}: {appliedPromo.label} (-{formatPrice(appliedPromo.discount)})</span>
                  </div>
                  <button onClick={removePromo} className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. KIRU10)"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className={`w-full pl-8 pr-3 py-2 rounded-lg text-xs uppercase font-mono outline-none transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/15 text-white placeholder-gray-500 focus:border-[#D4AF37]'
                          : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#D4AF37]'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold uppercase transition-colors ${
                      theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-[#D4AF37]' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
                    }`}
                  >
                    Apply
                  </button>
                </form>
              )}
              {promoError && (
                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1 font-mono">
                  <AlertCircle className="w-3 h-3" /> {promoError}
                </p>
              )}
            </div>
          )}

          {/* Pricing summary table */}
          <div className={`space-y-1.5 text-xs font-mono mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountUsd > 0 && (
              <div className="flex justify-between text-emerald-500 font-semibold">
                <span>Privilege Discount ({appliedPromo?.code}):</span>
                <span>-{formatPrice(discountUsd)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Bespoke Delivery:</span>
              <span>{shippingUsd === 0 ? 'Complimentary' : formatPrice(shippingUsd)}</span>
            </div>
            <div className={`flex justify-between font-serif text-base font-semibold pt-2 border-t ${
              theme === 'dark' ? 'border-white/10 text-white' : 'border-gray-200 text-gray-900'
            }`}>
              <span>Total Investment:</span>
              <span className="font-mono text-[#D4AF37] text-lg font-bold">{formatPrice(finalTotalUsd)}</span>
            </div>
          </div>

          {step === 'cart' ? (
            <button
              onClick={() => setStep('checkout')}
              disabled={cart.length === 0}
              className="w-full py-4 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-xl disabled:opacity-40 hover:bg-amber-400 transition-colors shadow-xl shadow-[#D4AF37]/10"
            >
              Proceed To Checkout
            </button>
          ) : (
            <div className="space-y-2">
              <a
                href={`https://t.me/kiruleathers?text=${encodeURIComponent(
                  `ሰላም ኪሩ ሌዘር አቴሊየር! በቦርሳዬ ውስጥ ያሉትን እቃዎች በቀጥታ ማዘዝ እፈልጋለሁ፦\n${cart.map((it, idx) => `${idx + 1}. ${it.product.name} (${it.color.name}, ${it.size}) × ${it.quantity} = ${currency === 'ETB' ? (it.product.price * exchangeRate * it.quantity).toLocaleString() + ' ETB' : '$' + (it.product.price * it.quantity)}`).join('\n')}\n\n• ድምር ዋጋ፦ ${currency === 'ETB' ? (finalTotalUsd * exchangeRate).toLocaleString() + ' ETB' : '$' + finalTotalUsd}\n• ስሜ፦ ${details.fullName || 'Collector'}\n• ስልክ፦ ${details.phone || 'N/A'}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ወይም በቴሌግራም በቀጥታ ይዘዙ (Order via Telegram)</span>
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className={`w-1/3 py-4 font-semibold text-xs uppercase tracking-[0.1em] rounded-xl transition-colors ${
                    theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  Back
                </button>
                {!user ? (
                  <button
                    type="button"
                    onClick={onOpenSignIn}
                    className="w-2/3 py-4 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-[0.15em] rounded-xl hover:bg-amber-400 transition-colors shadow-xl shadow-[#D4AF37]/10"
                  >
                    Sign In To Place Order
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="w-2/3 py-4 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-xl disabled:opacity-50 hover:bg-amber-400 transition-colors shadow-xl shadow-[#D4AF37]/10"
                  >
                    {isSubmitting ? 'ክፍያውን በማረጋገጥ ላይ...' : (paymentMethod === 'mobile_transfer' ? 'ደረሰኝ አስገባና እዘዝ' : 'Authorize Investment')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
