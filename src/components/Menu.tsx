import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  UtensilsCrossed,
  X,
  Flame,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Coffee,
  Soup,
} from 'lucide-react';
import { MENU_ITEMS, SPECIAL_DEALS, MenuItem } from '../data/menuData';
import { MenuCard } from './MenuCard';
import { DealCard } from './DealCard';
import { useMenu } from '../context/MenuContext';
import { useOrder } from '../context/OrderContext';

export type ModernCategoryId =
  | 'all'
  | 'starters'
  | 'momos'
  | 'noodles'
  | 'main-course'
  | 'hotpot'
  | 'deals'
  | 'drinks';

interface CategoryConfig {
  id: ModernCategoryId;
  label: string;
  icon?: string;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'all', label: 'All Items', description: 'Browse our complete wok kitchen & specialty menu' },
  { id: 'starters', label: 'Starters & Wings', description: 'Crispy wings, drumsticks, fish fingers & wok chips' },
  { id: 'momos', label: 'Momos & Dumplings', description: 'Fresh steamed and crispy golden wok dumplings' },
  { id: 'noodles', label: 'Noodles & Chowmein', description: 'Traditional high-heat tossed chowmein & noodles' },
  { id: 'main-course', label: 'Main Course', description: 'Authentic wok entrees in chicken, beef & fresh fish' },
  { id: 'hotpot', label: 'Hotpot & Soups', description: 'Signature Szechwan table hot pot and family bowl soups' },
  { id: 'deals', label: 'Deals & Combos', description: 'Curated value combos & banquet feast sets' },
  { id: 'drinks', label: 'Drinks & Shakes', description: 'Chilled margaritas, fresh shakes & gourmet cold beverages' },
];

export const Menu: React.FC = () => {
  const { menuItems } = useMenu();
  const { totalCount, totalPrice, setIsCartOpen } = useOrder();
  const [activeCategory, setActiveCategory] = useState<ModernCategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const categoryRailRef = useRef<HTMLDivElement>(null);

  // Combine dynamic Firestore items with base metadata
  const activeMenuItems = useMemo(() => {
    if (menuItems && menuItems.length > 0) {
      return menuItems.map((m) => {
        const staticMatch = MENU_ITEMS.find((s) => s.id === m.id);
        return {
          id: m.id,
          name: m.name,
          category: m.category as any,
          price: m.price,
          familyPrice: m.familyPrice,
          familyLabel: staticMatch?.familyLabel,
          ingredients: staticMatch?.ingredients,
          isSignature: staticMatch?.isSignature,
          isPopular: staticMatch?.isPopular,
          image: m.image || staticMatch?.image,
          note: m.description || staticMatch?.note,
          available: m.available,
          badge: m.badge,
        };
      });
    }
    return MENU_ITEMS;
  }, [menuItems]);

  // Helper to match items into the KFC-style category buckets
  const matchesCategory = (itemCategory: string, targetId: ModernCategoryId): boolean => {
    switch (targetId) {
      case 'all':
        return true;
      case 'starters':
        return itemCategory === 'Starters';
      case 'momos':
        return itemCategory === 'Momos';
      case 'noodles':
        return itemCategory === 'Noodles';
      case 'main-course':
        return ['Chicken', 'Beef', 'Fish'].includes(itemCategory);
      case 'hotpot':
        return ['Hot Pot', 'Soup'].includes(itemCategory);
      case 'deals':
        return itemCategory === 'Deals';
      case 'drinks':
        return itemCategory === 'Drinks';
      default:
        return false;
    }
  };

  // Filter regular dishes
  const filteredDishes = useMemo(() => {
    let list = activeMenuItems;

    if (activeCategory !== 'all' && activeCategory !== 'deals') {
      list = list.filter((i) => matchesCategory(i.category, activeCategory));
    } else if (activeCategory === 'deals') {
      return [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.ingredients?.some((ing) => ing.toLowerCase().includes(q)) ||
          item.note?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeMenuItems, activeCategory, searchQuery]);

  // Filter deals
  const filteredDeals = useMemo(() => {
    if (activeCategory !== 'all' && activeCategory !== 'deals') {
      return [];
    }

    let deals = SPECIAL_DEALS;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      deals = deals.filter(
        (deal) =>
          deal.title.toLowerCase().includes(q) ||
          deal.items.some((item) => item.toLowerCase().includes(q)) ||
          deal.badge?.toLowerCase().includes(q)
      );
    }

    return deals;
  }, [activeCategory, searchQuery]);

  // Counts for each category tab badge
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: activeMenuItems.length + SPECIAL_DEALS.length,
      starters: activeMenuItems.filter((i) => matchesCategory(i.category, 'starters')).length,
      momos: activeMenuItems.filter((i) => matchesCategory(i.category, 'momos')).length,
      noodles: activeMenuItems.filter((i) => matchesCategory(i.category, 'noodles')).length,
      'main-course': activeMenuItems.filter((i) => matchesCategory(i.category, 'main-course')).length,
      hotpot: activeMenuItems.filter((i) => matchesCategory(i.category, 'hotpot')).length,
      deals: SPECIAL_DEALS.length,
      drinks: activeMenuItems.filter((i) => matchesCategory(i.category, 'drinks')).length,
    };
    return counts;
  }, [activeMenuItems]);

  const activeCategoryInfo = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  const handleCategorySelect = (id: ModernCategoryId) => {
    setActiveCategory(id);
    // Smooth scroll the menu into comfortable view
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      const offsetTop = menuSection.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <section id="menu" className="pt-20 pb-28 bg-[#121316] relative scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modern Menu Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Digital Ordering Menu</span>
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">
            Explore Dragon Wok Menu
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Freshly prepared wok dishes, crispy starters, authentic chowmein, juicy momos, and signature Szechwan hot pots.
          </p>
        </div>

        {/* Search & Quick Filter Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Chowmein, Momos, Hot Pot, Wings, Manchurian)..."
              aria-label="Search dishes"
              className="w-full bg-[#181a20] border border-stone-800 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KFC-STYLE STICKY CATEGORY NAVIGATION BAR */}
      <div className="sticky top-[64px] sm:top-[72px] z-30 bg-[#121316]/95 backdrop-blur-md border-y border-stone-800/90 shadow-xl py-2.5 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={categoryRailRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = categoryCounts[cat.id] ?? 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#991b1b] text-white shadow-lg shadow-red-950/50 scale-[1.02]'
                      : 'bg-[#181a20] text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800/80'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-black/30 text-amber-300'
                        : 'bg-stone-900 text-stone-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Description Banner */}
        {!searchQuery && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-stone-800/60 gap-2">
            <div>
              <h3 className="font-serif-brand text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>{activeCategoryInfo.label}</span>
                <span className="text-xs font-mono font-normal text-amber-400 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-md">
                  {activeCategory === 'deals' ? filteredDeals.length : filteredDishes.length + (activeCategory === 'all' ? filteredDeals.length : 0)} Items
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
                {activeCategoryInfo.description}
              </p>
            </div>
            {totalCount > 0 && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>View Cart ({totalCount} items • Rs. {totalPrice.toLocaleString()})</span>
              </button>
            )}
          </div>
        )}

        {/* Search Query Feedback */}
        {searchQuery && (
          <div className="mb-6 p-4 rounded-xl bg-[#181a20] border border-stone-800 flex items-center justify-between text-xs sm:text-sm text-stone-300">
            <div>
              Searching menu for: <span className="text-amber-400 font-bold">"{searchQuery}"</span>
              <span className="text-stone-500 ml-2">
                ({filteredDishes.length + filteredDeals.length} results)
              </span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* Signature Szechwan Hot Pot Spotlight (only on Hotpot tab or All without active search) */}
        {(activeCategory === 'all' || activeCategory === 'hotpot') && !searchQuery && (
          <div className="mb-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#22181a] via-[#1a1c22] to-[#15171c] border border-amber-500/40 relative overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>SIGNATURE SZECHWAN HOT POT</span>
                </div>
                <h3 className="font-serif-brand text-2xl sm:text-3xl font-bold text-white mb-2">
                  Table Szechwan Hot Pot — Rs. 2,500
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 mb-4 max-w-2xl leading-relaxed">
                  Our premier table specialty loaded with rich aromatic chili broth, chicken, beef, fish, momos, and seasonal vegetables:
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-stone-200">
                  {MENU_ITEMS.find((i) => i.id === 'hp-1')?.ingredients?.map((ing) => (
                    <span
                      key={ing}
                      className="bg-black/40 border border-stone-800 px-2.5 py-1 rounded-lg text-[11px]"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:col-span-4 flex justify-start md:justify-end">
                <button
                  onClick={() => handleCategorySelect('deals')}
                  className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-[#991b1b] hover:bg-[#b91c1c] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-red-950/40"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Explore Combos & Deals</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredDishes.length === 0 && filteredDeals.length === 0 ? (
          <div className="text-center py-20 bg-[#181a20] rounded-2xl border border-stone-800 p-8">
            <UtensilsCrossed className="w-12 h-12 text-stone-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">No dishes match your search</h4>
            <p className="text-xs text-stone-400 mb-6 max-w-sm mx-auto">
              We couldn't find anything matching "{searchQuery}". Try searching for Chowmein, Wings, Soup, or Momos.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#991b1b] hover:bg-[#b91c1c] text-white text-xs font-bold uppercase tracking-wider transition"
            >
              Browse Complete Menu
            </button>
          </div>
        ) : (
          <div>
            {/* If Deals category is selected */}
            {activeCategory === 'deals' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDeals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDishes.map((item) => (
                    <MenuCard key={item.id} item={item} />
                  ))}

                  {/* Also show deals in 'all' view or when search query matched them */}
                  {(activeCategory === 'all' || searchQuery) &&
                    filteredDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ordering Footer Note */}
        <div className="mt-14 pt-8 border-t border-stone-800 text-center text-xs text-stone-400 space-y-2">
          <p className="flex flex-wrap items-center justify-center gap-3">
            <span>🔥 Tossed fresh to order in traditional Chinese woks</span>
            <span>•</span>
            <span>🛵 Quick delivery across Abbottabad</span>
            <span>•</span>
            <span>🍲 Family portions available on signature soups</span>
          </p>
          <p>
            Questions about preparation or catering? Call Dragon Wok directly:{' '}
            <a href="tel:03100968734" className="text-amber-400 hover:underline font-bold font-mono">
              0310 0968734
            </a>
          </p>
        </div>

      </div>

      {/* Mobile Sticky Floating Cart Bar (KFC-style quick checkout bar) */}
      {totalCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 bg-[#991b1b] text-white rounded-2xl shadow-2xl shadow-black/80 flex items-center justify-between font-bold border border-red-700/80 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-black/30 flex items-center justify-center text-xs text-amber-300 font-mono font-bold">
                {totalCount}
              </span>
              <span className="text-sm">View Your Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base text-amber-300">
                Rs. {totalPrice.toLocaleString()}
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </section>
  );
};
