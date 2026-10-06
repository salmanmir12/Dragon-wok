import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export const FloatingCartButton: React.FC = () => {
  const { totalCount, totalPrice, setIsCartOpen } = useOrder();

  return (
    <aside aria-label="Shopping cart quick access" className="fixed bottom-20 right-5 z-40">
      <button
        onClick={() => setIsCartOpen(true)}
        className="group flex items-center gap-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white px-3.5 py-3 sm:px-4 sm:py-3 rounded-full shadow-xl shadow-red-950/50 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-red-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        title="View Shopping Cart"
        aria-label={`Open shopping cart, ${totalCount} items`}
      >
        <ShoppingBag className="w-5 h-5 text-amber-300" />
        <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">
          {totalCount === 0 ? (
            <span>Cart</span>
          ) : (
            <span>
              Cart • {totalCount} {totalCount === 1 ? 'item' : 'items'}
              <span className="hidden md:inline ml-1 text-amber-200">
                (Rs. {totalPrice.toLocaleString()})
              </span>
            </span>
          )}
        </span>
      </button>
    </aside>
  );
};
