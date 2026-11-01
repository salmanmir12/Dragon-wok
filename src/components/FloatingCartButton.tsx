import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export const FloatingCartButton: React.FC = () => {
  const { totalCount, totalPrice, setIsCartOpen, isCartOpen, isCheckoutOpen } = useOrder();

  // If cart or checkout modal is already open, do not show floating controls to prevent UI collision
  if (isCartOpen || isCheckoutOpen) return null;

  return (
    <>
      {/* DESKTOP FLOATING PILL BUTTON (md and above) */}
      <aside
        aria-label="Dragon Wok Shopping Cart"
        className="hidden md:block fixed bottom-6 right-6 z-40"
      >
        <button
          onClick={() => setIsCartOpen(true)}
          style={{ backgroundColor: 'var(--color-button, #991b1b)', color: 'var(--color-button-text, #ffffff)' }}
          className="group flex items-center gap-3 active:scale-95 pl-4 pr-5 py-3.5 rounded-full shadow-2xl shadow-red-950/70 border border-red-500/40 hover:border-amber-400/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title="Open Dragon Wok Cart"
          aria-label={`Open Dragon Wok Cart, ${totalCount} items, subtotal Rs. ${totalPrice}`}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-amber-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
            {totalCount > 0 && (
              <span
                key={totalCount}
                className="absolute -top-1.5 -right-1.5 bg-amber-400 text-stone-950 text-[10px] font-mono font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pop"
              >
                {totalCount}
              </span>
            )}
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-100 group-hover:text-white">
              Dragon Wok Cart
            </span>
            <span className="text-[11px] font-mono font-bold text-amber-300">
              {totalCount === 0 ? (
                <span className="text-stone-300 font-sans font-normal">0 items • View Order</span>
              ) : (
                <span>
                  {totalCount} {totalCount === 1 ? 'item' : 'items'} • Rs. {totalPrice.toLocaleString()}
                </span>
              )}
            </span>
          </div>

          <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform ml-1" />
        </button>
      </aside>

      {/* MOBILE FIXED BOTTOM CART BAR (screens < md) */}
      {totalCount > 0 ? (
        <aside
          aria-label="Mobile Dragon Wok Cart Bar"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#16181f]/95 backdrop-blur-md border-t border-stone-800 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
        >
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            {/* Live Count and Food Subtotal */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-[#991b1b]/30 border border-[#b91c1c]/50 flex items-center justify-center text-amber-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="absolute -top-1 -right-1 bg-amber-400 text-stone-950 text-[10px] font-mono font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-stone-400 font-medium">
                  {totalCount} {totalCount === 1 ? 'dish' : 'dishes'} selected
                </span>
                <span className="text-sm font-extrabold font-mono text-white">
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* View Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{ backgroundColor: 'var(--color-button, #991b1b)', color: 'var(--color-button-text, #ffffff)' }}
              className="py-2.5 px-5 active:scale-95 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-950/60 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
};
