import React from 'react';
import { ShoppingBag, Sparkles, Check, Plus, Minus, Flame } from 'lucide-react';
import { SpecialDeal } from '../data/menuData';
import { useOrder } from '../context/OrderContext';

interface DealCardProps {
  deal: SpecialDeal;
}

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const { items: cartItems, addItem, updateQuantity } = useOrder();

  const cartItem = cartItems.find((i) => i.id === deal.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    addItem({
      id: deal.id,
      name: deal.title,
      price: deal.price,
      category: 'Super Deals',
    });
  };

  return (
    <div
      style={{ backgroundColor: 'var(--color-card-bg, #14161d)' }}
      className={`group relative rounded-2xl border p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/70 ${
        deal.popular
          ? 'border-amber-500/50 bg-gradient-to-b from-[#191c26] to-[#14161d] shadow-lg shadow-amber-950/20'
          : 'border-stone-800/90 hover:border-stone-700 bg-[#14161d]'
      }`}
    >
      <div>
        {/* Deal Header Badge & Category */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
            Super Deal
          </span>

          <div className="flex items-center gap-1.5">
            {deal.badge && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#991b1b]/30 text-rose-300 border border-[#b91c1c]/50 px-2 py-0.5 rounded-md">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{deal.badge}</span>
              </span>
            )}
            {deal.popular && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Recommended</span>
              </span>
            )}
          </div>
        </div>

        {/* Deal Title */}
        <h3 className="font-serif-brand text-xl sm:text-2xl font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
          {deal.title}
        </h3>

        {deal.description && (
          <p className="text-xs text-stone-400 mb-4 leading-relaxed">
            {deal.description}
          </p>
        )}

        {/* Included Feast Courses List */}
        <div className="space-y-2 mb-4 pt-3 border-t border-stone-800/80">
          <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
            Included Courses:
          </p>
          <div className="space-y-2">
            {deal.items.map((dishName, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] text-stone-200">
                <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                  <Check className="w-2.5 h-2.5" />
                </span>
                <span className="font-medium leading-tight">{dishName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Pricing & Action Controls */}
      <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between gap-3 mt-2">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
            Deal Price
          </div>
          <div className="font-extrabold text-xl text-amber-400 tabular-nums flex items-baseline gap-1">
            <span className="text-xs font-bold text-amber-300">Rs.</span>
            <span>{deal.price.toLocaleString()}</span>
          </div>
        </div>

        <div>
          {cartQuantity > 0 ? (
            <div className="flex items-center bg-[#991b1b] rounded-xl p-1 shadow-md shadow-red-950/60 border border-red-700/80">
              <button
                type="button"
                onClick={() => updateQuantity(deal.id, -1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/30 text-white transition active:scale-90"
                title="Decrease quantity"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-white text-xs px-2.5 min-w-[24px] text-center font-mono">
                {cartQuantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(deal.id, 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/30 text-white transition active:scale-90"
                title="Increase quantity"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 py-2.5 px-4 text-xs font-bold uppercase tracking-wider bg-[#991b1b] hover:bg-[#b91c1c] active:scale-95 text-white rounded-xl transition-all shadow-md shadow-red-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap"
              title={`Add ${deal.title} to Cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              <span>Add Deal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
