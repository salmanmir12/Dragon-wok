import React from 'react';
import { Phone, ShoppingBag, Clock } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export const OrderCTA: React.FC = () => {
  const { setIsCartOpen } = useOrder();

  return (
    <section className="py-20 bg-gradient-to-b from-[#181a20] to-[#121316] relative border-t border-b border-stone-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-6">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Open Daily 12:00 PM Onwards</span>
        </div>

        <h2 className="font-serif-brand text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
          Hungry? Let Dragon Wok Handle It.
        </h2>

        <p className="max-w-2xl mx-auto text-stone-300 text-base sm:text-lg leading-relaxed mb-10">
          Choose your favorite dishes and enjoy Dragon Wok at home or at the restaurant.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#991b1b] hover:bg-[#b91c1c] text-white px-8 py-4 rounded-md font-semibold text-sm tracking-wider uppercase transition-all shadow-lg shadow-red-950/40 hover:translate-y-[-1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Now</span>
          </button>

          <a
            href="tel:03100968734"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-amber-400 border border-amber-500/40 hover:border-amber-400 px-8 py-4 rounded-md font-semibold text-sm tracking-wider uppercase transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Phone className="w-4 h-4 text-amber-500" />
            <span>Call 0310 0968734</span>
          </a>
        </div>

        <p className="text-xs text-stone-400 mt-8">
          Fresh preparation time typically 15–25 minutes. Takeaway and dine-in available.
        </p>

      </div>
    </section>
  );
};
