import React from 'react';
import { ShoppingBag, Flame, Sparkles, Plus, Minus } from 'lucide-react';
import { MenuItem } from '../data/menuData';
import { useOrder } from '../context/OrderContext';

interface MenuCardProps {
  item: MenuItem;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { items: cartItems, addItem, updateQuantity } = useOrder();

  const activeCartItem = cartItems.find((i) => i.id === item.id);
  const cartQuantity = activeCartItem ? activeCartItem.quantity : 0;
  const currentPrice = item.price;

  const handleAddToCart = () => {
    if (item.price === undefined) return;
    addItem({
      id: item.id,
      name: item.name,
      price: Number(item.price) || 0,
      category: item.category,
      portionLabel: item.portionLabel,
    });
  };

  return (
    <div
      style={{ backgroundColor: 'var(--color-card-bg, #14161d)' }}
      className={`group relative rounded-2xl border p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/60 ${
        item.isSignature
          ? 'border-amber-500/40 bg-gradient-to-b from-[#181a24] to-[#14161d] shadow-lg shadow-amber-950/20'
          : 'border-stone-800/90 hover:border-stone-700 bg-[#14161d]'
      }`}
    >
      {/* Top Header: Category Tag & Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 bg-stone-900/90 px-2.5 py-1 rounded-md border border-stone-800/80">
            {item.category}
          </span>

          <div className="flex items-center gap-1.5">
            {item.isSignature && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#991b1b]/30 text-rose-300 border border-[#b91c1c]/50 px-2 py-0.5 rounded-md">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Signature</span>
              </span>
            )}
            {item.isPopular && !item.isSignature && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Popular</span>
              </span>
            )}
            {item.portionLabel && !item.isSignature && !item.isPopular && (
              <span className="text-[10px] text-stone-400 font-medium">
                {item.portionLabel}
              </span>
            )}
          </div>
        </div>

        {/* Dish Title */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
            {item.name}
          </h3>
        </div>

        {/* Portion label secondary if signature/popular */}
        {item.portionLabel && (item.isSignature || item.isPopular) && (
          <div className="text-[11px] font-semibold text-amber-400/90 mb-2">
            Size: {item.portionLabel}
          </div>
        )}

        {/* Short Text Description */}
        {item.description ? (
          <p className="text-xs sm:text-[13px] text-stone-400 leading-relaxed line-clamp-3 mb-4">
            {item.description}
          </p>
        ) : item.ingredients && item.ingredients.length > 0 ? (
          <p className="text-xs text-stone-400 leading-relaxed line-clamp-2 mb-4">
            {item.ingredients.join(' • ')}
          </p>
        ) : (
          <p className="text-xs text-stone-500 leading-relaxed mb-4">
            Freshly prepared in traditional high-heat wok with authentic herbs.
          </p>
        )}
      </div>

      {/* Bottom Row: Golden Price & Deep Red Add to Cart / Quantity Stepper */}
      <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between gap-3 mt-2">
        {/* Price Display */}
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
            Price (PKR)
          </div>
          <div className="font-extrabold text-lg sm:text-xl text-amber-400 tabular-nums flex items-baseline gap-1">
            <span className="text-xs font-bold text-amber-300">Rs.</span>
            <span className="text-amber-400 font-extrabold">{currentPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Interactive Controls */}
        <div>
          {item.available === false ? (
            <span className="text-xs font-semibold text-stone-500 bg-stone-900 px-3 py-2 rounded-xl border border-stone-800">
              Sold Out Today
            </span>
          ) : cartQuantity > 0 ? (
            <div className="flex items-center bg-[#991b1b] rounded-xl p-1 shadow-md shadow-red-950/60 border border-red-700/80">
              <button
                type="button"
                onClick={() => updateQuantity(item.id, -1)}
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
                onClick={() => updateQuantity(item.id, 1)}
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
              title={`Add ${item.name} to Cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
