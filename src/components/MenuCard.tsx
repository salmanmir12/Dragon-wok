import React, { useState } from 'react';
import { ShoppingBag, Flame, Sparkles } from 'lucide-react';
import { MenuItem } from '../data/menuData';
import { useOrder } from '../context/OrderContext';

interface MenuCardProps {
  item: MenuItem;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { addItem } = useOrder();
  const [selectedPortion, setSelectedPortion] = useState<'regular' | 'family'>('regular');

  const hasDualPortion = item.price !== undefined && item.familyPrice !== undefined;
  const isFamilyBowlOnly = !hasDualPortion && item.familyLabel === 'Family Bowl';

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

  return (
    <div
      className={`relative bg-[#181a20] rounded-xl border ${
        item.isSignature
          ? 'border-amber-500/50 shadow-lg shadow-amber-950/20'
          : 'border-stone-800 hover:border-stone-700'
      } p-5 flex flex-col justify-between transition-all duration-200 group`}
    >
      <div>
        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-400">
            {item.category}
          </span>
          {item.isSignature && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Signature</span>
            </span>
          )}
          {item.isPopular && !item.isSignature && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400">
              <Sparkles className="w-3 h-3 text-amber-400/80" />
              <span>Popular</span>
            </span>
          )}
        </div>

        {/* Dish Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug mb-2">
          {item.name}
        </h3>

        {/* Note or Ingredients if provided (no fake descriptions!) */}
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="mb-4 text-xs text-stone-400 bg-stone-900/80 p-3 rounded-lg border border-stone-800">
            <span className="font-semibold text-amber-400 block mb-1">
              Included Ingredients:
            </span>
            <p className="leading-relaxed text-stone-300">
              {item.ingredients.join(', ')}
            </p>
          </div>
        )}

        {item.note && !item.ingredients && (
          <p className="text-xs text-stone-400 italic mb-3">
            {item.note}
          </p>
        )}

        {/* Portion Selector for Soups with Dual Options */}
        {hasDualPortion && (
          <div className="mt-3 mb-2 p-1 bg-stone-900/90 rounded-lg border border-stone-800 flex items-center">
            <button
              type="button"
              onClick={() => setSelectedPortion('regular')}
              className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-md transition-all ${
                selectedPortion === 'regular'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Regular (Rs. {item.price?.toLocaleString()})
            </button>
            <button
              type="button"
              onClick={() => setSelectedPortion('family')}
              className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-md transition-all ${
                selectedPortion === 'family'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Family (Rs. {item.familyPrice?.toLocaleString()})
            </button>
          </div>
        )}
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="pt-4 border-t border-stone-800/80 mt-3 flex items-end justify-between gap-3">
        <div>
          {item.price !== undefined ? (
            <div>
              <div className="text-[11px] text-stone-400 uppercase font-medium">
                {hasDualPortion
                  ? selectedPortion === 'family'
                    ? 'Family Portion'
                    : 'Regular Portion'
                  : item.familyLabel || 'Price'}
              </div>
              <div className="font-bold text-lg text-white tabular-nums flex items-baseline gap-1">
                <span className="text-xs text-amber-400 font-semibold">Rs.</span>
                <span>
                  {hasDualPortion
                    ? (selectedPortion === 'family'
                        ? item.familyPrice
                        : item.price
                      )?.toLocaleString()
                    : item.price.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-stone-400 font-medium">View Menu</div>
          )}
        </div>

        {item.price !== undefined ? (
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-stone-800 hover:bg-[#991b1b] rounded-lg transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap"
            title={`Add ${item.name} to Cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Add to Cart</span>
          </button>
        ) : (
          <span className="text-xs text-stone-500 italic">Inquire Price</span>
        )}
      </div>
    </div>
  );
};
