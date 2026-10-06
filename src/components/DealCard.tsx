import React from 'react';
import { ShoppingBag, Sparkles, Check } from 'lucide-react';
import { SpecialDeal } from '../data/menuData';
import { useOrder } from '../context/OrderContext';

interface DealCardProps {
  deal: SpecialDeal;
}

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const { addItem } = useOrder();

  return (
    <div
      className={`relative rounded-xl border flex flex-col justify-between transition-all duration-300 p-6 ${
        deal.popular
          ? 'bg-gradient-to-b from-[#1e1b1b] to-[#15171c] border-amber-500/60 shadow-xl shadow-red-950/20'
          : 'bg-[#181a20] border-stone-800 hover:border-stone-700'
      }`}
    >
      <div>
        {/* Deal Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {deal.badge || 'Special Combo'}
          </span>
          {deal.popular && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
              <Sparkles className="w-3 h-3" />
              <span>Recommended</span>
            </span>
          )}
        </div>

        <h3 className="font-serif-brand text-xl sm:text-2xl font-bold text-white mb-4">
          {deal.title}
        </h3>

        {/* Price Display */}
        <div className="flex items-baseline gap-1 mb-6 text-stone-100">
          <span className="text-sm font-semibold text-amber-400">Rs.</span>
          <span className="text-3xl font-extrabold tabular-nums tracking-tight text-white">
            {deal.price.toLocaleString()}
          </span>
        </div>

        {/* Dish Items in Deal */}
        <div className="space-y-2.5 mb-6 pt-4 border-t border-stone-800">
          <p className="text-xs uppercase tracking-wider font-semibold text-stone-400">
            Included Courses:
          </p>
          {deal.items.map((dishName, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-stone-200">
              <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span className="font-medium">{dishName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-stone-800/80">
        <button
          onClick={() =>
            addItem({
              id: deal.id,
              name: deal.title,
              price: deal.price,
              category: 'Deals',
            })
          }
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-md font-semibold text-xs uppercase tracking-wider text-white bg-[#991b1b] hover:bg-[#b91c1c] transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add Deal to Cart</span>
        </button>
      </div>
    </div>
  );
};
