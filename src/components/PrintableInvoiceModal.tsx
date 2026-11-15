import React from 'react';
import { motion } from 'framer-motion';
import { Printer, X, CheckCircle2, QrCode } from 'lucide-react';
import { type Order } from '../types';
import { KiruLogo } from './KiruLogo';

interface PrintableInvoiceModalProps {
  order: Order;
  onClose: () => void;
  theme?: 'dark' | 'light';
  currency?: 'USD' | 'ETB';
  exchangeRate?: number;
}

export const PrintableInvoiceModal: React.FC<PrintableInvoiceModalProps> = ({
  order,
  onClose,
  currency = order.currency || 'ETB',
  exchangeRate = 125
}) => {
  const handlePrint = () => {
    window.print();
  };

  const isEtb = currency === 'ETB';
  const formatVal = (usd: number) => {
    const val = isEtb ? usd * exchangeRate : usd;
    return isEtb ? `${val.toLocaleString()} ETB` : `$${val.toLocaleString()}`;
  };

  const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden relative border border-gray-200 my-6"
      >
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="bg-[#1C1815] text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#D4AF37] font-semibold">Official Atelier Commercial Invoice</span>
            <span className="text-gray-400">• Ref: {order.id}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-amber-400 text-black font-mono text-xs uppercase font-bold flex items-center gap-2 shadow transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-invoice" className="p-8 sm:p-12 text-gray-900 font-sans print:p-0">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b-2 border-gray-900">
            <div>
              <div className="mb-2">
                <KiruLogo variant="horizontal" size="md" theme="light" subtitleText="Florence & Addis Ababa • Maison Est. 2024" />
              </div>
              <p className="text-xs text-gray-600 font-serif italic mt-0.5">
                Florentine Vegetable Tanning & Ethiopian Master Saddlecraft
              </p>
              <div className="text-[11px] text-gray-500 font-mono mt-3 space-y-0.5">
                <p>Bole Sub-City, Road 3, House 45, Addis Ababa, Ethiopia</p>
                <p>Tax Identification No (TIN): <strong>0045892180</strong> • VAT Reg: <strong>ET-4589-2024</strong></p>
                <p>Phone: +251 91 123 4567 • Email: concierge@kiruleathers.com</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 block">
                COMMERCIAL INVOICE & RECEIPT
              </span>
              <h2 className="font-mono text-2xl font-bold text-gray-900 mt-1">
                INV-{order.id}
              </h2>
              <div className="text-xs font-mono text-gray-600 mt-2 space-y-1">
                <p>Issue Date: <strong>{dateFormatted}</strong></p>
                <p>Tracking Ref: <strong>{order.trackingNumber || 'TRK-KL8923'}</strong></p>
                <p className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Status: {order.paymentStatus === 'Approved' ? 'PAID IN FULL (ተከፍሏል)' : 'PAYMENT QUEUED'}
                </p>
              </div>
            </div>
          </div>

          {/* Client & Destination Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-gray-200 text-xs">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                BILLED & SHIPPED TO / ደንበኛ:
              </span>
              <h4 className="text-sm font-bold text-gray-900">{order.customer.fullName}</h4>
              <p className="text-gray-600 mt-0.5 font-medium">{order.customer.address}</p>
              <p className="text-gray-600">
                {order.customer.city}
                {order.customer.deliveryZoneName && ` (${order.customer.deliveryZoneName})`}
              </p>
              <p className="text-gray-500 font-mono mt-1">
                Tel: {order.customer.phone || 'N/A'} • Email: {order.customer.email}
              </p>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                PAYMENT MANIFEST / የክፍያ ዝርዝር:
              </span>
              <p className="font-semibold uppercase text-gray-800">
                Method: {order.paymentMethod === 'mobile_transfer' ? 'Mobile Banking Transfer' : 'International Card'}
              </p>
              {order.transferDetails && (
                <div className="mt-1 font-mono text-[11px] text-gray-600 space-y-0.5">
                  <p>Bank: <strong>{order.transferDetails.bank}</strong></p>
                  <p>Transaction ID: <strong className="text-emerald-700">{order.transferDetails.transactionId}</strong></p>
                  {order.transferDetails.accountHolderName && (
                    <p>Sender Name: <strong>{order.transferDetails.accountHolderName}</strong></p>
                  )}
                </div>
              )}
              <p className="text-gray-500 text-[11px] mt-1 font-mono">
                Currency: <strong>{currency}</strong> (Exchange Rate: 1 USD = {exchangeRate} ETB)
              </p>
            </div>
          </div>

          {/* Itemized Products Table */}
          <div className="py-6 border-b border-gray-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-gray-900 text-gray-500 uppercase font-mono text-[10px]">
                  <th className="py-2.5">Item & Description</th>
                  <th className="py-2.5 text-center">Color / Finish</th>
                  <th className="py-2.5 text-center">Size</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-3">
                    <td className="py-3 pr-2">
                      <p className="font-serif font-bold text-gray-900 text-sm">{item.product.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        Handcrafted Vegetable-Tanned Full-Grain Hide
                      </p>
                    </td>
                    <td className="py-3 text-center text-gray-600 font-mono text-[11px]">
                      {item.color.name}
                    </td>
                    <td className="py-3 text-center text-gray-600 font-mono text-[11px]">
                      {item.size}
                    </td>
                    <td className="py-3 text-center font-bold text-gray-900 font-mono">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right font-mono text-gray-700">
                      {formatVal(item.product.price)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-gray-900">
                      {formatVal(item.product.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 py-6 border-b border-gray-200">
            <div className="max-w-xs text-xs text-gray-500 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100-Year Generational Guarantee Certified</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                All seams are hand-sewn with double needle waxed linen saddle stitches. Complimentary conditioning and repairs are provided at our Addis Ababa atelier.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatVal(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Collector Discount:</span>
                  <span>-{formatVal(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Shipping:</span>
                <span>{order.shipping === 0 ? 'Complimentary' : formatVal(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600 pt-1 border-t border-gray-100">
                <span>VAT (Included 15%):</span>
                <span>{formatVal(Math.round(order.totalAmount * 0.15))}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t-2 border-gray-900">
                <span>Total Settled:</span>
                <span className="text-[#3D2314] font-serif text-lg">{formatVal(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Verification Stamps & Footer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] text-gray-500 font-mono">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center p-1">
                <QrCode className="w-10 h-10 text-gray-700" />
              </div>
              <div>
                <p className="font-bold text-gray-800">AUTHENTICITY VERIFICATION QR</p>
                <p>Scan to verify workshop serial & provenance</p>
              </div>
            </div>

            {/* Official Stamp Simulation */}
            <div className="p-3 border-2 border-red-800 rounded-xl text-red-800 text-center uppercase tracking-widest font-mono text-[9px] transform -rotate-3 bg-red-50/50">
              <p className="font-bold">KIRU LEATHERS ATELIER</p>
              <p className="font-serif italic text-[11px] font-normal">Officially Sealed & Approved</p>
              <p className="text-[8px] mt-0.5">ADDIS ABABA • FIRENZE</p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

