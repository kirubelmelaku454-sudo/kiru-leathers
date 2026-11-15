import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Search, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Printer,
  Truck 
} from 'lucide-react';
import { type Order } from '../types';

interface PublicOrderTrackingModalProps {
  orders: Order[];
  onClose: () => void;
  onOpenInvoice: (order: Order) => void;
  theme: 'dark' | 'light';
  currency: 'USD' | 'ETB';
  exchangeRate?: number;
}

const STAGES = [
  { key: 'received', title: 'Order Received', amharic: 'ትዕዛዝ ተመዝግቧል', desc: 'Queued into atelier registry' },
  { key: 'payment', title: 'Payment Verification', amharic: 'የክፍያ ማረጋገጫ', desc: 'Accountant verifies transaction' },
  { key: 'crafting', title: 'Atelier Handcrafting', amharic: 'በእጅ እየተሰፋ ነው', desc: 'Master artisans saddle-stitching' },
  { key: 'inspection', title: 'Quality Inspection', amharic: 'የጥራት ቁጥጥር', desc: 'Tensile check & beeswax burnishing' },
  { key: 'dispatch', title: 'Out For Delivery', amharic: 'ለማድረስ ወጥቷል', desc: 'White-glove courier dispatched' },
  { key: 'delivered', title: 'Delivered to Collector', amharic: 'ተረክበዋል', desc: 'Commission completed' }
];

export const PublicOrderTrackingModal: React.FC<PublicOrderTrackingModalProps> = ({
  orders,
  onClose,
  onOpenInvoice,
  theme,
  currency,
  exchangeRate = 125
}) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);

  const cleanQuery = query.trim().toUpperCase();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanQuery) return;
    setSearched(true);

    const matchFn = (list: Order[]) => {
      const normalizedDigits = cleanQuery.replace(/[^0-9]/g, '');
      return list.find(o => {
        const idMatch = o.id.toUpperCase() === cleanQuery || o.id.toUpperCase().includes(cleanQuery);
        const trackingMatch = o.trackingNumber?.toUpperCase() === cleanQuery;
        const phoneDigits = (o.customer.phone || '').replace(/[^0-9]/g, '');
        const phoneMatch = normalizedDigits.length >= 6 && phoneDigits.includes(normalizedDigits);
        return idMatch || trackingMatch || phoneMatch;
      });
    };

    let found = matchFn(orders);

    if (!found) {
      try {
        const res = await fetch('/api/orders');
        const latestOrders: Order[] = await res.json();
        if (Array.isArray(latestOrders)) {
          found = matchFn(latestOrders);
        }
      } catch {}
    }

    setMatchedOrder(found || null);
  };

  const getStageIndex = (order: Order) => {
    if (order.status === 'Payment Rejected') return -1;
    if (order.status === 'Payment Verification') return 1;
    if (order.status === 'In Atelier' || order.status === 'Processing') return 2;
    if (order.status === 'Shipped') return 4;
    if (order.status === 'Delivered') return 5;
    return 1;
  };

  const formatPrice = (usd: number) => {
    const val = currency === 'ETB' ? usd * exchangeRate : usd;
    return currency === 'ETB' ? `${val.toLocaleString()} ETB` : `$${val.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl relative ${
          theme === 'dark' ? 'bg-[#111214] text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'
        } p-6 sm:p-8 my-6 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3D2314] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-2xl font-medium tracking-tight">Public Order Tracking</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37]">
                  ትዕዛዝ መከታተያ
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Track your artisanal leather piece with Order ID or Phone Number
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2.5 rounded-full transition-colors ${
              theme === 'dark'
                ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-black'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="my-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. KL-123456) or Phone (e.g. 0911...)"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-mono outline-none border transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/15 text-white placeholder-gray-500 focus:border-[#D4AF37]'
                    : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#D4AF37]'
                }`}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-semibold uppercase text-xs tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Locate Order</span>
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-mono">
            Tip: You can use the 6-digit reference from your receipt or your contact phone.
          </p>
        </form>

        {/* Search Results */}
        {searched && !matchedOrder && (
          <div className={`py-12 text-center text-gray-400 rounded-2xl border ${
            theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-gray-50'
          }`}>
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h4 className={`font-serif text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No Matching Order Found</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              We could not find an active commission matching <strong className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{query}</strong>. Please check the spelling or contact our Concierge desk.
            </p>
          </div>
        )}

        {matchedOrder && (
          <div className="space-y-6">
            
            {/* Top Order Snapshot */}
            <div className={`p-5 rounded-2xl border ${
              theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-gray-50 border-gray-200 shadow-sm'
            } flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl font-bold text-[#D4AF37]">{matchedOrder.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                    matchedOrder.paymentStatus === 'Approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : matchedOrder.paymentStatus === 'Rejected'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                  }`}>
                    {matchedOrder.paymentStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Collector: <strong className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{matchedOrder.customer.fullName}</strong> • Destination: {matchedOrder.customer.city}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenInvoice(matchedOrder)}
                  className="px-4 py-2 rounded-xl border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-mono text-xs uppercase font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View Official Invoice</span>
                </button>
              </div>
            </div>

            {/* Rejection Notice Banner if applicable */}
            {matchedOrder.paymentStatus === 'Rejected' && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Payment Unverified / የክፍያ ማረጋገጫ ውድቅ ሆኗል</span>
                </div>
                <p>{matchedOrder.rejectionReason || 'Please contact our concierge desk to provide a valid payment slip.'}</p>
              </div>
            )}

            {/* Courier Dispatch Card if Assigned */}
            {matchedOrder.courier && (
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs font-mono flex items-start gap-3">
                <Truck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-300">🚚 Assigned Dispatch Courier (የተመደበው አድራሽ)</span>
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30 font-semibold">In Transit</span>
                  </div>
                  <p className="text-gray-300 mt-1">
                    Driver: <strong className="text-white">{matchedOrder.courier.name}</strong> • Direct Phone: <a href={`tel:${matchedOrder.courier.phone}`} className="text-[#D4AF37] underline font-bold">{matchedOrder.courier.phone}</a>
                    {matchedOrder.courier.vehiclePlate && <span> • Vehicle: {matchedOrder.courier.vehiclePlate}</span>}
                  </p>
                </div>
              </div>
            )}

            {/* Visual Milestones Tracker */}
            <div className="py-2">
              <h5 className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-6">
                Live Workshop Progression (የእድገት ደረጃ)
              </h5>

              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-white/10 hidden sm:block" />

                <div className="space-y-6">
                  {STAGES.map((stg, idx) => {
                    const currentStageIdx = getStageIndex(matchedOrder);
                    const isDone = currentStageIdx >= idx;
                    const isCurrent = currentStageIdx === idx;

                    return (
                      <div key={stg.key} className="flex items-start gap-4 relative">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border z-10 transition-all ${
                          isDone
                            ? 'bg-[#3D2314] border-[#D4AF37] text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                            : 'bg-white/5 border-white/10 text-gray-600'
                        }`}>
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>

                        <div className="flex-1 pt-1">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <h6 className={`font-serif text-base font-medium ${
                              isDone ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : 'text-gray-400'
                            }`}>
                              {stg.title}
                            </h6>
                            <span className="text-xs text-gray-400 font-mono">({stg.amharic})</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-[#D4AF37] text-black font-bold animate-pulse">
                                CURRENT STAGE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{stg.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Itemized Snapshot */}
            <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
              <h5 className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-3">
                Items In Commission ({matchedOrder.items.length})
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchedOrder.items.map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border flex items-center gap-3 ${
                    theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-200 shadow-sm'
                  }`}>
                    <img
                      src={item.product.images ? item.product.images[0] : ''}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-12 h-14 object-cover rounded-lg bg-black border border-white/10"
                    />
                    <div className="text-xs">
                      <p className={`font-serif font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.product.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {item.color.name} • {item.size} • Qty: {item.quantity}
                      </p>
                      <p className="font-mono text-[#D4AF37] font-semibold mt-1">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </motion.div>
    </div>
  );
};

