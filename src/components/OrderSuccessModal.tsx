import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Printer, ArrowRight, ShieldCheck, Truck, Award } from 'lucide-react';
import { type Order } from '../types';
import { KiruLogo } from './KiruLogo';

interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
  theme: 'dark' | 'light';
  onViewOrderTracking?: (orderId: string) => void;
  onOpenInvoice?: (order: Order) => void;
  onViewCertificate?: (order: Order) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  theme,
  onViewOrderTracking,
  onOpenInvoice,
  onViewCertificate
}) => {
  const handlePrint = () => {
    if (onOpenInvoice) {
      onOpenInvoice(order);
    } else {
      window.print();
    }
  };

  const isEtb = order.currency === 'ETB';
  const formatVal = (val: number) => {
    return isEtb ? `${val.toLocaleString()} ETB` : `$${val.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl relative ${
          theme === 'dark' ? 'bg-[#111214] text-white border-[#D4AF37]/40' : 'bg-white text-gray-900 border-gray-200'
        } p-6 sm:p-8 my-8 print:border-none print:shadow-none print:bg-white print:text-black`}
      >
        {/* Printable Receipt Brand Header */}
        <div className="text-center pb-6 border-b border-white/10">
          <div className="flex justify-center mb-4">
            <KiruLogo variant="stacked" size="sm" theme={theme} subtitleText="Official Atelier Commission Receipt" />
          </div>

          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 text-emerald-400 shadow">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#D4AF37] font-semibold">
            Artisan Workshop Confirmation
          </span>
          <h2 className="font-serif text-3xl font-medium tracking-tight mt-1">
            Order Confirmed & Queued
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Order Reference: <span className="text-[#D4AF37] font-bold">{order.id}</span>
          </p>
        </div>

        {/* Order Meta details */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} text-xs font-mono`}>
          <div>
            <span className="text-gray-500 block uppercase text-[10px]">Date Placed</span>
            <span className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
              {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block uppercase text-[10px]">Payment Rail</span>
            <span className="font-semibold uppercase text-[#D4AF37]">
              {order.paymentMethod}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block uppercase text-[10px]">Dispatch Priority</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <Truck className="w-3 h-3" /> Artisan Express
            </span>
          </div>
          <div>
            <span className="text-gray-500 block uppercase text-[10px]">Tracking Number</span>
            <span className={`font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              {order.trackingNumber || 'PENDING'}
            </span>
          </div>
        </div>

        {/* Client & Shipping info */}
        <div className={`py-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} text-xs leading-relaxed`}>
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1 font-semibold">
            Bespoke Delivery Destination
          </h4>
          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order.customer.fullName}</p>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{order.customer.address}, {order.customer.city}</p>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} font-mono text-[11px]`}>{order.customer.email} • {order.customer.phone || 'Phone verified'}</p>
        </div>

        {/* Itemized Order Breakdown */}
        <div className={`py-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-semibold">
            Handcrafted Manifest ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
          </h4>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product.images ? item.product.images[0] : ''}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-12 object-cover rounded bg-gray-900 border border-white/10"
                  />
                  <div>
                    <p className={`font-serif font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.product.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {item.color.name} • {item.size} • Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-semibold text-[#D4AF37]">
                  {formatVal(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className={`py-4 space-y-1.5 text-xs font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          <div className="flex justify-between">
            <span>Manifest Subtotal:</span>
            <span>{formatVal(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Privilege Discount Applied:</span>
              <span>-{formatVal(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Artisan Shipping & Insurance:</span>
            <span>{order.shipping === 0 ? 'Complimentary' : formatVal(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-serif text-lg font-bold text-white pt-2 border-t border-white/10">
            <span>Settled Investment:</span>
            <span className="font-mono text-[#D4AF37]">{formatVal(order.totalAmount)}</span>
          </div>
        </div>

        {/* Security watermark banner */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-[11px] text-gray-400 mb-6">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
          <span>Every Kiru Leather item comes covered by our 100-Year Saddle Stitch Guarantee and Official Certificate of Authenticity.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" /> Receipt
          </button>

          {onViewCertificate && (
            <button
              onClick={() => onViewCertificate(order)}
              className="px-4 py-3.5 rounded-xl bg-[#8B7355]/20 border border-[#D4AF37]/50 hover:bg-[#8B7355]/40 text-amber-200 text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-[#D4AF37]" /> Authenticity Cert
            </button>
          )}

          {onViewOrderTracking && (
            <button
              onClick={() => {
                onClose();
                onViewOrderTracking(order.id);
              }}
              className="flex-1 py-3.5 bg-[#3D2314] border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Track Live Delivery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-amber-400 transition-colors shadow-lg"
          >
            Return To Store
          </button>
        </div>
      </motion.div>
    </div>
  );
};

