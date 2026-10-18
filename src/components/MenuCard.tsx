import React, { useState } from 'react';
import { ShoppingBag, Flame, Sparkles, Plus, Minus } from 'lucide-react';
import { MenuItem } from '../data/menuData';
import { useOrder } from '../context/OrderContext';

interface MenuCardProps {
  item: MenuItem;
}

// Map dish names/categories to high-res authentic food photography
export const getDishPhoto = (name: string, category?: string, customImage?: string): string => {
  if (customImage && customImage.trim() !== '') return customImage;
  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();

  if (n.includes('chowmein') || n.includes('noodle') || c.includes('noodle')) {
    return '/images/dish_chowmein.webp';
  }
  if (n.includes('momo') || n.includes('dumpling') || c.includes('momo')) {
    return '/images/dish_momos.webp';
  }
  if (n.includes('hot pot') || n.includes('hotpot') || n.includes('soup') || c.includes('soup') || c.includes('hot pot')) {
    return '/images/dish_hot_pot.webp';
  }
  return '/images/hero_wok_fire.webp';
};

export const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { items: cartItems, addItem, updateQuantity } = useOrder();
  const [selectedPortion, setSelectedPortion] = useState<'regular' | 'family'>('regular');

  const hasDualPortion = item.price !== undefined && item.familyPrice !== undefined;
  const isFamilyBowlOnly = !hasDualPortion && item.familyLabel === 'Family Bowl';

  // Determine active target Cart Item ID based on portion selection
  const currentCartId = hasDualPortion
    ? selectedPortion === 'family'
      ? `${item.id}-family`
      : `${item.id}-regular`
    : item.id;

  const activeCartItem = cartItems.find((i) => i.id === currentCartId);
  const cartQuantity = activeCartItem ? activeCartItem.quantity : 0;

  const currentPrice = hasDualPortion
    ? selectedPortion === 'family'
      ? item.familyPrice!
      : item.price!
    : item.price;

  const handleAddToCart = () => {
    if (item.price === undefined) return;

    if (hasDualPortion) {
      if (selectedPortion === 'family') {
        addItem({
          id: `${item.id}-family`,
          name: `${item.name} (${item.familyLabel || 'Family'})`,
          price: item.familyPrice!,
          category: item.category,
          portionLabel: 'Family',
        });
      } else {
        addItem({
          id: `${item.id}-regular`,
          name: `${item.name} (Regular)`,
          price: item.price,
          category: item.category,
          portionLabel: 'Regular',
        });
      }
    } else if (isFamilyBowlOnly) {
      addItem({
        id: item.id,
        name: `${item.name} (Family Bowl)`,
        price: item.price,
        category: item.category,
        portionLabel: 'Family Bowl',
      });
    } else {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
      });
    }
  };

  const photoUrl = getDishPhoto(item.name, item.category, item.image);

  return (
    <div
      className={`relative bg-[#181a20] rounded-2xl border ${
        item.isSignature
          ? 'border-amber-500/50 shadow-lg shadow-amber-950/20'
          : 'border-stone-800 hover:border-stone-700'
      } overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1 group`}
    >
      <div>
        {/* Modern Food Image Banner */}
        <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
          <picture>
            <source srcSet={photoUrl} type="image/webp" />
            <img
              src={photoUrl.replace('.webp', '.jpg')}
              alt={item.name}
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('hero_wok_fire.jpg')) {
                  target.src = '/images/hero_wok_fire.jpg';
                }
              }}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-[#181a20] via-transparent to-black/30" />

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-stone-300 border border-white/10">
              {item.category}
            </span>
            {item.isSignature && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#991b1b] text-white shadow-md">
                <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                <span>Signature</span>
              </span>
            )}
            {item.isPopular && !item.isSignature && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 text-stone-950 shadow-md">
                <Sparkles className="w-3 h-3" />
                <span>Popular</span>
              </span>
            )}
          </div>

          {/* Out of stock tag */}
          {item.available === false && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center">
              <span className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                Sold Out Today
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          {/* Dish Title */}
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors leading-snug mb-1.5">
            {item.name}
          </h3>

          {/* Ingredients or note description */}
          {item.ingredients && item.ingredients.length > 0 ? (
            <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-3">
              {item.ingredients.join(' • ')}
            </p>
          ) : item.note ? (
            <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-3 italic">
              {item.note}
            </p>
          ) : (
            <p className="text-xs text-stone-500 mb-3">
              Freshly tossed in traditional high-heat wok.
            </p>
          )}

          {/* Portion Selector for Dual-portion Dishes (e.g. Soups) */}
          {hasDualPortion && (
            <div className="mb-3 p-1 bg-stone-900 rounded-lg border border-stone-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedPortion('regular')}
                className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-md transition-all ${
                  selectedPortion === 'regular'
                    ? 'bg-stone-800 text-white shadow-sm border border-stone-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Regular • Rs. {item.price?.toLocaleString()}
              </button>
              <button
                type="button"
                onClick={() => setSelectedPortion('family')}
                className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-md transition-all ${
                  selectedPortion === 'family'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Family • Rs. {item.familyPrice?.toLocaleString()}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Modern Action Area */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-stone-800/80 bg-[#15171c]/50 flex items-center justify-between gap-3">
        {/* Prominent Price */}
        <div>
          <div className="text-[10px] uppercase font-semibold tracking-wider text-stone-400">
            {hasDualPortion
              ? selectedPortion === 'family'
                ? 'Family Portion'
                : 'Regular Portion'
              : item.familyLabel || 'Price'}
          </div>
          <div className="font-extrabold text-lg sm:text-xl text-white tabular-nums flex items-baseline gap-1">
            <span className="text-xs text-amber-400 font-bold">Rs.</span>
            <span>{currentPrice !== undefined ? currentPrice.toLocaleString() : '—'}</span>
          </div>
        </div>

        {/* Action Controls (KFC style interactive quantity stepper or Add button) */}
        <div>
          {item.available === false ? (
            <span className="text-xs font-semibold text-stone-500 bg-stone-900 px-3 py-2 rounded-xl border border-stone-800">
              Unavailable
            </span>
          ) : currentPrice !== undefined ? (
            cartQuantity > 0 ? (
              <div className="flex items-center bg-[#991b1b] rounded-xl p-1 shadow-lg shadow-red-950/50 border border-red-700">
                <button
                  type="button"
                  onClick={() => updateQuantity(currentCartId, -1)}
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
                  onClick={() => updateQuantity(currentCartId, 1)}
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
                title={`Add ${item.name} to Cart`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Add to Cart</span>
              </button>
            )
          ) : (
            <span className="text-xs text-stone-500 italic">Inquire</span>
          )}
        </div>
      </div>
    </div>
  );
};
