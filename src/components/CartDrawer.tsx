import React, { useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    totalPrice,
    totalCount,
    restaurantStatus,
    setIsCheckoutOpen,
  } = useOrder();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#16181e] border-l border-stone-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-[#191b22]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#991b1b]/20 border border-[#b91c1c]/40 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 id="cart-drawer-title" className="font-serif-brand text-lg font-bold text-white">
                  Your Order
                </h3>
                <p className="text-xs text-stone-400">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'} in cart
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Closed Status Notice in Cart */}
          {!restaurantStatus.isOpen && (
            <div className="bg-rose-950/40 border-b border-rose-900/40 px-5 py-3 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-white">
                  Restaurant Currently Closed
                </span>
                <p className="text-stone-300">
                  Your order can be prepared once Dragon Wok opens at 12:00 PM.
                </p>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mb-4 text-stone-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">
                  Your Cart is Empty
                </h4>
                <p className="text-xs text-stone-400 max-w-xs mb-6">
                  Add something delicious from the Dragon Wok menu.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    const el = document.getElementById('menu');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-[#991b1b] hover:bg-[#b91c1c] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors shadow-md"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#1c1f27] border border-stone-800/80 rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-amber-400 font-semibold tabular-nums">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          (Rs. {item.price.toLocaleString()} each)
                        </span>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-stone-900 border border-stone-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-stone-500 hover:text-rose-400 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-stone-400">
                    {totalCount} total dishes
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-stone-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cart</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-stone-800 bg-[#191b22] space-y-4">
              {/* Subtotal */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase font-semibold text-stone-400 block">
                    Subtotal
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Prices in Pakistani Rupees (Rs.)
                  </span>
                </div>
                <span className="font-serif-brand text-2xl font-bold text-amber-400 tabular-nums">
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-950/40 hover:translate-y-[-1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 text-center">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>
                  {restaurantStatus.isOpen
                    ? 'Orders prepared fresh in 15–25 mins.'
                    : 'Pre-order accepted; will prepare at 12:00 PM.'}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
