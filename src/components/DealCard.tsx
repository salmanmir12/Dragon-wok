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
      category: 'Deals',
    });
  };

  return (
    <div
      className={`relative rounded-2xl border flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1 ${
        deal.popular
          ? 'bg-gradient-to-b from-[#201919] to-[#15171c] border-amber-500/60 shadow-xl shadow-red-950/20'
          : 'bg-[#181a20] border-stone-800 hover:border-stone-700'
      }`}
    >
      <div>
        {/* Deal Visual Header */}
        <div className="relative aspect-[16/9] overflow-hidden bg-stone-900">
          <picture>
            <source srcSet="/images/hero_wok_fire.webp" type="image/webp" />
            <img
              src="/images/hero_wok_fire.jpg"
              alt={deal.title}
              loading="lazy"
              className="w-full h-full object-cover object-center"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-[#181a20] via-black/40 to-black/30" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#991b1b] text-white shadow-md flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>{deal.badge || 'Value Combo'}</span>
            </span>
            {deal.popular && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 shadow-md">
                <Sparkles className="w-3 h-3" />
                <span>Chef Pick</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-serif-brand text-xl sm:text-2xl font-bold text-white">
              {deal.title}
            </h3>
          </div>

          {/* Included Courses Checklist */}
          <div className="space-y-2 mb-4 pt-3 border-t border-stone-800/80">
            <p className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
              Included In This Feast:
            </p>
            <div className="space-y-1.5">
              {deal.items.map((dishName, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-stone-200">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-medium leading-tight">{dishName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Modern Action Area */}
      <div className="p-5 pt-3 border-t border-stone-800/80 bg-[#15171c]/60 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase font-semibold tracking-wider text-stone-400">
            Combo Price
          </div>
          <div className="font-extrabold text-xl text-white tabular-nums flex items-baseline gap-1">
            <span className="text-xs text-amber-400 font-bold">Rs.</span>
            <span>{deal.price.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div>
          {cartQuantity > 0 ? (
            <div className="flex items-center bg-[#991b1b] rounded-xl p-1 shadow-lg shadow-red-950/50 border border-red-700">
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
              className="flex items-center gap-1.5 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-[#991b1b] hover:bg-[#b91c1c] active:scale-95 rounded-xl transition-all shadow-md shadow-red-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap"
              title={`Add ${deal.title} to Cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Deal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
