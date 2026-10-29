import React from 'react';
import { ShoppingBag, Flame, Sparkles, Plus, Minus } from 'lucide-react';
import { MenuItem } from '../data/menuData';
import { useOrder } from '../context/OrderContext';

interface MenuCardProps {
  item: MenuItem;
}

// Comprehensive mapping of dish IDs and dish names to dedicated local assets
const DISH_IMAGE_BY_ID: Record<string, string> = {
  'st-1': '/images/dishes/plain_fries.jpg',
  'st-2': '/images/dishes/honey_wings.jpg',
  'st-3': '/images/dishes/korean_chicken.jpg',
  'st-4': '/images/dishes/bbq_wings.jpg',
  'st-5': '/images/dishes/drum_sticks.jpg',
  'st-6': '/images/dishes/finger_fish.jpg',
  'st-7': '/images/dishes/daka_fish.jpg',
  'st-8': '/images/dishes/daka_chicken.jpg',
  'st-9': '/images/dishes/chicken_chilli_chips.jpg',
  'st-10': '/images/dishes/chicken_cashew_chips.jpg',
  'st-11': '/images/dishes/chicken_manchurian_chips.jpg',
  'sp-1': '/images/dishes/dragon_special_soup.jpg',
  'sp-2': '/images/dishes/dumpling_noodle_soup.jpg',
  'sp-3': '/images/dishes/szechwan_soup.jpg',
  'sp-4': '/images/dishes/chicken_corn_soup.jpg',
  'sp-5': '/images/dishes/hot_and_sour_soup.jpg',
  'sp-6': '/images/dishes/chicken_noodle_soup.jpg',
  'ck-1': '/images/dishes/chicken_manchurian.jpg',
  'ck-2': '/images/dishes/chicken_cashewnut.jpg',
  'ck-3': '/images/dishes/chicken_chilli_dry.jpg',
  'ck-4': '/images/dishes/kungpow_chicken.jpg',
  'ck-5': '/images/dishes/szechwan_chicken.jpg',
  'ck-6': '/images/dishes/sesame_honey_chicken.jpg',
  'ck-7': '/images/dishes/garlic_chicken.jpg',
  'ck-8': '/images/dishes/chicken_chilli_onion.jpg',
  'ck-9': '/images/dishes/chicken_oyster_sauce.jpg',
  'ck-10': '/images/dishes/sweet_sour_chicken.jpg',
  'bf-1': '/images/dishes/beef_chilli_dry.jpg',
  'bf-2': '/images/dishes/pepper_beef.jpg',
  'bf-3': '/images/dishes/beef_oyster_sauce.jpg',
  'bf-4': '/images/dishes/beef_chilli_onion.jpg',
  'bf-5': '/images/dishes/szechwan_beef.jpg',
  'fs-1': '/images/dishes/kungpow_fish.jpg',
  'fs-2': '/images/dishes/sweet_sour_fish.jpg',
  'fs-3': '/images/dishes/garlic_fish.jpg',
  'fs-4': '/images/dishes/fish_chilli_dry.jpg',
  'nd-1': '/images/dishes/chicken_chowmein.jpg',
  'nd-2': '/images/dishes/vegetable_chowmein.jpg',
  'nd-3': '/images/dishes/beef_chowmein.jpg',
  'nd-4': '/images/dishes/dragon_chowmein.jpg',
  'mo-1': '/images/dishes/steam_momos.jpg',
  'mo-2': '/images/dishes/fried_momos.jpg',
  'mo-3': '/images/dishes/half_fried_momos.jpg',
  'mo-4': '/images/dishes/special_momos.jpg',
  'mo-5': '/images/dishes/chilli_momos.jpg',
  'mo-6': '/images/dishes/manchurian_momos.jpg',
  'hp-1': '/images/dishes/szechwan_hot_pot.jpg',
  'dr-1': '/images/dishes/mint_margrita.jpg',
  'dr-2': '/images/dishes/gava_mint.jpg',
  'dr-3': '/images/dishes/lemonade.jpg',
  'dr-4': '/images/dishes/kit_kat_shake.jpg',
  'dr-5': '/images/dishes/reo_shake.jpg',
  'dr-6': '/images/dishes/cold_coffee.jpg',
  'dr-7': '/images/dishes/chocolate_shake.jpg',
  'deal-super-1': '/images/dishes/deal_super_1.jpg',
  'deal-super-2': '/images/dishes/deal_super_2.jpg',
  'deal-super-3': '/images/dishes/deal_super_3.jpg',
  'deal-dragon-1': '/images/dishes/deal_dragon_1.jpg',
  'deal-dragon-2': '/images/dishes/deal_dragon_2.jpg',
  'deal-dragon-3': '/images/dishes/deal_dragon_3.jpg',
};

// Map dish names/categories to high-res authentic food photography
export const getDishPhoto = (name: string, category?: string, customImage?: string, itemId?: string): string => {
  // If custom image is valid and not generic hero wok fire
  if (customImage && customImage.trim() !== '' && !customImage.includes('hero_wok_fire')) {
    return customImage;
  }

  // Lookup by direct ID
  if (itemId && DISH_IMAGE_BY_ID[itemId]) {
    return DISH_IMAGE_BY_ID[itemId];
  }

  const n = (name || '').toLowerCase().trim();
  const c = (category || '').toLowerCase().trim();

  // Starters
  if (n.includes('plain fries') || n.includes('fries')) return '/images/dishes/plain_fries.jpg';
  if (n.includes('honey wing')) return '/images/dishes/honey_wings.jpg';
  if (n.includes('bbq wing')) return '/images/dishes/bbq_wings.jpg';
  if (n.includes('korean chicken')) return '/images/dishes/korean_chicken.jpg';
  if (n.includes('drum stick')) return '/images/dishes/drum_sticks.jpg';
  if (n.includes('finger fish')) return '/images/dishes/finger_fish.jpg';
  if (n.includes('daka fish')) return '/images/dishes/daka_fish.jpg';
  if (n.includes('daka chicken')) return '/images/dishes/daka_chicken.jpg';
  if (n.includes('chilli chip')) return '/images/dishes/chicken_chilli_chips.jpg';
  if (n.includes('chasewunt') || (n.includes('cashew') && n.includes('chip'))) return '/images/dishes/chicken_cashew_chips.jpg';
  if (n.includes('manchurian chip')) return '/images/dishes/chicken_manchurian_chips.jpg';

  // Soups
  if (n.includes('dragon special soup')) return '/images/dishes/dragon_special_soup.jpg';
  if (n.includes('dumpling noodle soup')) return '/images/dishes/dumpling_noodle_soup.jpg';
  if (n.includes('szechwan soup')) return '/images/dishes/szechwan_soup.jpg';
  if (n.includes('corn soup')) return '/images/dishes/chicken_corn_soup.jpg';
  if (n.includes('hot & sour') || n.includes('hot and sour')) return '/images/dishes/hot_and_sour_soup.jpg';
  if (n.includes('chicken noodle soup')) return '/images/dishes/chicken_noodle_soup.jpg';

  // Chicken Mains
  if (n.includes('chicken manchurian')) return '/images/dishes/chicken_manchurian.jpg';
  if (n.includes('chicken cashewnut') || n.includes('cashewnut')) return '/images/dishes/chicken_cashewnut.jpg';
  if (n.includes('chicken chilli dry') || (n.includes('chilli dry') && !n.includes('beef') && !n.includes('fish'))) return '/images/dishes/chicken_chilli_dry.jpg';
  if (n.includes('kungpow chicken')) return '/images/dishes/kungpow_chicken.jpg';
  if (n.includes('szechwan chicken')) return '/images/dishes/szechwan_chicken.jpg';
  if (n.includes('seasme honey') || n.includes('sesame honey')) return '/images/dishes/sesame_honey_chicken.jpg';
  if (n.includes('garlic chicken')) return '/images/dishes/garlic_chicken.jpg';
  if (n.includes('chicken chilli onion')) return '/images/dishes/chicken_chilli_onion.jpg';
  if (n.includes('oyster') && (n.includes('chicken') || !n.includes('beef'))) return '/images/dishes/chicken_oyster_sauce.jpg';
  if (n.includes('sweet & sour chicken') || n.includes('sweet and sour chicken')) return '/images/dishes/sweet_sour_chicken.jpg';

  // Beef Mains
  if (n.includes('beef chilli dry')) return '/images/dishes/beef_chilli_dry.jpg';
  if (n.includes('pepper beef')) return '/images/dishes/pepper_beef.jpg';
  if (n.includes('beef in oyster') || (n.includes('beef') && n.includes('oyster'))) return '/images/dishes/beef_oyster_sauce.jpg';
  if (n.includes('beef chilli onion')) return '/images/dishes/beef_chilli_onion.jpg';
  if (n.includes('szechwan beef') || (n.includes('beef') && n.includes('szechwan'))) return '/images/dishes/szechwan_beef.jpg';

  // Fish Mains
  if (n.includes('kungpow fish')) return '/images/dishes/kungpow_fish.jpg';
  if (n.includes('sweet & sour fish') || n.includes('sweet and sour fish')) return '/images/dishes/sweet_sour_fish.jpg';
  if (n.includes('garlic fish')) return '/images/dishes/garlic_fish.jpg';
  if (n.includes('fish chilli dry') || (n.includes('fish') && n.includes('chilli'))) return '/images/dishes/fish_chilli_dry.jpg';

  // Noodles
  if (n.includes('dragon chowmein')) return '/images/dishes/dragon_chowmein.jpg';
  if (n.includes('chicken chowmein')) return '/images/dishes/chicken_chowmein.jpg';
  if (n.includes('vegetable chowmein') || n.includes('veg chowmein')) return '/images/dishes/vegetable_chowmein.jpg';
  if (n.includes('beef chowmein')) return '/images/dishes/beef_chowmein.jpg';
  if (n.includes('chowmein') || n.includes('noodle') || c.includes('noodle')) return '/images/dishes/chicken_chowmein.jpg';

  // Momos
  if (n.includes('half fried momo')) return '/images/dishes/half_fried_momos.jpg';
  if (n.includes('fried momo')) return '/images/dishes/fried_momos.jpg';
  if (n.includes('steam momo')) return '/images/dishes/steam_momos.jpg';
  if (n.includes('special momo')) return '/images/dishes/special_momos.jpg';
  if (n.includes('chilli momo')) return '/images/dishes/chilli_momos.jpg';
  if (n.includes('manchurian momo')) return '/images/dishes/manchurian_momos.jpg';
  if (n.includes('momo') || n.includes('dumpling') || c.includes('momo')) return '/images/dishes/steam_momos.jpg';

  // Hot Pot
  if (n.includes('hot pot') || n.includes('hotpot') || c.includes('hot pot')) return '/images/dishes/szechwan_hot_pot.jpg';

  // Drinks
  if (n.includes('mint margrita') || n.includes('margarita')) return '/images/dishes/mint_margrita.jpg';
  if (n.includes('gava mint') || n.includes('guava')) return '/images/dishes/gava_mint.jpg';
  if (n.includes('lemonade')) return '/images/dishes/lemonade.jpg';
  if (n.includes('kit kat')) return '/images/dishes/kit_kat_shake.jpg';
  if (n.includes('reo shake') || n.includes('oreo')) return '/images/dishes/reo_shake.jpg';
  if (n.includes('cold coffee')) return '/images/dishes/cold_coffee.jpg';
  if (n.includes('chocolate shake') || n.includes('chocolate')) return '/images/dishes/chocolate_shake.jpg';

  // Category fallback
  if (c.includes('soup')) return '/images/dishes/hot_and_sour_soup.jpg';
  if (c.includes('starter')) return '/images/dishes/plain_fries.jpg';
  if (c.includes('chicken')) return '/images/dishes/chicken_manchurian.jpg';
  if (c.includes('beef')) return '/images/dishes/beef_chilli_dry.jpg';
  if (c.includes('fish')) return '/images/dishes/kungpow_fish.jpg';
  if (c.includes('drink')) return '/images/dishes/lemonade.jpg';
  if (c.includes('deal')) return '/images/dishes/deal_super_1.jpg';

  return '/images/dishes/chicken_chowmein.jpg';
};

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
    });
  };

  const photoUrl = getDishPhoto(item.name, item.category, item.image, item.id);

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
          <img
            src={photoUrl}
            alt={item.name}
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('chicken_chowmein.jpg')) {
                target.src = '/images/dishes/chicken_chowmein.jpg';
              }
            }}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
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

        </div>
      </div>

      {/* Pricing & Modern Action Area */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-stone-800/80 bg-[#15171c]/50 flex items-center justify-between gap-3">
        {/* Prominent Price */}
        <div>
          <div className="text-[10px] uppercase font-semibold tracking-wider text-stone-400">
            {item.familyLabel || 'Price'}
          </div>
          <div className="font-extrabold text-lg sm:text-xl text-white tabular-nums flex items-baseline gap-1">
            <span className="text-xs text-amber-400 font-bold">Rs.</span>
            <span>{currentPrice !== undefined ? currentPrice.toLocaleString() : '—'}</span>
          </div>
        </div>

        {/* Action Controls (Flame On style interactive quantity stepper or Add button) */}
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
