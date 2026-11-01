import React from 'react';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';
import { MENU_ITEMS } from '../data/menuData';
import { useOrder } from '../context/OrderContext';

export const FeaturedDishes: React.FC = () => {
  const { addItem } = useOrder();

  const featured = MENU_ITEMS.filter((i) => i.isSignature || i.isPopular).slice(0, 6);

  return (
    <section className="py-16 bg-[#12141a] relative border-t border-b border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
              CULINARY HIGHLIGHTS
            </div>
            <h2 className="font-serif-brand text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Signature Specialties
            </h2>
          </div>
          <p className="text-stone-400 text-xs sm:text-sm max-w-md mt-3 md:mt-0">
            Hand-selected favorites wok-tossed to order using fresh ingredients and high heat.
          </p>
        </div>

        {/* 6 Featured Cards Grid - Text-based, no images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((dish) => (
            <div
              key={dish.id}
              className="bg-[#161820] rounded-2xl border border-stone-800 p-6 flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                    {dish.category}
                  </span>
                  {dish.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {dish.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {dish.name}
                </h3>
                <p className="text-xs text-stone-400 mb-4 line-clamp-2 leading-relaxed">
                  {dish.description || 'Freshly tossed upon order in traditional high-heat wok.'}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-3">
                <div className="font-extrabold text-lg text-amber-400 tabular-nums">
                  <span className="text-xs text-amber-300 font-bold mr-1">Rs.</span>
                  <span>{dish.price.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="#menu"
                    className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
                    title="View in Menu"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() =>
                      addItem({
                        id: dish.id,
                        name: dish.name,
                        price: dish.price,
                        category: dish.category,
                      })
                    }
                    className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#991b1b] hover:bg-[#b91c1c] rounded-xl transition shadow-md shadow-red-950/40 flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
