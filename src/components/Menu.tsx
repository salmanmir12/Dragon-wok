import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Flame,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { MENU_ITEMS, SPECIAL_DEALS, MenuItem } from '../data/menuData';
import { MenuCard } from './MenuCard';
import { DealCard } from './DealCard';
import { useMenu } from '../context/MenuContext';
import { useOrder } from '../context/OrderContext';

export type MenuCategoryTab =
  | 'all'
  | 'Super Deals'
  | 'Starters'
  | 'Soup'
  | 'Momos'
  | 'Noodles'
  | 'Chicken'
  | 'Beef'
  | 'Fish'
  | 'Szechwan Hot Pot'
  | 'Drinks';

interface CategoryOption {
  id: MenuCategoryTab;
  label: string;
  badge?: string;
  description: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'All Menu', description: 'Explore our complete wok kitchen & beverage menu' },
  { id: 'Super Deals', label: '1. Super Deals', badge: '5 Deals', description: 'Curated value combos & multi-course banquets' },
  { id: 'Starters', label: '2. Starters', badge: '11 Items', description: 'Crispy wings, fish fingers, chips & drumsticks' },
  { id: 'Soup', label: '3. Soup', badge: '10 Items', description: 'Single servings and generous family sharing bowls' },
  { id: 'Momos', label: '4. Momos', badge: '6 Items', description: 'Handcrafted steamed, fried, and specialty wok dumplings' },
  { id: 'Noodles', label: '5. Noodles', badge: '4 Items', description: 'Smoky high-heat wok-tossed chowmein noodles' },
  { id: 'Chicken', label: '6. Chicken', badge: 'Rs. 1,400', description: 'Indo-Chinese and Sichuan poultry wok gravies' },
  { id: 'Beef', label: '7. Beef', badge: 'Rs. 1,500', description: 'Tender undercut beef stir-fried in rich sauces' },
  { id: 'Fish', label: '8. Fish', badge: 'Rs. 1,600', description: 'Fresh fish fillets tossed in aromatic spices' },
  { id: 'Szechwan Hot Pot', label: '9. Szechwan Hot Pot', badge: 'Signature', description: 'Communal sharing banquet with 9 premium ingredients' },
  { id: 'Drinks', label: '10. Drinks', badge: '7 Items', description: 'Chilled margaritas, thick shakes & gourmet cold coffee' },
];

export const Menu: React.FC = () => {
  const { menuItems } = useMenu();
  const { items: cartItems, addItem, updateQuantity, totalCount, totalPrice, setIsCartOpen } = useOrder();
  const [activeCategory, setActiveCategory] = useState<MenuCategoryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navRailRef = useRef<HTMLDivElement>(null);

  // Combine dynamic Firestore items with base canonical items
  const activeMenuItems: MenuItem[] = useMemo(() => {
    if (menuItems && menuItems.length > 0) {
      return menuItems.map((m) => {
        const staticMatch = MENU_ITEMS.find((s) => s.id === m.id);
        return {
          id: m.id,
          name: m.name,
          category: (m.category as any) || staticMatch?.category || 'Chicken',
          price: m.price || staticMatch?.price || 0,
          portionLabel: m.familyPrice ? 'Family Bowl' : staticMatch?.portionLabel,
          description: m.description || staticMatch?.description,
          ingredients: staticMatch?.ingredients,
          isSignature: staticMatch?.isSignature,
          isPopular: staticMatch?.isPopular,
          available: m.available !== false,
          badge: m.badge || staticMatch?.badge,
        };
      });
    }
    return MENU_ITEMS;
  }, [menuItems]);

  // Filter dishes
  const filteredDishes = useMemo(() => {
    let list = activeMenuItems;

    if (activeCategory !== 'all' && activeCategory !== 'Super Deals') {
      list = list.filter((item) => item.category === activeCategory);
    } else if (activeCategory === 'Super Deals') {
      return [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.ingredients?.some((ing) => ing.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeMenuItems, activeCategory, searchQuery]);

  // Filter deals
  const filteredDeals = useMemo(() => {
    if (activeCategory !== 'all' && activeCategory !== 'Super Deals') {
      return [];
    }

    let deals = SPECIAL_DEALS;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      deals = deals.filter(
        (deal) =>
          deal.title.toLowerCase().includes(q) ||
          deal.items.some((item) => item.toLowerCase().includes(q)) ||
          deal.description?.toLowerCase().includes(q) ||
          deal.badge?.toLowerCase().includes(q)
      );
    }

    return deals;
  }, [activeCategory, searchQuery]);

  // Szechwan Hot Pot item lookup for dedicated sharing showcase
  const hotPotItem = useMemo(() => {
    return activeMenuItems.find(
      (i) => i.id === 'hp-1' || i.category === 'Szechwan Hot Pot' || i.name.toLowerCase().includes('hot pot')
    ) || MENU_ITEMS.find((i) => i.id === 'hp-1')!;
  }, [activeMenuItems]);

  const hotPotCartItem = cartItems.find((i) => i.id === hotPotItem?.id);
  const hotPotQty = hotPotCartItem ? hotPotCartItem.quantity : 0;

  const handleAddHotPot = () => {
    if (!hotPotItem) return;
    addItem({
      id: hotPotItem.id,
      name: hotPotItem.name,
      price: hotPotItem.price,
      category: 'Szechwan Hot Pot',
    });
  };

  const handleCategoryClick = (catId: MenuCategoryTab) => {
    setActiveCategory(catId);
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      const offsetTop = menuSection.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  const currentCategoryMeta = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <section id="menu" className="relative py-8 sm:py-12 bg-[#101216] min-h-screen text-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title & Description */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-2.5">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Dragon Wok • Pure Text Menu</span>
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            The Digital Food Menu
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
            Select authentic wok-tossed specialties, dumplings, and feast deals. Prepared fresh upon order for delivery or takeaway in Abbottabad.
          </p>
        </div>

        {/* Sticky Category Bar & Live Search */}
        <div className="sticky top-[58px] sm:top-[66px] z-30 bg-[#101216]/95 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-stone-800/80 mb-8 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chowmein, momos, wings, soup, deals..."
                className="w-full bg-[#161820] border border-stone-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Cart Summary in Header */}
            {totalCount > 0 && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#991b1b] hover:bg-[#b91c1c] text-white text-xs font-bold transition shadow-md shadow-red-950/40"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                <span>{totalCount} in Cart</span>
                <span className="text-amber-300 font-mono font-extrabold">· Rs. {totalPrice.toLocaleString()}</span>
              </button>
            )}
          </div>

          {/* 10 Numbered Categories Horizontal Rail */}
          <div
            ref={navRailRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border whitespace-nowrap ${
                    isActive
                      ? 'bg-[#991b1b] text-white border-red-700 shadow-md shadow-red-950/40'
                      : 'bg-[#15171e] text-stone-300 hover:text-white border-stone-800/80 hover:border-stone-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.badge && (
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-black/30 text-amber-300'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Active Category Description Banner */}
        <div className="mb-6 flex items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>{currentCategoryMeta.label}</span>
              {currentCategoryMeta.badge && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {currentCategoryMeta.badge}
                </span>
              )}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {currentCategoryMeta.description}
            </p>
          </div>
          <span className="text-xs font-mono text-stone-500 hidden sm:inline-block">
            {filteredDeals.length + filteredDishes.length} items available
          </span>
        </div>

        {/* 1. SZECHWAN HOT POT SPECIAL PRESENTATION CARD (When in Hot Pot or All) */}
        {(activeCategory === 'all' || activeCategory === 'Szechwan Hot Pot') && (!searchQuery || 'szechwan hot pot'.includes(searchQuery.toLowerCase())) && hotPotItem && (
          <div className="mb-10 bg-gradient-to-r from-[#171a24] via-[#1b1e2a] to-[#151720] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#991b1b] text-white flex items-center gap-1 shadow-md">
                    <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Grand Signature Dish</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Banquet Sharing
                  </span>
                </div>

                <h3 className="font-serif-brand text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                  Szechwan Hot Pot
                </h3>

                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-4">
                  The crowning centerpiece of Dragon Wok Abbottabad. A deeply aromatic, bubbling Szechwan chili broth served with a curated 9-ingredient banquet platter:
                </p>

                {/* The 9 Highlighted Ingredients Grid */}
                <div className="bg-[#11131a] p-4 rounded-2xl border border-stone-800/90 mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2.5">
                    9 Premium Included Ingredients:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Noodles',
                      'Sausages',
                      'Peanut butter',
                      'Mushroom',
                      'Chicken',
                      'Momos',
                      'Szechwan pasta',
                      'Vegetables',
                      'Egg',
                    ].map((ingredient, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-stone-200">
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                        <span className="font-medium">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action Box */}
              <div className="bg-[#11131a] p-5 sm:p-6 rounded-2xl border border-stone-800 flex flex-col justify-between items-start sm:items-end min-w-[220px]">
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">
                    Sharing Platter Price
                  </span>
                  <div className="font-extrabold text-2xl sm:text-3xl text-amber-400 font-mono flex items-baseline gap-1">
                    <span className="text-sm text-amber-300">Rs.</span>
                    <span>2,500</span>
                  </div>
                  <span className="text-[11px] text-stone-400 mt-0.5 block">
                    Ideal for table sharing
                  </span>
                </div>

                {hotPotQty > 0 ? (
                  <div className="flex items-center bg-[#991b1b] rounded-xl p-1 shadow-md shadow-red-950/60 border border-red-700/80">
                    <button
                      type="button"
                      onClick={() => updateQuantity(hotPotItem.id, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/30 text-white transition active:scale-90"
                      title="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-white text-sm px-3 min-w-[28px] text-center font-mono">
                      {hotPotQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(hotPotItem.id, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/30 text-white transition active:scale-90"
                      title="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddHotPot}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#991b1b] hover:bg-[#b91c1c] active:scale-95 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition shadow-lg shadow-red-950/50 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-300" />
                    <span>Order Hot Pot</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. SUPER DEALS GRID (Shown when Super Deals or All is selected) */}
        {filteredDeals.length > 0 && (
          <div className="mb-10">
            {activeCategory === 'all' && (
              <div className="flex items-center justify-between mb-4 border-b border-stone-800/80 pb-2">
                <h3 className="font-serif-brand text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <span>1. Super Deals</span>
                  <span className="text-xs font-normal text-amber-400 font-sans">
                    ({filteredDeals.length} Combos)
                  </span>
                </h3>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        )}

        {/* 3. MENU DISHES GRID (All categories without images) */}
        {filteredDishes.length > 0 && (
          <div>
            {activeCategory === 'all' && filteredDeals.length > 0 && (
              <div className="flex items-center justify-between mb-4 border-b border-stone-800/80 pb-2 pt-4">
                <h3 className="font-serif-brand text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <span>A La Carte Dishes & Beverages</span>
                  <span className="text-xs font-normal text-amber-400 font-sans">
                    ({filteredDishes.length} Items)
                  </span>
                </h3>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDishes
                // Skip hp-1 from grid if already shown prominently above
                .filter((d) => (activeCategory === 'Szechwan Hot Pot' || activeCategory === 'all') ? d.id !== 'hp-1' : true)
                .map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredDeals.length === 0 && filteredDishes.length === 0 && (
          <div className="text-center py-20 bg-[#14161d] rounded-3xl border border-stone-800/80 p-8 max-w-md mx-auto">
            <Utensils className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">No items match "{searchQuery}"</h4>
            <p className="text-xs text-stone-400 mb-4">
              Try searching with another dish name or explore all categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-5 py-2.5 bg-[#991b1b] hover:bg-[#b91c1c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
            >
              Reset Search & Filter
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
