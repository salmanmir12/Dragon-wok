import React, { useState, useMemo } from 'react';
import { Search, UtensilsCrossed, X } from 'lucide-react';
import { MENU_ITEMS, SPECIAL_DEALS, MenuItem } from '../data/menuData';
import { MenuCard } from './MenuCard';
import { DealCard } from './DealCard';

type CategoryFilter =
  | 'All'
  | 'Starters'
  | 'Soup'
  | 'Chicken'
  | 'Beef'
  | 'Fish'
  | 'Noodles'
  | 'Momos'
  | 'Hot Pot'
  | 'Drinks'
  | 'Deals';

const CATEGORIES: CategoryFilter[] = [
  'All',
  'Starters',
  'Soup',
  'Chicken',
  'Beef',
  'Fish',
  'Noodles',
  'Momos',
  'Hot Pot',
  'Drinks',
  'Deals',
];

export const Menu: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    let items = MENU_ITEMS;

    if (activeCategory !== 'All' && activeCategory !== 'Deals') {
      items = items.filter((item) => item.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.ingredients?.some((ing) => ing.toLowerCase().includes(q))
      );
    }

    return items;
  }, [activeCategory, searchQuery]);

  const filteredDeals = useMemo(() => {
    if (activeCategory !== 'All' && activeCategory !== 'Deals') {
      return [];
    }

    if (!searchQuery.trim()) {
      return activeCategory === 'Deals' ? SPECIAL_DEALS : [];
    }

    const q = searchQuery.toLowerCase();
    return SPECIAL_DEALS.filter(
      (deal) =>
        deal.title.toLowerCase().includes(q) ||
        deal.items.some((item) => item.toLowerCase().includes(q))
    );
  }, [activeCategory, searchQuery]);

  const showDealsGrid = activeCategory === 'Deals';

  return (
    <section id="menu" className="py-24 bg-[#121316] relative scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
            OFFICIAL RESTAURANT MENU
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Dragon Wok Menu
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Freshly prepared wok dishes, soups, noodles, dumplings, and signature Chinese specialties crafted to order.
          </p>
        </div>

        {/* Search Bar & Instant Filter */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Chowmein, Momos, Hot Pot, Manchurian)..."
              aria-label="Search dishes"
              className="w-full bg-[#181a20] border border-stone-800 rounded-xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        {/* Mobile: Horizontally scrollable; Desktop: centered flex-wrap */}
        <div className="mb-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 sm:pb-0 sm:flex-wrap sm:justify-center no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#991b1b] text-white shadow-md'
                      : 'bg-[#181a20] text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800/80'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result Status */}
        {searchQuery && (
          <div className="mb-6 text-sm text-stone-400 flex items-center justify-between">
            <p>
              Showing results for: <span className="text-white font-medium">"{searchQuery}"</span>
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-amber-400 hover:underline"
            >
              Reset search
            </button>
          </div>
        )}

        {/* Szechwan Hot Pot Spotlight Banner if in Hot Pot or All (without search filter) */}
        {(activeCategory === 'All' || activeCategory === 'Hot Pot') && !searchQuery && (
          <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#1c1819] via-[#1a1c22] to-[#171920] border border-amber-500/40 relative overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">
                  <span>SIGNATURE SZECHWAN SPECIALTY</span>
                </div>
                <h3 className="font-serif-brand text-2xl sm:text-3xl font-bold text-white mb-3">
                  Szechwan Hot Pot — Rs. 2,500
                </h3>
                <p className="text-sm text-stone-300 mb-4 max-w-2xl leading-relaxed">
                  Our premier table specialty loaded with rich aromatic chili broth and hearty courses:
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-stone-200">
                  {MENU_ITEMS.find((i) => i.id === 'hp-1')?.ingredients?.map((ing) => (
                    <span
                      key={ing}
                      className="bg-stone-900/90 border border-stone-800 px-2.5 py-1 rounded"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:col-span-4 flex justify-start md:justify-end">
                <a
                  href="#deals"
                  className="inline-flex items-center gap-2 py-3 px-5 rounded-md bg-[#991b1b] hover:bg-[#b91c1c] text-white text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Explore Combos & Deals</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Menu Grid */}
        {showDealsGrid ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIAL_DEALS.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div>
            {filteredItems.length === 0 && filteredDeals.length === 0 ? (
              <div className="text-center py-16 bg-[#181a20] rounded-xl border border-stone-800">
                <p className="text-stone-300 text-base mb-2">No matching dishes found.</p>
                <p className="text-xs text-stone-400 mb-4">
                  Try searching for "Chowmein", "Wings", "Soup", or "Momos".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="text-xs uppercase font-semibold text-amber-400 hover:underline"
                >
                  View All Dishes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}

                {/* Also display any matching deals if search matched them */}
                {filteredDeals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Menu Footer Help Note */}
        <div className="mt-12 text-center text-xs text-stone-400 border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <span>* All dishes prepared fresh to order in high-heat woks.</span>
          <span className="hidden sm:inline">·</span>
          <span>Family bowl portions available on soups as indicated.</span>
          <span className="hidden sm:inline">·</span>
          <span>Need custom preparation? Call us directly: <a href="tel:03100968734" className="text-amber-400 hover:underline">0310 0968734</a></span>
        </div>

      </div>
    </section>
  );
};
