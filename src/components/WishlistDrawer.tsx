import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { type Product } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  theme: 'dark' | 'light';
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
  theme
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className={`w-full max-w-md h-full ${
          theme === 'dark' ? 'bg-[#0E0E10] text-[#F5F5F7] border-l border-white/10' : 'bg-white text-gray-900 border-l border-gray-200'
        } p-6 flex flex-col justify-between shadow-2xl`}
      >
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
              <h3 className="font-serif text-xl tracking-wide font-medium">
                Saved Items ({wishlistProducts.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-black'
              }`}
              aria-label="Close Wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            {wishlistProducts.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#D4AF37]">
                  <Heart className="w-8 h-8 opacity-60" />
                </div>
                <p className="font-serif text-lg">Your Wishlist is Empty</p>
                <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
                  Click the heart icon on any leather product to save it for later or compare.
                </p>
              </div>
            ) : (
              wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-3.5 rounded-xl border flex gap-4 items-center justify-between transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 hover:border-[#D4AF37]/40'
                      : 'bg-gray-50 border-gray-200 hover:border-[#D4AF37]/50'
                  }`}
                >
                  <img
                    src={product.images && product.images[0] ? product.images[0] : ''}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-18 h-20 object-cover rounded-lg bg-gray-900 border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">
                      {product.categoryLabel || product.category}
                    </span>
                    <h4 className="font-serif text-sm font-medium truncate mt-0.5">{product.name}</h4>
                    <p className="font-mono text-sm font-semibold text-[#D4AF37] mt-1">${product.price}</p>
                    {product.stock !== undefined && (
                      <span className={`text-[10px] font-mono ${product.stock < 6 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {product.stock < 6 ? `Only ${product.stock} left in stock` : 'In Stock'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onAddToCart(product)}
                      className="p-2 rounded bg-[#D4AF37] text-black hover:bg-amber-400 transition-colors shadow"
                      title="Move to bag"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveFromWishlist(product.id)}
                      className="p-2 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {wishlistProducts.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => {
                wishlistProducts.forEach((p) => onAddToCart(p));
                onClose();
              }}
              className="w-full py-3.5 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded hover:bg-amber-400 transition-colors shadow-lg"
            >
              Move All To Bag
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

