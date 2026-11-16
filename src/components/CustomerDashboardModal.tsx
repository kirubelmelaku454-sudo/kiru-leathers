import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Package,
  CheckCircle,
  Truck,
  LogOut,
  MapPin,
  Receipt,
  Sparkles,
  ChevronRight,
  Clock,
  XCircle,
  MessageSquare,
  Send,
  ArrowLeft,
  CheckCircle2,
  Crown,
  Gem,
  Award
} from 'lucide-react';
import { type User, type Order, type CustomerMessage } from '../types';
import { getMessageThread } from '../utils/messageThread';
import { KiruLogo } from './KiruLogo';

interface CustomerDashboardModalProps {
  user: User;
  orders: Order[];
  messages?: CustomerMessage[];
  onSendMessage?: (message: CustomerMessage) => Promise<boolean | void> | void;
  onCustomerReplyMessage?: (messageId: string, replyText: string) => Promise<boolean | void> | void;
  onRefreshMessages?: () => void;
  onUserUpdated?: (user: User) => void;
  initialTab?: 'orders' | 'messages' | 'profile';
  onClose: () => void;
  onLogout: () => void;
  onViewReceipt: (order: Order) => void;
  onViewCertificate?: (order: Order) => void;
  onOpenAdmin?: () => void;
  theme: 'dark' | 'light';
  currency: 'USD' | 'ETB';
  exchangeRate?: number;
}

const ORDER_STEPS = [
  { id: 'placed', title: 'Order Confirmed', titleAm: 'ትዕዛዝ ተረጋግጧል', desc: 'Logged into artisan queue' },
  { id: 'cutting', title: 'Tuscan Hide Cut', titleAm: 'የቆዳ መቆረጥ', desc: 'Individual grain matching' },
  { id: 'stitching', title: 'Saddle Stitching', titleAm: 'በእጅ መስፋት', desc: 'Waxed thread hand sewing' },
  { id: 'burnishing', title: 'Edge Burnishing', titleAm: 'የጠርዝ ማለስለስ', desc: 'Beeswax heat sealing' },
  { id: 'delivered', title: 'Dispatched & Delivered', titleAm: 'ማድረስ ተጠናቋል', desc: 'White-glove delivery' }
];

export const CustomerDashboardModal: React.FC<CustomerDashboardModalProps> = ({
  user,
  orders,
  messages = [],
  onSendMessage,
  onCustomerReplyMessage,
  onRefreshMessages,
  onUserUpdated,
  initialTab = 'orders',
  onClose,
  onLogout,
  onViewReceipt,
  onViewCertificate,
  onOpenAdmin,
  theme,
  currency,
  exchangeRate = 125
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'messages' | 'loyalty' | 'profile'>(initialTab);

  useEffect(() => {
    onRefreshMessages?.();
  }, [activeTab]);

  // STRICT PRIVACY & DATA ISOLATION:
  // Customers can strictly ONLY view their own orders!
  const customerOrders = useMemo(() => {
    return orders.filter(o => {
      const emailMatch = o.customer?.email && user.email && o.customer.email.toLowerCase() === user.email.toLowerCase();
      const idMatch = o.userId && user.id && o.userId === user.id;
      return Boolean(emailMatch || idMatch);
    });
  }, [orders, user]);

  // STRICT PRIVACY & DATA ISOLATION:
  // Customers can strictly ONLY view their own messages & replies!
  const customerMessages = useMemo(() => {
    return messages.filter(m => {
      const idMatch = m.userId && user.id && m.userId === user.id;
      const emailMatch = m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase();
      return Boolean(idMatch || emailMatch);
    });
  }, [messages, user]);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    customerOrders.length > 0 ? customerOrders[0].id : null
  );

  const selectedOrderForTracking = customerOrders.find(o => o.id === selectedOrderId) || (customerOrders.length > 0 ? customerOrders[0] : null);

  const formatPrice = (usd: number) => {
    const val = currency === 'ETB' ? usd * exchangeRate : usd;
    return currency === 'ETB' ? `${val.toLocaleString()} ETB` : `$${val.toLocaleString()}`;
  };

  // Profile Form state
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profileCity, setProfileCity] = useState(user.city || 'Addis Ababa');
  const [profileAddress, setProfileAddress] = useState(user.address || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);

  // New message to atelier state
  const [newMessageText, setNewMessageText] = useState('');
  const [newInquiryType, setNewInquiryType] = useState<'bespoke' | 'order' | 'visit' | 'general'>('bespoke');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);
  const [threadReplies, setThreadReplies] = useState<Record<string, string>>({});
  const [sendingThreadReplyId, setSendingThreadReplyId] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSavedMsg(null);
    try {
      const token = localStorage.getItem('kiru_token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          city: profileCity,
          address: profileAddress
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      if (data.user && onUserUpdated) {
        onUserUpdated(data.user);
      }
      setProfileSavedMsg('Profile successfully saved to atelier database!');
      setTimeout(() => setProfileSavedMsg(null), 3000);
    } catch (err: any) {
      setProfileSavedMsg(err.message || 'Saved locally');
      setTimeout(() => setProfileSavedMsg(null), 3000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSendNewMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    setMessageSentSuccess(false);

    const newMsg: CustomerMessage = {
      id: `msg-${Date.now()}`,
      userId: user.id,
      fullName: user.name,
      email: user.email,
      phone: profilePhone || user.phone || '',
      inquiryType: newInquiryType,
      message: newMessageText.trim(),
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    try {
      if (onSendMessage) {
        const res = await onSendMessage(newMsg);
        if (res === false) return;
      } else {
        const token = localStorage.getItem('kiru_token');
        await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(newMsg)
        });
      }
      setNewMessageText('');
      setMessageSentSuccess(true);
      setTimeout(() => setMessageSentSuccess(false), 4000);
    } catch (error) {
      console.error('Failed to dispatch customer message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleThreadReply = async (messageId: string) => {
    const text = (threadReplies[messageId] || '').trim();
    if (!text || sendingThreadReplyId === messageId) return;

    setSendingThreadReplyId(messageId);
    try {
      if (onCustomerReplyMessage) {
        const ok = await onCustomerReplyMessage(messageId, text);
        if (ok === false) return;
      }
      setThreadReplies((prev) => ({ ...prev, [messageId]: '' }));
    } finally {
      setSendingThreadReplyId(null);
    }
  };

  const getStepProgressIndex = (status: Order['status']) => {
    switch (status) {
      case 'Payment Verification': return 0;
      case 'Pending': return 0;
      case 'In Atelier': return 2;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      case 'Payment Rejected': return -1;
      default: return 2;
    }
  };

  const unreadRepliesCount = customerMessages.filter(m => m.status === 'replied' && m.reply).length;

  return (
    <div className={`fixed inset-0 z-50 w-full h-full min-h-screen flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-200 ${
      isDark ? 'bg-[#0A0B0E] text-stone-100' : 'bg-[#FAF8F5] text-stone-900'
    }`}>
      {/* ======================================================== */}
      {/* LUXURY LEFT SIDEBAR: User Info, Navigation, Sign Out     */}
      {/* ======================================================== */}
      <aside className={`w-full md:w-72 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r flex flex-col justify-between p-4 sm:p-6 z-20 max-h-[42vh] md:max-h-none overflow-y-auto md:overflow-visible ${
        isDark ? 'bg-[#111216] border-white/10' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div>
          {/* Top Brand & Atelier Badge */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
            <KiruLogo variant="horizontal" size="sm" theme={isDark ? 'dark' : 'light'} subtitleText="Collector Desk • Addis Ababa" />

            <div className="flex items-center gap-1.5 md:hidden">
              <button
                type="button"
                onClick={onLogout}
                className="px-2.5 py-1.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-mono text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                title="Sign Out (ውጣ)"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Sign Out (ውጣ)</span>
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-stone-100 text-stone-600'
                }`}
                title="Close Portal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          <div className={`p-4 rounded-2xl border mb-6 relative overflow-hidden ${
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-stone-50 border-stone-200 shadow-2xs'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#3D2314] border-2 border-[#D4AF37] flex items-center justify-center font-serif text-lg font-bold text-[#D4AF37] shadow shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-serif text-base font-bold truncate">{user.name}</h3>
                </div>
                <p className="text-[11px] font-mono text-gray-400 truncate">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] font-bold">
                  Collector Circle
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`w-full px-3.5 py-3 rounded-xl flex items-center justify-between transition-all font-semibold ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-amber-500/20 via-[#3D2314]/50 to-amber-500/10 border border-[#D4AF37] text-[#D4AF37] shadow-sm'
                  : isDark ? 'text-stone-300 hover:bg-white/5' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-[#D4AF37]" />
                <span>My Orders & Tracker</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'orders' ? 'bg-[#D4AF37] text-black' : isDark ? 'bg-white/10 text-gray-300' : 'bg-stone-200 text-stone-700'
              }`}>
                {customerOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              className={`w-full px-3.5 py-3 rounded-xl flex items-center justify-between transition-all font-semibold ${
                activeTab === 'messages'
                  ? 'bg-gradient-to-r from-amber-500/20 via-[#3D2314]/50 to-amber-500/10 border border-[#D4AF37] text-[#D4AF37] shadow-sm'
                  : isDark ? 'text-stone-300 hover:bg-white/5' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                <span>Atelier Concierge & Replies</span>
              </div>
              {unreadRepliesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                  {unreadRepliesCount} Replied
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('loyalty')}
              className={`w-full px-3.5 py-3 rounded-xl flex items-center justify-between transition-all font-semibold ${
                activeTab === 'loyalty'
                  ? 'bg-gradient-to-r from-amber-500/20 via-[#3D2314]/50 to-amber-500/10 border border-[#D4AF37] text-[#D4AF37] shadow-sm'
                  : isDark ? 'text-stone-300 hover:bg-white/5' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-[#D4AF37]" />
                <span>Collector Circle VIP</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                {user.loyaltyTier ? user.loyaltyTier.split(' ')[0] : 'Classic'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full px-3.5 py-3 rounded-xl flex items-center justify-between transition-all font-semibold ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-amber-500/20 via-[#3D2314]/50 to-amber-500/10 border border-[#D4AF37] text-[#D4AF37] shadow-sm'
                  : isDark ? 'text-stone-300 hover:bg-white/5' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>Profile & Shipping</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-white/10 space-y-2 mt-6">
          {user.role === 'admin' && onOpenAdmin && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-amber-400 bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-black text-xs font-mono font-bold transition flex items-center justify-center gap-2 shadow"
            >
              <span>⚙️</span>
              <span>Switch to Admin Portal</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className={`w-full py-2.5 px-3 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 ${
              isDark
                ? 'border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                : 'border-stone-200 hover:border-red-300 text-stone-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out (ውጣ)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-3 rounded-xl bg-[#D4AF37] hover:brightness-110 text-black text-xs font-mono uppercase tracking-wider font-bold transition-all shadow flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA: Orders Tracker, Messaging, Profile    */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-white/10 bg-[#0E0F13]' : 'border-stone-200 bg-white'
        }`}>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold flex items-center gap-2">
              {activeTab === 'orders' && (
                <>
                  <Package className="w-5 h-5 text-[#D4AF37]" />
                  <span>My Commissioned Orders & Live Workshop Tracker (የትእዛዝ ዝርዝርና የቀጥታ መከታተያ)</span>
                </>
              )}
              {activeTab === 'messages' && (
                <>
                  <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
                  <span>Atelier Direct Communication & Replies (የአቴሊየር ቀጥታ መልእክቶች)</span>
                </>
              )}
              {activeTab === 'loyalty' && (
                <>
                  <Crown className="w-5 h-5 text-[#D4AF37]" />
                  <span>The Collector Circle VIP & Privileges (የክብር አባላት መርሃ-ግብር)</span>
                </>
              )}
              {activeTab === 'profile' && (
                <>
                  <MapPin className="w-5 h-5 text-[#D4AF37]" />
                  <span>Collector Profile & Priority Delivery Details (የደንበኛ መረጃና አድራሻ)</span>
                </>
              )}
            </h1>
            <p className="text-xs font-mono text-gray-400">
              Strictly private and encrypted session for {user.name} ({user.email})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 py-1.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Sign Out (ውጣ)"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Sign Out (ውጣ)</span>
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl md:rounded-full transition-colors ${
                isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-stone-100 text-stone-600 hover:text-black'
              }`}
              title="Close Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Tab Content Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: ORDERS ARCHIVE & LIVE ATELIER TRACKER             */}
          {/* ======================================================== */}
          {activeTab === 'orders' && (
            <div>
              {customerOrders.length === 0 ? (
                <div className={`text-center py-24 rounded-3xl border ${
                  isDark ? 'border-white/10 bg-white/[0.01]' : 'border-stone-200 bg-white shadow-sm'
                }`}>
                  <Package className="w-16 h-16 mx-auto mb-4 text-[#D4AF37] opacity-40" />
                  <h3 className="font-serif text-2xl font-bold mb-2">No Commissioned Orders Found</h3>
                  <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                    You have not placed any orders yet. When you commission our bespoke leather pieces, real-time workshop tracking and printable luxury invoices will appear here.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-full bg-[#D4AF37] hover:brightness-110 text-black font-semibold text-xs font-mono uppercase tracking-widest shadow-lg"
                  >
                    Explore Handcrafted Collection
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Orders Selection List */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">
                        Your Order History ({customerOrders.length})
                      </span>
                      <span className="text-[10px] font-mono text-[#D4AF37]">Click to inspect</span>
                    </div>

                    <div className="space-y-3">
                      {customerOrders.map((ord) => {
                        const isSelected = selectedOrderForTracking?.id === ord.id;
                        return (
                          <div
                            key={ord.id}
                            onClick={() => setSelectedOrderId(ord.id)}
                            className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-gradient-to-br from-amber-500/15 via-[#3D2314]/40 to-amber-500/10 border-[#D4AF37] shadow-lg ring-1 ring-[#D4AF37]/50'
                                : isDark
                                  ? 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                  : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2.5">
                              <div>
                                <span className="font-mono text-xs font-bold text-[#D4AF37] block">
                                  #{ord.id}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold tracking-wider ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : ord.status === 'Shipped'
                                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                  : ord.status === 'Payment Rejected'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : ord.status === 'Payment Verification'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {ord.status === 'Payment Verification' ? 'Verifying Slip' : ord.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/5">
                              <span className="text-gray-400">
                                {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                              </span>
                              <span className="font-bold text-amber-300">
                                {formatPrice(ord.totalAmount)}
                              </span>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewReceipt(ord);
                                  }}
                                  className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 font-mono font-semibold"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  <span>Invoice</span>
                                </button>
                                {onViewCertificate && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onViewCertificate(ord);
                                    }}
                                    className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 font-mono font-semibold"
                                  >
                                    <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <span>Cert</span>
                                  </button>
                                )}
                              </div>
                              <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-[#D4AF37]' : 'text-gray-500'}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Active Order Live Tracking Details */}
                  <div className={`lg:col-span-7 p-6 sm:p-7 rounded-3xl border shadow-xl ${
                    isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-stone-200'
                  }`}>
                    {selectedOrderForTracking ? (
                      <div className="space-y-6">
                        {/* Header of selected order */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                              Workshop Production Status
                            </span>
                            <h3 className="font-serif text-xl font-bold mt-0.5">
                              Tracking Ref: {selectedOrderForTracking.trackingNumber || selectedOrderForTracking.id}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => onViewReceipt(selectedOrderForTracking)}
                              className="px-3.5 py-2 rounded-xl border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all text-xs font-mono uppercase font-bold flex items-center gap-1.5 shadow cursor-pointer"
                            >
                              <Receipt className="w-4 h-4" />
                              <span>Invoice</span>
                            </button>
                            {onViewCertificate && (
                              <button
                                type="button"
                                onClick={() => onViewCertificate(selectedOrderForTracking)}
                                className="px-3.5 py-2 rounded-xl bg-[#8B7355]/20 border border-[#D4AF37]/60 text-amber-200 hover:bg-[#8B7355]/40 transition-all text-xs font-mono uppercase font-bold flex items-center gap-1.5 shadow cursor-pointer"
                              >
                                <Award className="w-4 h-4 text-[#D4AF37]" />
                                <span>Certificate of Authenticity</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Special Status Banners */}
                        {selectedOrderForTracking.status === 'Payment Verification' && (
                          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
                            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <h5 className="font-serif text-sm font-bold text-amber-300">
                                የክፍያ ደረሰኝ በማረጋገጥ ላይ (Payment Verification In Progress)
                              </h5>
                              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                                የባንክ ማስተላለፊያ ደረሰኝዎ ደርሶናል። የኪሩ ሌዘር አስተዳዳሪ የግብይት ቁጥሩን (TX ID:{' '}
                                <strong className="text-amber-300 font-mono">
                                  {selectedOrderForTracking.transferDetails?.transactionId || 'N/A'}
                                </strong>
                                ) እያረጋገጠ ነው። እንደተረጋገጠ ትዕዛዝዎ ወዲያውኑ ወደ አቴሊየር መስሪያ ክፍል ይተላለፋል።
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Courier Details Card if Dispatched */}
                        {selectedOrderForTracking.courier && (
                          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-start gap-3.5">
                            <Truck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="font-serif text-sm font-bold text-sky-300">
                                  🚚 White-Glove Courier Assigned (የተመደበው አድራሽ)
                                </h5>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                  In Transit
                                </span>
                              </div>
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                                  <span className="text-gray-400 text-[10px] uppercase block">Courier / Rider</span>
                                  <span className="text-white font-semibold">{selectedOrderForTracking.courier.name}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-400 text-[10px] uppercase block">Direct Phone</span>
                                    <span className="text-white font-semibold">{selectedOrderForTracking.courier.phone}</span>
                                  </div>
                                  <a
                                    href={`tel:${selectedOrderForTracking.courier.phone}`}
                                    className="px-2.5 py-1 rounded-lg bg-sky-500 text-black text-[10px] font-bold uppercase hover:bg-sky-400 transition-colors"
                                  >
                                    Call
                                  </a>
                                </div>
                                {selectedOrderForTracking.courier.vehiclePlate && (
                                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 sm:col-span-2">
                                    <span className="text-gray-400 text-[10px] uppercase block">Vehicle / Motorcycle Plate</span>
                                    <span className="text-white font-semibold">{selectedOrderForTracking.courier.vehiclePlate}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedOrderForTracking.status === 'Payment Rejected' && (
                          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3.5">
                            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h5 className="font-serif text-sm font-bold text-red-400">
                                ክፍያው ተቀባይነት አላገኘም (Payment Verification Rejected)
                              </h5>
                              <div className="mt-2 p-3 rounded-xl bg-black/40 border border-red-500/20 text-xs">
                                <span className="text-gray-400 block font-mono uppercase text-[10px]">
                                  የውድቅ የተደረገበት ምክንያት (Rejection Reason):
                                </span>
                                <p className="text-red-200 mt-0.5 font-medium">
                                  {selectedOrderForTracking.rejectionReason || 'የቀረበው የባንክ ግብይት ቁጥር ወይም ደረሰኝ ትክክለኛ አይደለም።'}
                                </p>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-2">
                                ትክክለኛውን የክፍያ ደረሰኝ ለማስተካከል እባክዎን በ "Atelier Concierge & Replies" ትር በኩል መልእክት ይላኩልን።
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedOrderForTracking.paymentStatus === 'Approved' && (
                          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3.5">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <h5 className="font-serif text-sm font-bold text-emerald-300">
                                ክፍያው ተረጋግጦ ጸድቋል (Payment Verified & Approved)
                              </h5>
                              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                                የባንክ ማስተላለፊያ ክፍያዎ በዋና አስተዳዳሪ ተረጋግጧል። ትዕዛዝዎ በአቴሊየር የእጅ ጥበብ ባለሙያዎች በከፍተኛ ጥንቃቄ እየተሰራ ይገኛል።
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Interactive Workshop Step Progress */}
                        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                          {ORDER_STEPS.map((step, idx) => {
                            const currentStepIdx = getStepProgressIndex(selectedOrderForTracking.status);
                            const isComplete = idx <= currentStepIdx;
                            const isCurrent = idx === currentStepIdx;

                            return (
                              <div key={step.id} className="relative flex items-start gap-4">
                                <div
                                  className={`absolute -left-6 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                    isComplete
                                      ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/30'
                                      : 'bg-black border-white/20 text-gray-600'
                                  }`}
                                >
                                  {isComplete ? (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                  )}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className={`text-xs font-mono font-semibold uppercase tracking-wider ${
                                      isCurrent ? 'text-[#D4AF37]' : isComplete ? (isDark ? 'text-white' : 'text-gray-900') : 'text-gray-500'
                                    }`}>
                                      {step.title} ({step.titleAm})
                                    </h5>
                                    {isCurrent && (
                                      <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] font-bold animate-pulse">
                                        Current Stage
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-400 mt-0.5">{step.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Delivery Destination */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-[#D4AF37]" />
                            <span>Destination: {selectedOrderForTracking.customer.address || 'Atelier Pick-up'}, {selectedOrderForTracking.customer.city}</span>
                          </span>
                          <span className="text-amber-400 font-bold">White-Glove Courier</span>
                        </div>

                        {/* Commissioned Items Detail */}
                        <div className="pt-5 border-t border-white/10">
                          <h4 className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold mb-3">
                            Commissioned Heirloom Pieces ({selectedOrderForTracking.items.length})
                          </h4>
                          <div className="space-y-2.5">
                            {selectedOrderForTracking.items.map((it, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${
                                  isDark ? 'bg-white/[0.02] border-white/5' : 'bg-stone-50 border-stone-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={it.product.images ? it.product.images[0] : ''}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="w-12 h-14 object-cover rounded-xl bg-black border border-white/10"
                                  />
                                  <div>
                                    <span className="font-serif font-bold text-sm block">{it.product.name}</span>
                                    <span className="text-[11px] text-gray-400 font-mono">
                                      {it.color.name} • Size {it.size} • Qty: {it.quantity}
                                    </span>
                                    {it.customization?.monogramText && (
                                      <span className="block mt-1 text-[10px] font-mono text-amber-400">
                                        Monogram: "{it.customization.monogramText}" ({it.customization.foilColor || 'gold'} foil)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="font-mono text-amber-400 font-bold text-sm">
                                  {formatPrice(it.product.price * it.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-400">
                        Select an order on the left to view live production progress.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ATELIER DIRECT TWO-WAY MESSAGING & REPLIES        */}
          {/* ======================================================== */}
          {activeTab === 'messages' && (
            <div className="space-y-8 max-w-4xl">
              <div>
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-[#D4AF37]" />
                  <span>Direct Communication with Kiru Atelier (የቀጥታ መልእክቶችና ምላሾች)</span>
                </h3>
                <p className="text-xs font-mono text-gray-400 mt-1">
                  Send inquiries directly to the master craftsmen in Addis Ababa and review their official responses in real time.
                </p>
              </div>

              {/* Form: Send New Inquiry to Atelier */}
              <form onSubmit={handleSendNewMessage} className={`p-6 rounded-3xl border shadow-xl ${
                isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-stone-200'
              } space-y-4`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base font-bold flex items-center gap-2 text-[#D4AF37]">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Send Inquiry to Master Artisan (አዲስ ጥያቄ ለአቴሊየሩ ይላኩ)</span>
                  </h4>
                  {messageSentSuccess && (
                    <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Message Dispatched to Concierge Desk!</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-gray-400 block uppercase text-[10px] mb-1 font-bold">
                      Inquiry Category (የጥያቄው ዓይነት)
                    </label>
                    <select
                      value={newInquiryType}
                      onChange={(e) => setNewInquiryType(e.target.value as any)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-[#D4AF37] ${
                        isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    >
                      <option value="bespoke">Bespoke Customization / የግል ማበጃ</option>
                      <option value="order">Order Tracking & Sizing / የትእዛዝና ልኬት ጥያቄ</option>
                      <option value="visit">Atelier Appointment / የአቴሊየር ጉብኝት ቀጠሮ</option>
                      <option value="general">Leather Care & Corporate / አጠቃላይ ጥያቄ</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block uppercase text-[10px] mb-1 font-bold">
                      Registered Email
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user.email}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs opacity-60 cursor-not-allowed ${
                        isDark ? 'bg-black/40 border-white/10 text-gray-400' : 'bg-stone-100 border-stone-200 text-stone-600'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block uppercase text-[10px] mb-1 font-bold">
                    Message to Master Craftsman (ዝርዝር መልእክትዎ)
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your inquiry, sizing needs, bespoke design details, or order questions..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-[#D4AF37] resize-none ${
                      isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSendingMessage || !newMessageText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-500 hover:brightness-110 disabled:opacity-40 text-black font-bold text-xs font-mono uppercase tracking-wider transition-all shadow flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingMessage ? 'Dispatching...' : 'Dispatch Message to Atelier'}</span>
                  </button>
                </div>
              </form>

              {/* Message History & Artisan Replies */}
              <div className="space-y-4">
                <h4 className="font-serif text-lg font-bold flex items-center justify-between">
                  <span>Atelier Conversation History ({customerMessages.length})</span>
                  <span className="text-xs font-mono text-gray-400 font-normal">Direct two-way thread</span>
                </h4>

                {customerMessages.length === 0 ? (
                  <div className={`text-center py-12 rounded-2xl border ${
                    isDark ? 'border-white/10 bg-white/[0.01]' : 'border-stone-200 bg-white'
                  }`}>
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-400 opacity-40" />
                    <p className="font-serif text-base font-bold">No messages sent yet</p>
                    <p className="text-xs text-gray-400 mt-0.5">Use the form above to consult with the Kiru master artisan directly.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customerMessages.map((msg) => {
                      const threadEntries = getMessageThread(msg);
                      const hasAdminReply = threadEntries.some((entry) => entry.senderRole === 'admin') || Boolean(msg.reply);

                      return (
                        <div
                          key={msg.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            hasAdminReply
                              ? isDark ? 'bg-amber-500/[0.03] border-amber-500/30 shadow-md' : 'bg-white border-amber-300 shadow-sm'
                              : isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-stone-200 shadow-2xs'
                          }`}
                        >
                          {/* Message Header */}
                          <div className={`flex items-center justify-between pb-3 border-b flex-wrap gap-2 ${
                            isDark ? 'border-white/10' : 'border-stone-200'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono uppercase bg-[#3D2314] text-[#D4AF37] border border-[#D4AF37]/30 font-bold">
                                {msg.inquiryType}
                              </span>
                              <span className="text-[11px] font-mono text-gray-400">
                                {new Date(msg.createdAt).toLocaleString()}
                              </span>
                            </div>

                            <div>
                              {msg.status === 'replied' && hasAdminReply ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>REPLIED / ተመልሷል</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>AWAITING ATELIER / በመታየት ላይ</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Chronological Two-Way Thread */}
                          <div className="mt-4 space-y-3">
                            {threadEntries.map((entry) => {
                              const isAdminEntry = entry.senderRole === 'admin';
                              return (
                                <div
                                  key={entry.id}
                                  className={`p-3.5 rounded-2xl border ${
                                    isAdminEntry
                                      ? isDark
                                        ? 'bg-amber-500/[0.08] border-amber-500/50 shadow-lg'
                                        : 'bg-amber-50 border-amber-300 shadow-xs'
                                      : isDark
                                        ? 'bg-black/30 border-white/10'
                                        : 'bg-stone-50 border-stone-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                                    <span className={`text-[11px] font-mono font-bold flex items-center gap-1.5 ${
                                      isAdminEntry
                                        ? isDark ? 'text-[#D4AF37]' : 'text-amber-800'
                                        : isDark ? 'text-stone-300' : 'text-stone-700'
                                    }`}>
                                      {isAdminEntry ? <span>👑</span> : <MessageSquare className="w-3 h-3 text-[#D4AF37]" />}
                                      <span>
                                        {isAdminEntry
                                          ? `${entry.senderName} — Official Atelier Response (የአቴሊየሩ ምላሽ)`
                                          : `${entry.senderName} (Your Message / የእርስዎ መልእክት)`}
                                      </span>
                                    </span>
                                    {entry.createdAt && (
                                      <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-[#D4AF37]" />
                                        <span>{new Date(entry.createdAt).toLocaleString()}</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-xs font-sans leading-relaxed whitespace-pre-wrap ${
                                    isAdminEntry
                                      ? isDark ? 'text-amber-100' : 'text-stone-900'
                                      : isDark ? 'text-stone-200' : 'text-stone-800'
                                  }`}>
                                    {entry.text}
                                  </p>
                                </div>
                              );
                            })}

                            {!hasAdminReply && (
                              <div className="p-3 rounded-xl bg-amber-500/5 border border-dashed border-amber-500/30 text-[11px] font-mono text-amber-500 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                                <span>Our master artisan is reviewing your inquiry. Their official response will appear right here.</span>
                              </div>
                            )}
                          </div>

                          {/* Customer Follow-up Reply Form (Two-way Chat) */}
                          <div className={`mt-4 pt-3.5 border-t ${isDark ? 'border-white/10' : 'border-stone-200'}`}>
                            <label className="block text-[10px] font-mono uppercase tracking-wider font-bold mb-1.5 text-gray-400">
                              Reply to Kiru Atelier (ለአቴሊየሩ መልስ ይጻፉ)
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                placeholder="Write a follow-up reply to our artisan... (ተጨማሪ መልስ እዚህ ይጻፉ...)"
                                value={threadReplies[msg.id] || ''}
                                onChange={(e) => setThreadReplies((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleThreadReply(msg.id);
                                  }
                                }}
                                className={`flex-1 px-3.5 py-2 text-xs rounded-xl border outline-none focus:border-[#D4AF37] transition-colors ${
                                  isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                                }`}
                              />
                              <button
                                type="button"
                                disabled={sendingThreadReplyId === msg.id || !threadReplies[msg.id]?.trim()}
                                onClick={() => handleThreadReply(msg.id)}
                                className="px-4 py-2 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-500 hover:brightness-110 disabled:opacity-40 text-black text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer shrink-0"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{sendingThreadReplyId === msg.id ? 'Sending...' : 'Reply (መልስ ላክ)'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: THE COLLECTOR CIRCLE VIP & LOYALTY PRIVILEGES     */}
          {/* ======================================================== */}
          {activeTab === 'loyalty' && (
            <div className="max-w-4xl space-y-8">
              {/* Luxury Atelier VIP Membership Card */}
              <div className="relative overflow-hidden rounded-3xl p-7 sm:p-8 border border-[#D4AF37]/50 bg-gradient-to-br from-[#2A160C] via-[#1A0D07] to-[#0A0503] shadow-2xl text-white">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#D4AF37]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#996515] text-black flex items-center justify-center font-serif font-black shadow-lg">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#D4AF37] block">
                        The Collector Circle
                      </span>
                      <h3 className="font-serif text-2xl font-bold tracking-tight">
                        {user.loyaltyTier || 'Classic Member'}
                      </h3>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                      Accrued Atelier Balance
                    </span>
                    <span className="font-serif text-3xl font-extrabold text-[#D4AF37]">
                      {(user.loyaltyPoints || Math.max(120, customerOrders.length * 75)).toLocaleString()}{' '}
                      <span className="text-xs font-mono uppercase font-normal text-stone-300">PTS</span>
                    </span>
                  </div>
                </div>

                {/* Tier Progress Bar */}
                <div className="relative z-10 pt-6 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-300">Current Tier: <strong>{user.loyaltyTier || 'Classic Member'}</strong></span>
                    <span className="text-[#D4AF37]">Next: <strong>Royal Collector (1,500 PTS)</strong></span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-[#D4AF37] rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, (((user.loyaltyPoints || Math.max(120, customerOrders.length * 75))) / 1500) * 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-[11px] font-mono text-gray-400">
                    Earn 1 Atelier Point for every 50 ETB invested. Higher tiers unlock complimentary bespoke gold monogramming and private vault viewings.
                  </p>
                </div>
              </div>

              {/* VIP Privileges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#D4AF37]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h5 className="font-serif font-bold text-sm">24K Gold Monogramming</h5>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Complimentary hot-foil initials stamped onto all leather goods in our Bespoke Studio.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h5 className="font-serif font-bold text-sm">White-Glove Priority Dispatch</h5>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Front-of-queue artisan handcrafting and direct private courier delivery across Addis Ababa.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Gem className="w-4 h-4" />
                  </div>
                  <h5 className="font-serif font-bold text-sm">Private Vault Access</h5>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Advance private viewing of rare vegetable-tanned hides and limited-edition archive releases.
                  </p>
                </div>
              </div>

              {/* VIP Privilege Voucher Code */}
              <div className="p-5 rounded-2xl bg-[#3D2314]/30 border border-[#D4AF37]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                    Active Collector Privilege Code
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-lg font-bold text-white bg-black/60 px-3 py-1 rounded-lg border border-white/10">
                      COLLECTOR10
                    </span>
                    <span className="text-xs text-emerald-400 font-mono">✓ 10% VIP Atelier Courtesy</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('COLLECTOR10');
                    alert('Promo code COLLECTOR10 copied to clipboard! Apply it in your shopping bag.');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-mono text-xs font-bold uppercase hover:bg-amber-400 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  Copy Promo Code
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: PROFILE & PRIORITY SHIPPING ADDRESS               */}
          {/* ======================================================== */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <form onSubmit={handleSaveProfile} className={`p-6 sm:p-7 rounded-3xl border shadow-xl ${
                isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-stone-200'
              } space-y-5`}>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="font-serif text-lg font-bold flex items-center gap-2 text-[#D4AF37]">
                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                    <span>Collector Profile & Delivery Address (የመገለጫና ማድረሻ መረጃ)</span>
                  </h4>
                  {profileSavedMsg && (
                    <span className="text-xs font-mono text-emerald-400 font-bold animate-pulse">
                      ✓ {profileSavedMsg}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="text-gray-400 block uppercase text-[10px] mb-1 font-bold">Full Name (ሙሉ ስም)</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-[#D4AF37] ${
                        isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block uppercase text-[10px] mb-1 font-bold">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs opacity-60 cursor-not-allowed ${
                        isDark ? 'bg-black/40 border-white/10 text-gray-400' : 'bg-stone-100 border-stone-200 text-stone-600'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block uppercase text-[10px] mb-1 font-bold">Phone Number (ስልክ ቁጥር)</label>
                    <input
                      type="tel"
                      placeholder="+251 911 002233"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-[#D4AF37] ${
                        isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block uppercase text-[10px] mb-1 font-bold">Sub-City / City (ክፍለ ከተማ / ከተማ)</label>
                    <input
                      type="text"
                      placeholder="Bole, Addis Ababa"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-[#D4AF37] ${
                        isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-gray-400 block uppercase text-[10px] mb-1 font-bold">Specific Delivery Address (የመኖሪያ/ቢሮ አድራሻ)</label>
                    <input
                      type="text"
                      placeholder="House / Office number, street, nearby landmark..."
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-[#D4AF37] ${
                        isDark ? 'bg-black/50 border-white/15 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:brightness-110 text-black font-bold text-xs font-mono uppercase tracking-wider transition-all shadow cursor-pointer"
                  >
                    {isSavingProfile ? 'Updating Database...' : 'Save Profile Changes (መረጃውን መዝግብ)'}
                  </button>
                </div>
              </form>

              {/* Kiru Atelier Guarantee Card */}
              <div className="p-6 rounded-3xl border border-[#D4AF37]/30 bg-[#3D2314]/30 text-xs">
                <h5 className="font-serif text-base font-bold text-[#D4AF37] mb-1.5 flex items-center gap-2">
                  <span>✨</span>
                  <span>Kiru Atelier 100-Year Heritage Guarantee</span>
                </h5>
                <p className="text-gray-300 font-light leading-relaxed">
                  Every commissioned creation is backed by our full atelier warranty against seam failure, complimentary biannual beeswax conditioning at our Bole flagship studio, and lifetime white-glove artisan support.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
